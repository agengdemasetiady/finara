import React from 'react';
import { NextResponse } from 'next/server';
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from '@react-pdf/renderer';
import { createClient } from '@/lib/supabase/server';
import { formatRupiah, formatTanggal, getNamaBulan, getLabelProfil } from '@/lib/format';
import { hitungRingkasan, hitungPengeluaranPerKategori } from '@/lib/domain/ringkasan';
import type { ProfilTipe } from '@/lib/types/database';

const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 56,
    paddingHorizontal: 36,
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  topAccent: {
    height: 4,
    backgroundColor: '#0B5C46',
    marginBottom: 20,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  brandText: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: '#0B5C46',
    letterSpacing: -0.5,
  },
  brandDot: {
    fontSize: 24,
    fontFamily: 'Helvetica-Bold',
    color: '#E09F24',
  },
  docType: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748B',
    letterSpacing: 1.1,
    marginTop: 4,
  },
  metaBox: {
    alignItems: 'flex-end',
  },
  periodTitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    marginBottom: 4,
  },
  metaLine: {
    fontSize: 8.5,
    color: '#475569',
    marginBottom: 2,
  },
  metaBold: {
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  summaryStrip: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    backgroundColor: '#F8FAFC',
    marginBottom: 20,
    overflow: 'hidden',
  },
  summaryCell: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  summaryCellHighlight: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: '#F0FDF4',
  },
  summaryCellNegative: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 14,
    backgroundColor: '#FEF2F2',
  },
  summaryLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748B',
    letterSpacing: 0.7,
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 13.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  summaryValuePositive: {
    fontSize: 13.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0B5C46',
  },
  summaryValueNegative: {
    fontSize: 13.5,
    fontFamily: 'Helvetica-Bold',
    color: '#B91C1C',
  },
  sectionBlock: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
    letterSpacing: 0.8,
  },
  sectionMeta: {
    fontSize: 8,
    color: '#64748B',
  },
  catContainer: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
  },
  catName: {
    width: '34%',
    fontSize: 9,
    color: '#1E293B',
  },
  catBarWrap: {
    width: '34%',
    paddingRight: 10,
  },
  catTrack: {
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  catFillPrimary: {
    height: 5,
    backgroundColor: '#0B5C46',
    borderRadius: 3,
  },
  catFillSecondary: {
    height: 5,
    backgroundColor: '#4D8B78',
    borderRadius: 3,
  },
  catPct: {
    width: '10%',
    textAlign: 'right',
    fontSize: 8.5,
    color: '#64748B',
  },
  catAmount: {
    width: '22%',
    textAlign: 'right',
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 7,
    paddingHorizontal: 8,
  },
  thText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    letterSpacing: 0.6,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
  },
  tableRowAlt: {
    backgroundColor: '#FAFBF9',
  },
  colDate: {
    width: '17%',
    fontSize: 8.5,
    color: '#334155',
  },
  colCat: {
    width: '23%',
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0F172A',
    paddingRight: 6,
  },
  colNote: {
    width: '31%',
    fontSize: 8.5,
    color: '#64748B',
    paddingRight: 6,
  },
  colType: {
    width: '10%',
  },
  typeBadgeIn: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0B5C46',
  },
  typeBadgeOut: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#64748B',
  },
  colAmount: {
    width: '19%',
    textAlign: 'right',
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
  },
  amountIn: {
    color: '#0B5C46',
  },
  amountOut: {
    color: '#0F172A',
  },
  tableTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0B5C46',
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  tableTotalLabel: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#334155',
  },
  tableTotalValue: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#0B5C46',
  },
  tableTotalValueNeg: {
    fontSize: 9.5,
    fontFamily: 'Helvetica-Bold',
    color: '#B91C1C',
  },
  emptyRow: {
    paddingVertical: 18,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 8.5,
    color: '#64748B',
  },
  footer: {
    position: 'absolute',
    bottom: 22,
    left: 36,
    right: 36,
    borderTopWidth: 0.75,
    borderTopColor: '#CBD5E1',
    paddingTop: 7,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: 7.5,
    color: '#64748B',
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
  const kodeDokumen = `FNR-${tahun}${String(bulan).padStart(2, '0')}`;
  const isSaldoNegatif = ringkasan.saldo < 0;

  const doc = (
    <Document
      title={`Laporan Keuangan ${namaBulan} ${tahun} - Finara`}
      author="Finara"
    >
      <Page size="A4" style={pdfStyles.page}>
        <View style={pdfStyles.topAccent} />

        {/* Masthead Statement */}
        <View style={pdfStyles.header}>
          <View>
            <View style={pdfStyles.brandRow}>
              <Text style={pdfStyles.brandText}>finara</Text>
              <Text style={pdfStyles.brandDot}>.</Text>
            </View>
            <Text style={pdfStyles.docType}>RINGKASAN LAPORAN KEUANGAN</Text>
          </View>

          <View style={pdfStyles.metaBox}>
            <Text style={pdfStyles.periodTitle}>
              {namaBulan} {tahun}
            </Text>
            <Text style={pdfStyles.metaLine}>
              Pemilik: <Text style={pdfStyles.metaBold}>{akun.nama || akun.email}</Text>
            </Text>
            <Text style={pdfStyles.metaLine}>
              Profil: {getLabelProfil(akun.profil)} | Ref: {kodeDokumen}
            </Text>
          </View>
        </View>

        {/* Pita Ringkasan Utama */}
        <View style={pdfStyles.summaryStrip} wrap={false}>
          <View style={pdfStyles.summaryCell}>
            <Text style={pdfStyles.summaryLabel}>TOTAL PEMASUKAN</Text>
            <Text style={pdfStyles.summaryValuePositive}>
              +{formatRupiah(ringkasan.pemasukan)}
            </Text>
          </View>

          <View style={pdfStyles.summaryCell}>
            <Text style={pdfStyles.summaryLabel}>TOTAL PENGELUARAN</Text>
            <Text style={pdfStyles.summaryValue}>
              -{formatRupiah(ringkasan.pengeluaran)}
            </Text>
          </View>

          <View style={isSaldoNegatif ? pdfStyles.summaryCellNegative : pdfStyles.summaryCellHighlight}>
            <Text style={pdfStyles.summaryLabel}>{ringkasan.labelSaldo.toUpperCase()}</Text>
            <Text style={isSaldoNegatif ? pdfStyles.summaryValueNegative : pdfStyles.summaryValuePositive}>
              {isSaldoNegatif ? `-${formatRupiah(Math.abs(ringkasan.saldo))}` : formatRupiah(ringkasan.saldo)}
            </Text>
          </View>
        </View>

        {/* Distribusi Pengeluaran per Kategori */}
        {breakdown.length > 0 && (
          <View style={pdfStyles.sectionBlock} wrap={false}>
            <View style={pdfStyles.sectionHeaderRow}>
              <Text style={pdfStyles.sectionTitle}>DISTRIBUSI PENGELUARAN TERBESAR</Text>
              <Text style={pdfStyles.sectionMeta}>Top {breakdown.length} kategori</Text>
            </View>

            <View style={pdfStyles.catContainer}>
              {breakdown.map((b, idx) => (
                <View key={b.idKategori} style={pdfStyles.catRow}>
                  <Text style={pdfStyles.catName}>{b.nama}</Text>
                  <View style={pdfStyles.catBarWrap}>
                    <View style={pdfStyles.catTrack}>
                      <View
                        style={[
                          idx === 0 ? pdfStyles.catFillPrimary : pdfStyles.catFillSecondary,
                          { width: `${Math.min(100, Math.max(4, b.persentase))}%` },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={pdfStyles.catPct}>{b.persentase}%</Text>
                  <Text style={pdfStyles.catAmount}>{formatRupiah(b.total)}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Buku Besar Daftar Transaksi */}
        <View style={pdfStyles.sectionBlock}>
          <View style={pdfStyles.sectionHeaderRow}>
            <Text style={pdfStyles.sectionTitle}>RINCIAN TRANSAKSI PERIODE INI</Text>
            <Text style={pdfStyles.sectionMeta}>{rows.length} catatan transaksi</Text>
          </View>

          <View style={pdfStyles.tableHeader} fixed>
            <Text style={[pdfStyles.thText, pdfStyles.colDate]}>TANGGAL</Text>
            <Text style={[pdfStyles.thText, pdfStyles.colCat]}>KATEGORI</Text>
            <Text style={[pdfStyles.thText, pdfStyles.colNote]}>KETERANGAN</Text>
            <Text style={[pdfStyles.thText, pdfStyles.colType]}>ARUS</Text>
            <Text style={[pdfStyles.thText, pdfStyles.colAmount]}>NOMINAL</Text>
          </View>

          {rows.length === 0 ? (
            <View style={pdfStyles.emptyRow}>
              <Text style={pdfStyles.emptyText}>
                Belum ada transaksi tercatat pada periode {namaBulan} {tahun}.
              </Text>
            </View>
          ) : (
            <>
              {rows.map((r, index) => {
                const isMasuk = r.jenis === 'PEMASUKAN';
                const catatanBersih = r.catatan && r.catatan.trim().length > 0 ? r.catatan.trim() : '-';
                return (
                  <View
                    key={r.id}
                    style={[pdfStyles.tableRow, index % 2 === 1 ? pdfStyles.tableRowAlt : {}]}
                    wrap={false}
                  >
                    <Text style={pdfStyles.colDate}>{formatTanggal(r.tanggal)}</Text>
                    <Text style={pdfStyles.colCat}>{katMap.get(r.id_kategori)?.nama || 'Lainnya'}</Text>
                    <Text style={pdfStyles.colNote}>{catatanBersih}</Text>
                    <View style={pdfStyles.colType}>
                      <Text style={isMasuk ? pdfStyles.typeBadgeIn : pdfStyles.typeBadgeOut}>
                        {isMasuk ? 'MASUK' : 'KELUAR'}
                      </Text>
                    </View>
                    <Text style={[pdfStyles.colAmount, isMasuk ? pdfStyles.amountIn : pdfStyles.amountOut]}>
                      {isMasuk ? `+${formatRupiah(r.jumlah)}` : `-${formatRupiah(r.jumlah)}`}
                    </Text>
                  </View>
                );
              })}

              <View style={pdfStyles.tableTotalRow} wrap={false}>
                <Text style={pdfStyles.tableTotalLabel}>
                  Selisih Bersih ({ringkasan.labelSaldo})
                </Text>
                <Text style={isSaldoNegatif ? pdfStyles.tableTotalValueNeg : pdfStyles.tableTotalValue}>
                  {isSaldoNegatif
                    ? `-${formatRupiah(Math.abs(ringkasan.saldo))}`
                    : `+${formatRupiah(ringkasan.saldo)}`}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Footer Dokumen Resmi */}
        <View style={pdfStyles.footer} fixed>
          <Text>Finara | Dicetak {formatTanggal(new Date())}</Text>
          <Text
            render={({ pageNumber, totalPages }) => `Halaman ${pageNumber} dari ${totalPages}`}
          />
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