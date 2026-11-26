'use client';

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'error' | 'success' | 'warn';
  children: ReactNode;
}) {
  const tones = {
    info: 'border-white/15 bg-white/5 text-white/80',
    error: 'border-alert/40 bg-alert/10 text-alert-soft',
    success: 'border-teal/40 bg-teal/10 text-teal-soft',
    warn: 'border-gold/40 bg-gold/10 text-gold-soft',
  };
  return <div className={cn('rounded-xl border px-4 py-3 text-sm', tones[tone])}>{children}</div>;
}
