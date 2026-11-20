import React from 'react';
import { NextResponse } from 'next/server';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { formatRupiah, formatTanggal, getNamaBulan, getLabelProfil } from '@/lib/format';
import { hitungRingkasan, hitungPengeluaranPerKategori } from '@/lib/domain/ringkasan';
import type { ProfilTipe } from '@/lib/types/database';

const pdfStyles = StyleSheet.create({
  page: {
    padding: 36,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#14231D',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 2,
    borderBottomColor: '#0B5C46',
    paddingBottom: 12,
    marginBottom: 18,
  },
  brand: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: '#0B5C46',
  },
  subtitle: {
    fontSize: 9,
    color: '#52625B',
    marginTop: 2,
  },
  periodBadge: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#14231D',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  summaryBox: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    backgroundColor: '#F6F7F2',
    borderWidth: 1,
    borderColor: '#DCE4DE',
  },
  summaryLabel: {
    fontSize: 8,
    color: '#52625B',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#14231D',
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0B5C46',
    marginBottom: 8,
    marginTop: 6,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#E4F0E9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 4,
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#DCE4DE',
    fontSize: 9,
  },
  colDate: { width: '18%' },
  colCat: { width: '24%' },
  colNote: { width: '32%' },
  colType: { width: '10%' },
  colAmount: { width: '16%', textAlign: 'right' },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    borderTopWidth: 1,
    borderTopColor: '#DCE4DE',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#52625B',
  },
});

