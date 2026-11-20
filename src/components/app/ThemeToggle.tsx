'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from '@phosphor-icons/react';

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === 'dark');
  }, []);

  function toggleTheme() {
    const next = !dark;
    const theme = next ? 'dark' : 'light';
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('finara-theme', theme);
    } catch {}
    setDark(next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
      className="inline-flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer"
      style={{ color: 'var(--muted)' }}
    >
      {dark ? <Sun size={20} weight="duotone" /> : <Moon size={20} weight="duotone" />}
      {!compact && <span>{dark ? 'Mode terang' : 'Mode gelap'}</span>}
    </button>
  );
}
