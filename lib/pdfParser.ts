import { BeritaAcaraData, BQData, BQItem, DocumentType } from './types';
import { extractDeptFromNomor } from './utils';

// Mapping Indonesian month names to month numbers (1-12)
const MONTH_NAME_MAP: Record<string, string> = {
  januari: '01',
  februari: '02',
  maret: '03',
  april: '04',
  mei: '05',
  juni: '06',
  juli: '07',
  agustus: '08',
  september: '09',
  oktober: '10',
  november: '11',
  desember: '12',
};

export interface ParsedPdfResult {
  detectedType: DocumentType | 'both';
  fileName: string;
  beritaData?: Partial<BeritaAcaraData>;
  bqData?: Partial<BQData>;
  rawText: string;
}

interface PdfTextItem {
  str?: string;
  transform?: number[];
  width?: number;
}

/**
 * Extract text from a PDF file using pdfjs-dist grouped by lines (Y position)
 * Preserves column gaps by injecting multi-space gaps when X delta > 15
 */
export async function extractTextFromPdf(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdfjsLib = await import('pdfjs-dist');

  if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
  }

  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    useSystemFonts: true,
  });

  const pdf = await loadingTask.promise;
  const pagesText: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();

    const pageLines: string[] = [];
    let currentLine = '';
    let lastY: number | null = null;
    let lastX: number | null = null;
    let lastWidth: number = 0;

    // Group items into lines based on Y coordinate
    for (const item of textContent.items as unknown as PdfTextItem[]) {
      if (typeof item.str !== 'string') continue;
      const str = item.str;
      const x = item.transform ? Math.round(item.transform[4]) : null;
      const y = item.transform ? Math.round(item.transform[5]) : null;
      const width = item.width || 0;

      if (lastY !== null && y !== null && Math.abs(y - lastY) > 3) {
        if (currentLine.trim()) {
          pageLines.push(currentLine.trim());
        }
        currentLine = str;
      } else {
        // Detect column separation on the same horizontal line
        const isColumnGap =
          lastX !== null && x !== null && x - (lastX + lastWidth) > 15;
        const separator = isColumnGap
          ? '   '
          : currentLine && !currentLine.endsWith(' ') && !str.startsWith(' ')
          ? ' '
          : '';

        currentLine += separator + str;
      }
      lastY = y;
      lastX = x;
      lastWidth = width;
    }

    if (currentLine.trim()) {
      pageLines.push(currentLine.trim());
    }

    pagesText.push(pageLines.join('\n'));
  }

  return pagesText;
}

/**
 * Parse text extracted from PDF into structured Berita Acara and/or BQ data
 */
export function parsePdfTextToData(pagesText: string[], fileName: string): ParsedPdfResult {
  const fullText = pagesText.join('\n\n---PAGE---\n\n');

  const hasBA =
    /BERITA\s+ACARA/i.test(fullText) ||
    /BAK-TAR/i.test(fullText) ||
    /Lokasi\s+&\s+Uraian\s+Kejadian/i.test(fullText);

  const hasBQ =
    /BILL\s+OF\s+QUANTITY/i.test(fullText) ||
    /INTERNAL\s+COST\s+ESTIMATION/i.test(fullText) ||
    /ICE-BQ/i.test(fullText) ||
    /UNIT\s+PRICE/i.test(fullText) ||
    /BQ_/i.test(fileName);

  let detectedType: DocumentType | 'both' = 'berita-acara';
  if (hasBA && hasBQ) {
    detectedType = 'both';
  } else if (hasBQ) {
    detectedType = 'bq';
  } else {
    detectedType = 'berita-acara';
  }

  const result: ParsedPdfResult = {
    detectedType,
    fileName,
    rawText: fullText,
  };

  if (hasBA || detectedType === 'berita-acara') {
    result.beritaData = parseBeritaAcaraFromText(fullText, fileName);
  }

  if (hasBQ || detectedType === 'bq') {
    result.bqData = parseBqFromText(fullText, fileName);
  }

  return result;
}

/**
 * Heuristic parser for Berita Acara document text
 */
