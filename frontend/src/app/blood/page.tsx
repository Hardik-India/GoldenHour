'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Check, CheckCircle2, Copy, Droplets, HeartPulse, Radio, ShieldCheck, Share2, Users } from 'lucide-react';
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
  critical: 'bg-alert/20 text-alert-soft border-alert/40',
  urgent: 'bg-gold/20 text-gold border-gold/40',
  planned: 'bg-teal/20 text-teal border-teal/40',
};

const COMPAT_MATRIX: Record<BloodGroup, { receiveFrom: BloodGroup[]; donateTo: BloodGroup[]; rarity: string }> = {
  'O-': { receiveFrom: ['O-'], donateTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], rarity: 'Universal Red-Cell Donor · ~6% pop.' },
  'O+': { receiveFrom: ['O-', 'O+'], donateTo: ['O+', 'A+', 'B+', 'AB+'], rarity: 'High Demand · ~37% pop.' },
  'A-': { receiveFrom: ['O-', 'A-'], donateTo: ['A-', 'A+', 'AB-', 'AB+'], rarity: 'Rare · ~5% pop.' },
  'A+': { receiveFrom: ['O-', 'O+', 'A-', 'A+'], donateTo: ['A+', 'AB+'], rarity: 'Common · ~22% pop.' },
  'B-': { receiveFrom: ['O-', 'B-'], donateTo: ['B-', 'B+', 'AB-', 'AB+'], rarity: 'Rare · ~2% pop.' },
  'B+': { receiveFrom: ['O-', 'O+', 'B-', 'B+'], donateTo: ['B+', 'AB+'], rarity: 'Most Common in India · ~32% pop.' },
  'AB-': { receiveFrom: ['O-', 'A-', 'B-', 'AB-'], donateTo: ['AB-', 'AB+'], rarity: 'Very Rare · ~1% pop.' },
  'AB+': { receiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], donateTo: ['AB+'], rarity: 'Universal Recipient · ~7% pop.' },
  HH: { receiveFrom: ['HH'], donateTo: ['HH'], rarity: 'Bombay Phenotype · 1 in 10,000 (3× Expanded Alert Radius)' },
};

const ELIGIBILITY_CHECKS = [
  'Age between 18 and 65 years',
  'Body weight 45 kg or above',
  'No fever, cold, or antibiotics in last 7 days',
  'At least 90 days since last whole-blood donation',
];

