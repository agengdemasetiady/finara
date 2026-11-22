'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Check,
  Checks,
  Warning,
} from '@phosphor-icons/react';
import { keluarAkun } from '@/lib/actions/auth';
import {
  tandaiNotifikasiDibaca,
  tandaiSemuaNotifikasiDibaca,
} from '@/lib/actions/notifikasi';
import { ThemeToggle } from './ThemeToggle';
import { PeriodSelector } from './PeriodSelector';
import { QuickTransactionModal, type SimpleCategory } from './QuickTransactionModal';
import { getLabelProfil, formatTanggal } from '@/lib/format';
import type { Notifikasi, PeranAkun, ProfilTipe } from '@/lib/types/database';

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
  notifications?: Notifikasi[];
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

const MORE_NAV = [
  { href: '/tabungan', label: 'Tabungan', icon: PiggyBank },
  { href: '/tagihan', label: 'Tagihan', icon: Receipt },
  { href: '/insight', label: 'Insight', icon: Lightbulb },
  { href: '/laporan', label: 'Laporan', icon: FileArrowDown },
  { href: '/kategori', label: 'Kategori', icon: Tag },
  { href: '/notifikasi', label: 'Notifikasi', icon: Bell },
  { href: '/pengaturan', label: 'Pengaturan', icon: GearSix },
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

export default function AppShell({
  akun,
  categories,
  unreadNotifCount,
  notifications = [],
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdmin = akun.peran === 'admin';
  const navItems = isAdmin ? ADMIN_NAV : USER_NAV;

  const [catatOpen, setCatatOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifPopupOpen, setNotifPopupOpen] = useState(false);
  const [pendingPath, setPendingPath] = useState<string | null>(null);
  const [localNotifs, setLocalNotifs] = useState<Notifikasi[]>(notifications);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notifPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const routes = isAdmin
      ? ['/admin', '/admin/pengguna', '/admin/kategori']
      : [
          '/dashboard',
          '/transaksi',
          '/anggaran',
          '/tabungan',
          '/tagihan',
          '/insight',
          '/laporan',
          '/kategori',
          '/notifikasi',
          '/pengaturan',
        ];
    for (const route of routes) {
      router.prefetch(route);
    }
  }, [isAdmin, router]);

  useEffect(() => {
    setLocalNotifs(notifications);
  }, [notifications]);

  useEffect(() => {
    function onNotifRead(e: Event) {
      const id = (e as CustomEvent<{ id: string }>).detail?.id;
      if (!id) return;
      setLocalNotifs((prev) =>
        prev.map((item) => (item.id === id ? { ...item, sudah_dibaca: true } : item))
      );
    }

    function onNotifReadAll() {
      setLocalNotifs((prev) => prev.map((item) => ({ ...item, sudah_dibaca: true })));
    }

    window.addEventListener('finara:notif-read', onNotifRead);
    window.addEventListener('finara:notif-read-all', onNotifReadAll);

    return () => {
      window.removeEventListener('finara:notif-read', onNotifRead);
      window.removeEventListener('finara:notif-read-all', onNotifReadAll);
    };
  }, []);

  const liveUnreadCount =
    notifications.length > 0
      ? localNotifs.filter((n) => !n.sudah_dibaca).length
      : unreadNotifCount;

  useEffect(() => {
    setPendingPath(null);
    setProfileMenuOpen(false);
    setNotifPopupOpen(false);
  }, [pathname]);

  const handleLogoutCleanup = useCallback(() => {
    setLocalNotifs([]);
    window.dispatchEvent(new CustomEvent('finara:clear-cache'));
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('finara-auth');
        bc.postMessage({ type: 'LOGOUT' });
        bc.close();
      }
      localStorage.setItem('finara-logout-sync', String(Date.now()));
    } catch {
      // Abaikan jika storage diblokir
    }
  }, []);

  // Sinkronisasi Keluar lintas tab saat tombol Keluar ditekan manual
  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      bc = new BroadcastChannel('finara-auth');
      bc.onmessage = (event) => {
        if (event.data?.type === 'LOGOUT') {
          setLocalNotifs([]);
          window.dispatchEvent(new CustomEvent('finara:clear-cache'));
          router.replace('/masuk');
        }
      };
    }

    const onStorageSync = (e: StorageEvent) => {
      if (e.key === 'finara-logout-sync' && e.newValue) {
        setLocalNotifs([]);
        window.dispatchEvent(new CustomEvent('finara:clear-cache'));
        router.replace('/masuk');
      }
    };
    window.addEventListener('storage', onStorageSync);

    return () => {
      bc?.close();
      window.removeEventListener('storage', onStorageSync);
    };
  }, [router]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (notifPopupRef.current && !notifPopupRef.current.contains(e.target as Node)) {
        setNotifPopupOpen(false);
      }
    }
    if (profileMenuOpen || notifPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileMenuOpen, notifPopupOpen]);

  const currentPath = pendingPath || pathname;

  function startNav(href: string) {
    if (href in PAGE_TITLES && href !== pathname) {
      setPendingPath(href);
    }
  }

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
        setNotifPopupOpen(false);
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

  function handleReadSingleNotif(notif: Notifikasi) {
    if (notif.sudah_dibaca) return;
    const snapshot = localNotifs;
    setLocalNotifs((prev) =>
      prev.map((item) => (item.id === notif.id ? { ...item, sudah_dibaca: true } : item))
    );
    window.dispatchEvent(new CustomEvent('finara:notif-read', { detail: { id: notif.id } }));

    void tandaiNotifikasiDibaca(notif.id).then((res) => {
      if (!res.ok) {
        setLocalNotifs(snapshot);
      }
    });
  }

  function handleReadAllNotifs() {
    if (liveUnreadCount === 0) return;
    const snapshot = localNotifs;
    setLocalNotifs((prev) => prev.map((item) => ({ ...item, sudah_dibaca: true })));
    window.dispatchEvent(new CustomEvent('finara:notif-read-all'));

    void tandaiSemuaNotifikasiDibaca().then((res) => {
      if (!res.ok) {
        setLocalNotifs(snapshot);
      }
    });
  }

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
            prefetch={true}
            onClick={() => startNav(isAdmin ? '/admin' : '/dashboard')}
            className={`fn-display text-2xl font-bold py-1 inline-flex items-baseline whitespace-nowrap transition-all duration-300 ${
              profileMenuOpen
                ? 'px-3'
                : 'pl-[18px] pr-3 group-hover:px-3 group-focus-within:px-3'
            }`}
          >
            <span>f</span>
            <span
              className={`overflow-hidden transition-all duration-200 ${
                profileMenuOpen
                  ? 'max-w-[100px] opacity-100'
                  : 'max-w-0 opacity-0 group-hover:max-w-[100px] group-hover:opacity-100 group-focus-within:max-w-[100px] group-focus-within:opacity-100'
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
                  prefetch={true}
                  onMouseEnter={() => router.prefetch(item.href)}
                  onClick={() => startNav(item.href)}
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
                  prefetch={true}
                  onMouseEnter={() => router.prefetch('/notifikasi')}
                  onClick={() => startNav('/notifikasi')}
                  className="relative flex items-center gap-3.5 px-3 py-2 rounded-xl text-sm font-medium whitespace-nowrap active:scale-95 transition-transform"
                  style={{
                    backgroundColor: currentPath === '/notifikasi' ? 'var(--primary-soft)' : 'transparent',
                    color: currentPath === '/notifikasi' ? 'var(--primary)' : 'var(--muted)',
                    fontWeight: currentPath === '/notifikasi' ? 600 : 500,
                  }}
                >
                  <span className="relative shrink-0">
                    <Bell size={20} weight={currentPath === '/notifikasi' ? 'fill' : 'regular'} />
                    {liveUnreadCount > 0 && (
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
                    {liveUnreadCount > 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-semibold"
                        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
                      >
                        {liveUnreadCount}
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
                  prefetch={true}
                  onClick={() => {
                    startNav('/pengaturan');
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

              <form action={keluarAkun} onSubmit={handleLogoutCleanup}>
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
          className="sticky top-0 z-30 border-b px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 max-w-full"
          style={{
            backgroundColor: 'var(--bg-glass)',
            borderColor: 'var(--border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={isAdmin ? '/admin' : '/dashboard'}
              prefetch={true}
              onClick={() => startNav(isAdmin ? '/admin' : '/dashboard')}
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
                <div ref={notifPopupRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setNotifPopupOpen((prev) => !prev)}
                    aria-label="Notifikasi"
                    aria-expanded={notifPopupOpen}
                    className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full inline-flex items-center justify-center border active:scale-95 transition-transform cursor-pointer"
                    style={{
                      backgroundColor: notifPopupOpen ? 'var(--primary-soft)' : 'var(--surface)',
                      borderColor: notifPopupOpen ? 'var(--primary)' : 'var(--border)',
                      color: notifPopupOpen ? 'var(--primary)' : 'inherit',
                    }}
                  >
                    <Bell size={18} weight={notifPopupOpen ? 'fill' : 'regular'} />
                    {liveUnreadCount > 0 && (
                      <span
                        className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold inline-flex items-center justify-center text-white"
                        style={{ backgroundColor: 'var(--accent-strong)' }}
                      >
                        {liveUnreadCount > 9 ? '9+' : liveUnreadCount}
                      </span>
                    )}
                  </button>

                  {notifPopupOpen && (
                    <div
                      className="hidden sm:flex flex-col absolute right-0 top-[calc(100%+10px)] w-96 rounded-3xl border shadow-2xl z-50 overflow-hidden"
                      style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                    >
                      <div
                        className="px-4 py-3.5 border-b flex items-center justify-between gap-2"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <div className="flex items-center gap-2">
                          <h2 className="fn-display text-sm font-semibold">Notifikasi</h2>
                          {liveUnreadCount > 0 && (
                            <span
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
                            >
                              {liveUnreadCount} baru
                            </span>
                          )}
                        </div>
                        {liveUnreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleReadAllNotifs}
                            className="inline-flex items-center gap-1 text-xs font-semibold hover:opacity-80 cursor-pointer"
                            style={{ color: 'var(--primary)' }}
                          >
                            <Checks size={15} weight="bold" />
                            <span>Baca semua</span>
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
                        {localNotifs.length === 0 ? (
                          <div className="p-6 text-center text-xs" style={{ color: 'var(--muted)' }}>
                            Belum ada notifikasi terbaru.
                          </div>
                        ) : (
                          localNotifs.slice(0, 6).map((item) => {
                            const isAnggaran = item.jenis === 'PERINGATAN_ANGGARAN';
                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => handleReadSingleNotif(item)}
                                className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors cursor-pointer hover:opacity-90"
                                style={{
                                  backgroundColor: item.sudah_dibaca ? 'transparent' : 'var(--primary-soft)',
                                }}
                              >
                                <span
                                  className="p-2 rounded-xl shrink-0 mt-0.5"
                                  style={{
                                    backgroundColor: isAnggaran ? 'var(--accent-soft)' : 'var(--bg)',
                                    color: isAnggaran ? 'var(--accent-strong)' : 'var(--primary)',
                                  }}
                                >
                                  {isAnggaran ? <Warning size={16} weight="fill" /> : <Bell size={16} weight="fill" />}
                                </span>
                                <div className="flex-1 min-w-0">
                                  <p className={`text-xs leading-relaxed ${item.sudah_dibaca ? 'font-normal' : 'font-semibold'}`}>
                                    {item.pesan}
                                  </p>
                                  <span className="text-[11px] mt-1 block" style={{ color: 'var(--muted)' }}>
                                    {formatTanggal(item.dibuat_pada)}
                                  </span>
                                </div>
                                {!item.sudah_dibaca && (
                                  <span
                                    className="w-2 h-2 rounded-full shrink-0 mt-2"
                                    style={{ backgroundColor: 'var(--primary)' }}
                                  />
                                )}
                              </button>
                            );
                          })
                        )}
                      </div>

                      <div
                        className="px-4 py-2.5 border-t text-center"
                        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
                      >
                        <Link
                          href="/notifikasi"
                          prefetch={true}
                          onClick={() => {
                            setNotifPopupOpen(false);
                            startNav('/notifikasi');
                          }}
                          className="text-xs font-semibold hover:underline"
                          style={{ color: 'var(--primary)' }}
                        >
                          Lihat semua notifikasi
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

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
          <div className="fn-page-enter">{children}</div>
        </main>
      </div>

      {/* Mobile Bottom Sheet Popup untuk Notifikasi */}
      {notifPopupOpen && !isAdmin && (
        <div
          className="sm:hidden fixed inset-0 z-50 flex items-end"
          style={{ backgroundColor: 'rgba(13, 23, 19, 0.5)', backdropFilter: 'blur(3px)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setNotifPopupOpen(false);
          }}
        >
          <div
            className="w-full rounded-t-3xl border-t shadow-2xl max-h-[82dvh] flex flex-col overflow-hidden"
            style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
          >
            <div className="px-5 pt-4 pb-3 border-b flex items-center justify-between gap-2" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <h2 className="fn-display text-base font-semibold">Notifikasi</h2>
                {liveUnreadCount > 0 && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--accent-strong)' }}
                  >
                    {liveUnreadCount} baru
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {liveUnreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleReadAllNotifs}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer"
                    style={{ backgroundColor: 'var(--primary-soft)', color: 'var(--primary)' }}
                  >
                    <Check size={14} weight="bold" />
                    <span>Baca semua</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setNotifPopupOpen(false)}
                  aria-label="Tutup notifikasi"
                  className="w-8 h-8 rounded-full inline-flex items-center justify-center cursor-pointer"
                  style={{ backgroundColor: 'var(--bg)' }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: 'var(--border)' }}>
              {localNotifs.length === 0 ? (
                <div className="p-8 text-center text-sm" style={{ color: 'var(--muted)' }}>
                  Belum ada notifikasi terbaru.
                </div>
              ) : (
                localNotifs.slice(0, 8).map((item) => {
                  const isAnggaran = item.jenis === 'PERINGATAN_ANGGARAN';
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleReadSingleNotif(item)}
                      className="w-full text-left px-5 py-3.5 flex items-start gap-3 transition-colors cursor-pointer"
                      style={{
                        backgroundColor: item.sudah_dibaca ? 'transparent' : 'var(--primary-soft)',
                      }}
                    >
                      <span
                        className="p-2 rounded-xl shrink-0 mt-0.5"
                        style={{
                          backgroundColor: isAnggaran ? 'var(--accent-soft)' : 'var(--bg)',
                          color: isAnggaran ? 'var(--accent-strong)' : 'var(--primary)',
                        }}
                      >
                        {isAnggaran ? <Warning size={18} weight="fill" /> : <Bell size={18} weight="fill" />}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs sm:text-sm leading-relaxed ${item.sudah_dibaca ? 'font-normal' : 'font-semibold'}`}>
                          {item.pesan}
                        </p>
                        <span className="text-[11px] mt-1 block" style={{ color: 'var(--muted)' }}>
                          {formatTanggal(item.dibuat_pada)}
                        </span>
                      </div>
                      {!item.sudah_dibaca && (
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                          style={{ backgroundColor: 'var(--primary)' }}
                        />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div
              className="px-5 py-3.5 pb-[max(1rem,env(safe-area-inset-bottom))] border-t text-center"
              style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)' }}
            >
              <Link
                href="/notifikasi"
                prefetch={true}
                onClick={() => {
                  setNotifPopupOpen(false);
                  startNav('/notifikasi');
                }}
                className="text-xs font-semibold hover:underline"
                style={{ color: 'var(--primary)' }}
              >
                Lihat semua notifikasi
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Tab Bar */}
      {!isAdmin ? (
        <nav
          aria-label="Navigasi bawah ponsel"
          className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] grid grid-cols-5 items-center"
          style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
        >
          <Link
            href="/dashboard"
            prefetch={true}
            onTouchStart={() => router.prefetch('/dashboard')}
            onClick={() => startNav('/dashboard')}
            className="flex flex-col items-center gap-0.5 py-1 text-[11px] font-medium active:scale-95 transition-transform"
            style={{ color: currentPath === '/dashboard' ? 'var(--primary)' : 'var(--muted)' }}
          >
            <House size={22} weight={currentPath === '/dashboard' ? 'fill' : 'regular'} />
            <span>Beranda</span>
          </Link>

          <Link
            href="/transaksi"
            prefetch={true}
            onTouchStart={() => router.prefetch('/transaksi')}
            onClick={() => startNav('/transaksi')}
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
            prefetch={true}
            onTouchStart={() => router.prefetch('/anggaran')}
            onClick={() => startNav('/anggaran')}
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
                prefetch={true}
                onClick={() => startNav(item.href)}
                className="flex flex-col items-center gap-0.5 text-[11px] font-medium active:scale-95 transition-transform"
                style={{ color: active ? 'var(--primary)' : 'var(--muted)' }}
              >
                <Icon size={20} weight={active ? 'fill' : 'regular'} />
                <span className="truncate max-w-[76px]">{item.label}</span>
              </Link>
            );
          })}
          <form action={keluarAkun} onSubmit={handleLogoutCleanup} className="flex justify-center">
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
              {MORE_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    onClick={() => {
                      startNav(item.href);
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
              <form action={keluarAkun} onSubmit={handleLogoutCleanup}>
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