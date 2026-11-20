import { subDays, format, parseISO, subMonths } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import type { JenisTrx, ProfilTipe } from '@/lib/types/database';
import { toRupiahInt, getNamaBulan } from '@/lib/format';

export interface TrxItem {
  jumlah: number | string;
  jenis: JenisTrx;
  tanggal: string;
  id_kategori: string;
}

export interface KategoriInfo {
  id: string;
  nama: string;
  ikon?: string | null;
  warna?: string | null;
}

export interface RingkasanPeriode {
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
  labelSaldo: string;
}

export function getLabelSaldo(profil?: ProfilTipe | null): string {
  if (profil === 'umkm') return 'Laba sederhana';
  if (profil === 'pelajar') return 'Sisa uang saku';
  if (profil === 'kos') return 'Sisa uang bulanan';
  return 'Sisa saldo';
}

export function hitungRingkasan(
  transaksiList: Pick<TrxItem, 'jumlah' | 'jenis'>[],
  profil?: ProfilTipe | null
): RingkasanPeriode {
  let pemasukan = 0;
  let pengeluaran = 0;

  for (const trx of transaksiList) {
    const nominal = toRupiahInt(trx.jumlah);
    if (nominal <= 0) continue;
    if (trx.jenis === 'PEMASUKAN') {
      pemasukan += nominal;
    } else if (trx.jenis === 'PENGELUARAN') {
      pengeluaran += nominal;
    }
  }

  return {
    pemasukan,
    pengeluaran,
    saldo: pemasukan - pengeluaran,
    labelSaldo: getLabelSaldo(profil),
  };
}

export interface KategoriBreakdown {
  idKategori: string;
  nama: string;
  ikon: string;
  warna: string;
  total: number;
  persentase: number;
}

export function hitungPengeluaranPerKategori(
  transaksiList: TrxItem[],
  kategoriList: KategoriInfo[]
): KategoriBreakdown[] {
  const katMap = new Map<string, KategoriInfo>();
  for (const k of kategoriList) {
    katMap.set(k.id, k);
  }

  const totals = new Map<string, number>();
  let grandTotal = 0;

  for (const trx of transaksiList) {
    if (trx.jenis !== 'PENGELUARAN') continue;
    const nominal = toRupiahInt(trx.jumlah);
    if (nominal <= 0) continue;
    grandTotal += nominal;
    totals.set(trx.id_kategori, (totals.get(trx.id_kategori) || 0) + nominal);
  }

  const result: KategoriBreakdown[] = [];
  for (const [idKategori, total] of totals.entries()) {
    const kat = katMap.get(idKategori);
    result.push({
      idKategori,
      nama: kat?.nama || 'Lainnya',
      ikon: kat?.ikon || 'DotsThreeCircle',
      warna: kat?.warna || '#0B5C46',
      total,
      persentase: grandTotal > 0 ? Math.round((total / grandTotal) * 100) : 0,
    });
  }

  return result.sort((a, b) => b.total - a.total);
}

export interface TitikHarian {
  tanggal: string;
  hariSingkat: string;
  hariLengkap: string;
  total: number;
  isLast: boolean;
}

export function hitungPengeluaran7Hari(
  transaksiList: Pick<TrxItem, 'jumlah' | 'jenis' | 'tanggal'>[],
  tanggalReferensiISO: string,
  jenisTarget: JenisTrx = 'PENGELUARAN'
): TitikHarian[] {
  const refDate = parseISO(tanggalReferensiISO);
  const dailyMap = new Map<string, number>();

  for (const trx of transaksiList) {
    if (trx.jenis !== jenisTarget) continue;
    const nominal = toRupiahInt(trx.jumlah);
    if (nominal <= 0) continue;
    dailyMap.set(trx.tanggal, (dailyMap.get(trx.tanggal) || 0) + nominal);
  }

  const points: TitikHarian[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const d = subDays(refDate, offset);
    const iso = format(d, 'yyyy-MM-dd');
    const hariLengkap = format(d, 'EEEE', { locale: idLocale });
    points.push({
      tanggal: iso,
      hariSingkat: hariLengkap.charAt(0).toUpperCase(),
      hariLengkap,
      total: dailyMap.get(iso) || 0,
      isLast: offset === 0,
    });
  }

  return points;
}

export interface TrenBulanItem {
  bulan: number;
  tahun: number;
  label: string;
  pemasukan: number;
  pengeluaran: number;
}

export function hitungTrenBulanan(
  transaksiList: Pick<TrxItem, 'jumlah' | 'jenis' | 'tanggal'>[],
  bulanAkhir: number,
  tahunAkhir: number,
  jumlahBulan = 6
): TrenBulanItem[] {
  const anchor = new Date(tahunAkhir, bulanAkhir - 1, 1);
  const buckets = new Map<string, { bulan: number; tahun: number; pemasukan: number; pengeluaran: number }>();

  for (let i = jumlahBulan - 1; i >= 0; i--) {
    const d = subMonths(anchor, i);
    const b = d.getMonth() + 1;
    const t = d.getFullYear();
    buckets.set(`${t}-${b}`, { bulan: b, tahun: t, pemasukan: 0, pengeluaran: 0 });
  }

  for (const trx of transaksiList) {
    const [yStr, mStr] = trx.tanggal.split('-');
    const y = parseInt(yStr, 10);
    const m = parseInt(mStr, 10);
    const key = `${y}-${m}`;
    const bucket = buckets.get(key);
    if (!bucket) continue;
    const nominal = toRupiahInt(trx.jumlah);
    if (trx.jenis === 'PEMASUKAN') bucket.pemasukan += nominal;
    else if (trx.jenis === 'PENGELUARAN') bucket.pengeluaran += nominal;
  }

  return Array.from(buckets.values()).map((item) => ({
    ...item,
    label: getNamaBulan(item.bulan).slice(0, 3),
  }));
}
