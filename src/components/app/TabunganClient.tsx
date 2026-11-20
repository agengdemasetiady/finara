'use client';

import React, { useState } from 'react';
import { PiggyBank, Plus, Trash, ClockCounterClockwise, X } from '@phosphor-icons/react';
import {
  buatTargetTabungan,
  hapusTargetTabungan,
  catatSetoranTabungan,
} from '@/lib/actions/tabungan';
import { useToast } from '@/components/ui/ToastProvider';
import { formatAngka, formatRupiah, formatTanggal, getTodayISO } from '@/lib/format';

export interface TargetTabunganView {
  id: string;
  nama: string;
  targetJumlah: number;
  tanggal: string | null;
  terkumpul: number;
  kurang: number;
  persentase: number;
  tercapai: boolean;
  setoran: Array<{ id: string; jumlah: number; tanggal: string }>;
}

export function TabunganClient({ targets }: { targets: TargetTabunganView[] }) {
  const { showToast } = useToast();
  const [nama, setNama] = useState('');
  const [targetDigits, setTargetDigits] = useState('');
  const [tenggat, setTenggat] = useState('');
  const [creating, setCreating] = useState(false);

  // Modal + Setoran
  const [depositTarget, setDepositTarget] = useState<TargetTabunganView | null>(null);
  const [depositDigits, setDepositDigits] = useState('');
  const [depositDate, setDepositDate] = useState(getTodayISO());
  const [depositing, setDepositing] = useState(false);

  // Drawer riwayat setoran
  const [historyTarget, setHistoryTarget] = useState<TargetTabunganView | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const targetJumlah = parseInt(targetDigits || '0', 10);
    if (nama.trim().length < 2) {
      showToast('Nama target minimal 2 karakter.', 'error');
      return;
    }
    if (targetJumlah <= 0) {
      showToast('Nominal target harus lebih dari 0.', 'error');
      return;
    }

    setCreating(true);
    const res = await buatTargetTabungan({
      nama: nama.trim(),
      target_jumlah: targetJumlah,
      tanggal: tenggat || null,
    });
    setCreating(false);

    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }

    setNama('');
    setTargetDigits('');
    setTenggat('');
    showToast(res.message, 'success');
  }

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault();
    if (!depositTarget) return;
    const jumlah = parseInt(depositDigits || '0', 10);
    if (jumlah <= 0) {
      showToast('Nominal setoran harus lebih dari 0.', 'error');
      return;
    }

    setDepositing(true);
    const res = await catatSetoranTabungan({
      id_target: depositTarget.id,
      jumlah,
      tanggal: depositDate,
    });
    setDepositing(false);

    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }

    setDepositTarget(null);
    setDepositDigits('');
    showToast(res.message, 'success');
  }

  async function handleDelete(id: string) {
    const res = await hapusTargetTabungan(id);
    if (!res.ok) {
      showToast(res.message, 'error');
      return;
    }
    showToast(res.message, 'success');
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Form Buat Target Baru */}
      <form onSubmit={handleCreate} className="fn-card p-5 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Nama tujuan
          </label>
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Contoh: Sepeda baru"
            className="fn-input"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Target nominal (Rp)
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={targetDigits ? formatAngka(targetDigits) : ''}
            onChange={(e) => setTargetDigits(e.target.value.replace(/\D/g, '').slice(0, 12))}
            placeholder="Contoh: 2.000.000"
            className="fn-input fn-num"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--muted)' }}>
            Tenggat (opsional)
          </label>
          <input
            type="date"
            value={tenggat}
            onChange={(e) => setTenggat(e.target.value)}
            className="fn-input"
          />
        </div>

        <button type="submit" disabled={creating} className="fn-btn fn-btn-primary w-full">
          <Plus size={18} weight="bold" />
          <span>{creating ? 'Menyimpan...' : 'Buat target'}</span>
        </button>
      </form>

      {/* Kartu Kantong Tabungan */}
      {targets.length === 0 ? (
        <div className="fn-card p-8 text-center">
          <p className="fn-display text-lg font-semibold">Belum ada target tabungan</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Buat target pertamamu di atas dan catat setoran tiap kali menyisihkan uang.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {targets.map((t) => (
            <article key={t.id} className="fn-card p-5 flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="w-11 h-11 rounded-2xl inline-flex items-center justify-center shrink-0"
                    style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
                  >
                    <PiggyBank size={24} weight="duotone" />
                  </span>
                  <div>
                    <h2 className="fn-display text-lg font-semibold">{t.nama}</h2>
                    {t.tanggal && (
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        Tenggat {formatTanggal(t.tanggal)}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  aria-label={`Hapus target ${t.nama}`}
                  className="p-2 rounded-xl border hover:opacity-80 cursor-pointer"
                  style={{ borderColor: 'var(--border)', color: 'var(--danger)' }}
                >
                  <Trash size={16} />
                </button>
              </div>

              <div>
                <p className="fn-display text-2xl font-bold fn-num">
                  {formatRupiah(t.terkumpul)}{' '}
                  <span className="text-xs font-normal" style={{ color: 'var(--muted)' }}>
                    dari {formatRupiah(t.targetJumlah)}
                  </span>
                </p>

                <div className="h-2.5 rounded-full overflow-hidden mt-2.5" style={{ backgroundColor: 'var(--primary-soft)' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${t.persentase}%`, backgroundColor: 'var(--primary)' }}
                  />
                </div>

                <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--muted)' }}>
                  <strong style={{ color: 'var(--ink)' }}>{t.persentase}% terkumpul</strong>
                  <span className="fn-num">
                    {t.tercapai ? 'Target tercapai!' : `Kurang ${formatRupiah(t.kurang)}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setDepositTarget(t);
                    setDepositDigits('');
                    setDepositDate(getTodayISO());
                  }}
                  className="fn-btn fn-btn-primary flex-1 text-xs py-2.5"
                >
                  <Plus size={16} weight="bold" />
                  <span>Setoran</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHistoryTarget(t)}
                  className="fn-btn fn-btn-ghost text-xs py-2.5 px-3.5"
                >
                  <ClockCounterClockwise size={16} />
                  <span>Riwayat ({t.setoran.length})</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Tambah Setoran */}
      {depositTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(13, 23, 19, 0.55)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setDepositTarget(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-3xl p-6 border shadow-xl"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="fn-display text-lg font-semibold">Setoran: {depositTarget.nama}</h3>
              <button
                type="button"
                onClick={() => setDepositTarget(null)}
                className="w-8 h-8 rounded-full inline-flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg)' }}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleDeposit} className="flex flex-col gap-3.5">
              <div>
                <label className="block text-xs font-semibold mb-1">Nominal setoran (Rp)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  value={depositDigits ? formatAngka(depositDigits) : ''}
                  onChange={(e) => setDepositDigits(e.target.value.replace(/\D/g, '').slice(0, 12))}
                  placeholder="Contoh: 50.000"
                  className="fn-input fn-num font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">Tanggal</label>
                <input
                  type="date"
                  value={depositDate}
                  onChange={(e) => setDepositDate(e.target.value)}
                  className="fn-input"
                />
              </div>

              <button type="submit" disabled={depositing} className="fn-btn fn-btn-primary w-full mt-1">
                {depositing ? 'Menyimpan...' : 'Simpan setoran'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Riwayat Setoran */}
      {historyTarget && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(13, 23, 19, 0.55)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setHistoryTarget(null);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-3xl p-6 border shadow-xl max-h-[80vh] flex flex-col"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="fn-display text-lg font-semibold">Riwayat: {historyTarget.nama}</h3>
              <button
                type="button"
                onClick={() => setHistoryTarget(null)}
                className="w-8 h-8 rounded-full inline-flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg)' }}
              >
                <X size={16} />
              </button>
            </div>

            {historyTarget.setoran.length === 0 ? (
              <p className="text-sm py-6 text-center" style={{ color: 'var(--muted)' }}>
                Belum ada setoran untuk target ini.
              </p>
            ) : (
              <ul className="divide-y overflow-y-auto" style={{ borderColor: 'var(--border)' }}>
                {historyTarget.setoran.map((s) => (
                  <li key={s.id} className="py-3 flex items-center justify-between text-sm">
                    <span style={{ color: 'var(--muted)' }}>{formatTanggal(s.tanggal)}</span>
                    <span className="font-semibold fn-num" style={{ color: 'var(--primary)' }}>
                      +{formatRupiah(s.jumlah)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
