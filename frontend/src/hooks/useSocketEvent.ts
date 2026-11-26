'use client';

import { useEffect } from 'react';
import { getSocket } from '@/lib/socket';

/** Subscribe to a socket event for the lifetime of the component. */
export function useSocketEvent<T = unknown>(event: string, handler: (payload: T) => void) {
  useEffect(() => {
    const s = getSocket();
    s.on(event, handler);
    return () => {
      s.off(event, handler);
    };
  }, [event, handler]);
}
