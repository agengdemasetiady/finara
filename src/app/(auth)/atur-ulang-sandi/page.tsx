'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { simpanSandiBaru } from '@/lib/actions/auth';

export default function AturUlangSandiPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [konfirmasiPassword, setKonfirmasiPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    const res = await simpanSandiBaru({ password, konfirmasiPassword });
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="fn-surface p-6 sm:p-8 shadow-sm">
      <h1 className="fn-display text-2xl font-semibold">Buat kata sandi baru</h1>
      <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
        Gunakan minimal 8 karakter yang mudah kamu ingat.
      </p>

      {errorMsg && (
        <div
          role="alert"
          className="mt-5 rounded-2xl p-3.5 text-sm font-medium"
          style={{ backgroundColor: 'color-mix(in srgb, var(--danger) 12%, transparent)', color: 'var(--danger)' }}
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="password" className="block text-sm font-semibold mb-1.5">
            Kata sandi baru
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimal 8 karakter"
            className="fn-input"
          />
        </div>

        <div>
          <label htmlFor="konfirmasi" className="block text-sm font-semibold mb-1.5">
            Ulangi kata sandi baru
          </label>
          <input
            id="konfirmasi"
            type="password"
            required
            value={konfirmasiPassword}
            onChange={(e) => setKonfirmasiPassword(e.target.value)}
            placeholder="Ketik ulang kata sandi"
            className="fn-input"
          />
        </div>

        <button type="submit" disabled={loading} className="fn-btn-primary w-full">
          {loading ? 'Menyimpan...' : 'Simpan kata sandi'}
        </button>
      </form>
    </div>
  );
}
