'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ubahProfil, ubahKataSandi, hapusAkun } from '@/lib/actions/auth';
import { useToast } from '@/components/ui/ToastProvider';
import { ThemeToggle } from './ThemeToggle';
import type { ProfilTipe } from '@/lib/types/database';

export function PengaturanClient({
  initialNama,
  email,
  initialProfil,
}: {
  initialNama: string;
  email: string;
  initialProfil: ProfilTipe;
}) {
  const router = useRouter();
  const { showToast } = useToast();

  const [nama, setNama] = useState(initialNama);
  const [profil, setProfil] = useState<ProfilTipe>(initialProfil);
  const [savingProfil, setSavingProfil] = useState(false);

  const [sandiLama, setSandiLama] = useState('');
  const [sandiBaru, setSandiBaru] = useState('');
  const [konfirmasiSandi, setKonfirmasiSandi] = useState('');
  const [savingSandi, setSavingSandi] = useState(false);

  const [sandiHapus, setSandiHapus] = useState('');
  const [deletingAkun, setDeletingAkun] = useState(false);

  async function handleSaveProfil(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfil(true);
    const res = await ubahProfil({ nama, profil });
    setSavingProfil(false);
    showToast(res.message, res.ok ? 'success' : 'error');
  }

  async function handleSaveSandi(e: React.FormEvent) {
    e.preventDefault();
    setSavingSandi(true);
    const res = await ubahKataSandi({ sandiLama, sandiBaru, konfirmasiSandi });
    setSavingSandi(false);
    showToast(res.message, res.ok ? 'success' : 'error');
    if (res.ok) {
      setSandiLama('');
      setSandiBaru('');
      setKonfirmasiSandi('');
    }
  }

  async function handleDeleteAkun(e: React.FormEvent) {
    e.preventDefault();
    setDeletingAkun(true);
    const res = await hapusAkun({ sandi: sandiHapus });
    setDeletingAkun(false);
    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }
    router.push('/');
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* 1. Profil & Preferensi */}
      <form onSubmit={handleSaveProfil} className="fn-card p-6 flex flex-col gap-4">
        <h2 className="fn-display text-lg font-semibold">Profil akun</h2>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Email
          </label>
          <input type="email" value={email} disabled className="fn-input opacity-70" />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Nama panggilan
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            className="fn-input"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Profil pengguna
          </label>
          <select
            value={profil}
            onChange={(e) => setProfil(e.target.value as ProfilTipe)}
            className="fn-input"
          >
            <option value="pelajar">Pelajar dan remaja</option>
            <option value="kos">Mahasiswa dan anak kos</option>
            <option value="umkm">Pelaku UMKM</option>
          </select>
        </div>

        <div className="flex items-center justify-between pt-2">
          <ThemeToggle />
          <button type="submit" disabled={savingProfil} className="fn-btn fn-btn-primary">
            {savingProfil ? 'Menyimpan...' : 'Simpan profil'}
          </button>
        </div>
      </form>

      {/* 2. Ubah Kata Sandi */}
      <form onSubmit={handleSaveSandi} className="fn-card p-6 flex flex-col gap-4">
        <h2 className="fn-display text-lg font-semibold">Ubah kata sandi</h2>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Kata sandi saat ini
          </label>
          <input
            type="password"
            value={sandiLama}
            onChange={(e) => setSandiLama(e.target.value)}
            className="fn-input"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
              Kata sandi baru
            </label>
            <input
              type="password"
              value={sandiBaru}
              onChange={(e) => setSandiBaru(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="fn-input"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
              Ulangi kata sandi baru
            </label>
            <input
              type="password"
              value={konfirmasiSandi}
              onChange={(e) => setKonfirmasiSandi(e.target.value)}
              className="fn-input"
            />
          </div>
        </div>

        <button type="submit" disabled={savingSandi} className="fn-btn fn-btn-ghost self-start">
          {savingSandi ? 'Memperbarui...' : 'Perbarui kata sandi'}
        </button>
      </form>

      {/* 3. Zona Bahaya: Hapus Akun (FR-019) */}
      <form
        onSubmit={handleDeleteAkun}
        className="fn-card p-6 flex flex-col gap-4"
        style={{ borderColor: 'var(--danger)' }}
      >
        <div>
          <h2 className="fn-display text-lg font-semibold" style={{ color: 'var(--danger)' }}>
            Zona bahaya: Hapus akun
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Menghapus akun akan menghapus seluruh data transaksi, anggaran, tabungan, dan tagihanmu secara permanen.
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Konfirmasi kata sandi
          </label>
          <input
            type="password"
            value={sandiHapus}
            onChange={(e) => setSandiHapus(e.target.value)}
            placeholder="Masukkan kata sandimu"
            className="fn-input"
          />
        </div>

        <button
          type="submit"
          disabled={deletingAkun}
          className="fn-btn self-start text-white"
          style={{ backgroundColor: 'var(--danger)' }}
        >
          {deletingAkun ? 'Menghapus...' : 'Hapus akun permanen'}
        </button>
      </form>
    </div>
  );
}
