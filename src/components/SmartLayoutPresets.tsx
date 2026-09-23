import React from 'react';
import { Sparkles, Check, Compass } from 'lucide-react';
import { MasterConfig } from '../types';

interface SmartLayoutPresetsProps {
  config: MasterConfig;
  onUpdateConfig: (config: MasterConfig) => void;
  isLocked: boolean;
}

export interface PresetItem {
  id: string;
  name: string;
  badge: string;
  desc: string;
  values: Partial<MasterConfig>;
}

export const LAYOUT_PRESETS: PresetItem[] = [
  {
    id: 'STANDARD_V4',
    name: 'Chuẩn V4.0 Bản Quyền Hải Lăng',
    badge: 'Tiêu chuẩn',
    desc: 'Logo góc trái (110,96,⌀76), Tiêu đề phải (330,126,H48), Tên đường tâm (250,230), Khuyết r=16mm.',
    values: {
      logoX: 110,
      logoY: 96,
      logoSize: 76,
      titleX: 330,
      titleY: 126,
      titleHeight: 48,
      roadNameX: 250,
      roadNameY: 230,
      borderInset: 13,
      borderThickness: 3.5,
      cornerNotchRadius: 16,
      cornerStyle: 'CONCAVE',
    },
  },
  {
    id: 'CENTERED_HERITAGE',
    name: 'Bố Cục Căn Giữa Cổ Điển',
    badge: 'Đồng trục X',
    desc: 'Toàn bộ Logo, Tiêu đề và Tên đường căn thẳng tắp trục giữa X=250mm, tạo sự uy nghiêm, cân đối.',
    values: {
      logoX: 250,
      logoY: 76,
      logoSize: 68,
      titleX: 250,
      titleY: 132,
      titleHeight: 42,
      roadNameX: 250,
      roadNameY: 232,
      borderInset: 13,
      borderThickness: 3.5,
      cornerNotchRadius: 16,
      cornerStyle: 'CONCAVE',
    },
  },
  {
    id: 'TWO_LINES_CLEARANCE',
    name: 'Tối Ưu Tên Đường Dài (2 Hàng)',
    badge: 'Khoảng hở tối đa',
    desc: 'Thu nhỏ logo (⌀68) và đẩy tiêu đề lên trên (Y=115) để giải phóng tối đa diện tích cho tên đường 2 dòng.',
    values: {
      logoX: 105,
      logoY: 86,
      logoSize: 68,
      titleX: 335,
      titleY: 116,
      titleHeight: 42,
      roadNameX: 250,
      roadNameY: 226,
      borderInset: 12,
      borderThickness: 3.5,
      cornerNotchRadius: 15,
      cornerStyle: 'CONCAVE',
    },
  },
  {
    id: 'SLIM_MODERN',
    name: 'Khung Viền Mảnh & Bo Khuyết Rộng',
    badge: 'Thanh lịch',
    desc: 'Viền lùi sâu 15mm, nét mảnh 2.8mm, góc khuyết sâu r=18mm tạo vẻ hiện đại, sắc sảo.',
    values: {
      borderInset: 15,
      borderThickness: 2.8,
      cornerNotchRadius: 18,
      cornerStyle: 'CONCAVE',
    },
  },
  {
    id: 'HEAVY_CONTRAST',
    name: 'Khung Viền Đậm Tương Phản Cao',
    badge: 'Nhìn xa rõ',
    desc: 'Nét viền trắng đậm 4.5mm, lùi 12mm sát mép, tăng độ tương phản rõ rệt khi quan sát từ xa ngoài hiện trường.',
    values: {
      borderInset: 12,
      borderThickness: 4.5,
      cornerNotchRadius: 15,
      cornerStyle: 'CONCAVE',
    },
  },
];

export const SmartLayoutPresets: React.FC<SmartLayoutPresetsProps> = ({
  config,
  onUpdateConfig,
  isLocked,
}) => {
  const isPresetActive = (p: PresetItem) => {
    return Object.entries(p.values).every(([k, v]) => (config as any)[k] === v);
  };

  const handleApplyPreset = (p: PresetItem) => {
    if (isLocked) return;
    onUpdateConfig({ ...config, ...p.values });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Bố Cục Chuẩn Sản Xuất (1-Click Presets):</span>
        </label>
        <span className="text-[10px] text-slate-400">5 Bố Cục Tối Ưu</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {LAYOUT_PRESETS.map((p) => {
          const active = isPresetActive(p);
          return (
            <button
              key={p.id}
              type="button"
              disabled={isLocked}
              onClick={() => handleApplyPreset(p)}
              className={`p-2.5 rounded-lg border text-left transition cursor-pointer flex flex-col justify-between ${
                active
                  ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200 ring-1 ring-cyan-500/50'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              } disabled:opacity-40`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white text-[11px] flex items-center gap-1">
                  <span>{p.name}</span>
                </span>
                {active ? (
                  <span className="text-[10px] font-bold text-cyan-300 flex items-center gap-0.5">
                    <Check className="w-3 h-3 text-cyan-400" />
                    <span>Đang Dùng</span>
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                    {p.badge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">{p.desc}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