function parseBeritaAcaraFromText(text: string, fileName: string): Partial<BeritaAcaraData> {
  const data: Partial<BeritaAcaraData> = {};

  // 1. Nomor BA
  // Example: No.  278/BAK-TAR/ENG/X/2026 or 278/BAK-TAR/GS/...
  const nomorMatch = text.match(
    /No\.?\s*([0-9A-Za-z/_-]+(?:\/BAK-TAR\/[A-Za-z0-9_-]+\/[IVXLCDM]+\/\d{4})?)/i
  );
  if (nomorMatch && nomorMatch[1] && nomorMatch[1].includes('/BAK-TAR/')) {
    data.nomor = nomorMatch[1].trim();
    data.dept = extractDeptFromNomor(data.nomor);
  } else {
    const fallbackNomor = text.match(/(\d{1,4}\/BAK-TAR\/[A-Za-z0-9_-]+\/[IVXLCDM]+\/\d{4})/i);
    if (fallbackNomor && fallbackNomor[1]) {
      data.nomor = fallbackNomor[1].trim();
      data.dept = extractDeptFromNomor(data.nomor);
    }
  }

  // 2. Tanggal & Waktu
  // Example: "Pada hari ini Selasa Tanggal 20 Oktober Tahun 2026 jam 10:00 WIB"
  const dateMatch = text.match(
    /Pada\s+hari\s+ini\s+[A-Za-z]*\s*Tanggal\s+(\d{1,2})\s+([A-Za-z]+)\s+(?:Tahun\s+)?(\d{4})\s*(?:jam\s+([0-9.:]+))?(?:\s*WIB)?/i
  );
  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    const monthName = dateMatch[2].toLowerCase();
    const month = MONTH_NAME_MAP[monthName] || '01';
    const year = dateMatch[3];
    data.tanggal = `${year}-${month}-${day}`;

    if (dateMatch[4]) {
      const rawTime = dateMatch[4].replace('.', ':');
      data.waktu = rawTime.length === 4 && rawTime.indexOf(':') === 1 ? `0${rawTime}` : rawTime;
    }
  }

  // 3. Lokasi & Uraian Kejadian
  const lokasiUraianSection = text.match(
    /Lokasi\s+&\s+Uraian\s+Kejadian:?\s*([\s\S]*?)(?:Analisa\s+Masalah|Analisa\s+dan\s+Kronologi)/i
  );
  if (lokasiUraianSection && lokasiUraianSection[1]) {
    const sectionText = lokasiUraianSection[1];
    // Remove "Lokasi" and "Uraian Kejadian" headers if present
    const cleaned = sectionText
      .replace(/Lokasi\s+Uraian\s+Kejadian/gi, '')
      .replace(/^\s*Lokasi\s*/i, '')
      .trim();

    const lines = cleaned.split('\n').map((l) => l.trim()).filter(Boolean);
    if (lines.length >= 2) {
      data.lokasi = lines[0];
      data.deskripsi = lines.slice(1).join(' ');
    } else if (lines.length === 1) {
      const singleLine = lines[0];
      // Check if separated by multiple spaces or tab
      const parts = singleLine.split(/\s{2,}|\t/);
      if (parts.length >= 2) {
        data.lokasi = parts[0].trim();
        data.deskripsi = parts.slice(1).join(' ').trim();
      } else {
        // Fallback: check if first token is a location code (like STC-18O, Unit-12, etc.)
        const tokenMatch = singleLine.match(
          /^([A-Za-z0-9_-]+(?:\s+(?:Lt|Lantai|Tower|Ruang|Unit)\.?[A-Za-z0-9_-]*)?)\s+(.+)$/
        );
        if (tokenMatch) {
          data.lokasi = tokenMatch[1].trim();
          data.deskripsi = tokenMatch[2].trim();
        } else {
          data.lokasi = singleLine;
          data.deskripsi = singleLine;
        }
      }
    }
  }

  // Fallback for Lokasi and Deskripsi from filename if present
  // Pattern: "278 Tagihan Listrik Melonjak STC-18O.pdf"
  const fnMatch = fileName.match(
    /^(\d+)\s+(.+?)\s+([A-Za-z0-9_-]+)(?:\s*-\s*BA\s+ICE\s+BQ)?\.pdf$/i
  );
  if (fnMatch) {
    if (!data.lokasi || data.lokasi === data.deskripsi) {
      data.lokasi = fnMatch[3].trim();
    }
    if (!data.deskripsi || data.lokasi === data.deskripsi) {
      data.deskripsi = fnMatch[2].trim();
    }
  }

  // Fallback for Lokasi if still not found
  if (!data.lokasi) {
    const locMatch = text.match(/Lokasi\s*[:\t]\s*([^\n]+)/i);
    if (locMatch) data.lokasi = locMatch[1].trim();
  }
  if (!data.deskripsi) {
    const descMatch = text.match(/(?:Uraian Kejadian|Deskripsi Pekerjaan)\s*[:\t]\s*([^\n]+)/i);
    if (descMatch) data.deskripsi = descMatch[1].trim();
  }

  // 4. Analisa Masalah / Kronologis
  const analisaMatch = text.match(
    /(?:Analisa\s+Masalah(?:\s*\/|\s+dan)?\s*Kronologis?|Analisa Masalah):?\s*([\s\S]*?)(?:Lampiran\s+Foto|Tindakan\s+Pencegahan|Tindakan\s+Solusi)/i
  );
  if (analisaMatch && analisaMatch[1]) {
    data.analisa = analisaMatch[1].trim();
  }

  // 5. Tindakan Pencegahan / Solusi
  const solusiMatch = text.match(
    /(?:Tindakan\s+Pencegahan\s*(?:\/|&)\s*Solusi|Langkah-langkah\s+Pencegahan):?\s*([\s\S]*?)(?:Dilaporkan\s+oleh|Paraf:|Nama:)/i
  );
  if (solusiMatch && solusiMatch[1]) {
    // Clean any trailing automatic closing sentence
    const cleanSolusi = solusiMatch[1]
      .replace(/Demikian\s+Berita\s+Acara\s+ini\s+dibuat[\s\S]*?terima\s+kasih\.?/gi, '')
      .trim();
    data.solusi = cleanSolusi;
  }

  // 6. Penandatangan (Names & Roles)
  // BA has 4 names under "Nama:"
  const namaMatches = [...text.matchAll(/Nama:\s*([^\n\r]+)/gi)];
  if (namaMatches.length >= 4) {
    data.staffEngineering = namaMatches[0][1].trim();
    data.supervisor = namaMatches[1][1].trim();
    data.asstManager = namaMatches[2][1].trim();
    data.propertyManager = namaMatches[3][1].trim();
  } else if (namaMatches.length === 1) {
    // If all 4 names are on a single line separated by "Nama:"
    const rawLine = namaMatches[0][1];
    const subNames = rawLine.split(/\s*Nama:\s*/i).map((s) => s.trim()).filter(Boolean);
    if (subNames.length >= 4) {
      data.staffEngineering = subNames[0];
      data.supervisor = subNames[1];
      data.asstManager = subNames[2];
      data.propertyManager = subNames[3];
    } else {
      data.staffEngineering = rawLine.trim();
    }
  } else if (namaMatches.length > 0) {
    if (namaMatches[0]) data.staffEngineering = namaMatches[0][1].trim();
    if (namaMatches[1]) data.supervisor = namaMatches[1][1].trim();
    if (namaMatches[2]) data.asstManager = namaMatches[2][1].trim();
    if (namaMatches[3]) data.propertyManager = namaMatches[3][1].trim();
  }

  // Extract Roles if present
  const rolesMatch = text.match(
    /(?:Engineering Staff|Supervisor|Engineering Asst\. Manager|Property Manager)/i
  );
  if (rolesMatch) {
    // Standard roles default if matching
    data.jabatanStaff = 'Engineering Staff';
    data.jabatanSupervisor = 'Supervisor';
    data.jabatanAsstManager = 'Engineering Asst. Manager';
    data.jabatanPropertyManager = 'Property Manager';
  }

  return data;
}

