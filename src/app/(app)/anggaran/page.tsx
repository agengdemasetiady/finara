import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hitungProgresAnggaran } from '@/lib/domain/anggaran';
import { getNamaBulan } from '@/lib/format';
import { AnggaranClient } from '@/components/app/AnggaranClient';

export default async function AnggaranPage({
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

  const [{ data: anggaranList }, { data: transaksiList }, { data: kategoriList }] = await Promise.all([
    supabase
      .from('anggaran')
      .select('id, id_kategori, batas_jumlah')
      .eq('id_pengguna', user.id)
      .eq('bulan', bulan)
      .eq('tahun', tahun),
    supabase
      .from('transaksi')
      .select('id_kategori, jumlah, jenis')
      .eq('id_pengguna', user.id)
      .eq('jenis', 'PENGELUARAN')
      .gte('tanggal', startDate)
      .lt('tanggal', endDate),
    supabase
      .from('kategori')
      .select('id, nama, jenis, ikon, warna')
      .eq('jenis', 'PENGELUARAN')
      .or(`and(is_bawaan.eq.true,profil_target.in.(semua,${profil})),id_pengguna.eq.${user.id}`)
      .order('nama', { ascending: true }),
  ]);

  const kats = kategoriList || [];
  const katMap = new Map(kats.map((k) => [k.id, k]));

  const items = (anggaranList || []).map((a) => {
    const kat = katMap.get(a.id_kategori);
    const trxKat = (transaksiList || []).filter((t) => t.id_kategori === a.id_kategori);
    const prog = hitungProgresAnggaran(a.batas_jumlah, trxKat);
    return {
      id: a.id,
      idKategori: a.id_kategori,
      nama: kat?.nama || 'Kategori',
      ikon: kat?.ikon || 'Wallet',
      warna: kat?.warna || '#0B5C46',
      ...prog,
    };
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Anggaran per Kategori</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Atur batas pengeluaran {getNamaBulan(bulan)} {tahun}. Peringatan aktif otomatis di 80% dan 100%.
        </p>
      </div>

      <AnggaranClient
        bulan={bulan}
        tahun={tahun}
        items={items}
        expenseCategories={kats.map((k) => ({ id: k.id, nama: k.nama }))}
      />
    </div>
  );
}
