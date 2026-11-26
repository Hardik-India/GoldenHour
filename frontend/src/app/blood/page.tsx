'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Toast';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { useGeolocation } from '@/hooks/useGeolocation';
import { BLOOD_GROUPS, BloodGroup, BloodRequest } from '@/lib/types';
import { cn, timeAgo } from '@/lib/utils';

type Tab = 'request' | 'open' | 'donor';

const urgencyTone: Record<string, string> = {
  critical: 'bg-alert/20 text-alert-soft',
  urgent: 'bg-gold/20 text-gold',
  planned: 'bg-teal/20 text-teal',
};

export default function BloodPage() {
  const { user, refresh } = useAuth();
  const { coords } = useGeolocation();
  const [tab, setTab] = useState<Tab>('request');
  const [open, setOpen] = useState<BloodRequest[]>([]);
  const [alerts, setAlerts] = useState<BloodRequest[]>([]);
  const [mine, setMine] = useState<BloodRequest[]>([]);
  const [msg, setMsg] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    patientName: '',
    bloodGroup: 'O+' as BloodGroup,
    unitsNeeded: 1,
    urgency: 'urgent',
    contactPhone: '',
    note: '',
  });
  const [donorGroup, setDonorGroup] = useState<BloodGroup>('O+');

  const load = useCallback(async () => {
    try {
      const params = coords ? { lat: coords.lat, lng: coords.lng } : {};
      const [o, a, m] = await Promise.all([
        api.get('/blood-requests/open', { params }),
        api.get('/blood-requests/alerts'),
        api.get('/blood-requests/mine'),
      ]);
      setOpen(o.data.items);
      setAlerts(a.data.items);
      setMine(m.data.items);
    } catch (err) {
      setMsg({ tone: 'error', text: apiError(err) });
    }
  }, [coords]);

  useEffect(() => { if (user) load(); }, [user, load]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!coords) return;
    setBusy(true);
    setMsg(null);
    try {
      const { data } = await api.post('/blood-requests', {
        ...form,
        unitsNeeded: Number(form.unitsNeeded),
        lat: coords.lat,
        lng: coords.lng,
      });
      setMsg({ tone: 'success', text: data.message });
      await load();
    } catch (err) {
      setMsg({ tone: 'error', text: apiError(err) });
    } finally {
      setBusy(false);
    }
  }

  async function respond(id: string, response: 'accepted' | 'declined') {
    try {
      await api.post(`/blood-requests/${id}/respond`, { response });
      setMsg({ tone: 'success', text: response === 'accepted' ? 'Thank you. The requester has been notified.' : 'Declined.' });
      await load();
    } catch (err) {
      setMsg({ tone: 'error', text: apiError(err) });
    }
  }

  async function becomeDonor() {
    try {
      await api.post('/auth/become-donor', { bloodGroup: donorGroup });
      await refresh();
      setMsg({ tone: 'success', text: 'You are now a registered donor.' });
    } catch (err) {
      setMsg({ tone: 'error', text: apiError(err) });
    }
  }

  async function toggleAvail() {
    try {
      await api.patch('/auth/me', { donorAvailable: !user?.donorProfile.available });
      await refresh();
    } catch (err) {
      setMsg({ tone: 'error', text: apiError(err) });
    }
  }

  const Card = ({ r, actions }: { r: BloodRequest; actions?: React.ReactNode }) => (
    <div className="glass rounded-2xl p-4">
      <div className="flex items-center justify-between">
        <div className="text-2xl font-bold text-alert-soft">{r.bloodGroup === 'HH' ? 'HH' : r.bloodGroup}</div>
        <span className={cn('rounded-full px-3 py-1 text-xs font-semibold uppercase', urgencyTone[r.urgency])}>{r.urgency}</span>
      </div>
      <div className="mt-1 text-sm">{r.patientName} - {r.unitsFulfilled}/{r.unitsNeeded} units</div>
      <div className="text-xs text-white/45">{r.hospital?.name ? `${r.hospital.name} - ` : ''}{timeAgo(r.createdAt)} - {r.status.replace('_', ' ')}</div>
      <div className="mt-1 text-xs text-white/55">Contact: <a className="text-gold" href={`tel:${r.contactPhone}`}>{r.contactPhone}</a></div>
      {actions && <div className="mt-3 flex gap-2">{actions}</div>}
    </div>
  );

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-6">
        <h1 className="text-2xl font-semibold">Blood Link</h1>

        <div className="flex gap-2 rounded-full bg-white/5 p-1">
          {([['request', 'Request blood'], ['open', 'Open requests'], ['donor', 'My donor profile']] as [Tab, string][]).map(([k, l]) => (
            <button key={k} onClick={() => setTab(k)} className={cn('flex-1 rounded-full px-4 py-2 text-sm transition', tab === k ? 'bg-gold text-night font-semibold' : 'text-white/60')}>
              {l}
            </button>
          ))}
        </div>

        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}

        {tab === 'request' && (
          <>
            <form onSubmit={submit} className="glass-strong space-y-4 rounded-3xl p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label className="label">Patient name</label><input className="input" required value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} /></div>
                <div><label className="label">Contact phone</label><input className="input" required value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} /></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Blood group</label>
                  <select className="input" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value as BloodGroup })}>
                    {BLOOD_GROUPS.map((g) => <option key={g} value={g} className="bg-night">{g === 'HH' ? 'Bombay (HH)' : g}</option>)}
                  </select>
                </div>
                <div><label className="label">Units</label><input className="input" type="number" min={1} max={20} value={form.unitsNeeded} onChange={(e) => setForm({ ...form, unitsNeeded: Number(e.target.value) })} /></div>
                <div>
                  <label className="label">Urgency</label>
                  <select className="input" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                    <option value="critical" className="bg-night">Critical (within 6 h)</option>
                    <option value="urgent" className="bg-night">Urgent (within 24 h)</option>
                    <option value="planned" className="bg-night">Planned (within 3 days)</option>
                  </select>
                </div>
              </div>
              <div><label className="label">Note / hospital name</label><input className="input" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
              <Button type="submit" disabled={busy || !coords}>{busy ? 'Searching donors...' : 'Alert nearby donors'}</Button>
              <p className="text-xs text-white/40">Final donor eligibility is always decided by the blood bank. Also check e-RaktKosh for blood bank stock.</p>
            </form>

            <h2 className="font-semibold">My requests</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {mine.length === 0 && <p className="text-sm text-white/40">No requests yet.</p>}
              {mine.map((r) => <Card key={r._id} r={r} />)}
            </div>
          </>
        )}

        {tab === 'open' && (
          <div className="grid gap-3 sm:grid-cols-2">
            {open.length === 0 && <p className="text-sm text-white/40">No open requests near you.</p>}
            {open.map((r) => <Card key={r._id} r={r} />)}
          </div>
        )}

        {tab === 'donor' && (
          <div className="space-y-5">
            {user?.donorProfile.isDonor ? (
              <div className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl p-6">
                <div>
                  <div className="text-3xl font-bold text-alert-soft">{user.donorProfile.bloodGroup}</div>
                  <div className="text-sm text-white/55">Donations: {user.donorProfile.donationsCount} - {user.donorProfile.available ? 'Available' : 'Paused'}</div>
                </div>
                <Button variant="glass" onClick={toggleAvail}>{user.donorProfile.available ? 'Pause alerts' : 'Resume alerts'}</Button>
              </div>
            ) : (
              <div className="glass space-y-3 rounded-3xl p-6">
                <p className="text-sm text-white/65">Register as a donor to be alerted when someone nearby needs your blood group.</p>
                <select className="input max-w-xs" value={donorGroup} onChange={(e) => setDonorGroup(e.target.value as BloodGroup)}>
                  {BLOOD_GROUPS.map((g) => <option key={g} value={g} className="bg-night">{g === 'HH' ? 'Bombay (HH)' : g}</option>)}
                </select>
                <div><Button onClick={becomeDonor}>Become a donor</Button></div>
              </div>
            )}

            <h2 className="font-semibold">Requests matched to me</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {alerts.length === 0 && <p className="text-sm text-white/40">No matching requests right now.</p>}
              {alerts.map((r) => (
                <Card
                  key={r._id}
                  r={r}
                  actions={
                    <>
                      <Button className="px-4 py-2" onClick={() => respond(r._id, 'accepted')}>I can donate</Button>
                      <Button variant="glass" className="px-4 py-2" onClick={() => respond(r._id, 'declined')}>Decline</Button>
                    </>
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
