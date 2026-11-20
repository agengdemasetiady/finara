'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  House,
  ListBullets,
  Wallet,
  PiggyBank,
  Receipt,
  Lightbulb,
  FileArrowDown,
  Tag,
  Bell,
  GearSix,
  Plus,
  DotsThree,
  SignOut,
  Users,
  ChartBar,
  X,
} from '@phosphor-icons/react';
import { keluarAkun } from '@/lib/actions/auth';
import { ThemeToggle } from './ThemeToggle';
import { PeriodSelector } from './PeriodSelector';
import { QuickTransactionModal, type SimpleCategory } from './QuickTransactionModal';
import { getLabelProfil } from '@/lib/format';
import type { PeranAkun, ProfilTipe } from '@/lib/types/database';

interface AppShellProps {
  akun: {
    id: string;
    email: string;
    nama: string;
    profil: ProfilTipe | null;
    peran: PeranAkun;
  };
  categories: SimpleCategory[];
  unreadNotifCount: number;
  children: React.ReactNode;
}

const USER_NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: House },
  { href: '/transaksi', label: 'Transaksi', icon: ListBullets },
  { href: '/anggaran', label: 'Anggaran', icon: Wallet },
  { href: '/tabungan', label: 'Tabungan', icon: PiggyBank },
  { href: '/tagihan', label: 'Tagihan', icon: Receipt },
  { href: '/insight', label: 'Insight', icon: Lightbulb },
  { href: '/laporan', label: 'Laporan', icon: FileArrowDown },
  { href: '/kategori', label: 'Kategori', icon: Tag },
];

const ADMIN_NAV = [
  { href: '/admin', label: 'Ringkasan', icon: ChartBar },
  { href: '/admin/pengguna', label: 'Pengguna', icon: Users },
  { href: '/admin/kategori', label: 'Kategori Bawaan', icon: Tag },
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/transaksi': 'Transaksi',
  '/anggaran': 'Anggaran',
  '/tabungan': 'Tabungan',
  '/tagihan': 'Tagihan',
  '/insight': 'Insight',
  '/laporan': 'Laporan',
  '/kategori': 'Kategori',
  '/notifikasi': 'Notifikasi',
  '/pengaturan': 'Pengaturan',
  '/admin': 'Panel Admin',
  '/admin/pengguna': 'Kelola Pengguna',
  '/admin/kategori': 'Kategori Bawaan',
};

