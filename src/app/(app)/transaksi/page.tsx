import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getNamaBulan } from '@/lib/format';
import { TransaksiClient } from '@/components/app/TransaksiClient';

export default async function TransaksiPage({
  searchParams,
}: {
  searchParams: Promise<{ bulan?: string; tahun?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  const { data: akun } = await supabase
    .from('akun')
    .select('profil, peran')
    .eq('id', user.id)
    .single();
  if (akun?.peran === 'admin') redirect('/admin');

  const resolvedParams = await searchParams;
  const now = new Date();
  const bulan = Math.min(12, Math.max(1, parseInt(resolvedParams.bulan || String(now.getMonth() + 1), 10)));
  const tahun = Math.min(2100, Math.max(2020, parseInt(resolvedParams.tahun || String(now.getFullYear()), 10)));

  const startDate = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
  const endDate =
    bulan === 12 ? `${tahun + 1}-01-01` : `${tahun}-${String(bulan + 1).padStart(2, '0')}-01`;
  const profil = akun?.profil || 'kos';

  const [{ data: transaksiList }, { data: kategoriList }] = await Promise.all([
    supabase
      .from('transaksi')
      .select('id, jumlah, jenis, tanggal, catatan, id_kategori')
      .eq('id_pengguna', user.id)
      .gte('tanggal', startDate)
      .lt('tanggal', endDate)
      .order('tanggal', { ascending: false })
      .order('dibuat_pada', { ascending: false }),
    supabase
      .from('kategori')
      .select('id, nama, jenis, ikon, warna')
      .or(`and(is_bawaan.eq.true,profil_target.in.(semua,${profil})),id_pengguna.eq.${user.id}`)
      .order('nama', { ascending: true }),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Riwayat Transaksi</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Catatan pemasukan dan pengeluaran {getNamaBulan(bulan)} {tahun}
        </p>
      </div>

      <TransaksiClient
        transactions={(transaksiList || []).map((t) => ({
          ...t,
          jumlah: Number(t.jumlah),
        }))}
        categories={kategoriList || []}
      />
    </div>
  );
}
