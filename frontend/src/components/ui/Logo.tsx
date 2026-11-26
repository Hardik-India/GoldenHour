import Link from 'next/link';

export function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden>
      <circle cx="30" cy="24" r="14" stroke="#FFB938" strokeWidth="2.5" />
      <path d="M30 15v9l6 4" stroke="#FFB938" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="M0 25h10l3-8 4 16 4-12 3 4h4"
        stroke="#FFB938"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ href = '/' }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2">
      <LogoMark />
      <span className="text-xl font-semibold tracking-tight">
        <span className="text-gold">Golden</span>Hour
      </span>
    </Link>
  );
}
