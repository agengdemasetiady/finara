'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  daftarSchema,
  masukSchema,
  lupaSandiSchema,
  aturUlangSandiSchema,
  ubahProfilSchema,
  ubahSandiSchema,
  hapusAkunSchema,
} from '@/lib/validation/schemas';

export interface ActionResult {
  ok: boolean;
  message: string;
  warning?: string | null;
}

export async function daftarAkun(raw: unknown): Promise<ActionResult> {
  const parsed = daftarSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data pendaftaran belum valid.' };
  }

  const supabase = await createClient();
  const { nama, email, password, profil } = parsed.data;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nama,
        profil,
      },
    },
  });

  if (error) {
    if (error.message.toLowerCase().includes('already registered')) {
      return { ok: false, message: 'Email ini sudah terdaftar. Silakan masuk.' };
    }
    return { ok: false, message: 'Gagal mendaftarkan akun. Coba lagi.' };
  }

  if (!data.session) {
    return {
      ok: true,
      message: 'Akun dibuat. Periksa emailmu untuk konfirmasi sebelum masuk.',
    };
  }

  return { ok: true, message: 'Pendaftaran berhasil.' };
}

export async function masukAkun(raw: unknown): Promise<ActionResult & { redirectTo?: string }> {
  const parsed = masukSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Periksa email dan kata sandi.' };
  }

  const supabase = await createClient();
  const { email, password } = parsed.data;

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !data.user) {
    return { ok: false, message: 'Email atau kata sandi salah.' };
  }

  const { data: akun } = await supabase
    .from('akun')
    .select('peran, aktif')
    .eq('id', data.user.id)
    .single();

  if (akun && !akun.aktif) {
    await supabase.auth.signOut();
    return { ok: false, message: 'Akunmu sedang dinonaktifkan oleh admin.' };
  }

  const tujuan = akun?.peran === 'admin' ? '/admin' : '/dashboard';
  return { ok: true, message: 'Berhasil masuk.', redirectTo: tujuan };
}

export async function keluarAkun() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/masuk');
}

export async function mintaAturUlangSandi(raw: unknown): Promise<ActionResult> {
  const parsed = lupaSandiSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Format email belum benar.' };
  }

  const supabase = await createClient();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/api/auth/callback?next=/atur-ulang-sandi`,
  });

  if (error) {
    return { ok: false, message: 'Gagal mengirim tautan atur ulang kata sandi.' };
  }

  return {
    ok: true,
    message: 'Jika email terdaftar, tautan atur ulang kata sandi telah dikirim.',
  };
}

export async function simpanSandiBaru(raw: unknown): Promise<ActionResult> {
  const parsed = aturUlangSandiSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Kata sandi baru belum valid.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });

  if (error) {
    return { ok: false, message: 'Gagal memperbarui kata sandi. Tautan mungkin sudah kedaluwarsa.' };
  }

  return { ok: true, message: 'Kata sandi berhasil diperbarui.' };
}

export async function ubahProfil(raw: unknown): Promise<ActionResult> {
  const parsed = ubahProfilSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data profil tidak valid.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Sesi berakhir. Silakan masuk kembali.' };
  }

  const { error } = await supabase
    .from('akun')
    .update({
      nama: parsed.data.nama,
      profil: parsed.data.profil,
    })
    .eq('id', user.id);

  if (error) {
    return { ok: false, message: 'Gagal menyimpan perubahan profil.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/pengaturan');
  revalidatePath('/kategori');
  revalidatePath('/insight');
  return { ok: true, message: 'Profil berhasil diperbarui.' };
}

export async function ubahKataSandi(raw: unknown): Promise<ActionResult> {
  const parsed = ubahSandiSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Periksa isian kata sandi.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { ok: false, message: 'Sesi tidak ditemukan.' };
  }

  // Verifikasi kata sandi lama
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.sandiLama,
  });

  if (verifyError) {
    return { ok: false, message: 'Kata sandi saat ini salah.' };
  }

  const { error: updateError } = await supabase.auth.updateUser({
    password: parsed.data.sandiBaru,
  });

  if (updateError) {
    return { ok: false, message: 'Gagal mengganti kata sandi.' };
  }

  return { ok: true, message: 'Kata sandi berhasil diubah.' };
}

export async function hapusAkun(raw: unknown): Promise<ActionResult> {
  const parsed = hapusAkunSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Kata sandi wajib diisi.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return { ok: false, message: 'Sesi tidak ditemukan.' };
  }

  // Konfirmasi kata sandi sebelum hapus permanen
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: parsed.data.sandi,
  });

  if (verifyError) {
    return { ok: false, message: 'Kata sandi salah. Penghapusan dibatalkan.' };
  }

  await supabase.auth.signOut();

  const adminClient = createAdminClient();
  const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

  if (deleteError) {
    return { ok: false, message: 'Gagal menghapus akun dari sistem.' };
  }

  return { ok: true, message: 'Akun dan seluruh data keuangan telah dihapus.' };
}
