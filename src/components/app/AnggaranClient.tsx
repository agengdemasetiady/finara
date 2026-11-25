'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export interface ExpenseCategoryOption {
  id: string;
  nama: string;
  ikon?: string;
  warna?: string;
  terpakai?: number;
}

function hitungProgresLokal(batas: number, terpakai: number) {
  const sisa = batas - terpakai;
  const persentase = batas > 0 ? Math.round((terpakai / batas) * 100) : 0;
  const status: StatusAnggaran =
    persentase >= 100 ? 'terlampaui' : persentase >= 80 ? 'hampir_habis' : 'aman';
  return { batas, terpakai, sisa, persentase, status };
}

function AnggaranCardSkeleton() {
  return (
    <article
      aria-hidden="true"
      className="fn-card p-5 flex flex-col gap-3.5 animate-pulse"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-10 h-10 rounded-2xl shrink-0"
            style={{ backgroundColor: 'var(--primary-soft)' }}
          />
          <div className="flex flex-col gap-2 flex-1 max-w-[190px]">
            <div
              className="h-4 w-28 rounded-md"
              style={{ backgroundColor: 'var(--primary-soft)' }}
            />
            <div
              className="h-3 w-40 rounded-md"
              style={{ backgroundColor: 'var(--primary-soft)' }}
            />
          </div>
        </div>
        <div
          className="w-8 h-8 rounded-xl shrink-0"
          style={{ backgroundColor: 'var(--primary-soft)' }}
        />
      </div>

      <div>
        <div className="flex justify-between mb-2">
          <div
            className="h-3 w-20 rounded-md"
            style={{ backgroundColor: 'var(--primary-soft)' }}
          />
          <div
            className="h-3 w-24 rounded-md"
            style={{ backgroundColor: 'var(--primary-soft)' }}
          />
        </div>
        <div
          className="h-2.5 w-full rounded-full"
          style={{ backgroundColor: 'var(--primary-soft)' }}
        />
      </div>
    </article>
  );
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
  expenseCategories: ExpenseCategoryOption[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [localItems, setLocalItems] = useState<AnggaranItemView[]>(items);
  const [removingIds, setRemovingIds] = useState<Record<string, boolean>>({});
  const [pendingSkeletons, setPendingSkeletons] = useState<string[]>([]);
  const [updatingKatIds, setUpdatingKatIds] = useState<Record<string, boolean>>({});
  const pendingCountRef = useRef(0);
  const deleteLockRef = useRef<Record<string, boolean>>({});

  const [selectedKat, setSelectedKat] = useState(expenseCategories[0]?.id || '');
  const [batasDigits, setBatasDigits] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (pendingCountRef.current > 0) return;
    setLocalItems(items);
  }, [items]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;

    const batas = parseInt(batasDigits || '0', 10);
    if (!selectedKat) {
      showToast('Pilih kategori pengeluaran.', 'error');
      return;
    }
    if (batas <= 0) {
      showToast('Batas anggaran harus lebih dari 0.', 'error');
      return;
    }

    const targetKat = selectedKat;
    const cat = expenseCategories.find((c) => c.id === targetKat);
    const existing = localItems.find((item) => item.idKategori === targetKat);
    const skeletonId = `skeleton-${Date.now()}`;

    setBatasDigits('');
    setSaving(true);
    pendingCountRef.current += 1;

    if (existing) {
      setUpdatingKatIds((prev) => ({ ...prev, [targetKat]: true }));
    } else {
      setPendingSkeletons((prev) => [...prev, skeletonId]);
    }

    const res = await simpanAnggaran({
      id_kategori: targetKat,
      bulan,
      tahun,
      batas_jumlah: batas,
    });

    pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
    setSaving(false);

    if (existing) {
      setUpdatingKatIds((prev) => {
        const next = { ...prev };
        delete next[targetKat];
        return next;
      });
    } else {
      setPendingSkeletons((prev) => prev.filter((id) => id !== skeletonId));
    }

    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }

    if (existing) {
      const prog = hitungProgresLokal(batas, existing.terpakai);
      setLocalItems((prev) =>
        prev.map((item) =>
          item.idKategori === targetKat ? { ...item, ...prog } : item
        )
      );
    } else {
      const terpakaiAwal = cat?.terpakai ?? 0;
      const prog = hitungProgresLokal(batas, terpakaiAwal);
      const savedItem: AnggaranItemView = {
        id: `temp-${Date.now()}`,
        idKategori: targetKat,
        nama: cat?.nama || 'Kategori',
        ikon: cat?.ikon || 'Wallet',
        warna: cat?.warna || '#0B5C46',
        ...prog,
      };
      setLocalItems((prev) => [...prev, savedItem]);
    }

    router.refresh();
    showToast(res.message, 'success');
  }

  async function handleDelete(id: string) {
    if (id.startsWith('temp-')) return;
    if (deleteLockRef.current[id]) return;

    deleteLockRef.current[id] = true;
    const snapshot = localItems;
    setDeletingId(null);
    setRemovingIds((prev) => ({ ...prev, [id]: true }));
    showToast('Anggaran dihapus.', 'success');

    window.setTimeout(() => {
      setLocalItems((prev) => prev.filter((item) => item.id !== id));
      setRemovingIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 180);

    pendingCountRef.current += 1;
    const res = await hapusAnggaran(id);
    pendingCountRef.current = Math.max(0, pendingCountRef.current - 1);
    delete deleteLockRef.current[id];

    if (!res.ok) {
      setRemovingIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      setLocalItems(snapshot);
      showToast(res.message, 'error');
      return;
    }

    router.refresh();
  }

  const hasCards = localItems.length > 0 || pendingSkeletons.length > 0;

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

        <button
          type="submit"
          disabled={saving}
          className="fn-btn fn-btn-primary shrink-0 active:scale-95 transition-transform"
        >
          <Plus size={18} weight="bold" />
          <span>{saving ? 'Menyimpan...' : 'Simpan batas'}</span>
        </button>
      </form>

      {/* Kartu Anggaran per Kategori */}
      {!hasCards ? (
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
          {localItems.map((item) => {
            if (updatingKatIds[item.idKategori]) {
              return <AnggaranCardSkeleton key={item.id} />;
            }

            const isRemoving = Boolean(removingIds[item.id]);
            const isTemp = item.id.startsWith('temp-');
            const barColor =
              item.status === 'terlampaui'
                ? 'var(--danger)'
                : item.status === 'hampir_habis'
                  ? 'var(--accent-strong)'
                  : 'var(--primary)';

            return (
              <article
                key={item.id}
                className={`fn-card p-5 flex flex-col gap-3.5 transition-all duration-200 ${
                  isRemoving ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'
                }`}
              >
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
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer active:scale-95 transition-transform"
                        style={{ backgroundColor: 'var(--danger)' }}
                      >
                        Hapus
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        className="px-2 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer active:scale-95 transition-transform"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      disabled={isTemp}
                      onClick={() => setDeletingId(item.id)}
                      aria-label={`Hapus anggaran ${item.nama}`}
                      className="p-2 rounded-xl border hover:opacity-80 active:scale-95 transition-all duration-150 cursor-pointer shrink-0 disabled:opacity-40 disabled:pointer-events-none"
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

          {pendingSkeletons.map((skeletonId) => (
            <AnggaranCardSkeleton key={skeletonId} />
          ))}
        </div>
      )}
    </div>
  );
}