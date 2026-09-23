import React from 'react';
import {
  Crosshair,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minimize2,
  AlignCenter,
  RotateCcw,
  Sparkles,
  Layers,
  Type,
  ImageIcon,
  Move,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { MasterConfig, ARTWORK_WIDTH, ARTWORK_HEIGHT } from '../types';

export type SelectableElement = 'LOGO' | 'TITLE' | 'ROAD_NAME' | 'FRAME' | null;

interface PrecisionNudgeBarProps {
  selectedElement: SelectableElement;
  onSelectElement: (el: SelectableElement) => void;
  config: MasterConfig;
  onUpdateConfig: (config: MasterConfig) => void;
  nudgeStep: number;
  onSetNudgeStep: (step: number) => void;
  isLocked: boolean;
}

export const PrecisionNudgeBar: React.FC<PrecisionNudgeBarProps> = ({
  selectedElement,
  onSelectElement,
  config,
  onUpdateConfig,
  nudgeStep,
  onSetNudgeStep,
  isLocked,
}) => {
  const logoX = config.logoX ?? 110;
  const logoY = config.logoY ?? 96;
  const logoSize = config.logoSize ?? 76;
  const titleX = config.titleX ?? 330;
  const titleY = config.titleY ?? 126;
  const titleHeight = config.titleHeight || 48;
  const roadNameX = config.roadNameX ?? 250;
  const roadNameY = config.roadNameY ?? 230;

  // Xử lý di chuyển theo phím D-pad (dx, dy mm)
  const handleNudge = (dx: number, dy: number) => {
    if (isLocked) return;

    if (selectedElement === 'LOGO') {
      const newX = Math.round((logoX + dx) * 10) / 10;
      const newY = Math.round((logoY + dy) * 10) / 10;
      onUpdateConfig({
        ...config,
        logoX: Math.max(30, Math.min(470, newX)),
        logoY: Math.max(30, Math.min(270, newY)),
      });
    } else if (selectedElement === 'TITLE') {
      const newX = Math.round((titleX + dx) * 10) / 10;
      const newY = Math.round((titleY + dy) * 10) / 10;
      onUpdateConfig({
        ...config,
        titleX: Math.max(50, Math.min(460, newX)),
        titleY: Math.max(40, Math.min(270, newY)),
      });
    } else if (selectedElement === 'ROAD_NAME') {
      const newX = Math.round((roadNameX + dx) * 10) / 10;
      const newY = Math.round((roadNameY + dy) * 10) / 10;
      onUpdateConfig({
        ...config,
        roadNameX: Math.max(50, Math.min(450, newX)),
        roadNameY: Math.max(100, Math.min(280, newY)),
      });
    } else if (selectedElement === 'FRAME') {
      // Cho khung viền: di chuyển dy làm thay đổi độ lùi viền (Inset)
      const newInset = Math.round((config.borderInset + dy) * 10) / 10;
      onUpdateConfig({
        ...config,
        borderInset: Math.max(5, Math.min(30, newInset)),
      });
    }
  };

  // Căn giữa nhanh trục dọc X = 250mm
  const handleCenterAxis = () => {
    if (isLocked) return;
    if (selectedElement === 'LOGO') {
      onUpdateConfig({ ...config, logoX: 250 });
    } else if (selectedElement === 'TITLE') {
      onUpdateConfig({ ...config, titleX: 250 });
    } else if (selectedElement === 'ROAD_NAME') {
      onUpdateConfig({ ...config, roadNameX: 250 });
    }
  };

  // Điều chỉnh kích thước nhanh (+/-)
  const handleScaleSize = (delta: number) => {
    if (isLocked) return;
    if (selectedElement === 'LOGO') {
      const newSize = Math.max(40, Math.min(130, Math.round(logoSize + delta)));
      onUpdateConfig({ ...config, logoSize: newSize });
    } else if (selectedElement === 'TITLE') {
      const newH = Math.max(30, Math.min(70, Math.round(titleHeight + delta)));
      onUpdateConfig({ ...config, titleHeight: newH });
    } else if (selectedElement === 'ROAD_NAME') {
      const newTarget = Math.max(30, Math.min(80, Math.round(config.targetRoadNameHeight + delta)));
      onUpdateConfig({ ...config, targetRoadNameHeight: newTarget });
    } else if (selectedElement === 'FRAME') {
      const newThickness = Math.max(1, Math.min(8, Math.round((config.borderThickness + delta * 0.5) * 10) / 10));
      onUpdateConfig({ ...config, borderThickness: newThickness });
    }
  };

  // Tính khoảng cách an toàn (Clearance) tới viền
  const getClearanceInfo = () => {
    const inset = config.borderInset;
    if (selectedElement === 'LOGO') {
      const r = logoSize / 2;
      const leftDist = Math.round(logoX - r - inset);
      const topDist = Math.round(logoY - r - inset);
      const isSafe = leftDist >= 8 && topDist >= 8;
      return {
        label: `Khoảng hở tới viền: Trái ${leftDist}mm · Trên ${topDist}mm`,
        isSafe,
      };
    }
    if (selectedElement === 'TITLE') {
      const topDist = Math.round(titleY - titleHeight - inset);
      const isSafe = topDist >= 5;
      return {
        label: `Khoảng hở tới viền trên: ~${topDist}mm`,
        isSafe,
      };
    }
    if (selectedElement === 'ROAD_NAME') {
      const bottomDist = Math.round(ARTWORK_HEIGHT - inset - roadNameY - (config.targetRoadNameHeight / 2));
      const isSafe = bottomDist >= 8;
      return {
        label: `Khoảng hở tới viền đáy: ~${bottomDist}mm`,
        isSafe,
      };
    }
    if (selectedElement === 'FRAME') {
      return {
        label: `Khung cách mép cắt tôn: ${inset}mm · Góc khuyết r=${config.cornerNotchRadius}mm`,
        isSafe: inset >= 10 && inset <= 20,
      };
    }
    return null;
  };

  const clearance = getClearanceInfo();

  return (
    <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-md space-y-2 text-xs">
      {/* 1. Hàng chọn nhanh thành phần tương tác */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span>Chọn Đối Tượng:</span>
          </span>

          <button
            type="button"
            onClick={() => onSelectElement('LOGO')}
            className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition cursor-pointer border ${
              selectedElement === 'LOGO'
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200 shadow-sm ring-1 ring-cyan-500/50'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-3 h-3 text-cyan-400" />
            <span>Logo</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectElement('TITLE')}
            className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition cursor-pointer border ${
              selectedElement === 'TITLE'
                ? 'bg-amber-950/90 border-amber-400 text-amber-200 shadow-sm ring-1 ring-amber-500/50'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Type className="w-3 h-3 text-amber-400" />
            <span>Tiêu Đề ("{config.titleText}")</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectElement('ROAD_NAME')}
            className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition cursor-pointer border ${
              selectedElement === 'ROAD_NAME'
                ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200 shadow-sm ring-1 ring-emerald-500/50'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Move className="w-3 h-3 text-emerald-400" />
            <span>Tên Đường</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectElement('FRAME')}
            className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition cursor-pointer border ${
              selectedElement === 'FRAME'
                ? 'bg-indigo-950/90 border-indigo-400 text-indigo-200 shadow-sm ring-1 ring-indigo-500/50'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3 h-3 text-indigo-400" />
            <span>Khung Viền</span>
          </button>
        </div>

        {/* Nấc bước nhảy Nudge */}
        <div className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono">Bước:</span>
          {[
            { val: 0.5, label: '0.5mm' },
            { val: 1.0, label: '1mm' },
            { val: 5.0, label: '5mm' },
          ].map((s) => (
            <button
              key={s.val}
              type="button"
              onClick={() => onSetNudgeStep(s.val)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition ${
                nudgeStep === s.val
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Cụm điều khiển vi mô khi đã chọn thành phần */}
      {selectedElement ? (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Thông tin tọa độ hiện tại */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-slate-800 border border-slate-700 text-cyan-300 shrink-0">
              {selectedElement === 'LOGO' && <ImageIcon className="w-4 h-4 text-cyan-400" />}
              {selectedElement === 'TITLE' && <Type className="w-4 h-4 text-amber-400" />}
              {selectedElement === 'ROAD_NAME' && <Move className="w-4 h-4 text-emerald-400" />}
              {selectedElement === 'FRAME' && <Layers className="w-4 h-4 text-indigo-400" />}
            </div>
            <div>
              <div className="font-bold text-white flex items-center gap-2">
                <span>
                  {selectedElement === 'LOGO' && 'Logo Xã'}
                  {selectedElement === 'TITLE' && `Tiêu Đề ("${config.titleText}")`}
                  {selectedElement === 'ROAD_NAME' && 'Tên Đường (Chính)'}
                  {selectedElement === 'FRAME' && 'Khung Viền Biển'}
                </span>
                <span className="font-mono text-[11px] text-cyan-300 font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                  {selectedElement === 'LOGO' && `X=${logoX}mm, Y=${logoY}mm (⌀${logoSize}mm)`}
                  {selectedElement === 'TITLE' && `X=${titleX}mm, Y=${titleY}mm (H=${titleHeight}mm)`}
                  {selectedElement === 'ROAD_NAME' && `X=${roadNameX}mm, Y=${roadNameY}mm`}
                  {selectedElement === 'FRAME' && `Lùi=${config.borderInset}mm, Dày=${config.borderThickness}mm`}
                </span>
              </div>
              {clearance && (
                <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                  {clearance.isSafe ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className={clearance.isSafe ? 'text-emerald-300' : 'text-amber-300'}>
                    {clearance.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Cụm D-Pad & Kích Thước */}
          <div className="flex items-center gap-2 flex-wrap sm:justify-end">
            {/* D-Pad Joystick ảo */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => handleNudge(-nudgeStep, 0)}
                disabled={isLocked}
                title={`Sang trái ${nudgeStep}mm`}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-40 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => handleNudge(0, -nudgeStep)}
                  disabled={isLocked}
                  title={`Lên trên ${nudgeStep}mm`}
                  className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-40 cursor-pointer"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => handleNudge(0, nudgeStep)}
                  disabled={isLocked}
                  title={`Xuống dưới ${nudgeStep}mm`}
                  className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-40 cursor-pointer"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => handleNudge(nudgeStep, 0)}
                disabled={isLocked}
                title={`Sang phải ${nudgeStep}mm`}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded disabled:opacity-40 cursor-pointer"
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Căn Giữa Trục Dọc (X = 250mm) */}
            {selectedElement !== 'FRAME' && (
              <button
                type="button"
                onClick={handleCenterAxis}
                disabled={isLocked}
                title="Căn giữa chính xác trục dọc 250mm của biển"
                className="bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 cursor-pointer transition disabled:opacity-40"
              >
                <AlignCenter className="w-3.5 h-3.5" />
                <span className="text-[11px]">Trục Giữa 250</span>
              </button>
            )}

            {/* Cỡ Nhanh +/- */}
            <div className="flex items-center gap-1 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
              <span className="text-[10px] text-slate-400">Cỡ:</span>
              <button
                type="button"
                onClick={() => handleScaleSize(selectedElement === 'FRAME' ? -1 : -2)}
                disabled={isLocked}
                title="Giảm kích thước"
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold cursor-pointer disabled:opacity-40"
              >
                <Minimize2 className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => handleScaleSize(selectedElement === 'FRAME' ? 1 : 2)}
                disabled={isLocked}
                title="Tăng kích thước"
                className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-bold cursor-pointer disabled:opacity-40"
              >
                <Maximize2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 flex items-center justify-between py-0.5">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mẹo: Bạn có thể nhấp trực tiếp vào Logo, Tiêu đề hoặc Tên đường trên hình vẽ để kéo thả vị trí và xem đường gióng nam châm!</span>
          </span>
          <span className="text-[10px] text-cyan-400 font-mono hidden md:inline">
            Khổ in: 500 × 300 mm
          </span>
        </div>
      )}
    </div>
  );
};
