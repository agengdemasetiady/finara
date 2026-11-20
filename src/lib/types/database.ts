export type PeranAkun = 'pengguna' | 'admin';
export type ProfilTipe = 'pelajar' | 'kos' | 'umkm';
export type ProfilTarget = 'semua' | ProfilTipe;
export type JenisTrx = 'PEMASUKAN' | 'PENGELUARAN';
export type JenisNotif = 'PERINGATAN_ANGGARAN' | 'PENGINGAT_TAGIHAN';

export interface Akun {
  id: string;
  email: string;
  nama: string;
  profil: ProfilTipe | null;
  peran: PeranAkun;
  aktif: boolean;
  dibuat_pada: string;
}

export interface Kategori {
  id: string;
  nama: string;
  jenis: JenisTrx;
  profil_target: ProfilTarget;
  is_bawaan: boolean;
  ikon: string | null;
  warna: string | null;
  id_pengguna: string | null;
}

export interface Transaksi {
  id: string;
  jumlah: number;
  jenis: JenisTrx;
  tanggal: string; // YYYY-MM-DD
  catatan: string | null;
  id_kategori: string;
  id_pengguna: string;
  dibuat_pada?: string;
  kategori?: Pick<Kategori, 'id' | 'nama' | 'ikon' | 'warna' | 'jenis'> | null;
}

export interface Anggaran {
  id: string;
  id_kategori: string;
  bulan: number;
  tahun: number;
  batas_jumlah: number;
  id_pengguna: string;
  kategori?: Pick<Kategori, 'id' | 'nama' | 'ikon' | 'warna'> | null;
}

export interface TargetTabungan {
  id: string;
  nama: string;
  target_jumlah: number;
  tanggal: string | null;
  id_pengguna: string;
}

export interface SetoranTabungan {
  id: string;
  jumlah: number;
  tanggal: string;
  id_target: string;
}

export interface PengingatTagihan {
  id: string;
  nama: string;
  jumlah: number | null;
  tanggal_jatuh_tempo: string;
  berulang: boolean;
  aktif: boolean;
  id_pengguna: string;
}

export interface Notifikasi {
  id: string;
  jenis: JenisNotif;
  pesan: string;
  sudah_dibaca: boolean;
  dibuat_pada: string;
  id_pengguna: string;
  kunci_unik: string | null;
}

export interface StatistikSistem {
  pengguna_per_profil: Record<string, number>;
  total_pengguna: number;
  total_transaksi: number;
}
