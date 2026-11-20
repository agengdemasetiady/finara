import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { NotifikasiClient } from '@/components/app/NotifikasiClient';
import type { Notifikasi } from '@/lib/types/database';

export default async function NotifikasiPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  const { data: items } = await supabase
    .from('notifikasi')
    .select('*')
    .eq('id_pengguna', user.id)
    .order('dibuat_pada', { ascending: false })
    .limit(50);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Pusat Notifikasi</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Peringatan batas anggaran dan jadwal tagihan jatuh tempo.
        </p>
      </div>

      <NotifikasiClient items={(items as Notifikasi[]) || []} />
    </div>
  );
}
