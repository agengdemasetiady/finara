import { addMonths, differenceInCalendarDays, format, parseISO } from 'date-fns';

export interface ItemTagihan {
  id: string;
  nama: string;
  jumlah: number | string | null;
  tanggal_jatuh_tempo: string;
  berulang: boolean;
  aktif: boolean;
}

export interface PengingatTagihanTerpicu {
  idTagihan: string;
  nama: string;
  selisihHari: number;
  pesan: string;
  kunciUnik: string;
}

export function cekTagihanJatuhTempo(
  tagihanList: ItemTagihan[],
  hariIniISO: string,
  batasHari = 7
): PengingatTagihanTerpicu[] {
  const today = parseISO(hariIniISO);
  const hasil: PengingatTagihanTerpicu[] = [];

  for (const tagihan of tagihanList) {
    if (!tagihan.aktif) continue;
    const due = parseISO(tagihan.tanggal_jatuh_tempo);
    const selisihHari = differenceInCalendarDays(due, today);

    if (selisihHari >= 0 && selisihHari <= batasHari) {
      const keterangan =
        selisihHari === 0
          ? 'jatuh tempo hari ini.'
          : selisihHari === 1
            ? 'jatuh tempo besok.'
            : `jatuh tempo ${selisihHari} hari lagi.`;

      hasil.push({
        idTagihan: tagihan.id,
        nama: tagihan.nama,
        selisihHari,
        pesan: `${tagihan.nama} ${keterangan}`,
        kunciUnik: `tagihan:${tagihan.id}:${tagihan.tanggal_jatuh_tempo}`,
      });
    }
  }

  return hasil.sort((a, b) => a.selisihHari - b.selisihHari);
}

export function hitungTanggalJatuhTempoBerikutnya(tanggalJatuhTempoISO: string): string {
  const current = parseISO(tanggalJatuhTempoISO);
  const next = addMonths(current, 1);
  return format(next, 'yyyy-MM-dd');
}