/**
 * Heuristic parser for Bill of Quantity (BQ / ICE) document text
 */
function parseBqFromText(text: string, fileName: string): Partial<BQData> {
  const data: Partial<BQData> = {};

  // 1. Nomor BQ: First check text, then fallback to filename
  const bqNomorMatch = text.match(/(\d{1,4}\/ICE-BQ\/[A-Za-z0-9_-]+\/[IVXLCDM]+\/\d{4})/i);
  if (bqNomorMatch) {
    data.nomor = bqNomorMatch[1].trim();
  } else {
    // Fallback: Check filename e.g. "BQ_174_ICE-BQ_ENG_VII_2026.pdf"
    const fnBqMatch = fileName.match(
      /(?:BQ_)?(\d{1,4})[_-]ICE-BQ[_-]([A-Za-z0-9_-]+)[_-]([IVXLCDM]+)[_-](\d{4})/i
    );
    if (fnBqMatch) {
      data.nomor = `${fnBqMatch[1]}/ICE-BQ/${fnBqMatch[2]}/${fnBqMatch[3]}/${fnBqMatch[4]}`;
    }
  }

  // 2. Project
  const projectMatch = text.match(/Project\s*:\s*([^\n\r]+)/i);
  if (projectMatch && projectMatch[1]) {
    data.project = projectMatch[1].trim();
  }

  // 3. Kontraktor
  const kontraktorMatch = text.match(/Kontraktor\s*:\s*([^\n\r]+)/i);
  if (kontraktorMatch && kontraktorMatch[1]) {
    data.kontraktor = kontraktorMatch[1].trim();
  }

  // 4. Location
  const locationMatch = text.match(/Location\s*:\s*([^\n\r]+)/i);
  if (locationMatch && locationMatch[1]) {
    data.location = locationMatch[1].trim();
  }

  // 5. Items
  const items: BQItem[] = [];
  const lines = text.split('\n');
  let insideTable = false;

  for (const line of lines) {
    if (/NO\s+ITEM\s+QTY/i.test(line)) {
      insideTable = true;
      continue;
    }
    if (/Sub\s*Total/i.test(line) || /Grand\s*Total/i.test(line) || /Dibuat\s*Oleh/i.test(line)) {
      insideTable = false;
    }

    if (insideTable) {
      const parsedItem = parseBqItemLine(line, items.length);
      if (parsedItem) {
        items.push(parsedItem);
      }
    }
  }

  if (items.length > 0) {
    data.items = items;
  }

  // 6. Signatories
  // Look for signature block: "Dibuat Oleh", "Menyetujui", "Mengetahui"
  const sigSection = text.match(
    /Dibuat\s*Oleh[\s\S]*?(?:Tanggal\s*:|\n\n|$)/i
  );
  if (sigSection) {
    const rawLines = sigSection[0].split('\n').map((l) => l.trim()).filter(Boolean);
    // Find index of title line
    const headerIdx = rawLines.findIndex((l) => /Dibuat\s*Oleh/i.test(l));
    if (headerIdx !== -1 && rawLines[headerIdx + 1]) {
      const nameLine = rawLines[headerIdx + 1];
      const parts = nameLine.split(/\s{2,}|\t/).map((s) => s.replace(/_+/g, '').trim()).filter(Boolean);

      if (parts.length >= 3) {
        data.dibuatOleh = parts[0];
        data.menyetujui = parts[1];
        data.mengetahui = parts[2];
      } else {
        // Fallback: Check known default names or split words
        const words = nameLine.split(/\s+/).filter(Boolean);
        if (words.length >= 6) {
          // Typically 2 words each, or 3 for "Yafi Al Hadi"
          if (nameLine.includes('Yafi Al Hadi')) {
            data.dibuatOleh = 'Yafi Al Hadi';
            const remaining = nameLine.replace('Yafi Al Hadi', '').trim().split(/\s+/);
            if (remaining.length >= 4) {
              data.menyetujui = `${remaining[0]} ${remaining[1]}`;
              data.mengetahui = remaining.slice(2).join(' ');
            }
          } else {
            const chunk = Math.floor(words.length / 3);
            data.dibuatOleh = words.slice(0, chunk).join(' ');
            data.menyetujui = words.slice(chunk, chunk * 2).join(' ');
            data.mengetahui = words.slice(chunk * 2).join(' ');
          }
        }
      }
    }
  }

  return data;
}

