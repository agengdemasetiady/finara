'use client';

import React, { useEffect, useState } from 'react';
import { Bell, Check, Checks, Warning } from '@phosphor-icons/react';
import { tandaiNotifikasiDibaca, tandaiSemuaNotifikasiDibaca } from '@/lib/actions/notifikasi';
import { useToast } from '@/components/ui/ToastProvider';
import { formatTanggal } from '@/lib/format';
import type { Notifikasi } from '@/lib/types/database';

export function NotifikasiClient({ items }: { items: Notifikasi[] }) {
  const { showToast } = useToast();
  const [localItems, setLocalItems] = useState<Notifikasi[]>(items);

  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  useEffect(() => {
    function onNotifRead(e: Event) {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (!id) return;
      setLocalItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, sudah_dibaca: true } : n))
      );
    }

    function onNotifReadAll() {
      setLocalItems((prev) => prev.map((n) => ({ ...n, sudah_dibaca: true })));
    }

    window.addEventListener('finara:notif-read', onNotifRead);
    window.addEventListener('finara:notif-read-all', onNotifReadAll);
    return () => {
      window.removeEventListener('finara:notif-read', onNotifRead);
      window.removeEventListener('finara:notif-read-all', onNotifReadAll);
    };
  }, []);

  const unreadCount = localItems.filter((n) => !n.sudah_dibaca).length;

  function handleReadOne(notif: Notifikasi) {
    if (notif.sudah_dibaca) return;
    const snapshot = localItems;

    setLocalItems((prev) =>
      prev.map((n) => (n.id === notif.id ? { ...n, sudah_dibaca: true } : n))
    );
    window.dispatchEvent(new CustomEvent('finara:notif-read', { detail: { id: notif.id } }));

    void tandaiNotifikasiDibaca(notif.id).then((res) => {
      if (!res.ok) {
        setLocalItems(snapshot);
        showToast(res.message, 'error');
      }
    });
  }

  function handleReadAll() {
    if (unreadCount === 0) return;
    const snapshot = localItems;

    setLocalItems((prev) => prev.map((n) => ({ ...n, sudah_dibaca: true })));
    window.dispatchEvent(new CustomEvent('finara:notif-read-all'));
    showToast('Semua notifikasi ditandai sudah dibaca.', 'success');

    void tandaiSemuaNotifikasiDibaca().then((res) => {
      if (!res.ok) {
        setLocalItems(snapshot);
        showToast(res.message, 'error');
      }
    });
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

      {localItems.length === 0 ? (
        <div className="fn-card p-8 text-center">
          <p className="fn-display text-lg font-semibold">Belum ada notifikasi</p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Peringatan anggaran (80% dan 100%) serta pengingat tagihan akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="fn-card overflow-hidden">
          <ul className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {localItems.map((n) => {
              const isAnggaran = n.jenis === 'PERINGATAN_ANGGARAN';
              return (
                <li
                  key={n.id}
                  onClick={() => handleReadOne(n)}
                  className={`p-4 sm:px-5 flex items-center justify-between gap-3 transition-colors ${
                    n.sudah_dibaca ? 'cursor-default' : 'cursor-pointer'
                  }`}
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
                      <p className={`text-sm ${n.sudah_dibaca ? 'font-normal' : 'font-semibold'}`}>
                        {n.pesan}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                        {isAnggaran ? 'Peringatan Anggaran' : 'Pengingat Tagihan'} •{' '}
                        {formatTanggal(n.dibuat_pada)}
                      </p>
                    </div>
                  </div>

                  {!n.sudah_dibaca && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadOne(n);
                      }}
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
