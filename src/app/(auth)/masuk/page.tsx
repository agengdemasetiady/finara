'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowRight, CheckCircle, WarningCircle } from '@phosphor-icons/react';
import { masukAkun } from '@/lib/actions/auth';

function MasukForm() {
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
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  function scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await masukAkun({ email, password });

      if (!res.ok) {
        setLoading(false);
        setErrorMsg(res.message);
        scrollToTop();
        return;
      }

      const tujuan = res.redirectTo || '/dashboard';
      setSuccessMsg(
        tujuan === '/admin'
          ? 'Berhasil masuk! Mengalihkan ke panel admin...'
          : 'Berhasil masuk! Mengalihkan ke dashboard...'
      );
      scrollToTop();

      setTimeout(() => {
        window.location.assign(tujuan);
      }, 550);
    } catch {
      setLoading(false);
      setErrorMsg('Terjadi gangguan jaringan. Silakan coba lagi.');
      scrollToTop();
    }
  }

  return (
    <div className="fn-surface p-6 sm:p-8 shadow-sm">
      {errorMsg && (
        <div
          role="alert"
          className="fn-alert-anim mb-5 flex items-start gap-2.5 rounded-2xl p-3.5 text-sm font-medium"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--danger) 12%, transparent)',
            color: 'var(--danger)',
            border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)',
          }}
        >
          <WarningCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div
          role="status"
          aria-live="polite"
          className="fn-alert-anim mb-5 flex items-start gap-2.5 rounded-2xl p-3.5 text-sm font-semibold"
          style={{
            backgroundColor: 'var(--primary-soft)',
            color: 'var(--primary)',
            border: '1px solid color-mix(in srgb, var(--primary) 28%, transparent)',
          }}
        >
          <CheckCircle size={18} weight="fill" className="shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Masuk ke Finara</h1>
      <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
        Masukkan email dan kata sandi akunmu.
      </p>

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
            disabled={loading}
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
            disabled={loading}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="fn-input"
          />
        </div>

        <button type="submit" disabled={loading} className="fn-btn-primary w-full mt-2">
          <span>{successMsg ? 'Mengalihkan...' : loading ? 'Memproses...' : 'Masuk'}</span>
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
