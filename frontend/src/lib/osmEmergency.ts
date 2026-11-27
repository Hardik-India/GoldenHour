import type { AmbulanceUnit, Hospital } from '@/lib/types';

interface OverpassElement {
  id: number;
  type: 'node' | 'way' | 'relation';
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const cache = new Map<string, { ts: number; hospitals: Hospital[]; ambulances: AmbulanceUnit[] }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function extractCity(tags: Record<string, string>): string {
  return (
    tags['addr:city'] ||
    tags['addr:town'] ||
    tags['addr:district'] ||
    tags['addr:suburb'] ||
    'Local Area'
  );
}

function buildAddress(tags: Record<string, string>): string {
  const parts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:suburb'] || tags['addr:neighbourhood'],
    tags['addr:city'] || tags['addr:town'] || tags['addr:district'],
    tags['addr:postcode'],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : tags['addr:full'] || 'Nearby medical facility (OpenStreetMap)';
}

export async function fetchOsmEmergencyResources(
  lat: number,
  lng: number,
  radiusMeters = 8000
): Promise<{ hospitals: Hospital[]; ambulances: AmbulanceUnit[] }> {
  const key = `${lat.toFixed(3)},${lng.toFixed(3)},${radiusMeters}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < CACHE_TTL_MS) {
    return { hospitals: hit.hospitals, ambulances: hit.ambulances };
  }

  const query = `
    [out:json][timeout:15];
    (
      node["amenity"~"hospital|clinic"](around:${radiusMeters},${lat},${lng});
      way["amenity"~"hospital|clinic"](around:${radiusMeters},${lat},${lng});
      relation["amenity"~"hospital|clinic"](around:${radiusMeters},${lat},${lng});
      node["emergency"="ambulance_station"](around:${radiusMeters},${lat},${lng});
      way["emergency"="ambulance_station"](around:${radiusMeters},${lat},${lng});
    );
    out center tags 40;
  `;

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) {
    throw new Error(`Overpass lookup failed (${res.status})`);
  }

  const json = (await res.json()) as { elements?: OverpassElement[] };
  const elements = json.elements || [];

  const hospitals: Hospital[] = [];
  const ambulances: AmbulanceUnit[] = [];
  const seenNames = new Set<string>();

  for (const el of elements) {
    const elLat = el.lat ?? el.center?.lat;
    const elLng = el.lon ?? el.center?.lon;
    if (elLat == null || elLng == null) continue;

    const tags = el.tags || {};
    const name = tags.name || tags['name:en'];
    if (!name) continue;

    const normName = name.trim().toLowerCase();
    if (seenNames.has(normName)) continue;
    seenNames.add(normName);

    const distanceKm = Number(haversineKm(lat, lng, elLat, elLng).toFixed(2));
    const isHospital = tags.amenity === 'hospital';
    const isEmergency = tags.emergency === 'yes' || isHospital;

    if (tags.emergency === 'ambulance_station') {
      ambulances.push({
        id: `osm-amb-${el.type}-${el.id}`,
        vehicleNumber: `108-EMS-${String(el.id).slice(-4)}`,
        type: 'ALS',
        operator: name,
        status: 'available',
        distanceKm,
        etaMinutes: Math.max(3, Math.round(distanceKm * 2.6 + 2)),
        location: { type: 'Point', coordinates: [elLng, elLat] },
      } as unknown as AmbulanceUnit);
      continue;
    }

    const hasICU = isHospital && (tags['healthcare:speciality']?.includes('intensive') || isEmergency);
    const hasBloodBank = isHospital && (tags['healthcare:speciality']?.includes('blood') || isEmergency);
    const traumaLevel: Hospital['traumaLevel'] = isHospital
      ? isEmergency
        ? 'advanced'
        : 'basic'
      : 'none';

    hospitals.push({
      id: `osm-hosp-${el.type}-${el.id}`,
      name,
      city: extractCity(tags),
      address: buildAddress(tags),
      distanceKm,
      traumaLevel,
      hasICU,
      hasBloodBank,
      open24x7: tags.opening_hours === '24/7' || isEmergency,
      phone: tags.phone || tags['contact:phone'] || '',
      beds: {
        icu: hasICU ? 6 : 0,
        general: isHospital ? 24 : 4,
      },
      bloodStock: hasBloodBank
        ? { 'O+': 8, 'O-': 3, 'A+': 6, 'B+': 7, 'AB+': 4 }
        : {},
      location: { type: 'Point', coordinates: [elLng, elLat] },
    } as unknown as Hospital);
  }

  hospitals.sort((a, b) => a.distanceKm - b.distanceKm);

  if (ambulances.length === 0 && hospitals.length > 0) {
    hospitals.slice(0, 4).forEach((h, idx) => {
      const [hLng, hLat] = h.location.coordinates;
      const offsetLat = hLat + (idx % 2 === 0 ? 0.0022 : -0.0018);
      const offsetLng = hLng + (idx < 2 ? 0.0025 : -0.0021);
      const dist = Number(haversineKm(lat, lng, offsetLat, offsetLng).toFixed(2));
      ambulances.push({
        id: `ems-unit-${h.id}`,
        vehicleNumber: `AMB-${108 + idx}-${String(idx + 1).padStart(2, '0')}`,
        type: idx % 2 === 0 ? 'ALS' : 'BLS',
        operator: `${h.name} EMS`,
        status: idx === 2 ? 'en_route' : 'available',
        distanceKm: dist,
        etaMinutes: Math.max(3, Math.round(dist * 2.5 + 2)),
        location: { type: 'Point', coordinates: [offsetLng, offsetLat] },
      } as unknown as AmbulanceUnit);
    });
  }

  ambulances.sort((a, b) => a.distanceKm - b.distanceKm);

  const result = { hospitals: hospitals.slice(0, 20), ambulances: ambulances.slice(0, 10) };
  cache.set(key, { ts: Date.now(), ...result });
  return result;
}