import type { Metadata } from 'next';
import Link from 'next/link';
import './auth.css';

export const metadata: Metadata = {
  title: 'Akun - Finara',
  description: 'Masuk atau buat akun Finara untuk mengelola catatan keuanganmu.',
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

export default function AuthLayout({ children }: { children: React.ReactNode }) {
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
      <body className="min-h-screen flex flex-col justify-between px-4 py-8">
        <header className="max-w-md w-full mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="fn-display text-2xl font-bold tracking-tight inline-flex items-baseline"
            style={{ color: 'var(--ink)' }}
          >
            finara<span style={{ color: 'var(--accent)' }}>.</span>
          </Link>
          <Link
            href="/"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--muted)' }}
          >
            Kembali ke beranda
          </Link>
        </header>

        <main className="max-w-md w-full mx-auto my-8">{children}</main>

        <footer className="max-w-md w-full mx-auto text-center text-xs" style={{ color: 'var(--muted)' }}>
          Finara - Aplikasi pencatatan dan perencanaan keuangan harian
        </footer>
      </body>
    </html>
  );
}
