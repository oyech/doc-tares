'use client';

import React, { useState, useEffect } from 'react';
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
import { Navbar } from '@/components/Navbar';
import { BeritaAcaraForm } from '@/components/BeritaAcaraForm';
import { BeritaAcaraDoc } from '@/components/BeritaAcaraDoc';
import { BQForm } from '@/components/BQForm';
import { BQDoc } from '@/components/BQDoc';
import { DocumentPreviewWrapper } from '@/components/DocumentPreviewWrapper';
import { Eye, Edit3, Printer, FileText, Calculator } from 'lucide-react';

export default function HomePage() {
  const [documentType, setDocumentType] = useState<DocumentType>('berita-acara');
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form');
  const [zoom, setZoom] = useState<number>(1);
  const [bqViewMode, setBqViewMode] = useState<BQViewMode>('all');
  const [allModeActiveForm, setAllModeActiveForm] = useState<'ba' | 'bq'>('ba');
  // Default print scope is 'all' (automatically prints BA, ICE, and BQ all together!)
  const [printScope, setPrintScope] = useState<PrintScope>('all');

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
        nomor: generateBeritaAcaraNumber('001', today, 'ENG'),
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
        zoom={zoom}
        onZoomChange={setZoom}
      />

      {/* Main Work Area */}
      <main className="flex-1 max-w-[1680px] w-full mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-5">
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
                />
              ) : (
                <BQForm
                  data={bqData}
                  onChange={setBqData}
                  onReset={handleResetBQ}
                  onLoadSample={handleLoadSampleBQ}
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
