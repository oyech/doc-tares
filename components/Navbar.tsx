'use client';

import React, { useState, useRef, useEffect } from 'react';
import { DocumentType, PrintScope } from '@/lib/types';
import {
  FileText,
  Calculator,
  Printer,
  Eye,
  Edit3,
  ZoomIn,
  ZoomOut,
  Layers,
  ChevronDown,
  Check,
  Upload,
  Loader2,
} from 'lucide-react';

interface NavbarProps {
  documentType: DocumentType;
  onDocumentTypeChange: (type: DocumentType) => void;
  activeMobileTab: 'form' | 'preview';
  onMobileTabChange: (tab: 'form' | 'preview') => void;
  printScope: PrintScope;
  onPrintScopeChange: (scope: PrintScope) => void;
  onPrint: () => void;
  onUploadPdfClick: () => void;
  isLoadingPdf?: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  documentType,
  onDocumentTypeChange,
  activeMobileTab,
  onMobileTabChange,
  printScope,
  onPrintScopeChange,
  onPrint,
  onUploadPdfClick,
  isLoadingPdf = false,
  zoom,
  onZoomChange,
}) => {
  const [isPrintMenuOpen, setIsPrintMenuOpen] = useState(false);
  const printMenuRef = useRef<HTMLDivElement>(null);

  // Close print menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (printMenuRef.current && !printMenuRef.current.contains(e.target as Node)) {
        setIsPrintMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-2xs print:hidden">
      <div className="max-w-[1680px] mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#204f40] text-white font-black text-sm tracking-tighter shadow-xs">
              RE<span className="text-[#b8d9a3] font-bold">.</span>
            </span>
            <div className="leading-tight">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-gray-900 block">
                ReportEng <span className="font-normal text-xs text-gray-700 hidden sm:inline">Doc Maker</span>
              </span>
              <span className="text-[10px] text-gray-700 font-medium tracking-wide block">
                TAMAN ANGGREK RESIDENCES
              </span>
            </div>
          </div>

          <div className="h-6 w-[1px] bg-gray-200 hidden md:block"></div>

          {/* Document Type Switcher Pills */}
          <nav className="inline-flex rounded-lg bg-gray-100 p-1 border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => onDocumentTypeChange('berita-acara')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                documentType === 'berita-acara'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-700" />
              <span>Berita Acara</span>
            </button>
            <button
              type="button"
              onClick={() => onDocumentTypeChange('bq')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all ${
                documentType === 'bq'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bill of Quantity (BQ)</span>
            </button>
            <button
              type="button"
              onClick={() => onDocumentTypeChange('all')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold transition-all hidden md:inline-flex ${
                documentType === 'all'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Tampilkan Berita Acara, ICE, dan BQ sekaligus"
            >
              <Layers className="w-3.5 h-3.5 text-emerald-700" />
              <span>Semua (BA + BQ)</span>
            </button>
          </nav>
        </div>

        {/* Right side actions: Mobile Tab Switcher, Zoom Controls, Print/PDF button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Zoom controls (visible on desktop) */}
          <div className="hidden lg:flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5 text-xs text-gray-600">
            <button
              type="button"
              onClick={() => onZoomChange(Math.max(0.6, Math.round((zoom - 0.1) * 10) / 10))}
              className="p-1.5 hover:bg-white hover:text-gray-900 rounded transition-colors"
              title="Perkecil Preview"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px] font-semibold text-gray-700">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => onZoomChange(Math.min(1.4, Math.round((zoom + 0.1) * 10) / 10))}
              className="p-1.5 hover:bg-white hover:text-gray-900 rounded transition-colors"
              title="Perbesar Preview"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onZoomChange(1)}
              className="px-1.5 py-1 text-[10px] hover:bg-white hover:text-gray-900 rounded font-semibold text-gray-500"
              title="Reset Zoom ke 100%"
            >
              100%
            </button>
          </div>

          {/* Mobile Screen Tab Toggle (Form / Preview) */}
          <div className="flex lg:hidden rounded-lg bg-gray-100 p-0.5 border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => onMobileTabChange('form')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md font-semibold transition-all ${
                activeMobileTab === 'form'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Form</span>
            </button>
            <button
              type="button"
              onClick={() => onMobileTabChange('preview')}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md font-semibold transition-all ${
                activeMobileTab === 'preview'
                  ? 'bg-white text-emerald-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5 text-emerald-700" />
              <span>Preview</span>
            </button>
          </div>

          {/* Upload / Edit PDF Button */}
          <button
            type="button"
            onClick={onUploadPdfClick}
            disabled={isLoadingPdf}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-emerald-900 bg-white hover:bg-emerald-50 active:scale-95 border border-emerald-300 rounded-lg shadow-2xs transition-all disabled:opacity-50"
            title="Upload dokumen PDF yang sudah disimpan untuk diedit kembali"
          >
            {isLoadingPdf ? (
              <Loader2 className="w-4 h-4 text-emerald-700 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 text-emerald-700" />
            )}
            <span className="hidden sm:inline">Upload / Edit PDF</span>
            <span className="sm:hidden">Upload</span>
          </button>

          {/* Cetak / Download PDF Button Group */}
          <div ref={printMenuRef} className="relative inline-flex items-center rounded-lg shadow-xs">
            {/* Primary Print Button: Immediately triggers print */}
            <button
              type="button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#204f40] hover:bg-[#163f36] rounded-l-lg transition-all"
              title="Cetak atau Simpan PDF Semua Dokumen (BA + ICE + BQ)"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / PDF</span>
              <span className="hidden sm:inline-block bg-[#163f36] text-[#b8d9a3] text-[10px] px-1.5 py-0.5 rounded font-mono ml-1 font-bold">
                {printScope === 'all'
                  ? 'BA+ICE+BQ (3 Hal)'
                  : printScope === 'ba-only'
                  ? 'BA (1 Hal)'
                  : 'BQ (2 Hal)'}
              </span>
            </button>

            {/* Dropdown Toggle */}
            <button
              type="button"
              onClick={() => setIsPrintMenuOpen(!isPrintMenuOpen)}
              className="px-2 py-2 text-white bg-[#204f40] hover:bg-[#163f36] border-l border-emerald-800 rounded-r-lg transition-all"
              title="Pilihan Dokumen Cetak"
            >
              <ChevronDown className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {isPrintMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-xl py-1 z-50 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  Target Cetak / Download PDF
                </div>

                {/* Option 1: All Documents (Default) */}
                <button
                  type="button"
                  onClick={() => {
                    onPrintScopeChange('all');
                    setIsPrintMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-emerald-50 transition-colors"
                >
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span>Semua Dokumen Sekaligus</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                        Auto
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      3 Halaman: BA + ICE + BQ
                    </div>
                  </div>
                  {printScope === 'all' && <Check className="w-4 h-4 text-emerald-700" />}
                </button>

                {/* Option 2: Only Berita Acara */}
                <button
                  type="button"
                  onClick={() => {
                    onPrintScopeChange('ba-only');
                    setIsPrintMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-emerald-50 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-gray-900">Hanya Berita Acara</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">1 Halaman Dokumen BA</div>
                  </div>
                  {printScope === 'ba-only' && <Check className="w-4 h-4 text-emerald-700" />}
                </button>

                {/* Option 3: Only BQ */}
                <button
                  type="button"
                  onClick={() => {
                    onPrintScopeChange('bq-only');
                    setIsPrintMenuOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left flex items-center justify-between hover:bg-emerald-50 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-gray-900">Hanya BQ (ICE &amp; Tender)</div>
                    <div className="text-[11px] text-gray-500 mt-0.5">2 Halaman: ICE &amp; BQ Blank</div>
                  </div>
                  {printScope === 'bq-only' && <Check className="w-4 h-4 text-emerald-700" />}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
