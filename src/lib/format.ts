import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

export const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

export function formatRupiah(nominal: number | string): string {
  const value = toRupiahInt(nominal);
  return idrFormatter.format(value);
}

export function formatAngka(nominal: number | string): string {
  const value = toRupiahInt(nominal);
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value);
}

export function toRupiahInt(val: number | string | null | undefined): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') {
    return Number.isFinite(val) ? Math.round(val) : 0;
  }
  const cleaned = String(val).replace(/[^\d-]/g, '');
  const parsed = parseInt(cleaned, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatTanggal(tanggal: string | Date): string {
  const dateObj = typeof tanggal === 'string' ? parseISO(tanggal) : tanggal;
  return format(dateObj, 'd MMM yyyy', { locale: idLocale });
}

export function formatHariKelompok(tanggalStr: string, referensiStr?: string): string {
  const target = parseISO(tanggalStr);
  const ref = referensiStr ? parseISO(referensiStr) : new Date();
  const diff = differenceInCalendarDays(ref, target);
  if (diff === 0) return 'Hari ini';
  if (diff === 1) return 'Kemarin';
  return format(target, 'EEEE, d MMM yyyy', { locale: idLocale });
}

const NAMA_BULAN = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function getNamaBulan(bulan: number): string {
  return NAMA_BULAN[bulan - 1] || 'Bulan';
}

export function getTodayISO(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getLabelProfil(profil: string | null | undefined): string {
  if (profil === 'pelajar') return 'Pelajar / Remaja';
  if (profil === 'kos') return 'Mahasiswa / Anak Kos';
  if (profil === 'umkm') return 'Pelaku UMKM';
  return 'Umum';
}
