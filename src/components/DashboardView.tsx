import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Layers,
  Download,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Info,
  Check,
} from 'lucide-react';
import { SignItem, NavigationTab, BatchSummary } from '../types';

interface DashboardViewProps {
  signs: SignItem[];
  batchSummaries: BatchSummary[];
  onNavigate: (tab: NavigationTab) => void;
  onQuickLoadCount: (count: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  signs,
  batchSummaries,
  onNavigate,
  onQuickLoadCount,
}) => {
  const total = signs.length;
  const passed = signs.filter((s) => s.status === 'QC_PASSED').length;
  const needCheck = signs.filter((s) => s.status === 'CHECK_REQUIRED').length;
  const error = signs.filter((s) => s.status === 'ERROR').length;
  const exported = signs.filter((s) => s.status === 'EXPORTED').length;

  const passedPercent = total > 0 ? Math.round((passed / total) * 100) : 0;
  const exportedPercent = total > 0 ? Math.round((exported / total) * 100) : 0;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Project Context */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-2xl p-5 sm:p-6 border border-blue-800/40 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-500/15 text-blue-300 border border-blue-400/30 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> DỰ ÁN SẢN XUẤT BIỂN TÊN ĐƯỜNG TIÊU CHUẨN
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
              Bảng Điều Khiển Quản Lý &amp; Kiểm Định Sản Xuất
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Hệ thống xử lý tự động quy mô <strong>hàng ngàn biển</strong> với thuật toán <code>fitRoadName()</code> tỷ lệ vàng không méo chữ, kiểm soát dung sai kích thước mặt in <strong>500 × 300 mm</strong> và cụm lắp ráp <strong>530 × 300 mm</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onQuickLoadCount(4000)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Layers className="w-4 h-4 text-blue-400" /> Nạp Mẫu 4.000 Biển
            </button>
            <button
              type="button"
              onClick={() => onNavigate('EXPORT')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md shadow-emerald-900/40 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" /> Tiến Hành Xuất File
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards (Rule 15: TỔNG SỐ BIỂN, ĐẠT QC, CẦN KIỂM TRA, LỖI, ĐÃ XUẤT) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* 1. Tổng số biển */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Tổng Số Biển</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-white font-mono">
            {total.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Toàn bộ danh mục sản xuất
          </div>
        </div>

        {/* 2. Đạt QC */}
        <div className="bg-slate-800/90 border border-emerald-500/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Đạt QC</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {passed.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {passedPercent}% sẵn sàng in ấn
          </div>
        </div>

        {/* 3. Cần kiểm tra */}
        <div className="bg-slate-800/90 border border-amber-500/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Cần Kiểm Tra</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
            {needCheck.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Co nhỏ tỷ lệ / Trùng tên
          </div>
        </div>

        {/* 4. Lỗi */}
        <div className="bg-slate-800/90 border border-rose-500/30 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between text-rose-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Lỗi</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {error.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Quá dài / Trùng mã / Rỗng
          </div>
        </div>

        {/* 5. Đã xuất */}
        <div className="bg-slate-800/90 border border-cyan-500/30 rounded-xl p-4 shadow-sm col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Đã Xuất</span>
            <FileCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">
            {exported.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            {exportedPercent}% đã xuất file
          </div>
        </div>
      </div>

      {/* Progress Bars (Rule 15) */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between text-sm font-bold text-white">
          <span>Tiến Độ Kiểm Định &amp; Xuất Sản Xuất</span>
          <span className="text-blue-400 font-mono text-xs">{passed + exported} / {total} Biển Hợp Chuẩn</span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
          <div
            style={{ width: `${total > 0 ? (exported / total) * 100 : 0}%` }}
            className="bg-cyan-500 transition-all duration-500"
            title={`Đã xuất: ${exported}`}
          />
          <div
            style={{ width: `${total > 0 ? (passed / total) * 100 : 0}%` }}
            className="bg-emerald-500 transition-all duration-500"
            title={`Đạt QC: ${passed}`}
          />
          <div
            style={{ width: `${total > 0 ? (needCheck / total) * 100 : 0}%` }}
            className="bg-amber-500 transition-all duration-500"
            title={`Cần kiểm tra: ${needCheck}`}
          />
          <div
            style={{ width: `${total > 0 ? (error / total) * 100 : 0}%` }}
            className="bg-rose-500 transition-all duration-500"
            title={`Lỗi: ${error}`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-1 border-t border-slate-700/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-slate-300">Đã xuất ({exported})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-slate-300">Đạt QC ({passed})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-slate-300">Cần kiểm tra ({needCheck})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-300">Lỗi ({error})</span>
          </div>
        </div>
      </div>

      {/* Critical Dimension Verification Callout Box */}
      <div className="bg-blue-950/40 border-2 border-blue-500/40 rounded-xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20 text-blue-400 mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1 text-xs sm:text-sm">
            <h3 className="font-extrabold text-blue-300 uppercase tracking-wide">
              QUY CHUẨN KỸ THUẬT BẮT BUỘC VỀ KÍCH THƯỚC (QUY TẮC SỐ 1, 2, 3 &amp; 36)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <div className="bg-slate-900/90 border border-slate-700/80 p-3 rounded-lg">
                <div className="text-xs text-slate-400">1. Cụm Biển Tổng Thể</div>
                <div className="font-mono text-base font-bold text-amber-400">530 × 300 mm</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Sau khi gắn nẹp kim loại lắp đặt</div>
              </div>

              <div className="bg-slate-900/90 border border-emerald-500/40 p-3 rounded-lg">
                <div className="text-xs text-emerald-300">2. Mặt Biển In (Artwork)</div>
                <div className="font-mono text-base font-bold text-emerald-400">500 × 300 mm</div>
                <div className="text-[11px] text-emerald-300/80 mt-0.5">Kích thước file in ấn thực tế (Tỷ lệ 5:3)</div>
              </div>

              <div className="bg-slate-900/90 border border-rose-500/40 p-3 rounded-lg">
                <div className="text-xs text-rose-300">3. Nẹp Lắp Đặt Kỹ Thuật</div>
                <div className="font-mono text-base font-bold text-rose-400">30 × 300 mm</div>
                <div className="text-[11px] text-rose-300/80 mt-0.5">Nẹp cơ khí, TUYỆT ĐỐI KHÔNG IN</div>
              </div>
            </div>
            <p className="text-xs text-slate-300 pt-1">
              ⚠️ <strong>Cảnh báo:</strong> Nẹp 30mm không phải diện tích đồ họa, không được vẽ thành dải màu xám trên mặt biển. File xuất SVG, PDF, PNG chỉ có kích thước <strong>500 × 300 mm</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* Production Batches Breakdown */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-white text-base">Phân Nhóm Lô Sản Xuất (Batches)</h3>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-700 text-slate-300">
              {batchSummaries.length} Lô
            </span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('BATCH')}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            Xem chi tiết tất cả các lô <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {batchSummaries.slice(0, 8).map((batch) => (
            <div
              key={batch.batchName}
              className="bg-slate-900/90 border border-slate-700/80 rounded-lg p-3.5 hover:border-blue-500/50 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">{batch.batchName}</span>
                  <span className="font-mono text-[11px] text-slate-400">
                    {batch.startIndex} - {batch.endIndex}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mb-2">
                  Tổng: <span className="font-bold text-white">{batch.total}</span> biển
                </div>

                {/* Progress bar per batch */}
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden flex mb-2">
                  <div
                    style={{ width: `${(batch.exported / batch.total) * 100}%` }}
                    className="bg-cyan-500"
                  />
                  <div
                    style={{ width: `${(batch.passed / batch.total) * 100}%` }}
                    className="bg-emerald-500"
                  />
                  <div
                    style={{ width: `${(batch.warning / batch.total) * 100}%` }}
                    className="bg-amber-500"
                  />
                  <div
                    style={{ width: `${(batch.error / batch.total) * 100}%` }}
                    className="bg-rose-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <span className="text-emerald-400 font-bold">{batch.passed} đạt</span>
                {batch.error > 0 && <span className="text-rose-400 font-bold">{batch.error} lỗi</span>}
                <button
                  type="button"
                  onClick={() => onNavigate('EXPORT')}
                  className="text-blue-400 hover:text-blue-300 font-bold"
                >
                  Xuất ZIP
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
