import { BeritaAcaraData, BQData } from './types';

export const INDONESIAN_DAYS: Record<number, string> = {
  0: 'Minggu',
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: 'Jumat',
  6: 'Sabtu',
};

export const INDONESIAN_MONTHS: Record<number, string> = {
  1: 'Januari',
  2: 'Februari',
  3: 'Maret',
  4: 'April',
  5: 'Mei',
  6: 'Juni',
  7: 'Juli',
  8: 'Agustus',
  9: 'September',
  10: 'Oktober',
  11: 'November',
  12: 'Desember',
};

export const ROMAN_MONTHS: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'VII',
  8: 'VIII',
  9: 'IX',
  10: 'X',
  11: 'XI',
  12: 'XII',
};

export const DEFAULT_DEPARTMENTS = ['ENG', 'GS', 'HRGA', 'CH'];

export const DEPARTMENT_LABELS: Record<string, string> = {
  ENG: 'ENG — Engineering',
  GS: 'GS — General Service',
  HRGA: 'HRGA — Human Resources & GA',
  CH: 'CH — Club House',
};

export const DEFAULT_BERITA_ACARA: BeritaAcaraData = {
  nomor: '278/BAK-TAR/ENG/X/2026',
  dept: 'ENG',
  tanggal: '2026-10-20',
  waktu: '10:00',
  lokasi: 'STC-18O',
  deskripsi: 'Tagihan Listrik Melonjak',
  analisa: 'Berdasarkan pengecekan lapangan dan pengukuran arus beban panel daya pada unit STC-18O, ditemukan adanya pemakaian daya yang tidak wajar akibat malfungsi unit pendingin udara (AC) yang bekerja terus menerus tanpa cut-off otomatis temperatur termostat.',
  solusi: 'Telah dilakukan perbaikan dan penggantian thermostat unit pendingin udara, pembersihan coil condenser serta kalibrasi sensor otomatis. Unit saat ini kembali beroperasi normal dengan konsumsi arus listrik sesuai spesifikasi standar.',
  staffEngineering: 'Solehudin',
  supervisor: 'Agus Setiawan',
  asstManager: 'Bambang Kusuma',
  propertyManager: 'Dian Nugroho',
  photos: [],
};

export const DEFAULT_BQ: BQData = {
  nomor: '174/ICE-BQ/ENG/VII/2026',
  project: 'PENGGANTIAN POMPA BOOSTER TOWER A',
  kontraktor: 'PT. MANDIRI TEKNIK PRIMA',
  location: 'Ruang Pompa Gedung Utama Taman Anggrek Residences',
  dibuatOleh: 'Bambang Kusuma',
  menyetujui: 'Dian Nugroho',
  mengetahui: 'Hendra Wijaya',
  items: [
    {
      id: 'item-1',
      itemNo: '1',
      description: 'Pengadaan Unit Booster Pump Vertical Multistage Cap 15 m3/jam Head 60m',
      qty: 2,
      unit: 'Unit',
      materialPrice: 18500000,
      laborPrice: 1500000,
    },
    {
      id: 'item-2',
      itemNo: '2',
      description: 'Instalasi pipa discharge & suction header pipa seamless sch 40 dia 3 inch',
      qty: 1,
      unit: 'Ls',
      materialPrice: 4200000,
      laborPrice: 2000000,
    },
    {
      id: 'item-3',
      itemNo: '3',
      description: 'Penggantian Check Valve & Gate Valve dia 3 inch Class 10K',
      qty: 4,
      unit: 'Pcs',
      materialPrice: 1350000,
      laborPrice: 250000,
    },
    {
      id: 'item-4',
      itemNo: '4',
      description: 'Testing, commissioning & balancing sistem pompa booster',
      qty: 1,
      unit: 'Ls',
      materialPrice: 0,
      laborPrice: 1800000,
    },
  ],
};
