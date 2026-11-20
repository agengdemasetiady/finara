import type { JenisTrx } from '@/lib/types/database';
import { toRupiahInt } from '@/lib/format';

export type StatusAnggaran = 'aman' | 'hampir_habis' | 'terlampaui';

export interface ProgresAnggaran {
  terpakai: number;
  batas: number;
  sisa: number;
  persentase: number;
  status: StatusAnggaran;
}

export function hitungProgresAnggaran(
  batasJumlah: number | string,
  transaksiKategoriBulanIni: Array<{ jumlah: number | string; jenis: JenisTrx }>
): ProgresAnggaran {
  const batas = toRupiahInt(batasJumlah);
  let terpakai = 0;

  for (const trx of transaksiKategoriBulanIni) {
    if (trx.jenis === 'PENGELUARAN') {
      terpakai += toRupiahInt(trx.jumlah);
    }
  }

  const persentase = batas > 0 ? Math.round((terpakai / batas) * 100) : 0;
  const sisa = batas - terpakai;

  let status: StatusAnggaran = 'aman';
  if (persentase >= 100) {
    status = 'terlampaui';
  } else if (persentase >= 80) {
    status = 'hampir_habis';
  }

  return {
    terpakai,
    batas,
    sisa,
    persentase,
    status,
  };
}

export interface HasilEvaluasiPeringatan {
  perluNotifikasi: boolean;
  level: 80 | 100;
  pesan: string;
  kunciUnik: string;
}

export function evaluasiPeringatanAnggaran(params: {
  idKategori: string;
  namaKategori: string;
  bulan: number;
  tahun: number;
  terpakai: number | string;
  batasJumlah: number | string;
}): HasilEvaluasiPeringatan | null {
  const batas = toRupiahInt(params.batasJumlah);
  const terpakai = toRupiahInt(params.terpakai);
  if (batas <= 0) return null;

  const persentase = (terpakai / batas) * 100;
  if (persentase < 80) return null;

  const persenBulat = Math.round(persentase);
  const bulanPad = String(params.bulan).padStart(2, '0');

  if (persentase >= 100) {
    return {
      perluNotifikasi: true,
      level: 100,
      pesan: `Anggaran ${params.namaKategori} terlampaui (${persenBulat}%).`,
      kunciUnik: `${params.idKategori}:${params.tahun}-${bulanPad}:100`,
    };
  }

  return {
    perluNotifikasi: true,
    level: 80,
    pesan: `${params.namaKategori} sudah ${persenBulat}% dari anggaran.`,
    kunciUnik: `${params.idKategori}:${params.tahun}-${bulanPad}:80`,
  };
}
