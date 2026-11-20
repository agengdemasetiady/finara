import { z } from 'zod';

export const daftarSchema = z.object({
  nama: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(80, 'Nama maksimal 80 karakter.'),
  email: z.string().trim().email('Format email belum benar.'),
  password: z.string().min(8, 'Kata sandi minimal 8 karakter.').max(72, 'Kata sandi maksimal 72 karakter.'),
  profil: z.enum(['pelajar', 'kos', 'umkm'], {
    message: 'Pilih salah satu profil pengguna.',
  }),
});

export const masukSchema = z.object({
  email: z.string().trim().email('Format email belum benar.'),
  password: z.string().min(1, 'Kata sandi wajib diisi.'),
});

export const lupaSandiSchema = z.object({
  email: z.string().trim().email('Format email belum benar.'),
});

export const aturUlangSandiSchema = z
  .object({
    password: z.string().min(8, 'Kata sandi baru minimal 8 karakter.').max(72, 'Kata sandi maksimal 72 karakter.'),
    konfirmasiPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi.'),
  })
  .refine((data) => data.password === data.konfirmasiPassword, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['konfirmasiPassword'],
  });

export const ubahProfilSchema = z.object({
  nama: z.string().trim().min(2, 'Nama minimal 2 karakter.').max(80, 'Nama maksimal 80 karakter.'),
  profil: z.enum(['pelajar', 'kos', 'umkm'], {
    message: 'Pilih profil yang valid.',
  }),
});

export const ubahSandiSchema = z
  .object({
    sandiLama: z.string().min(1, 'Kata sandi saat ini wajib diisi.'),
    sandiBaru: z.string().min(8, 'Kata sandi baru minimal 8 karakter.'),
    konfirmasiSandi: z.string().min(1, 'Konfirmasi kata sandi wajib diisi.'),
  })
  .refine((data) => data.sandiBaru === data.konfirmasiSandi, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['konfirmasiSandi'],
  });

export const hapusAkunSchema = z.object({
  sandi: z.string().min(1, 'Masukkan kata sandi untuk konfirmasi penghapusan akun.'),
});

export const transaksiSchema = z.object({
  jumlah: z.coerce.number().positive('Nominal harus lebih dari 0.').max(999999999999, 'Nominal terlalu besar.'),
  jenis: z.enum(['PEMASUKAN', 'PENGELUARAN'], {
    message: 'Jenis transaksi tidak valid.',
  }),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tidak valid.'),
  catatan: z.string().trim().max(200, 'Catatan maksimal 200 karakter.').optional().nullable(),
  id_kategori: z.string().uuid('Pilih kategori terlebih dahulu.'),
});

export const kategoriSchema = z.object({
  nama: z.string().trim().min(2, 'Nama kategori minimal 2 karakter.').max(40, 'Nama kategori maksimal 40 karakter.'),
  jenis: z.enum(['PEMASUKAN', 'PENGELUARAN']),
  ikon: z.string().trim().min(1, 'Pilih ikon kategori.'),
  warna: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Pilih warna kategori.'),
  profil_target: z.enum(['semua', 'pelajar', 'kos', 'umkm']).optional().default('semua'),
});

export const anggaranSchema = z.object({
  id_kategori: z.string().uuid('Pilih kategori pengeluaran.'),
  bulan: z.coerce.number().int().min(1).max(12),
  tahun: z.coerce.number().int().min(2020).max(2100),
  batas_jumlah: z.coerce.number().positive('Batas anggaran harus lebih dari 0.'),
});

export const targetTabunganSchema = z.object({
  nama: z.string().trim().min(2, 'Nama target minimal 2 karakter.').max(60, 'Nama target maksimal 60 karakter.'),
  target_jumlah: z.coerce.number().positive('Target nominal harus lebih dari 0.'),
  tanggal: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal tenggat tidak valid.')
    .optional()
    .nullable()
    .or(z.literal('')),
});

export const setoranTabunganSchema = z.object({
  id_target: z.string().uuid('Target tabungan tidak valid.'),
  jumlah: z.coerce.number().positive('Nominal setoran harus lebih dari 0.'),
  tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format tanggal valid.'),
});

export const tagihanSchema = z.object({
  nama: z.string().trim().min(2, 'Nama tagihan minimal 2 karakter.').max(60, 'Nama tagihan maksimal 60 karakter.'),
  jumlah: z.coerce.number().nonnegative('Nominal tidak boleh negatif.').optional().nullable(),
  tanggal_jatuh_tempo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tanggal jatuh tempo wajib diisi.'),
  berulang: z.boolean().default(false),
  aktif: z.boolean().default(true),
});