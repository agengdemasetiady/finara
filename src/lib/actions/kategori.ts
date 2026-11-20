'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { kategoriSchema } from '@/lib/validation/schemas';
import type { ActionResult } from './auth';

export async function buatKategori(raw: unknown): Promise<ActionResult> {
  const parsed = kategoriSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data kategori belum valid.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Sesi berakhir.' };

  const { error } = await supabase.from('kategori').insert({
    nama: parsed.data.nama,
    jenis: parsed.data.jenis,
    ikon: parsed.data.ikon,
    warna: parsed.data.warna,
    profil_target: 'semua',
    is_bawaan: false,
    id_pengguna: user.id,
  });

  if (error) return { ok: false, message: 'Gagal menambahkan kategori.' };

  revalidatePath('/kategori');
  revalidatePath('/transaksi');
  revalidatePath('/anggaran');
  return { ok: true, message: 'Kategori berhasil ditambahkan.' };
}

export async function ubahKategori(id: string, raw: unknown): Promise<ActionResult> {
  const parsed = kategoriSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data kategori belum valid.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Sesi berakhir.' };

  const { error } = await supabase
    .from('kategori')
    .update({
      nama: parsed.data.nama,
      jenis: parsed.data.jenis,
      ikon: parsed.data.ikon,
      warna: parsed.data.warna,
    })
    .eq('id', id)
    .eq('id_pengguna', user.id)
    .eq('is_bawaan', false);

  if (error) return { ok: false, message: 'Gagal mengubah kategori.' };

  revalidatePath('/kategori');
  revalidatePath('/transaksi');
  revalidatePath('/anggaran');
  return { ok: true, message: 'Kategori diperbarui.' };
}

export async function hapusKategori(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Sesi berakhir.' };

  const { error } = await supabase
    .from('kategori')
    .delete()
    .eq('id', id)
    .eq('id_pengguna', user.id)
    .eq('is_bawaan', false);

  if (error) {
    return {
      ok: false,
      message: 'Kategori tidak dapat dihapus karena masih dipakai pada transaksi atau anggaran.',
    };
  }

  revalidatePath('/kategori');
  revalidatePath('/transaksi');
  revalidatePath('/anggaran');
  return { ok: true, message: 'Kategori dihapus.' };
}
