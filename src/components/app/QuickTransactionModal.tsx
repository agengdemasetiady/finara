'use client';

import React, { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { PencilSimple, X } from '@phosphor-icons/react';
import { tambahTransaksi } from '@/lib/actions/transaksi';
import { useToast } from '@/components/ui/ToastProvider';
import { CategoryIconChip } from '@/components/ui/CategoryIcon';
import { formatAngka, getTodayISO } from '@/lib/format';
import { subDays, format } from 'date-fns';
import type { JenisTrx } from '@/lib/types/database';

export interface SimpleCategory {
  id: string;
  nama: string;
  jenis: JenisTrx;
  ikon: string | null;
  warna: string | null;
}

const JENIS_OPTIONS = ['PENGELUARAN', 'PEMASUKAN'] as const;

function createRequestNonce(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function QuickTransactionModal({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: SimpleCategory[];
}) {
  const router = useRouter();
  const { showToast } = useToast();
  const [, startRefresh] = useTransition();
  const dialogRef = useRef<HTMLDivElement>(null);
  const amountRef = useRef<HTMLInputElement>(null);
  const submitGuardRef = useRef(false);

  const [jenis, setJenis] = useState<JenisTrx>('PENGELUARAN');
  const [rawDigits, setRawDigits] = useState('');
  const [selectedKat, setSelectedKat] = useState('');
  const [tanggal, setTanggal] = useState(getTodayISO());
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [catatan, setCatatan] = useState('');
  const [amountEditable, setAmountEditable] = useState(false);

  const filteredCats = useMemo(
    () => categories.filter((c) => c.jenis === jenis),
    [categories, jenis]
  );

  useEffect(() => {
    if (filteredCats.length > 0 && !filteredCats.some((c) => c.id === selectedKat)) {
      setSelectedKat(filteredCats[0].id);
    }
  }, [filteredCats, selectedKat]);

  useEffect(() => {
    if (open) {
      submitGuardRef.current = false;
      setAmountEditable(false);
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
      setRawDigits('');
      setCatatan('');
      setShowNote(false);
      setShowCustomDate(false);
      setTanggal(getTodayISO());
      requestAnimationFrame(() => {
        dialogRef.current?.focus({ preventScroll: true });
      });
    }
  }, [open]);

  if (!open) return null;

  const todayISO = getTodayISO();
  const yesterdayISO = format(subDays(new Date(), 1), 'yyyy-MM-dd');

  const gridColsClass =
    filteredCats.length === 1
      ? 'grid-cols-1'
      : filteredCats.length === 2
        ? 'grid-cols-2'
        : 'grid-cols-3';

  function handleAmountChange(val: string) {
    const digits = val.replace(/\D/g, '').slice(0, 12);
    setRawDigits(digits);
  }

  function enableAndFocusAmount() {
    setAmountEditable(true);
    requestAnimationFrame(() => {
      amountRef.current?.focus();
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitGuardRef.current) return;

    const nominal = parseInt(rawDigits || '0', 10);
    if (nominal <= 0) {
      showToast('Nominal harus lebih dari 0.', 'error');
      enableAndFocusAmount();
      return;
    }
    if (!selectedKat) {
      showToast('Pilih kategori terlebih dahulu.', 'error');
      return;
    }

    submitGuardRef.current = true;
    const idempotencyKey = createRequestNonce();
    const tempId = `temp-${idempotencyKey}`;
    const cleanNote = catatan.trim() || null;
    const payload = {
      jumlah: nominal,
      jenis,
      tanggal,
      catatan: cleanNote,
      id_kategori: selectedKat,
      idempotencyKey,
    };

    window.dispatchEvent(
      new CustomEvent('finara:trx-optimistic-add', {
        detail: {
          id: tempId,
          jumlah: nominal,
          jenis,
          tanggal,
          catatan: cleanNote,
          id_kategori: selectedKat,
        },
      })
    );

    showToast('Tersimpan', 'success');
    onClose();

    void tambahTransaksi(payload).then((res) => {
      if (!res.ok) {
        window.dispatchEvent(
          new CustomEvent('finara:trx-rollback', {
            detail: { id: tempId },
          })
        );
        showToast(res.message, 'error');
        return;
      }

      window.dispatchEvent(
        new CustomEvent('finara:trx-confirmed', {
          detail: { id: tempId },
        })
      );

      if (res.warning) {
        showToast(res.warning, 'warning');
      }

      startRefresh(() => {
        router.refresh();
      });
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ backgroundColor: 'rgba(13, 23, 19, 0.55)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fn-catat-title"
        tabIndex={-1}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl border max-h-[92dvh] overflow-y-auto focus:outline-none"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="fn-catat-title" className="fn-display text-lg font-semibold">
            Catat transaksi
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="w-9 h-9 rounded-full inline-flex items-center justify-center hover:opacity-75 cursor-pointer"
            style={{ backgroundColor: 'var(--bg)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div
            className="grid grid-cols-2 p-1 rounded-full"
            style={{ backgroundColor: 'var(--bg)' }}
            role="group"
            aria-label="Jenis transaksi"
          >
            {JENIS_OPTIONS.map((item) => {
              const active = jenis === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setJenis(item)}
                  className="py-2 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                  style={{
                    backgroundColor: active ? 'var(--primary)' : 'transparent',
                    color: active ? 'var(--on-primary)' : 'var(--muted)',
                  }}
                >
                  {item === 'PENGELUARAN' ? 'Pengeluaran' : 'Pemasukan'}
                </button>
              );
            })}
          </div>

          <div
            onPointerDown={() => setAmountEditable(true)}
            className="rounded-2xl px-4 py-3 border flex items-baseline gap-2"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border-strong)' }}
          >
            <span className="text-base font-semibold" style={{ color: 'var(--muted)' }}>
              Rp
            </span>
            <input
              ref={amountRef}
              type="text"
              inputMode="numeric"
              readOnly={!amountEditable}
              onPointerDown={() => setAmountEditable(true)}
              onFocus={() => setAmountEditable(true)}
              aria-label="Nominal transaksi"
              value={rawDigits ? formatAngka(rawDigits) : ''}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent fn-display text-3xl font-bold focus:outline-none fn-num"
            />
          </div>

          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted)' }}>
              Kategori
            </p>
            <div className={`grid ${gridColsClass} gap-2 max-h-52 overflow-y-auto pr-0.5`}>
              {filteredCats.map((kat) => {
                const active = selectedKat === kat.id;
                return (
                  <button
                    key={kat.id}
                    type="button"
                    onClick={() => setSelectedKat(kat.id)}
                    className="flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 min-h-[78px] rounded-2xl border text-center transition-all cursor-pointer"
                    style={{
                      backgroundColor: active ? 'var(--primary-soft)' : 'var(--bg)',
                      borderColor: active ? 'var(--primary)' : 'var(--border)',
                    }}
                  >
                    <CategoryIconChip ikon={kat.ikon} warna={kat.warna} size={32} />
                    <span className="w-full text-[11px] sm:text-xs font-medium leading-tight line-clamp-2 break-words">
                      {kat.nama}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setTanggal(todayISO);
                  setShowCustomDate(false);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer"
                style={{
                  backgroundColor: tanggal === todayISO && !showCustomDate ? 'var(--primary-soft)' : 'var(--bg)',
                  borderColor: tanggal === todayISO && !showCustomDate ? 'var(--primary)' : 'var(--border)',
                  color: tanggal === todayISO && !showCustomDate ? 'var(--primary)' : 'var(--muted)',
                }}
              >
                Hari ini
              </button>
              <button
                type="button"
                onClick={() => {
                  setTanggal(yesterdayISO);
                  setShowCustomDate(false);
                }}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer"
                style={{
                  backgroundColor: tanggal === yesterdayISO && !showCustomDate ? 'var(--primary-soft)' : 'var(--bg)',
                  borderColor: tanggal === yesterdayISO && !showCustomDate ? 'var(--primary)' : 'var(--border)',
                  color: tanggal === yesterdayISO && !showCustomDate ? 'var(--primary)' : 'var(--muted)',
                }}
              >
                Kemarin
              </button>
              <button
                type="button"
                onClick={() => setShowCustomDate((v) => !v)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer"
                style={{
                  backgroundColor: showCustomDate ? 'var(--primary-soft)' : 'var(--bg)',
                  borderColor: showCustomDate ? 'var(--primary)' : 'var(--border)',
                  color: showCustomDate ? 'var(--primary)' : 'var(--muted)',
                }}
              >
                Pilih
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowNote((v) => !v)}
              aria-label="Tambah catatan"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border cursor-pointer"
              style={{
                backgroundColor: showNote || catatan ? 'var(--accent-soft)' : 'var(--bg)',
                borderColor: 'var(--border)',
                color: 'var(--ink)',
              }}
            >
              <PencilSimple size={14} weight="bold" />
              <span>Catatan</span>
            </button>
          </div>

          {showCustomDate && (
            <input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="fn-input text-sm"
            />
          )}

          {showNote && (
            <input
              type="text"
              maxLength={200}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Contoh: Makan siang warteg"
              className="fn-input text-sm"
            />
          )}

          <button type="submit" className="fn-btn fn-btn-primary w-full min-h-[48px]">
            Simpan
          </button>
        </form>
      </div>
    </div>
  );
}
