import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  ArrowUpRight,
  ArrowDownRight,
  Lightbulb,
  Plus,
  Receipt,
  PiggyBank,
  Wallet,
} from '@phosphor-icons/react/dist/ssr';
import { subMonths, format, differenceInCalendarDays, parseISO } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { sinkronkanNotifikasiTagihan } from '@/lib/actions/tagihan';
import {
  hitungRingkasan,
  hitungPengeluaranPerKategori,
  hitungPengeluaran7Hari,
  hitungTrenBulanan,
} from '@/lib/domain/ringkasan';
import { hitungProgresAnggaran } from '@/lib/domain/anggaran';
import { hitungProgresTabungan } from '@/lib/domain/tabungan';
import { buatInsight } from '@/lib/domain/insight';
import { formatRupiah, getNamaBulan, getTodayISO, formatTanggal } from '@/lib/format';
import { CategoryIconChip } from '@/components/ui/CategoryIcon';
import { AnimatedRupiah, SevenDayChart, MonthlyTrendChart } from '@/components/app/DashboardCharts';
import { DashboardGreeting } from '@/components/app/DashboardGreeting';
import type { ProfilTipe } from '@/lib/types/database';

export default async function DashboardPage({
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
    .select('id, nama, profil, peran')
    .eq('id', user.id)
    .single();

  if (!akun) redirect('/masuk');
  if (akun.peran === 'admin') redirect('/admin');

  await sinkronkanNotifikasiTagihan();

  const resolvedParams = await searchParams;
  const now = new Date();
  const bulan = Math.min(12, Math.max(1, parseInt(resolvedParams.bulan || String(now.getMonth() + 1), 10)));
  const tahun = Math.min(2100, Math.max(2020, parseInt(resolvedParams.tahun || String(now.getFullYear()), 10)));

  const startCurrent = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
  const endCurrent =
    bulan === 12 ? `${tahun + 1}-01-01` : `${tahun}-${String(bulan + 1).padStart(2, '0')}-01`;

  const prevAnchor = subMonths(new Date(tahun, bulan - 1, 1), 1);
  const startPrev = format(prevAnchor, 'yyyy-MM-01');
  const sixMonthsStart = format(subMonths(new Date(tahun, bulan - 1, 1), 5), 'yyyy-MM-01');

  const [
    { data: trx6Bulan },
    { data: kategoriList },
    { data: anggaranList },
    { data: targetList },
    { data: setoranList },
    { data: tagihanList },
  ] = await Promise.all([
    supabase
      .from('transaksi')
      .select('id, jumlah, jenis, tanggal, catatan, id_kategori')
      .eq('id_pengguna', user.id)
      .gte('tanggal', sixMonthsStart)
      .lt('tanggal', endCurrent)
      .order('tanggal', { ascending: false }),
    supabase
      .from('kategori')
      .select('id, nama, jenis, ikon, warna')
      .or(`is_bawaan.eq.true,id_pengguna.eq.${user.id}`),
    supabase
      .from('anggaran')
      .select('id, id_kategori, batas_jumlah')
      .eq('id_pengguna', user.id)
      .eq('bulan', bulan)
      .eq('tahun', tahun),
    supabase
      .from('target_tabungan')
      .select('id, nama, target_jumlah, tanggal')
      .eq('id_pengguna', user.id),
    supabase
      .from('setoran_tabungan')
      .select('id, id_target, jumlah, tanggal'),
    supabase
      .from('pengingat_tagihan')
      .select('id, nama, jumlah, tanggal_jatuh_tempo, aktif')
      .eq('id_pengguna', user.id)
      .eq('aktif', true)
      .order('tanggal_jatuh_tempo', { ascending: true })
      .limit(3),
  ]);

  const allTrx = trx6Bulan || [];
  const trxBulanIni = allTrx.filter((t) => t.tanggal >= startCurrent && t.tanggal < endCurrent);
  const trxBulanLalu = allTrx.filter((t) => t.tanggal >= startPrev && t.tanggal < startCurrent);
  const kats = kategoriList || [];
  const katMap = new Map(kats.map((k) => [k.id, k]));

  const profil = (akun.profil as ProfilTipe | null) || null;
  const ringkasan = hitungRingkasan(trxBulanIni, profil);
  const ringkasanLalu = hitungRingkasan(trxBulanLalu, profil);
  const breakdown = hitungPengeluaranPerKategori(trxBulanIni, kats);
  const todayISO = getTodayISO();
  const data7Hari = hitungPengeluaran7Hari(allTrx, todayISO, 'PENGELUARAN');
  const total7Hari = data7Hari.reduce((s, d) => s + d.total, 0);
  const tren6Bulan = hitungTrenBulanan(allTrx, bulan, tahun, 6);

  const anggaranItems = (anggaranList || []).map((a) => {
    const kat = katMap.get(a.id_kategori);
    const trxKat = trxBulanIni.filter((t) => t.id_kategori === a.id_kategori);
    const prog = hitungProgresAnggaran(a.batas_jumlah, trxKat);
    return {
      id: a.id,
      nama: kat?.nama || 'Kategori',
      ikon: kat?.ikon || 'Wallet',
      warna: kat?.warna || '#0B5C46',
      ...prog,
    };
  });

  const totalBatasAnggaran = anggaranItems.reduce((s, a) => s + a.batas, 0);
  const totalTerpakaiAnggaran = anggaranItems.reduce((s, a) => s + a.terpakai, 0);

  const primaryTarget = (targetList || [])[0] || null;
  const primaryProgres = primaryTarget
    ? hitungProgresTabungan(
        primaryTarget.target_jumlah,
        (setoranList || []).filter((s) => s.id_target === primaryTarget.id)
      )
    : null;

  const tagihanItems = (tagihanList || []).map((t) => {
    const selisihHari = differenceInCalendarDays(parseISO(t.tanggal_jatuh_tempo), parseISO(todayISO));
    return { ...t, selisihHari };
  });

  const bahanBakuKatIds = new Set(
    kats.filter((k) => k.nama.toLowerCase().includes('bahan baku')).map((k) => k.id)
  );
  const biayaBahanBakuBulanIni = trxBulanIni
    .filter((t) => t.jenis === 'PENGELUARAN' && bahanBakuKatIds.has(t.id_kategori))
    .reduce((s, t) => s + Math.round(Number(t.jumlah)), 0);
  const biayaBahanBakuBulanLalu = trxBulanLalu
    .filter((t) => t.jenis === 'PENGELUARAN' && bahanBakuKatIds.has(t.id_kategori))
    .reduce((s, t) => s + Math.round(Number(t.jumlah)), 0);

  const insight = buatInsight({
    profil,
    pemasukanBulanIni: ringkasan.pemasukan,
    pengeluaranBulanIni: ringkasan.pengeluaran,
    pengeluaranBulanLalu: ringkasanLalu.pengeluaran,
    breakdownKategori: breakdown,
    totalBatasAnggaran,
    totalTerpakaiAnggaran,
    tanggalReferensiISO: todayISO,
    tagihanTerdekat: tagihanItems[0]
      ? { nama: tagihanItems[0].nama, selisihHari: tagihanItems[0].selisihHari }
      : null,
    biayaBahanBakuBulanIni,
    biayaBahanBakuBulanLalu,
  });

  const isEmpty = trxBulanIni.length === 0;

  return (
    <div className="flex flex-col gap-5">
      <DashboardGreeting
        nama={akun.nama || 'Teman Finara'}
        subtitle={`Ringkasan keuangan ${getNamaBulan(bulan)} ${tahun}`}
      />

      {isEmpty && (
        <div
          className="fn-card p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{ backgroundColor: 'var(--primary-soft)', borderColor: 'var(--border-strong)' }}
        >
          <div>
            <h2 className="fn-display text-lg font-semibold" style={{ color: 'var(--primary)' }}>
              Belum ada catatan di {getNamaBulan(bulan)} {tahun}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--ink)' }}>
              Catat pemasukan atau pengeluaran pertamamu dalam 3 langkah. Gunakan tombol Catat di atas atau tekan tombol N.
            </p>
          </div>
          <Link href="/transaksi" className="fn-btn fn-btn-primary shrink-0">
            <Plus size={18} weight="bold" />
            <span>Buka Transaksi</span>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <section aria-labelledby="card-saldo-title" className="fn-card p-5 sm:p-6 md:col-span-3 flex flex-col justify-between gap-5">
          <div>
            <p id="card-saldo-title" className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              {ringkasan.labelSaldo}
            </p>
            <p className="fn-display text-3xl sm:text-4xl font-bold mt-2 fn-num">
              <AnimatedRupiah value={ringkasan.saldo} />
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-3.5" style={{ backgroundColor: 'var(--bg)' }}>
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--muted)' }}>
                <ArrowDownRight size={16} weight="bold" style={{ color: 'var(--primary)' }} />
                <span>Pemasukan</span>
              </div>
              <p className="text-base sm:text-lg font-semibold mt-1 fn-num">
                {formatRupiah(ringkasan.pemasukan)}
              </p>
            </div>

            <div className="rounded-2xl p-3.5" style={{ backgroundColor: 'var(--bg)' }}>
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--muted)' }}>
                <ArrowUpRight size={16} weight="bold" style={{ color: 'var(--accent-strong)' }} />
                <span>Pengeluaran</span>
              </div>
              <p className="text-base sm:text-lg font-semibold mt-1 fn-num">
                {formatRupiah(ringkasan.pengeluaran)}
              </p>
            </div>
          </div>
        </section>

        <section aria-labelledby="card-7hari-title" className="fn-card p-5 sm:p-6 md:col-span-3 flex flex-col justify-between gap-3">
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <h2 id="card-7hari-title" className="fn-display text-base font-semibold">
                Pengeluaran 7 hari
              </h2>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                7 hari terakhir hingga hari ini
              </p>
            </div>
            <span className="text-sm font-semibold fn-num">{formatRupiah(total7Hari)}</span>
          </div>

          <SevenDayChart data={data7Hari} />
        </section>

        <section aria-labelledby="card-kat-title" className="fn-card p-5 sm:p-6 md:col-span-3 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 id="card-kat-title" className="fn-display text-base font-semibold">
              Pengeluaran per kategori
            </h2>
            <Link href="/transaksi" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              Semua transaksi
            </Link>
          </div>

          {breakdown.length === 0 ? (
            <p className="text-sm py-6 text-center" style={{ color: 'var(--muted)' }}>
              Belum ada pengeluaran tercatat pada periode ini.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {breakdown.slice(0, 4).map((item) => (
                <div key={item.idKategori} className="flex items-center gap-3">
                  <CategoryIconChip ikon={item.ikon} warna={item.warna} size={34} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2 text-xs font-semibold mb-1">
                      <span className="truncate">{item.nama}</span>
                      <span className="fn-num shrink-0">
                        {formatRupiah(item.total)} ({item.persentase}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--primary-soft)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, item.persentase)}%`,
                          backgroundColor: item.warna || 'var(--primary)',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section aria-labelledby="card-ang-title" className="fn-card p-5 sm:p-6 md:col-span-3 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 id="card-ang-title" className="fn-display text-base font-semibold">
              Anggaran bulan ini
            </h2>
            <Link href="/anggaran" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              Atur anggaran
            </Link>
          </div>

          {anggaranItems.length === 0 ? (
            <div className="py-4 flex flex-col items-start gap-2">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Tetapkan batas bulanan agar pengeluaran tiap kategori terkendali.
              </p>
              <Link href="/anggaran" className="fn-btn fn-btn-ghost text-xs py-2 px-4 min-h-[38px]">
                <Wallet size={16} />
                <span>Buat anggaran</span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3.5">
              {anggaranItems.slice(0, 3).map((ang) => {
                const barColor =
                  ang.status === 'terlampaui'
                    ? 'var(--danger)'
                    : ang.status === 'hampir_habis'
                      ? 'var(--accent-strong)'
                      : 'var(--primary)';
                return (
                  <div key={ang.id}>
                    <div className="flex items-baseline justify-between text-xs font-semibold mb-1">
                      <span>{ang.nama}</span>
                      <span className="fn-num" style={{ color: barColor }}>
                        {formatRupiah(ang.terpakai)} / {formatRupiah(ang.batas)} ({ang.persentase}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--primary-soft)' }}>
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, ang.persentase)}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section
          aria-labelledby="card-insight-title"
          className="fn-card p-5 sm:p-6 md:col-span-2 flex flex-col justify-between gap-4"
          style={{ backgroundColor: 'var(--primary-soft)', borderColor: 'var(--border-strong)' }}
        >
          <div className="flex items-start gap-3">
            <span
              className="p-2.5 rounded-2xl shrink-0"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
            >
              <Lightbulb size={22} weight="fill" />
            </span>
            <div>
              <h2 id="card-insight-title" className="fn-display text-base font-semibold">
                Insight otomatis
              </h2>
              <p className="text-sm mt-1.5 leading-relaxed">{insight.ringkas}</p>
            </div>
          </div>

          <Link href="/insight" className="text-xs font-semibold hover:underline self-start" style={{ color: 'var(--primary)' }}>
            Lihat analisis lengkap →
          </Link>
        </section>

        <section aria-labelledby="card-tabungan-title" className="fn-card p-5 sm:p-6 md:col-span-2 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 id="card-tabungan-title" className="fn-display text-base font-semibold">
              Target tabungan
            </h2>
            <Link href="/tabungan" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              Semua target
            </Link>
          </div>

          {!primaryTarget || !primaryProgres ? (
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Belum ada target tabungan aktif.
              </p>
              <Link href="/tabungan" className="fn-btn fn-btn-ghost text-xs py-2 px-4 min-h-[38px]">
                <PiggyBank size={16} />
                <span>Tambah target</span>
              </Link>
            </div>
          ) : (
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--muted)' }}>
                {primaryTarget.nama}
              </p>
              <p className="fn-display text-xl font-bold mt-1 fn-num">
                {formatRupiah(primaryProgres.terkumpul)}{' '}
                <span className="text-xs font-normal" style={{ color: 'var(--muted)' }}>
                  dari {formatRupiah(primaryProgres.targetJumlah)}
                </span>
              </p>
              <div className="h-2 rounded-full overflow-hidden mt-2.5" style={{ backgroundColor: 'var(--primary-soft)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${primaryProgres.persentase}%`, backgroundColor: 'var(--primary)' }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--muted)' }}>
                <strong style={{ color: 'var(--ink)' }}>{primaryProgres.persentase}% terkumpul</strong>
                <span className="fn-num">Kurang {formatRupiah(primaryProgres.kurang)}</span>
              </div>
            </div>
          )}
        </section>

        <section aria-labelledby="card-tagihan-title" className="fn-card p-5 sm:p-6 md:col-span-2 flex flex-col justify-between gap-4">
          <div className="flex items-center justify-between">
            <h2 id="card-tagihan-title" className="fn-display text-base font-semibold">
              Tagihan terdekat
            </h2>
            <Link href="/tagihan" className="text-xs font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
              Kelola
            </Link>
          </div>

          {tagihanItems.length === 0 ? (
            <div className="flex flex-col items-start gap-2">
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Tidak ada pengingat tagihan aktif.
              </p>
              <Link href="/tagihan" className="fn-btn fn-btn-ghost text-xs py-2 px-4 min-h-[38px]">
                <Receipt size={16} />
                <span>Tambah pengingat</span>
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {tagihanItems.map((t) => (
                <li
                  key={t.id}
                  className="flex items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs"
                  style={{ backgroundColor: 'var(--bg)' }}
                >
                  <div className="min-w-0">
                    <p className="font-semibold truncate">{t.nama}</p>
                    <p style={{ color: 'var(--muted)' }}>{formatTanggal(t.tanggal_jatuh_tempo)}</p>
                  </div>
                  <span
                    className="font-semibold px-2.5 py-1 rounded-full shrink-0 fn-num"
                    style={{
                      backgroundColor: t.selisihHari <= 3 ? 'var(--accent-soft)' : 'var(--primary-soft)',
                      color: t.selisihHari <= 3 ? 'var(--accent-strong)' : 'var(--primary)',
                    }}
                  >
                    {t.selisihHari < 0
                      ? 'Lewat tempo'
                      : t.selisihHari === 0
                        ? 'Hari ini'
                        : `${t.selisihHari} hari lagi`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="card-tren-title" className="fn-card p-5 sm:p-6 md:col-span-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
            <div>
              <h2 id="card-tren-title" className="fn-display text-base font-semibold">
                Tren 6 bulan terakhir
              </h2>
              <p className="text-xs" style={{ color: 'var(--muted)' }}>
                Perbandingan pemasukan dan pengeluaran bulanan
              </p>
            </div>
          </div>
          <MonthlyTrendChart data={tren6Bulan} />
        </section>
      </div>
    </div>
  );
}
