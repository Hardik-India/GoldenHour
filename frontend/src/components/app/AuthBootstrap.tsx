'use client';

import { useEffect } from 'react';
import { useAuth } from '@/store/auth';

/** Loads the signed-in user once per page load. */
export function AuthBootstrap() {
  const init = useAuth((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
  return null;
}
