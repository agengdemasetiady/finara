import React from 'react';
import { redirect } from 'next/navigation';
import { differenceInCalendarDays, parseISO } from 'date-fns';
import { createClient } from '@/lib/supabase/server';
import { getTodayISO } from '@/lib/format';
import { TagihanClient } from '@/components/app/TagihanClient';

export default async function TagihanPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  const { data: tagihanList } = await supabase
    .from('pengingat_tagihan')
    .select('id, nama, jumlah, tanggal_jatuh_tempo, berulang, aktif')
    .eq('id_pengguna', user.id)
    .order('tanggal_jatuh_tempo', { ascending: true });

  const todayISO = getTodayISO();
  const items = (tagihanList || []).map((t) => ({
    id: t.id,
    nama: t.nama,
    jumlah: t.jumlah !== null ? Number(t.jumlah) : null,
    tanggal_jatuh_tempo: t.tanggal_jatuh_tempo,
    berulang: t.berulang,
    aktif: t.aktif,
    selisihHari: differenceInCalendarDays(parseISO(t.tanggal_jatuh_tempo), parseISO(todayISO)),
  }));

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Pengingat Tagihan</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Notifikasi dikirim otomatis maksimal 7 hari sebelum jatuh tempo.
        </p>
      </div>

      <TagihanClient items={items} />
    </div>
  );
}
