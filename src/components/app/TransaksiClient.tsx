'use client';

import React, { useMemo, useState } from 'react';
import { MagnifyingGlass, PencilSimple, Trash, X } from '@phosphor-icons/react';
import { ubahTransaksi, hapusTransaksi } from '@/lib/actions/transaksi';
import { useToast } from '@/components/ui/ToastProvider';
import { CategoryIconChip } from '@/components/ui/CategoryIcon';
import { formatAngka, formatHariKelompok, formatRupiah, getTodayISO } from '@/lib/format';
import type { JenisTrx } from '@/lib/types/database';
import type { SimpleCategory } from './QuickTransactionModal';

export interface TransaksiRow {
  id: string;
  jumlah: number;
  jenis: JenisTrx;
  tanggal: string;
  catatan: string | null;
  id_kategori: string;
}

export function TransaksiClient({
  transactions,
  categories,
}: {
  transactions: TransaksiRow[];
  categories: SimpleCategory[];
}) {
  const { showToast } = useToast();
  const [jenisFilter, setJenisFilter] = useState<'SEMUA' | JenisTrx>('SEMUA');
  const [katFilter, setKatFilter] = useState<string>('SEMUA');
  const [search, setSearch] = useState('');

  // State modal edit
  const [editing, setEditing] = useState<TransaksiRow | null>(null);
  const [editJenis, setEditJenis] = useState<JenisTrx>('PENGELUARAN');
  const [editDigits, setEditDigits] = useState('');
  const [editKat, setEditKat] = useState('');
  const [editTanggal, setEditTanggal] = useState('');
  const [editCatatan, setEditCatatan] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Konfirmasi hapus
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const katMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return transactions.filter((t) => {
      if (jenisFilter !== 'SEMUA' && t.jenis !== jenisFilter) return false;
      if (katFilter !== 'SEMUA' && t.id_kategori !== katFilter) return false;
      if (q) {
        const katNama = (katMap.get(t.id_kategori)?.nama || '').toLowerCase();
        const note = (t.catatan || '').toLowerCase();
        if (!katNama.includes(q) && !note.includes(q)) return false;
      }
      return true;
    });
  }, [transactions, jenisFilter, katFilter, search, katMap]);

  // Kelompokkan per tanggal
  const grouped = useMemo(() => {
    const groups = new Map<string, TransaksiRow[]>();
    for (const item of filtered) {
      const arr = groups.get(item.tanggal) || [];
      arr.push(item);
      groups.set(item.tanggal, arr);
    }
    return Array.from(groups.entries());
  }, [filtered]);

  function openEdit(t: TransaksiRow) {
    setEditing(t);
    setEditJenis(t.jenis);
    setEditDigits(String(Math.round(t.jumlah)));
    setEditKat(t.id_kategori);
    setEditTanggal(t.tanggal);
    setEditCatatan(t.catatan || '');
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const nominal = parseInt(editDigits || '0', 10);
    if (nominal <= 0) {
      showToast('Nominal harus lebih dari 0.', 'error');
      return;
    }

    setSavingEdit(true);
    const res = await ubahTransaksi(editing.id, {
      jumlah: nominal,
      jenis: editJenis,
      tanggal: editTanggal,
      catatan: editCatatan.trim() || null,
      id_kategori: editKat,
    });
    setSavingEdit(false);

    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }

    showToast(res.message, 'success');
    if (res.warning) showToast(res.warning, 'warning');
    setEditing(null);
  }

  async function handleDelete(id: string) {
    const res = await hapusTransaksi(id);
    setDeletingId(null);
    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }
    showToast(res.message, 'success');
  }

  const todayISO = getTodayISO();
  const editFilteredCats = categories.filter((c) => c.jenis === editJenis);

  return (
    <div className="flex flex-col gap-5">
      {/* Filter & Pencarian */}
      <div className="fn-card p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          {(
            [
              { id: 'SEMUA', label: 'Semua' },
              { id: 'PENGELUARAN', label: 'Pengeluaran' },
              { id: 'PEMASUKAN', label: 'Pemasukan' },
            ] as const
          ).map((tab) => {
            const active = jenisFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setJenisFilter(tab.id)}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border cursor-pointer"
                style={{
                  backgroundColor: active ? 'var(--primary)' : 'var(--bg)',
                  color: active ? 'var(--on-primary)' : 'var(--muted)',
                  borderColor: active ? 'var(--primary)' : 'var(--border)',
                }}
              >
                {tab.label}
              </button>
            );
          })}

          <select
            aria-label="Filter kategori"
            value={katFilter}
            onChange={(e) => setKatFilter(e.target.value)}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--ink)' }}
          >
            <option value="SEMUA">Semua kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="relative md:w-64">
          <MagnifyingGlass
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--muted)' }}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari catatan atau kategori..."
            className="fn-input pl-9 min-h-[40px] text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Daftar Transaksi Dikelompokkan per Hari */}
      {grouped.length === 0 ? (
        <div className="fn-card p-8 text-center">
          <p className="fn-display text-lg font-semibold">Tidak ada transaksi ditemukan</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Coba ubah filter atau catat transaksi baru untuk periode ini.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(([tanggal, items]) => {
            const totalKeluarHari = items
              .filter((i) => i.jenis === 'PENGELUARAN')
              .reduce((s, i) => s + Math.round(i.jumlah), 0);

            return (
              <section key={tanggal} className="fn-card overflow-hidden">
                <div
                  className="px-4 sm:px-5 py-3 border-b flex items-center justify-between text-xs font-semibold"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  <span>{formatHariKelompok(tanggal, todayISO)}</span>
                  {totalKeluarHari > 0 && (
                    <span className="fn-num">Keluar {formatRupiah(totalKeluarHari)}</span>
                  )}
                </div>

                <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {items.map((t) => {
                    const kat = katMap.get(t.id_kategori);
                    const isMasuk = t.jenis === 'PEMASUKAN';
                    return (
                      <li
                        key={t.id}
                        className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <CategoryIconChip ikon={kat?.ikon} warna={kat?.warna} size={40} />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{kat?.nama || 'Lainnya'}</p>
                            {t.catatan && (
                              <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>
                                {t.catatan}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                          <span
                            className="text-sm sm:text-base font-semibold fn-num"
                            style={{ color: isMasuk ? 'var(--primary)' : 'var(--ink)' }}
                          >
                            {isMasuk ? '+' : '−'}
                            {formatRupiah(t.jumlah)}
                          </span>

                          <button
                            type="button"
                            onClick={() => openEdit(t)}
                            aria-label="Edit transaksi"
                            className="p-2 rounded-xl border hover:opacity-80 cursor-pointer"
                            style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                          >
                            <PencilSimple size={16} />
                          </button>

                          {deletingId === t.id ? (
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleDelete(t.id)}
                                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer"
                                style={{ backgroundColor: 'var(--danger)' }}
                              >
                                Hapus
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingId(null)}
                                className="px-2 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer"
                                style={{ borderColor: 'var(--border)' }}
                              >
                                Batal
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setDeletingId(t.id)}
                              aria-label="Hapus transaksi"
                              className="p-2 rounded-xl border hover:opacity-80 cursor-pointer"
                              style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}
                            >
                              <Trash size={16} />
                            </button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      {/* Modal Edit Transaksi */}
      {editing && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(13, 23, 19, 0.55)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setEditing(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-trx-title"
            className="w-full max-w-md rounded-3xl p-6 border shadow-xl"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="edit-trx-title" className="fn-display text-lg font-semibold">
                Edit transaksi
              </h2>
              <button
                type="button"
                onClick={() => setEditing(null)}
                aria-label="Tutup"
                className="w-8 h-8 rounded-full inline-flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 p-1 rounded-full" style={{ backgroundColor: 'var(--bg)' }}>
                {(['PENGELUARAN', 'PEMASUKAN'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setEditJenis(item);
                      const first = categories.find((c) => c.jenis === item);
                      if (first) setEditKat(first.id);
                    }}
                    className="py-2 rounded-full text-xs font-semibold cursor-pointer"
                    style={{
                      backgroundColor: editJenis === item ? 'var(--primary)' : 'transparent',
                      color: editJenis === item ? 'var(--on-primary)' : 'var(--muted)',
                    }}
                  >
                    {item === 'PENGELUARAN' ? 'Pengeluaran' : 'Pemasukan'}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Nominal (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={editDigits ? formatAngka(editDigits) : ''}
                  onChange={(e) => setEditDigits(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  className="fn-input font-semibold fn-num"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Kategori</label>
                <select
                  value={editKat}
                  onChange={(e) => setEditKat(e.target.value)}
                  className="fn-input"
                >
                  {editFilteredCats.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tanggal</label>
                <input
                  type="date"
                  value={editTanggal}
                  onChange={(e) => setEditTanggal(e.target.value)}
                  className="fn-input"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Catatan</label>
                <input
                  type="text"
                  maxLength={200}
                  value={editCatatan}
                  onChange={(e) => setEditCatatan(e.target.value)}
                  placeholder="Opsional"
                  className="fn-input"
                />
              </div>

              <button type="submit" disabled={savingEdit} className="fn-btn fn-btn-primary w-full mt-1">
                {savingEdit ? 'Menyimpan...' : 'Simpan perubahan'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
