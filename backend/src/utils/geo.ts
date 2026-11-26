import { env } from '../config/env';

export type LngLat = [number, number];

export interface GeoPoint {
  type: 'Point';
  coordinates: LngLat;
}

export const toPoint = (lat: number, lng: number): GeoPoint => ({
  type: 'Point',
  coordinates: [lng, lat],
});

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in kilometres. */
export function haversineKm(a: LngLat, b: LngLat): number {
  const R = 6371;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const lat1 = toRad(a[1]);
  const lat2 = toRad(b[1]);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Rough ETA in whole minutes (minimum 1) assuming urban speed. */
export function etaMinutes(distanceKm: number): number {
  const minutes = (distanceKm / env.avgUrbanSpeedKmph) * 60;
  return Math.max(1, Math.round(minutes));
}

export const nearQuery = (coords: LngLat, radiusKm: number) => ({
  $near: {
    $geometry: { type: 'Point' as const, coordinates: coords },
    $maxDistance: radiusKm * 1000,
  },
});
