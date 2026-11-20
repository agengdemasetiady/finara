'use client';

import React from 'react';
import { Bell, Check, Checks, Warning } from '@phosphor-icons/react';
import { tandaiNotifikasiDibaca, tandaiSemuaNotifikasiDibaca } from '@/lib/actions/notifikasi';
import { useToast } from '@/components/ui/ToastProvider';
import { formatTanggal } from '@/lib/format';
import type { Notifikasi } from '@/lib/types/database';

export function NotifikasiClient({ items }: { items: Notifikasi[] }) {
  const { showToast } = useToast();
  const unreadCount = items.filter((n) => !n.sudah_dibaca).length;

  async function handleReadOne(id: string) {
    const res = await tandaiNotifikasiDibaca(id);
    if (!res.ok) showToast(res.message, 'error');
  }

  async function handleReadAll() {
    const res = await tandaiSemuaNotifikasiDibaca();
    if (!res.ok) showToast(res.message, 'error');
    else showToast(res.message, 'success');
  }

  return (
    <div className="flex flex-col gap-4">
      {unreadCount > 0 && (
        <div className="flex justify-end">
          <button type="button" onClick={handleReadAll} className="fn-btn fn-btn-ghost text-xs py-2">
            <Checks size={16} weight="bold" />
            <span>Tandai semua dibaca ({unreadCount})</span>
          </button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="fn-card p-8 text-center">
          <p className="fn-display text-lg font-semibold">Belum ada notifikasi</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Peringatan anggaran (80% dan 100%) serta pengingat tagihan akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="fn-card overflow-hidden">
          <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {items.map((n) => {
              const isAnggaran = n.jenis === 'PERINGATAN_ANGGARAN';
              return (
                <li
                  key={n.id}
                  className="p-4 sm:px-5 flex items-center justify-between gap-3"
                  style={{
                    backgroundColor: n.sudah_dibaca ? 'transparent' : 'var(--primary-soft)',
                  }}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className="p-2.5 rounded-2xl shrink-0 mt-0.5"
                      style={{
                        backgroundColor: isAnggaran ? 'var(--accent-soft)' : 'var(--surface)',
                        color: isAnggaran ? 'var(--accent-strong)' : 'var(--primary)',
                      }}
                    >
                      {isAnggaran ? <Warning size={20} weight="fill" /> : <Bell size={20} weight="fill" />}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{n.pesan}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                        {isAnggaran ? 'Peringatan Anggaran' : 'Pengingat Tagihan'} •{' '}
                        {formatTanggal(n.dibuat_pada)}
                      </p>
                    </div>
                  </div>

                  {!n.sudah_dibaca && (
                    <button
                      type="button"
                      onClick={() => handleReadOne(n.id)}
                      aria-label="Tandai dibaca"
                      className="p-2 rounded-full border shrink-0 cursor-pointer"
                      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border-strong)' }}
                    >
                      <Check size={16} weight="bold" style={{ color: 'var(--primary)' }} />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
