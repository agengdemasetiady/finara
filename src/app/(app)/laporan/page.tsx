import React from 'react';
import { redirect } from 'next/navigation';
import { FilePdf, FileCsv } from '@phosphor-icons/react/dist/ssr';
import { createClient } from '@/lib/supabase/server';
import { hitungRingkasan } from '@/lib/domain/ringkasan';
import { formatRupiah, getNamaBulan } from '@/lib/format';
import type { ProfilTipe } from '@/lib/types/database';

export default async function LaporanPage({
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
    .select('profil')
    .eq('id', user.id)
    .single();

  const resolvedParams = await searchParams;
  const now = new Date();
  const bulan = Math.min(12, Math.max(1, parseInt(resolvedParams.bulan || String(now.getMonth() + 1), 10)));
  const tahun = Math.min(2100, Math.max(2020, parseInt(resolvedParams.tahun || String(now.getFullYear()), 10)));

  const startDate = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
  const endDate =
    bulan === 12 ? `${tahun + 1}-01-01` : `${tahun}-${String(bulan + 1).padStart(2, '0')}-01`;

  const { data: trxList } = await supabase
    .from('transaksi')
    .select('jumlah, jenis')
    .eq('id_pengguna', user.id)
    .gte('tanggal', startDate)
    .lt('tanggal', endDate);

  const ringkasan = hitungRingkasan(trxList || [], (akun?.profil as ProfilTipe | null) || null);
  const namaBulan = getNamaBulan(bulan);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Unduh Laporan</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Ekspor ringkasan dan daftar transaksi periode {namaBulan} {tahun}.
        </p>
      </div>

      {/* Ringkasan Periode Terpilih */}
      <div className="fn-card p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            Total pemasukan
          </p>
          <p className="fn-display text-xl font-bold mt-1 fn-num" style={{ color: 'var(--primary)' }}>
            {formatRupiah(ringkasan.pemasukan)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            Total pengeluaran
          </p>
          <p className="fn-display text-xl font-bold mt-1 fn-num">
            {formatRupiah(ringkasan.pengeluaran)}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
            {ringkasan.labelSaldo}
          </p>
          <p className="fn-display text-xl font-bold mt-1 fn-num">
            {formatRupiah(ringkasan.saldo)}
          </p>
        </div>
      </div>

      {/* Dua Kartu Unduh Besar (PDF & CSV) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <article className="fn-card p-6 flex flex-col justify-between gap-5">
          <div className="flex items-start gap-4">
            <span
              className="p-3 rounded-2xl shrink-0"
              style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
            >
              <FilePdf size={30} weight="duotone" />
            </span>
            <div>
              <h2 className="fn-display text-lg font-semibold">Laporan Ringkasan PDF</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                Dokumen rapi berisi ringkasan saldo, pengeluaran terbesar per kategori, dan tabel transaksi {namaBulan}{' '}
                {tahun}.
              </p>
            </div>
          </div>

          <a
            href={`/api/laporan/pdf?bulan=${bulan}&tahun=${tahun}`}
            download
            className="fn-btn fn-btn-primary self-start"
          >
            Unduh PDF ({namaBulan} {tahun})
          </a>
        </article>

        <article className="fn-card p-6 flex flex-col justify-between gap-5">
          <div className="flex items-start gap-4">
            <span
              className="p-3 rounded-2xl shrink-0"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
            >
              <FileCsv size={30} weight="duotone" />
            </span>
            <div>
              <h2 className="fn-display text-lg font-semibold">Data Transaksi CSV</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
                File spreadsheet mentah berisi tanggal, jenis, kategori, nominal, dan catatan untuk dibuka di Excel atau
                Google Sheets.
              </p>
            </div>
          </div>

          <a
            href={`/api/laporan/csv?bulan=${bulan}&tahun=${tahun}`}
            download
            className="fn-btn fn-btn-ghost self-start"
          >
            Unduh CSV ({namaBulan} {tahun})
          </a>
        </article>
      </div>
    </div>
  );
}
