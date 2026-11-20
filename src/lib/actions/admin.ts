'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { kategoriSchema } from '@/lib/validation/schemas';
import type { ActionResult } from './auth';

async function pastikanAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: akun } = await supabase
    .from('akun')
    .select('id, peran, aktif')
    .eq('id', user.id)
    .single();

  if (!akun || akun.peran !== 'admin' || !akun.aktif) return null;
  return { supabase, adminId: akun.id };
}

export async function ubahStatusAktifAkun(targetId: string, aktif: boolean): Promise<ActionResult> {
  const ctx = await pastikanAdmin();
  if (!ctx) return { ok: false, message: 'Akses ditolak. Hanya Admin.' };

  if (ctx.adminId === targetId) {
    return { ok: false, message: 'Tidak dapat menonaktifkan akun sendiri.' };
  }

  const { error } = await ctx.supabase
    .from('akun')
    .update({ aktif })
    .eq('id', targetId)
    .eq('peran', 'pengguna');

  if (error) return { ok: false, message: 'Gagal mengubah status akun pengguna.' };

  revalidatePath('/admin');
  revalidatePath('/admin/pengguna');
  return {
    ok: true,
    message: aktif ? 'Akun pengguna diaktifkan.' : 'Akun pengguna dinonaktifkan.',
  };
}

export async function buatKategoriBawaan(raw: unknown): Promise<ActionResult> {
  const ctx = await pastikanAdmin();
  if (!ctx) return { ok: false, message: 'Akses ditolak. Hanya Admin.' };

  const parsed = kategoriSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data kategori bawaan tidak valid.' };
  }

  const { error } = await ctx.supabase.from('kategori').insert({
    nama: parsed.data.nama,
    jenis: parsed.data.jenis,
    profil_target: parsed.data.profil_target || 'semua',
    ikon: parsed.data.ikon,
    warna: parsed.data.warna,
    is_bawaan: true,
    id_pengguna: null,
  });

  if (error) return { ok: false, message: 'Gagal menambahkan kategori bawaan.' };

  revalidatePath('/admin/kategori');
  return { ok: true, message: 'Kategori bawaan ditambahkan.' };
}

export async function ubahKategoriBawaan(id: string, raw: unknown): Promise<ActionResult> {
  const ctx = await pastikanAdmin();
  if (!ctx) return { ok: false, message: 'Akses ditolak. Hanya Admin.' };

  const parsed = kategoriSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data kategori bawaan tidak valid.' };
  }

  const { error } = await ctx.supabase
    .from('kategori')
    .update({
      nama: parsed.data.nama,
      jenis: parsed.data.jenis,
      profil_target: parsed.data.profil_target || 'semua',
      ikon: parsed.data.ikon,
      warna: parsed.data.warna,
    })
    .eq('id', id)
    .eq('is_bawaan', true);

  if (error) return { ok: false, message: 'Gagal memperbarui kategori bawaan.' };

  revalidatePath('/admin/kategori');
  return { ok: true, message: 'Kategori bawaan diperbarui.' };
}

export async function hapusKategoriBawaan(id: string): Promise<ActionResult> {
  const ctx = await pastikanAdmin();
  if (!ctx) return { ok: false, message: 'Akses ditolak. Hanya Admin.' };

  const { error } = await ctx.supabase
    .from('kategori')
    .delete()
    .eq('id', id)
    .eq('is_bawaan', true);

  if (error) {
    return {
      ok: false,
      message: 'Kategori bawaan tidak dapat dihapus karena masih digunakan oleh transaksi pengguna.',
    };
  }

  revalidatePath('/admin/kategori');
  return { ok: true, message: 'Kategori bawaan dihapus.' };
}
