import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminKategoriClient } from '@/components/app/AdminKategoriClient';
import type { Kategori } from '@/lib/types/database';

export default async function AdminKategoriPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  const { data: me } = await supabase.from('akun').select('peran').eq('id', user.id).single();
  if (me?.peran !== 'admin') redirect('/dashboard');

  const { data: categories } = await supabase
    .from('kategori')
    .select('*')
    .eq('is_bawaan', true)
    .order('profil_target', { ascending: true })
    .order('nama', { ascending: true });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Kategori Bawaan Sistem</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Kategori bawaan otomatis tersedia bagi pengguna sesuai profil yang dipilih.
        </p>
      </div>

      <AdminKategoriClient categories={(categories as Kategori[]) || []} />
    </div>
  );
}
