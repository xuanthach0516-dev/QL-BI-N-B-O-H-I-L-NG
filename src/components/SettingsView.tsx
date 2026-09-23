import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Lock,
  Unlock,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  Save,
  Check,
  Crosshair,
  HardDrive,
  Download,
  UploadCloud,
} from 'lucide-react';
import { MasterConfig } from '../types';
import { DEFAULT_MASTER_CONFIG } from '../utils/masterSvg';
import { FONT_OPTIONS } from './MasterTemplateView';
import {
  saveMasterConfig,
  resetSavedMasterConfig,
  exportMasterConfigAsJson,
  parseAndValidateConfigJson,
} from '../utils/templateStorage';

interface SettingsViewProps {
  config: MasterConfig;
  onUpdateConfig: (newConfig: MasterConfig) => void;
  onLoadTestSigns: () => void;
  onGenerateSigns: (count: number) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onUpdateConfig,
  onLoadTestSigns,
  onGenerateSigns,
}) => {
  const [formConfig, setFormConfig] = useState<MasterConfig>({ ...config });
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFormConfig({ ...config });
  }, [config]);

  const handleSave = () => {
    saveMasterConfig(formConfig);
    onUpdateConfig(formConfig);
    setSaved(true);
    setNotice('✓ Đã lưu cấu hình mẫu vào bộ nhớ trình duyệt!');
    setTimeout(() => {
      setSaved(false);
      setNotice(null);
    }, 2500);
  };

  const handleResetToDefault = () => {
    const defaultConfig = resetSavedMasterConfig();
    setFormConfig(defaultConfig);
    onUpdateConfig(defaultConfig);
    setSaved(true);
    setNotice('Đã khôi phục mặc định gốc V4.0 và xóa cấu hình tùy chỉnh đã lưu!');
    setTimeout(() => {
      setSaved(false);
      setNotice(null);
    }, 2500);
  };

  const handleExportJson = () => {
    exportMasterConfigAsJson(formConfig, `master-template-config-${formConfig.templateVersion.toLowerCase()}.json`);
    setNotice('Đã xuất tệp sao lưu cấu hình JSON!');
    setTimeout(() => setNotice(null), 2500);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const imported = parseAndValidateConfigJson(text);
        saveMasterConfig(imported);
        setFormConfig(imported);
        onUpdateConfig(imported);
        setNotice('✓ Đã nạp thành công cấu hình từ tệp JSON!');
        setTimeout(() => setNotice(null), 3000);
      } catch (err: any) {
        alert('Không thể nạp tệp cấu hình JSON: ' + (err?.message || 'Tệp không hợp lệ'));
      }
    };
    reader.readAsText(file);
    if (jsonInputRef.current) jsonInputRef.current.value = '';
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Cài Đặt Hệ Thống &amp; Cấu Hình Kỹ Thuật (SETTINGS)
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Quản lý tham số dung sai tự động co chữ, độ phân giải xuất in ấn và kiểm soát mẫu Master V4.0.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="file"
            ref={jsonInputRef}
            onChange={handleImportJson}
            accept=".json,application/json"
            className="hidden"
          />

          <button
            type="button"
            onClick={handleExportJson}
            className="bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Sao Lưu JSON</span>
          </button>

          <button
            type="button"
            onClick={() => jsonInputRef.current?.click()}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Nạp File JSON</span>
          </button>

          <button
            type="button"
            onClick={handleResetToDefault}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Mặc Định Master V4.0</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            {saved ? <Check className="w-3.5 h-3.5 text-white" /> : <Save className="w-3.5 h-3.5" />}
            <span>{saved ? 'Đã Lưu Vào Bộ Nhớ' : 'Lưu Cấu Hình Mẫu'}</span>
          </button>
        </div>
      </div>

      {/* Auto-save notification */}
      {notice && (
        <div className="bg-emerald-950 border border-emerald-500/50 rounded-lg p-3 text-emerald-300 text-xs flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-bold">{notice}</span>
          </div>
          <button type="button" onClick={() => setNotice(null)} className="text-slate-400 hover:text-white cursor-pointer px-2">
            ✕
          </button>
        </div>
      )}

      {/* Storage persistence indicator banner */}
      <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              Tự Động Lưu Mẫu Vào Trình Duyệt (LocalStorage Persistence)
            </span>
            <p className="text-[11px] text-slate-400">
              Mọi thay đổi thông số mẫu Master luôn được tự động lưu vĩnh viễn trên thiết bị này. Bạn có thể xuất file JSON để đồng bộ sang máy in hoặc máy tính khác.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Master Dimensions & Locks */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
            1. Khóa Bảo Vệ &amp; Kích Thước Bắt Buộc
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div>
                <div className="font-bold text-white">Trạng Thái Khóa Mẫu Master</div>
                <div className="text-[11px] text-slate-400">Ngăn chặn chỉnh sửa sai lệch quy chuẩn</div>
              </div>
              <button
                type="button"
                onClick={() => setFormConfig({ ...formConfig, isLocked: !formConfig.isLocked })}
                className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 ${
                  formConfig.isLocked
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-red-500/20 text-red-300 border border-red-500/40'
                }`}
              >
                {formConfig.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{formConfig.isLocked ? 'LOCKED' : 'UNLOCKED'}</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-400 mb-1">Mặt Biển In (Rộng × Cao):</label>
                <input
                  type="text"
                  disabled
                  value="500 × 300 mm"
                  className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-bold text-xs rounded-lg px-3 py-2 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-400 mb-1">Cụm Lắp Ghép (Rộng × Cao):</label>
                <input
                  type="text"
                  disabled
                  value="530 × 300 mm"
                  className="w-full bg-slate-950 border border-slate-800 text-amber-400 font-mono font-bold text-xs rounded-lg px-3 py-2 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-400 mb-1">Màu Nền Xanh Chuẩn:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formConfig.backgroundColor}
                  onChange={(e) => setFormConfig({ ...formConfig, backgroundColor: e.target.value })}
                  className="w-8 h-8 rounded border border-slate-700 bg-slate-950 cursor-pointer p-0.5"
                />
                <input
                  type="text"
                  value={formConfig.backgroundColor}
                  onChange={(e) => setFormConfig({ ...formConfig, backgroundColor: e.target.value })}
                  className="bg-slate-950 border border-slate-700 text-white font-mono font-bold text-xs rounded-lg px-3 py-2 flex-1"
                />
              </div>
            </div>

            {/* Font Tiêu đề */}
            <div className="pt-2 border-t border-slate-800">
              <label className="block font-bold text-slate-300 mb-1">Font Tiêu Đề Cố Định:</label>
              <select
                value={formConfig.titleFont}
                onChange={(e) => setFormConfig({ ...formConfig, titleFont: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-bold cursor-pointer"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.family}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Font Tên đường */}
            <div>
              <label className="block font-bold text-slate-300 mb-1">Font Tên Đường:</label>
              <select
                value={formConfig.roadNameFont}
                onChange={(e) => setFormConfig({ ...formConfig, roadNameFont: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 font-bold cursor-pointer"
              >
                {FONT_OPTIONS.map((f) => (
                  <option key={f.id} value={f.family}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Text Fit Parameters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
            2. Tham Số Thuật Toán Auto-Fit Tên Đường
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Chiều cao chữ Tên đường mục tiêu (mm):
              </label>
              <input
                type="number"
                value={formConfig.targetRoadNameHeight}
                onChange={(e) => setFormConfig({ ...formConfig, targetRoadNameHeight: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-xs rounded-lg px-3 py-2"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Chuẩn huyện Hải Lăng: 60mm
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Chiều cao chữ Tên đường tối thiểu khi co nhỏ (mm):
              </label>
              <input
                type="number"
                value={formConfig.minRoadNameHeight}
                onChange={(e) => setFormConfig({ ...formConfig, minRoadNameHeight: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-xs rounded-lg px-3 py-2"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Dung sai tối thiểu: 32mm (Nếu co dưới mức này sẽ cảnh báo LỖI QUÁ DÀI)
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Độ rộng khả dụng bên trong khung (mm):
              </label>
              <input
                type="number"
                value={formConfig.availableWidth}
                onChange={(e) => setFormConfig({ ...formConfig, availableWidth: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-xs rounded-lg px-3 py-2"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Khoảng cách lề an toàn 2 bên khung viền (mặc định 440mm)
              </span>
            </div>
          </div>
        </div>

        {/* Element Positions & Coordinates */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Crosshair className="w-4 h-4 text-rose-400" />
              <span>3. Tùy Chỉnh Tọa Độ Vị Trí Các Thành Phần (Logo, Tiêu Đề, Tên Đường)</span>
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">Đơn vị đo: Milimet (mm)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {/* Logo */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
              <div className="font-bold text-cyan-300">Logo Xã Hải Lăng</div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Tọa độ tâm X (mm):</label>
                <input
                  type="number"
                  value={formConfig.logoX ?? 110}
                  onChange={(e) => setFormConfig({ ...formConfig, logoX: Number(e.target.value) || 110 })}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs rounded-lg px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Tọa độ tâm Y (mm):</label>
                <input
                  type="number"
                  value={formConfig.logoY ?? 96}
                  onChange={(e) => setFormConfig({ ...formConfig, logoY: Number(e.target.value) || 96 })}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs rounded-lg px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Đường kính Logo (mm):</label>
                <input
                  type="number"
                  value={formConfig.logoSize ?? 76}
                  onChange={(e) => setFormConfig({ ...formConfig, logoSize: Number(e.target.value) || 76 })}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs rounded-lg px-3 py-1.5"
                />
              </div>
            </div>

            {/* Title */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
              <div className="font-bold text-amber-300">Chữ Tiêu Đề Cố Định</div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Tọa độ X (mm):</label>
                <input
                  type="number"
                  value={formConfig.titleX ?? 330}
                  onChange={(e) => setFormConfig({ ...formConfig, titleX: Number(e.target.value) || 330 })}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs rounded-lg px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Tọa độ Y (mm):</label>
                <input
                  type="number"
                  value={formConfig.titleY ?? 126}
                  onChange={(e) => setFormConfig({ ...formConfig, titleY: Number(e.target.value) || 126 })}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs rounded-lg px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Chiều cao chữ (mm):</label>
                <input
                  type="number"
                  value={formConfig.titleHeight ?? 48}
                  onChange={(e) => setFormConfig({ ...formConfig, titleHeight: Number(e.target.value) || 48 })}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs rounded-lg px-3 py-1.5"
                />
              </div>
            </div>

            {/* Road Name */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-2.5">
              <div className="font-bold text-emerald-300">Tên Đường (ROAD_NAME)</div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Tọa độ tâm ngang X (mm):</label>
                <input
                  type="number"
                  value={formConfig.roadNameX ?? 250}
                  onChange={(e) => setFormConfig({ ...formConfig, roadNameX: Number(e.target.value) || 250 })}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs rounded-lg px-3 py-1.5"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Tọa độ tâm dọc Y (mm):</label>
                <input
                  type="number"
                  value={formConfig.roadNameY ?? 230}
                  onChange={(e) => setFormConfig({ ...formConfig, roadNameY: Number(e.target.value) || 230 })}
                  className="w-full bg-slate-900 border border-slate-700 text-white font-mono font-bold text-xs rounded-lg px-3 py-1.5"
                />
              </div>
              <div className="pt-2 text-[11px] text-slate-400">
                Tọa độ tâm (250, 230) là chuẩn cân đối giữa tâm mặt biển 500mm và nửa dưới của khung viền.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dataset Reset Shortcuts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm space-y-3">
        <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">
          4. Thử Nghiệm &amp; Tái Lập Dữ Liệu
        </h3>
        <p className="text-xs text-slate-400">
          Bạn có thể nạp nhanh các bộ dữ liệu để kiểm thử hiệu năng và độ chính xác của thuật toán:
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={onLoadTestSigns}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow cursor-pointer transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Nạp 12 Mẫu Bắt Buộc (Rule 34: DX.813, ĐT.2901, Lê Lợi...)</span>
          </button>

          <button
            type="button"
            onClick={() => onGenerateSigns(500)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer transition"
          >
            <span>Sinh 500 Biển (Lô 1)</span>
          </button>

          <button
            type="button"
            onClick={() => onGenerateSigns(4000)}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg cursor-pointer shadow transition"
          >
            <span>Sinh 4.000 Biển Mẫu Dự Án</span>
          </button>
        </div>
      </div>
    </div>
  );
};
