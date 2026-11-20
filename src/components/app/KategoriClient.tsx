'use client';

import React, { useState } from 'react';
import { Lock, Plus, Trash } from '@phosphor-icons/react';
import { buatKategori, hapusKategori } from '@/lib/actions/kategori';
import { useToast } from '@/components/ui/ToastProvider';
import {
  AVAILABLE_COLORS,
  AVAILABLE_ICONS,
  CategoryIconChip,
  renderPhosphorIcon,
} from '@/components/ui/CategoryIcon';
import type { JenisTrx, Kategori } from '@/lib/types/database';

export function KategoriClient({ categories }: { categories: Kategori[] }) {
  const { showToast } = useToast();
  const [tab, setTab] = useState<JenisTrx>('PENGELUARAN');
  const [nama, setNama] = useState('');
  const [ikon, setIkon] = useState('ForkKnife');
  const [warna, setWarna] = useState('#0B5C46');
  const [saving, setSaving] = useState(false);

  const filtered = categories.filter((c) => c.jenis === tab);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (nama.trim().length < 2) {
      showToast('Nama kategori minimal 2 karakter.', 'error');
      return;
    }

    setSaving(true);
    const res = await buatKategori({
      nama: nama.trim(),
      jenis: tab,
      ikon,
      warna,
    });
    setSaving(false);

    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }

    setNama('');
    showToast(res.message, 'success');
  }

  async function handleDelete(id: string) {
    const res = await hapusKategori(id);
    if (!res.ok) showToast(res.message, 'error');
    else showToast(res.message, 'success');
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Segmented Tabs */}
      <div
        className="inline-flex p-1 rounded-full self-start"
        style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {(['PENGELUARAN', 'PEMASUKAN'] as const).map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setTab(item)}
            className="px-4 py-2 rounded-full text-xs sm:text-sm font-semibold cursor-pointer"
            style={{
              backgroundColor: tab === item ? 'var(--primary)' : 'transparent',
              color: tab === item ? 'var(--on-primary)' : 'var(--muted)',
            }}
          >
            {item === 'PENGELUARAN' ? 'Pengeluaran' : 'Pemasukan'}
          </button>
        ))}
      </div>

      {/* Form Tambah Kategori Kustom */}
      <form onSubmit={handleAdd} className="fn-card p-5 flex flex-col gap-4">
        <h2 className="fn-display text-base font-semibold">
          Tambah kategori {tab === 'PENGELUARAN' ? 'pengeluaran' : 'pemasukan'} pribadi
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
              Nama kategori
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Kopi & Nongkrong"
              className="fn-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
              Warna
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {AVAILABLE_COLORS.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  onClick={() => setWarna(hex)}
                  aria-label={`Pilih warna ${hex}`}
                  className="w-8 h-8 rounded-full border-2 transition-transform cursor-pointer"
                  style={{
                    backgroundColor: hex,
                    borderColor: warna === hex ? 'var(--ink)' : 'transparent',
                    transform: warna === hex ? 'scale(1.12)' : 'scale(1)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Pilih ikon
          </label>
          <div className="grid grid-cols-6 sm:grid-cols-13 gap-2">
            {AVAILABLE_ICONS.map((ic) => {
              const active = ikon === ic.name;
              return (
                <button
                  key={ic.name}
                  type="button"
                  onClick={() => setIkon(ic.name)}
                  title={ic.label}
                  className="h-10 rounded-xl border inline-flex items-center justify-center cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--primary-soft)' : 'var(--bg)',
                    borderColor: active ? 'var(--primary)' : 'var(--border)',
                    color: active ? 'var(--primary)' : 'var(--ink)',
                  }}
                >
                  {renderPhosphorIcon(ic.name, 20)}
                </button>
              );
            })}
          </div>
        </div>

        <button type="submit" disabled={saving} className="fn-btn fn-btn-primary self-start">
          <Plus size={18} weight="bold" />
          <span>{saving ? 'Menyimpan...' : 'Tambah kategori'}</span>
        </button>
      </form>

      {/* Daftar Kategori */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((kat) => (
          <div key={kat.id} className="fn-card p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <CategoryIconChip ikon={kat.ikon} warna={kat.warna} size={40} />
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{kat.nama}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {kat.is_bawaan ? 'Kategori bawaan' : 'Kategori pribadi'}
                </p>
              </div>
            </div>

            {kat.is_bawaan ? (
              <span title="Kategori bawaan tidak dapat dihapus" style={{ color: 'var(--muted)' }}>
                <Lock size={16} />
              </span>
            ) : (
              <button
                type="button"
                onClick={() => handleDelete(kat.id)}
                aria-label={`Hapus kategori ${kat.nama}`}
                className="p-2 rounded-xl border hover:opacity-80 cursor-pointer"
                style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}
              >
                <Trash size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
