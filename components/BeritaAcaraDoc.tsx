'use client';

import React from 'react';
import Image from 'next/image';
import { BeritaAcaraData } from '@/lib/types';
import { formatIndonesianDayPhrase } from '@/lib/utils';

interface BeritaAcaraDocProps {
  data: BeritaAcaraData;
}

export const BeritaAcaraDoc: React.FC<BeritaAcaraDocProps> = ({ data }) => {
  const dayPhrase = formatIndonesianDayPhrase(data.tanggal);
  const closingSentence =
    'Demikian Berita Acara ini dibuat untuk dipergunakan sebagaimana mestinya, atas perhatian dan kerja samanya diucapkan terima kasih.';

  return (
    <div className="a4-document text-black bg-white select-text">
      {/* 1. Header: Logos & Organization Title */}
      <div className="relative flex items-center justify-between pb-3 pt-1">
        {/* Left: Asri Logo */}
        <div className="w-[100px] h-[58px] relative flex-shrink-0">
          <Image
            src="/logo_asri.jpg"
            alt="Logo ASRI"
            fill
            sizes="100px"
            className="object-contain object-left"
            priority
          />
        </div>

        {/* Center: Title */}
        <div className="text-center flex-1 px-2">
          <h2 className="text-[17px] font-bold tracking-tight text-black leading-tight">
            PROPERTY MANAGEMENT
          </h2>
          <h3 className="text-[13.5px] font-bold tracking-normal text-black leading-snug">
            TAMAN ANGGREK RESIDENCES
          </h3>
        </div>

        {/* Right: Taman Anggrek Logo */}
        <div className="w-[155px] h-[55px] relative flex-shrink-0">
          <Image
            src="/logo_taman_anggrek.png"
            alt="Logo Taman Anggrek Residences"
            fill
            sizes="155px"
            className="object-contain object-right"
            priority
          />
        </div>
      </div>

      {/* Horizontal Divider Line */}
      <div className="w-full h-[1.5px] bg-black mb-4"></div>

      {/* 2. Document Title & Number */}
      <div className="text-center mb-4">
        <h1 className="text-[18px] font-bold tracking-wide uppercase text-black leading-tight">
          BERITA ACARA
        </h1>
        <p className="text-[13px] font-bold text-black mt-0.5">
          No.&nbsp;&nbsp;{data.nomor || '___/BAK-TAR/ENG/___/____'}
        </p>
      </div>

      {/* 3. Opening Sentence */}
      <div className="text-[10.6px] leading-[1.4] text-black mb-3">
        Pada hari ini <span className="font-semibold">{dayPhrase || '.......................'}</span>{' '}
        jam <span className="font-semibold">{data.waktu ? `${data.waktu} WIB` : '..... WIB'}</span>
      </div>

      {/* 4. Section: Lokasi & Uraian Kejadian */}
      <div className="mb-3.5">
        <div className="text-[11.2px] font-bold text-black mb-1">
          Lokasi &amp; Uraian Kejadian:
        </div>
        <div className="border border-black grid grid-cols-2 text-[9.5px]">
          {/* Row 1: Header */}
          <div className="border-r border-b border-black font-bold p-1.5 bg-gray-50/50">
            Lokasi
          </div>
          <div className="border-b border-black font-bold p-1.5 bg-gray-50/50">
            Uraian Kejadian
          </div>
          {/* Row 2: Content */}
          <div className="border-r border-black p-2 min-h-[50px] leading-relaxed text-justify whitespace-pre-line">
            {data.lokasi || '-'}
          </div>
          <div className="p-2 min-h-[50px] leading-relaxed text-justify whitespace-pre-line">
            {data.deskripsi || '-'}
          </div>
        </div>
      </div>

      {/* 5. Section: Analisa Masalah / Kronologis */}
      <div className="mb-3.5">
        <div className="border border-black text-[9.5px]">
          <div className="border-b border-black font-bold text-[11.2px] px-2 py-1 bg-gray-50/50">
            Analisa Masalah / Kronologis:
          </div>
          <div className="p-2 leading-relaxed text-justify whitespace-pre-line min-h-[70px]">
            {data.analisa || 'Belum ada analisa masalah yang diinputkan.'}
          </div>
        </div>
      </div>

      {/* 6. Section: Lampiran Foto (if present) */}
      {data.photos && data.photos.length > 0 && (
        <div className="mb-3.5">
          <div className="border border-black text-[9.5px]">
            <div className="border-b border-black font-bold text-[11.2px] px-2 py-1 bg-gray-50/50">
              Lampiran Foto:
            </div>
            <div className="p-2">
              <div
                className={`grid gap-2 ${
                  data.photos.length === 1
                    ? 'grid-cols-1 max-w-[280px] mx-auto'
                    : data.photos.length === 2
                    ? 'grid-cols-2'
                    : data.photos.length === 3
                    ? 'grid-cols-3'
                    : 'grid-cols-4'
                }`}
              >
                {data.photos.map((src, idx) => (
                  <div
                    key={idx}
                    className="border border-gray-300 rounded overflow-hidden bg-white text-center flex flex-col"
                  >
                    <div className="relative h-28 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={src}
                        alt={`Lampiran foto ${idx + 1}`}
                        className="object-contain w-full h-full"
                      />
                    </div>
                    <div className="text-[8px] text-gray-600 py-0.5 bg-gray-50 border-t border-gray-200">
                      Foto {idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Section: Tindakan Pencegahan / Solusi */}
      <div className="mb-4">
        <div className="border border-black text-[9.5px]">
          <div className="border-b border-black font-bold text-[11.2px] px-2 py-1 bg-gray-50/50">
            Tindakan Pencegahan / Solusi:
          </div>
          <div className="p-2 leading-relaxed text-justify whitespace-pre-line min-h-[60px]">
            {data.solusi || 'Belum ada tindakan solusi yang diinputkan.'}
            <div className="mt-2.5 font-normal">{closingSentence}</div>
          </div>
        </div>
      </div>

      {/* 8. Approval / Tanda Tangan Table */}
      <div className="mt-4 pt-1">
        <table className="w-full border-collapse border border-black text-left text-[9.5px]">
          <thead>
            <tr className="border-b border-black font-bold text-center">
              <th className="border-r border-black p-1 w-1/4">Dilaporkan oleh</th>
              <th className="border-r border-black p-1 w-1/4">Diperiksa oleh,</th>
              <th colSpan={2} className="p-1 w-2/4">
                Diketahui oleh,
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Paraf Row (perlebar row kolom tanda tangan) */}
            <tr className="border-b border-black h-[85px] align-top">
              <td className="border-r border-black p-1 text-[8.5px] text-gray-500">
                Paraf:
              </td>
              <td className="border-r border-black p-1 text-[8.5px] text-gray-500">
                Paraf:
              </td>
              <td className="border-r border-black p-1 text-[8.5px] text-gray-500 w-1/4">
                Paraf:
              </td>
              <td className="p-1 text-[8.5px] text-gray-500 w-1/4">
                Paraf:
              </td>
            </tr>
            {/* Name Row */}
            <tr className="border-b border-black">
              <td className="border-r border-black p-1.5 leading-tight">
                Nama: <span className="font-bold">{data.staffEngineering || '....................'}</span>
              </td>
              <td className="border-r border-black p-1.5 leading-tight">
                Nama: <span className="font-bold">{data.supervisor || '....................'}</span>
              </td>
              <td className="border-r border-black p-1.5 leading-tight">
                Nama: <span className="font-bold">{data.asstManager || '....................'}</span>
              </td>
              <td className="p-1.5 leading-tight">
                Nama: <span className="font-bold">{data.propertyManager || '....................'}</span>
              </td>
            </tr>
            {/* Role / Jabatan Row */}
            <tr className="border-b border-black text-gray-800 font-medium">
              <td className="border-r border-black p-1.5 leading-tight">
                {data.jabatanStaff || 'Engineering Staff'}
              </td>
              <td className="border-r border-black p-1.5 leading-tight">
                {data.jabatanSupervisor || 'Supervisor'}
              </td>
              <td className="border-r border-black p-1.5 leading-tight">
                {data.jabatanAsstManager || 'Engineering Asst. Manager'}
              </td>
              <td className="p-1.5 leading-tight">
                {data.jabatanPropertyManager || 'Property Manager'}
              </td>
            </tr>
            {/* Date Row */}
            <tr>
              <td className="border-r border-black p-1.5">Tanggal:</td>
              <td className="border-r border-black p-1.5">Tanggal:</td>
              <td className="border-r border-black p-1.5">Tanggal:</td>
              <td className="p-1.5">Tanggal:</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
