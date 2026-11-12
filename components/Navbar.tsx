'use client';

import React from 'react';
import { DocumentType } from '@/lib/types';
import { FileText, Calculator, Printer, Eye, Edit3, ZoomIn, ZoomOut } from 'lucide-react';

interface NavbarProps {
  documentType: DocumentType;
  onDocumentTypeChange: (type: DocumentType) => void;
  activeMobileTab: 'form' | 'preview';
  onMobileTabChange: (tab: 'form' | 'preview') => void;
  onPrint: () => void;
  zoom: number;
  onZoomChange: (zoom: number) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  documentType,
  onDocumentTypeChange,
  activeMobileTab,
  onMobileTabChange,
  onPrint,
  zoom,
  onZoomChange,
}) => {
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

          {/* Cetak / Download PDF Button */}
          <button
            type="button"
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#204f40] hover:bg-[#163f36] rounded-lg shadow-xs hover:shadow transition-all"
            title="Cetak atau Simpan PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak / PDF</span>
          </button>
        </div>
      </div>
    </header>
  );
};
