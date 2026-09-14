import React from 'react';
import { Lock, Unlock, CheckCircle2, ShieldCheck, FileSpreadsheet, PlayCircle, HelpCircle } from 'lucide-react';
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
  onQuickLoadDataset,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Logo & Main Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xl shadow-inner border border-blue-400">
              HL
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white uppercase">
                  Quản Lý &amp; Sản Xuất Biển Tên Đường Hải Lăng
                </h1>
                <button
                  type="button"
                  onClick={onToggleLock}
                  title={config.isLocked ? "Mẫu thiết kế đang được KHÓA BẢO VỆ (V4.0) - Bấm để mở khóa" : "Mẫu thiết kế đang MỞ KHÓA - Bấm để khóa lại"}
                  className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-sm ${
                    config.isLocked
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 hover:bg-emerald-500/30"
                  }`}
                >
                  {config.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                  MASTER {config.templateVersion} : {config.isLocked ? "LOCKED" : "UNLOCKED"}
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Hệ thống quản lý, kiểm tra QC &amp; sản xuất hàng loạt ~4.000 biển tên đường (Huyện Hải Lăng, Quảng Trị)
              </p>
            </div>
          </div>

          {/* Quick Technical Dimension Callout Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded flex items-center gap-1.5" title="Kích thước cụm biển sau khi lắp ráp nẹp">
              <span className="text-slate-400">Cụm Lắp:</span>
              <span className="font-mono font-bold text-amber-400">530 × 300 mm</span>
            </div>

            <div className="bg-blue-950/80 border border-blue-600/60 px-2.5 py-1 rounded flex items-center gap-1.5" title="Kích thước mặt biển thực tế để in artwork (BẮT BUỘC)">
              <span className="text-blue-300">Mặt Biển In:</span>
              <span className="font-mono font-bold text-emerald-400">500 × 300 mm</span>
            </div>

            <div className="bg-slate-800/90 border border-slate-700 px-2.5 py-1 rounded flex items-center gap-1.5" title="Nẹp kết cấu cơ khí bên trái - KHÔNG ĐƯA VÀO FILE IN">
              <span className="text-slate-400">Nẹp Kỹ Thuật:</span>
              <span className="font-mono font-bold text-rose-400">30 × 300 mm (KHÔNG IN)</span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 ml-auto md:ml-2">
              <button
                type="button"
                onClick={onOpenSelfTest}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-2.5 py-1 rounded flex items-center gap-1 text-xs shadow transition cursor-pointer"
                title="Chạy bộ kiểm tra kỹ thuật tự động (Rule 1-36)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Chạy QC Test</span>
              </button>

              <button
                type="button"
                onClick={onExportExcel}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-2.5 py-1 rounded flex items-center gap-1 text-xs shadow transition cursor-pointer"
                title="Xuất bảng danh sách DANH_SACH_BIEN_TEN_DUONG.xlsx"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Xuất Excel</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
