# Asumsi Implementasi FINARA

Dokumen ini mencatat keputusan teknis untuk ambiguitas yang tidak dirinci secara eksplisit di dalam dokumen spesifikasi dan diagram UML:

1. **Sinkronisasi Pengingat Tagihan (`FR-014`)**:
   - Karena tugas kuliah tidak mengandalkan cron server eksternal berbayar, pengecekan tagihan jatuh tempo (maksimal 7 hari ke depan) dijalankan secara idempoten saat pengguna membuka halaman `/dashboard` atau saat pengguna menambah/mengubah pengingat di `/tagihan`.
   - Duplikasi notifikasi dicegah oleh kolom `kunci_unik` (`tagihan:<id>:<tanggal_jatuh_tempo>`) dengan constraint `unique (id_pengguna, kunci_unik)`.
   - Jika tagihan bertanda `berulang = true` dan tanggal jatuh temponya sudah terlewati hari ini, sistem otomatis memajukan `tanggal_jatuh_tempo` ke bulan berikutnya dengan `addMonths`.

2. **Peringatan Anggaran (`FR-007`, `FR-012`)**:
   - Sesuai Sequence Diagram D.4, transaksi baru disimpan melalui fungsi PostgreSQL transaksional `catat_transaksi_dan_cek_anggaran`.
   - Jika pengeluaran kategori pada bulan dan tahun transaksi mencapai `>= 80%` hingga `< 100%`, sistem membuat notifikasi level `80` (`<id_kategori>:<YYYY-MM>:80`). Jika mencapai `>= 100%`, sistem membuat notifikasi level `100` (`<id_kategori>:<YYYY-MM>:100`).

3. **Batas Aman Harian (`FR-013`)**:
   - Jika pengguna memiliki anggaran bulanan pada periode berjalan, batas aman harian dihitung dari `max(0, floor((total_batas_anggaran - total_terpakai_anggaran) / sisa_hari_bulan_ini))`.
   - Jika pengguna belum menetapkan anggaran bulanan, perhitungan jatuh balik ke sisa saldo periode berjalan dibagi sisa hari dalam bulan tersebut (`sisa_hari_bulan_ini` minimal `1` pada hari terakhir bulan).

4. **Isolasi Data Admin (`FR-015`, `FR-016`, `FR-017`)**:
   - Kebijakan Row Level Security (RLS) sengaja tidak memberikan izin `SELECT` kepada peran `admin` pada tabel `transaksi`, `anggaran`, `target_tabungan`, `setoran_tabungan`, `pengingat_tagihan`, dan `notifikasi`.
   - Admin hanya dapat mengakses metadata tabel `akun`, mengelola kategori bawaan (`is_bawaan = true`), dan membaca angka agregat melalui RPC `statistik_sistem()`.
