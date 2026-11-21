'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  EnvelopeSimple,
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
  const [step, setStep] = useState<1 | 2>(1);
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profil, setProfil] = useState<ProfilTipe>('kos');
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  function scrollToTop() {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  function handleNextStep(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg('');
    if (nama.trim().length < 2) {
      setErrorMsg('Nama minimal 2 karakter.');
      scrollToTop();
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg('Format email belum benar.');
      scrollToTop();
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Kata sandi minimal 8 karakter.');
      scrollToTop();
      return;
    }
    setStep(2);
    scrollToTop();
  }

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    setErrorMsg('');
    setInfoMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const res = await daftarAkun({ nama, email, password, profil });

      if (!res.ok) {
        setLoading(false);
        setErrorMsg(res.message);
        scrollToTop();
        return;
      }

      if (res.message.includes('Periksa emailmu')) {
        setLoading(false);
        setInfoMsg(res.message);
        scrollToTop();
        return;
      }

      setSuccessMsg('Pendaftaran berhasil! Mengalihkan ke dashboard...');
      scrollToTop();

      setTimeout(() => {
        window.location.assign('/dashboard');
      }, 600);
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

      {infoMsg ? (
        <div className="fn-alert-anim py-2 text-center">
          <div
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
          >
            <EnvelopeSimple size={30} weight="duotone" />
          </div>
          <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Konfirmasi emailmu</h1>
          <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
            {infoMsg} Kami telah mengirimkan tautan aktivasi ke{' '}
            <strong style={{ color: 'var(--ink)' }}>{email}</strong>.
          </p>
          <div
            className="mt-5 rounded-2xl p-4 text-left text-xs leading-relaxed"
            style={{
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              color: 'var(--muted)',
            }}
          >
            Buka kotak masuk atau folder spam pada emailmu, klik tautan verifikasi, lalu masuk menggunakan akun yang
            baru dibuat.
          </div>
          <Link href="/masuk" className="fn-btn-primary w-full mt-6">
            <span>Lanjut ke halaman Masuk</span>
            <ArrowRight size={18} weight="bold" />
          </Link>
        </div>
      ) : (
        <>
          <div
            className="flex items-center justify-between text-xs font-semibold mb-4"
            style={{ color: 'var(--muted)' }}
          >
            <span>Langkah {step} dari 2</span>
            <div className="flex gap-1.5">
              <span className="h-1.5 w-8 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
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

              <form onSubmit={handleFinish} className="mt-5 flex flex-col gap-3">
                {PROFIL_OPTIONS.map((opt) => {
                  const selected = profil === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={loading}
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
                    disabled={loading}
                    onClick={() => {
                      setErrorMsg('');
                      setStep(1);
                      scrollToTop();
                    }}
                    className="min-h-[50px] px-4 rounded-full border font-semibold text-sm inline-flex items-center gap-1.5 cursor-pointer"
                    style={{ borderColor: 'var(--border-strong)' }}
                  >
                    <ArrowLeft size={16} />
                    <span>Kembali</span>
                  </button>
                  <button type="submit" disabled={loading} className="fn-btn-primary flex-1">
                    <span>{successMsg ? 'Mengalihkan...' : loading ? 'Menyiapkan...' : 'Selesai & mulai'}</span>
                  </button>
                </div>
              </form>
            </>
          )}
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
