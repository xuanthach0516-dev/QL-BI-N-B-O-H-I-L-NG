import React, { useState, useEffect } from 'react';
import { X, Save, Eye, CheckCircle2, AlertTriangle, XCircle, ShieldCheck } from 'lucide-react';
import { SignItem, MasterConfig } from '../types';
import { fitRoadName } from '../utils/fitRoadName';
import { generateMasterArtworkSvg } from '../utils/masterSvg';
import { runSignQc } from '../utils/qcEngine';

interface SignEditModalProps {
  sign: SignItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedSign: SignItem) => void;
  masterConfig: MasterConfig;
  allSigns: SignItem[];
}

export const SignEditModal: React.FC<SignEditModalProps> = ({
  sign,
  isOpen,
  onClose,
  onSave,
  masterConfig,
  allSigns,
}) => {
  if (!isOpen || !sign) return null;

  const [maBien, setMaBien] = useState(sign.maBien);
  const [tenDuong, setTenDuong] = useState(sign.tenDuong);
  const [ghiChu, setGhiChu] = useState(sign.ghiChu || '');
  const [batch, setBatch] = useState(sign.batch);

  // Tính toán thời gian thực
  const upperTenDuong = tenDuong.trim().toUpperCase();
  const fit = fitRoadName(
    upperTenDuong,
    masterConfig.availableWidth,
    masterConfig.targetRoadNameHeight,
    masterConfig.minRoadNameHeight
  );

  const previewItem: SignItem = {
    ...sign,
    maBien: maBien.trim(),
    tenDuong: upperTenDuong,
    ghiChu: ghiChu.trim(),
    batch,
    fontSize: fit.fontSize,
    textWidth: fit.textWidth,
    textHeight: fit.textHeight,
    fitStatus: fit.status,
  };

  const previewSvg = generateMasterArtworkSvg(previewItem, masterConfig);
  const qcResult = runSignQc(previewItem, allSigns);

  const handleSave = () => {
    onSave({
      ...previewItem,
      status: qcResult.status,
      qcErrors: qcResult.errors,
      qcWarnings: qcResult.warnings,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <h3 className="font-extrabold text-white text-base uppercase">
              Chỉnh Sửa Biển #{sign.stt} - {sign.maBien}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Form Fields */}
            <div className="md:col-span-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Mã Biển:
                </label>
                <input
                  type="text"
                  value={maBien}
                  onChange={(e) => setMaBien(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-mono font-bold text-xs rounded-lg px-3 py-2 uppercase focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Tên Tuyến Đường (ROAD_NAME - Tự động IN HOA):
                </label>
                <input
                  type="text"
                  value={tenDuong}
                  onChange={(e) => setTenDuong(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-xs rounded-lg px-3 py-2 uppercase focus:outline-none focus:border-blue-500"
                  placeholder="Nhập tên đường..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Nhóm Lô (Batch):
                  </label>
                  <input
                    type="text"
                    value={batch}
                    onChange={(e) => setBatch(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Ghi Chú Kỹ Thuật:
                  </label>
                  <input
                    type="text"
                    value={ghiChu}
                    onChange={(e) => setGhiChu(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* QC Live Diagnostics */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-slate-300 flex items-center justify-between">
                  <span>Chẩn Đoán QC Trực Tiếp:</span>
                  {qcResult.status === 'QC_PASSED' && (
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hợp Chuẩn
                    </span>
                  )}
                  {qcResult.status === 'CHECK_REQUIRED' && (
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Lưu Ý
                    </span>
                  )}
                  {qcResult.status === 'ERROR' && (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <XCircle className="w-3.5 h-3.5" /> Lỗi
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 space-y-1">
                  <div>• Chiều cao chữ: <strong className="text-white">{fit.textHeight} mm</strong> (chuẩn 60mm)</div>
                  <div>• Chiều rộng chữ: <strong className="text-white">{fit.textWidth} mm</strong> / 440mm</div>
                  <div>• Co dãn đồng dạng: <strong className="text-emerald-400">100% tỷ lệ X/Y</strong></div>
                </div>

                {qcResult.errors.length > 0 && (
                  <div className="p-2 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[11px] space-y-1">
                    {qcResult.errors.map((err, i) => (
                      <div key={i}>❌ {err}</div>
                    ))}
                  </div>
                )}

                {qcResult.warnings.length > 0 && (
                  <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] space-y-1">
                    {qcResult.warnings.map((w, i) => (
                      <div key={i}>⚠️ {w}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Live SVG Preview Box */}
            <div className="md:col-span-6 space-y-2">
              <div className="text-xs font-bold text-slate-400 flex items-center justify-between">
                <span>Mặt Biển In Xem Trước (500 × 300 mm):</span>
                <span className="text-emerald-400 font-mono text-[10px]">Tỷ lệ 5:3</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-center">
                <div
                  className="w-full aspect-[5/3] drop-shadow-xl"
                  dangerouslySetInnerHTML={{ __html: previewSvg }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
          >
            Hủy Bỏ
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow transition"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Biển</span>
          </button>
        </div>
      </div>
    </div>
  );
};
