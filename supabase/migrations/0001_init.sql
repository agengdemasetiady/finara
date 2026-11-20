-- 0001_init.sql
-- Skema Database FINARA (PostgreSQL / Supabase) + RLS + Trigger + RPC

create extension if not exists "pgcrypto";

create type peran_akun   as enum ('pengguna', 'admin');
create type profil_tipe  as enum ('pelajar', 'kos', 'umkm');
create type jenis_trx    as enum ('PEMASUKAN', 'PENGELUARAN');
create type jenis_notif  as enum ('PERINGATAN_ANGGARAN', 'PENGINGAT_TAGIHAN');

-- Profil aplikasi, 1:1 dengan auth.users
create table public.akun (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  nama        text not null default '',
  profil      profil_tipe,                       -- null untuk admin
  peran       peran_akun not null default 'pengguna',
  aktif       boolean not null default true,
  dibuat_pada timestamptz not null default now()
);

create table public.kategori (
  id            uuid primary key default gen_random_uuid(),
  nama          text not null,
  jenis         jenis_trx not null,
  profil_target text not null default 'semua' check (profil_target in ('semua','pelajar','kos','umkm')),
  is_bawaan     boolean not null default false,
  ikon          text,                            -- nama ikon Phosphor, mis. 'ForkKnife'
  warna         text,                            -- token warna kategori
  id_pengguna   uuid references public.akun(id) on delete cascade,  -- null = kategori bawaan sistem
  check ((is_bawaan and id_pengguna is null) or (not is_bawaan and id_pengguna is not null))
);

create table public.transaksi (
  id          uuid primary key default gen_random_uuid(),
  jumlah      numeric(14,2) not null check (jumlah > 0),
  jenis       jenis_trx not null,
  tanggal     date not null default current_date,
  catatan     text,
  id_kategori uuid not null references public.kategori(id),
  id_pengguna uuid not null references public.akun(id) on delete cascade,
  dibuat_pada timestamptz not null default now()
);
create index on public.transaksi (id_pengguna, tanggal desc);
create index on public.transaksi (id_pengguna, id_kategori, tanggal);

create table public.anggaran (
  id           uuid primary key default gen_random_uuid(),
  id_kategori  uuid not null references public.kategori(id),
  bulan        smallint not null check (bulan between 1 and 12),
  tahun        smallint not null,
  batas_jumlah numeric(14,2) not null check (batas_jumlah > 0),
  id_pengguna  uuid not null references public.akun(id) on delete cascade,
  unique (id_pengguna, id_kategori, bulan, tahun)
);

create table public.target_tabungan (
  id            uuid primary key default gen_random_uuid(),
  nama          text not null,
  target_jumlah numeric(14,2) not null check (target_jumlah > 0),
  tanggal       date,                            -- tenggat (opsional)
  id_pengguna   uuid not null references public.akun(id) on delete cascade
);

create table public.setoran_tabungan (
  id          uuid primary key default gen_random_uuid(),
  jumlah      numeric(14,2) not null check (jumlah > 0),
  tanggal     date not null default current_date,
  id_target   uuid not null references public.target_tabungan(id) on delete cascade
);

create table public.pengingat_tagihan (
  id                  uuid primary key default gen_random_uuid(),
  nama                text not null,
  jumlah              numeric(14,2),
  tanggal_jatuh_tempo date not null,
  berulang            boolean not null default false,   -- berulang bulanan
  aktif               boolean not null default true,
  id_pengguna         uuid not null references public.akun(id) on delete cascade
);

create table public.notifikasi (
  id           uuid primary key default gen_random_uuid(),
  jenis        jenis_notif not null,
  pesan        text not null,
  sudah_dibaca boolean not null default false,
  dibuat_pada  timestamptz not null default now(),
  id_pengguna  uuid not null references public.akun(id) on delete cascade,
  kunci_unik   text,                              -- mencegah notifikasi dobel
  unique (id_pengguna, kunci_unik)
);

-- Fungsi bantu cek peran admin
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.akun where id = auth.uid() and peran = 'admin' and aktif);
$$;

-- Buat baris akun otomatis saat user Supabase Auth dibuat
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.akun (id, email, nama, profil, peran)
  values (new.id, new.email,
          coalesce(new.raw_user_meta_data->>'nama',''),
          nullif(new.raw_user_meta_data->>'profil','')::profil_tipe,
          'pengguna');   -- peran admin TIDAK boleh ditentukan dari metadata klien
  return new;
end $$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Statistik sistem untuk Admin: hanya angka agregat, bukan data keuangan pribadi
create or replace function public.statistik_sistem() returns json
language sql stable security definer set search_path = public as $$
  select case when public.is_admin() then json_build_object(
    'pengguna_per_profil', (select coalesce(json_object_agg(profil, n), '{}'::json)
                            from (select profil, count(*) n from public.akun where peran='pengguna' group by profil) s),
    'total_pengguna',  (select count(*) from public.akun where peran='pengguna'),
    'total_transaksi', (select count(*) from public.transaksi)
  ) else null end;
$$;

-- RPC Transaksional: simpan transaksi & cek peringatan anggaran >= 80% / >= 100% (Sequence Diagram D.4)
create or replace function public.catat_transaksi_dan_cek_anggaran(
  p_jumlah numeric,
  p_jenis jenis_trx,
  p_tanggal date,
  p_catatan text,
  p_id_kategori uuid
) returns json
language plpgsql security invoker set search_path = public as $$
declare
  v_uid uuid := auth.uid();
  v_trx_id uuid;
  v_kat_nama text;
  v_kat_jenis jenis_trx;
  v_kat_bawaan boolean;
  v_kat_owner uuid;
  v_batas numeric;
  v_terpakai numeric;
  v_persen numeric;
  v_bulan smallint := extract(month from p_tanggal)::smallint;
  v_tahun smallint := extract(year from p_tanggal)::smallint;
  v_level int;
  v_pesan text;
  v_kunci text;
  v_notif_id uuid;
