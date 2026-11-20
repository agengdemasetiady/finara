'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { anggaranSchema } from '@/lib/validation/schemas';
import type { ActionResult } from './auth';

export async function simpanAnggaran(raw: unknown): Promise<ActionResult> {
  const parsed = anggaranSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data anggaran belum valid.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Sesi berakhir.' };
  }

  const { id_kategori, bulan, tahun, batas_jumlah } = parsed.data;

  const { data: kat } = await supabase
    .from('kategori')
    .select('id, jenis, is_bawaan, id_pengguna')
    .eq('id', id_kategori)
    .single();

  if (!kat || kat.jenis !== 'PENGELUARAN' || (!kat.is_bawaan && kat.id_pengguna !== user.id)) {
    return { ok: false, message: 'Kategori pengeluaran tidak valid.' };
  }

  const { error } = await supabase.from('anggaran').upsert(
    {
      id_kategori,
      bulan,
      tahun,
      batas_jumlah,
      id_pengguna: user.id,
    },
    { onConflict: 'id_pengguna,id_kategori,bulan,tahun' }
  );

  if (error) {
    return { ok: false, message: 'Gagal menyimpan anggaran.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/anggaran');
  revalidatePath('/insight');
  return { ok: true, message: 'Anggaran tersimpan.' };
}

export async function hapusAnggaran(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Sesi berakhir.' };
  }

  const { error } = await supabase
    .from('anggaran')
    .delete()
    .eq('id', id)
    .eq('id_pengguna', user.id);

  if (error) {
    return { ok: false, message: 'Gagal menghapus anggaran.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/anggaran');
  revalidatePath('/insight');
  return { ok: true, message: 'Anggaran dihapus.' };
}
