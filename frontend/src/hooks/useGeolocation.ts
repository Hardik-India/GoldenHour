'use client';

import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_CENTER } from '@/lib/utils';

export interface Coords {
  lat: number;
  lng: number;
  accurate: boolean; // false when we fell back to the demo centre
}

/** Gets the browser location; falls back to the demo centre if denied or unavailable. */
export function useGeolocation(auto = true) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const locate = useCallback(() => {
    setLoading(true);
    const fallback = () => {
      setCoords({ lat: DEFAULT_CENTER[0], lng: DEFAULT_CENTER[1], accurate: false });
      setLoading(false);
    };
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Location is not supported on this device');
      return fallback();
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude, accurate: true });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Location permission denied');
        fallback();
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 }
    );
  }, []);

  useEffect(() => {
    if (auto) locate();
  }, [auto, locate]);

  return { coords, error, loading, locate };
}
