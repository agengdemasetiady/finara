import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { hitungProgresTabungan } from '@/lib/domain/tabungan';
import { TabunganClient } from '@/components/app/TabunganClient';

export default async function TabunganPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/masuk');

  const [{ data: targetList }, { data: setoranList }] = await Promise.all([
    supabase
      .from('target_tabungan')
      .select('id, nama, target_jumlah, tanggal')
      .eq('id_pengguna', user.id),
    supabase
      .from('setoran_tabungan')
      .select('id, id_target, jumlah, tanggal')
      .order('tanggal', { ascending: false }),
  ]);

  const targets = (targetList || []).map((t) => {
    const setoran = (setoranList || [])
      .filter((s) => s.id_target === t.id)
      .map((s) => ({
        id: s.id,
        jumlah: Number(s.jumlah),
        tanggal: s.tanggal,
      }));
    const prog = hitungProgresTabungan(t.target_jumlah, setoran);
    return {
      id: t.id,
      nama: t.nama,
      tanggal: t.tanggal,
      ...prog,
      setoran,
    };
  });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="fn-display text-2xl sm:text-3xl font-semibold">Target Tabungan</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
          Pisahkan tujuan tabunganmu dan catat setiap setoran.
        </p>
      </div>

      <TabunganClient targets={targets} />
    </div>
  );
}
