import React from 'react';
import { History, Trash2, DownloadCloud, FileCheck, Calendar, HardDrive } from 'lucide-react';
import { HistoryEntry } from '../types';

interface HistoryViewProps {
  history: HistoryEntry[];
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onClearHistory,
}) => {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Nhật Ký Xuất File Sản Xuất (PRODUCTION HISTORY)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Lưu vết toàn bộ các lần kết xuất file ZIP, bản vẽ kỹ thuật và danh sách sản xuất.
          </p>
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="bg-slate-800 hover:bg-rose-900/60 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-500/50 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa Lịch Sử</span>
          </button>
        )}
      </div>

      {/* History List */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        {history.length === 0 ? (
          <div className="p-10 text-center text-slate-500 text-xs">
            Chưa có lượt xuất file nào được ghi nhận trong phiên làm việc này.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-850/50 transition"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mt-0.5">
                    <DownloadCloud className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs flex items-center gap-2">
                      <span>{entry.fileName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        {entry.type}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {entry.timestamp}
                      </span>
                      <span>•</span>
                      <span>Lô: <strong className="text-slate-300">{entry.batchName}</strong></span>
                      <span>•</span>
                      <span>Số lượng: <strong className="text-emerald-400">{entry.itemCount}</strong> biển</span>
                      {entry.fileSize && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3 text-slate-500" />
                            {entry.fileSize}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Thành Công</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
