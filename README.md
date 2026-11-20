# Finara — Uangmu jelas, bulananmu aman.

**Finara** (*Financial Insight, Notes, Analysis, and Reporting Assistant*) adalah aplikasi asisten keuangan berbasis web yang dirancang untuk Pelajar/Remaja, Mahasiswa/Anak Kos, dan Pelaku UMKM dalam mengelola arus kas, anggaran, tabungan, serta tagihan rutin secara terstruktur.

---

## Fitur Utama

- **Autentikasi & Manajemen Profil**: Sistem registrasi, masuk, pemulihan kata sandi, dan penghapusan akun dengan penyesuaian kategori bawaan otomatis berdasarkan profil pengguna (Pelajar/Remaja, Mahasiswa/Anak Kos, atau Pelaku UMKM).
- **Dashboard & Ringkasan Arus Kas**: Visualisasi pemasukan, pengeluaran, sisa saldo, serta grafik kategori dan tren bulanan secara real-time.
- **Pencatatan Transaksi Cepat**: Input transaksi harian berbasis kategori dengan dukungan pintasan papan ketik (`N`), pencarian, dan filter riwayat.
- **Perencanaan Anggaran & Target Tabungan**: Penetapan batas pengeluaran bulanan per kategori dengan peringatan otomatis saat pemakaian mencapai ambang 80% dan 100%, serta pelacakan progres tabungan.
- **Pusat Notifikasi & Pengingat Tagihan**: Peringatan batas anggaran dan manajemen jadwal tagihan rutin agar tidak terlewat.
- **Insight & Laporan Keuangan**: Analisis perbandingan pengeluaran bulanan, kategori terbesar, estimasi batas harian berbasis aturan (rule-based), serta ekspor laporan dalam format **PDF** dan **CSV**.
- **Panel Admin**: Pengelolaan status aktif/nonaktif pengguna, manajemen kategori bawaan per profil, dan statistik penggunaan sistem.

---

## Batasan Sistem

- **Pencatatan Manual**: Aplikasi tidak terhubung ke rekening bank atau dompet digital dan tidak memproses transaksi pembayaran.
- **Rule-Based Insight**: Seluruh insight dihitung secara deterministik berdasarkan aturan logika dari data transaksi pengguna tanpa layanan AI eksternal.

---

## Teknologi yang Digunakan

- **Framework**: Next.js (App Router) & React
- **Bahasa Pemrograman**: TypeScript
- **Styling & UI**: Tailwind CSS & Phosphor Icons
- **Backend & Database**: Supabase (PostgreSQL, Auth, Row Level Security)
- **Validasi Data**: Zod

---

## Struktur Direktori

    finara-app/
    ├── src/
    │   ├── app/
    │   │   ├── (app)/          # Halaman utama pengguna & panel admin
    │   │   ├── (auth)/         # Halaman masuk, daftar, lupa & atur ulang sandi
    │   │   ├── (marketing)/    # Landing page publik
    │   │   └── api/            # Endpoint API (auth callback & ekspor laporan PDF/CSV)
    │   ├── components/         # Komponen UI, AppShell, grafik, modal, & skeleton loading
    │   └── lib/                # Server Actions, logika domain, skema Zod, & konfigurasi Supabase
    ├── supabase/
    │   ├── migrations/         # Skema tabel & kebijakan RLS database
    │   └── seed.sql            # Data awal kategori bawaan
    └── .env.example            # Template variabel Supabase

---

## Cara Menjalankan Proyek

### 1. Instalasi Dependensi

    npm install

### 2. Konfigurasi Supabase

1. Buat proyek baru di [Supabase](https://supabase.com).
2. Buka **SQL Editor** di dashboard Supabase, lalu jalankan isi file `supabase/migrations/0001_init.sql` diikuti dengan `supabase/seed.sql`.
3. Di menu **Authentication > Providers > Email**, matikan *Confirm email* jika ingin pengujian daftar dan masuk berjalan instan saat pengembangan lokal.
4. Salin `.env.example` menjadi `.env.local` dan isi kredensial proyek Supabase milikmu:

    cp .env.example .env.local

### 3. Membuat Akun Admin Pertama

1. Daftarkan akun melalui halaman `/daftar`.
2. Jalankan perintah berikut di SQL Editor Supabase untuk mengubah peran akun menjadi `admin`:

    update public.akun
    set peran = 'admin', profil = null
    where email = 'support.finara@gmail.com';

### 4. Menjalankan Server Pengembangan

    npm run dev

Buka `http://localhost:3000` di peramban.