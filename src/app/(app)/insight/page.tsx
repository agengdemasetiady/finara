import React from 'react';
import { redirect } from 'next/navigation';
import { subMonths, format, differenceInCalendarDays, parseISO } from 'date-fns';
import { Lightbulb, TrendUp, Scales, CalendarCheck } from '@phosphor-icons/react/dist/ssr';
import { createClient } from '@/lib/supabase/server';
import { hitungRingkasan, hitungPengeluaranPerKategori } from '@/lib/domain/ringkasan';
import { hitungProgresAnggaran } from '@/lib/domain/anggaran';
import { buatInsight } from '@/lib/domain/insight';
import { getNamaBulan, getTodayISO } from '@/lib/format';
import type { ProfilTipe } from '@/lib/types/database';

export default async function InsightPage({
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

  const startCurrent = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
  const endCurrent =
    bulan === 12 ? `${tahun + 1}-01-01` : `${tahun}-${String(bulan + 1).padStart(2, '0')}-01`;
  const startPrev = format(subMonths(new Date(tahun, bulan - 1, 1), 1), 'yyyy-MM-01');

  const [{ data: trxList }, { data: kategoriList }, { data: anggaranList }, { data: tagihanList }] =
    await Promise.all([
      supabase
        .from('transaksi')
        .select('jumlah, jenis, tanggal, id_kategori')
        .eq('id_pengguna', user.id)
        .gte('tanggal', startPrev)
        .lt('tanggal', endCurrent),
      supabase
        .from('kategori')
        .select('id, nama, ikon, warna')
        .or(`is_bawaan.eq.true,id_pengguna.eq.${user.id}`),
      supabase
        .from('anggaran')
        .select('id_kategori, batas_jumlah')
        .eq('id_pengguna', user.id)
        .eq('bulan', bulan)
        .eq('tahun', tahun),
      supabase
        .from('pengingat_tagihan')
        .select('nama, tanggal_jatuh_tempo')
        .eq('id_pengguna', user.id)
        .eq('aktif', true)
        .order('tanggal_jatuh_tempo', { ascending: true })
        .limit(1),
    ]);

  const allTrx = trxList || [];
  const trxBulanIni = allTrx.filter((t) => t.tanggal >= startCurrent && t.tanggal < endCurrent);
  const trxBulanLalu = allTrx.filter((t) => t.tanggal >= startPrev && t.tanggal < startCurrent);
  const kats = kategoriList || [];

  const profil = (akun?.profil as ProfilTipe | null) || null;
  const ringkasan = hitungRingkasan(trxBulanIni, profil);
  const ringkasanLalu = hitungRingkasan(trxBulanLalu, profil);
  const breakdown = hitungPengeluaranPerKategori(trxBulanIni, kats);

  const anggaranItems = (anggaranList || []).map((a) =>
    hitungProgresAnggaran(
      a.batas_jumlah,
      trxBulanIni.filter((t) => t.id_kategori === a.id_kategori)
    )
  );
  const totalBatasAnggaran = anggaranItems.reduce((s, a) => s + a.batas, 0);
  const totalTerpakaiAnggaran = anggaranItems.reduce((s, a) => s + a.terpakai, 0);

  const todayISO = getTodayISO();
  const nextBill = tagihanList?.[0];
  const tagihanTerdekat = nextBill
    ? {
        nama: nextBill.nama,
        selisihHari: differenceInCalendarDays(parseISO(nextBill.tanggal_jatuh_tempo), parseISO(todayISO)),
      }
    : null;

  const bahanBakuKatIds = new Set(
    kats.filter((k) => k.nama.toLowerCase().includes('bahan baku')).map((k) => k.id)
  );
  const biayaBahanBakuBulanIni = trxBulanIni
    .filter((t) => t.jenis === 'PENGELUARAN' && bahanBakuKatIds.has(t.id_kategori))
    .reduce((s, t) => s + Math.round(Number(t.jumlah)), 0);
  const biayaBahanBakuBulanLalu = trxBulanLalu
    .filter((t) => t.jenis === 'PENGELUARAN' && bahanBakuKatIds.has(t.id_kategori))
    .reduce((s, t) => s + Math.round(Number(t.jumlah)), 0);

  const hasil = buatInsight({
    profil,
    pemasukanBulanIni: ringkasan.pemasukan,
    pengeluaranBulanIni: ringkasan.pengeluaran,
    pengeluaranBulanLalu: ringkasanLalu.pengeluaran,
    breakdownKategori: breakdown,
    totalBatasAnggaran,
    totalTerpakaiAnggaran,
    tanggalReferensiISO: todayISO,
    tagihanTerdekat,
    biayaBahanBakuBulanIni,
    biayaBahanBakuBulanLalu,
  });

  const iconMap: Record<string, React.ReactNode> = {
    'banding-bulan-lalu': <Scales size={24} weight="duotone" />,
    'kategori-terbesar': <TrendUp size={24} weight="duotone" />,
    'batas-harian': <CalendarCheck size={24} weight="duotone" />,
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Insight Otomatis</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Dihitung langsung dari catatan transaksi {getNamaBulan(bulan)} {tahun} dengan aturan yang jelas.
        </p>
      </div>

      {/* Ringkasan Utama Sesuai Profil */}
      <div
        className="fn-card p-6 flex items-start gap-4"
        style={{ backgroundColor: 'var(--primary-soft)', borderColor: 'var(--border-strong)' }}
      >
        <span
          className="p-3 rounded-2xl shrink-0"
          style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
        >
          <Lightbulb size={26} weight="fill" />
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--primary)' }}>
            Saran utama untuk profilmu
          </p>
          <p className="fn-display text-lg sm:text-xl font-semibold mt-1 leading-snug">
            {hasil.ringkas}
          </p>
        </div>
      </div>

      {/* 3 Kartu Analisis */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {hasil.kartu.map((k) => (
          <article key={k.id} className="fn-card p-5 sm:p-6 flex flex-col justify-between gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                {k.judul}
              </span>
              <span style={{ color: 'var(--primary)' }}>{iconMap[k.id]}</span>
            </div>

            <div>
              <p className="fn-display text-2xl font-bold fn-num">{k.angkaUtama}</p>
              <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--muted)' }}>
                {k.penjelasan}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
