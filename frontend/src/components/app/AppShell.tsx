'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, HeartPulse, LogOut, Phone, Siren, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/store/auth';
import { useSocketEvent } from '@/hooks/useSocketEvent';
import { AMBULANCE_NUMBER, cn, EMERGENCY_NUMBER } from '@/lib/utils';

interface Toast {
  id: number;
  title: string;
  body?: string;
  href?: string;
}

const baseLinks = [
  { href: '/sos', label: 'SOS' },
  { href: '/blood', label: 'Blood Link' },
  { href: '/hospitals', label: 'Hospitals' },
  { href: '/first-aid', label: 'First Aid' },
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
  const [showIce, setShowIce] = useState(false);
  const [medId, setMedId] = useState({ bloodGroup: 'O+', allergies: 'None', contactName: 'Emergency Contact', contactPhone: '' });

  useEffect(() => {
    if (!user) init();
  }, [user, init]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('gh_medical_id');
      if (raw) setMedId(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [showIce]);

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
    useCallback((p) => push({ title: p.title, body: p.body, href: '/responder' }), [push])
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
    return (
      <div className="grid min-h-screen place-items-center gh-page-canvas text-white/60">
        <div className="flex flex-col items-center gap-3">
          <span className="h-9 w-9 animate-ping rounded-full bg-gold/40" />
          <span className="text-sm">Connecting to GoldenHour Mesh...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden gh-page-canvas">
      {/* Subtle animated tactical grid & ambient glowing orbs */}
      <div className="pointer-events-none fixed inset-0 gh-tactical-grid opacity-35" />
      <div className="pointer-events-none fixed -left-28 top-24 h-80 w-80 animate-drift rounded-full bg-gold/10 blur-[110px]" />
      <div className="pointer-events-none fixed -right-28 bottom-16 h-96 w-96 animate-drift rounded-full bg-alert/10 blur-[120px]" />

      <div className="relative z-10 flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#070b15]/85 backdrop-blur-xl">
          <div className="container-x flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-3">
              <Logo href="/" />
              <span className="hidden items-center gap-1.5 rounded-full border border-teal/30 bg-teal/10 px-2.5 py-0.5 text-[10px] font-semibold text-teal xl:inline-flex">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal" />
                MESH LIVE
              </span>
            </div>

            <nav className="hidden items-center gap-1 md:flex">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm transition',
                    pathname.startsWith(l.href)
                      ? 'border border-gold/30 bg-gold/10 font-medium text-gold'
                      : 'text-white/65 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2.5 text-sm">
              <button
                onClick={() => setShowIce(true)}
                className="hidden items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 transition hover:border-gold/50 hover:text-gold sm:inline-flex"
                title="Emergency Medical ID"
              >
                <HeartPulse size={14} className="text-alert-soft" /> ICE ID
              </button>

              {!pathname.startsWith('/sos') && (
                <Link
                  href="/sos"
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-btn px-3.5 py-1.5 text-xs font-semibold text-white shadow-glow-red transition hover:brightness-110"
                >
                  <Siren size={13} /> SOS
                </Link>
              )}

              {user ? (
                <>
                  <Link href="/profile" className="hidden rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:text-white sm:block">
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
                    <LogOut size={17} />
                  </button>
                </>
              ) : (
                <Link href="/login" className="rounded-full border border-gold/40 px-3.5 py-1.5 text-xs font-semibold text-gold hover:bg-gold/10">
                  Log in
                </Link>
              )}
            </div>
          </div>

          <nav className="container-x flex gap-1.5 overflow-x-auto pb-2.5 md:hidden">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'shrink-0 rounded-full px-3.5 py-1.5 text-xs',
                  pathname.startsWith(l.href) ? 'bg-gold/15 font-semibold text-gold' : 'bg-white/5 text-white/65'
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="container-x flex-1 py-7">{children}</main>
      </div>

      {/* Global ICE Medical ID Modal */}
      {showIce && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-strong w-full max-w-md rounded-3xl border border-alert/35 p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold text-white">
                <HeartPulse className="text-alert" size={20} /> Emergency Medical ID (ICE)
              </div>
              <button onClick={() => setShowIce(false)} className="rounded-full p-1 text-white/60 hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-2xl bg-alert/15 p-3">
                <div className="text-[10px] uppercase text-white/55">Blood Group</div>
                <div className="text-2xl font-bold text-alert-soft">{medId.bloodGroup}</div>
              </div>
              <div className="rounded-2xl bg-white/5 p-3">
                <div className="text-[10px] uppercase text-white/55">Allergies / Notes</div>
                <div className="mt-1 text-sm font-semibold">{medId.allergies || 'None listed'}</div>
              </div>
            </div>
            <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 p-3.5 text-sm">
              <div className="text-[10px] uppercase text-white/50">In Case of Emergency Contact</div>
              <div className="mt-0.5 font-semibold text-gold">{medId.contactName}</div>
              {medId.contactPhone ? (
                <a href={`tel:${medId.contactPhone}`} className="text-xs text-teal underline">
                  {medId.contactPhone}
                </a>
              ) : (
                <span className="text-xs text-white/45">Edit inside the SOS page</span>
              )}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs font-semibold">
              <a href={`tel:${EMERGENCY_NUMBER}`} className="flex items-center justify-center gap-1.5 rounded-xl bg-alert/20 py-2.5 text-alert-soft">
                <Phone size={14} /> Call {EMERGENCY_NUMBER}
              </a>
              <a href={`tel:${AMBULANCE_NUMBER}`} className="flex items-center justify-center gap-1.5 rounded-xl bg-gold/20 py-2.5 text-gold">
                <Phone size={14} /> Ambulance {AMBULANCE_NUMBER}
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Live Socket Notification Toasts */}
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
