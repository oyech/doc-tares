import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePdfTextToData } from '../lib/pdfParser';

test('parsePdfTextToData: parses Berita Acara correctly', () => {
  const baSampleText = [
    `PROPERTY MANAGEMENT TAMAN ANGGREK RESIDENCES
BERITA ACARA
No.  278/BAK-TAR/ENG/X/2026

Pada hari ini Selasa Tanggal 20 Oktober Tahun 2026 jam 10:00 WIB

Lokasi & Uraian Kejadian:
Lokasi Uraian Kejadian
STC-18O Tagihan Listrik Melonjak

Analisa Masalah / Kronologis:
Berdasarkan pengecekan lapangan dan pengukuran arus beban panel daya pada unit STC-18O, ditemukan adanya pemakaian daya yang tidak wajar akibat malfungsi unit pendingin udara (AC) yang bekerja terus menerus tanpa cut-off otomatis temperatur termostat.

Tindakan Pencegahan / Solusi:
Telah dilakukan perbaikan dan penggantian thermostat unit pendingin udara, pembersihan coil condenser serta kalibrasi sensor otomatis. Unit saat ini kembali beroperasi normal dengan konsumsi arus listrik sesuai spesifikasi standar.

Dilaporkan oleh Diperiksa oleh, Diketahui oleh,
Paraf: Paraf: Paraf: Paraf:
Nama: Solehudin Nama: Sandi Adi Putra Nama: Yafi Al Hadi Nama: Bobby Firdaus
Engineering Staff Supervisor Engineering Asst. Manager Property Manager
Tanggal: Tanggal: Tanggal: Tanggal:`,
  ];

  const result = parsePdfTextToData(baSampleText, '278 Tagihan Listrik Melonjak STC-18O.pdf');

  assert.equal(result.detectedType, 'berita-acara');
  assert.ok(result.beritaData);

  const ba = result.beritaData;
  assert.equal(ba.nomor, '278/BAK-TAR/ENG/X/2026');
  assert.equal(ba.dept, 'ENG');
  assert.equal(ba.tanggal, '2026-10-20');
  assert.equal(ba.waktu, '10:00');
  assert.equal(ba.lokasi, 'STC-18O');
  assert.equal(ba.deskripsi, 'Tagihan Listrik Melonjak');
  assert.ok(ba.analisa?.includes('malfungsi unit pendingin udara'));
  assert.ok(ba.solusi?.includes('penggantian thermostat'));

  // Signatories
  assert.equal(ba.staffEngineering, 'Solehudin');
  assert.equal(ba.supervisor, 'Sandi Adi Putra');
  assert.equal(ba.asstManager, 'Yafi Al Hadi');
  assert.equal(ba.propertyManager, 'Bobby Firdaus');
});

test('parsePdfTextToData: handles custom department and removes legacy closing text', () => {
  const gsText = [
    `PROPERTY MANAGEMENT TAMAN ANGGREK RESIDENCES
BERITA ACARA
No.  095/BAK-TAR/GS/XI/2026

Pada hari ini Rabu Tanggal 15 November Tahun 2026 jam 14:30 WIB

Lokasi & Uraian Kejadian:
Tower B Lt. 3
Pintu darurat macet dan engsel patah

Analisa Masalah / Kronologis:
Engsel pintu mengalami korosi berat.

Tindakan Pencegahan / Solusi:
Penggantian engsel baru heavy duty stainless steel.
Demikian Berita Acara ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya. Atas perhatian dan kerjasamanya kami ucapkan terima kasih.

Dilaporkan oleh Diperiksa oleh, Diketahui oleh,
Paraf: Paraf: Paraf: Paraf:
Nama: Rian Pratama Nama: Sandi Adi Putra Nama: Yafi Al Hadi Nama: Bobby Firdaus
Engineering Staff Supervisor Engineering Asst. Manager Property Manager`,
  ];

  const result = parsePdfTextToData(gsText, '095 Pintu Darurat Macet Tower B.pdf');
  assert.equal(result.detectedType, 'berita-acara');
  assert.ok(result.beritaData);
  assert.equal(result.beritaData.nomor, '095/BAK-TAR/GS/XI/2026');
  assert.equal(result.beritaData.dept, 'GS');
  assert.equal(result.beritaData.lokasi, 'Tower B Lt. 3');
  assert.equal(result.beritaData.deskripsi, 'Pintu darurat macet dan engsel patah');
  // Legacy closing sentence should be stripped
  assert.ok(!result.beritaData.solusi?.includes('Demikian Berita Acara ini dibuat'));
  assert.equal(result.beritaData.solusi, 'Penggantian engsel baru heavy duty stainless steel.');
});

