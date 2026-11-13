import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateBeritaAcaraFilename,
  generateBeritaAcaraNumber,
  generateBqFilename,
  formatIndonesianDayPhrase,
  calculateBQTotals,
} from '../lib/utils';
import { DEFAULT_BQ } from '../lib/constants';

test('Berita Acara Filename matches Python test cases', () => {
  // Case 1: user example 278 Tagihan Listrik Melonjak STC-18O.pdf
  const case1 = generateBeritaAcaraFilename({
    nomor: '278/BAK-TAR/ENG/X/2026',
    tanggal: '2026-10-20',
    waktu: '10:00',
    lokasi: 'STC-18O',
    deskripsi: 'Tagihan Listrik Melonjak',
    analisa: '',
    solusi: '',
    staffEngineering: '',
    supervisor: '',
    asstManager: '',
    propertyManager: '',
    photos: [],
  });
  assert.equal(case1, '278 Tagihan Listrik Melonjak STC-18O.pdf');

  // Case 2: plain number without slash
  const case2 = generateBeritaAcaraFilename({
    nomor: '278',
    tanggal: '2026-10-20',
    waktu: '10:00',
    lokasi: 'STC-18O',
    deskripsi: 'Tagihan Listrik Melonjak',
    analisa: '',
    solusi: '',
    staffEngineering: '',
    supervisor: '',
    asstManager: '',
    propertyManager: '',
    photos: [],
  });
  assert.equal(case2, '278 Tagihan Listrik Melonjak STC-18O.pdf');

  // Case 3: sanitization slashes and forbidden chars
  const case3 = generateBeritaAcaraFilename({
    nomor: '236/BAK-TAR/ENG/IX/2026',
    tanggal: '2026-09-15',
    waktu: '10:00',
    lokasi: 'Ruang Kontrol: NOC?',
    deskripsi: 'Battery bekas penggantian UPS tower A/B\n',
    analisa: '',
    solusi: '',
    staffEngineering: '',
    supervisor: '',
    asstManager: '',
    propertyManager: '',
    photos: [],
  });
  assert.equal(case3, '236 Battery bekas penggantian UPS tower A-B Ruang Kontrol NOC.pdf');
});

test('Berita Acara Number generation with Roman month and Dept', () => {
  // Default dept is ENG, no automatic 00 padding
  assert.equal(generateBeritaAcaraNumber('67', '2026-08-15'), '67/BAK-TAR/ENG/VIII/2026');
  assert.equal(generateBeritaAcaraNumber('278', '2026-10-20'), '278/BAK-TAR/ENG/X/2026');
  assert.equal(generateBeritaAcaraNumber('1', '2026-01-10'), '1/BAK-TAR/ENG/I/2026');

  // Custom departments: GS, HRGA, CH, custom
  assert.equal(generateBeritaAcaraNumber('278', '2026-10-20', 'GS'), '278/BAK-TAR/GS/X/2026');
  assert.equal(generateBeritaAcaraNumber('278', '2026-10-20', 'HRGA'), '278/BAK-TAR/HRGA/X/2026');
  assert.equal(generateBeritaAcaraNumber('278', '2026-10-20', 'CH'), '278/BAK-TAR/CH/X/2026');
  assert.equal(generateBeritaAcaraNumber('278', '2026-10-20', 'SECURITY'), '278/BAK-TAR/SECURITY/X/2026');

  // Updating existing full number with new Dept
  assert.equal(
    generateBeritaAcaraNumber('278/BAK-TAR/ENG/X/2026', '2026-10-20', 'GS'),
    '278/BAK-TAR/GS/X/2026'
  );
  assert.equal(
    generateBeritaAcaraNumber('278/BAK-TAR/ENG/X/2026', '2026-10-20', 'HRGA'),
    '278/BAK-TAR/HRGA/X/2026'
  );
  assert.equal(
    generateBeritaAcaraNumber('67/BAK-TAR/ENG/VIII/2026', '2026-08-15', 'ENG'),
    '67/BAK-TAR/ENG/VIII/2026'
  );
});

test('Indonesian Day Phrase formatting', () => {
  const phrase = formatIndonesianDayPhrase('2026-10-20');
  // 2026-10-20 is Tuesday (Selasa)
  assert.equal(phrase, 'Selasa Tanggal 20 Oktober Tahun 2026');
});

test('BQ Calculations', () => {
  const totals = calculateBQTotals(DEFAULT_BQ.items);
  // Item 1: 2 * (18.5m + 1.5m) = 40m
  // Item 2: 1 * (4.2m + 2.0m) = 6.2m
  // Item 3: 4 * (1.35m + 0.25m) = 6.4m
  // Item 4: 1 * (0 + 1.8m) = 1.8m
  // Subtotal: 40 + 6.2 + 6.4 + 1.8 = 54.4m = 54,400,000
  assert.equal(totals.subtotal, 54400000);
  assert.equal(totals.ppn, 5984000);
  assert.equal(totals.grandTotal, 60384000);
});

test('BQ Filename generation', () => {
  const filename = generateBqFilename(DEFAULT_BQ);
  assert.equal(filename, 'BQ_174_ICE-BQ_ENG_VII_2026.pdf');
});
