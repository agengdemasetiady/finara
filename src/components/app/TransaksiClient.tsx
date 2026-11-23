'use client';

import React, { useMemo, useState, useEffect, useRef, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
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

const FILTER_TABS = [
  { id: 'SEMUA', label: 'Semua' },
  { id: 'PENGELUARAN', label: 'Pengeluaran' },
  { id: 'PEMASUKAN', label: 'Pemasukan' },
] as const;

const JENIS_OPTIONS = ['PENGELUARAN', 'PEMASUKAN'] as const;

function AnimatedRupiah({
  value,
  startFromZero = false,
}: {
  value: number;
  startFromZero?: boolean;
}) {
  const target = Math.round(value);
  const [displayValue, setDisplayValue] = useState<number>(startFromZero ? 0 : target);
  const prevTargetRef = useRef<number>(startFromZero ? 0 : target);

  useEffect(() => {
    const from = prevTargetRef.current;
    if (from === target) {
      setDisplayValue(target);
      return;
    }

    let rafId = 0;
    const duration = 550;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVal = Math.round(from + (target - from) * eased);
      prevTargetRef.current = nextVal;
      setDisplayValue(nextVal);

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        prevTargetRef.current = target;
        setDisplayValue(target);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target]);

  return <>{formatRupiah(displayValue)}</>;
}

export function TransaksiClient({
  transactions,
  categories,
}: {
  transactions: TransaksiRow[];
  categories: SimpleCategory[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startRefresh] = useTransition();
  const [localTransactions, setLocalTransactions] = useState<TransaksiRow[]>(transactions);
  const [highlightedIds, setHighlightedIds] = useState<Record<string, boolean>>({});
  const [isSyncingNew, setIsSyncingNew] = useState<boolean>(() =>
    typeof window !== 'undefined' ? (window.__finaraPendingSyncCount || 0) > 0 : false
  );
  const [filterPulse, setFilterPulse] = useState(false);
  const prevTransactionsRef = useRef<TransaksiRow[]>(transactions);

  const [jenisFilter, setJenisFilter] = useState<'SEMUA' | JenisTrx>('SEMUA');
  const [katFilter, setKatFilter] = useState<string>('SEMUA');
  const [search, setSearch] = useState('');
  const [filterInteracting, setFilterInteracting] = useState(false);
  const interactTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const filterPulseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const editDialogRef = useRef<HTMLDivElement>(null);

  const [editing, setEditing] = useState<TransaksiRow | null>(null);
  const [editJenis, setEditJenis] = useState<JenisTrx>('PENGELUARAN');
  const [editDigits, setEditDigits] = useState('');
  const [editKat, setEditKat] = useState('');
  const [editTanggal, setEditTanggal] = useState('');
  const [editCatatan, setEditCatatan] = useState('');
  const [editAmountEditable, setEditAmountEditable] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setLocalTransactions(transactions);

    if (prevTransactionsRef.current !== transactions) {
      const oldIds = new Set(prevTransactionsRef.current.map((t) => t.id));
      const newIds = transactions.filter((t) => !oldIds.has(t.id)).map((t) => t.id);
      prevTransactionsRef.current = transactions;

      if (newIds.length > 0) {
        setHighlightedIds((prev) => {
          const next = { ...prev };
          for (const id of newIds) next[id] = true;
          return next;
        });
        setTimeout(() => {
          setHighlightedIds((prev) => {
            const copy = { ...prev };
            for (const id of newIds) delete copy[id];
            return copy;
          });
        }, 2000);
      }

      setIsSyncingNew(false);
      if (typeof window !== 'undefined') {
        window.__finaraPendingSyncCount = 0;
      }
    }
  }, [transactions]);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined' && (window.__finaraPendingSyncCount || 0) > 0) {
      setIsSyncingNew(true);
    }

    function onSyncState(e: Event) {
      const count = (e as CustomEvent<{ pendingCount: number }>).detail?.pendingCount ?? 0;
      setIsSyncingNew(count > 0);
    }

    function onClearCache() {
      setLocalTransactions([]);
      setHighlightedIds({});
      setIsSyncingNew(false);
    }

    window.addEventListener('finara:trx-sync-state', onSyncState);
    window.addEventListener('finara:clear-cache', onClearCache);

    return () => {
      if (interactTimerRef.current) clearTimeout(interactTimerRef.current);
      if (filterPulseTimerRef.current) clearTimeout(filterPulseTimerRef.current);
      window.removeEventListener('finara:trx-sync-state', onSyncState);
      window.removeEventListener('finara:clear-cache', onClearCache);
    };
  }, []);

  function triggerMicroFilterBeat() {
    setFilterPulse(true);
    if (filterPulseTimerRef.current) clearTimeout(filterPulseTimerRef.current);
    filterPulseTimerRef.current = setTimeout(() => {
      setFilterPulse(false);
    }, 130);
  }

  function triggerFilterScrollbar() {
    setFilterInteracting(true);
    if (interactTimerRef.current) clearTimeout(interactTimerRef.current);
    interactTimerRef.current = setTimeout(() => {
      setFilterInteracting(false);
    }, 1200);
  }

  const katMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return localTransactions.filter((t) => {
      if (jenisFilter !== 'SEMUA' && t.jenis !== jenisFilter) return false;
      if (katFilter !== 'SEMUA' && t.id_kategori !== katFilter) return false;
      if (q) {
        const katNama = (katMap.get(t.id_kategori)?.nama || '').toLowerCase();
        const note = (t.catatan || '').toLowerCase();
        if (!katNama.includes(q) && !note.includes(q)) return false;
      }
      return true;
    });
  }, [localTransactions, jenisFilter, katFilter, search, katMap]);

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
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setEditAmountEditable(false);
    setEditing(t);
    setEditJenis(t.jenis);
    setEditDigits(String(Math.round(t.jumlah)));
    setEditKat(t.id_kategori);
    setEditTanggal(t.tanggal);
    setEditCatatan(t.catatan || '');
    requestAnimationFrame(() => {
      editDialogRef.current?.focus({ preventScroll: true });
    });
  }

  function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const nominal = parseInt(editDigits || '0', 10);
    if (nominal <= 0) {
      showToast('Nominal harus lebih dari 0.', 'error');
      return;
    }

    const targetId = editing.id;
    const snapshot = localTransactions;
    const payload = {
      jumlah: nominal,
      jenis: editJenis,
      tanggal: editTanggal,
      catatan: editCatatan.trim() || null,
      id_kategori: editKat,
    };

    setHighlightedIds((prev) => ({ ...prev, [targetId]: true }));
    setLocalTransactions((prev) =>
      prev
        .map((row) => (row.id === targetId ? { ...row, ...payload } : row))
        .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    );
    setEditing(null);
    showToast('Transaksi diperbarui.', 'success');

    setTimeout(() => {
      setHighlightedIds((prev) => {
        const copy = { ...prev };
        delete copy[targetId];
        return copy;
      });
    }, 1800);

    void ubahTransaksi(targetId, payload).then((res) => {
      if (!res.ok) {
        setLocalTransactions(snapshot);
        showToast(res.message, 'error');
        return;
      }
      if (res.warning) showToast(res.warning, 'warning');
      startRefresh(() => {
        router.refresh();
      });
    });
  }

  function handleDelete(id: string) {
    const snapshot = localTransactions;
    setLocalTransactions((prev) => prev.filter((row) => row.id !== id));
    setDeletingId(null);
    showToast('Transaksi dihapus.', 'success');

    void hapusTransaksi(id).then((res) => {
      if (!res.ok) {
        setLocalTransactions(snapshot);
        showToast(res.message, 'error');
        return;
      }
      startRefresh(() => {
        router.refresh();
      });
    });
  }

  const todayISO = getTodayISO();
  const editFilteredCats = categories.filter((c) => c.jenis === editJenis);

  return (
    <div className="flex flex-col gap-5">
      <style>{`
        @keyframes fnTrxSlideIn {
          from {
            opacity: 0;
            transform: translate3d(0, -10px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .fn-trx-row-enter {
          animation: fnTrxSlideIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* Filter & Pencarian */}
      <div className="fn-card p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div
          onScroll={triggerFilterScrollbar}
          onTouchStart={triggerFilterScrollbar}
          onPointerDown={triggerFilterScrollbar}
          onMouseEnter={() => setFilterInteracting(true)}
          onMouseLeave={() => setFilterInteracting(false)}
          className={`flex items-center gap-2 overflow-x-auto py-0.5 ${
            filterInteracting
              ? '[scrollbar-width:thin]'
              : '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          }`}
        >
          {FILTER_TABS.map((tab) => {
            const active = jenisFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  if (jenisFilter !== tab.id) {
                    setJenisFilter(tab.id);
                    triggerMicroFilterBeat();
                  }
                }}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border cursor-pointer transition-colors"
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
            onChange={(e) => {
              setKatFilter(e.target.value);
              triggerMicroFilterBeat();
            }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer shrink-0"
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
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--muted)' }}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari catatan atau kategori..."
            style={{ paddingLeft: '2.5rem' }}
            className="fn-input min-h-[40px] text-xs sm:text-sm"
          />
        </div>
      </div>

      {/* Skeleton Singkat saat Transaksi Baru Sedang Disimpan ke Server */}
      {isSyncingNew && (
        <section
          aria-busy="true"
          aria-label="Menyimpan transaksi terbaru"
          className="fn-card overflow-hidden animate-pulse"
        >
          <div
            className="px-4 sm:px-5 py-3 border-b flex items-center justify-between text-xs font-semibold"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--primary)' }}
          >
            <span className="inline-flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full animate-ping"
                style={{ backgroundColor: 'var(--primary)' }}
              />
              Menyimpan transaksi terbaru...
            </span>
            <div className="h-3 w-20 rounded-md" style={{ backgroundColor: 'var(--border)' }} />
          </div>
          <div className="px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-2xl shrink-0" style={{ backgroundColor: 'var(--bg)' }} />
              <div className="space-y-2 flex-1 max-w-[180px]">
                <div className="h-3.5 w-28 rounded-lg" style={{ backgroundColor: 'var(--border)' }} />
                <div className="h-3 w-20 rounded-lg" style={{ backgroundColor: 'var(--bg)' }} />
              </div>
            </div>
            <div className="h-4 w-24 rounded-lg shrink-0" style={{ backgroundColor: 'var(--border)' }} />
          </div>
        </section>
      )}

      {/* Micro-Skeleton saat Ganti Filter */}
      {filterPulse ? (
        <div className="fn-card overflow-hidden animate-pulse">
          <div className="px-5 py-3 border-b" style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}>
            <div className="h-3.5 w-32 rounded-lg" style={{ backgroundColor: 'var(--border)' }} />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-12 rounded-2xl" style={{ backgroundColor: 'var(--bg)' }} />
            <div className="h-12 rounded-2xl" style={{ backgroundColor: 'var(--bg)' }} />
            <div className="h-12 rounded-2xl" style={{ backgroundColor: 'var(--bg)' }} />
          </div>
        </div>
      ) : grouped.length === 0 ? (
        !isSyncingNew && (
          <div className="fn-card p-8 text-center">
            <p className="fn-display text-lg font-semibold">Tidak ada transaksi ditemukan</p>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
              Coba ubah filter atau catat transaksi baru untuk periode ini.
            </p>
          </div>
        )
      ) : (
        <div className="flex flex-col gap-4">
          {grouped.map(([tanggal, items]) => {
            const totalKeluarHari = items
              .filter((i) => i.jenis === 'PENGELUARAN')
              .reduce((s, i) => s + Math.round(i.jumlah), 0);
            const hasNewExpenseInGroup = items.some(
              (i) => i.jenis === 'PENGELUARAN' && Boolean(highlightedIds[i.id])
            );

            return (
              <section key={tanggal} className="fn-card overflow-hidden">
                <div
                  className="px-4 sm:px-5 py-3 border-b flex items-center justify-between text-xs font-semibold"
                  style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--muted)' }}
                >
                  <span>{formatHariKelompok(tanggal, todayISO)}</span>
                  {totalKeluarHari > 0 && (
                    <span className="fn-num">
                      Keluar{' '}
                      <AnimatedRupiah
                        value={totalKeluarHari}
                        startFromZero={hasNewExpenseInGroup && items.length === 1}
                      />
                    </span>
                  )}
                </div>

                <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {items.map((t) => {
                    const kat = katMap.get(t.id_kategori);
                    const isMasuk = t.jenis === 'PEMASUKAN';
                    const isHighlighted = Boolean(highlightedIds[t.id]);

                    return (
                      <li
                        key={t.id}
                        className={`px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3 transition-colors duration-700 ${
                          isHighlighted ? 'fn-trx-row-enter' : ''
                        }`}
                        style={{
                          backgroundColor: isHighlighted ? 'var(--primary-soft)' : 'transparent',
                        }}
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
                            {isMasuk ? '+' : '\u2212'}
                            <AnimatedRupiah value={t.jumlah} startFromZero={isHighlighted} />
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
      {mounted &&
        editing &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4"
            style={{ backgroundColor: 'rgba(13, 23, 19, 0.55)', backdropFilter: 'blur(4px)' }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setEditing(null);
            }}
          >
            <div
              ref={editDialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-trx-title"
              tabIndex={-1}
              className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] border-t sm:border shadow-2xl max-h-[90dvh] overflow-y-auto focus:outline-none"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div
                className="w-10 h-1 rounded-full mx-auto mb-4 sm:hidden opacity-40"
                style={{ backgroundColor: 'var(--muted)' }}
              />

              <div className="flex items-center justify-between mb-4">
                <h2 id="edit-trx-title" className="fn-display text-lg font-semibold">
                  Edit transaksi
                </h2>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  aria-label="Tutup"
                  className="w-8 h-8 rounded-full inline-flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: 'var(--bg)' }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="flex flex-col gap-3.5">
                <div className="grid grid-cols-2 p-1 rounded-full" style={{ backgroundColor: 'var(--bg)' }}>
                  {JENIS_OPTIONS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setEditJenis(item);
                        const first = categories.find((c) => c.jenis === item);
                        if (first) setEditKat(first.id);
                      }}
                      className="py-2 rounded-full text-xs font-semibold cursor-pointer transition-colors"
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
                    readOnly={!editAmountEditable}
                    onPointerDown={() => setEditAmountEditable(true)}
                    onFocus={() => setEditAmountEditable(true)}
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

                <button type="submit" className="fn-btn fn-btn-primary w-full mt-2">
                  Simpan perubahan
                </button>
              </form>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}