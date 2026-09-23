import React from 'react';
import { Layers, Palette, Sparkles, Check, RotateCcw } from 'lucide-react';
import { MasterConfig } from '../types';
import { generateBorderPath } from '../utils/masterSvg';

interface SmartBorderCornerEditorProps {
  config: MasterConfig;
  onUpdateConfig: (config: MasterConfig) => void;
  isLocked: boolean;
}

export const SmartBorderCornerEditor: React.FC<SmartBorderCornerEditorProps> = ({
  config,
  onUpdateConfig,
  isLocked,
}) => {
  const cornerStyle = config.cornerStyle || 'CONCAVE';
  const inset = config.borderInset;
  const thickness = config.borderThickness;
  const radius = config.cornerNotchRadius;

  // Tạo đường dẫn góc mẫu (zoom góc trên-trái 100x100mm)
  const samplePath = generateBorderPath(100, 100, inset, radius, cornerStyle);

  const handleSetStyle = (style: 'CONCAVE' | 'ROUNDED' | 'RECTANGULAR') => {
    if (isLocked) return;
    onUpdateConfig({ ...config, cornerStyle: style });
  };

  const handleResetBorderDefault = () => {
    if (isLocked) return;
    onUpdateConfig({
      ...config,
      borderInset: 13,
      borderThickness: 3.5,
      cornerNotchRadius: 16,
      cornerStyle: 'CONCAVE',
      borderColor: '#ffffff',
    });
  };

  return (
    <div className="space-y-4 text-xs">
      {/* 1. Bộ 3 Kiểu Góc Biển Nghệ Thuật */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="font-bold text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>Kiểu Khung Viền &amp; Bo Góc Biển:</span>
          </label>
          <button
            type="button"
            onClick={handleResetBorderDefault}
            disabled={isLocked}
            className="text-[10px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded border border-slate-700 flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Viền Chuẩn V4.0</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Kiểu 1: Khuyết Lõm Nghệ Thuật Hải Lăng (Scallop Concave) */}
          <button
            type="button"
            disabled={isLocked}
            onClick={() => handleSetStyle('CONCAVE')}
            className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              cornerStyle === 'CONCAVE'
                ? 'bg-amber-950/70 border-amber-400 text-amber-200 ring-1 ring-amber-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white text-[11px]">Khuyết Nghệ Thuật</span>
              {cornerStyle === 'CONCAVE' && <Check className="w-3.5 h-3.5 text-amber-400" />}
            </div>
            {/* SVG Thumbnail góc khuyết */}
            <svg viewBox="0 0 40 26" className="w-full h-7 mb-1 stroke-current fill-none">
              <path
                d="M 5 18 L 5 8 A 6 6 0 0 0 11 2 L 35 2"
                strokeWidth="2.5"
                strokeLinecap="round"
                className={cornerStyle === 'CONCAVE' ? 'stroke-amber-400' : 'stroke-slate-600'}
              />
            </svg>
            <span className="text-[10px] opacity-75">Góc khuyết lõm r={radius}mm (Đặc trưng Hải Lăng)</span>
          </button>

          {/* Kiểu 2: Bo Tròn Lồi Mềm Mại (Rounded) */}
          <button
            type="button"
            disabled={isLocked}
            onClick={() => handleSetStyle('ROUNDED')}
            className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              cornerStyle === 'ROUNDED'
                ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 ring-1 ring-cyan-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white text-[11px]">Bo Tròn Mềm</span>
              {cornerStyle === 'ROUNDED' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
            </div>
            {/* SVG Thumbnail góc bo tròn */}
            <svg viewBox="0 0 40 26" className="w-full h-7 mb-1 stroke-current fill-none">
              <path
                d="M 5 18 L 5 8 A 6 6 0 0 1 11 2 L 35 2"
                strokeWidth="2.5"
                strokeLinecap="round"
                className={cornerStyle === 'ROUNDED' ? 'stroke-cyan-400' : 'stroke-slate-600'}
              />
            </svg>
            <span className="text-[10px] opacity-75">Bo góc tròn lồi mềm mại bán kính r</span>
          </button>

          {/* Kiểu 3: Vuông Góc Sắc Nét (Rectangular) */}
          <button
            type="button"
            disabled={isLocked}
            onClick={() => handleSetStyle('RECTANGULAR')}
            className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
              cornerStyle === 'RECTANGULAR'
                ? 'bg-indigo-950/70 border-indigo-400 text-indigo-200 ring-1 ring-indigo-500/50'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-white text-[11px]">Vuông Góc</span>
              {cornerStyle === 'RECTANGULAR' && <Check className="w-3.5 h-3.5 text-indigo-400" />}
            </div>
            {/* SVG Thumbnail góc vuông */}
            <svg viewBox="0 0 40 26" className="w-full h-7 mb-1 stroke-current fill-none">
              <path
                d="M 5 18 L 5 2 L 35 2"
                strokeWidth="2.5"
                strokeLinecap="square"
                strokeLinejoin="miter"
                className={cornerStyle === 'RECTANGULAR' ? 'stroke-indigo-400' : 'stroke-slate-600'}
              />
            </svg>
            <span className="text-[10px] opacity-75">Vuông góc thẳng chuẩn khung tiêu chuẩn</span>
          </button>
        </div>
      </div>

      {/* 2. Kính Lúp Phóng Đại Hình Học Góc Biển (Live Micro Geometry Zoom) */}
      <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-center gap-4">
        <div className="w-20 h-20 rounded border border-slate-700 bg-slate-900 relative overflow-hidden shrink-0 flex items-center justify-center">
          {/* Tấm tôn nền */}
          <div
            className="w-full h-full relative"
            style={{ backgroundColor: config.backgroundColor }}
          >
            <svg viewBox="0 0 70 70" className="w-full h-full">
              <path
                d={samplePath}
                fill="none"
                stroke={config.borderColor}
                strokeWidth={thickness}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Dấu chấm góc tôn */}
              <rect x="0" y="0" width="70" height="70" fill="none" stroke="#475569" strokeWidth="0.8" strokeDasharray="2 2" />
            </svg>
          </div>
          <span className="absolute bottom-1 right-1 text-[8px] font-mono text-slate-300 bg-black/60 px-1 rounded">
            Góc 1:1
          </span>
        </div>

        <div className="flex-1 space-y-1">
          <span className="text-white font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Hình Học Góc Biển Thực Tế</span>
          </span>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Viền lùi <strong className="text-white">{inset}mm</strong> từ mép cắt tôn, nét viền dày <strong className="text-white">{thickness}mm</strong>.
            {cornerStyle !== 'RECTANGULAR' ? (
              <span> Bán kính cung cong bo góc <strong className="text-amber-300">r={radius}mm</strong>.</span>
            ) : (
              <span> Cắt góc vuông góc 90°.</span>
            )}
          </p>
        </div>
      </div>

      {/* 3. Tinh Chỉnh Độ Lùi Viền (Border Inset) */}
      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300">Độ Thụt Lùi Viền Từ Mép Tôn (Border Inset):</span>
          <span className="font-mono text-cyan-300 font-bold">{inset} mm</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="6"
            max="26"
            step="1"
            value={inset}
            disabled={isLocked}
            onChange={(e) => onUpdateConfig({ ...config, borderInset: Number(e.target.value) })}
            className="flex-1 accent-cyan-400 cursor-pointer disabled:opacity-40"
          />
          <input
            type="number"
            min="6"
            max="26"
            value={inset}
            disabled={isLocked}
            onChange={(e) => onUpdateConfig({ ...config, borderInset: Number(e.target.value) || 13 })}
            className="w-16 bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded px-2 py-1 text-center disabled:opacity-40"
          />
        </div>
        {/* Nấc chọn nhanh */}
        <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
          <span className="text-[10px] text-slate-400">Nấc chuẩn:</span>
          {[
            { val: 10, label: '10mm (Sát mép)' },
            { val: 12, label: '12mm' },
            { val: 13, label: '13mm (Chuẩn V4.0)' },
            { val: 15, label: '15mm (Thoáng)' },
            { val: 18, label: '18mm (Lùi sâu)' },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              disabled={isLocked}
              onClick={() => onUpdateConfig({ ...config, borderInset: item.val })}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition cursor-pointer disabled:opacity-40 ${
                inset === item.val
                  ? 'bg-cyan-950 border-cyan-500 text-cyan-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Tinh Chỉnh Độ Dày Nét Viền (Border Thickness) */}
      <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300">Độ Dày Nét Viền Sơn/Decal (Thickness):</span>
          <span className="font-mono text-amber-300 font-bold">{thickness} mm</span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1.5"
            max="6.0"
            step="0.5"
            value={thickness}
            disabled={isLocked}
            onChange={(e) => onUpdateConfig({ ...config, borderThickness: Number(e.target.value) })}
            className="flex-1 accent-amber-400 cursor-pointer disabled:opacity-40"
          />
          <input
            type="number"
            step="0.5"
            min="1.5"
            max="6.0"
            value={thickness}
            disabled={isLocked}
            onChange={(e) => onUpdateConfig({ ...config, borderThickness: Number(e.target.value) || 3.5 })}
            className="w-16 bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded px-2 py-1 text-center disabled:opacity-40"
          />
        </div>
        {/* Nấc chọn nhanh */}
        <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
          <span className="text-[10px] text-slate-400">Nấc chuẩn:</span>
          {[
            { val: 2.5, label: '2.5mm (Mảnh)' },
            { val: 3.0, label: '3.0mm' },
            { val: 3.5, label: '3.5mm (Chuẩn V4.0)' },
            { val: 4.0, label: '4.0mm' },
            { val: 5.0, label: '5.0mm (Đậm nét)' },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              disabled={isLocked}
              onClick={() => onUpdateConfig({ ...config, borderThickness: item.val })}
              className={`text-[10px] font-mono px-2 py-0.5 rounded border transition cursor-pointer disabled:opacity-40 ${
                thickness === item.val
                  ? 'bg-amber-950 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Tinh Chỉnh Bán Kính Bo Khuyết Góc (Corner Radius r) */}
      {cornerStyle !== 'RECTANGULAR' && (
        <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300">
              {cornerStyle === 'CONCAVE' ? 'Bán Kính Góc Khuyết Nghệ Thuật (r mm):' : 'Bán Kính Bo Tròn 4 Góc (r mm):'}
            </span>
            <span className="font-mono text-emerald-300 font-bold">r = {radius} mm</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="8"
              max="26"
              step="1"
              value={radius}
              disabled={isLocked}
              onChange={(e) => onUpdateConfig({ ...config, cornerNotchRadius: Number(e.target.value) })}
              className="flex-1 accent-emerald-400 cursor-pointer disabled:opacity-40"
            />
            <input
              type="number"
              min="8"
              max="26"
              value={radius}
              disabled={isLocked}
              onChange={(e) => onUpdateConfig({ ...config, cornerNotchRadius: Number(e.target.value) || 16 })}
              className="w-16 bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded px-2 py-1 text-center disabled:opacity-40"
            />
          </div>
          {/* Nấc chọn nhanh */}
          <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
            <span className="text-[10px] text-slate-400">Nấc chuẩn:</span>
            {[
              { val: 12, label: 'r=12mm' },
              { val: 14, label: 'r=14mm' },
              { val: 16, label: 'r=16mm (Chuẩn V4.0)' },
              { val: 18, label: 'r=18mm' },
              { val: 20, label: 'r=20mm (Khuyết sâu)' },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                disabled={isLocked}
                onClick={() => onUpdateConfig({ ...config, cornerNotchRadius: item.val })}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition cursor-pointer disabled:opacity-40 ${
                  radius === item.val
                    ? 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6. Màu Nền Biển & Màu Viền */}
      <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800">
        <div>
          <span className="text-slate-400 text-[11px] block mb-1">Màu nền biển:</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.backgroundColor}
              disabled={isLocked}
              onChange={(e) => onUpdateConfig({ ...config, backgroundColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent disabled:opacity-40"
            />
            <input
              type="text"
              value={config.backgroundColor}
              disabled={isLocked}
              onChange={(e) => onUpdateConfig({ ...config, backgroundColor: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded px-2 py-1 uppercase disabled:opacity-40"
            />
          </div>
        </div>

        <div>
          <span className="text-slate-400 text-[11px] block mb-1">Màu khung viền:</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={config.borderColor}
              disabled={isLocked}
              onChange={(e) => onUpdateConfig({ ...config, borderColor: e.target.value })}
              className="w-8 h-8 rounded border border-slate-700 cursor-pointer bg-transparent disabled:opacity-40"
            />
            <input
              type="text"
              value={config.borderColor}
              disabled={isLocked}
              onChange={(e) => onUpdateConfig({ ...config, borderColor: e.target.value })}
              className="w-full bg-slate-900 border border-slate-700 text-white font-mono text-xs rounded px-2 py-1 uppercase disabled:opacity-40"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
