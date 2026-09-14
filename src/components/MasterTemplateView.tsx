import React, { useState, useRef } from 'react';
import {
  Lock,
  Unlock,
  ShieldCheck,
  Code,
  Copy,
  Check,
  AlertTriangle,
  RotateCcw,
  Palette,
  Sliders,
  Type,
  Upload,
  Image as ImageIcon,
  Sparkles,
  Layers,
  Eye,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Ruler,
  Compass,
  CheckCircle2,
  HelpCircle,
  Crosshair,
  Move,
  MapPin,
} from 'lucide-react';
import { MasterConfig, ARTWORK_WIDTH, ARTWORK_HEIGHT, TOTAL_WIDTH, TOTAL_HEIGHT, MOUNTING_TRIM_WIDTH } from '../types';
import { generateMasterArtworkSvg, generateAssemblyViewSvg, DEFAULT_MASTER_CONFIG } from '../utils/masterSvg';

interface MasterTemplateViewProps {
  config: MasterConfig;
  onUpdateConfig: (newConfig: MasterConfig) => void;
}

export const FONT_OPTIONS = [
  {
    id: 'montserrat',
    label: 'Montserrat (Mặc định Master V4.0)',
    family: 'Montserrat, Arial, sans-serif',
    previewName: 'Montserrat',
    desc: 'Đậm nét, tròn đầy hình học, thẩm mỹ cao nhất cho biển tên đường',
    badge: 'Chuẩn V4.0',
  },
  {
    id: 'be-vietnam-pro',
    label: 'Be Vietnam Pro (Việt Hóa Quốc Gia)',
    family: 'Be Vietnam Pro, sans-serif',
    previewName: 'Be Vietnam Pro',
    desc: 'Thiết kế tối ưu tuyệt đối cho hệ thống dấu thanh Tiếng Việt, sắc nét',
    badge: 'Việt Hóa',
  },
  {
    id: 'arial',
    label: 'Arial / Arial Black (QCVN 41:2019)',
    family: 'Arial, "Helvetica Neue", sans-serif',
    previewName: 'Arial Bold',
    desc: 'Tiêu chuẩn truyền thống QCVN 41:2019 của Bộ Giao thông Vận tải',
    badge: 'QCVN 41',
  },
  {
    id: 'roboto',
    label: 'Roboto / Roboto Condensed',
    family: 'Roboto, Arial, sans-serif',
    previewName: 'Roboto',
    desc: 'Hiện đại, độ tương phản cao, tối ưu rất tốt khi tên đường nhiều chữ',
    badge: 'Hiện Đại',
  },
  {
    id: 'oswald',
    label: 'Oswald (Font cô đọng Condensed)',
    family: 'Oswald, sans-serif',
    previewName: 'Oswald',
    desc: 'Font chữ cao hẹp, giải pháp hoàn hảo cho tên đường dài vượt khung',
    badge: 'Tên Dài',
  },
  {
    id: 'bahnschrift',
    label: 'Bahnschrift / DIN 1451',
    family: 'Bahnschrift, "DIN Alternate", "Arial Narrow", sans-serif',
    previewName: 'Bahnschrift / DIN',
    desc: 'Chuẩn biển chỉ dẫn giao thông đường cao tốc quốc tế (DIN 1451)',
    badge: 'DIN Quốc Tế',
  },
  {
    id: 'lexend',
    label: 'Lexend Deca',
    family: 'Lexend, sans-serif',
    previewName: 'Lexend',
    desc: 'Tối ưu khoa học giúp người lái xe nhận diện nhanh từ khoảng cách xa',
    badge: 'Đọc Xa',
  },
];

