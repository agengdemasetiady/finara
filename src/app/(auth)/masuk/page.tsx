'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, WarningCircle } from '@phosphor-icons/react';
import { masukAkun } from '@/lib/actions/auth';

function MasukForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams.get('error');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState(
    urlError === 'nonaktif'
      ? 'Akunmu sedang dinonaktifkan oleh admin.'
      : urlError === 'tautan_tidak_valid'
        ? 'Tautan verifikasi tidak valid atau kedaluwarsa.'
        : ''
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const res = await masukAkun({ email, password });
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }

    router.push(res.redirectTo || '/dashboard');
    router.refresh();
  }

  return (
    <div className="fn-surface p-6 sm:p-8 shadow-sm">
      <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Masuk ke Finara</h1>
      <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
        Masukkan email dan kata sandi akunmu.
      </p>

      {errorMsg && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-2.5 rounded-2xl p-3.5 text-sm"
          style={{ backgroundColor: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)' }}
        >
          <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="fn-input"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-semibold">
              Kata sandi
            </label>
            <Link href="/lupa-sandi" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              Lupa kata sandi?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="fn-input"
          />
        </div>

        <button type="submit" disabled={loading} className="fn-btn-primary w-full mt-2">
          <span>{loading ? 'Memproses...' : 'Masuk'}</span>
          {!loading && <ArrowRight size={18} weight="bold" />}
        </button>
      </form>

      <p className="text-sm text-center mt-6" style={{ color: 'var(--muted)' }}>
        Belum punya akun?{' '}
        <Link href="/daftar" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
          Buat akun gratis
        </Link>
      </p>
    </div>
  );
}

export default function MasukPage() {
  return (
    <Suspense fallback={<div className="fn-surface p-8 text-center text-sm">Memuat...</div>}>
      <MasukForm />
    </Suspense>
  );
}
