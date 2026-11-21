'use client';

import React, { useEffect, useState } from 'react';

function getSapaanWaktu(hour: number): string {
  if (hour >= 4 && hour < 11) return 'Selamat pagi';
  if (hour >= 11 && hour < 15) return 'Selamat siang';
  if (hour >= 15 && hour < 18) return 'Selamat sore';
  return 'Selamat malam';
}

export function DashboardGreeting({
  nama,
  subtitle,
}: {
  nama: string;
  subtitle: string;
}) {
  const [sapaan, setSapaan] = useState('Halo');

  useEffect(() => {
    setSapaan(getSapaanWaktu(new Date().getHours()));
  }, []);

  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
      <div>
        <h1 className="fn-display text-2xl sm:text-3xl font-semibold">
          {sapaan}, {nama || 'Teman Finara'}
        </h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          {subtitle}
        </p>
      </div>
    </div>
  );
}
