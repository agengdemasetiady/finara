'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { transaksiSchema } from '@/lib/validation/schemas';
import { evaluasiPeringatanAnggaran } from '@/lib/domain/anggaran';
import type { ActionResult } from './auth';

export async function tambahTransaksi(raw: unknown): Promise<ActionResult> {
  const parsed = transaksiSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data transaksi belum valid.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Sesi berakhir. Silakan masuk kembali.' };
  }

  const { jumlah, jenis, tanggal, catatan, id_kategori } = parsed.data;

  // Langkah 2-8 Sequence Diagram D.4 via RPC transaksional
  const { data: rpcResult, error: rpcError } = await supabase.rpc('catat_transaksi_dan_cek_anggaran', {
    p_jumlah: jumlah,
    p_jenis: jenis,
    p_tanggal: tanggal,
    p_catatan: catatan || null,
    p_id_kategori: id_kategori,
  });

  if (rpcError) {
    return { ok: false, message: rpcError.message || 'Gagal menyimpan transaksi.' };
  }

  const warning =
    rpcResult && typeof rpcResult === 'object' && 'peringatan' in rpcResult
      ? (rpcResult as { peringatan?: string | null }).peringatan
      : null;

  revalidatePath('/dashboard');
  revalidatePath('/transaksi');
  revalidatePath('/anggaran');
  revalidatePath('/insight');
  revalidatePath('/notifikasi');
  revalidatePath('/laporan');

  return {
    ok: true,
    message: 'Transaksi tersimpan.',
    warning: warning || null,
  };
}

export async function ubahTransaksi(id: string, raw: unknown): Promise<ActionResult> {
  const parsed = transaksiSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || 'Data transaksi belum valid.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Sesi berakhir.' };
  }

  const { jumlah, jenis, tanggal, catatan, id_kategori } = parsed.data;

  // Validasi kepemilikan kategori
  const { data: kat } = await supabase
    .from('kategori')
    .select('id, nama, jenis, is_bawaan, id_pengguna')
    .eq('id', id_kategori)
    .single();

  if (!kat || (!kat.is_bawaan && kat.id_pengguna !== user.id) || kat.jenis !== jenis) {
    return { ok: false, message: 'Kategori tidak valid untuk transaksi ini.' };
  }

  const { error } = await supabase
    .from('transaksi')
    .update({
      jumlah,
      jenis,
      tanggal,
      catatan: catatan || null,
      id_kategori,
    })
    .eq('id', id)
    .eq('id_pengguna', user.id);

  if (error) {
    return { ok: false, message: 'Gagal memperbarui transaksi.' };
  }

  let warning: string | null = null;
  if (jenis === 'PENGELUARAN') {
    const [yStr, mStr] = tanggal.split('-');
    const tahun = parseInt(yStr, 10);
    const bulan = parseInt(mStr, 10);

    const { data: ang } = await supabase
      .from('anggaran')
      .select('batas_jumlah')
      .eq('id_pengguna', user.id)
      .eq('id_kategori', id_kategori)
      .eq('bulan', bulan)
      .eq('tahun', tahun)
      .maybeSingle();

    if (ang) {
      const startDate = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
      const endDate =
        bulan === 12 ? `${tahun + 1}-01-01` : `${tahun}-${String(bulan + 1).padStart(2, '0')}-01`;

      const { data: trxList } = await supabase
        .from('transaksi')
        .select('jumlah')
        .eq('id_pengguna', user.id)
        .eq('id_kategori', id_kategori)
        .eq('jenis', 'PENGELUARAN')
        .gte('tanggal', startDate)
        .lt('tanggal', endDate);

      const terpakai = (trxList || []).reduce((acc, item) => acc + Math.round(Number(item.jumlah)), 0);
      const evaluasi = evaluasiPeringatanAnggaran({
        idKategori: id_kategori,
        namaKategori: kat.nama,
        bulan,
        tahun,
        terpakai,
        batasJumlah: ang.batas_jumlah,
      });

      if (evaluasi) {
        warning = evaluasi.pesan;
        await supabase.from('notifikasi').upsert(
          {
            jenis: 'PERINGATAN_ANGGARAN',
            pesan: evaluasi.pesan,
            id_pengguna: user.id,
            kunci_unik: evaluasi.kunciUnik,
          },
          { onConflict: 'id_pengguna,kunci_unik', ignoreDuplicates: true }
        );
      }
    }
  }

  revalidatePath('/dashboard');
  revalidatePath('/transaksi');
  revalidatePath('/anggaran');
  revalidatePath('/insight');
  revalidatePath('/notifikasi');
  revalidatePath('/laporan');

  return { ok: true, message: 'Transaksi diperbarui.', warning };
}

export async function hapusTransaksi(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Sesi berakhir.' };
  }

  const { error } = await supabase
    .from('transaksi')
    .delete()
    .eq('id', id)
    .eq('id_pengguna', user.id);

  if (error) {
    return { ok: false, message: 'Gagal menghapus transaksi.' };
  }

  revalidatePath('/dashboard');
  revalidatePath('/transaksi');
  revalidatePath('/anggaran');
  revalidatePath('/insight');
  revalidatePath('/laporan');

  return { ok: true, message: 'Transaksi dihapus.' };
}
