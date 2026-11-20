'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { targetTabunganSchema, setoranTabunganSchema } from '@/lib/validation/schemas';
import type { ActionResult } from './auth';

export async function buatTargetTabungan(raw: unknown): Promise<ActionResult> {
  const parsed = targetTabunganSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data target tabungan belum valid.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Sesi berakhir.' };

  const { error } = await supabase.from('target_tabungan').insert({
    nama: parsed.data.nama,
    target_jumlah: parsed.data.target_jumlah,
    tanggal: parsed.data.tanggal || null,
    id_pengguna: user.id,
  });

  if (error) return { ok: false, message: 'Gagal membuat target tabungan.' };

  revalidatePath('/dashboard');
  revalidatePath('/tabungan');
  return { ok: true, message: 'Target tabungan dibuat.' };
}

export async function ubahTargetTabungan(id: string, raw: unknown): Promise<ActionResult> {
  const parsed = targetTabunganSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data target tabungan belum valid.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Sesi berakhir.' };

  const { error } = await supabase
    .from('target_tabungan')
    .update({
      nama: parsed.data.nama,
      target_jumlah: parsed.data.target_jumlah,
      tanggal: parsed.data.tanggal || null,
    })
    .eq('id', id)
    .eq('id_pengguna', user.id);

  if (error) return { ok: false, message: 'Gagal mengubah target tabungan.' };

  revalidatePath('/dashboard');
  revalidatePath('/tabungan');
  return { ok: true, message: 'Target tabungan diperbarui.' };
}

export async function hapusTargetTabungan(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Sesi berakhir.' };

  const { error } = await supabase
    .from('target_tabungan')
    .delete()
    .eq('id', id)
    .eq('id_pengguna', user.id);

  if (error) return { ok: false, message: 'Gagal menghapus target tabungan.' };

  revalidatePath('/dashboard');
  revalidatePath('/tabungan');
  return { ok: true, message: 'Target tabungan dihapus.' };
}

export async function catatSetoranTabungan(raw: unknown): Promise<ActionResult> {
  const parsed = setoranTabunganSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Nominal setoran tidak valid.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Sesi berakhir.' };

  const { error } = await supabase.from('setoran_tabungan').insert({
    id_target: parsed.data.id_target,
    jumlah: parsed.data.jumlah,
    tanggal: parsed.data.tanggal,
  });

  if (error) return { ok: false, message: 'Gagal mencatat setoran.' };

  revalidatePath('/dashboard');
  revalidatePath('/tabungan');
  return { ok: true, message: 'Setoran tabungan dicatat.' };
}
