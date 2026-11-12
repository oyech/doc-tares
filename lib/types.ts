export interface BeritaAcaraData {
  nomor: string;
  dept?: string;
  tanggal: string; // YYYY-MM-DD
  waktu: string;   // HH:mm
  lokasi: string;
  deskripsi: string;
  analisa: string;
  solusi: string;
  staffEngineering: string;
  supervisor: string;
  asstManager: string;
  propertyManager: string;
  photos: string[]; // base64 or object URLs
}

export interface BQItem {
  id: string;
  itemNo: string;
  description: string;
  qty: number;
  unit: string;
  materialPrice: number;
  laborPrice: number;
}

export interface BQData {
  nomor: string;
  project: string;
  kontraktor: string;
  location: string;
  dibuatOleh: string;
  menyetujui: string;
  mengetahui: string;
  items: BQItem[];
}

export type DocumentType = 'berita-acara' | 'bq';
export type BQViewMode = 'all' | 'ice' | 'bq';
