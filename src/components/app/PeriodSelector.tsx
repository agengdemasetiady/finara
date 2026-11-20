'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import { getNamaBulan } from '@/lib/format';

const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function PeriodSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const now = new Date();
  const urlBulan = Math.min(12, Math.max(1, parseInt(searchParams.get('bulan') || String(now.getMonth() + 1), 10)));
  const urlTahun = Math.min(2100, Math.max(2020, parseInt(searchParams.get('tahun') || String(now.getFullYear()), 10)));

  const [optimisticPeriod, setOptimisticPeriod] = useState({ bulan: urlBulan, tahun: urlTahun });

  useEffect(() => {
    setOptimisticPeriod({ bulan: urlBulan, tahun: urlTahun });
  }, [urlBulan, urlTahun]);

  function updatePeriod(nextBulan: number, nextTahun: number) {
    setOptimisticPeriod({ bulan: nextBulan, tahun: nextTahun });

    const params = new URLSearchParams(searchParams.toString());
    params.set('bulan', String(nextBulan));
    params.set('tahun', String(nextTahun));

    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function prevMonth() {
    if (optimisticPeriod.bulan === 1) {
      updatePeriod(12, optimisticPeriod.tahun - 1);
    } else {
      updatePeriod(optimisticPeriod.bulan - 1, optimisticPeriod.tahun);
    }
  }

  function nextMonth() {
    if (optimisticPeriod.bulan === 12) {
      updatePeriod(1, optimisticPeriod.tahun + 1);
    } else {
      updatePeriod(optimisticPeriod.bulan + 1, optimisticPeriod.tahun);
    }
  }

  const { bulan, tahun } = optimisticPeriod;

  return (
    <div
      className="inline-flex items-center gap-0.5 sm:gap-1 rounded-full px-1 sm:px-1.5 py-0.5 sm:py-1 border transition-opacity"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      <button
        type="button"
        onClick={prevMonth}
        aria-label="Bulan sebelumnya"
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full inline-flex items-center justify-center hover:opacity-80 active:scale-90 transition-transform cursor-pointer"
      >
        <CaretLeft size={15} weight="bold" />
      </button>

      <span
        className={`text-xs sm:text-sm font-semibold px-1.5 sm:px-2 min-w-[74px] sm:min-w-[116px] text-center fn-num whitespace-nowrap transition-opacity duration-150 ${
          isPending ? 'opacity-60' : 'opacity-100'
        }`}
      >
        <span className="sm:hidden">{BULAN_PENDEK[bulan - 1]} {tahun}</span>
        <span className="hidden sm:inline">{getNamaBulan(bulan)} {tahun}</span>
      </span>

      <button
        type="button"
        onClick={nextMonth}
        aria-label="Bulan berikutnya"
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-full inline-flex items-center justify-center hover:opacity-80 active:scale-90 transition-transform cursor-pointer"
      >
        <CaretRight size={15} weight="bold" />
      </button>
    </div>
  );
}