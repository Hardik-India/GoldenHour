
'use client';

import { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  Polyline,
  useMap,
} from 'react-leaflet';

export type MarkerKind =
  | 'sos'
  | 'responder'
  | 'ambulance'
  | 'hospital'
  | 'me'
  | 'donor';

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

const SIZES: Record<MarkerKind, number> = {
  sos: 26,
  responder: 18,
  ambulance: 20,
  hospital: 20,
  me: 16,
  donor: 16,
};

// Custom glowing Leaflet markers
function createIcon(kind: MarkerKind) {
  const size = SIZES[kind];
  const color = COLORS[kind];

  const pulse =
    kind === 'sos'
      ? `<span class="gh-marker-pulse"></span>
         <span class="gh-marker-pulse gh-marker-pulse-delay"></span>`
      : '';

  return L.divIcon({
    className: 'gh-marker-wrapper',
    iconSize: [size + 24, size + 24],
    iconAnchor: [(size + 24) / 2, (size + 24) / 2],
    popupAnchor: [0, -size / 2],
    html: `
      <div
        class="gh-marker ${kind === 'sos' ? 'gh-marker-sos' : ''}"
        style="
          --marker-color: ${color};
          --marker-size: ${size}px;
        "
      >
        ${pulse}
        <span class="gh-marker-core"></span>
      </div>
    `,
  });
}

// Keep the map centered when the selected location changes
function Recenter({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
    map.invalidateSize();
  }, [map, center[0], center[1], zoom]);

  return null;
}

// Fix map dimensions after initial rendering
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => window.clearTimeout(timer);
  }, [map]);

  return null;
}

export interface LeafletMapProps {
  center: [number, number];
  zoom?: number;
  markers?: MapMarker[];
  lines?: [number, number][][];
  className?: string;
}

export default function LeafletMap({
  center,
  zoom = 14,
  markers = [],
  lines = [],
  className,
}: LeafletMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={true}
      zoomControl={true}
      className={className || 'h-[420px] w-full rounded-3xl'}
      style={{
        background: '#0B0F1A',
        overflow: 'hidden',
      }}
    >
      {/* OpenStreetMap tiles: no API key required */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        className="gh-dark-tiles"
      />

      <Recenter center={center} zoom={zoom} />
      <MapResizeHandler />

      {/* Emergency and responder routes */}
      {lines.map((line, index) => (
        <Polyline
          key={`route-${index}`}
          positions={line}
          pathOptions={{
            color: '#FFB938',
            weight: 3,
            dashArray: '6 10',
            opacity: 0.9,
          }}
        />
      ))}

      {/* SOS, responder, ambulance, hospital and donor markers */}
      {markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.lat, marker.lng]}
          icon={createIcon(marker.kind)}
          zIndexOffset={marker.kind === 'sos' ? 1000 : 0}
        >
          {marker.label && (
            <Popup>
              <div className="gh-map-popup">
                {marker.label}
              </div>
            </Popup>
          )}
        </Marker>
      ))}
    </MapContainer>
  );
}
