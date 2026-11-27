'use client';

import { FormEvent, Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Toast';

function LoginForm() {
  const router = useRouter();
  const setSession = useAuth((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setSession(data.token, data.user);
      router.push(data.user.role === 'admin' ? '/admin' : data.user.role === 'responder' ? '/responder' : '/sos');
    } catch (err) {
      setError(apiError(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="glass-strong w-full max-w-md space-y-5 rounded-3xl p-8">
      <div className="flex justify-center"><Logo /></div>
      <h1 className="text-center text-2xl font-semibold">Welcome back</h1>
      {error && <Notice tone="error">{error}</Notice>}
      <div>
        <label className="label">Email</label>
        <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div>
        <label className="label">Password</label>
        <input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>{busy ? 'Signing in...' : 'Log in'}</Button>
      <p className="text-center text-sm text-white/60">
        New here? <Link className="text-gold" href="/register">Create an account</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="grid min-h-screen place-items-center gh-page-canvas relative overflow-hidden px-4">
      <div className="pointer-events-none absolute inset-0 gh-tactical-grid opacity-35" />
      <div className="relative z-10 w-full flex justify-center"><Suspense>
        <LoginForm />
      </Suspense></div>
    </div>
  );
}
