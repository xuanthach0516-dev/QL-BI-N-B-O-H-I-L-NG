import React, { useState, useRef } from 'react';
import { saveAs } from 'file-saver';
import {
  DownloadCloud,
  FileSpreadsheet,
  Layers,
  FileCode,
  FileText,
  FileImage,
  FolderArchive,
  ShieldCheck,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { SignItem, MasterConfig, BatchSummary, ExportProgress, HistoryEntry } from '../types';
import { exportBatchZip, exportSignsExcel, exportSingleSvg, exportSinglePdf, exportSinglePng } from '../utils/exportUtils';
import { validateArtworkSvg, generateMasterArtworkSvg } from '../utils/masterSvg';

interface ExportViewProps {
  signs: SignItem[];
  batchSummaries: BatchSummary[];
  masterConfig: MasterConfig;
  onAddHistory: (entry: HistoryEntry) => void;
  onUpdateSignExported: (signIds: string[]) => void;
}

export const ExportView: React.FC<ExportViewProps> = ({
  signs,
  batchSummaries,
  masterConfig,
  onAddHistory,
  onUpdateSignExported,
}) => {
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [includeSvg, setIncludeSvg] = useState<boolean>(true);
  const [includePdf, setIncludePdf] = useState<boolean>(true);
  const [includePng, setIncludePng] = useState<boolean>(true);
  const [includeAssembly, setIncludeAssembly] = useState<boolean>(false);
  const [dpi, setDpi] = useState<300 | 600>(600); // Rule 22: Mặc định 600 DPI

  // Quản lý trạng thái tiến trình xuất file (Rule 31: Hỗ trợ Resume)
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const shouldStopRef = useRef<boolean>(false);
  const isRunningRef = useRef<boolean>(false);

  // Danh sách các biển mục tiêu xuất
  const targetSigns = selectedBatch === 'ALL'
    ? signs
    : signs.filter((s) => s.batch === selectedBatch);

  // Xử lý bắt đầu xuất ZIP
  const handleStartExport = async () => {
    if (targetSigns.length === 0) {
      alert('Không có biển nào để xuất.');
      return;
    }

    if (!includeSvg && !includePdf && !includePng) {
      alert('Vui lòng chọn ít nhất 1 định dạng xuất (SVG, PDF hoặc PNG).');
      return;
    }

    // RULE 35: KIỂM TRA ĐỘT XUẤT 1 MẪU ĐẦU TIÊN
    const testSvg = generateMasterArtworkSvg(targetSigns[0], masterConfig);
    const check = validateArtworkSvg(testSvg);
    if (!check.valid) {
      alert(check.error);
      return;
    }

    shouldStopRef.current = false;
    isRunningRef.current = true;

    const batchLabel = selectedBatch === 'ALL' ? 'FULL_PROJECT' : selectedBatch.replace(/\s+/g, '_');
    const zipFileName = `BIEN_TEN_DUONG_${batchLabel}.zip`;

    setProgress({
      isRunning: true,
      isPaused: false,
      total: targetSigns.length,
      current: completedIds.length,
      currentSignName: '',
      batchName: selectedBatch,
      completedIds: [...completedIds],
      failedIds: [],
    });

    try {
      const result = await exportBatchZip(
        targetSigns,
        batchLabel,
        masterConfig,
        {
          includeSvg,
          includePdf,
          includePng,
          includeAssembly,
          dpi,
        },
        (p) => {
          setProgress(p);
        },
        () => shouldStopRef.current,
        completedIds
      );

      if (result) {
        setCompletedIds(result.completedIds);
        onUpdateSignExported(result.completedIds);
        saveAs(result.zipBlob, zipFileName);

        onAddHistory({
          id: `hist_${Date.now()}`,
          timestamp: new Date().toLocaleString('vi-VN'),
          batchName: selectedBatch,
          type: 'ZIP',
          itemCount: result.completedIds.length,
          fileName: zipFileName,
          fileSize: `${Math.round(result.zipBlob.size / 1024 / 1024 * 10) / 10} MB`,
          status: 'SUCCESS',
        });

        alert(`Xuất thành công file ${zipFileName} (${result.completedIds.length} biển)!`);
      } else {
        // Tạm dừng
        alert('Tiến trình xuất file đã được tạm dừng. Bạn có thể nhấn Tiếp tục bất cứ lúc nào (Resume).');
      }
    } catch (err: any) {
      alert('Lỗi xuất file: ' + (err.message || String(err)));
    } finally {
      isRunningRef.current = false;
      setProgress((p) => (p ? { ...p, isRunning: false } : null));
    }
  };

  const handlePauseExport = () => {
    shouldStopRef.current = true;
  };

  const handleResetExportProgress = () => {
    if (window.confirm('Đặt lại tiến trình xuất file? Các biển đã hoàn thành trước đó sẽ được tạo lại từ đầu.')) {
      setCompletedIds([]);
      setProgress(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner with Strict Dimension Check (Rule 35) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DownloadCloud className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Trung Tâm Xuất File Sản Xuất Hàng Loạt (EXPORT CENTER)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Tự động sinh và đóng gói file Artwork <strong>500 × 300 mm</strong> (SVG, PDF vector 1:1, PNG 600 DPI, ZIP, Excel).
            Hệ thống có cơ chế kiểm tra kích thước nghiêm ngặt trước khi đóng gói.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => exportSignsExcel(signs)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel Danh Sách (17 Cột)</span>
          </button>
        </div>
      </div>

      {/* Strict Dimension Gatekeeper Box (Rule 19, 20, 21, 22, 35) */}
      <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-4 flex items-start gap-3 text-xs text-emerald-200">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-extrabold text-emerald-300 uppercase tracking-wide">
            CỔNG KIỂM SOÁT KÍCH THƯỚC FILE IN (RULE 35 GATEKEEPER):
          </div>
          <p>
            Mọi file trong gói ZIP bắt buộc tuân thủ kích thước <strong>500 × 300 mm</strong>. Nếu phát hiện 530 × 300 mm hoặc chứa phần nẹp 30mm trong artwork in, hệ thống sẽ <strong>chặn ngay lập tức (EXPORT FAILED)</strong> để tránh lãng phí vật tư sản xuất.
          </p>
        </div>
      </div>

      {/* Export Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Settings & Formats */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              1. Cấu Hình Lô &amp; Định Dạng Xuất File
            </h3>

            {/* Target Batch Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Chọn Lô Sản Xuất Cần Xuất:
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-blue-500"
              >
                <option value="ALL">Toàn bộ dự án ({signs.length} biển)</option>
                {batchSummaries.map((b) => (
                  <option key={b.batchName} value={b.batchName}>
                    {b.batchName} ({b.startIndex} - {b.endIndex}, {b.total} biển)
                  </option>
                ))}
              </select>
            </div>

            {/* Checkbox formats */}
            <div className="space-y-2.5 pt-2">
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Các Định Dạng Đưa Vào File ZIP (Artwork 500 × 300 mm):
              </label>

              {/* SVG */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={includeSvg}
                  onChange={(e) => setIncludeSvg(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <div className="flex-1">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-emerald-400" />
                    <span>File Vector SVG (width="500mm" height="300mm")</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    File vector nguyên bản dùng cho máy cắt laser/CNC hoặc phần mềm in ấn
                  </div>
                </div>
              </label>

              {/* PDF */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={includePdf}
                  onChange={(e) => setIncludePdf(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <div className="flex-1">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-rose-400" />
                    <span>File PDF Chuẩn In (500 × 300 mm / page)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Trang chuẩn 500x300mm. Không co dãn, không fit to A4/Letter.
                  </div>
                </div>
              </label>

              {/* PNG */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={includePng}
                  onChange={(e) => setIncludePng(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-0"
                />
                <div className="flex-1">
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <FileImage className="w-3.5 h-3.5 text-blue-400" />
                    <span>File Ảnh PNG Chất Lượng Cao (500 × 300 mm)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Độ phân giải siêu sắc nét phục vụ duyệt hình và in UV
                  </div>
                </div>
              </label>

              {/* DPI Option */}
              {includePng && (
                <div className="ml-7 flex items-center gap-3 text-xs">
                  <span className="text-slate-400 font-bold">Độ phân giải PNG:</span>
                  <label className="flex items-center gap-1 cursor-pointer text-slate-200">
                    <input
                      type="radio"
                      name="dpi"
                      checked={dpi === 600}
                      onChange={() => setDpi(600)}
                    />
                    <span className="font-bold text-emerald-400">600 DPI (Khuyên dùng in ấn)</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer text-slate-200">
                    <input
                      type="radio"
                      name="dpi"
                      checked={dpi === 300}
                      onChange={() => setDpi(300)}
                    />
                    <span>300 DPI</span>
                  </label>
                </div>
              )}

              {/* Include Assembly View Checkbox (Rule 23 & 27) */}
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 pt-3 border-t border-slate-800">
                <input
                  type="checkbox"
                  checked={includeAssembly}
                  onChange={(e) => setIncludeAssembly(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-0"
                />
                <div className="flex-1">
                  <div className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Kèm Thư Mục Bản Vẽ Lắp Ghép (Assembly 530 × 300 mm)</span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Chỉ đưa vào thư mục riêng 'ASSEMBLY_VIEW_530x300mm' phục vụ nghiệm thu
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right Form: Progress & Actions (Rule 31: Resume) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              2. Trạng Thái Tiến Trình &amp; Điều Khiển Xuất
            </h3>

            {/* Resume Tracker Box (Rule 31) */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Đã hoàn thành lượt trước:</span>
                <span className="font-mono font-bold text-white">
                  {completedIds.length} / {targetSigns.length} biển
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{
                    width: `${targetSigns.length > 0 ? (completedIds.length / targetSigns.length) * 100 : 0}%`,
                  }}
                  className="bg-emerald-500 transition-all duration-300"
                />
              </div>

              {progress?.isRunning && (
                <div className="text-[11px] text-slate-400 flex items-center justify-between animate-pulse">
                  <span>Đang xuất biển: <strong className="text-white">{progress.currentSignName}</strong></span>
                  <span className="font-mono text-emerald-400 font-bold">
                    {progress.current} / {progress.total}
                  </span>
                </div>
              )}

              {completedIds.length > 0 && completedIds.length < targetSigns.length && (
                <div className="text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded border border-amber-500/30">
                  ⚡ <strong>Hỗ trợ Tiếp tục (Resume):</strong> Nếu nhấn "Tiếp Tục Xuất ZIP", hệ thống sẽ tự động bỏ qua {completedIds.length} biển đã tạo và tiếp tục xuất các biển còn lại!
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="space-y-2 pt-2">
              {!progress?.isRunning ? (
                <button
                  type="button"
                  onClick={handleStartExport}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-sm py-3 rounded-lg shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  <span>
                    {completedIds.length > 0 && completedIds.length < targetSigns.length
                      ? `Tiếp Tục Xuất ZIP (Từ biển ${completedIds.length + 1})`
                      : `Bắt Đầu Xuất File ZIP (${targetSigns.length} Biển)`}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handlePauseExport}
                  className="w-full bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-sm py-3 rounded-lg shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Pause className="w-4 h-4" />
                  <span>Tạm Dừng Tiến Trình (Pause)</span>
                </button>
              )}

              {completedIds.length > 0 && !progress?.isRunning && (
                <button
                  type="button"
                  onClick={handleResetExportProgress}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Đặt Lại Tiến Trình (Xuất Mới Từ Đầu)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
