'use client';

import React from 'react';
import Image from 'next/image';
import { BQData, BQViewMode } from '@/lib/types';
import { calculateBQTotals, formatNumberId } from '@/lib/utils';

interface BQDocProps {
  data: BQData;
  viewMode?: BQViewMode;
}

interface BQPageProps {
  data: BQData;
  isIce: boolean;
  pageNumber: number;
}

const BQSinglePage: React.FC<BQPageProps> = ({ data, isIce, pageNumber }) => {
  const { subtotal, ppn, grandTotal } = calculateBQTotals(data.items);
  const title = isIce ? 'INTERNAL COST ESTIMATION' : 'BILL OF QUANTITY';

  return (
    <div className={`a4-document text-black bg-white select-text ${pageNumber > 1 ? 'page-break-before' : ''}`}>
      {/* 1. Header: Title & Logo */}
      <div className="flex items-center justify-between pb-3 pt-1 border-b border-transparent">
        <div>
          <h1 className="text-[16px] font-bold tracking-tight text-black uppercase">
            {title}
          </h1>
          <p className="text-[10px] text-gray-700 font-semibold tracking-wide">
            TAMAN ANGGREK RESIDENCES
          </p>
        </div>

        <div className="w-[145px] h-[48px] relative flex-shrink-0">
          <Image
            src="/logo_taman_anggrek.png"
            alt="Logo Taman Anggrek Residences"
            fill
            sizes="145px"
            className="object-contain object-right"
            priority
          />
        </div>
      </div>

      {/* 2. Project Info Box */}
      <div className="my-3 border border-black p-2 text-[9px] leading-tight bg-white">
        <table className="w-full">
          <tbody>
            <tr>
              <td className="w-[80px] font-bold py-0.5 align-top">Project</td>
              <td className="w-[12px] py-0.5 align-top">:</td>
              <td className="py-0.5 font-semibold text-black uppercase">{data.project || '-'}</td>
            </tr>
            <tr>
              <td className="font-bold py-0.5 align-top">Kontraktor</td>
              <td className="py-0.5 align-top">:</td>
              <td className="py-0.5 text-black">{data.kontraktor || '-'}</td>
            </tr>
            <tr>
              <td className="font-bold py-0.5 align-top">Location</td>
              <td className="py-0.5 align-top">:</td>
              <td className="py-0.5 text-black">{data.location || '-'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 3. Items Table */}
      <div className="mb-3 overflow-x-auto">
        <table className="w-full border-collapse border border-black text-[8.5px]">
          {/* Table Header - Uniform & Balanced */}
          <thead>
            <tr className="bg-[#00B050] text-white font-bold text-center border-b border-black">
              <th rowSpan={2} className="border-r border-black p-1.5 w-[30px] align-middle">
                NO
              </th>
              <th rowSpan={2} className="border-r border-black p-1.5 text-left min-w-[170px] align-middle">
                ITEM
              </th>
              <th rowSpan={2} className="border-r border-black p-1.5 w-[38px] align-middle">
                QTY
              </th>
              <th rowSpan={2} className="border-r border-black p-1.5 w-[38px] align-middle">
                UNIT
              </th>
              <th colSpan={2} className="border-r border-black p-1.5 align-middle">
                UNIT PRICE
              </th>
              <th colSpan={2} className="p-1.5 align-middle">
                TOTAL PRICE
              </th>
            </tr>
            <tr className="bg-[#00B050] text-white font-bold text-center border-b border-black">
              {/* Under UNIT PRICE */}
              <th className="border-r border-black p-1 w-[70px] align-middle">MATERIAL</th>
              <th className="border-r border-black p-1 w-[70px] align-middle">LABOR</th>
              {/* Under TOTAL PRICE */}
              <th className="border-r border-black p-1 w-[75px] align-middle">MATERIAL</th>
              <th className="p-1 w-[75px] align-middle">LABOR</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody>
            {data.items && data.items.length > 0 ? (
              data.items.map((item, idx) => {
                const totMat = item.qty * (item.materialPrice || 0);
                const totLab = item.qty * (item.laborPrice || 0);

                return (
                  <tr key={item.id || idx} className="border-b border-black/70 hover:bg-gray-50/50">
                    <td className="border-r border-black p-1 text-center font-medium">
                      {item.itemNo || idx + 1}
                    </td>
                    <td className="border-r border-black p-1.5 text-left font-normal leading-tight">
                      {item.description || '-'}
                    </td>
                    <td className="border-r border-black p-1 text-center w-[35px]">
                      {item.qty || 0}
                    </td>
                    <td className="border-r border-black p-1 text-center w-[30px]">
                      {item.unit || '-'}
                    </td>

                    {/* Unit Price Material */}
                    <td className="border-r border-black p-1 text-right">
                      {isIce && item.materialPrice ? (
                        <div className="flex justify-between px-0.5">
                          <span>Rp</span>
                          <span>{formatNumberId(item.materialPrice)}</span>
                        </div>
                      ) : (
                        ''
                      )}
                    </td>

                    {/* Unit Price Labor */}
                    <td className="border-r border-black p-1 text-right">
                      {isIce && item.laborPrice ? (
                        <div className="flex justify-between px-0.5">
                          <span>Rp</span>
                          <span>{formatNumberId(item.laborPrice)}</span>
                        </div>
                      ) : (
                        ''
                      )}
                    </td>

                    {/* Total Material */}
                    <td className="border-r border-black p-1 text-right">
                      {isIce && totMat ? (
                        <div className="flex justify-between px-0.5 font-medium">
                          <span>Rp</span>
                          <span>{formatNumberId(totMat)}</span>
                        </div>
                      ) : (
                        ''
                      )}
                    </td>

                    {/* Total Labor */}
                    <td className="p-1 text-right">
                      {isIce && totLab ? (
                        <div className="flex justify-between px-0.5 font-medium">
                          <span>Rp</span>
                          <span>{formatNumberId(totLab)}</span>
                        </div>
                      ) : (
                        ''
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="p-4 text-center text-gray-400">
                  Belum ada item pekerjaan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Summary Table (aligned right) */}
      <div className="flex justify-end mb-5">
        <table className="w-[290px] border-collapse border border-black text-[9px]">
          <tbody>
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 font-bold">Sub Total</td>
              <td className="p-1 text-right font-semibold">
                {isIce ? (
                  <div className="flex justify-between px-1">
                    <span>Rp</span>
                    <span>{formatNumberId(subtotal)}</span>
                  </div>
                ) : (
                  <span className="text-transparent">-</span>
                )}
              </td>
            </tr>
            <tr className="border-b border-black">
              <td className="border-r border-black p-1 font-bold">PPN 11%</td>
              <td className="p-1 text-right font-semibold">
                {isIce ? (
                  <div className="flex justify-between px-1">
                    <span>Rp</span>
                    <span>{formatNumberId(ppn)}</span>
                  </div>
                ) : (
                  <span className="text-transparent">-</span>
                )}
              </td>
            </tr>
            <tr className="bg-gray-100/70 font-bold">
              <td className="border-r border-black p-1.5 font-bold">Grand Total</td>
              <td className="p-1.5 text-right font-bold text-[9.5px]">
                {isIce ? (
                  <div className="flex justify-between px-1">
                    <span>Rp</span>
                    <span>{formatNumberId(grandTotal)}</span>
                  </div>
                ) : (
                  <span className="text-transparent">-</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 5. Signatures Table (3 columns, borderless, columns widened by >20%, taller signature row) */}
      <div className="mt-5 mx-auto max-w-[530px] w-full">
        <table className="w-full border-none text-center text-[9px]">
          <thead>
            <tr className="border-none font-bold text-gray-900">
              <th className="p-2 w-1/3 text-center border-none font-bold text-[9.5px]">Dibuat Oleh</th>
              <th className="p-2 w-1/3 text-center border-none font-bold text-[9.5px]">Menyetujui,</th>
              <th className="p-2 w-1/3 text-center border-none font-bold text-[9.5px]">Mengetahui,</th>
            </tr>
          </thead>
          <tbody>
            {/* Paraf & Names (taller row for signature space) */}
            <tr className="border-none h-[90px] align-bottom">
              <td className="p-2 pb-1 border-none text-center">
                <div className="font-bold text-[10px] leading-tight text-black underline underline-offset-2">
                  {data.dibuatOleh || '................................'}
                </div>
                <div className="text-[8.5px] text-gray-800 mt-1 font-medium">
                  {data.jabatanDibuatOleh || 'Engineering Ast. Manager'}
                </div>
              </td>
              <td className="p-2 pb-1 border-none text-center">
                <div className="font-bold text-[10px] leading-tight text-black underline underline-offset-2">
                  {data.menyetujui || '................................'}
                </div>
                <div className="text-[8.5px] text-gray-800 mt-1 font-medium">
                  {data.jabatanMenyetujui || 'Property Manager'}
                </div>
              </td>
              <td className="p-2 pb-1 border-none text-center">
                <div className="font-bold text-[10px] leading-tight text-black underline underline-offset-2">
                  {data.mengetahui || '................................'}
                </div>
                <div className="text-[8.5px] text-gray-800 mt-1 font-medium">
                  {data.jabatanMengetahui || 'GM Building Management'}
                </div>
              </td>
            </tr>
            {/* Date Row (borderless) */}
            <tr className="border-none text-center text-[8.5px] text-gray-700">
              <td className="p-2 pt-1 border-none">Tanggal : ....................</td>
              <td className="p-2 pt-1 border-none">Tanggal : ....................</td>
              <td className="p-2 pt-1 border-none">Tanggal : ....................</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Page indicator on screen/print */}
      <div className="text-right text-[8px] text-gray-400 mt-6 print:hidden">
        Halaman {pageNumber} dari 2 ({isIce ? 'Internal Cost Estimation' : 'Bill of Quantity'})
      </div>
    </div>
  );
};

export const BQDoc: React.FC<BQDocProps> = ({ data, viewMode = 'all' }) => {
  if (viewMode === 'ice') {
    return <BQSinglePage data={data} isIce={true} pageNumber={1} />;
  }

  if (viewMode === 'bq') {
    return <BQSinglePage data={data} isIce={false} pageNumber={2} />;
  }

  // viewMode === 'all' (shows both Page 1 and Page 2 in sequence)
  return (
    <div className="space-y-6 print:space-y-0">
      <BQSinglePage data={data} isIce={true} pageNumber={1} />
      <BQSinglePage data={data} isIce={false} pageNumber={2} />
    </div>
  );
};
