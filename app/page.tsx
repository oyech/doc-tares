'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  DocumentType,
  BeritaAcaraData,
  BQData,
  BQViewMode,
  PrintScope,
} from '@/lib/types';
import { DEFAULT_BERITA_ACARA, DEFAULT_BQ } from '@/lib/constants';
import {
  generateBeritaAcaraFilename,
  generateBqFilename,
  generateBeritaAcaraNumber,
} from '@/lib/utils';
import { extractTextFromPdf, parsePdfTextToData } from '@/lib/pdfParser';
import { Navbar } from '@/components/Navbar';
import { BeritaAcaraForm } from '@/components/BeritaAcaraForm';
import { BeritaAcaraDoc } from '@/components/BeritaAcaraDoc';
import { BQForm } from '@/components/BQForm';
import { BQDoc } from '@/components/BQDoc';
import { DocumentPreviewWrapper } from '@/components/DocumentPreviewWrapper';
import {
  Eye,
  Edit3,
  Printer,
  FileText,
  Calculator,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  UploadCloud,
} from 'lucide-react';

export default function HomePage() {
  const [documentType, setDocumentType] = useState<DocumentType>('berita-acara');
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form');
  const [zoom, setZoom] = useState<number>(1);
  const [bqViewMode, setBqViewMode] = useState<BQViewMode>('all');
  const [allModeActiveForm, setAllModeActiveForm] = useState<'ba' | 'bq'>('ba');
  // Default print scope is 'all' (automatically prints BA, ICE, and BQ all together!)
  const [printScope, setPrintScope] = useState<PrintScope>('all');

  // PDF Import states
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [pdfNotification, setPdfNotification] = useState<{
    type: 'success' | 'warning' | 'error';
    title: string;
    message: string;
    fileName?: string;
  } | null>(null);

  // Form states with lazy initialization from localStorage
  const [beritaData, setBeritaData] = useState<BeritaAcaraData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBA = localStorage.getItem('reporteng_ba_data');
        if (savedBA) return JSON.parse(savedBA);
      } catch {}
    }
    return DEFAULT_BERITA_ACARA;
  });

  const [bqData, setBqData] = useState<BQData>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedBQ = localStorage.getItem('reporteng_bq_data');
        if (savedBQ) return JSON.parse(savedBQ);
      } catch {}
    }
    return DEFAULT_BQ;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('reporteng_doc_type', documentType);
    } catch {}
  }, [documentType]);

  useEffect(() => {
    try {
      localStorage.setItem('reporteng_ba_data', JSON.stringify(beritaData));
    } catch {}
  }, [beritaData]);

  useEffect(() => {
    try {
      localStorage.setItem('reporteng_bq_data', JSON.stringify(bqData));
    } catch {}
  }, [bqData]);

  // Handlers for Berita Acara
  const handleResetBerita = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan formulir Berita Acara?')) {
      const today = new Date().toISOString().split('T')[0];
      const blankBA: BeritaAcaraData = {
        nomor: generateBeritaAcaraNumber('1', today, 'ENG'),
        dept: 'ENG',
        tanggal: today,
        waktu: '10:00',
        lokasi: '',
        deskripsi: '',
        analisa: '',
        solusi: '',
        staffEngineering: '',
        jabatanStaff: 'Engineering Staff',
        supervisor: '',
        jabatanSupervisor: 'Supervisor',
        asstManager: '',
        jabatanAsstManager: 'Engineering Asst. Manager',
        propertyManager: '',
        jabatanPropertyManager: 'Property Manager',
        photos: [],
      };
      setBeritaData(blankBA);
    }
  };

  const handleLoadSampleBerita = () => {
    setBeritaData(DEFAULT_BERITA_ACARA);
  };

  // Handlers for BQ
  const handleResetBQ = () => {
    if (confirm('Apakah Anda yakin ingin mengosongkan formulir Bill of Quantity?')) {
      const blankBQ: BQData = {
        nomor: '',
        project: '',
        kontraktor: '',
        location: '',
        dibuatOleh: '',
        jabatanDibuatOleh: 'Engineering Ast. Manager',
        menyetujui: '',
        jabatanMenyetujui: 'Property Manager',
        mengetahui: '',
        jabatanMengetahui: 'GM Building Management',
        items: [
          {
            id: `item-${Date.now()}`,
            itemNo: '1',
            description: '',
            qty: 1,
            unit: 'Unit',
            materialPrice: 0,
            laborPrice: 0,
          },
        ],
      };
      setBqData(blankBQ);
    }
  };

  const handleLoadSampleBQ = () => {
    setBqData(DEFAULT_BQ);
  };

  // PDF Upload Handlers
  const handleTriggerPdfUpload = () => {
    pdfInputRef.current?.click();
  };

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processPdfFile(file);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const processPdfFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setPdfNotification({
        type: 'error',
        title: 'Bukan File PDF',
        message: 'Mohon pilih atau unggah file berformat PDF (.pdf) hasil simpan dokumen.',
        fileName: file.name,
      });
      return;
    }

    setIsLoadingPdf(true);
    setPdfNotification(null);

    try {
      const pagesText = await extractTextFromPdf(file);
      const parsed = parsePdfTextToData(pagesText, file.name);

      let loadedCount = 0;
      let summaryText = '';

      if (parsed.beritaData && Object.keys(parsed.beritaData).length > 0) {
        setBeritaData((prev) => ({
          ...prev,
          ...parsed.beritaData,
        }));
        loadedCount++;
      }

      if (parsed.bqData && Object.keys(parsed.bqData).length > 0) {
        setBqData((prev) => ({
          ...prev,
          ...parsed.bqData,
        }));
        loadedCount++;
      }

      if (parsed.detectedType === 'both') {
        setDocumentType('all');
        summaryText = 'Dokumen Berita Acara (BA) dan Bill of Quantity (BQ) berhasil dimuat.';
      } else if (parsed.detectedType === 'bq') {
        setDocumentType('bq');
        summaryText = `Dokumen Bill of Quantity ${parsed.bqData?.project ? `"${parsed.bqData.project}"` : ''} berhasil dimuat.`;
      } else {
        setDocumentType('berita-acara');
        summaryText = `Dokumen Berita Acara ${parsed.beritaData?.nomor ? `(${parsed.beritaData.nomor})` : ''} berhasil dimuat.`;
      }

      if (loadedCount > 0) {
        setPdfNotification({
          type: 'success',
          title: 'PDF Berhasil Dimuat!',
          message: `${summaryText} Seluruh data telah diisikan ke formulir dan siap diedit kembali.`,
          fileName: file.name,
        });
      } else {
        setPdfNotification({
          type: 'warning',
          title: 'Format Dokumen Tidak Lengkap',
          message:
            'Teks PDF berhasil dibaca namun field standar ReportEng tidak terdeteksi lengkap. Pastikan file PDF merupakan dokumen hasil cetak/simpan ReportEng.',
          fileName: file.name,
        });
      }
    } catch (err: unknown) {
      console.error('Error parsing PDF:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses file PDF.';
      setPdfNotification({
        type: 'error',
        title: 'Gagal Membaca PDF',
        message: `${errorMessage} Pastikan file tidak terkunci password atau rusak.`,
        fileName: file.name,
      });
    } finally {
      setIsLoadingPdf(false);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingFile) setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      await processPdfFile(droppedFile);
    }
  };

  // Print Handler
  const handlePrint = () => {
    const originalTitle = document.title;
    let filename = '';

    if (printScope === 'all') {
      const base = generateBeritaAcaraFilename(beritaData).replace(/\.pdf$/i, '');
      filename = `${base} - BA ICE BQ.pdf`;
    } else if (printScope === 'ba-only') {
      filename = generateBeritaAcaraFilename(beritaData);
    } else {
      filename = generateBqFilename(bqData);
    }

    document.title = filename.replace(/\.pdf$/i, '');
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f7f8]">
      {/* Top Navbar */}
      <Navbar
        documentType={documentType}
        onDocumentTypeChange={setDocumentType}
        activeMobileTab={activeMobileTab}
        onMobileTabChange={setActiveMobileTab}
        printScope={printScope}
        onPrintScopeChange={setPrintScope}
        onPrint={handlePrint}
        onUploadPdfClick={handleTriggerPdfUpload}
        isLoadingPdf={isLoadingPdf}
        zoom={zoom}
        onZoomChange={setZoom}
      />

      {/* Hidden File Input for PDF Upload */}
      <input
        ref={pdfInputRef}
        type="file"
        accept="application/pdf,.pdf"
        onChange={handlePdfFileChange}
        className="hidden"
      />

      {/* Main Work Area with Drag & Drop */}
      <main
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative flex-1 max-w-[1680px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-5"
      >
        {/* Drag & Drop Visual Overlay */}
        {isDraggingFile && (
          <div className="absolute inset-0 z-50 bg-emerald-900/80 backdrop-blur-xs rounded-2xl flex flex-col items-center justify-center text-white border-4 border-dashed border-emerald-300 p-6 pointer-events-none transition-all animate-in fade-in duration-150">
            <UploadCloud className="w-16 h-16 text-[#b8d9a3] animate-bounce mb-3" />
            <h3 className="text-xl font-bold">Lepaskan File PDF di Sini</h3>
            <p className="text-sm text-emerald-100 mt-1">
              Dokumen akan otomatis diekstrak dan diisikan ke formulir editor ReportEng
            </p>
          </div>
        )}

        {/* PDF Import Notification Banner */}
        {pdfNotification && (
          <div
            className={`mb-4 p-3.5 rounded-xl border flex items-start justify-between gap-3 shadow-xs transition-all ${
              pdfNotification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                : pdfNotification.type === 'warning'
                ? 'bg-amber-50 border-amber-200 text-amber-950'
                : 'bg-red-50 border-red-200 text-red-950'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {pdfNotification.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertCircle
                  className={`w-5 h-5 mt-0.5 shrink-0 ${
                    pdfNotification.type === 'warning' ? 'text-amber-600' : 'text-red-600'
                  }`}
                />
              )}
              <div className="text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-sm">{pdfNotification.title}</span>
                  {pdfNotification.fileName && (
                    <span className="font-mono text-[11px] bg-white/80 px-2 py-0.5 rounded border border-gray-200 font-medium">
                      {pdfNotification.fileName}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 leading-relaxed text-gray-700">
                  {pdfNotification.message}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setPdfNotification(null)}
              className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-white/60 transition-colors"
              title="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Loading Indicator for PDF parsing */}
        {isLoadingPdf && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900 font-semibold shadow-2xs">
            <Loader2 className="w-4 h-4 text-emerald-700 animate-spin" />
            <span>Sedang membaca dan menganalisis teks dokumen PDF... Mohon tunggu sebentar.</span>
          </div>
        )}
        {/* ========================================================
            SCREEN-ONLY VIEW: Split Screen Grid on Desktop, Tabbed on Mobile
            Completely hidden during print so it doesn't cause page spills
            ======================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start print:hidden">
          {/* LEFT: Form Editor */}
          <div
            className={`lg:col-span-5 xl:col-span-5 space-y-4 ${
              activeMobileTab === 'preview' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* If 'all' mode is active, provide quick tabs to switch editor form */}
            {documentType === 'all' && (
              <div className="flex rounded-xl bg-white p-1 border border-gray-200 shadow-2xs mb-2">
                <button
                  type="button"
                  onClick={() => setAllModeActiveForm('ba')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    allModeActiveForm === 'ba'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Form Berita Acara</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAllModeActiveForm('bq')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    allModeActiveForm === 'bq'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Form Bill of Quantity</span>
                </button>
              </div>
            )}

            <div className="bg-white/40 backdrop-blur-xs p-1 rounded-xl">
              {documentType === 'berita-acara' ||
              (documentType === 'all' && allModeActiveForm === 'ba') ? (
                <BeritaAcaraForm
                  data={beritaData}
                  onChange={setBeritaData}
                  onReset={handleResetBerita}
                  onLoadSample={handleLoadSampleBerita}
                  onUploadPdf={handleTriggerPdfUpload}
                />
              ) : (
                <BQForm
                  data={bqData}
                  onChange={setBqData}
                  onReset={handleResetBQ}
                  onLoadSample={handleLoadSampleBQ}
                  onUploadPdf={handleTriggerPdfUpload}
                  viewMode={bqViewMode}
                  onViewModeChange={setBqViewMode}
                />
              )}
            </div>
          </div>

          {/* RIGHT: Document Live Preview (Screen View) */}
          <div
            className={`lg:col-span-7 xl:col-span-7 ${
              activeMobileTab === 'form' ? 'hidden lg:block' : 'block'
            }`}
          >
            {/* Header info bar for preview pane on desktop */}
            <div className="hidden lg:flex items-center justify-between px-3 py-2 bg-emerald-900/5 rounded-xl border border-emerald-900/10 mb-3 text-xs text-emerald-950 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>
                  Live Preview A4{' '}
                  {documentType === 'all'
                    ? '(3 Halaman: BA, ICE, BQ)'
                    : documentType === 'berita-acara'
                    ? '(Berita Acara)'
                    : '(Bill of Quantity)'}
                </span>
              </div>
              <div className="text-gray-600 font-mono text-[11px]">
                {documentType === 'all'
                  ? `${generateBeritaAcaraFilename(beritaData).replace(/\.pdf$/i, '')} - BA ICE BQ.pdf`
                  : documentType === 'berita-acara'
                  ? generateBeritaAcaraFilename(beritaData)
                  : generateBqFilename(bqData)}
              </div>
            </div>

            {/* Document sheet wrapper */}
            <div className="bg-gray-200/50 rounded-2xl p-2 sm:p-4 border border-gray-200 min-h-[calc(100vh-160px)] flex justify-center items-start overflow-hidden">
              <DocumentPreviewWrapper zoom={zoom}>
                {documentType === 'berita-acara' && (
                  <BeritaAcaraDoc data={beritaData} />
                )}
                {documentType === 'bq' && (
                  <BQDoc data={bqData} viewMode={bqViewMode} />
                )}
                {documentType === 'all' && (
                  <div className="space-y-6">
                    <div>
                      <div className="text-center font-bold text-xs text-gray-500 mb-2 uppercase tracking-wider">
                        Halaman 1 — Berita Acara
                      </div>
                      <BeritaAcaraDoc data={beritaData} />
                    </div>
                    <div>
                      <div className="text-center font-bold text-xs text-gray-500 mb-2 uppercase tracking-wider">
                        Halaman 2 — Internal Cost Estimation (ICE)
                      </div>
                      <BQDoc data={bqData} viewMode="ice" />
                    </div>
                    <div>
                      <div className="text-center font-bold text-xs text-gray-500 mb-2 uppercase tracking-wider">
                        Halaman 3 — Bill of Quantity (BQ)
                      </div>
                      <BQDoc data={bqData} viewMode="bq" />
                    </div>
                  </div>
                )}
              </DocumentPreviewWrapper>
            </div>
          </div>
        </div>

        {/* ========================================================
            PRINT-ONLY BUNDLE: Dedicated pagination container
            Automatically prints BA, ICE, and BQ with ZERO blank pages
            ======================================================== */}
        <div className="hidden print:block print-bundle-root">
          {printScope === 'all' && (
            <>
              {/* Halaman 1: Berita Acara */}
              <div className="print-page">
                <BeritaAcaraDoc data={beritaData} />
              </div>
              {/* Halaman 2: Internal Cost Estimation */}
              <div className="print-page">
                <BQDoc data={bqData} viewMode="ice" />
              </div>
              {/* Halaman 3: Bill of Quantity */}
              <div className="print-page">
                <BQDoc data={bqData} viewMode="bq" />
              </div>
            </>
          )}

          {printScope === 'ba-only' && (
            <div className="print-page">
              <BeritaAcaraDoc data={beritaData} />
            </div>
          )}

          {printScope === 'bq-only' && (
            <>
              <div className="print-page">
                <BQDoc data={bqData} viewMode="ice" />
              </div>
              <div className="print-page">
                <BQDoc data={bqData} viewMode="bq" />
              </div>
            </>
          )}
        </div>
      </main>

      {/* Floating Action Button for Mobile: Quick Toggle between Form & Preview */}
      <div className="lg:hidden fixed bottom-5 right-5 z-50 print:hidden flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={handleTriggerPdfUpload}
          disabled={isLoadingPdf}
          className="p-3 bg-white text-gray-800 rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all disabled:opacity-50"
          title="Upload / Edit dari file PDF yang sudah pernah disimpan"
        >
          {isLoadingPdf ? (
            <Loader2 className="w-5 h-5 text-emerald-800 animate-spin" />
          ) : (
            <UploadCloud className="w-5 h-5 text-emerald-800" />
          )}
        </button>

        <button
          type="button"
          onClick={handlePrint}
          className="p-3 bg-white text-gray-800 rounded-full shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:scale-95 transition-all"
          title="Cetak Semua Dokumen (BA + ICE + BQ)"
        >
          <Printer className="w-5 h-5 text-emerald-800" />
        </button>

        <button
          type="button"
          onClick={() =>
            setActiveMobileTab(activeMobileTab === 'form' ? 'preview' : 'form')
          }
          className="flex items-center gap-2 px-4 py-3 bg-[#204f40] text-white rounded-full shadow-xl hover:bg-[#163f36] active:scale-95 transition-all font-semibold text-xs tracking-wide"
        >
          {activeMobileTab === 'form' ? (
            <>
              <Eye className="w-4 h-4 text-[#b8d9a3]" />
              <span>Lihat Preview</span>
            </>
          ) : (
            <>
              <Edit3 className="w-4 h-4 text-[#b8d9a3]" />
              <span>Edit Form</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
