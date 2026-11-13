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
  jabatanStaff?: string;
  supervisor: string;
  jabatanSupervisor?: string;
  asstManager: string;
  jabatanAsstManager?: string;
  propertyManager: string;
  jabatanPropertyManager?: string;
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
  jabatanDibuatOleh?: string;
  menyetujui: string;
  jabatanMenyetujui?: string;
  mengetahui: string;
  jabatanMengetahui?: string;
  items: BQItem[];
}

export type DocumentType = 'berita-acara' | 'bq';
export type BQViewMode = 'all' | 'ice' | 'bq';
