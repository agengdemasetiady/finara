'use client';

import React, { useState } from 'react';
import { Plus, Trash, ArrowsClockwise } from '@phosphor-icons/react';
import { buatTagihan, hapusTagihan, toggleStatusTagihan } from '@/lib/actions/tagihan';
import { useToast } from '@/components/ui/ToastProvider';
import { formatAngka, formatRupiah, formatTanggal } from '@/lib/format';

export interface TagihanViewItem {
  id: string;
  nama: string;
  jumlah: number | null;
  tanggal_jatuh_tempo: string;
  berulang: boolean;
  aktif: boolean;
  selisihHari: number;
}

export function TagihanClient({ items }: { items: TagihanViewItem[] }) {
  const { showToast } = useToast();
  const [nama, setNama] = useState('');
  const [jumlahDigits, setJumlahDigits] = useState('');
  const [jatuhTempo, setJatuhTempo] = useState('');
  const [berulang, setBerulang] = useState(true);
  const [saving, setSaving] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (nama.trim().length < 2) {
      showToast('Nama tagihan minimal 2 karakter.', 'error');
      return;
    }
    if (!jatuhTempo) {
      showToast('Pilih tanggal jatuh tempo.', 'error');
      return;
    }

    setSaving(true);
    const nominal = jumlahDigits ? parseInt(jumlahDigits, 10) : null;
    const res = await buatTagihan({
      nama: nama.trim(),
      jumlah: nominal,
      tanggal_jatuh_tempo: jatuhTempo,
      berulang,
      aktif: true,
    });
    setSaving(false);

    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }

    setNama('');
    setJumlahDigits('');
    setJatuhTempo('');
    showToast(res.message, 'success');
  }

  async function handleToggle(id: string, aktif: boolean) {
    const res = await toggleStatusTagihan(id, aktif);
    if (!res.ok) showToast(res.message, 'error');
    else showToast(res.message, 'success');
  }

  async function handleDelete(id: string) {
    const res = await hapusTagihan(id);
    if (!res.ok) showToast(res.message, 'error');
    else showToast(res.message, 'success');
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Form Tambah Pengingat */}
      <form onSubmit={handleCreate} className="fn-card p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Nama tagihan
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Bayar Kos"
            className="fn-input"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Nominal perkiraan (opsional)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={jumlahDigits ? formatAngka(jumlahDigits) : ''}
            onChange={(e) => setJumlahDigits(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="Contoh: 750.000"
            className="fn-input fn-num"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Tanggal jatuh tempo
          </label>
          <input
            type="date"
            value={jatuhTempo}
            onChange={(e) => setJatuhTempo(e.target.value)}
            className="fn-input"
          />
        </div>

        <div className="flex items-center justify-between gap-2">
          <label className="inline-flex items-center gap-2 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={berulang}
              onChange={(e) => setBerulang(e.target.checked)}
              className="w-4 h-4 accent-[#0B5C46]"
            />
            <span>Bulanan</span>
          </label>

          <button type="submit" disabled={saving} className="fn-btn fn-btn-primary">
            <Plus size={18} weight="bold" />
            <span>Tambah</span>
          </button>
        </div>
      </form>

      {/* Daftar Tagihan */}
      {items.length === 0 ? (
        <div className="fn-card p-8 text-center">
          <p className="fn-display text-lg font-semibold">Belum ada pengingat tagihan</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Tambahkan jadwal kos, listrik, internet, atau langganan agar tidak terlambat bayar.
          </p>
        </div>
      ) : (
        <div className="fn-card overflow-hidden">
          <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {items.map((t) => (
              <li key={t.id} className="p-4 sm:px-5 flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm">{t.nama}</p>
                    {t.berulang && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
                      >
                        <ArrowsClockwise size={12} />
                        <span>Bulanan</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-0.5 fn-num" style={{ color: 'var(--muted)' }}>
                    Jatuh tempo {formatTanggal(t.tanggal_jatuh_tempo)}
                    {t.jumlah ? ` • ${formatRupiah(t.jumlah)}` : ''}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <span
                    className="text-xs font-semibold px-3 py-1 rounded-full fn-num"
                    style={{
                      backgroundColor: !t.aktif
                        ? 'var(--bg)'
                        : t.selisihHari <= 3
                          ? 'var(--accent-soft)'
                          : 'var(--primary-soft)',
                      color: !t.aktif
                        ? 'var(--muted)'
                        : t.selisihHari <= 3
                          ? 'var(--accent-strong)'
                          : 'var(--primary)',
                    }}
                  >
                    {!t.aktif
                      ? 'Nonaktif'
                      : t.selisihHari < 0
                        ? 'Lewat tempo'
                        : t.selisihHari === 0
                          ? 'Hari ini'
                          : `${t.selisihHari} hari lagi`}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleToggle(t.id, !t.aktif)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer"
                    style={{ borderColor: 'var(--border-strong)' }}
                  >
                    {t.aktif ? 'Jeda' : 'Aktifkan'}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(t.id)}
                    aria-label={`Hapus tagihan ${t.nama}`}
                    className="p-2 rounded-xl border hover:opacity-80 cursor-pointer"
                    style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
