# Finara - Uangmu jelas, bulananmu aman.

**Finara** (*Financial Insight, Notes, Analysis, and Reporting Assistant*) adalah aplikasi asisten keuangan berbasis web untuk Pelajar/Remaja, Mahasiswa/Anak Kos, dan Pelaku UMKM dalam mengelola arus kas, anggaran, tabungan, serta tagihan rutin secara terstruktur.

---

## Fitur Utama

- **Autentikasi & Manajemen Profil**: Registrasi, masuk, pemulihan kata sandi melalui callback autentikasi, dan penghapusan akun dengan penyesuaian kategori bawaan berdasarkan profil pengguna (Pelajar/Remaja, Mahasiswa/Anak Kos, atau Pelaku UMKM).
- **Dashboard & Ringkasan Arus Kas**: Visualisasi pemasukan, pengeluaran, sisa saldo atau laba sederhana, grafik kategori, tren bulanan, serta skeleton loading.
- **Pencatatan Transaksi Cepat**: Input transaksi harian dengan dukungan pintasan papan ketik (`N`), pencarian, filter riwayat, dan umpan balik notifikasi instan.
- **Manajemen Kategori**: Pengelolaan kategori bawaan dan pembuatan kategori kustom lengkap dengan pilihan ikon dan warna.
- **Anggaran & Target Tabungan**: Penetapan batas pengeluaran bulanan per kategori dengan peringatan otomatis pada ambang 80% dan 100%, serta pelacakan progres target tabungan.
- **Pusat Notifikasi & Pengingat Tagihan**: Peringatan batas anggaran dan pengelolaan jadwal tagihan rutin agar tidak terlewat.
- **Insight & Laporan Keuangan**: Analisis perbandingan pengeluaran bulanan, kategori terbesar, estimasi batas aman harian berbasis aturan, serta ekspor laporan dalam format **PDF** dan **CSV**.
- **Panel Admin**: Pengelolaan status aktif pengguna, manajemen kategori bawaan per profil, dan statistik penggunaan sistem.

---

## Batasan Sistem

- **Pencatatan Manual**: Aplikasi tidak terhubung ke rekening bank atau dompet digital dan tidak memproses transaksi pembayaran.
- **Rule-Based Insight**: Seluruh insight dihitung secara deterministik dari aturan logika atas data transaksi pengguna tanpa layanan AI eksternal.

---

## Teknologi yang Digunakan

- **Framework**: Next.js 16 (App Router) & React 19
- **Bahasa Pemrograman**: TypeScript 5
- **Styling & UI**: Tailwind CSS v4 & Phosphor Icons
- **Visualisasi & Dokumen**: Recharts & React PDF (`@react-pdf/renderer`)
- **Backend & Database**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Validasi & Utilitas**: Zod & date-fns

---

## Struktur Direktori

    finara-app/
    ├── docs/
    │   └── ASSUMPTIONS.md          # Dokumentasi asumsi dan batasan sistem
    ├── reference/
    │   └── landing/                # Referensi statis halaman depan
    ├── src/
    │   ├── app/
    │   │   ├── (app)/              # Halaman utama pengguna, loading state, & panel admin
    │   │   ├── (auth)/             # Halaman masuk, daftar, lupa & atur ulang sandi
    │   │   ├── (marketing)/        # Halaman depan publik
    │   │   └── api/
    │   │       ├── auth/callback/  # Penanganan verifikasi & reset kata sandi Supabase
    │   │       └── laporan/        # Endpoint ekspor laporan PDF & CSV
    │   ├── components/
    │   │   ├── app/                # Komponen dashboard, grafik, modal, & manajemen fitur
    │   │   ├── landing/            # Interaksi dan efek halaman depan
    │   │   └── ui/                 # Komponen ikon kategori & notifikasi toast
    │   ├── lib/
    │   │   ├── actions/            # Server Actions untuk seluruh modul fitur
    │   │   ├── domain/             # Logika perhitungan ringkasan, anggaran, & insight
    │   │   ├── supabase/           # Konfigurasi client, server, admin, & middleware sesi
    │   │   ├── types/              # Definisi tipe data database
    │   │   ├── validation/         # Skema validasi input Zod
    │   │   └── format.ts           # Utilitas format Rupiah, tanggal, & label profil
    │   └── middleware.ts           # Proteksi rute & pengalihan parameter autentikasi
    ├── supabase/
    │   ├── migrations/
    │   │   └── 0001_init.sql       # Skema tabel & kebijakan RLS database
    │   └── seed.sql                # Data awal kategori bawaan
    ├── .env.example                # Template variabel lingkungan Supabase
    ├── next.config.ts              # Konfigurasi Next.js & server external packages
    └── package.json                # Daftar dependensi dan skrip proyek

---

## Cara Menjalankan Proyek

### 1. Instalasi Dependensi

    npm install

### 2. Konfigurasi Supabase

1. Buat proyek baru di [Supabase](https://supabase.com).
2. Buka **SQL Editor** di dashboard Supabase, lalu jalankan isi file `supabase/migrations/0001_init.sql` diikuti dengan `supabase/seed.sql`.
3. Di menu **Authentication > URL Configuration**, tambahkan `http://localhost:3000/**` pada daftar **Redirect URLs** agar fitur reset kata sandi berjalan normal.
4. Di menu **Authentication > Providers > Email**, matikan *Confirm email* jika ingin pengujian daftar dan masuk berjalan instan saat pengembangan lokal.
5. Salin `.env.example` menjadi `.env.local` dan isi kredensial proyek Supabase milikmu:

    cp .env.example .env.local

### 3. Membuat Akun Admin Pertama

1. Daftarkan akun melalui halaman `/daftar`.
2. Jalankan perintah berikut di SQL Editor Supabase untuk mengubah peran akun menjadi `admin`:

    update public.akun
    set peran = 'admin', profil = null
    where email = 'admin@gmail.com';

### 4. Menjalankan Server Pengembangan

    npm run dev

Buka `http://localhost:3000` di peramban.