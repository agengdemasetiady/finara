'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import type { ActionResult } from './auth';

export async function tandaiNotifikasiDibaca(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Sesi berakhir.' };

  const { error } = await supabase
    .from('notifikasi')
    .update({ sudah_dibaca: true })
    .eq('id', id)
    .eq('id_pengguna', user.id);

  if (error) return { ok: false, message: 'Gagal memperbarui notifikasi.' };

  revalidatePath('/notifikasi');
  revalidatePath('/dashboard');
  return { ok: true, message: 'Ditandai sudah dibaca.' };
}

export async function tandaiSemuaNotifikasiDibaca(): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, message: 'Sesi berakhir.' };

  const { error } = await supabase
    .from('notifikasi')
    .update({ sudah_dibaca: true })
    .eq('id_pengguna', user.id)
    .eq('sudah_dibaca', false);

  if (error) return { ok: false, message: 'Gagal memperbarui notifikasi.' };

  revalidatePath('/notifikasi');
  revalidatePath('/dashboard');
  return { ok: true, message: 'Semua notifikasi ditandai sudah dibaca.' };
}
