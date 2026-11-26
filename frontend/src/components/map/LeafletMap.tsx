'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer, Polyline, useMap } from 'react-leaflet';

export type MarkerKind = 'sos' | 'responder' | 'ambulance' | 'hospital' | 'me' | 'donor';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  kind: MarkerKind;
  label?: string;
}

const COLORS: Record<MarkerKind, string> = {
  sos: '#FF3B4E',
  responder: '#FFB938',
  ambulance: '#ffffff',
  hospital: '#2DD4BF',
  me: '#60a5fa',
  donor: '#FF6B79',
};

const SIZES: Record<MarkerKind, number> = { sos: 26, responder: 18, ambulance: 20, hospital: 20, me: 16, donor: 16 };

function icon(kind: MarkerKind) {
  const size = SIZES[kind];
  const color = COLORS[kind];
  const pulse =
    kind === 'sos'
      ? `<span style="position:absolute;inset:-10px;border-radius:9999px;border:2px solid ${color};animation:ripple 2s infinite"></span>`
      : '';
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="gh-marker" style="position:relative;width:${size}px;height:${size}px;background:${color};color:${color};border:2px solid #0B0F1A">${pulse}</div>`,
  });
}

function Recenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center[0], center[1], zoom]);
  return null;
}

export interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  lines?: [number, number][][];
  className?: string;
}

export default function LeafletMap({ center, zoom = 14, markers = [], lines = [], className }: LeafletMapProps) {
  return (
    <MapContainer center={center} zoom={zoom} scrollWheelZoom className={className || 'h-[420px] w-full rounded-3xl'}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <Recenter center={center} zoom={zoom} />
      {lines.map((l, i) => (
        <Polyline key={i} positions={l} pathOptions={{ color: '#FFB938', weight: 3, dashArray: '6 10', opacity: 0.8 }} />
      ))}
      {markers.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={icon(m.kind)}>
          {m.label && <Popup>{m.label}</Popup>}
        </Marker>
      ))}
    </MapContainer>
  );
}