export const MasterTemplateView: React.FC<MasterTemplateViewProps> = ({
  config,
  onUpdateConfig,
}) => {
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [sampleRoadName, setSampleRoadName] = useState('DX.813');
  const [previewMode, setPreviewMode] = useState<'ARTWORK' | 'ASSEMBLY'>('ARTWORK');
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showRulers, setShowRulers] = useState<boolean>(true);
  const [showSafeGuide, setShowSafeGuide] = useState<boolean>(true);
  const [showCoordinatesGuide, setShowCoordinatesGuide] = useState<boolean>(true);
  const [customTitleFontMode, setCustomTitleFontMode] = useState(false);
  const [customRoadFontMode, setCustomRoadFontMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const logoX = config.logoX ?? 110;
  const logoY = config.logoY ?? 96;
  const logoSize = config.logoSize ?? 76;
  const titleX = config.titleX ?? 330;
  const titleY = config.titleY ?? 126;
  const roadNameX = config.roadNameX ?? 250;
  const roadNameY = config.roadNameY ?? 230;

  const handleResetPositions = () => {
    onUpdateConfig({
      ...config,
      logoX: 110,
      logoY: 96,
      logoSize: 76,
      titleX: 330,
      titleY: 126,
      roadNameX: 250,
      roadNameY: 230,
    });
  };

  const adjustVal = (key: keyof MasterConfig, delta: number, min: number, max: number, defaultVal: number) => {
    const cur = Number(config[key] ?? defaultVal);
    const next = Math.max(min, Math.min(max, Math.round((cur + delta) * 10) / 10));
    onUpdateConfig({ ...config, [key]: next });
  };

  const artworkSvg = generateMasterArtworkSvg({ tenDuong: sampleRoadName, maBien: 'DX.813' }, config);
  const assemblySvg = generateAssemblyViewSvg({ tenDuong: sampleRoadName, maBien: 'DX.813' }, config);

  const currentSvg = previewMode === 'ARTWORK' ? artworkSvg : assemblySvg;

  const handleCopySvg = () => {
    navigator.clipboard.writeText(currentSvg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleLock = () => {
    onUpdateConfig({ ...config, isLocked: !config.isLocked });
  };

  const handleResetDefault = () => {
    onUpdateConfig({ ...DEFAULT_MASTER_CONFIG, isLocked: false });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        onUpdateConfig({ ...config, customLogoUrl: dataUrl });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomLogo = () => {
    onUpdateConfig({ ...config, customLogoUrl: undefined });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSyncFonts = () => {
    onUpdateConfig({
      ...config,
      roadNameFont: config.titleFont,
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* 1. Trạng Thái Khóa / Mở Khóa Mẫu Master */}
      <div
        className={`rounded-xl p-5 border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          config.isLocked
            ? 'bg-slate-900 border-amber-500/40 text-white'
            : 'bg-emerald-950/30 border-emerald-500/60 text-white'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-3 rounded-lg ${
              config.isLocked ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {config.isLocked ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black uppercase tracking-tight">
                MASTER ARTWORK TEMPLATE: {config.templateVersion}
              </h2>
              <span
                className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider ${
                  config.isLocked
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-emerald-500 text-slate-950 shadow-sm'
                }`}
              >
                {config.isLocked ? 'LOCKED (ĐÃ KHÓA BẢO VỆ)' : 'UNLOCKED (ĐÃ MỞ KHÓA)'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {config.isLocked
                ? 'Khi ở trạng thái LOCKED, các thành phần: Nền xanh, Khung trắng, Logo xã, Font chữ, Tỷ lệ và Vị trí TUYỆT ĐỐI KHÔNG ĐƯỢC THAY ĐỔI. Thành phần DUY NHẤT thay đổi giữa các biển là TÊN ĐƯỜNG.'
                : 'Trạng thái MỞ KHÓA đang hoạt động. Bạn có thể tự do hiệu chỉnh Font chữ Tiêu đề & Tên đường, màu sắc, viền khuyết góc hoặc tải lên logo mới trước khi sản xuất hàng loạt.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleLock}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-md ${
              config.isLocked
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/50'
            }`}
          >
            {config.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{config.isLocked ? 'Mở Khóa Mẫu Thiết Kế' : 'Khóa Bảo Vệ Lại'}</span>
          </button>
        </div>
      </div>

      {/* 2. Cảnh báo Logo (Rule 8) */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 text-amber-200 text-xs sm:text-sm">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="font-extrabold uppercase tracking-wide text-amber-300">
            QUY ĐỊNH VỀ LOGO BIỂU TƯỢNG XÃ HẢI LĂNG (RULE 8):
          </div>
          <p>
            Hệ thống đang hiển thị Logo vector chuẩn hóa Hải Lăng. Khi mở khóa, bạn có thể tải lên file vector SVG hoặc ảnh độ nét cao để thay thế.
          </p>
          <div className="inline-block bg-amber-950/80 px-2.5 py-1 rounded font-bold text-amber-300 border border-amber-600/40 mt-1">
            “LOGO CẦN THAY BẰNG FILE VECTOR GỐC TRƯỚC KHI SẢN XUẤT ĐẠI TRÀ.”
          </div>
        </div>
      </div>

      {/* 3. Grid: Master Controls & Master Live Preview Vừa Khung In */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Cột trái: Bảng điều khiển Master khi Mở khóa / Thông số chuẩn khi Khóa */}
        <div className="lg:col-span-5 space-y-4">
          {!config.isLocked ? (
            /* BẢNG ĐIỀU KHIỂN CHỈNH SỬA KHI MỞ KHÓA */
            <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-5 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-extrabold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Sliders className="w-4 h-4" />
                  Tùy Chỉnh Master Template (Đang Mở Khóa)
                </h3>
                <button
                  type="button"
                  onClick={handleResetDefault}
                  title="Khôi phục thông số Master chuẩn V4.0 Hải Lăng"
                  className="text-xs font-bold text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-800 border border-slate-700 flex items-center gap-1 cursor-pointer transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Khôi Phục V4.0</span>
                </button>
              </div>

              {/* PHẦN A: TÙY CHỌN FONT TIÊU ĐỀ & TÊN ĐƯỜNG (Typography) */}
              <div className="space-y-4 pb-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Type className="w-4 h-4 text-cyan-400" />
                    <span>Tùy Chọn Font Chữ Biển Báo</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleSyncFonts}
                    title="Sao chép font tiêu đề sang font tên đường để đồng bộ"
                    className="text-[11px] text-cyan-300 hover:text-cyan-200 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded cursor-pointer transition"
                  >
                    Dùng chung 1 Font
                  </button>
                </div>

                {/* 1. Font Tiêu Đề */}
                <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">1. Font Tiêu Đề Cố Định ("{config.titleText}"):</span>
                    <button
                      type="button"
                      onClick={() => setCustomTitleFontMode(!customTitleFontMode)}
                      className="text-[10px] text-blue-400 hover:underline cursor-pointer"
                    >
                      {customTitleFontMode ? 'Chọn từ danh sách' : 'Nhập font tùy ý'}
                    </button>
                  </div>

                  {!customTitleFontMode ? (
                    <select
                      value={config.titleFont}
                      onChange={(e) => onUpdateConfig({ ...config, titleFont: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-2 font-bold cursor-pointer focus:border-cyan-500 focus:outline-none"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.id} value={f.family}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={config.titleFont}
                      onChange={(e) => onUpdateConfig({ ...config, titleFont: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded-lg px-2.5 py-1.5"
                      placeholder="e.g. 'Montserrat', Arial, sans-serif"
                    />
                  )}

                  {/* Font Sample Preview */}
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Hiển thị mẫu:</span>
                    <span
                      style={{ fontFamily: config.titleFont }}
                      className="font-black text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40 uppercase"
                    >
                      {config.titleText || 'ĐƯỜNG'}
                    </span>
                  </div>
                </div>

                {/* 2. Font Tên Đường */}
                <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">2. Font Tên Đường ("{sampleRoadName}"):</span>
                    <button
                      type="button"
                      onClick={() => setCustomRoadFontMode(!customRoadFontMode)}
                      className="text-[10px] text-blue-400 hover:underline cursor-pointer"
                    >
                      {customRoadFontMode ? 'Chọn từ danh sách' : 'Nhập font tùy ý'}
                    </button>
                  </div>

                  {!customRoadFontMode ? (
                    <select
                      value={config.roadNameFont}
                      onChange={(e) => onUpdateConfig({ ...config, roadNameFont: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-2 font-bold cursor-pointer focus:border-cyan-500 focus:outline-none"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option key={f.id} value={f.family}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={config.roadNameFont}
                      onChange={(e) => onUpdateConfig({ ...config, roadNameFont: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded-lg px-2.5 py-1.5"
                      placeholder="e.g. 'Montserrat', Arial, sans-serif"
                    />
                  )}

                  {/* Font Sample Preview */}
                  <div className="pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Hiển thị mẫu:</span>
                    <span
                      style={{ fontFamily: config.roadNameFont }}
                      className="font-black text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40 uppercase"
                    >
                      {sampleRoadName || 'DX.813'}
                    </span>
                  </div>
                </div>
              </div>

              {/* PHẦN B: Màu nền biển */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-blue-400" />
                  <span>Màu Nền Biển (Background Color):</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={config.backgroundColor}
                    onChange={(e) => onUpdateConfig({ ...config, backgroundColor: e.target.value })}
                    className="w-10 h-10 rounded border border-slate-700 cursor-pointer bg-transparent"
                  />
                  <input
                    type="text"
                    value={config.backgroundColor}
                    onChange={(e) => onUpdateConfig({ ...config, backgroundColor: e.target.value })}
                    className="flex-1 bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-lg px-3 py-2 uppercase"
                  />
                </div>
                {/* Màu mẫu nhanh */}
                <div className="flex items-center gap-2 pt-1 flex-wrap">
                  <span className="text-[11px] text-slate-400">Gợi ý:</span>
                  {[
                    { label: 'Navy V4.0', color: '#00479e' },
                    { label: 'Xanh Đậm', color: '#003366' },
                    { label: 'Xanh Lá', color: '#006633' },
                    { label: 'Xám Đen', color: '#1e293b' },
                  ].map((p) => (
                    <button
                      key={p.color}
                      type="button"
                      onClick={() => onUpdateConfig({ ...config, backgroundColor: p.color })}
                      className="text-[11px] px-2 py-0.5 rounded border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer flex items-center gap-1"
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* PHẦN C: Khung viền nghệ thuật khuyết góc */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Khung Viền Nghệ Thuật Khuyết 4 Góc:</span>
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">Màu viền:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.borderColor}
                        onChange={(e) => onUpdateConfig({ ...config, borderColor: e.target.value })}
                        className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent"
                      />
                      <span className="font-mono text-xs text-white">{config.borderColor}</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">Độ thụt lề (mm):</span>
                    <input
                      type="number"
                      value={config.borderInset}
                      onChange={(e) => onUpdateConfig({ ...config, borderInset: Number(e.target.value) || 13 })}
                      className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">Độ dày viền (mm):</span>
                    <input
                      type="number"
                      step="0.5"
                      value={config.borderThickness}
                      onChange={(e) => onUpdateConfig({ ...config, borderThickness: Number(e.target.value) || 3.5 })}
                      className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">Bo khuyết góc (r mm):</span>
                    <input
                      type="number"
                      value={config.cornerNotchRadius}
                      onChange={(e) => onUpdateConfig({ ...config, cornerNotchRadius: Number(e.target.value) || 16 })}
                      className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN D: Tiêu đề cố định & kích thước */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Nội Dung Tiêu Đề Cố Định:</span>
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">Nội dung chữ:</span>
                    <input
                      type="text"
                      value={config.titleText}
                      onChange={(e) => onUpdateConfig({ ...config, titleText: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-lg px-2.5 py-1.5 uppercase"
                      placeholder="ĐƯỜNG, PHỐ..."
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">Chiều cao chữ (mm):</span>
                    <input
                      type="number"
                      value={config.titleHeight || 48}
                      onChange={(e) => onUpdateConfig({ ...config, titleHeight: Number(e.target.value) || 48 })}
                      className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN E: Dung sai Tên đường */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Quy Chuẩn Co Chữ Tên Đường (mm):</span>
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">Mục tiêu (Target):</span>
                    <input
                      type="number"
                      value={config.targetRoadNameHeight}
                      onChange={(e) => onUpdateConfig({ ...config, targetRoadNameHeight: Number(e.target.value) || 60 })}
                      className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block mb-1">Tối thiểu (Min):</span>
                    <input
                      type="number"
                      value={config.minRoadNameHeight}
                      onChange={(e) => onUpdateConfig({ ...config, minRoadNameHeight: Number(e.target.value) || 32 })}
                      className="w-full bg-slate-950 border border-slate-700 text-white font-mono text-xs rounded-lg px-2.5 py-1.5"
                    />
                  </div>
                </div>
              </div>

              {/* PHẦN F: Logo Xã / Biểu trưng */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-rose-400" />
                    <span>Logo Biểu Tượng:</span>
                  </span>
                  {config.customLogoUrl && (
                    <button
                      type="button"
                      onClick={handleRemoveCustomLogo}
                      className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                    >
                      Dùng lại logo Hải Lăng
                    </button>
                  )}
                </label>

                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-white">
                      {config.customLogoUrl ? 'Logo tùy chỉnh đang dùng' : 'Logo Vector chuẩn Xã Hải Lăng'}
                    </div>
                    <div className="text-[11px] text-slate-400">Hỗ trợ định dạng SVG, PNG trong suốt</div>
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/png,image/svg+xml,image/jpeg"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow transition"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{config.customLogoUrl ? 'Đổi Logo' : 'Tải Logo Mới'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* PHẦN G: TÙY CHỈNH VỊ TRÍ TỌA ĐỘ (LOGO, TIÊU ĐỀ, TÊN ĐƯỜNG) */}
              <div className="space-y-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Crosshair className="w-4 h-4 text-rose-400" />
                    <span>Tùy Chỉnh Vị Trí Chữ Tiêu Đề, Logo, Tên Đường</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleResetPositions}
                    title="Khôi phục toàn bộ tọa độ vị trí chuẩn"
                    className="text-[11px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 px-2 py-0.5 rounded cursor-pointer transition flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Vị trí chuẩn</span>
                  </button>
                </div>

                {/* 1. Vị trí Logo */}
                <div className="bg-slate-950/90 p-3 rounded-lg border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>1. Vị Trí &amp; Kích Thước Logo Xã</span>
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                      X={logoX}mm, Y={logoY}mm, ⌀={logoSize}mm
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                        <span>Tọa độ X (mm):</span>
                        <span className="font-mono text-cyan-300 font-bold">{logoX}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={logoX}
                          onChange={(e) => onUpdateConfig({ ...config, logoX: Number(e.target.value) || 110 })}
                          className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded px-2 py-1"
                        />
                        <div className="flex gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => adjustVal('logoX', -5, 30, 470, 110)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                            title="-5mm"
                          >-5</button>
                          <button
                            type="button"
                            onClick={() => adjustVal('logoX', 5, 30, 470, 110)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                            title="+5mm"
                          >+5</button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                        <span>Tọa độ Y (mm):</span>
                        <span className="font-mono text-cyan-300 font-bold">{logoY}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={logoY}
                          onChange={(e) => onUpdateConfig({ ...config, logoY: Number(e.target.value) || 96 })}
                          className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded px-2 py-1"
                        />
                        <div className="flex gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => adjustVal('logoY', -5, 30, 270, 96)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                            title="-5mm"
                          >-5</button>
                          <button
                            type="button"
                            onClick={() => adjustVal('logoY', 5, 30, 270, 96)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                            title="+5mm"
                          >+5</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Logo Size */}
                  <div className="text-xs pt-1">
                    <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                      <span>Đường kính Logo (mm) [Bán kính r = {(logoSize / 2).toFixed(1)}mm]:</span>
                      <span className="font-mono text-cyan-300 font-bold">{logoSize}mm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="40"
                        max="130"
                        step="2"
                        value={logoSize}
                        onChange={(e) => onUpdateConfig({ ...config, logoSize: Number(e.target.value) })}
                        className="flex-1 accent-cyan-400 cursor-pointer"
                      />
                      <input
                        type="number"
                        value={logoSize}
                        onChange={(e) => onUpdateConfig({ ...config, logoSize: Number(e.target.value) || 76 })}
                        className="w-16 bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded px-2 py-1 text-center"
                      />
                    </div>
                  </div>

                  {/* Presets Logo */}
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Vị trí mẫu:</span>
                    {[
                      { label: 'Chuẩn V4.0 (110, 96, 76)', x: 110, y: 96, s: 76 },
                      { label: 'Giữa đỉnh (250, 85, 76)', x: 250, y: 85, s: 76 },
                      { label: 'Góc trái lùi (95, 85, 68)', x: 95, y: 85, s: 68 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => onUpdateConfig({ ...config, logoX: p.x, logoY: p.y, logoSize: p.s })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Vị trí Tiêu Đề */}
                <div className="bg-slate-950/90 p-3 rounded-lg border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Type className="w-3.5 h-3.5 text-amber-400" />
                      <span>2. Vị Trí Chữ Tiêu Đề ("{config.titleText}")</span>
                    </span>
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40">
                      X={titleX}mm, Y={titleY}mm, H={config.titleHeight || 48}mm
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                        <span>Tọa độ X (mm):</span>
                        <span className="font-mono text-amber-300 font-bold">{titleX}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={titleX}
                          onChange={(e) => onUpdateConfig({ ...config, titleX: Number(e.target.value) || 330 })}
                          className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded px-2 py-1"
                        />
                        <div className="flex gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => adjustVal('titleX', -5, 50, 460, 330)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                            title="-5mm"
                          >-5</button>
                          <button
                            type="button"
                            onClick={() => adjustVal('titleX', 5, 50, 460, 330)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                            title="+5mm"
                          >+5</button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                        <span>Tọa độ Y (mm):</span>
                        <span className="font-mono text-amber-300 font-bold">{titleY}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={titleY}
                          onChange={(e) => onUpdateConfig({ ...config, titleY: Number(e.target.value) || 126 })}
                          className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded px-2 py-1"
                        />
                        <div className="flex gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => adjustVal('titleY', -5, 40, 260, 126)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                            title="-5mm"
                          >-5</button>
                          <button
                            type="button"
                            onClick={() => adjustVal('titleY', 5, 40, 260, 126)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                            title="+5mm"
                          >+5</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Presets Tiêu đề */}
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Vị trí mẫu:</span>
                    {[
                      { label: 'Phải Logo chuẩn (330, 126)', x: 330, y: 126 },
                      { label: 'Căn giữa biển (250, 115)', x: 250, y: 115 },
                      { label: 'Nâng cao hơn (330, 112)', x: 330, y: 112 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => onUpdateConfig({ ...config, titleX: p.x, titleY: p.y })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Vị trí Tên Đường */}
                <div className="bg-slate-950/90 p-3 rounded-lg border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Move className="w-3.5 h-3.5 text-emerald-400" />
                      <span>3. Vị Trí Tên Đường (ROAD_NAME)</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                      Tâm X={roadNameX}mm, Tâm Y={roadNameY}mm
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                        <span>Tọa độ tâm ngang X (mm):</span>
                        <span className="font-mono text-emerald-300 font-bold">{roadNameX}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={roadNameX}
                          onChange={(e) => onUpdateConfig({ ...config, roadNameX: Number(e.target.value) || 250 })}
                          className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded px-2 py-1"
                        />
                        <div className="flex gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => adjustVal('roadNameX', -5, 50, 450, 250)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                            title="-5mm"
                          >-5</button>
                          <button
                            type="button"
                            onClick={() => adjustVal('roadNameX', 5, 50, 450, 250)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                            title="+5mm"
                          >+5</button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-400 text-[11px] mb-1">
                        <span>Tọa độ tâm dọc Y (mm):</span>
                        <span className="font-mono text-emerald-300 font-bold">{roadNameY}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={roadNameY}
                          onChange={(e) => onUpdateConfig({ ...config, roadNameY: Number(e.target.value) || 230 })}
                          className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded px-2 py-1"
                        />
                        <div className="flex gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => adjustVal('roadNameY', -5, 120, 280, 230)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                            title="-5mm"
                          >-5</button>
                          <button
                            type="button"
                            onClick={() => adjustVal('roadNameY', 5, 120, 280, 230)}
                            className="px-1.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[10px] font-bold"
                            title="+5mm"
                          >+5</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Presets Tên đường */}
                  <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Vị trí mẫu:</span>
                    {[
                      { label: 'Căn giữa chuẩn (250, 230)', x: 250, y: 230 },
                      { label: 'Nâng cao lên (250, 218)', x: 250, y: 218 },
                      { label: 'Hạ thấp xuống (250, 240)', x: 250, y: 240 },
                    ].map((p) => (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => onUpdateConfig({ ...config, roadNameX: p.x, roadNameY: p.y })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* BẢNG THÔNG SỐ CỐ ĐỊNH KHI ĐANG KHÓA (LOCKED) */
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Thông Số Cấu Trúc Master Chuẩn
                </h3>
                <button
                  type="button"
                  onClick={handleToggleLock}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 flex items-center gap-1 cursor-pointer"
                >
                  <Unlock className="w-3 h-3" />
                  <span>Mở Khóa Để Sửa Font, Vị Trí &amp; Quy Chuẩn</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {/* Font Spec */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-400 uppercase text-[11px]">1. Quy Chuẩn Font Chữ</div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Font Tiêu Đề:</span>
                    <span className="font-bold text-cyan-300 truncate max-w-[200px]" title={config.titleFont}>
                      {config.titleFont}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Font Tên Đường:</span>
                    <span className="font-bold text-emerald-300 truncate max-w-[200px]" title={config.roadNameFont}>
                      {config.roadNameFont}
                    </span>
                  </div>
                </div>

                {/* Dimensions */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-300 uppercase text-[11px]">2. Kích Thước Bắt Buộc</div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Mặt biển in (ARTWORK):</span>
                    <span className="font-mono font-bold text-emerald-400">500 × 300 mm (Tỷ lệ 5:3)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Cụm biển lắp ghép (ASSEMBLY):</span>
                    <span className="font-mono font-bold text-amber-400">530 × 300 mm</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Nẹp kết cấu cơ khí (TRIM):</span>
                    <span className="font-mono font-bold text-rose-400">30 × 300 mm (KHÔNG IN)</span>
                  </div>
                </div>

                {/* Elements Spec */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-bold text-slate-300 uppercase text-[11px]">3. Quy Cách Đồ Họa</div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Màu nền chính:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 rounded border border-white/40" style={{ backgroundColor: config.backgroundColor }} />
                      <span className="font-mono text-white font-bold">{config.backgroundColor}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Khung viền trắng:</span>
                    <span className="text-white font-bold">Lùi {config.borderInset}mm, dày {config.borderThickness}mm, khuyết 4 góc r={config.cornerNotchRadius}mm</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Chữ cố định "{config.titleText}":</span>
                    <span className="text-white font-bold">Cao {config.titleHeight || 48}mm, ExtraBold</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Tên đường (ROAD_NAME):</span>
                    <span className="text-white font-bold">Mục tiêu {config.targetRoadNameHeight}mm (min {config.minRoadNameHeight}mm), In hoa</span>
                  </div>
                </div>

                {/* Coordinates Spec in Locked Mode */}
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="font-bold text-rose-400 uppercase text-[11px] flex items-center gap-1.5">
                    <Crosshair className="w-3.5 h-3.5 text-rose-400" />
                    <span>4. Tọa Độ Vị Trí Các Thành Phần</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Vị trí Logo Xã:</span>
                    <span className="font-mono text-cyan-300 font-bold">
                      X={logoX} mm, Y={logoY} mm (⌀{logoSize} mm)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-800">
                    <span className="text-slate-400">Vị trí Tiêu Đề ("{config.titleText}"):</span>
                    <span className="font-mono text-amber-300 font-bold">
                      X={titleX} mm, Y={titleY} mm (Cao {config.titleHeight || 48} mm)
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-400">Vị trí Tên Đường:</span>
                    <span className="font-mono text-emerald-300 font-bold">
                      Tâm X={roadNameX} mm, Tâm Y={roadNameY} mm
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Test Road Name Input for Live Master verification */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Thử nghiệm Tên đường trực tiếp trên Master:</span>
              <span className="text-[11px] font-normal text-slate-400">Gõ tên đường bất kỳ</span>
            </label>
            <input
              type="text"
              value={sampleRoadName}
              onChange={(e) => setSampleRoadName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 uppercase"
              placeholder="Ví dụ: DX.813, NGUYỄN THỊ MINH KHAI, ĐT.2901..."
            />
          </div>
        </div>

        {/* Cột phải: Master Live Preview HIỂN THỊ VỪA KHUNG IN & XML Source */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Trực Quan Master Artwork
                </h3>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  previewMode === 'ARTWORK'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}>
                  {previewMode === 'ARTWORK' ? 'MẶT BIỂN IN (500 × 300 mm)' : 'CỤM LẮP RÁP (530 × 300 mm)'}
                </span>
              </div>

              {/* Mode Switch & Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* 500mm in vs 530mm ráp */}
                <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex items-center text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMode('ARTWORK')}
                    className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                      previewMode === 'ARTWORK'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    500mm (In)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode('ASSEMBLY')}
                    className={`px-2.5 py-1 rounded font-bold transition cursor-pointer ${
                      previewMode === 'ASSEMBLY'
                        ? 'bg-amber-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    530mm (Lắp)
                  </button>
                </div>

                {/* Toggle Thước Đo */}
                <button
                  type="button"
                  onClick={() => setShowRulers(!showRulers)}
                  title="Bật/tắt thước đo kích thước mm"
                  className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    showRulers
                      ? 'bg-indigo-950 text-indigo-300 border-indigo-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Thước</span>
                </button>

                {/* Toggle Vạch An Toàn */}
                <button
                  type="button"
                  onClick={() => setShowSafeGuide(!showSafeGuide)}
                  title="Bật/tắt khung lề an toàn 13mm"
                  className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    showSafeGuide
                      ? 'bg-amber-950 text-amber-300 border-amber-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Cữ an toàn</span>
                </button>

                {/* Toggle Hiển Thị Tọa Độ */}
                <button
                  type="button"
                  onClick={() => setShowCoordinatesGuide(!showCoordinatesGuide)}
                  title="Bật/tắt hiển thị tâm tọa độ (X, Y) của Logo, Tiêu đề, Tên đường"
                  className={`p-1.5 rounded-lg border text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                    showCoordinatesGuide
                      ? 'bg-rose-950 text-rose-300 border-rose-700'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Tọa độ (X,Y)</span>
                </button>

                {/* Zoom */}
                <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.max(60, z - 10))}
                    className="text-slate-400 hover:text-white p-0.5"
                    title="Thu nhỏ"
                  >
                    <ZoomOut className="w-3 h-3" />
                  </button>
                  <span className="text-[11px] font-mono text-slate-300 w-10 text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel((z) => Math.min(140, z + 10))}
                    className="text-slate-400 hover:text-white p-0.5"
                    title="Phóng to"
                  >
                    <ZoomIn className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(100)}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-1.5 py-0.5 rounded font-bold ml-1"
                    title="Khôi phục vừa khít khung"
                  >
                    Vừa Khung
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="text-xs font-bold text-slate-300 hover:text-white px-2.5 py-1.5 rounded bg-slate-800 border border-slate-700 flex items-center gap-1 cursor-pointer"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>{showCode ? 'Ẩn Mã' : 'SVG'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopySvg}
                  className="text-xs font-bold text-blue-400 hover:text-blue-300 px-2.5 py-1.5 rounded bg-blue-950 border border-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã Copy' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* KHUNG IN ARTWORK CHUẨN CÔNG NGHIỆP (PRINT BED & JIG FRAME) */}
            <div className="bg-slate-950 rounded-xl p-4 sm:p-6 border border-slate-800 flex flex-col items-center justify-center overflow-hidden min-h-[360px] relative">
              {/* Thước ngang (Top Dimension Bar) */}
              {showRulers && (
                <div className="w-full max-w-xl flex items-center justify-between text-[10px] font-mono text-slate-400 mb-2 px-2 select-none">
                  {previewMode === 'ARTWORK' ? (
                    <>
                      <span>0 mm</span>
                      <div className="flex-1 flex items-center mx-3">
                        <div className="h-px bg-slate-700 flex-1 relative">
                          <div className="absolute left-0 top-[-3px] h-[7px] w-px bg-slate-500" />
                          <div className="absolute left-1/2 top-[-3px] h-[7px] w-px bg-slate-500" />
                          <div className="absolute right-0 top-[-3px] h-[7px] w-px bg-slate-500" />
                        </div>
                      </div>
                      <span className="text-emerald-400 font-bold">← 500 mm (KHỔ IN BIỂN) →</span>
                    </>
                  ) : (
                    <>
                      <span className="text-rose-400 font-bold">30mm Nẹp</span>
                      <div className="flex-1 flex items-center mx-2">
                        <div className="h-px bg-amber-600/70 flex-1 relative">
                          <div className="absolute left-0 top-[-3px] h-[7px] w-px bg-amber-500" />
                          <div className="absolute right-0 top-[-3px] h-[7px] w-px bg-amber-500" />
                        </div>
                      </div>
                      <span className="text-amber-400 font-bold">← 530 mm (TỔNG LẮP RÁP) →</span>
                    </>
                  )}
                </div>
              )}

              {/* Vùng gá in / Bàn in chứa Artwork (Scaling & Centering box) */}
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'center center',
                }}
                className="transition-transform duration-200 w-full max-w-xl flex items-center justify-center relative"
              >
                {/* Khung viền bàn in cơ khí (Aluminum Sign Jig Frame) */}
                <div
                  className={`w-full relative shadow-2xl rounded border-2 border-slate-700/80 bg-slate-900 overflow-hidden ${
                    previewMode === 'ARTWORK' ? 'aspect-[500/300]' : 'aspect-[530/300]'
                  }`}
                >
                  {/* Vector SVG được render vừa khít 100% khung in */}
                  <div
                    className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:block [&>svg]:object-contain select-none"
                    dangerouslySetInnerHTML={{ __html: currentSvg }}
                  />

                  {/* Lớp cữ an toàn 13mm (Safe Margin Overlay Guide) */}
                  {showSafeGuide && (
                    <div
                      className="absolute pointer-events-none border border-dashed border-amber-400/60 z-10"
                      style={{
                        top: `${(config.borderInset / 300) * 100}%`,
                        bottom: `${(config.borderInset / 300) * 100}%`,
                        left:
                          previewMode === 'ARTWORK'
                            ? `${(config.borderInset / 500) * 100}%`
                            : `${((config.borderInset + 30) / 530) * 100}%`,
                        right: `${(config.borderInset / (previewMode === 'ARTWORK' ? 500 : 530)) * 100}%`,
                      }}
                    >
                      <div className="absolute top-1 left-1.5 text-[9px] font-mono font-bold text-amber-300 bg-slate-950/90 px-1 py-0.5 rounded shadow-sm border border-amber-500/40 flex items-center gap-1">
                        <span>Cữ lề: {config.borderInset}mm</span>
                      </div>
                    </div>
                  )}

                  {/* Dấu chữ thập canh biên góc in (Registration Crosshairs) */}
                  <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-white/60 pointer-events-none" />
                  <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-white/60 pointer-events-none" />
                  <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-white/60 pointer-events-none" />
                  <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-white/60 pointer-events-none" />

                  {/* Lớp hiển thị tâm tọa độ (X, Y) các thành phần */}
                  {showCoordinatesGuide && (
                    <div className="absolute inset-0 pointer-events-none z-20">
                      {/* Logo Coordinate Marker */}
                      <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                        style={{
                          left: previewMode === 'ARTWORK' ? `${(logoX / 500) * 100}%` : `${((logoX + 30) / 530) * 100}%`,
                          top: `${(logoY / 300) * 100}%`,
                        }}
                      >
                        <div className="w-4 h-4 rounded-full border border-cyan-400 flex items-center justify-center bg-cyan-500/20 shadow-sm relative">
                          <div className="w-1 h-1 bg-cyan-300 rounded-full" />
                          <div className="absolute w-6 h-px bg-cyan-400/50" />
                          <div className="absolute h-6 w-px bg-cyan-400/50" />
                        </div>
                        <div className="text-[9px] font-mono font-bold text-cyan-300 bg-slate-950/90 px-1 py-0.5 rounded border border-cyan-500/60 shadow whitespace-nowrap mt-0.5">
                          Logo ({logoX}, {logoY}) ⌀{logoSize}
                        </div>
                      </div>

                      {/* Title Coordinate Marker */}
                      <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                        style={{
                          left: previewMode === 'ARTWORK' ? `${(titleX / 500) * 100}%` : `${((titleX + 30) / 530) * 100}%`,
                          top: `${(titleY / 300) * 100}%`,
                        }}
                      >
                        <div className="w-4 h-4 rounded-full border border-amber-400 flex items-center justify-center bg-amber-500/20 shadow-sm relative">
                          <div className="w-1 h-1 bg-amber-300 rounded-full" />
                          <div className="absolute w-6 h-px bg-amber-400/50" />
                          <div className="absolute h-6 w-px bg-amber-400/50" />
                        </div>
                        <div className="text-[9px] font-mono font-bold text-amber-300 bg-slate-950/90 px-1 py-0.5 rounded border border-amber-500/60 shadow whitespace-nowrap mt-0.5">
                          Tiêu đề ({titleX}, {titleY})
                        </div>
                      </div>

                      {/* Road Name Coordinate Marker */}
                      <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                        style={{
                          left: previewMode === 'ARTWORK' ? `${(roadNameX / 500) * 100}%` : `${((roadNameX + 30) / 530) * 100}%`,
                          top: `${(roadNameY / 300) * 100}%`,
                        }}
                      >
                        <div className="w-4 h-4 rounded-full border border-emerald-400 flex items-center justify-center bg-emerald-500/20 shadow-sm relative">
                          <div className="w-1 h-1 bg-emerald-300 rounded-full" />
                          <div className="absolute w-6 h-px bg-emerald-400/50" />
                          <div className="absolute h-6 w-px bg-emerald-400/50" />
                        </div>
                        <div className="text-[9px] font-mono font-bold text-emerald-300 bg-slate-950/90 px-1 py-0.5 rounded border border-emerald-500/60 shadow whitespace-nowrap mt-0.5">
                          Tên đường ({roadNameX}, {roadNameY})
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Thước dọc bên dưới / Thông tin kích thước */}
              <div className="mt-3 flex items-center justify-between w-full max-w-xl text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-slate-200">
                    {previewMode === 'ARTWORK' ? 'Khung in chuẩn: 500 × 300 mm (5:3)' : 'Khung lắp ghép: 530 × 300 mm'}
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[10px]">
                  <span className="text-cyan-300">
                    Tiêu đề: {config.titleFont.split(',')[0].replace(/['"]/g, '')}
                  </span>
                  <span className="text-emerald-300">
                    Tên đường: {config.roadNameFont.split(',')[0].replace(/['"]/g, '')}
                  </span>
                </div>
              </div>
            </div>

            {/* Code view accordion */}
            {showCode && (
              <div className="mt-4">
                <div className="text-xs font-bold text-slate-400 mb-1 flex items-center justify-between">
                  <span>MÃ NGUỒN SVG MASTER GỐC (CHUẨN XUẤT XƯỞNG):</span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {previewMode === 'ARTWORK' ? 'width="500mm" height="300mm"' : 'width="530mm" height="300mm"'}
                  </span>
                </div>
                <pre className="bg-slate-950 text-slate-300 p-3 rounded-lg text-[11px] font-mono overflow-x-auto max-h-64 border border-slate-800">
                  {currentSvg}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
