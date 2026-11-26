'use client';

import dynamic from 'next/dynamic';
import type { LeafletMapProps } from './LeafletMap';

/** Leaflet touches `window`, so it must only load in the browser. */
const LiveMap = dynamic<LeafletMapProps>(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="grid h-[420px] w-full place-items-center rounded-3xl border border-white/10 bg-night-700 text-sm text-white/40">
      Loading map...
    </div>
  ),
});

export default LiveMap;
