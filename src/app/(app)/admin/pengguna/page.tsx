import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminPenggunaClient } from '@/components/app/AdminPenggunaClient';
import type { Akun } from '@/lib/types/database';

export default async function AdminPenggunaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  const { data: me } = await supabase.from('akun').select('peran').eq('id', user.id).single();
  if (me?.peran !== 'admin') redirect('/dashboard');

  const { data: users } = await supabase
    .from('akun')
    .select('id, email, nama, profil, peran, aktif, dibuat_pada')
    .order('dibuat_pada', { ascending: false });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Kelola Akun Pengguna</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Admin hanya melihat identitas akun dan status aktif, tanpa akses ke transaksi pengguna.
        </p>
      </div>

      <AdminPenggunaClient users={(users as Akun[]) || []} />
    </div>
  );
}
