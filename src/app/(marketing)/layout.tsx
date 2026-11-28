import type { Metadata } from 'next';
import './landing.css';

export const metadata: Metadata = {
  title: 'Finara - Uangmu jelas, bulananmu aman',
  description:
    'Finara membantu pelajar, anak kos, dan pelaku UMKM mencatat uang masuk dan keluar, menjaga anggaran, lalu menjelaskan ke mana uangmu pergi',
  openGraph: {
    type: 'website',
    title: 'Finara - Uangmu jelas, bulananmu aman',
    description:
      'Catat uang masuk dan keluar, jaga anggaran, dan pahami ke mana uangmu pergi. Untuk pelajar, anak kos, dan pelaku UMKM',
    locale: 'id_ID',
  },
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='16' fill='%230B5C46'/%3E%3Ctext x='18' y='47' font-family='system-ui,sans-serif' font-weight='700' font-size='40' fill='%23fff'%3Ef%3C/text%3E%3Ccircle cx='45' cy='43' r='5' fill='%23F2B33D'/%3E%3C/svg%3E",
  },
};

const themeInitScript = `
  document.documentElement.classList.add('js');
  (() => {
    try {
      const saved = localStorage.getItem('finara-theme');
      if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.dataset.theme = 'dark';
      }
    } catch (e) {}
  })();
`;

export default function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta name="theme-color" id="meta-theme" content="#F6F7F2" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
