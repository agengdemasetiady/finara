'use client';

import React, { useEffect, useRef } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  Cell,
  Legend,
} from 'recharts';
import { formatRupiah } from '@/lib/format';
import type { TitikHarian, TrenBulanItem } from '@/lib/domain/ringkasan';

export function AnimatedRupiah({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || value === 0) {
      el.textContent = formatRupiah(value);
      return;
    }
    let rafId = 0;
    const t0 = performance.now();
    const dur = 750;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      const ease = 1 - Math.pow(1 - k, 4);
      el.textContent = formatRupiah(Math.round(value * ease));
      if (k < 1) rafId = requestAnimationFrame(step);
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [value]);

  return <span ref={ref}>{formatRupiah(value)}</span>;
}

export function SevenDayChart({ data }: { data: TitikHarian[] }) {
  return (
    <div className="h-36 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="hariSingkat"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted)', fontSize: 11 }}
          />
          <Tooltip
            cursor={{ fill: 'var(--primary-soft)', radius: 8 }}
            contentStyle={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border-strong)',
              borderRadius: 12,
              fontSize: 12,
              color: 'var(--ink)',
            }}
            formatter={(val: number) => [formatRupiah(val), 'Pengeluaran']}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.hariLengkap || ''}
          />
          <Bar dataKey="total" radius={[6, 6, 2, 2]} maxBarSize={32}>
            {data.map((entry, idx) => (
              <Cell
                key={entry.tanggal}
                fill={idx === data.length - 1 ? 'var(--primary)' : 'var(--bar-muted)'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function MonthlyTrendChart({ data }: { data: TrenBulanItem[] }) {
  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
          <XAxis
            dataKey="label"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted)', fontSize: 12 }}
          />
          <Tooltip
            cursor={{ fill: 'var(--primary-soft)', radius: 8 }}
            contentStyle={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border-strong)',
              borderRadius: 12,
              fontSize: 12,
              color: 'var(--ink)',
            }}
            formatter={(val: number, name: string) => [
              formatRupiah(val),
              name === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran',
            ]}
          />
          <Legend
            formatter={(val) => (val === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran')}
            wrapperStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="pemasukan" fill="var(--primary)" radius={[6, 6, 2, 2]} maxBarSize={24} />
          <Bar dataKey="pengeluaran" fill="var(--accent)" radius={[6, 6, 2, 2]} maxBarSize={24} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
