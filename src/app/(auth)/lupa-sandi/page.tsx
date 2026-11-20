'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { mintaAturUlangSandi } from '@/lib/actions/auth';

export default function LupaSandiPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await mintaAturUlangSandi({ email });
    setLoading(false);
    setStatus(res);
  }

  return (
    <div className="fn-surface p-6 sm:p-8 shadow-sm">
      <h1 className="fn-display text-2xl font-semibold">Lupa kata sandi</h1>
      <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
        Masukkan email akunmu. Kami kirimkan tautan untuk membuat kata sandi baru.
      </p>

      {status && (
        <div
          role="status"
          className="mt-5 rounded-2xl p-3.5 text-sm font-medium"
          style={{
            backgroundColor: status.ok
              ? 'var(--primary-soft)'
              : 'color-mix(in srgb, var(--danger) 12%, transparent)',
            color: status.ok ? 'var(--primary)' : 'var(--danger)',
          }}
        >
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold mb-1.5">
            Email terdaftar
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="fn-input"
          />
        </div>

        <button type="submit" disabled={loading} className="fn-btn-primary w-full">
          {loading ? 'Mengirim...' : 'Kirim tautan atur ulang'}
        </button>
      </form>

      <p className="text-sm text-center mt-6" style={{ color: 'var(--muted)' }}>
        <Link href="/masuk" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
          Kembali ke halaman masuk
        </Link>
      </p>
    </div>
  );
}