function getInisial(nama: string): string {
  const parts = nama.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function AppShell({ akun, categories, unreadNotifCount, children }: AppShellProps) {
  const pathname = usePathname();
  const isAdmin = akun.peran === 'admin';
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;

  const [catatOpen, setCatatOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPendingPath(null);
    setProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    if (profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen]);

  const currentPath = pendingPath || pathname;

  useEffect(() => {
    if (isAdmin) return;
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      const isInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
      if (!isInput && (e.key === 'n' || e.key === 'N') && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setCatatOpen(true);
      }
      if (e.key === 'Escape') {
        setCatatOpen(false);
        setMoreOpen(false);
        setProfileMenuOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAdmin]);

  const pageTitle = PAGE_TITLES[currentPath] || 'Finara';
  const showPeriodSelector =
    !isAdmin &&
    ['/dashboard', '/transaksi', '/anggaran', '/insight', '/laporan'].includes(currentPath);

  const labelSubProfil = isAdmin
    ? 'Administrator'
    : akun.profil
    ? getLabelProfil(akun.profil)
    : 'Pengguna';

  return (
    <div className="min-h-screen flex flex-col md:flex-row max-w-full overflow-x-hidden">
      {/* Desktop Sidebar */}
      <aside
        aria-label="Navigasi aplikasi"
        onMouseLeave={() => setProfileMenuOpen(false)}
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-40 border-r transition-all duration-300 ${
          profileMenuOpen ? 'w-[232px]' : 'w-[72px] hover:w-[232px] focus-within:w-[232px]'
        } group`}
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        <div className="p-3.5 flex flex-col gap-4 overflow-y-auto overflow-x-hidden flex-1">
          <Link
            href={isAdmin ? '/admin' : '/dashboard'}
            onClick={() => setPendingPath(isAdmin ? '/admin' : '/dashboard')}
            className="fn-display text-2xl font-bold px-2 py-1 inline-flex items-baseline whitespace-nowrap"
          >
            <span>f</span>
            <span
              className={`transition-opacity duration-200 ${
                profileMenuOpen
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
              }`}
            >
              inara
            </span>
            <span style={{ color: 'var(--accent)' }}>.</span>
          </Link>

          <nav className="flex flex-col gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = currentPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setPendingPath(item.href)}
                  className="flex items-center gap-3.5 px-3 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all active:scale-95"
                  style={{
                    backgroundColor: active ? 'var(--primary-soft)' : 'transparent',
                    color: active ? 'var(--primary)' : 'var(--muted)',
                    fontWeight: active ? 600 : 500,
                  }}
                >
                  <Icon size={20} weight={active ? 'fill' : 'regular'} className="shrink-0" />
                  <span
                    className={`transition-opacity duration-200 ${
                      profileMenuOpen
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}

            {!isAdmin && (
              <>
                <div className="border-t my-1.5" style={{ borderColor: 'var(--border)' }} />

                <Link
                  href="/notifikasi"
                  onClick={() => setPendingPath('/notifikasi')}
                  className="relative flex items-center gap-3.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap active:scale-95 transition-transform"
                  style={{
                    backgroundColor: currentPath === '/notifikasi' ? 'var(--primary-soft)' : 'transparent',
                    color: currentPath === '/notifikasi' ? 'var(--primary)' : 'var(--muted)',
                    fontWeight: currentPath === '/notifikasi' ? 600 : 500,
                  }}
                >
                  <span className="relative shrink-0">
                    <Bell size={20} weight={currentPath === '/notifikasi' ? 'fill' : 'regular'} />
                    {unreadNotifCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: 'var(--accent)' }}
                      />
                    )}
                  </span>
                  <span
                    className={`transition-opacity duration-200 flex items-center gap-2 ${
                      profileMenuOpen
                        ? 'opacity-100'
                        : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
                    }`}
                  >
                    <span>Notifikasi</span>
                    {unreadNotifCount > 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
                      >
                        {unreadNotifCount}
                      </span>
                    )}
                  </span>
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Bottom Section: Profile Card Popover */}
        <div
          ref={profileMenuRef}
          className="relative p-3 mt-auto border-t shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          {/* Pop-up Menu Akun */}
          {profileMenuOpen && (
            <div
              className="absolute bottom-[calc(100%+8px)] left-3 right-3 rounded-2xl border p-2 shadow-xl z-50 flex flex-col gap-1"
              style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div className="px-3 py-1.5 border-b mb-0.5" style={{ borderColor: 'var(--border)' }}>
                <p className="text-xs font-semibold truncate">{akun.nama}</p>
                <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>
                  {akun.email}
                </p>
              </div>

              {!isAdmin && (
                <Link
                  href="/pengaturan"
                  onClick={() => {
                    setPendingPath('/pengaturan');
                    setProfileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: currentPath === '/pengaturan' ? 'var(--primary-soft)' : 'transparent',
                    color: currentPath === '/pengaturan' ? 'var(--primary)' : 'inherit',
                  }}
                >
                  <GearSix size={18} className="shrink-0" />
                  <span>Pengaturan Akun</span>
                </Link>
              )}

              <div className="[&_button]:w-full [&_button]:flex [&_button]:items-center [&_button]:gap-3 [&_button]:px-3 [&_button]:py-2 [&_button]:rounded-xl [&_button]:text-xs [&_button]:font-medium [&_svg]:w-[18px] [&_svg]:h-[18px] [&_svg]:shrink-0">
                <ThemeToggle />
              </div>

              <div className="border-t my-0.5" style={{ borderColor: 'var(--border)' }} />

              <form action={keluarAkun}>
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--danger)' }}
                >
                  <SignOut size={18} className="shrink-0" />
                  <span>Keluar</span>
                </button>
              </form>
            </div>
          )}

          {/* Tombol Kartu Profil */}
          <button
            type="button"
            onClick={() => setProfileMenuOpen((prev) => !prev)}
            className="w-full flex items-center gap-2.5 p-1.5 rounded-2xl border text-left cursor-pointer transition-all active:scale-[0.98]"
            style={{
              backgroundColor: profileMenuOpen ? 'var(--primary-soft)' : 'var(--bg)',
              borderColor: profileMenuOpen ? 'var(--primary)' : 'var(--border)',
            }}
          >
            <div
              className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
            >
              {getInisial(akun.nama)}
            </div>

            <div
              className={`min-w-0 transition-opacity duration-200 ${
                profileMenuOpen
                  ? 'opacity-100'
                  : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
              }`}
            >
              <p className="text-xs font-semibold truncate">{akun.nama}</p>
              <p className="text-[11px] truncate" style={{ color: 'var(--muted)' }}>
                {labelSubProfil}
              </p>
            </div>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:pl-[72px] flex flex-col min-w-0 pb-24 md:pb-8">
        {/* Topbar */}
        <header
          className="sticky top-0 z-30 border-b px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 max-w-full overflow-x-clip"
          style={{
            backgroundColor: 'var(--bg-glass)',
            borderColor: 'var(--border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={isAdmin ? '/admin' : '/dashboard'}
              onClick={() => setPendingPath(isAdmin ? '/admin' : '/dashboard')}
              className="md:hidden fn-display text-xl font-bold inline-flex items-baseline"
            >
              finara<span style={{ color: 'var(--accent)' }}>.</span>
            </Link>
            <span className="hidden md:inline fn-display text-lg font-semibold truncate">{pageTitle}</span>
            {!isAdmin && akun.profil && (
              <span
                className="hidden sm:inline-flex text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
              >
                {getLabelProfil(akun.profil)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            {showPeriodSelector && (
              <Suspense fallback={null}>
                <PeriodSelector />
              </Suspense>
            )}

            {!isAdmin && (
              <>
                <Link
                  href="/notifikasi"
                  onClick={() => setPendingPath('/notifikasi')}
                  aria-label="Notifikasi"
                  className="md:hidden relative w-9 h-9 shrink-0 rounded-full inline-flex items-center justify-center border active:scale-95 transition-transform"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <Bell size={18} />
                  {unreadNotifCount > 0 && (
                    <span
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                </Link>

                <div className="hidden md:block">
                  <button
                    type="button"
                    onClick={() => setCatatOpen(true)}
                    className="fn-btn fn-btn-primary"
                    title="Catat transaksi (Pintasan: N)"
                  >
                    <Plus size={18} weight="bold" />
                    <span>Catat</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          {pendingPath && pendingPath !== pathname ? (
            <div className="flex flex-col gap-5 animate-pulse">
              <div className="space-y-2">
                <div className="h-8 w-44 rounded-xl" style={{ backgroundColor: 'var(--border)' }} />
                <div className="h-4 w-60 rounded-lg" style={{ backgroundColor: 'var(--border)' }} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <div
                  className="h-44 rounded-3xl border md:col-span-3"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                />
                <div
                  className="h-44 rounded-3xl border md:col-span-3"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                />
                <div
                  className="h-60 rounded-3xl border md:col-span-4"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                />
                <div
                  className="h-60 rounded-3xl border md:col-span-2"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                />
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>

      {/* Mobile Bottom Tab Bar */}
      {!isAdmin ? (
        <nav
          aria-label="Navigasi bawah ponsel"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] grid grid-cols-5 items-center"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <Link
            href="/dashboard"
            onClick={() => setPendingPath('/dashboard')}
            className="flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium active:scale-95 transition-transform"
            style={{ color: currentPath === '/dashboard' ? 'var(--primary)' : 'var(--muted)' }}
          >
            <House size={22} weight={currentPath === '/dashboard' ? 'fill' : 'regular'} />
            <span>Beranda</span>
          </Link>

          <Link
            href="/transaksi"
            onClick={() => setPendingPath('/transaksi')}
            className="flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium active:scale-95 transition-transform"
            style={{ color: currentPath === '/transaksi' ? 'var(--primary)' : 'var(--muted)' }}
          >
            <ListBullets size={22} weight={currentPath === '/transaksi' ? 'fill' : 'regular'} />
            <span>Transaksi</span>
          </Link>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setCatatOpen(true)}
              aria-label="Catat transaksi baru"
              className="w-12 h-12 -mt-4 rounded-full shadow-lg inline-flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              style={{ backgroundColor: 'var(--primary)', color: 'var(--on-primary)' }}
            >
              <Plus size={24} weight="bold" />
            </button>
          </div>

          <Link
            href="/anggaran"
            onClick={() => setPendingPath('/anggaran')}
            className="flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium active:scale-95 transition-transform"
            style={{ color: currentPath === '/anggaran' ? 'var(--primary)' : 'var(--muted)' }}
          >
            <Wallet size={22} weight={currentPath === '/anggaran' ? 'fill' : 'regular'} />
            <span>Anggaran</span>
          </Link>

          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium cursor-pointer active:scale-95 transition-transform"
            style={{ color: moreOpen ? 'var(--primary)' : 'var(--muted)' }}
          >
            <DotsThree size={22} weight="bold" />
            <span>Lainnya</span>
          </button>
        </nav>
      ) : (
        <nav
          aria-label="Navigasi admin ponsel"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t px-2 py-2 grid grid-cols-4 items-center"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          {ADMIN_NAV.map((item) => {
            const Icon = item.icon;
            const active = currentPath === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setPendingPath(item.href)}
                className="flex flex-col items-center gap-0.5 text-[11px] font-medium active:scale-95 transition-transform"
                style={{ color: active ? 'var(--primary)' : 'var(--muted)' }}
              >
                <Icon size={20} weight={active ? 'fill' : 'regular'} />
                <span className="truncate max-w-[76px]">{item.label}</span>
              </Link>
            );
          })}
          <form action={keluarAkun} className="flex justify-center">
            <button
              type="submit"
              className="flex flex-col items-center gap-0.5 text-[11px] font-medium cursor-pointer"
              style={{ color: 'var(--danger)' }}
            >
              <SignOut size={20} />
              <span>Keluar</span>
            </button>
          </form>
        </nav>
      )}

      {/* Mobile "Lainnya" Drawer */}
      {moreOpen && !isAdmin && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end"
          style={{ backgroundColor: 'rgba(13, 23, 19, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setMoreOpen(false);
          }}
        >
          <div
            className="w-full rounded-t-3xl p-5 border-t"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-semibold text-sm">{akun.nama}</p>
                <p className="text-xs" style={{ color: 'var(--muted)' }}>
                  {akun.email}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Tutup menu lainnya"
                className="w-9 h-9 rounded-full inline-flex items-center justify-center"
                style={{ backgroundColor: 'var(--bg)' }}
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {[
                { href: '/tabungan', label: 'Tabungan', icon: PiggyBank },
                { href: '/tagihan', label: 'Tagihan', icon: Receipt },
                { href: '/insight', label: 'Insight', icon: Lightbulb },
                { href: '/laporan', label: 'Laporan', icon: FileArrowDown },
                { href: '/kategori', label: 'Kategori', icon: Tag },
                { href: '/notifikasi', label: 'Notifikasi', icon: Bell },
                { href: '/pengaturan', label: 'Pengaturan', icon: GearSix },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => {
                      setPendingPath(item.href);
                      setMoreOpen(false);
                    }}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border text-xs font-medium active:scale-95 transition-transform"
                    style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                  >
                    <Icon size={22} weight="duotone" style={{ color: 'var(--primary)' }} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <ThemeToggle />
              <form action={keluarAkun}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold cursor-pointer"
                  style={{ color: 'var(--danger)' }}
                >
                  <SignOut size={18} />
                  <span>Keluar</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Catat Cepat */}
      {!isAdmin && (
        <QuickTransactionModal
          open={catatOpen}
          onClose={() => setCatatOpen(false)}
          categories={categories}
        />
      )}
    </div>
  );
}