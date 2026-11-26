import { ReactNode } from 'react';

export function SectionHeading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.25em] text-gold">{eyebrow}</p>
      <h2 className="text-3xl font-bold leading-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-white/60">{sub}</p>}
    </div>
  );
}
