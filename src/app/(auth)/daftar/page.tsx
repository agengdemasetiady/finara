'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  House,
  Storefront,
  WarningCircle,
} from '@phosphor-icons/react';
import { daftarAkun } from '@/lib/actions/auth';
import type { ProfilTipe } from '@/lib/types/database';

const PROFIL_OPTIONS: Array<{
  id: ProfilTipe;
  title: string;
  desc: string;
  tags: string[];
  icon: React.ReactNode;
}> = [
  {
    id: 'pelajar',
    title: 'Pelajar dan remaja',
    desc: 'Catat uang saku, jajan, dan target menabung untuk barang impian.',
    tags: ['Uang saku', 'Jajan', 'Tabungan'],
    icon: <GraduationCap size={26} weight="duotone" />,
  },
  {
    id: 'kos',
    title: 'Mahasiswa dan anak kos',
    desc: 'Bagi uang bulanan sampai akhir bulan dengan pengingat tagihan kos dan listrik.',
    tags: ['Uang bulanan', 'Kos', 'Makan'],
    icon: <House size={26} weight="duotone" />,
  },
  {
    id: 'umkm',
    title: 'Pelaku UMKM',
    desc: 'Pisahkan pemasukan dan biaya usaha untuk memantau laba sederhana tiap bulan.',
    tags: ['Penjualan', 'Bahan baku', 'Laba'],
    icon: <Storefront size={26} weight="duotone" />,
  },
];

export default function DaftarPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profil, setProfil] = useState<ProfilTipe>('kos');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [loading, setLoading] = useState(false);

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    if (nama.trim().length < 2) {
      setErrorMsg('Nama minimal 2 karakter.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Format email belum benar.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter.');
      return;
    }
    setStep(2);
  }

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');
    setLoading(true);

    const res = await daftarAkun({ nama, email, password, profil });
    setLoading(false);

    if (!res.ok) {
      setErrorMsg(res.message);
      return;
    }

    if (res.message.includes('Periksa emailmu')) {
      setInfoMsg(res.message);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="fn-surface p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between text-xs font-semibold mb-4" style={{ color: 'var(--muted)' }}>
        <span>Langkah {step} dari 2</span>
        <div className="flex gap-1.5">
          <span
            className="h-1.5 w-8 rounded-full"
            style={{ backgroundColor: 'var(--primary)' }}
          />
          <span
            className="h-1.5 w-8 rounded-full"
            style={{ backgroundColor: step === 2 ? 'var(--primary)' : 'var(--border-strong)' }}
          />
        </div>
      </div>

      {step === 1 ? (
        <>
          <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Buat akun Finara</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
            Mulai rapikan catatan keuangan harianmu.
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

          <form onSubmit={handleNextStep} className="mt-6 flex flex-col gap-4" noValidate>
            <div>
              <label htmlFor="nama" className="block text-sm font-semibold mb-1.5">
                Nama panggilan
              </label>
              <input
                id="nama"
                type="text"
                autoComplete="name"
                required
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: Ageng Dema"
                className="fn-input"
              />
            </div>

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
              <label htmlFor="password" className="block text-sm font-semibold mb-1.5">
                Kata sandi
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="fn-input"
              />
            </div>

            <button type="submit" className="fn-btn-primary w-full mt-2">
              <span>Lanjut pilih profil</span>
              <ArrowRight size={18} weight="bold" />
            </button>
          </form>
        </>
      ) : (
        <>
          <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Pilih profilmu</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--muted)' }}>
            Kategori bawaan dan insight otomatis akan menyesuaikan pilihanmu.
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

          {infoMsg && (
            <div
              role="status"
              className="mt-5 rounded-2xl p-4 text-sm font-medium"
              style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
            >
              {infoMsg}
            </div>
          )}

          <form onSubmit={handleFinish} className="mt-5 flex flex-col gap-3">
            {PROFIL_OPTIONS.map((opt) => {
              const selected = profil === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setProfil(opt.id)}
                  className="text-left rounded-2xl p-4 border transition-all flex items-start gap-3.5 cursor-pointer"
                  style={{
                    backgroundColor: selected ? 'var(--primary-soft)' : 'var(--bg)',
                    borderColor: selected ? 'var(--primary)' : 'var(--border)',
                  }}
                >
                  <span
                    className="p-2.5 rounded-xl shrink-0"
                    style={{
                      backgroundColor: selected ? 'var(--primary)' : 'var(--surface)',
                      color: selected ? 'var(--on-primary)' : 'var(--primary)',
                    }}
                  >
                    {opt.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="fn-display font-semibold text-base">{opt.title}</span>
                      {selected && <Check size={18} weight="bold" style={{ color: 'var(--primary)' }} />}
                    </div>
                    <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--muted)' }}>
                      {opt.desc}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {opt.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                          style={{ backgroundColor: 'var(--surface)', color: 'var(--primary)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              );
            })}

            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[50px] px-4 rounded-full border font-semibold text-sm inline-flex items-center gap-1.5 cursor-pointer"
                style={{ borderColor: 'var(--border-strong)' }}
              >
                <ArrowLeft size={16} />
                <span>Kembali</span>
              </button>
              <button type="submit" disabled={loading} className="fn-btn-primary flex-1">
                <span>{loading ? 'Menyiapkan...' : 'Selesai & mulai'}</span>
              </button>
            </div>
          </form>
        </>
      )}

      <p className="text-sm text-center mt-6" style={{ color: 'var(--muted)' }}>
        Sudah punya akun?{' '}
        <Link href="/masuk" className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
          Masuk
        </Link>
      </p>
    </div>
  );
}
