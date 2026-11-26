'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/store/auth';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { cn } from '@/lib/utils';

interface Toast {
  id: number;
  title: string;
  body?: string;
  href?: string;
}

const baseLinks = [
  { href: '/sos', label: 'SOS' },
  { href: '/blood', label: 'Blood' },
  { href: '/hospitals', label: 'Hospitals' },
  { href: '/first-aid', label: 'First aid' },
  { href: '/impact', label: 'Impact' },
];

export function AppShell({
  children,
  requireAuth = true,
  roles,
}: {
  children: React.ReactNode;
  requireAuth?: boolean;
  roles?: string[];
}) {
  const { user, loading, init, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    if (!user) init();
  }, [user, init]);

  useEffect(() => {
    if (!loading && requireAuth && !user) router.replace('/login');
    if (!loading && user && roles && !roles.includes(user.role)) router.replace('/sos');
  }, [loading, user, requireAuth, roles, router]);

  const push = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 9000);
  }, []);

  useSocketEvent<{ title: string; body?: string; data?: { incidentId?: string; requestId?: string } }>(
    'incident:new',
    useCallback(
      (p) => push({ title: p.title, body: p.body, href: '/responder' }),
      [push]
    )
  );
  useSocketEvent<{ title: string; body?: string }>(
    'blood:new',
    useCallback((p) => push({ title: p.title, body: p.body, href: '/blood' }), [push])
  );
  useSocketEvent<{ title: string; body?: string }>(
    'notification',
    useCallback((p) => push({ title: p.title, body: p.body }), [push])
  );

  const links = [...baseLinks];
  if (user?.role === 'responder' || user?.role === 'admin') links.splice(1, 0, { href: '/responder', label: 'Responder' });
  if (user?.role === 'admin') links.push({ href: '/admin', label: 'Admin' });

  if (loading || (requireAuth && !user)) {
    return <div className="grid min-h-screen place-items-center text-white/50">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-night-glow">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-night/80 backdrop-blur-xl">
        <div className="container-x flex items-center justify-between gap-4 py-3">
          <Logo href="/" />
          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'rounded-full px-4 py-2 text-sm transition',
                  pathname.startsWith(l.href) ? 'bg-white/10 text-gold' : 'text-white/65 hover:text-white'
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            {user ? (
              <>
                <Link href="/profile" className="hidden text-white/70 hover:text-white sm:block">
                  {user.name.split(' ')[0]}
                </Link>
                <button
                  onClick={() => {
                    logout();
                    router.push('/');
                  }}
                  className="rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                  aria-label="Log out"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link href="/login" className="text-gold">
                Log in
              </Link>
            )}
          </div>
        </div>
        <nav className="container-x flex gap-1 overflow-x-auto pb-2 md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-xs',
                pathname.startsWith(l.href) ? 'bg-white/10 text-gold' : 'text-white/60'
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="container-x py-8">{children}</main>

      <div className="fixed bottom-4 right-4 z-50 flex w-[min(92vw,360px)] flex-col gap-3">
        {toasts.map((t) => (
          <Link
            key={t.id}
            href={t.href || '#'}
            className="glass-strong flex gap-3 rounded-2xl border-alert/40 p-4 shadow-glow-red"
          >
            <Bell className="mt-0.5 shrink-0 text-alert" size={18} />
            <div>
              <div className="text-sm font-semibold">{t.title}</div>
              {t.body && <div className="text-xs text-white/60">{t.body}</div>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