begin
  if v_uid is null then
    raise exception 'Tidak terautentikasi.';
  end if;

  if p_jumlah is null or p_jumlah <= 0 then
    raise exception 'Nominal harus lebih dari 0.';
  end if;

  select nama, jenis, is_bawaan, id_pengguna
    into v_kat_nama, v_kat_jenis, v_kat_bawaan, v_kat_owner
    from public.kategori
   where id = p_id_kategori;

  if not found then
    raise exception 'Kategori tidak ditemukan.';
  end if;

  if not v_kat_bawaan and v_kat_owner <> v_uid then
    raise exception 'Kategori bukan milik akun ini.';
  end if;

  if v_kat_jenis <> p_jenis then
    raise exception 'Jenis transaksi tidak sesuai dengan kategori.';
  end if;

  insert into public.transaksi (jumlah, jenis, tanggal, catatan, id_kategori, id_pengguna)
  values (p_jumlah, p_jenis, p_tanggal, nullif(trim(coalesce(p_catatan, '')), ''), p_id_kategori, v_uid)
  returning id into v_trx_id;

  if p_jenis = 'PENGELUARAN' then
    select batas_jumlah into v_batas
      from public.anggaran
     where id_pengguna = v_uid
       and id_kategori = p_id_kategori
       and bulan = v_bulan
       and tahun = v_tahun;

    if found and v_batas > 0 then
      select coalesce(sum(jumlah), 0) into v_terpakai
        from public.transaksi
       where id_pengguna = v_uid
         and id_kategori = p_id_kategori
         and jenis = 'PENGELUARAN'
         and extract(month from tanggal) = v_bulan
         and extract(year from tanggal) = v_tahun;

      v_persen := (v_terpakai / v_batas) * 100;

      if v_persen >= 80 then
        if v_persen >= 100 then
          v_level := 100;
          v_pesan := format('Anggaran %s terlampaui (%s%%).', v_kat_nama, round(v_persen));
        else
          v_level := 80;
          v_pesan := format('%s sudah %s%% dari anggaran.', v_kat_nama, round(v_persen));
        end if;

        v_kunci := format('%s:%s-%s:%s', p_id_kategori, v_tahun, lpad(v_bulan::text, 2, '0'), v_level);

        insert into public.notifikasi (jenis, pesan, id_pengguna, kunci_unik)
        values ('PERINGATAN_ANGGARAN', v_pesan, v_uid, v_kunci)
        on conflict (id_pengguna, kunci_unik) do nothing
        returning id into v_notif_id;
      end if;
    end if;
  end if;

  return json_build_object(
    'transaksi_id', v_trx_id,
    'peringatan', v_pesan,
    'notifikasi_dibuat', v_notif_id is not null
  );
end $$;

-- Row Level Security (wajib aktif di semua tabel)
alter table public.akun enable row level security;
alter table public.kategori enable row level security;
alter table public.transaksi enable row level security;
alter table public.anggaran enable row level security;
alter table public.target_tabungan enable row level security;
alter table public.setoran_tabungan enable row level security;
alter table public.pengingat_tagihan enable row level security;
alter table public.notifikasi enable row level security;

-- akun: lihat/ubah diri sendiri (peran & aktif TIDAK boleh diubah sendiri); admin boleh lihat semua dan ubah 'aktif'
create policy akun_select on public.akun for select using (id = auth.uid() or public.is_admin());
create policy akun_update_self on public.akun for update using (id = auth.uid())
  with check (id = auth.uid() and peran = (select peran from public.akun where id = auth.uid())
                               and aktif = (select aktif from public.akun where id = auth.uid()));
create policy akun_update_admin on public.akun for update using (public.is_admin()) with check (public.is_admin());

-- kategori: semua orang login boleh lihat bawaan + miliknya; pengguna kelola miliknya; admin kelola bawaan
create policy kategori_select on public.kategori for select using (is_bawaan or id_pengguna = auth.uid());
create policy kategori_own    on public.kategori for all using (id_pengguna = auth.uid() and not is_bawaan)
                                              with check (id_pengguna = auth.uid() and not is_bawaan);
create policy kategori_admin  on public.kategori for all using (public.is_admin() and is_bawaan)
                                              with check (public.is_admin() and is_bawaan);

-- tabel keuangan: HANYA pemilik (admin sengaja tidak diberi akses)
create policy trx_own  on public.transaksi        for all using (id_pengguna = auth.uid()) with check (id_pengguna = auth.uid());
create policy ang_own  on public.anggaran         for all using (id_pengguna = auth.uid()) with check (id_pengguna = auth.uid());
create policy tgt_own  on public.target_tabungan  for all using (id_pengguna = auth.uid()) with check (id_pengguna = auth.uid());
create policy tag_own  on public.pengingat_tagihan for all using (id_pengguna = auth.uid()) with check (id_pengguna = auth.uid());
create policy ntf_own  on public.notifikasi       for all using (id_pengguna = auth.uid()) with check (id_pengguna = auth.uid());
create policy stor_own on public.setoran_tabungan for all
  using (exists (select 1 from public.target_tabungan t where t.id = id_target and t.id_pengguna = auth.uid()))
  with check (exists (select 1 from public.target_tabungan t where t.id = id_target and t.id_pengguna = auth.uid()));