test('parsePdfTextToData: parses BQ / ICE correctly', () => {
  const bqSampleText = [
    `INTERNAL COST ESTIMATION TAMAN ANGGREK RESIDENCES

Project : PENGGANTIAN POMPA BOOSTER TOWER A
Kontraktor : PT. MANDIRI TEKNIK PRIMA
Location : Ruang Pompa Gedung Utama Taman Anggrek Residences

NO ITEM QTY UNIT UNIT PRICE TOTAL PRICE
MATERIAL LABOR MATERIAL LABOR
1 Pengadaan Unit Booster Pump Vertical Multistage Cap 15 m3/jam Head 60m 2 Unit Rp 18.500.000 Rp 1.500.000 Rp 37.000.000 Rp 3.000.000
2 Instalasi pipa discharge & suction header pipa seamless sch 40 dia 3 inch 1 Ls Rp 4.200.000 Rp 2.000.000 Rp 4.200.000 Rp 2.000.000

Sub Total Rp 54.400.000
PPN 11% Rp 5.984.000
Grand Total Rp 60.384.000

Dibuat Oleh Menyetujui, Mengetahui,
Yafi Al Hadi Bobby Firdaus Hendra Wijaya
Engineering Ast. Manager Property Manager GM Building Management
Tanggal : .................... Tanggal : .................... Tanggal : ....................`,
  ];

  const result = parsePdfTextToData(bqSampleText, 'BQ_174_ICE-BQ_ENG_VII_2026.pdf');

  assert.equal(result.detectedType, 'bq');
  assert.ok(result.bqData);

  const bq = result.bqData;
  assert.equal(bq.nomor, '174/ICE-BQ/ENG/VII/2026');
  assert.equal(bq.project, 'PENGGANTIAN POMPA BOOSTER TOWER A');
  assert.equal(bq.kontraktor, 'PT. MANDIRI TEKNIK PRIMA');
  assert.equal(bq.location, 'Ruang Pompa Gedung Utama Taman Anggrek Residences');

  assert.ok(bq.items && bq.items.length >= 2);
  assert.equal(bq.items[0].itemNo, '1');
  assert.ok(bq.items[0].description.includes('Booster Pump'));
  assert.equal(bq.items[0].qty, 2);
  assert.equal(bq.items[0].unit, 'Unit');
  assert.equal(bq.items[0].materialPrice, 18500000);
  assert.equal(bq.items[0].laborPrice, 1500000);

  // Signatories
  assert.equal(bq.dibuatOleh, 'Yafi Al Hadi');
  assert.equal(bq.menyetujui, 'Bobby Firdaus');
  assert.equal(bq.mengetahui, 'Hendra Wijaya');
});

test('parsePdfTextToData: detects combined document (both BA and BQ)', () => {
  const combinedPages = [
    `PROPERTY MANAGEMENT TAMAN ANGGREK RESIDENCES
BERITA ACARA
No.  278/BAK-TAR/ENG/X/2026
Pada hari ini Selasa Tanggal 20 Oktober Tahun 2026 jam 10:00 WIB
Lokasi & Uraian Kejadian:
STC-18O Tagihan Listrik Melonjak
Analisa Masalah / Kronologis:
Uji beban normal.
Tindakan Pencegahan / Solusi:
Perbaikan selesai.
Nama: Solehudin Nama: Sandi Adi Putra Nama: Yafi Al Hadi Nama: Bobby Firdaus`,

    `INTERNAL COST ESTIMATION TAMAN ANGGREK RESIDENCES
Project : PENGGANTIAN POMPA BOOSTER TOWER A
Kontraktor : PT. MANDIRI TEKNIK PRIMA
Location : Ruang Pompa Gedung Utama
NO ITEM QTY UNIT UNIT PRICE TOTAL PRICE
1 Pompa 1 Unit Rp 10.000.000 Rp 1.000.000 Rp 10.000.000 Rp 1.000.000
Dibuat Oleh Menyetujui, Mengetahui,
Yafi Al Hadi Bobby Firdaus Hendra Wijaya`,
  ];

  const result = parsePdfTextToData(combinedPages, '278 Tagihan Listrik Melonjak STC-18O - BA ICE BQ.pdf');

  assert.equal(result.detectedType, 'both');
  assert.ok(result.beritaData);
  assert.ok(result.bqData);
  assert.equal(result.beritaData.nomor, '278/BAK-TAR/ENG/X/2026');
  assert.equal(result.bqData.project, 'PENGGANTIAN POMPA BOOSTER TOWER A');
});
