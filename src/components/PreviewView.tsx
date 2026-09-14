import React, { useState } from 'react';
import {
  Eye,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Download,
  FileCode,
  FileImage,
  FileText,
  Layers,
  ZoomIn,
  ZoomOut,
  Maximize2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import { SignItem, ViewMode, MasterConfig } from '../types';
import { generateMasterArtworkSvg, generateAssemblyViewSvg } from '../utils/masterSvg';
import { exportSingleSvg, exportSinglePdf, exportSinglePng, exportAssemblyDrawing } from '../utils/exportUtils';
import { fitRoadName } from '../utils/fitRoadName';

interface PreviewViewProps {
  signs: SignItem[];
  selectedSign: SignItem | null;
  onSelectSign: (sign: SignItem) => void;
  masterConfig: MasterConfig;
}

export const PreviewView: React.FC<PreviewViewProps> = ({
  signs,
  selectedSign,
  onSelectSign,
  masterConfig,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('ARTWORK');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [testRoadName, setTestRoadName] = useState<string>('');

  // Lấy biển đang chọn, nếu không có thì lấy biển đầu tiên
  const currentSign = selectedSign || signs[0] || {
    id: 'sample_01',
    stt: '001',
    maBien: 'DX.813',
    tenDuong: 'DX.813',
    batch: 'BATCH 01',
    artworkWidth: 500,
    artworkHeight: 300,
    assemblyWidth: 530,
    assemblyHeight: 300,
    trimWidth: 30,
    trimHeight: 300,
    fontSize: 78,
    textWidth: 320,
    textHeight: 60,
    status: 'QC_PASSED',
    fitStatus: 'OK',
    qcErrors: [],
    qcWarnings: [],
    exportedFiles: {},
  };

  const currentIndex = signs.findIndex((s) => s.id === currentSign.id);

  const handleNext = () => {
    if (currentIndex < signs.length - 1) {
      onSelectSign(signs[currentIndex + 1]);
      setTestRoadName('');
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      onSelectSign(signs[currentIndex - 1]);
      setTestRoadName('');
    }
  };

  // Tính toán thực tế
  const activeRoadName = testRoadName !== '' ? testRoadName : currentSign.tenDuong;
  const activeSignItem: SignItem = {
    ...currentSign,
    tenDuong: activeRoadName,
  };

  const fitResult = fitRoadName(
    activeRoadName,
    masterConfig.availableWidth,
    masterConfig.targetRoadNameHeight,
    masterConfig.minRoadNameHeight
  );

  const artworkSvg = generateMasterArtworkSvg(activeSignItem, masterConfig);
  const assemblySvg = generateAssemblyViewSvg(activeSignItem, masterConfig);

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Controls: Mode Switcher & Quick Navigation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Dual Mode Switcher (Rule 18) */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase mr-1">Chế Độ Xem:</span>
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setViewMode('ARTWORK')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'ARTWORK'
                  ? 'bg-blue-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>MODE 1: ARTWORK VIEW (500 × 300 mm)</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('ASSEMBLY')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'ASSEMBLY'
                  ? 'bg-amber-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>MODE 2: ASSEMBLY VIEW (530 × 300 mm)</span>
            </button>
          </div>
        </div>

        {/* Quick Sign Browser (Prev/Next/Jump) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={currentIndex <= 0}
            onClick={handlePrev}
            className="px-2.5 py-1.5 rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Biển Trước</span>
          </button>

          <div className="bg-slate-950 border border-slate-800 px-3 py-1 rounded text-center">
            <span className="text-xs font-mono font-bold text-white">
              STT: {currentSign.stt}
            </span>
            <span className="text-xs text-slate-400 mx-1.5">|</span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {currentSign.maBien}
            </span>
            <span className="text-[11px] text-slate-500 ml-1.5">
              ({currentIndex + 1}/{signs.length})
            </span>
          </div>

          <button
            type="button"
            disabled={currentIndex >= signs.length - 1}
            onClick={handleNext}
            className="px-2.5 py-1.5 rounded bg-slate-800 text-white hover:bg-slate-700 disabled:opacity-40 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
          >
            <span className="hidden sm:inline">Biển Sau</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Preview Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Stage: Canvas Area */}
        <div className="lg:col-span-8 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-6 shadow-sm flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden">
            {/* Dimension Indicator Banner */}
            <div className="w-full flex items-center justify-between text-xs text-slate-400 pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">Đang hiển thị:</span>
                {viewMode === 'ARTWORK' ? (
                  <span className="text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Mặt Biển In: 500 × 300 mm (KHÔNG CÓ NẸP)
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                    Cụm Lắp Ghép: 530 × 300 mm (Nẹp 30mm + Mặt biển 500mm)
                  </span>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 10))}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] text-slate-300 w-10 text-center">
                  {zoomLevel}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(200, z + 10))}
                  className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                  title="Phóng to"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(100)}
                  className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                >
                  100%
                </button>
              </div>
            </div>

            {/* SVG Render Box with precise aspect ratio */}
            <div
              style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'center center' }}
              className="transition-transform duration-200 flex items-center justify-center max-w-full"
            >
              {viewMode === 'ARTWORK' ? (
                <div
                  className="w-[500px] h-[300px] max-w-full drop-shadow-2xl rounded-sm overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:max-w-full [&>svg]:max-h-full"
                  dangerouslySetInnerHTML={{ __html: artworkSvg }}
                />
              ) : (
                <div
                  className="w-[530px] h-[300px] max-w-full drop-shadow-2xl rounded-sm overflow-hidden [&>svg]:w-full [&>svg]:h-full [&>svg]:block [&>svg]:max-w-full [&>svg]:max-h-full"
                  dangerouslySetInnerHTML={{ __html: assemblySvg }}
                />
              )}
            </div>

            {/* Dimension Rules Note at bottom */}
            <div className="mt-4 text-[11px] text-slate-400 text-center">
              {viewMode === 'ARTWORK' ? (
                <span>
                  ✓ File in ấn thực tế đạt chuẩn <strong>500 × 300 mm</strong>. Tuyệt đối không chứa dải nẹp xám.
                </span>
              ) : (
                <span className="text-amber-300">
                  ⚠️ Bản vẽ lắp ghép <strong>530 × 300 mm</strong> chỉ dùng minh họa kỹ thuật, kiểm tra kết cấu cơ khí. Không đưa vào file in artwork.
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Stage: Auto-Fit Inspector & Single Export Center */}
        <div className="lg:col-span-4 space-y-4">
          {/* 1. Auto-Fit Inspector (Rule 11) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Kiểm Soát Auto-Fit Tên Đường</span>
              {fitResult.status === 'OK' && (
                <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Chuẩn 60mm
                </span>
              )}
              {fitResult.status === 'SCALED' && (
                <span className="text-amber-400 font-bold text-[11px] flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Co Tỷ Lệ
                </span>
              )}
              {fitResult.status === 'TOO_LONG' && (
                <span className="text-rose-400 font-bold text-[11px] flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" /> Quá Dài
                </span>
              )}
            </h3>

            {/* Live Testing Input */}
            <div>
              <label className="block text-[11px] text-slate-400 font-bold mb-1">
                Thử nhanh tên đường khác trên biển này:
              </label>
              <input
                type="text"
                value={testRoadName}
                onChange={(e) => setTestRoadName(e.target.value)}
                placeholder={currentSign.tenDuong}
                className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-lg px-2.5 py-1.5 uppercase focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Metric Details */}
            <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Chiều cao chữ:</span>
                <span className="font-mono font-bold text-white">{fitResult.textHeight} mm (mục tiêu 60mm)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Chiều rộng đo được:</span>
                <span className="font-mono font-bold text-white">{fitResult.textWidth} mm / max 440mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Font size SVG:</span>
                <span className="font-mono font-bold text-slate-300">{fitResult.fontSize} px</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tỷ lệ co dãn:</span>
                <span className="font-mono font-bold text-slate-300">{Math.round(fitResult.scaleRatio * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Biến dạng chữ:</span>
                <span className="font-bold text-emerald-400">KHÔNG (scaleX = scaleY)</span>
              </div>
            </div>
          </div>

          {/* 2. Single Sign Export Center */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Tải Xuất Riêng Biển #{currentSign.stt}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => exportSingleSvg(activeSignItem, masterConfig)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 transition cursor-pointer text-xs font-bold"
              >
                <FileCode className="w-4 h-4 text-emerald-400" />
                <span>SVG (500×300)</span>
              </button>

              <button
                type="button"
                onClick={() => exportSinglePdf(activeSignItem, masterConfig)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 transition cursor-pointer text-xs font-bold"
              >
                <FileText className="w-4 h-4 text-rose-400" />
                <span>PDF (500×300)</span>
              </button>

              <button
                type="button"
                onClick={() => exportSinglePng(activeSignItem, masterConfig, 300)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 transition cursor-pointer text-xs font-bold"
              >
                <FileImage className="w-4 h-4 text-cyan-400" />
                <span>PNG (300 DPI)</span>
              </button>

              <button
                type="button"
                onClick={() => exportSinglePng(activeSignItem, masterConfig, 600)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1 transition cursor-pointer text-xs font-bold"
              >
                <FileImage className="w-4 h-4 text-blue-400" />
                <span>PNG (600 DPI)</span>
              </button>
            </div>

            {/* Assembly Drawing Export Option (Rule 23) */}
            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => exportAssemblyDrawing(activeSignItem, masterConfig)}
                className="w-full bg-slate-950 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-lg p-2 flex items-center justify-center gap-1.5 transition cursor-pointer text-xs font-bold"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Xuất Bản Vẽ Lắp Ráp Assembly (530×300 mm)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
