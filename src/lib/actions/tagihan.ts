'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { tagihanSchema } from '@/lib/validation/schemas';
import { cekTagihanJatuhTempo, hitungTanggalJatuhTempoBerikutnya } from '@/lib/domain/tagihan';
import { getTodayISO } from '@/lib/format';
import type { ActionResult } from './auth';

export async function buatTagihan(raw: unknown): Promise<ActionResult> {
  const parsed = tagihanSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data tagihan belum valid.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Sesi berakhir.' };

  const { error } = await supabase.from('pengingat_tagihan').insert({
    nama: parsed.data.nama,
    jumlah: parsed.data.jumlah && parsed.data.jumlah > 0 ? parsed.data.jumlah : null,
    tanggal_jatuh_tempo: parsed.data.tanggal_jatuh_tempo,
    berulang: parsed.data.berulang,
    aktif: parsed.data.aktif,
    id_pengguna: user.id,
  });

  if (error) return { ok: false, message: 'Gagal membuat pengingat tagihan.' };

  revalidatePath('/dashboard');
  revalidatePath('/tagihan');
  revalidatePath('/notifikasi');
  return { ok: true, message: 'Pengingat tagihan ditambahkan.' };
}

export async function ubahTagihan(id: string, raw: unknown): Promise<ActionResult> {
  const parsed = tagihanSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data tagihan belum valid.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Sesi berakhir.' };

  const { error } = await supabase
    .from('pengingat_tagihan')
    .update({
      nama: parsed.data.nama,
      jumlah: parsed.data.jumlah && parsed.data.jumlah > 0 ? parsed.data.jumlah : null,
      tanggal_jatuh_tempo: parsed.data.tanggal_jatuh_tempo,
      berulang: parsed.data.berulang,
      aktif: parsed.data.aktif,
    })
    .eq('id', id)
    .eq('id_pengguna', user.id);

  if (error) return { ok: false, message: 'Gagal memperbarui pengingat tagihan.' };

  revalidatePath('/dashboard');
  revalidatePath('/tagihan');
  revalidatePath('/notifikasi');
  return { ok: true, message: 'Pengingat tagihan diperbarui.' };
}

export async function hapusTagihan(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Sesi berakhir.' };

  const { error } = await supabase
    .from('pengingat_tagihan')
    .delete()
    .eq('id', id)
    .eq('id_pengguna', user.id);

  if (error) return { ok: false, message: 'Gagal menghapus pengingat tagihan.' };

  revalidatePath('/dashboard');
  revalidatePath('/tagihan');
  return { ok: true, message: 'Pengingat tagihan dihapus.' };
}

export async function toggleStatusTagihan(id: string, aktif: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Sesi berakhir.' };

  const { error } = await supabase
    .from('pengingat_tagihan')
    .update({ aktif })
    .eq('id', id)
    .eq('id_pengguna', user.id);

  if (error) return { ok: false, message: 'Gagal mengubah status tagihan.' };

  revalidatePath('/dashboard');
  revalidatePath('/tagihan');
  return { ok: true, message: aktif ? 'Pengingat diaktifkan.' : 'Pengingat dijeda.' };
}

export async function sinkronkanNotifikasiTagihan() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: tagihanList } = await supabase
    .from('pengingat_tagihan')
    .select('*')
    .eq('id_pengguna', user.id)
    .eq('aktif', true);

  if (!tagihanList || tagihanList.length === 0) return;

  const todayISO = getTodayISO();

  // Geser tagihan berulang yang sudah lewat ke bulan berikutnya
  for (const t of tagihanList) {
    if (t.berulang && t.tanggal_jatuh_tempo < todayISO) {
      let nextDue = t.tanggal_jatuh_tempo;
      while (nextDue < todayISO) {
        nextDue = hitungTanggalJatuhTempoBerikutnya(nextDue);
      }
      await supabase
        .from('pengingat_tagihan')
        .update({ tanggal_jatuh_tempo: nextDue })
        .eq('id', t.id)
        .eq('id_pengguna', user.id);
      t.tanggal_jatuh_tempo = nextDue;
    }
  }

  const terpicu = cekTagihanJatuhTempo(tagihanList, todayISO, 7);
  if (terpicu.length === 0) return;

  const rows = terpicu.map((item) => ({
    jenis: 'PENGINGAT_TAGIHAN' as const,
    pesan: item.pesan,
    id_pengguna: user.id,
    kunci_unik: item.kunciUnik,
  }));

  await supabase.from('notifikasi').upsert(rows, {
    onConflict: 'id_pengguna,kunci_unik',
    ignoreDuplicates: true,
  });
}
