import { getDaysInMonth, parseISO } from 'date-fns';
import type { ProfilTipe } from '@/lib/types/database';
import { formatRupiah } from '@/lib/format';
import type { KategoriBreakdown } from './ringkasan';

export interface KartuInsight {
  id: string;
  judul: string;
  angkaUtama: string;
  penjelasan: string;
  nada: 'positif' | 'netral' | 'peringatan';
}

export interface InputInsight {
  profil: ProfilTipe | null;
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  pengeluaranBulanLalu: number;
  breakdownKategori: KategoriBreakdown[];
  totalBatasAnggaran: number;
  totalTerpakaiAnggaran: number;
  tanggalReferensiISO: string;
  tagihanTerdekat?: { nama: string; selisihHari: number } | null;
  biayaBahanBakuBulanIni?: number;
  biayaBahanBakuBulanLalu?: number;
}

export function hitungBatasAmanHarian(params: {
  pemasukanBulanIni: number;
  pengeluaranBulanIni: number;
  totalBatasAnggaran: number;
  totalTerpakaiAnggaran: number;
  tanggalReferensiISO: string;
}): number {
  const refDate = parseISO(params.tanggalReferensiISO);
  const totalHari = getDaysInMonth(refDate);
  const hariKe = refDate.getDate();
  const sisaHari = Math.max(1, totalHari - hariKe + 1);

  const sisaDana =
    params.totalBatasAnggaran > 0
      ? params.totalBatasAnggaran - params.totalTerpakaiAnggaran
      : params.pemasukanBulanIni - params.pengeluaranBulanIni;

  return Math.max(0, Math.floor(sisaDana / sisaHari));
}

