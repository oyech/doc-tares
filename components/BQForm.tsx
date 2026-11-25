'use client';

import React from 'react';
import { BQData, BQItem, BQViewMode } from '@/lib/types';
import { calculateBQTotals, formatNumberId } from '@/lib/utils';
import { Sparkles, RotateCcw, Plus, Trash2, Eye, Upload } from 'lucide-react';

interface BQFormProps {
  data: BQData;
  onChange: (updated: BQData) => void;
  onReset: () => void;
  onLoadSample: () => void;
  onUploadPdf?: () => void;
  viewMode: BQViewMode;
  onViewModeChange: (mode: BQViewMode) => void;
}

export const BQForm: React.FC<BQFormProps> = ({
  data,
  onChange,
  onReset,
  onLoadSample,
  onUploadPdf,
  viewMode,
  onViewModeChange,
}) => {
  const { totalMaterial, totalLabor, subtotal, ppn, grandTotal } = calculateBQTotals(data.items);

  const handleFieldChange = (field: keyof BQData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  const handleItemChange = <K extends keyof BQItem>(
    index: number,
    field: K,
    value: BQItem[K]
  ) => {
    const updatedItems = [...data.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: value,
    };
    onChange({
      ...data,
      items: updatedItems,
    });
  };

  const handleAddItem = () => {
    const nextNumber = String(data.items.length + 1);
    const newItem: BQItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      itemNo: nextNumber,
      description: '',
      qty: 1,
      unit: 'Unit',
      materialPrice: 0,
      laborPrice: 0,
    };
    onChange({
      ...data,
      items: [...data.items, newItem],
    });
  };

  const handleRemoveItem = (index: number) => {
    if (data.items.length <= 1) {
      alert('Minimal harus ada 1 item pekerjaan.');
      return;
    }
    const updatedItems = data.items.filter((_, idx) => idx !== index);
    onChange({
      ...data,
      items: updatedItems,
    });
  };

  return (
    <div className="space-y-5 text-slate-800">
      {/* Quick Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#14532D] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
            Bill of Quantity
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline font-medium">
            Estimasi Biaya &amp; Tender Pekerjaan
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onUploadPdf && (
            <button
              type="button"
              onClick={onUploadPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-300 shadow-2xs"
              title="Upload file PDF BQ / ICE untuk diedit kembali"
            >
              <Upload className="w-3.5 h-3.5 text-slate-600" />
              <span>Edit dari PDF</span>
            </button>
          )}
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors border border-slate-300 shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Contoh Data
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50/60 rounded-lg transition-colors border border-transparent hover:border-red-200"
            title="Bersihkan Form"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* View Mode Toggle for BQ: Both Pages / ICE / BQ */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <Eye className="w-4 h-4 text-[#15803D]" />
          <span>Tampilan Preview Dokumen:</span>
        </div>
        <div className="inline-flex rounded-lg bg-slate-200/70 p-1 border border-slate-300/60 text-xs">
          <button
            type="button"
            onClick={() => onViewModeChange('all')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              viewMode === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Semua (2 Hal)
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('ice')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              viewMode === 'ice'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hal 1: ICE (Harga)
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('bq')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
              viewMode === 'bq'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hal 2: BQ (Blank)
          </button>
        </div>
      </div>

      {/* 1. Informasi Project */}
      <section className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
          Informasi Project &amp; Kontrak
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="bqNomor" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nomor BQ <span className="text-red-500">*</span>
            </label>
            <input
              id="bqNomor"
              type="text"
              value={data.nomor}
              onChange={(e) => handleFieldChange('nomor', e.target.value)}
              placeholder="Contoh: 174/ICE-BQ/ENG/VII/2026"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-mono font-medium"
            />
          </div>

          <div>
            <label htmlFor="kontraktor" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kontraktor
            </label>
            <input
              id="kontraktor"
              type="text"
              value={data.kontraktor}
              onChange={(e) => handleFieldChange('kontraktor', e.target.value)}
              placeholder="Nama kontraktor / pelaksana (atau -)"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="project" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Nama Project / Pekerjaan <span className="text-red-500">*</span>
            </label>
            <input
              id="project"
              type="text"
              value={data.project}
              onChange={(e) => handleFieldChange('project', e.target.value)}
              placeholder="Contoh: PENGGANTIAN POMPA BOOSTER TOWER A"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all uppercase font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="location" className="block text-xs font-semibold text-slate-700 mb-1.5">
              Location / Lokasi <span className="text-red-500">*</span>
            </label>
            <input
              id="location"
              type="text"
              value={data.location}
              onChange={(e) => handleFieldChange('location', e.target.value)}
              placeholder="Contoh: Ruang Pompa Gedung Utama Taman Anggrek Residences"
              className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
            />
          </div>
        </div>
      </section>

      {/* 2. Daftar Item Pekerjaan */}
      <section className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
            Item Pekerjaan ({data.items.length})
          </h3>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#14532D] hover:bg-[#0f3d21] rounded-lg shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Item
          </button>
        </div>

        {/* Item Rows */}
        <div className="space-y-3.5">
          {data.items.map((item, index) => {
            const itemTotal = item.qty * ((item.materialPrice || 0) + (item.laborPrice || 0));

            return (
              <div
                key={item.id || index}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-slate-300 transition-all space-y-3.5 relative group shadow-2xs"
              >
                {/* Header row with item number and delete button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-[#14532D] bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/80">
                      Item #{item.itemNo || index + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-700">
                      Subtotal: Rp {formatNumberId(itemTotal)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-slate-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50/60 transition-colors"
                    title="Hapus baris item ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Input Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  {/* No */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      No
                    </label>
                    <input
                      type="text"
                      value={item.itemNo}
                      onChange={(e) => handleItemChange(index, 'itemNo', e.target.value)}
                      placeholder="1"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-mono"
                    />
                  </div>

                  {/* Deskripsi */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Deskripsi Item Pekerjaan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Deskripsi item pekerjaan"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                    />
                  </div>

                  {/* Qty */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Qty
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={item.qty}
                      onChange={(e) =>
                        handleItemChange(index, 'qty', parseFloat(e.target.value) || 0)
                      }
                      placeholder="1"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-mono"
                    />
                  </div>

                  {/* Unit */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      placeholder="Ls / Pcs / Unit"
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600"
                    />
                  </div>

                  {/* Harga Material */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Harga Satuan Material (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.materialPrice || ''}
                        onChange={(e) =>
                          handleItemChange(index, 'materialPrice', parseFloat(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-mono"
                      />
                    </div>
                  </div>

                  {/* Harga Labor */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Harga Satuan Labor / Upah (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-xs text-slate-400">Rp</span>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.laborPrice || ''}
                        onChange={(e) =>
                          handleItemChange(index, 'laborPrice', parseFloat(e.target.value) || 0)
                        }
                        placeholder="0"
                        className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Add item button */}
        <button
          type="button"
          onClick={handleAddItem}
          className="w-full py-2.5 border-2 border-dashed border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:text-[#15803D] hover:border-emerald-500 hover:bg-emerald-50/20 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          + Tambah Item Pekerjaan Lainnya
        </button>

        {/* Calculation Summary Card */}
        <div className="mt-5 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs text-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-600">Total Material:</span>
            <span className="font-semibold font-mono text-slate-900">Rp {formatNumberId(totalMaterial)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Total Labor (Upah Kerja):</span>
            <span className="font-semibold font-mono text-slate-900">Rp {formatNumberId(totalLabor)}</span>
          </div>
          <div className="h-[1px] bg-slate-200 my-1"></div>
          <div className="flex justify-between font-semibold text-slate-900">
            <span>Sub Total:</span>
            <span className="font-mono">Rp {formatNumberId(subtotal)}</span>
          </div>
          <div className="flex justify-between text-slate-600">
            <span>PPN (11%):</span>
            <span className="font-semibold font-mono text-slate-900">Rp {formatNumberId(ppn)}</span>
          </div>
          <div className="h-[1.5px] bg-[#15803D] my-1"></div>
          <div className="flex justify-between text-sm font-extrabold text-[#14532D] pt-1">
            <span>Grand Total:</span>
            <span className="font-mono text-base">Rp {formatNumberId(grandTotal)}</span>
          </div>
        </div>
      </section>

      {/* 3. Approval / Tanda Tangan */}
      <section className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-5">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <span className="w-2 h-2 rounded-full bg-[#15803D]"></span>
          Penandatangan / Approval
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. Dibuat Oleh */}
          <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
            <div>
              <label htmlFor="dibuatOleh" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Dibuat Oleh (Nama) <span className="text-red-500">*</span>
              </label>
              <input
                id="dibuatOleh"
                type="text"
                value={data.dibuatOleh}
                onChange={(e) => handleFieldChange('dibuatOleh', e.target.value)}
                placeholder="Nama Pembuat"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium"
              />
            </div>
            <div>
              <label htmlFor="jabatanDibuatOleh" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Jabatan di Bawah Nama
              </label>
              <input
                id="jabatanDibuatOleh"
                type="text"
                value={data.jabatanDibuatOleh ?? 'Engineering Ast. Manager'}
                onChange={(e) => handleFieldChange('jabatanDibuatOleh', e.target.value)}
                placeholder="Contoh: Engineering Ast. Manager"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          {/* 2. Menyetujui */}
          <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
            <div>
              <label htmlFor="menyetujui" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Menyetujui (Nama) <span className="text-red-500">*</span>
              </label>
              <input
                id="menyetujui"
                type="text"
                value={data.menyetujui}
                onChange={(e) => handleFieldChange('menyetujui', e.target.value)}
                placeholder="Nama Penyetuju"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium"
              />
            </div>
            <div>
              <label htmlFor="jabatanMenyetujui" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Jabatan di Bawah Nama
              </label>
              <input
                id="jabatanMenyetujui"
                type="text"
                value={data.jabatanMenyetujui ?? 'Property Manager'}
                onChange={(e) => handleFieldChange('jabatanMenyetujui', e.target.value)}
                placeholder="Contoh: Property Manager"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          {/* 3. Mengetahui */}
          <div className="space-y-3 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
            <div>
              <label htmlFor="mengetahui" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mengetahui (Nama) <span className="text-red-500">*</span>
              </label>
              <input
                id="mengetahui"
                type="text"
                value={data.mengetahui}
                onChange={(e) => handleFieldChange('mengetahui', e.target.value)}
                placeholder="Nama yang Mengetahui"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all font-medium"
              />
            </div>
            <div>
              <label htmlFor="jabatanMengetahui" className="block text-[11px] font-semibold text-slate-600 mb-1">
                Jabatan di Bawah Nama
              </label>
              <input
                id="jabatanMengetahui"
                type="text"
                value={data.jabatanMengetahui ?? 'GM Building Management'}
                onChange={(e) => handleFieldChange('jabatanMengetahui', e.target.value)}
                placeholder="Contoh: GM Building Management"
                className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-all"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
