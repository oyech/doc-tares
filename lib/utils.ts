import { INDONESIAN_DAYS, INDONESIAN_MONTHS, ROMAN_MONTHS } from './constants';
import { BeritaAcaraData, BQData, BQItem } from './types';

/**
 * Format date string (YYYY-MM-DD) into Indonesian day phrase:
 * "Senin Tanggal 12 Oktober Tahun 2026"
 */
export function formatIndonesianDayPhrase(dateStr: string): string {
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;

  const dateObj = new Date(year, month - 1, day);
  const dayName = INDONESIAN_DAYS[dateObj.getDay()] || '';
  const monthName = INDONESIAN_MONTHS[month] || '';

  return `${dayName} Tanggal ${day} ${monthName} Tahun ${year}`;
}

/**
 * Format date string into standard Indonesian date:
 * "Senin, 12 Oktober 2026"
 */
export function formatIndonesianDateShort(dateStr: string): string {
  if (!dateStr) return '';
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const day = parseInt(dayStr, 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) return dateStr;

  const dateObj = new Date(year, month - 1, day);
  const dayName = INDONESIAN_DAYS[dateObj.getDay()] || '';
  const monthName = INDONESIAN_MONTHS[month] || '';

  return `${dayName}, ${day} ${monthName} ${year}`;
}

/**
 * Generate complete Berita Acara number from input number and date.
 * Format: {nomor_padded}/BAK-TAR/ENG/{bulan_romawi}/{tahun}
 * Example: "067" -> "067/BAK-TAR/ENG/X/2026"
 */
export function generateBeritaAcaraNumber(nomorInput: string, dateStr: string): string {
  if (!nomorInput) return '';
  if (nomorInput.includes('/BAK-TAR/ENG/')) return nomorInput;

  const [yearStr, monthStr] = (dateStr || '').split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || (new Date().getMonth() + 1);

  const nomorPadded = nomorInput.trim().padStart(3, '0');
  const romanMonth = ROMAN_MONTHS[month] || String(month);

  return `${nomorPadded}/BAK-TAR/ENG/${romanMonth}/${year}`;
}

/**
 * Generate PDF filename for Berita Acara:
 * Format: [Nomor] [Deskripsi Kejadian] [Lokasi].pdf
 * Example: "278 Tagihan Listrik Melonjak STC-18O.pdf"
 */
export function generateBeritaAcaraFilename(data: BeritaAcaraData): string {
  const rawNomor = data.nomor || '';
  const nomorPart = rawNomor.includes('/') ? rawNomor.split('/')[0].trim() : rawNomor.trim();
  const deskripsiPart = (data.deskripsi || '').trim();
  const lokasiPart = (data.lokasi || '').trim();

  const parts = [nomorPart, deskripsiPart, lokasiPart].filter(Boolean);
  let baseName = parts.length > 0 ? parts.join(' ') : 'Berita_Acara';

  // Clean characters that are problematic in filenames
  baseName = baseName
    .replace(/[\\/]/g, '-')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/[:*?"<>|]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return `${baseName || 'Berita_Acara'}.pdf`;
}

/**
 * Generate PDF filename for BQ:
 * Format: BQ_[Nomor].pdf
 */
export function generateBqFilename(data: BQData): string {
  const nomor = (data.nomor || 'Draft').replace(/[\s\\/]+/g, '_').replace(/[:*?"<>|]/g, '');
  return `BQ_${nomor}.pdf`;
}

/**
 * Format currency number into Indonesian Rupiah format:
 * 18500000 -> "18.500.000"
 */
export function formatNumberId(val: number): string {
  if (!val || isNaN(val)) return '0';
  return Math.round(val).toLocaleString('id-ID');
}

/**
 * Calculate totals for BQ items
 */
export function calculateBQTotals(items: BQItem[]) {
  let totalMaterial = 0;
  let totalLabor = 0;

  for (const item of items) {
    const qty = item.qty || 0;
    const mat = item.materialPrice || 0;
    const lab = item.laborPrice || 0;
    totalMaterial += qty * mat;
    totalLabor += qty * lab;
  }

  const subtotal = totalMaterial + totalLabor;
  const ppn = subtotal * 0.11;
  const grandTotal = subtotal + ppn;

  return {
    totalMaterial,
    totalLabor,
    subtotal,
    ppn,
    grandTotal,
  };
}
