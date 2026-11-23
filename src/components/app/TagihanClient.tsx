'use client';

import React, { useEffect, useState } from 'react';
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
  const [localItems, setLocalItems] = useState<TagihanViewItem[]>(items);
  const [togglingIds, setTogglingIds] = useState<Record<string, boolean>>({});
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});

  const [nama, setNama] = useState('');
  const [jumlahDigits, setJumlahDigits] = useState('');
  const [jatuhTempo, setJatuhTempo] = useState('');
  const [berulang, setBerulang] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

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

  async function handleToggle(id: string, targetAktif: boolean) {
    if (togglingIds[id]) return;

    const prevAktif = !targetAktif;
    setTogglingIds((prev) => ({ ...prev, [id]: true }));
    setLocalItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, aktif: targetAktif } : item))
    );

    const res = await toggleStatusTagihan(id, targetAktif);

    setTogglingIds((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    if (!res.ok) {
      setLocalItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, aktif: prevAktif } : item))
      );
      showToast(res.message, 'error');
      return;
    }

    showToast(res.message, 'success');
  }

  async function handleDelete(id: string) {
    if (deletingIds[id]) return;

    const snapshot = localItems;
    setDeletingIds((prev) => ({ ...prev, [id]: true }));
    setLocalItems((prev) => prev.filter((item) => item.id !== id));

    const res = await hapusTagihan(id);

    setDeletingIds((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    if (!res.ok) {
      setLocalItems(snapshot);
      showToast(res.message, 'error');
      return;
    }

    showToast(res.message, 'success');
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

          <button
            type="submit"
            disabled={saving}
            className="fn-btn fn-btn-primary active:scale-95 transition-transform"
          >
            {saving ? (
              <>
                <ArrowsClockwise size={18} weight="bold" className="animate-spin" />
                <span>Menyimpan...</span>
              </>
            ) : (
              <>
                <Plus size={18} weight="bold" />
                <span>Tambah</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Daftar Tagihan */}
      {localItems.length === 0 ? (
        <div className="fn-card p-8 text-center">
          <p className="fn-display text-lg font-semibold">Belum ada pengingat tagihan</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Tambahkan jadwal kos, listrik, internet, atau langganan agar tidak terlambat bayar.
          </p>
        </div>
      ) : (
        <div className="fn-card overflow-hidden">
          <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {localItems.map((t) => {
              const isToggling = Boolean(togglingIds[t.id]);
              return (
                <li
                  key={t.id}
                  className="p-4 sm:px-5 flex items-center justify-between gap-3 flex-wrap transition-opacity duration-200"
                  style={{ opacity: t.aktif ? 1 : 0.78 }}
                >
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

                  <div className="flex items-center gap-2 sm:gap-2.5">
                    <span
                      className="text-xs font-semibold px-3 py-1 rounded-full fn-num transition-colors duration-200"
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
                      disabled={isToggling}
                      aria-busy={isToggling}
                      className="inline-flex items-center justify-center gap-1.5 min-w-[86px] px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer active:scale-95 transition-all duration-150 disabled:opacity-75"
                      style={{
                        backgroundColor: t.aktif ? 'var(--surface)' : 'var(--primary-soft)',
                        borderColor: t.aktif ? 'var(--border-strong)' : 'var(--primary)',
                        color: t.aktif ? 'inherit' : 'var(--primary)',
                      }}
                    >
                      {isToggling && (
                        <ArrowsClockwise size={13} weight="bold" className="animate-spin shrink-0" />
                      )}
                      <span>{t.aktif ? 'Jeda' : 'Aktifkan'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(t.id)}
                      aria-label={`Hapus tagihan ${t.nama}`}
                      className="p-2 rounded-xl border hover:opacity-80 active:scale-95 transition-all duration-150 cursor-pointer"
                      style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}
                    >
                      <Trash size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}