export function buatInsight(input: InputInsight): {
  ringkas: string;
  kartu: KartuInsight[];
  batasAmanHarian: number;
} {
  const kartu: KartuInsight[] = [];

  // 1. Perbandingan dengan bulan lalu
  const selisih = input.pengeluaranBulanIni - input.pengeluaranBulanLalu;
  if (input.pengeluaranBulanLalu > 0) {
    const pct = Math.round((Math.abs(selisih) / input.pengeluaranBulanLalu) * 100);
    if (selisih > 0) {
      kartu.push({
        id: 'banding-bulan-lalu',
        judul: 'Banding bulan lalu',
        angkaUtama: `+${pct}%`,
        penjelasan: `Pengeluaran bulan ini naik ${formatRupiah(selisih)} dibanding bulan lalu.`,
        nada: pct >= 15 ? 'peringatan' : 'netral',
      });
    } else if (selisih < 0) {
      kartu.push({
        id: 'banding-bulan-lalu',
        judul: 'Banding bulan lalu',
        angkaUtama: `-${pct}%`,
        penjelasan: `Pengeluaran bulan ini lebih hemat ${formatRupiah(Math.abs(selisih))} dari bulan lalu.`,
        nada: 'positif',
      });
    } else {
      kartu.push({
        id: 'banding-bulan-lalu',
        judul: 'Banding bulan lalu',
        angkaUtama: '0%',
        penjelasan: 'Total pengeluaranmu sama persis dengan bulan lalu.',
        nada: 'netral',
      });
    }
  } else {
    kartu.push({
      id: 'banding-bulan-lalu',
      judul: 'Banding bulan lalu',
      angkaUtama: formatRupiah(input.pengeluaranBulanIni),
      penjelasan: 'Belum ada catatan pengeluaran bulan lalu sebagai pembanding.',
      nada: 'netral',
    });
  }

  // 2. Kategori pengeluaran terbesar
  const terbesar = input.breakdownKategori[0];
  if (terbesar && terbesar.total > 0) {
    kartu.push({
      id: 'kategori-terbesar',
      judul: 'Kategori terbesar',
      angkaUtama: `${terbesar.nama} ${terbesar.persentase}%`,
      penjelasan: `${terbesar.nama} memakai ${formatRupiah(terbesar.total)} dari total pengeluaran bulan ini.`,
      nada: terbesar.persentase >= 50 ? 'peringatan' : 'netral',
    });
  } else {
    kartu.push({
      id: 'kategori-terbesar',
      judul: 'Kategori terbesar',
      angkaUtama: '-',
      penjelasan: 'Catat pengeluaran pertamamu untuk melihat kategori terbesar.',
      nada: 'netral',
    });
  }

  // 3. Batas aman harian
  const batasAmanHarian = hitungBatasAmanHarian({
    pemasukanBulanIni: input.pemasukanBulanIni,
    pengeluaranBulanIni: input.pengeluaranBulanIni,
    totalBatasAnggaran: input.totalBatasAnggaran,
    totalTerpakaiAnggaran: input.totalTerpakaiAnggaran,
    tanggalReferensiISO: input.tanggalReferensiISO,
  });

  kartu.push({
    id: 'batas-harian',
    judul: 'Batas aman harian',
    angkaUtama: `${formatRupiah(batasAmanHarian)}/hari`,
    penjelasan:
      batasAmanHarian > 0
        ? `Jaga pengeluaran harian di bawah ${formatRupiah(batasAmanHarian)} sampai akhir bulan.`
        : 'Sisa anggaran atau saldo bulan ini sudah habis.',
    nada: batasAmanHarian > 0 ? 'positif' : 'peringatan',
  });

  // 4. Insight khusus profil
  let kalimatProfil = '';
  if (input.profil === 'pelajar') {
    const jajan = input.breakdownKategori.find((k) => k.nama.toLowerCase().includes('jajan'));
    if (jajan) {
      kalimatProfil = `Jajan bulan ini ${formatRupiah(jajan.total)}. Batas aman harianmu ${formatRupiah(batasAmanHarian)}.`;
    } else {
      kalimatProfil = `Batas aman harianmu ${formatRupiah(batasAmanHarian)}. Sisihkan sebagian uang saku untuk tabungan.`;
    }
  } else if (input.profil === 'kos') {
    if (input.tagihanTerdekat) {
      const hariText =
        input.tagihanTerdekat.selisihHari === 0
          ? 'hari ini'
          : `${input.tagihanTerdekat.selisihHari} hari lagi`;
      kalimatProfil = `Batas aman ${formatRupiah(batasAmanHarian)} per hari. Tagihan ${input.tagihanTerdekat.nama} jatuh tempo ${hariText}.`;
    } else {
      kalimatProfil = `Batas aman ${formatRupiah(batasAmanHarian)} per hari agar uang bulanan cukup sampai akhir bulan.`;
    }
  } else if (input.profil === 'umkm') {
    const laba = input.pemasukanBulanIni - input.pengeluaranBulanIni;
    if (
      input.biayaBahanBakuBulanIni !== undefined &&
      input.biayaBahanBakuBulanLalu !== undefined &&
      input.biayaBahanBakuBulanLalu > 0
    ) {
      const diffBaku = input.biayaBahanBakuBulanIni - input.biayaBahanBakuBulanLalu;
      const pctBaku = Math.round((Math.abs(diffBaku) / input.biayaBahanBakuBulanLalu) * 100);
      const arah = diffBaku >= 0 ? 'naik' : 'turun';
      kalimatProfil = `Biaya bahan baku ${arah} ${pctBaku}% dari bulan lalu. Laba sederhana bulan ini ${formatRupiah(laba)}.`;
    } else {
      kalimatProfil = `Laba sederhana usaha bulan ini ${formatRupiah(laba)} dari pemasukan ${formatRupiah(input.pemasukanBulanIni)}.`;
    }
  } else {
    kalimatProfil = `Batas aman harianmu ${formatRupiah(batasAmanHarian)} sampai akhir bulan.`;
  }

  return {
    ringkas: kalimatProfil,
    kartu,
    batasAmanHarian,
  };
}
