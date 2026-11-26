'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app/AppShell';
import { Button } from '@/components/ui/Button';
import { Notice } from '@/components/ui/Toast';
import { api, apiError } from '@/lib/api';
import { useAuth } from '@/store/auth';

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [msg, setMsg] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) { setName(user.name); setPhone(user.phone); }
  }, [user]);

  async function save(e: FormEvent) {
    e.preventDefault();
    try {
      await api.patch('/auth/me', { name, phone });
      await refresh();
      setMsg({ tone: 'success', text: 'Profile updated.' });
    } catch (err) {
      setMsg({ tone: 'error', text: apiError(err) });
    }
  }

  async function applyResponder() {
    try {
      const { data } = await api.post('/auth/become-responder', { certifications: [] });
      await refresh();
      setMsg({ tone: 'success', text: data.message });
    } catch (err) {
      setMsg({ tone: 'error', text: apiError(err) });
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-xl space-y-5">
        <h1 className="text-2xl font-semibold">Profile</h1>
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        <form onSubmit={save} className="glass-strong space-y-4 rounded-3xl p-6">
          <div><label className="label">Name</label><input className="input" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div><label className="label">Phone</label><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
          <div className="text-sm text-white/50">{user?.email} - role: {user?.role}</div>
          <Button type="submit">Save</Button>
        </form>
        {user?.role === 'citizen' && (
          <div className="glass rounded-3xl p-6">
            <p className="mb-3 text-sm text-white/65">Trained in first aid? Apply to become a verified responder.</p>
            <Button variant="gold" onClick={applyResponder}>Apply as responder</Button>
          </div>
        )}
        {!user?.donorProfile.isDonor && (
          <Link href="/blood" className="block text-center text-sm text-gold underline">Register as a blood donor</Link>
        )}
      </div>
    </AppShell>
  );
}
