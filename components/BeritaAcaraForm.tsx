'use client';

import React, { useRef, useState } from 'react';
import { BeritaAcaraData } from '@/lib/types';
import {
  generateBeritaAcaraNumber,
  extractDeptFromNomor,
  extractNomorUrut,
} from '@/lib/utils';
import { DEFAULT_DEPARTMENTS, DEPARTMENT_LABELS } from '@/lib/constants';
import { Sparkles, RotateCcw, ImagePlus, X, Plus, Check } from 'lucide-react';

interface BeritaAcaraFormProps {
  data: BeritaAcaraData;
  onChange: (updated: BeritaAcaraData) => void;
  onReset: () => void;
  onLoadSample: () => void;
}

export const BeritaAcaraForm: React.FC<BeritaAcaraFormProps> = ({
  data,
  onChange,
  onReset,
  onLoadSample,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Departments list state with lazy initialization from localStorage
  const [departments, setDepartments] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('reporteng_depts');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return Array.from(new Set([...DEFAULT_DEPARTMENTS, ...parsed]));
          }
        }
      } catch {}
    }
    return DEFAULT_DEPARTMENTS;
  });

  const [isAddingDept, setIsAddingDept] = useState(false);
  const [newDeptInput, setNewDeptInput] = useState('');
  const [isManualNomor, setIsManualNomor] = useState(false);

  // Current active department
  const currentDept = data.dept || extractDeptFromNomor(data.nomor) || 'ENG';
  const currentNomorUrut = extractNomorUrut(data.nomor) || '001';

  const handleChange = (field: keyof BeritaAcaraData, value: string) => {
    onChange({
      ...data,
      [field]: value,
    });
  };

  // When Department selection changes
  const handleDeptSelect = (deptValue: string) => {
    if (deptValue === '__ADD_NEW__') {
      setIsAddingDept(true);
      return;
    }

    const updatedNomor = generateBeritaAcaraNumber(data.nomor || '001', data.tanggal, deptValue);
    onChange({
      ...data,
      dept: deptValue,
      nomor: updatedNomor,
    });
  };

  // Add a new department
  const handleAddNewDept = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanDept = newDeptInput.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
    if (!cleanDept) return;

    if (!departments.includes(cleanDept)) {
      const updatedList = [...departments, cleanDept];
      setDepartments(updatedList);
      try {
        localStorage.setItem('reporteng_depts', JSON.stringify(updatedList));
      } catch {}
    }

    // Immediately select the newly added department and update nomor
    const updatedNomor = generateBeritaAcaraNumber(data.nomor || '001', data.tanggal, cleanDept);
    onChange({
      ...data,
      dept: cleanDept,
      nomor: updatedNomor,
    });

    setNewDeptInput('');
    setIsAddingDept(false);
  };

  // When Nomor Urut changes
  const handleNomorUrutChange = (rawVal: string) => {
    if (isManualNomor) {
      handleChange('nomor', rawVal);
    } else {
      const formatted = generateBeritaAcaraNumber(rawVal, data.tanggal, currentDept);
      onChange({
        ...data,
        nomor: formatted,
        dept: currentDept,
      });
    }
  };

  // When Tanggal changes, update roman month and year in nomor if using standard format
  const handleTanggalChange = (val: string) => {
    const updatedNomor = data.nomor.includes('/BAK-TAR/')
      ? generateBeritaAcaraNumber(data.nomor, val, currentDept)
      : data.nomor;

    onChange({
      ...data,
      tanggal: val,
      nomor: updatedNomor,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos: string[] = [...(data.photos || [])];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newPhotos.push(event.target.result as string);
          onChange({
            ...data,
            photos: [...newPhotos],
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = [...(data.photos || [])];
    newPhotos.splice(index, 1);
    onChange({
      ...data,
      photos: newPhotos,
    });
  };

  return (
    <div className="space-y-5 text-gray-800">
      {/* Quick Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Berita Acara
          </span>
          <span className="text-xs text-gray-700 hidden sm:inline">
            Isi formulir untuk pembaruan real-time
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors border border-emerald-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            Contoh Data
          </button>
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-gray-200"
            title="Bersihkan Form"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* 1. Informasi Dasar & Nomor Dokumen */}
      <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          Informasi Dasar
        </h3>

        {/* Nomor & Dept Controls */}
        <div className="p-3.5 bg-emerald-50/50 border border-emerald-100 rounded-xl space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <span>Konfigurasi Nomor Berita Acara</span>
            </span>
            <button
              type="button"
              onClick={() => setIsManualNomor(!isManualNomor)}
              className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 hover:underline"
            >
              {isManualNomor ? '← Gunakan Mode Otomatis' : 'Mode Edit String Manual'}
            </button>
          </div>

          {!isManualNomor ? (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Nomor Urut */}
              <div className="sm:col-span-5">
                <label
                  htmlFor="nomorUrutInput"
                  className="block text-xs font-bold text-gray-800 mb-1"
                >
                  Nomor Urut <span className="text-red-500">*</span>
                </label>
                <input
                  id="nomorUrutInput"
                  type="text"
                  value={currentNomorUrut}
                  onChange={(e) => handleNomorUrutChange(e.target.value)}
                  placeholder="Contoh: 278 atau 067"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono font-bold"
                />
              </div>

              {/* Pilihan Dept */}
              <div className="sm:col-span-7">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="deptSelect" className="text-xs font-bold text-gray-800">
                    Dept (Departemen) <span className="text-red-500">*</span>
                  </label>
                  {!isAddingDept && (
                    <button
                      type="button"
                      onClick={() => setIsAddingDept(true)}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5"
                    >
                      <Plus className="w-3 h-3" />
                      Tambah Dept
                    </button>
                  )}
                </div>

                {!isAddingDept ? (
                  <select
                    id="deptSelect"
                    value={currentDept}
                    onChange={(e) => handleDeptSelect(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-semibold text-emerald-950"
                  >
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {DEPARTMENT_LABELS[dept] || `${dept} — Departemen ${dept}`}
                      </option>
                    ))}
                    <option value="__ADD_NEW__">+ Tambah Departemen Baru...</option>
                  </select>
                ) : (
                  <form onSubmit={handleAddNewDept} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={newDeptInput}
                      onChange={(e) => setNewDeptInput(e.target.value)}
                      placeholder="Kode Dept (misal: SEC/TR)"
                      className="flex-1 px-2.5 py-1.5 text-xs border border-emerald-400 rounded-lg bg-white uppercase font-bold focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1.5 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" />
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingDept(false);
                        setNewDeptInput('');
                      }}
                      className="px-2 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-xs font-medium"
                    >
                      Batal
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label htmlFor="nomorManual" className="block text-xs font-bold text-gray-800 mb-1">
                Ketik Nomor Lengkap Berita Acara Secara Bebas
              </label>
              <input
                id="nomorManual"
                type="text"
                value={data.nomor}
                onChange={(e) => handleChange('nomor', e.target.value)}
                placeholder="Contoh: 278/BAK-TAR/ENG/X/2026"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all font-mono"
              />
            </div>
          )}

          {/* Real-time Number Preview Banner */}
          <div className="pt-2 border-t border-emerald-100 flex items-center justify-between text-xs">
            <span className="text-gray-700 font-medium">Hasil Nomor di Dokumen:</span>
            <span className="font-mono font-bold text-emerald-950 bg-white px-2 py-1 rounded border border-emerald-200">
              No.&nbsp;{data.nomor || '___/BAK-TAR/___/___/____'}
            </span>
          </div>
        </div>

        {/* Tanggal, Waktu, Lokasi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tanggal */}
          <div>
            <label htmlFor="tanggal" className="block text-xs font-bold text-gray-800 mb-1.5">
              Tanggal Kejadian <span className="text-red-500">*</span>
            </label>
            <input
              id="tanggal"
              type="date"
              value={data.tanggal}
              onChange={(e) => handleTanggalChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Waktu */}
          <div>
            <label htmlFor="waktu" className="block text-xs font-bold text-gray-800 mb-1.5">
              Waktu Kejadian <span className="text-red-500">*</span>
            </label>
            <input
              id="waktu"
              type="time"
              value={data.waktu}
              onChange={(e) => handleChange('waktu', e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Lokasi */}
          <div className="sm:col-span-2">
            <label htmlFor="lokasi" className="block text-xs font-bold text-gray-800 mb-1.5">
              Lokasi Kejadian <span className="text-red-500">*</span>
            </label>
            <input
              id="lokasi"
              type="text"
              value={data.lokasi}
              onChange={(e) => handleChange('lokasi', e.target.value)}
              placeholder="Contoh: Lobby Utama Club House / STC-18O"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>
      </section>

      {/* 2. Deskripsi & Uraian Kejadian */}
      <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          Deskripsi &amp; Kronologi
        </h3>

        <div>
          <label htmlFor="deskripsi" className="block text-xs font-bold text-gray-800 mb-1.5">
            Deskripsi / Uraian Kejadian <span className="text-red-500">*</span>
          </label>
          <input
            id="deskripsi"
            type="text"
            value={data.deskripsi}
            onChange={(e) => handleChange('deskripsi', e.target.value)}
            placeholder="Contoh: Tagihan Listrik Melonjak / Kebocoran Pipa Chiller"
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>

        <div>
          <label htmlFor="analisa" className="block text-xs font-bold text-gray-800 mb-1.5">
            Analisa Masalah / Kronologis Kejadian <span className="text-red-500">*</span>
          </label>
          <textarea
            id="analisa"
            rows={4}
            value={data.analisa}
            onChange={(e) => handleChange('analisa', e.target.value)}
            placeholder="Jelaskan kronologi kejadian dan hasil investigasi penyebab masalah secara rinci..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all leading-relaxed"
          />
        </div>

        <div>
          <label htmlFor="solusi" className="block text-xs font-bold text-gray-800 mb-1.5">
            Tindakan Pencegahan &amp; Solusi Perbaikan <span className="text-red-500">*</span>
          </label>
          <textarea
            id="solusi"
            rows={4}
            value={data.solusi}
            onChange={(e) => handleChange('solusi', e.target.value)}
            placeholder="Jelaskan tindakan yang telah atau akan diambil untuk perbaikan dan pencegahan terulang..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all leading-relaxed"
          />
        </div>
      </section>

      {/* 3. Lampiran Foto */}
      <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Lampiran Foto ({data.photos?.length || 0})
          </h3>
          <span className="text-xs text-gray-700">Format gambar (JPG, PNG)</span>
        </div>

        {/* Upload Button & Dropzone */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            id="photo-upload-input"
          />
          <label
            htmlFor="photo-upload-input"
            className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-500 hover:bg-emerald-50/30 cursor-pointer transition-all"
          >
            <ImagePlus className="w-8 h-8 text-emerald-600 mb-2" />
            <span className="text-xs font-semibold text-gray-800">
              Pilih foto atau ambil dari kamera
            </span>
            <span className="text-[11px] text-gray-700 mt-0.5">
              Bisa upload lebih dari 1 foto sekaligus
            </span>
          </label>
        </div>

        {/* Photos Preview Grid */}
        {data.photos && data.photos.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {data.photos.map((photo, idx) => (
              <div
                key={idx}
                className="group relative rounded-lg border border-gray-200 overflow-hidden bg-gray-50 aspect-video flex items-center justify-center"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo}
                  alt={`Preview ${idx + 1}`}
                  className="object-cover w-full h-full"
                />
                <button
                  type="button"
                  onClick={() => handleRemovePhoto(idx)}
                  className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 opacity-90 shadow-sm transition-opacity"
                  title="Hapus foto ini"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] text-center py-0.5">
                  Foto {idx + 1}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Approval / Tanda Tangan */}
      <section className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
          Penandatangan / Approval
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="staffEngineering"
              className="block text-xs font-bold text-gray-800 mb-1.5"
            >
              Staff {currentDept} (Dilaporkan oleh) <span className="text-red-500">*</span>
            </label>
            <input
              id="staffEngineering"
              type="text"
              value={data.staffEngineering}
              onChange={(e) => handleChange('staffEngineering', e.target.value)}
              placeholder="Nama Pelapor"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="supervisor" className="block text-xs font-bold text-gray-800 mb-1.5">
              Supervisor (Diperiksa oleh) <span className="text-red-500">*</span>
            </label>
            <input
              id="supervisor"
              type="text"
              value={data.supervisor}
              onChange={(e) => handleChange('supervisor', e.target.value)}
              placeholder="Nama Supervisor"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label htmlFor="asstManager" className="block text-xs font-bold text-gray-800 mb-1.5">
              Asst. Manager (Diketahui oleh) <span className="text-red-500">*</span>
            </label>
            <input
              id="asstManager"
              type="text"
              value={data.asstManager}
              onChange={(e) => handleChange('asstManager', e.target.value)}
              placeholder="Nama Asst. Manager"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="propertyManager"
              className="block text-xs font-bold text-gray-800 mb-1.5"
            >
              Property Manager (Diketahui oleh) <span className="text-red-500">*</span>
            </label>
            <input
              id="propertyManager"
              type="text"
              value={data.propertyManager}
              onChange={(e) => handleChange('propertyManager', e.target.value)}
              placeholder="Nama Property Manager"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
