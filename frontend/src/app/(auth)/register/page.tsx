'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Toast';
import { BLOOD_GROUPS, BloodGroup } from '@/lib/types';

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const role = params.get('role');
  const setSession = useAuth((s) => s.setSession);

  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [asResponder, setAsResponder] = useState(role === 'responder');
  const [asDonor, setAsDonor] = useState(role === 'donor');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [certs, setCerts] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/auth/register', {
        ...form,
        asResponder,
        asDonor,
        bloodGroup: asDonor ? bloodGroup : undefined,
        certifications: asResponder ? certs.split(',').map((c) => c.trim()).filter(Boolean) : undefined,
      });
      setSession(data.token, data.user);
      router.push(asResponder ? '/responder' : asDonor ? '/blood' : '/sos');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-strong w-full max-w-lg space-y-4 rounded-3xl p-8">
      <div className="flex justify-center"><Logo /></div>
      <h1 className="text-center text-2xl font-semibold">Join the network</h1>
      {error && <Notice tone="error">{error}</Notice>}
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label className="label">Full name</label><input className="input" required value={form.name} onChange={set('name')} /></div>
        <div><label className="label">Phone</label><input className="input" required value={form.phone} onChange={set('phone')} /></div>
      </div>
      <div><label className="label">Email</label><input className="input" type="email" required value={form.email} onChange={set('email')} /></div>
      <div><label className="label">Password (min 8)</label><input className="input" type="password" minLength={8} required value={form.password} onChange={set('password')} /></div>

      <label className="flex items-center gap-3 rounded-xl border border-white/10 p-3 text-sm">
        <input type="checkbox" checked={asResponder} onChange={(e) => setAsResponder(e.target.checked)} />
        I am trained in first aid / CPR and want to be an emergency responder
      </label>
      {asResponder && (
        <div>
          <label className="label">Certifications (comma separated)</label>
          <input className="input" placeholder="First Aid (Red Cross), CPR/BLS" value={certs} onChange={(e) => setCerts(e.target.value)} />
          <p className="mt-1 text-xs text-white/40">An admin verifies responders before alerts are sent.</p>
        </div>
      )}

      <label className="flex items-center gap-3 rounded-xl border border-white/10 p-3 text-sm">
        <input type="checkbox" checked={asDonor} onChange={(e) => setAsDonor(e.target.checked)} />
        I want to be a blood donor
      </label>
      {asDonor && (
        <div>
          <label className="label">Blood group</label>
          <select className="input" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value as BloodGroup)}>
            {BLOOD_GROUPS.map((g) => <option key={g} value={g} className="bg-night">{g === 'HH' ? 'Bombay (HH)' : g}</option>)}
          </select>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Creating...' : 'Create account'}</Button>
      <p className="text-center text-sm text-white/60">
        Already registered? <Link className="text-gold" href="/login">Log in</Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  return (
    <div className="grid min-h-screen place-items-center bg-night-glow px-4 py-10">
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
