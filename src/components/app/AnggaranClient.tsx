'use client';

import React, { useState } from 'react';
import { Plus, Trash, Warning } from '@phosphor-icons/react';
import { simpanAnggaran, hapusAnggaran } from '@/lib/actions/anggaran';
import { useToast } from '@/components/ui/ToastProvider';
import { CategoryIconChip } from '@/components/ui/CategoryIcon';
import { formatAngka, formatRupiah, getNamaBulan } from '@/lib/format';
import type { StatusAnggaran } from '@/lib/domain/anggaran';

export interface AnggaranItemView {
  id: string;
  idKategori: string;
  nama: string;
  ikon: string;
  warna: string;
  batas: number;
  terpakai: number;
  sisa: number;
  persentase: number;
  status: StatusAnggaran;
}

export function AnggaranClient({
  bulan,
  tahun,
  items,
  expenseCategories,
}: {
  bulan: number;
  tahun: number;
  items: AnggaranItemView[];
  expenseCategories: Array<{ id: string; nama: string }>;
}) {
  const { showToast } = useToast();
  const [selectedKat, setSelectedKat] = useState(expenseCategories[0]?.id || '');
  const [batasDigits, setBatasDigits] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const batas = parseInt(batasDigits || '0', 10);
    if (!selectedKat) {
      showToast('Pilih kategori pengeluaran.', 'error');
      return;
    }
    if (batas <= 0) {
      showToast('Batas anggaran harus lebih dari 0.', 'error');
      return;
    }

    setSaving(true);
    const res = await simpanAnggaran({
      id_kategori: selectedKat,
      bulan,
      tahun,
      batas_jumlah: batas,
    });
    setSaving(false);

    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }

    setBatasDigits('');
    showToast(res.message, 'success');
  }

  async function handleDelete(id: string) {
    const res = await hapusAnggaran(id);
    setDeletingId(null);
    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }
    showToast(res.message, 'success');
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Form Atur Batas Anggaran */}
      <form onSubmit={handleSave} className="fn-card p-5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Kategori pengeluaran
          </label>
          <select
            value={selectedKat}
            onChange={(e) => setSelectedKat(e.target.value)}
            className="fn-input"
          >
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Batas bulanan (Rp)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={batasDigits ? formatAngka(batasDigits) : ''}
            onChange={(e) => setBatasDigits(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="Contoh: 500.000"
            className="fn-input fn-num"
          />
        </div>

        <button type="submit" disabled={saving} className="fn-btn fn-btn-primary shrink-0">
          <Plus size={18} weight="bold" />
          <span>{saving ? 'Menyimpan...' : 'Simpan batas'}</span>
        </button>
      </form>

      {/* Kartu Anggaran per Kategori */}
      {items.length === 0 ? (
        <div className="fn-card p-8 text-center">
          <p className="fn-display text-lg font-semibold">
            Belum ada anggaran untuk {getNamaBulan(bulan)} {tahun}
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Pilih kategori di atas dan masukkan batas pengeluaran bulananmu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => {
            const barColor =
              item.status === 'terlampaui'
                ? 'var(--danger)'
                : item.status === 'hampir_habis'
                  ? 'var(--accent-strong)'
                  : 'var(--primary)';

            return (
              <article key={item.id} className="fn-card p-5 flex flex-col gap-3.5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIconChip ikon={item.ikon} warna={item.warna} size={40} />
                    <div className="min-w-0">
                      <h2 className="fn-display text-base font-semibold truncate">{item.nama}</h2>
                      <p className="text-xs fn-num" style={{ color: 'var(--muted)' }}>
                        Terpakai {formatRupiah(item.terpakai)} dari {formatRupiah(item.batas)}
                      </p>
                    </div>
                  </div>

                  {deletingId === item.id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
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
                      onClick={() => setDeletingId(item.id)}
                      aria-label={`Hapus anggaran ${item.nama}`}
                      className="p-2 rounded-xl border hover:opacity-80 cursor-pointer shrink-0"
                      style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}
                    >
                      <Trash size={16} />
                    </button>
                  )}
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1.5 fn-num">
                    <span style={{ color: barColor }}>{item.persentase}% terpakai</span>
                    <span style={{ color: item.sisa < 0 ? 'var(--danger)' : 'var(--muted)' }}>
                      {item.sisa >= 0
                        ? `Sisa ${formatRupiah(item.sisa)}`
                        : `Lebih ${formatRupiah(Math.abs(item.sisa))}`}
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--primary-soft)' }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, item.persentase)}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>

                {item.status !== 'aman' && (
                  <div
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium"
                    style={{
                      backgroundColor:
                        item.status === 'terlampaui'
                          ? 'color-mix(in srgb, var(--danger) 12%, transparent)'
                          : 'var(--accent-soft)',
                      color: item.status === 'terlampaui' ? 'var(--danger)' : 'var(--accent-strong)',
                    }}
                  >
                    <Warning size={16} weight="fill" className="shrink-0" />
                    <span>
                      {item.status === 'terlampaui'
                        ? 'Pengeluaran sudah melewati batas anggaran.'
                        : 'Pengeluaran sudah mencapai 80% dari batas anggaran.'}
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
