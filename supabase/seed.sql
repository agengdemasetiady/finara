-- seed.sql
-- Kategori bawaan sistem FINARA (dapat dikelola oleh Admin)

insert into public.kategori (nama, jenis, profil_target, is_bawaan, ikon, warna, id_pengguna) values
  -- Umum (semua profil)
  ('Pemasukan lain', 'PEMASUKAN', 'semua', true, 'Coins', '#0B5C46', null),
  ('Lainnya', 'PENGELUARAN', 'semua', true, 'DotsThreeCircle', '#52625B', null),

  -- Pelajar / Remaja
  ('Uang saku', 'PEMASUKAN', 'pelajar', true, 'Wallet', '#0B5C46', null),
  ('Jajan', 'PENGELUARAN', 'pelajar', true, 'Cookie', '#D97706', null),
  ('Transport', 'PENGELUARAN', 'pelajar', true, 'Bus', '#2563EB', null),
  ('Alat tulis & buku', 'PENGELUARAN', 'pelajar', true, 'BookOpen', '#7C3AED', null),
  ('Hiburan', 'PENGELUARAN', 'pelajar', true, 'GameController', '#DB2777', null),
  ('Tabungan', 'PENGELUARAN', 'pelajar', true, 'PiggyBank', '#059669', null),

  -- Mahasiswa / Anak Kos
  ('Uang bulanan/kiriman', 'PEMASUKAN', 'kos', true, 'HandCoins', '#0B5C46', null),
  ('Makan', 'PENGELUARAN', 'kos', true, 'ForkKnife', '#EA580C', null),
  ('Kos', 'PENGELUARAN', 'kos', true, 'House', '#0B5C46', null),
  ('Listrik & air', 'PENGELUARAN', 'kos', true, 'Lightning', '#CA8A04', null),
  ('Transport', 'PENGELUARAN', 'kos', true, 'Scooter', '#2563EB', null),
  ('Langganan', 'PENGELUARAN', 'kos', true, 'DeviceMobile', '#7C3AED', null),
  ('Kuliah', 'PENGELUARAN', 'kos', true, 'GraduationCap', '#0891B2', null),

  -- Pelaku UMKM
  ('Penjualan', 'PEMASUKAN', 'umkm', true, 'Storefront', '#0B5C46', null),
  ('Bahan baku', 'PENGELUARAN', 'umkm', true, 'Package', '#D97706', null),
  ('Biaya operasional', 'PENGELUARAN', 'umkm', true, 'GearSix', '#4B5563', null),
  ('Gaji/upah', 'PENGELUARAN', 'umkm', true, 'Users', '#2563EB', null),
  ('Transport & pengiriman', 'PENGELUARAN', 'umkm', true, 'Truck', '#059669', null);
