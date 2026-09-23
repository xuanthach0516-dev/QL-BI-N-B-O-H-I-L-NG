import React from 'react';
import { Lock, Unlock, ShieldCheck, FileSpreadsheet, Layers, Sparkles } from 'lucide-react';
import { MasterConfig } from '../types';

interface HeaderProps {
  config: MasterConfig;
  onToggleLock: () => void;
  onOpenSelfTest: () => void;
  onExportExcel: () => void;
  totalSigns: number;
  onQuickLoadDataset: (count: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onToggleLock,
  onOpenSelfTest,
  onExportExcel,
  totalSigns,
}) => {
  return (
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Logo & Main Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center font-black text-white shadow-md shadow-blue-900/30 border border-blue-400/40 shrink-0">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="11" rx="2" />
                <path d="M12 15v6" />
                <path d="M8 21h8" />
                <path d="M7 9h10" />
              </svg>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase flex items-center gap-2">
                  <span>Quản Lý &amp; Sản Xuất Biển Tên Đường</span>
                </h1>
                <button
                  type="button"
                  onClick={onToggleLock}
                  title={config.isLocked ? "Mẫu thiết kế đang được KHÓA BẢO VỆ (V4.0) - Bấm để mở khóa" : "Mẫu thiết kế đang MỞ KHÓA - Bấm để khóa lại"}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 ${
                    config.isLocked
                      ? "bg-amber-500/15 text-amber-300 border border-amber-500/40 hover:bg-amber-500/25"
                      : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/25"
                  }`}
                >
                  {config.isLocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                  <span>MASTER {config.templateVersion} : {config.isLocked ? "LOCKED" : "UNLOCKED"}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hệ thống quản lý, kiểm tra QC &amp; sản xuất hàng loạt biển tên đường
              </p>
            </div>
          </div>

          {/* Quick Technical Dimension Callouts & Actions */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Dimension Indicators */}
            <div className="hidden sm:flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-lg">
              <span className="text-slate-400 text-[11px]">Cụm Lắp:</span>
              <span className="font-mono font-bold text-amber-400 text-[11px]">530 × 300 mm</span>
            </div>

            <div className="flex items-center gap-1.5 bg-blue-950/80 border border-blue-600/50 px-2.5 py-1 rounded-lg">
              <span className="text-blue-300 text-[11px] font-medium">Mặt In (Artwork):</span>
              <span className="font-mono font-bold text-emerald-400 text-[11px]">500 × 300 mm</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 px-2.5 py-1 rounded-lg" title="Nẹp cơ khí - Không đưa vào artwork">
              <span className="text-slate-400 text-[11px]">Nẹp Kỹ Thuật:</span>
              <span className="font-mono font-bold text-rose-400 text-[11px]">30 mm (Không In)</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 ml-auto sm:ml-2">
              <button
                type="button"
                onClick={onOpenSelfTest}
                className="bg-indigo-600/90 hover:bg-indigo-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs shadow-sm hover:shadow transition active:scale-95 cursor-pointer"
                title="Chạy bộ kiểm tra kỹ thuật tự động 36 quy chuẩn"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-200" />
                <span className="hidden sm:inline">Chạy QC Test</span>
              </button>

              <button
                type="button"
                onClick={onExportExcel}
                className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 text-xs shadow-sm hover:shadow transition active:scale-95 cursor-pointer"
                title="Xuất bảng dữ liệu Excel 17 cột kỹ thuật"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden sm:inline">Xuất Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
