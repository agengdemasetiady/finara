import { toRupiahInt } from '@/lib/format';

export interface ProgresTabungan {
  terkumpul: number;
  targetJumlah: number;
  kurang: number;
  persentase: number;
  tercapai: boolean;
}

export function hitungProgresTabungan(
  targetJumlah: number | string,
  setoranList: Array<{ jumlah: number | string }>
): ProgresTabungan {
  const target = toRupiahInt(targetJumlah);
  let terkumpul = 0;

  for (const s of setoranList) {
    const nominal = toRupiahInt(s.jumlah);
    if (nominal > 0) {
      terkumpul += nominal;
    }
  }

  const kurang = Math.max(0, target - terkumpul);
  const persentase = target > 0 ? Math.min(100, Math.round((terkumpul / target) * 100)) : 0;

  return {
    terkumpul,
    targetJumlah: target,
    kurang,
    persentase,
    tercapai: target > 0 && terkumpul >= target,
  };
}