export default function BloodPage() {
  const { user, refresh } = useAuth();
  const { coords } = useGeolocation();
  const [tab, setTab] = useState<Tab>('request');
  const [open, setOpen] = useState<BloodRequest[]>([]);
  const [alerts, setAlerts] = useState<BloodRequest[]>([]);
  const [mine, setMine] = useState<BloodRequest[]>([]);
  const [msg, setMsg] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const [filterGroup, setFilterGroup] = useState<string>('ALL');
  const [exploreGroup, setExploreGroup] = useState<BloodGroup>('O+');
  const [copiedAppeal, setCopiedAppeal] = useState(false);
  const [checks, setChecks] = useState<boolean[]>([true, true, true, true]);

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

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const filteredOpen = useMemo(
    () => (filterGroup === 'ALL' ? open : open.filter((r) => r.bloodGroup === filterGroup)),
    [open, filterGroup]
  );

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
      setMsg({ tone: 'success', text: response === 'accepted' ? 'Thank you! The requester has been notified.' : 'Declined.' });
      await load();
    } catch (err) {
      setMsg({ tone: 'error', text: apiError(err) });
    }
  }

  async function becomeDonor() {
    try {
      await api.post('/auth/become-donor', { bloodGroup: donorGroup });
      await refresh();
      setMsg({ tone: 'success', text: 'You are now a registered GoldenHour donor.' });
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

  function copyBloodAppeal() {
    const grp = form.bloodGroup === 'HH' ? 'Bombay (HH)' : form.bloodGroup;
    const text = `URGENT BLOOD NEEDED (${grp})\nPatient: ${form.patientName || 'Emergency Patient'}\nUnits: ${form.unitsNeeded} | Urgency: ${form.urgency.toUpperCase()}\nHospital/Note: ${form.note || 'Nearby Hospital'}\nContact: ${form.contactPhone || 'Call requester'}\nCompatible Donors: ${COMPAT_MATRIX[form.bloodGroup].receiveFrom.join(', ')}\nShared via GoldenHour Blood Link`;
    navigator.clipboard?.writeText(text).catch(() => undefined);
    setCopiedAppeal(true);
    setTimeout(() => setCopiedAppeal(false), 3000);
  }

  const allEligible = checks.every(Boolean);
  const compat = COMPAT_MATRIX[exploreGroup];

  const Card = ({ r, actions }: { r: BloodRequest; actions?: React.ReactNode }) => (
    <div className="gh-card-glow glass rounded-2xl p-4 hover:border-alert/45">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-alert/15 text-lg font-bold text-alert-soft">
            {r.bloodGroup}
          </div>
          <div>
            <div className="text-sm font-semibold">{r.patientName}</div>
            <div className="text-xs text-white/50">
              {r.unitsFulfilled}/{r.unitsNeeded} units · {timeAgo(r.createdAt)}
            </div>
          </div>
        </div>
        <span className={cn('rounded-full border px-3 py-1 text-[10px] font-bold uppercase', urgencyTone[r.urgency])}>
          {r.urgency}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-2.5 text-xs text-white/60">
        <span>{r.hospital?.name || r.note || r.status.replace('_', ' ')}</span>
        <a className="font-semibold text-gold hover:underline" href={`tel:${r.contactPhone}`}>
          {r.contactPhone}
        </a>
      </div>
      {actions && <div className="mt-3 flex gap-2">{actions}</div>}
    </div>
  );

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header + 4-Stat Command Bar */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.22em] text-alert-soft">Compatibility-Aware Donor Mesh</span>
            <h1 className="mt-1 text-3xl font-bold">Blood Link Command Hub</h1>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-alert/35 bg-alert/10 px-4 py-1.5 text-xs font-medium text-alert-soft">
            <Radio size={13} className="animate-pulse" /> Rare Bombay (HH) Channel Active
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-white/55">
              <span>Open Nearby</span>
              <Droplets size={15} className="text-alert" />
            </div>
            <div className="mt-1 text-2xl font-bold text-white">{open.length}</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-white/55">
              <span>Matched to You</span>
              <HeartPulse size={15} className="text-gold" />
            </div>
            <div className="mt-1 text-2xl font-bold text-gold">{alerts.length}</div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-white/55">
              <span>My Donor Status</span>
              <Users size={15} className="text-teal" />
            </div>
            <div className="mt-1 text-lg font-bold text-teal">
              {user?.donorProfile.isDonor ? `${user.donorProfile.bloodGroup} · ${user.donorProfile.available ? 'Ready' : 'Paused'}` : 'Not Registered'}
            </div>
          </div>
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between text-xs text-white/55">
              <span>Safety Cool-Down</span>
              <ShieldCheck size={15} className="text-teal" />
            </div>
            <div className="mt-1 text-2xl font-bold text-white">90 Days</div>
          </div>
        </div>

        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}

        {/* Full-Width 2-Column Workspace */}
        <div className="grid gap-6 lg:grid-cols-[1.45fr_1fr]">
          {/* LEFT COLUMN: Tabs + Forms + Live Requests */}
          <div className="space-y-5">
            <div className="flex gap-2 rounded-full border border-white/10 bg-white/5 p-1">
              {(
                [
                  ['request', 'Request Blood'],
                  ['open', `Open Requests (${open.length})`],
                  ['donor', 'My Donor Profile'],
                ] as [Tab, string][]
              ).map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={cn(
                    'flex-1 rounded-full px-4 py-2 text-xs font-semibold transition sm:text-sm',
                    tab === k ? 'bg-gold text-night shadow-glow-gold' : 'text-white/65 hover:text-white'
                  )}
                >
                  {l}
                </button>
              ))}
            </div>

            {tab === 'request' && (
              <>
                <form onSubmit={submit} className="glass-strong space-y-4 rounded-3xl border border-alert/20 p-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="label">Patient name</label>
                      <input className="input" required placeholder="Full name" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">Contact phone</label>
                      <input className="input" required placeholder="+91 98..." value={form.contactPhone} onChange={(e) => setForm({ ...form, contactPhone: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="label">Blood group</label>
                      <select
                        className="input"
                        value={form.bloodGroup}
                        onChange={(e) => {
                          const g = e.target.value as BloodGroup;
                          setForm({ ...form, bloodGroup: g });
                          setExploreGroup(g);
                        }}
                      >
                        {BLOOD_GROUPS.map((g) => (
                          <option key={g} value={g} className="bg-night">
                            {g === 'HH' ? 'Bombay (HH)' : g}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label">Units needed</label>
                      <input className="input" type="number" min={1} max={20} value={form.unitsNeeded} onChange={(e) => setForm({ ...form, unitsNeeded: Number(e.target.value) })} />
                    </div>
                    <div>
                      <label className="label">Urgency</label>
                      <select className="input" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })}>
                        <option value="critical" className="bg-night">Critical (within 6 h)</option>
                        <option value="urgent" className="bg-night">Urgent (within 24 h)</option>
                        <option value="planned" className="bg-night">Planned (within 3 days)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="label">Hospital / Ward / Note</label>
                    <input className="input" placeholder="e.g. City Trauma ICU Bed 4, platelet/whole blood..." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" disabled={busy || !coords} className="flex-1">
                      {busy ? 'Alerting Eligible Donors...' : 'Alert Nearby Compatible Donors'}
                    </Button>
                    <Button type="button" variant="glass" onClick={copyBloodAppeal}>
                      {copiedAppeal ? <Check size={15} className="text-teal" /> : <Share2 size={15} />}
                      {copiedAppeal ? 'Appeal Copied!' : 'Copy WhatsApp Appeal'}
                    </Button>
                  </div>
                  <p className="text-xs text-white/45">
                    Compatible donors matched automatically: <b className="text-teal">{COMPAT_MATRIX[form.bloodGroup].receiveFrom.join(', ')}</b>. Final screening is always performed by the blood bank.
                  </p>
                </form>

                <div>
                  <h2 className="mb-3 font-semibold">My Posted Requests ({mine.length})</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {mine.length === 0 && <p className="text-sm text-white/45">No blood requests raised yet.</p>}
                    {mine.map((r) => <Card key={r._id} r={r} />)}
                  </div>
                </div>
              </>
            )}

            {tab === 'open' && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {['ALL', ...BLOOD_GROUPS].map((g) => (
                    <button
                      key={g}
                      onClick={() => setFilterGroup(g)}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-semibold transition',
                        filterGroup === g ? 'border-alert bg-alert text-white' : 'border-white/10 bg-white/5 text-white/65 hover:border-white/30'
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {filteredOpen.length === 0 && <p className="text-sm text-white/45">No open requests for this filter nearby.</p>}
                  {filteredOpen.map((r) => <Card key={r._id} r={r} />)}
                </div>
              </div>
            )}

            {tab === 'donor' && (
              <div className="space-y-5">
                {user?.donorProfile.isDonor ? (
                  <div className="glass-strong flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-teal/25 p-6">
                    <div className="flex items-center gap-4">
                      <div className="grid h-16 w-16 place-items-center rounded-2xl bg-alert/20 text-3xl font-bold text-alert-soft">
                        {user.donorProfile.bloodGroup}
                      </div>
                      <div>
                        <div className="font-semibold">Registered GoldenHour Donor</div>
                        <div className="text-sm text-white/60">
                          Total Donations: <b className="text-gold">{user.donorProfile.donationsCount}</b> · Status:{' '}
                          <b className={user.donorProfile.available ? 'text-teal' : 'text-white/50'}>
                            {user.donorProfile.available ? 'Available for alerts' : 'Paused'}
                          </b>
                        </div>
                      </div>
                    </div>
                    <Button variant="glass" onClick={toggleAvail}>
                      {user.donorProfile.available ? 'Pause alerts' : 'Resume alerts'}
                    </Button>
                  </div>
                ) : (
                  <div className="glass-strong space-y-4 rounded-3xl p-6">
                    <h3 className="text-lg font-semibold">Join the Life-Saving Donor Mesh</h3>
                    <p className="text-sm text-white/65">Get notified only when someone nearby needs a blood group compatible with yours.</p>
                    <select className="input max-w-xs" value={donorGroup} onChange={(e) => setDonorGroup(e.target.value as BloodGroup)}>
                      {BLOOD_GROUPS.map((g) => <option key={g} value={g} className="bg-night">{g === 'HH' ? 'Bombay (HH)' : g}</option>)}
                    </select>
                    <div><Button onClick={becomeDonor}>Register as Donor</Button></div>
                  </div>
                )}

                <div>
                  <h2 className="mb-3 font-semibold">Requests Matched to Me ({alerts.length})</h2>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {alerts.length === 0 && <p className="text-sm text-white/45">No matching alerts right now. Stay available!</p>}
                    {alerts.map((r) => (
                      <Card
                        key={r._id}
                        r={r}
                        actions={
                          <>
                            <Button className="flex-1 px-4 py-2 text-xs" onClick={() => respond(r._id, 'accepted')}>I can donate</Button>
                            <Button variant="glass" className="px-4 py-2 text-xs" onClick={() => respond(r._id, 'declined')}>Decline</Button>
                          </>
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Interactive Compatibility Explorer + Eligibility Self-Check */}
          <div className="space-y-6">
            <div className="glass-strong rounded-3xl border border-alert/25 p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Interactive Compatibility Explorer</h3>
                <span className="rounded-full bg-alert/15 px-2.5 py-0.5 text-xs font-bold text-alert-soft">{exploreGroup}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {BLOOD_GROUPS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setExploreGroup(g)}
                    className={cn(
                      'rounded-xl border py-2 text-xs font-bold transition',
                      exploreGroup === g
                        ? 'border-alert bg-alert text-white shadow-glow-red'
                        : 'border-white/10 bg-white/5 text-white/75 hover:border-alert/50'
                    )}
                  >
                    {g === 'HH' ? 'HH (Bombay)' : g}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs text-gold">{compat.rarity}</p>

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-teal/25 bg-teal/10 p-3.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-teal">Can Receive From</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {compat.receiveFrom.map((g) => (
                      <span key={g} className="rounded-lg bg-night-900/80 px-2.5 py-1 text-xs font-bold text-white">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl border border-gold/25 bg-gold/10 p-3.5">
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gold">Can Donate To</div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {compat.donateTo.map((g) => (
                      <span key={g} className="rounded-lg bg-night-900/80 px-2.5 py-1 text-xs font-bold text-white">
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Donor Safety Self-Check */}
            <div className="glass rounded-3xl p-6">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">Quick Eligibility Check</h3>
                <span className={cn('rounded-full px-2.5 py-0.5 text-[11px] font-bold', allEligible ? 'bg-teal/20 text-teal' : 'bg-gold/20 text-gold')}>
                  {allEligible ? 'Likely Eligible' : 'Check with Bank'}
                </span>
              </div>
              <div className="space-y-2">
                {ELIGIBILITY_CHECKS.map((label, idx) => (
                  <label
                    key={label}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-xs text-white/80"
                  >
                    <input
                      type="checkbox"
                      checked={checks[idx]}
                      onChange={(e) => setChecks((prev) => prev.map((v, i) => (i === idx ? e.target.checked : v)))}
                      className="accent-teal"
                    />
                    <span className="flex-1">{label}</span>
                    {checks[idx] && <CheckCircle2 size={14} className="text-teal" />}
                  </label>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-night-900/60 px-4 py-3 text-xs text-white/65">
                <span>Need government blood-bank stock?</span>
                <button
                  type="button"
                  onClick={copyBloodAppeal}
                  className="inline-flex items-center gap-1 font-semibold text-gold hover:underline"
                >
                  <Copy size={13} /> Copy Appeal
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
