import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { PengaturanClient } from '@/components/app/PengaturanClient';
import type { ProfilTipe } from '@/lib/types/database';

export default async function PengaturanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  const { data: akun } = await supabase
    .from('akun')
    .select('nama, email, profil')
    .eq('id', user.id)
    .single();

  if (!akun) redirect('/masuk');

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Pengaturan Akun</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Perbarui profil pengguna, keamanan akun, atau tema tampilan.
        </p>
      </div>

      <PengaturanClient
        initialNama={akun.nama || ''}
        email={akun.email}
        initialProfil={(akun.profil as ProfilTipe) || 'kos'}
      />
    </div>
  );
}
