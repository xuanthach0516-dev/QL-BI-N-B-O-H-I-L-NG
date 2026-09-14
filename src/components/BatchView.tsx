import React, { useState } from 'react';
import {
  FolderArchive,
  DownloadCloud,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Settings2,
  ArrowRight,
} from 'lucide-react';
import { SignItem, BatchSummary, MasterConfig } from '../types';

interface BatchViewProps {
  signs: SignItem[];
  batchSummaries: BatchSummary[];
  batchSize: number;
  onChangeBatchSize: (newSize: number) => void;
  onExportBatchZip: (batchName: string) => void;
  onFilterByBatch: (batchName: string) => void;
}

export const BatchView: React.FC<BatchViewProps> = ({
  signs,
  batchSummaries,
  batchSize,
  onChangeBatchSize,
  onExportBatchZip,
  onFilterByBatch,
}) => {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Controls: Batch Size selector (Rule 24) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FolderArchive className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Quản Lý Phân Nhóm Lô Sản Xuất (BATCH MANAGEMENT)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Quy định phân lô sản xuất công nghiệp: 100, 250, 500, 1.000 biển/lô. Mặc định chuẩn <strong>500 biển/lô</strong>. Mỗi lô được đóng gói thành một file ZIP độc lập.
          </p>
        </div>

        {/* Batch Size Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Quy mô lô:</span>
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1">
            {[100, 250, 500, 1000].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChangeBatchSize(size)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer ${
                  batchSize === size
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {size} biển/lô
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid of Batches */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {batchSummaries.map((batch) => {
          const passPercent = Math.round((batch.passed / batch.total) * 100) || 0;
          const isReady = batch.error === 0;

          return (
            <div
              key={batch.batchName}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-700 transition"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <h3 className="font-black text-white text-base">{batch.batchName}</h3>
                  </div>
                  <span className="font-mono text-xs text-slate-400 font-bold bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    STT {batch.startIndex} - {batch.endIndex}
                  </span>
                </div>

                <div className="text-xs text-slate-400 mb-3">
                  Tổng số lượng: <strong className="text-white">{batch.total}</strong> biển tên đường
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden flex mb-3">
                  <div
                    style={{ width: `${(batch.exported / batch.total) * 100}%` }}
                    className="bg-cyan-500"
                    title={`Đã xuất: ${batch.exported}`}
                  />
                  <div
                    style={{ width: `${(batch.passed / batch.total) * 100}%` }}
                    className="bg-emerald-500"
                    title={`Đạt QC: ${batch.passed}`}
                  />
                  <div
                    style={{ width: `${(batch.warning / batch.total) * 100}%` }}
                    className="bg-amber-500"
                    title={`Cần kiểm tra: ${batch.warning}`}
                  />
                  <div
                    style={{ width: `${(batch.error / batch.total) * 100}%` }}
                    className="bg-rose-500"
                    title={`Lỗi: ${batch.error}`}
                  />
                </div>

                {/* Status Stats */}
                <div className="grid grid-cols-4 gap-1 text-center text-xs py-2 bg-slate-950 rounded-lg border border-slate-800 mb-4">
                  <div>
                    <div className="text-[10px] text-slate-400">Đạt QC</div>
                    <div className="font-bold text-emerald-400">{batch.passed}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Lưu ý</div>
                    <div className="font-bold text-amber-400">{batch.warning}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Lỗi</div>
                    <div className="font-bold text-rose-400">{batch.error}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Đã xuất</div>
                    <div className="font-bold text-cyan-400">{batch.exported}</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => onFilterByBatch(batch.batchName)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 rounded-lg transition cursor-pointer"
                >
                  Xem Dữ Liệu
                </button>

                <button
                  type="button"
                  onClick={() => onExportBatchZip(batch.batchName)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 rounded-lg transition cursor-pointer flex items-center justify-center gap-1 shadow"
                >
                  <DownloadCloud className="w-3.5 h-3.5" />
                  <span>Xuất ZIP Lô</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
