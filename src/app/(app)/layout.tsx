import type { Metadata, Viewport } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ToastProvider } from '@/components/ui/ToastProvider';
import AppShell from '@/components/app/AppShell';
import type { Notifikasi } from '@/lib/types/database';
import './app.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: 'Aplikasi — Finara',
  description: 'Catat transaksi, jaga anggaran, dan pantau insight keuanganmu.',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%230B5C46'/%3E%3Ctext x='18' y='47' font-family='system-ui,sans-serif' font-weight='700' font-size='40' fill='%23fff'%3Ef%3C/text%3E%3Ccircle cx='45' cy='43' r='5' fill='%23F2B33D'/%3E%3C/svg%3E",
  },
};

const themeInitScript = `
  (() => {
    try {
      const saved = localStorage.getItem('finara-theme');
      if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.dataset.theme = 'dark';
      }
    } catch (e) {}
  })();
`;

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/masuk');
  }

  const admin = createAdminClient();

  let { data: akun } = await admin
    .from('akun')
    .select('id, email, nama, profil, peran, aktif')
    .eq('id', user.id)
    .single();

  if (!akun) {
    const { data: createdAkun, error: upsertErr } = await admin
      .from('akun')
      .upsert({
        id: user.id,
        email: user.email || '',
        nama: user.user_metadata?.nama || (user.email || '').split('@')[0],
        profil: user.user_metadata?.profil || 'kos',
        peran: 'pengguna',
        aktif: true,
      })
      .select('id, email, nama, profil, peran, aktif')
      .single();

    if (upsertErr) {
      throw new Error(`GAGAL BUAT AKUN DI DB: ${upsertErr.message} (Code: ${upsertErr.code})`);
    }
    akun = createdAkun;
  }

  if (akun.aktif === false) {
    redirect('/masuk?error=nonaktif');
  }

  const isAdmin = akun.peran === 'admin';

  let categories: Array<{
    id: string;
    nama: string;
    jenis: 'PEMASUKAN' | 'PENGELUARAN';
    ikon: string | null;
    warna: string | null;
    is_bawaan: boolean;
    profil_target: string;
  }> = [];
  let unreadNotifCount = 0;
  let notifications: Notifikasi[] = [];

  if (!isAdmin) {
    const profil = akun.profil || 'kos';
    const [{ data: katData }, { count }, { data: notifData }] = await Promise.all([
      supabase
        .from('kategori')
        .select('id, nama, jenis, ikon, warna, is_bawaan, profil_target')
        .or(`and(is_bawaan.eq.true,profil_target.in.(semua,${profil})),id_pengguna.eq.${user.id}`)
        .order('nama', { ascending: true }),
      supabase
        .from('notifikasi')
        .select('id', { count: 'exact', head: true })
        .eq('id_pengguna', user.id)
        .eq('sudah_dibaca', false),
      supabase
        .from('notifikasi')
        .select('id, jenis, pesan, sudah_dibaca, dibuat_pada, id_pengguna, kunci_unik')
        .eq('id_pengguna', user.id)
        .order('dibuat_pada', { ascending: false })
        .limit(15),
    ]);

    categories = (katData as typeof categories) || [];
    unreadNotifCount = count || 0;
    notifications = (notifData as Notifikasi[]) || [];
  }

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="overflow-x-hidden">
        <ToastProvider>
          <AppShell
            akun={{
              id: akun.id,
              email: akun.email,
              nama: akun.nama || akun.email.split('@')[0],
              profil: akun.profil,
              peran: akun.peran,
            }}
            categories={categories}
            unreadNotifCount={unreadNotifCount}
            notifications={notifications}
          >
            <div className="fn-page-enter">{children}</div>
          </AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}