export async function GET(
  request: Request,
  context: { params: Promise<{ format: string }> }
) {
  const { format } = await context.params;
  if (format !== 'csv' && format !== 'pdf') {
    return NextResponse.json({ error: 'Format laporan tidak didukung.' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Tidak terautentikasi.' }, { status: 401 });
  }

  const { data: akun } = await supabase
    .from('akun')
    .select('nama, email, profil, peran, aktif')
    .eq('id', user.id)
    .single();

  if (!akun || !akun.aktif || akun.peran === 'admin') {
    return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const now = new Date();
  const bulan = Math.min(12, Math.max(1, parseInt(searchParams.get('bulan') || String(now.getMonth() + 1), 10)));
  const tahun = Math.min(2100, Math.max(2020, parseInt(searchParams.get('tahun') || String(now.getFullYear()), 10)));

  const startDate = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
  const endDate =
    bulan === 12 ? `${tahun + 1}-01-01` : `${tahun}-${String(bulan + 1).padStart(2, '0')}-01`;

  const [{ data: transaksiList }, { data: kategoriList }] = await Promise.all([
    supabase
      .from('transaksi')
      .select('id, jumlah, jenis, tanggal, catatan, id_kategori')
      .eq('id_pengguna', user.id)
      .gte('tanggal', startDate)
      .lt('tanggal', endDate)
      .order('tanggal', { ascending: true }),
    supabase
      .from('kategori')
      .select('id, nama, ikon, warna')
      .or(`is_bawaan.eq.true,id_pengguna.eq.${user.id}`),
  ]);

  const rows = transaksiList || [];
  const kats = kategoriList || [];
  const katMap = new Map(kats.map((k) => [k.id, k]));

  const namaBulan = getNamaBulan(bulan);
  const filenameBase = `finara-laporan-${namaBulan.toLowerCase()}-${tahun}`;

  if (format === 'csv') {
    const header = ['Tanggal', 'Jenis', 'Kategori', 'Nominal (IDR)', 'Catatan'];
    const escapeCsv = (val: string) => `"${val.replace(/"/g, '""')}"`;

    const lines = [
      header.join(','),
      ...rows.map((r) => {
        const katNama = katMap.get(r.id_kategori)?.nama || 'Lainnya';
        return [
          escapeCsv(r.tanggal),
          escapeCsv(r.jenis),
          escapeCsv(katNama),
          String(Math.round(Number(r.jumlah))),
          escapeCsv(r.catatan || ''),
        ].join(',');
      }),
    ];

    const csvContent = '\uFEFF' + lines.join('\n');
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
      },
    });
  }

  const ringkasan = hitungRingkasan(rows, akun.profil as ProfilTipe | null);
  const breakdown = hitungPengeluaranPerKategori(rows, kats).slice(0, 5);

  const doc = (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.header}>
          <View>
            <Text style={pdfStyles.brand}>finara.</Text>
            <Text style={pdfStyles.subtitle}>
              {akun.nama || akun.email} - Profil {getLabelProfil(akun.profil)}
            </Text>
          </View>
          <Text style={pdfStyles.periodBadge}>
            Laporan {namaBulan} {tahun}
          </Text>
        </View>

        <View style={pdfStyles.summaryGrid}>
          <View style={pdfStyles.summaryBox}>
            <Text style={pdfStyles.summaryLabel}>Total Pemasukan</Text>
            <Text style={pdfStyles.summaryValue}>{formatRupiah(ringkasan.pemasukan)}</Text>
          </View>
          <View style={pdfStyles.summaryBox}>
            <Text style={pdfStyles.summaryLabel}>Total Pengeluaran</Text>
            <Text style={pdfStyles.summaryValue}>{formatRupiah(ringkasan.pengeluaran)}</Text>
          </View>
          <View style={pdfStyles.summaryBox}>
            <Text style={pdfStyles.summaryLabel}>{ringkasan.labelSaldo}</Text>
            <Text style={pdfStyles.summaryValue}>{formatRupiah(ringkasan.saldo)}</Text>
          </View>
        </View>

        {breakdown.length > 0 && (
          <View style={{ marginBottom: 14 }}>
            <Text style={pdfStyles.sectionTitle}>Pengeluaran Terbesar per Kategori</Text>
            {breakdown.map((b) => (
              <View key={b.idKategori} style={pdfStyles.tableRow}>
                <Text style={{ width: '55%' }}>{b.nama}</Text>
                <Text style={{ width: '20%', textAlign: 'right' }}>{b.persentase}%</Text>
                <Text style={{ width: '25%', textAlign: 'right', fontFamily: 'Helvetica-Bold' }}>
                  {formatRupiah(b.total)}
                </Text>
              </View>
            ))}
          </View>
        )}

        <Text style={pdfStyles.sectionTitle}>Daftar Transaksi ({rows.length} catatan)</Text>
        <View style={pdfStyles.tableHeader}>
          <Text style={pdfStyles.colDate}>Tanggal</Text>
          <Text style={pdfStyles.colCat}>Kategori</Text>
          <Text style={pdfStyles.colNote}>Catatan</Text>
          <Text style={pdfStyles.colType}>Jenis</Text>
          <Text style={pdfStyles.colAmount}>Nominal</Text>
        </View>

        {rows.length === 0 ? (
          <View style={pdfStyles.tableRow}>
            <Text>Belum ada transaksi tercatat pada periode ini.</Text>
          </View>
        ) : (
          rows.map((r) => (
            <View key={r.id} style={pdfStyles.tableRow}>
              <Text style={pdfStyles.colDate}>{formatTanggal(r.tanggal)}</Text>
              <Text style={pdfStyles.colCat}>{katMap.get(r.id_kategori)?.nama || 'Lainnya'}</Text>
              <Text style={pdfStyles.colNote}>{r.catatan || '-'}</Text>
              <Text style={pdfStyles.colType}>{r.jenis === 'PEMASUKAN' ? 'Masuk' : 'Keluar'}</Text>
              <Text style={pdfStyles.colAmount}>{formatRupiah(r.jumlah)}</Text>
            </View>
          ))
        )}

        <View style={pdfStyles.footer} fixed>
          <Text>Finara - Alat bantu edukasi dan perencanaan keuangan.</Text>
          <Text>Dicetak {formatTanggal(new Date())}</Text>
        </View>
      </Page>
    </Document>
  );

  const buffer = await renderToBuffer(doc);
  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filenameBase}.pdf"`,
    },
  });
}