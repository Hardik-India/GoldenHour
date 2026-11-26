'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Toast';
import { api, apiError } from '@/lib/api';
import { timeAgo } from '@/lib/utils';

interface Pending {
  _id: string;
  name: string;
  email: string;
  phone: string;
  responderProfile: { certifications: string[]; appliedAt?: string };
}
interface ReportItem {
  _id: string;
  reason: string;
  details: string;
  status: string;
  createdAt: string;
  reporter?: { name: string };
}
interface LiveIncident {
  _id: string;
  type: string;
  severity: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [pending, setPending] = useState<Pending[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [live, setLive] = useState<LiveIncident[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [p, r, l] = await Promise.all([
        api.get('/admin/responders', { params: { status: 'pending' } }),
        api.get('/admin/reports'),
        api.get('/admin/live-incidents'),
      ]);
      setPending(p.data.items);
      setReports(r.data.items);
      setLive(l.data.items);
    } catch (err) {
      setError(apiError(err));
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, [load]);

  async function verify(id: string) {
    await api.patch(`/admin/responders/${id}/verify`);
    load();
  }
  async function setReport(id: string, status: 'reviewed' | 'dismissed') {
    await api.patch(`/admin/reports/${id}`, { status });
    load();
  }

  return (
    <AppShell roles={['admin']}>
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold">Admin console</h1>
        {error && <Notice tone="error">{error}</Notice>}

        <section>
          <h2 className="mb-3 font-semibold">Responder applications ({pending.length})</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {pending.length === 0 && <p className="text-sm text-white/40">No pending applications.</p>}
            {pending.map((u) => (
              <div key={u._id} className="glass rounded-2xl p-4">
                <div className="font-semibold">{u.name}</div>
                <div className="text-xs text-white/50">{u.email} - {u.phone}</div>
                <div className="mt-2 text-sm text-white/70">
                  {u.responderProfile.certifications.length ? u.responderProfile.certifications.join(', ') : 'No certifications listed'}
                </div>
                <div className="mt-3"><Button className="px-5 py-2" onClick={() => verify(u._id)}>Verify</Button></div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Live incidents ({live.length})</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {live.length === 0 && <p className="text-sm text-white/40">No active incidents.</p>}
            {live.map((i) => (
              <Link key={i._id} href={`/incident/${i._id}`} className="glass rounded-2xl p-4 hover:border-gold/50">
                <div className="font-medium capitalize">{i.type.replace('_', ' ')} - {i.severity}</div>
                <div className="text-xs text-white/50">{i.status.replace('_', ' ')} - {timeAgo(i.createdAt)}</div>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-semibold">Reports</h2>
          <div className="space-y-3">
            {reports.length === 0 && <p className="text-sm text-white/40">No reports.</p>}
            {reports.map((r) => (
              <div key={r._id} className="glass flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
                <div>
                  <div className="font-medium capitalize">{r.reason.replace('_', ' ')} <span className="text-xs text-white/40">- {r.status}</span></div>
                  <div className="text-xs text-white/50">{r.details || 'No details'} - by {r.reporter?.name ?? 'unknown'}</div>
                </div>
                {r.status === 'open' && (
                  <div className="flex gap-2">
                    <Button variant="glass" className="px-4 py-2" onClick={() => setReport(r._id, 'reviewed')}>Reviewed</Button>
                    <Button variant="ghost" className="px-4 py-2" onClick={() => setReport(r._id, 'dismissed')}>Dismiss</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
