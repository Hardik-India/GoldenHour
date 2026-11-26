import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'glass' | 'gold' | 'ghost' | 'teal';

const styles: Record<Variant, string> = {
  primary: 'bg-red-btn text-white shadow-glow-red hover:brightness-110',
  glass: 'glass text-white hover:bg-white/10',
  gold: 'border border-gold/60 text-gold hover:bg-gold/10',
  ghost: 'text-white/70 hover:text-white hover:bg-white/5',
  teal: 'bg-teal text-night font-semibold hover:brightness-110',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  href?: string;
  children: ReactNode;
}

export function Button({ variant = 'primary', href, className, children, ...rest }: Props) {
  const cls = cn(base, styles[variant], className);
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
