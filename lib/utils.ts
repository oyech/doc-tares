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
 * Extract department from full Berita Acara number if present.
 * Example: "278/BAK-TAR/GS/X/2026" -> "GS"
 */
export function extractDeptFromNomor(nomor: string): string {
  if (!nomor) return 'ENG';
  const parts = nomor.split('/');
  if (parts.length >= 3 && parts[1] === 'BAK-TAR') {
    return parts[2] ? parts[2].trim().toUpperCase() : 'ENG';
  }
  return 'ENG';
}

/**
 * Extract raw number (prefix) from Berita Acara number.
 * Example: "278/BAK-TAR/ENG/X/2026" -> "278"
 */
export function extractNomorUrut(nomor: string): string {
  if (!nomor) return '';
  return nomor.split('/')[0].trim();
}

/**
 * Generate complete Berita Acara number from input number, date, and department.
 * Format: {nomor_padded}/BAK-TAR/{dept}/{bulan_romawi}/{tahun}
 * Example: "067", "2026-10-20", "GS" -> "067/BAK-TAR/GS/X/2026"
 */
export function generateBeritaAcaraNumber(
  nomorInput: string,
  dateStr: string,
  dept: string = 'ENG'
): string {
  if (!nomorInput) return '';
  const cleanDept = (dept || 'ENG').trim().toUpperCase();

  // If already full format, replace the dept part
  if (nomorInput.includes('/BAK-TAR/')) {
    const parts = nomorInput.split('/');
    if (parts.length >= 5) {
      parts[2] = cleanDept;
      return parts.join('/');
    }
  }

  const prefix = nomorInput.split('/')[0].trim();
  const [yearStr, monthStr] = (dateStr || '').split('-');
  const year = parseInt(yearStr, 10) || new Date().getFullYear();
  const month = parseInt(monthStr, 10) || (new Date().getMonth() + 1);

  // Keep prefix exactly as input by user without automatically adding 00
  const cleanPrefix = prefix;
  const romanMonth = ROMAN_MONTHS[month] || String(month);

  return `${cleanPrefix}/BAK-TAR/${cleanDept}/${romanMonth}/${year}`;
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
