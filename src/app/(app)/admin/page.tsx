import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Users, Receipt, Tag, ShieldCheck } from '@phosphor-icons/react/dist/ssr';
import { createClient } from '@/lib/supabase/server';
import type { StatistikSistem } from '@/lib/types/database';

export default async function AdminOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  const { data: akun } = await supabase
    .from('akun')
    .select('peran, aktif')
    .eq('id', user.id)
    .single();

  if (!akun || akun.peran !== 'admin' || !akun.aktif) {
    redirect('/dashboard');
  }

  const { data: statsRaw } = await supabase.rpc('statistik_sistem');
  const stats = (statsRaw as StatistikSistem | null) || {
    pengguna_per_profil: {},
    total_pengguna: 0,
    total_transaksi: 0,
  };

  const perProfil = stats.pengguna_per_profil || {};

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Statistik Sistem</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Ringkasan agregat platform Finara. Catatan keuangan pribadi pengguna terisolasi.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="fn-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            <span>Total pengguna</span>
            <Users size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <p className="fn-display text-3xl font-bold mt-2 fn-num">{stats.total_pengguna}</p>
        </div>

        <div className="fn-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            <span>Total transaksi tercatat</span>
            <Receipt size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <p className="fn-display text-3xl font-bold mt-2 fn-num">{stats.total_transaksi}</p>
        </div>

        <div className="fn-card p-5">
          <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--muted)' }}>
            <span>Sebaran profil</span>
            <ShieldCheck size={20} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="mt-2 flex flex-col gap-1 text-xs font-medium">
            <div className="flex justify-between">
              <span>Pelajar</span>
              <strong className="fn-num">{perProfil.pelajar || 0}</strong>
            </div>
            <div className="flex justify-between">
              <span>Anak kos</span>
              <strong className="fn-num">{perProfil.kos || 0}</strong>
            </div>
            <div className="flex justify-between">
              <span>UMKM</span>
              <strong className="fn-num">{perProfil.umkm || 0}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/admin/pengguna" className="fn-card fn-card-hover p-5 flex items-center gap-4">
          <span
            className="p-3 rounded-2xl"
            style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
          >
            <Users size={24} weight="duotone" />
          </span>
          <div>
            <h2 className="fn-display text-base font-semibold">Kelola Akun Pengguna</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              Lihat daftar akun dan aktifkan atau nonaktifkan akses masuk.
            </p>
          </div>
        </Link>

        <Link href="/admin/kategori" className="fn-card fn-card-hover p-5 flex items-center gap-4">
          <span
            className="p-3 rounded-2xl"
            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
          >
            <Tag size={24} weight="duotone" />
          </span>
          <div>
            <h2 className="fn-display text-base font-semibold">Kelola Kategori Bawaan</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
              Atur kategori contoh untuk profil Pelajar, Anak Kos, dan UMKM.
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
