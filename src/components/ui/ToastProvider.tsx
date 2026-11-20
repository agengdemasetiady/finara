'use client';

import React, { createContext, useCallback, useContext, useState } from 'react';
import { CheckCircle, WarningCircle, Warning, X } from '@phosphor-icons/react';

export type ToastVariant = 'success' | 'warning' | 'error';

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'success') => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      setToasts((prev) => [...prev, { id, message, variant }]);
      setTimeout(() => removeToast(id), 4500);
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-20 lg:bottom-6 right-4 z-[120] flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2rem)] pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-lg border transition-all"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor:
                t.variant === 'warning'
                  ? 'var(--accent)'
                  : t.variant === 'error'
                    ? 'var(--danger)'
                    : 'var(--primary)',
              color: 'var(--ink)',
            }}
          >
            {t.variant === 'warning' ? (
              <Warning size={20} weight="fill" style={{ color: 'var(--accent-strong)', flexShrink: 0, marginTop: 2 }} />
            ) : t.variant === 'error' ? (
              <WarningCircle size={20} weight="fill" style={{ color: 'var(--danger)', flexShrink: 0, marginTop: 2 }} />
            ) : (
              <CheckCircle size={20} weight="fill" style={{ color: 'var(--primary)', flexShrink: 0, marginTop: 2 }} />
            )}
            <p className="text-sm font-medium leading-snug flex-1">{t.message}</p>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              aria-label="Tutup notifikasi"
              className="p-1 rounded-lg opacity-70 hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
