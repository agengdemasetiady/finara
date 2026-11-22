'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Eye, EyeSlash } from '@phosphor-icons/react';
import { formatRupiah } from '@/lib/format';
import type { JenisTrx } from '@/lib/types/database';

interface DashboardSaldoCardProps {
  labelSaldo: string;
  saldo: number;
  pemasukan: number;
  pengeluaran: number;
  bulan: number;
  tahun: number;
}

interface PendingDeltaItem {
  id: string;
  jumlah: number;
  jenis: JenisTrx;
  tanggal: string;
  confirmed: boolean;
}

function RollingRupiah({ value }: { value: number }) {
  const target = Math.round(value);
  const [display, setDisplay] = useState<number>(target);
  const currentValRef = useRef<number>(target);

  useEffect(() => {
    const startVal = currentValRef.current;
    if (startVal === target) {
      setDisplay(target);
      return;
    }

    let rafId = 0;
    const duration = 600;
    const startTime = performance.now();

    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const next = Math.round(startVal + (target - startVal) * eased);
      currentValRef.current = next;
      setDisplay(next);

      if (progress < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        currentValRef.current = target;
        setDisplay(target);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [target]);

  return <>{formatRupiah(display)}</>;
}

export function DashboardSaldoCard({
  labelSaldo,
  saldo,
  pemasukan,
  pengeluaran,
  bulan,
  tahun,
}: DashboardSaldoCardProps) {
  const [hidden, setHidden] = useState(false);
  const [pendingItems, setPendingItems] = useState<PendingDeltaItem[]>([]);

  useEffect(() => {
    try {
      if (localStorage.getItem('finara-hide-saldo') === '1') {
        setHidden(true);
      }
    } catch {
      // Abaikan jika storage dibatasi
    }
  }, []);

  // Bersihkan item yang sudah terkonfirmasi ketika prop server terbaru masuk
  useEffect(() => {
    setPendingItems((prev) => prev.filter((item) => !item.confirmed));
  }, [saldo, pemasukan, pengeluaran]);

  useEffect(() => {
    function onOptimisticAdd(e: Event) {
      const detail = (
        e as CustomEvent<{
          id: string;
          jumlah: number;
          jenis: JenisTrx;
          tanggal: string;
        }>
      ).detail;
      if (!detail) return;

      setPendingItems((prev) => [
        ...prev.filter((item) => item.id !== detail.id),
        {
          id: detail.id,
          jumlah: Math.round(Number(detail.jumlah)),
          jenis: detail.jenis,
          tanggal: detail.tanggal,
          confirmed: false,
        },
      ]);
    }

    function onConfirmed(e: Event) {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (!id) return;
      setPendingItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, confirmed: true } : item))
      );
      setTimeout(() => {
        setPendingItems((prev) => prev.filter((item) => item.id !== id));
      }, 2500);
    }

    function onRollback(e: Event) {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (!id) return;
      setPendingItems((prev) => prev.filter((item) => item.id !== id));
    }

    function onClearCache() {
      setPendingItems([]);
    }

    window.addEventListener('finara:trx-optimistic-add', onOptimisticAdd);
    window.addEventListener('finara:trx-confirmed', onConfirmed);
    window.addEventListener('finara:trx-rollback', onRollback);
    window.addEventListener('finara:clear-cache', onClearCache);

    return () => {
      window.removeEventListener('finara:trx-optimistic-add', onOptimisticAdd);
      window.removeEventListener('finara:trx-confirmed', onConfirmed);
      window.removeEventListener('finara:trx-rollback', onRollback);
      window.removeEventListener('finara:clear-cache', onClearCache);
    };
  }, []);

  function toggleHidden() {
    setHidden((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('finara-hide-saldo', next ? '1' : '0');
      } catch {
        // Abaikan jika storage dibatasi
      }
      return next;
    });
  }

  const { effectiveSaldo, effectivePemasukan, effectivePengeluaran } = useMemo(() => {
    const startCurrent = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
    const endCurrent =
      bulan === 12 ? `${tahun + 1}-01-01` : `${tahun}-${String(bulan + 1).padStart(2, '0')}-01`;

    let extraMasuk = 0;
    let extraKeluar = 0;

    for (const item of pendingItems) {
      if (item.tanggal >= startCurrent && item.tanggal < endCurrent) {
        if (item.jenis === 'PEMASUKAN') {
          extraMasuk += item.jumlah;
        } else {
          extraKeluar += item.jumlah;
        }
      }
    }

    return {
      effectivePemasukan: pemasukan + extraMasuk,
      effectivePengeluaran: pengeluaran + extraKeluar,
      effectiveSaldo: saldo + extraMasuk - extraKeluar,
    };
  }, [saldo, pemasukan, pengeluaran, pendingItems, bulan, tahun]);

  return (
    <section
      aria-labelledby="card-saldo-title"
      className="fn-card p-5 sm:p-6 md:col-span-3 flex flex-col justify-between gap-5"
    >
      <div>
        <p
          id="card-saldo-title"
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: 'var(--muted)' }}
        >
          {labelSaldo}
        </p>

        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="fn-display text-3xl sm:text-4xl font-bold fn-num min-w-0 truncate">
            {hidden ? 'Rp ••••••' : <RollingRupiah value={effectiveSaldo} />}
          </p>

          <button
            type="button"
            onClick={toggleHidden}
            aria-label={hidden ? `Tampilkan ${labelSaldo}` : `Sembunyikan ${labelSaldo}`}
            aria-pressed={hidden}
            title={hidden ? 'Tampilkan nominal' : 'Sembunyikan nominal'}
            className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full inline-flex items-center justify-center border active:scale-95 transition-all cursor-pointer"
            style={{
              backgroundColor: hidden ? 'var(--primary-soft)' : 'var(--bg)',
              borderColor: hidden ? 'var(--primary)' : 'var(--border)',
              color: hidden ? 'var(--primary)' : 'var(--muted)',
            }}
          >
            {hidden ? <EyeSlash size={18} weight="bold" /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-3.5" style={{ backgroundColor: 'var(--bg)' }}>
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--muted)' }}>
            <ArrowDownRight size={16} weight="bold" style={{ color: 'var(--primary)' }} />
            <span>Pemasukan</span>
          </div>
          <p className="text-base sm:text-lg font-semibold mt-1 fn-num">
            {hidden ? 'Rp ••••••' : <RollingRupiah value={effectivePemasukan} />}
          </p>
        </div>

        <div className="rounded-2xl p-3.5" style={{ backgroundColor: 'var(--bg)' }}>
          <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--muted)' }}>
            <ArrowUpRight size={16} weight="bold" style={{ color: 'var(--accent-strong)' }} />
            <span>Pengeluaran</span>
          </div>
          <p className="text-base sm:text-lg font-semibold mt-1 fn-num">
            {hidden ? 'Rp ••••••' : <RollingRupiah value={effectivePengeluaran} />}
          </p>
        </div>
      </div>
    </section>
  );
}
