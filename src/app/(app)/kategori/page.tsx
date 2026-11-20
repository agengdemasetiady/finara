import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { KategoriClient } from '@/components/app/KategoriClient';
import type { Kategori } from '@/lib/types/database';

export default async function KategoriPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  const { data: akun } = await supabase
    .from('akun')
    .select('profil')
    .eq('id', user.id)
    .single();

  const profil = akun?.profil || 'kos';

  const { data: categories } = await supabase
    .from('kategori')
    .select('*')
    .or(`and(is_bawaan.eq.true,profil_target.in.(semua,${profil})),id_pengguna.eq.${user.id}`)
    .order('is_bawaan', { ascending: false })
    .order('nama', { ascending: true });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Kategori Transaksi</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Kategori bawaan menyesuaikan profilmu. Kamu juga dapat menambah kategori pribadi.
        </p>
      </div>

      <KategoriClient categories={(categories as Kategori[]) || []} />
    </div>
  );
}