/**
 * Parses a single item line from the BQ table
 */
function parseBqItemLine(line: string, index: number): BQItem | null {
  const trimmed = line.trim();
  if (!trimmed || /^(?:NO|ITEM|QTY|UNIT|MATERIAL|LABOR)/i.test(trimmed)) {
    return null;
  }

  // Regex to match item starting with item number
  // e.g.: "1 Pengadaan Unit Booster Pump 2 Unit Rp 18.500.000 Rp 1.500.000 Rp 37.000.000 Rp 3.000.000"
  // or tender page: "1 Pengadaan Unit Booster Pump 2 Unit"
  const match = trimmed.match(
    /^(\d+)\s+([\s\S]+?)\s+(\d+(?:[.,]\d+)?)\s+([A-Za-z]+)(?:\s+([\s\S]+))?$/
  );

  if (!match) return null;

  const itemNo = match[1];
  const description = match[2].trim();
  const qty = parseFloat(match[3].replace(',', '.')) || 1;
  const unit = match[4].trim();
  const pricePart = match[5] ? match[5].trim() : '';

  let materialPrice = 0;
  let laborPrice = 0;

  if (pricePart) {
    // Extract all numbers that look like rupiah currency amounts
    const amounts = [...pricePart.matchAll(/(?:Rp\s*)?([0-9]+(?:[.,][0-9]{3})*(?:[.,][0-9]+)?)/gi)]
      .map((m) => {
        const clean = m[1].replace(/\./g, '').replace(',', '.');
        return parseFloat(clean) || 0;
      })
      .filter((n) => n > 0);

    if (amounts.length >= 4) {
      // ICE row format: [unitMat, unitLab, totMat, totLab]
      materialPrice = amounts[0];
      laborPrice = amounts[1];
    } else if (amounts.length >= 2) {
      materialPrice = amounts[0];
      laborPrice = amounts[1];
    } else if (amounts.length === 1) {
      materialPrice = amounts[0];
    }
  }

  return {
    id: `item-${Date.now()}-${index}`,
    itemNo,
    description,
    qty,
    unit,
    materialPrice,
    laborPrice,
  };
}
