'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Users, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/store/auth';
import { cn } from '@/lib/utils';

const links = [
  { href: '#home', label: 'Home' },
  { href: '#features', label: 'Features' },
  { href: '#impact', label: 'Impact' },
  { href: '#faq', label: 'FAQs' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const user = useAuth((s) => s.user);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-6">
      <div
        className={cn(
          'mx-auto flex max-w-[1620px] items-center justify-between rounded-full border px-6 transition-all duration-300',
          scrolled
            ? 'glass-strong border-white/15 py-2 shadow-lg shadow-black/40'
            : 'border-white/10 bg-night/40 py-3 backdrop-blur-md'
        )}
      >
        <Logo />

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={cn(
                'border-b-2 pb-1 text-sm transition hover:text-gold',
                l.label === 'Home' ? 'border-gold text-gold' : 'border-transparent text-white/75'
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Button href="/sos" variant="gold" className="px-5 py-2">
              Open app
            </Button>
          ) : (
            <>
              <Link href="/login" className="text-sm text-white/70 hover:text-white">
                Log in
              </Link>
              <Button href="/register?role=responder" variant="gold" className="px-5 py-2">
                <Users size={16} /> Become a Responder <ArrowRight size={16} />
              </Button>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {open && (
        <div className="glass-strong mx-auto mt-2 max-w-[1620px] rounded-3xl p-5 md:hidden">
          <div className="flex flex-col gap-4">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="text-white/80">
                {l.label}
              </a>
            ))}
            <Button href="/register?role=responder" variant="gold">
              Become a Responder
            </Button>
            <Link href="/login" className="text-center text-sm text-white/60">
              Log in
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
