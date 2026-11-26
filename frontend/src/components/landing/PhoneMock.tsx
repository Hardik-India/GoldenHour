import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PhoneMock({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'relative w-[270px] rounded-[2.8rem] border border-white/20 bg-night-900 p-[10px] shadow-[0_0_80px_rgba(255,59,78,0.25)] sm:w-[300px]',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[2.8rem] ring-1 ring-inset ring-white/10" />
      <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
      <div className="relative overflow-hidden rounded-[2.2rem] bg-night">{children}</div>
      <div className="pointer-events-none absolute inset-0 rounded-[2.8rem] bg-gradient-to-tr from-white/10 via-transparent to-transparent" />
    </div>
  );
}
