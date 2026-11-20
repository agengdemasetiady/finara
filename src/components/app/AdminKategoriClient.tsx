'use client';

import React, { useState } from 'react';
import { Plus, Trash } from '@phosphor-icons/react';
import { buatKategoriBawaan, hapusKategoriBawaan } from '@/lib/actions/admin';
import { useToast } from '@/components/ui/ToastProvider';
import { AVAILABLE_COLORS, AVAILABLE_ICONS, CategoryIconChip } from '@/components/ui/CategoryIcon';
import type { JenisTrx, Kategori, ProfilTarget } from '@/lib/types/database';

export function AdminKategoriClient({ categories }: { categories: Kategori[] }) {
  const { showToast } = useToast();
  const [nama, setNama] = useState('');
  const [jenis, setJenis] = useState<JenisTrx>('PENGELUARAN');
  const [profilTarget, setProfilTarget] = useState<ProfilTarget>('semua');
  const [ikon, setIkon] = useState('Wallet');
  const [warna, setWarna] = useState('#0B5C46');
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await buatKategoriBawaan({
      nama: nama.trim(),
      jenis,
      profil_target: profilTarget,
      ikon,
      warna,
    });
    setSaving(false);
    showToast(res.message, res.ok ? 'success' : 'error');
    if (res.ok) setNama('');
  }

  async function handleDelete(id: string) {
    const res = await hapusKategoriBawaan(id);
    showToast(res.message, res.ok ? 'success' : 'error');
  }

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleCreate} className="fn-card p-5 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Nama kategori
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Kuota Internet"
            className="fn-input"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Jenis
          </label>
          <select value={jenis} onChange={(e) => setJenis(e.target.value as JenisTrx)} className="fn-input">
            <option value="PENGELUARAN">Pengeluaran</option>
            <option value="PEMASUKAN">Pemasukan</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Profil target
          </label>
          <select
            value={profilTarget}
            onChange={(e) => setProfilTarget(e.target.value as ProfilTarget)}
            className="fn-input"
          >
            <option value="semua">Semua profil</option>
            <option value="pelajar">Pelajar</option>
            <option value="kos">Anak kos</option>
            <option value="umkm">UMKM</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Ikon &amp; Warna
          </label>
          <div className="flex gap-2">
            <select value={ikon} onChange={(e) => setIkon(e.target.value)} className="fn-input text-xs">
              {AVAILABLE_ICONS.map((ic) => (
                <option key={ic.name} value={ic.name}>
                  {ic.label}
                </option>
              ))}
            </select>
            <input
              type="color"
              value={warna}
              onChange={(e) => setWarna(e.target.value)}
              className="w-12 h-[46px] rounded-xl border p-1 cursor-pointer"
              style={{ borderColor: 'var(--border-strong)' }}
            />
          </div>
        </div>

        <button type="submit" disabled={saving} className="fn-btn fn-btn-primary w-full">
          <Plus size={18} weight="bold" />
          <span>Tambah</span>
        </button>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((kat) => (
          <div key={kat.id} className="fn-card p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CategoryIconChip ikon={kat.ikon} warna={kat.warna} size={40} />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{kat.nama}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {kat.jenis === 'PEMASUKAN' ? 'Pemasukan' : 'Pengeluaran'} • Profil: {kat.profil_target}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(kat.id)}
              aria-label={`Hapus ${kat.nama}`}
              className="p-2 rounded-xl border hover:opacity-80 cursor-pointer"
              style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}
            >
              <Trash size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
