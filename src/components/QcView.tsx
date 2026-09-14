import React, { useState, useMemo } from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  Check,
  AlertOctagon,
  Copy,
  Edit2,
  Eye,
} from 'lucide-react';
import { SignItem } from '../types';
import { runBatchQc } from '../utils/qcEngine';

interface QcViewProps {
  signs: SignItem[];
  onUpdateSigns: (newSigns: SignItem[]) => void;
  onPreviewSign: (sign: SignItem) => void;
  onEditSign: (sign: SignItem) => void;
}

export const QcView: React.FC<QcViewProps> = ({
  signs,
  onUpdateSigns,
  onPreviewSign,
  onEditSign,
}) => {
  const [activeTab, setActiveTab] = useState<'ALL_ISSUES' | 'DUP_CODE' | 'DUP_NAME' | 'TOO_LONG' | 'EMPTY'>('ALL_ISSUES');
  const [searchTerm, setSearchTerm] = useState('');

  // Chạy Batch QC
  const { updatedSigns, report } = useMemo(() => {
    return runBatchQc(signs);
  }, [signs]);

  // Bộ lọc danh sách vấn đề QC
  const issueSigns = useMemo(() => {
    return updatedSigns.filter((sign) => {
      const matchSearch =
        !searchTerm ||
        sign.stt.toString().includes(searchTerm) ||
        sign.maBien.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sign.tenDuong.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (activeTab === 'ALL_ISSUES') {
        return sign.status === 'ERROR' || sign.status === 'CHECK_REQUIRED';
      }
      if (activeTab === 'DUP_CODE') {
        return sign.qcErrors.some((e) => e.includes('Trùng mã biển'));
      }
      if (activeTab === 'DUP_NAME') {
        return sign.qcWarnings.some((w) => w.includes('Trùng tên đường'));
      }
      if (activeTab === 'TOO_LONG') {
        return sign.fitStatus === 'TOO_LONG';
      }
      if (activeTab === 'EMPTY') {
        return sign.fitStatus === 'EMPTY' || !sign.maBien || !sign.tenDuong;
      }
      return true;
    });
  }, [updatedSigns, activeTab, searchTerm]);

  const handleScanAll = () => {
    onUpdateSigns(updatedSigns);
    alert(`Quét hoàn tất: ${report.passed} Đạt QC | ${report.needCheck} Cần kiểm tra | ${report.error} Lỗi`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Summary Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-lg font-black text-white uppercase tracking-tight">
              Trung Tâm Kiểm Định Chất Lượng Tự Động (QC ENGINE)
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl">
            Tự động kiểm soát 9 quy tắc bắt buộc: Kích thước 500×300mm, không nẹp trong artwork, ROAD_NAME hợp lệ, không tràn khung, không xuống dòng, không mất dấu tiếng Việt, không trùng mã, cảnh báo trùng tên.
          </p>
        </div>

        <button
          type="button"
          onClick={handleScanAll}
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center gap-2 shadow transition cursor-pointer shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Quét Lại Toàn Bộ ({signs.length} Biển)</span>
        </button>
      </div>

      {/* QC Metric Counter Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('ALL_ISSUES')}
          className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
            activeTab === 'ALL_ISSUES'
              ? 'bg-slate-800 border-blue-500 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <div className="text-[11px] font-bold text-slate-400 uppercase">Tất Cả Vấn Đề</div>
          <div className="text-2xl font-black text-white font-mono mt-1">
            {report.error + report.needCheck}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">{report.error} lỗi / {report.needCheck} lưu ý</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DUP_CODE')}
          className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
            activeTab === 'DUP_CODE'
              ? 'bg-slate-800 border-rose-500 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <div className="text-[11px] font-bold text-rose-400 uppercase">Trùng Mã Biển</div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {report.duplicateMaBiens.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Lỗi nghiêm trọng</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('DUP_NAME')}
          className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
            activeTab === 'DUP_NAME'
              ? 'bg-slate-800 border-amber-500 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <div className="text-[11px] font-bold text-amber-400 uppercase">Trùng Tên Đường</div>
          <div className="text-2xl font-black text-amber-400 font-mono mt-1">
            {report.duplicateTenDuongs.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Cần người dùng xác nhận</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TOO_LONG')}
          className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
            activeTab === 'TOO_LONG'
              ? 'bg-slate-800 border-rose-500 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <div className="text-[11px] font-bold text-rose-400 uppercase">Tên Quá Dài</div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {report.tooLongItems.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Vượt quá dung sai</div>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('EMPTY')}
          className={`p-3.5 rounded-xl border text-left transition cursor-pointer ${
            activeTab === 'EMPTY'
              ? 'bg-slate-800 border-rose-500 shadow-md'
              : 'bg-slate-900 border-slate-800 hover:bg-slate-850'
          }`}
        >
          <div className="text-[11px] font-bold text-rose-400 uppercase">Thiếu Dữ Liệu</div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-1">
            {report.emptyItems.length}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Rỗng tên hoặc mã</div>
        </button>
      </div>

      {/* Search & Issue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm space-y-3 p-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo STT, mã hoặc tên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-white text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="text-xs text-slate-400">
            Tìm thấy <strong className="text-white">{issueSigns.length}</strong> biển cần chú ý
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase text-[11px]">
                <th className="py-2.5 px-3 w-16">STT</th>
                <th className="py-2.5 px-3 w-28">Mã Biển</th>
                <th className="py-2.5 px-4">Tên Đường</th>
                <th className="py-2.5 px-4">Chi Tiết Lỗi / Cảnh Báo QC</th>
                <th className="py-2.5 px-28 text-center">Tình Trạng Fit</th>
                <th className="py-2.5 px-3 w-28 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {issueSigns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-emerald-400 font-bold">
                    ✓ Không có vấn đề nào trong danh mục đã chọn!
                  </td>
                </tr>
              ) : (
                issueSigns.map((sign) => {
                  const isError = sign.status === 'ERROR';

                  return (
                    <tr key={sign.id} className="hover:bg-slate-850/60 transition">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-300">
                        {sign.stt}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        {sign.maBien || <span className="text-rose-400">RỖNG</span>}
                      </td>
                      <td className="py-2.5 px-4 font-bold text-white">
                        {sign.tenDuong || <span className="text-rose-400 italic">RỖNG (CHƯA CÓ TÊN)</span>}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="space-y-0.5">
                          {sign.qcErrors.map((err, i) => (
                            <div key={i} className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{err}</span>
                            </div>
                          ))}
                          {sign.qcWarnings.map((warn, i) => (
                            <div key={i} className="text-[11px] font-medium text-amber-400 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                              <span>{warn}</span>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        {sign.fitStatus === 'TOO_LONG' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            QUÁ DÀI ({sign.textWidth}mm)
                          </span>
                        )}
                        {sign.fitStatus === 'SCALED' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            CO NHỎ ({sign.fontSize}px)
                          </span>
                        )}
                        {sign.fitStatus === 'EMPTY' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            TÊN RỖNG
                          </span>
                        )}
                        {sign.fitStatus === 'OK' && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            CHUẨN
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onPreviewSign(sign)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            title="Xem trước biển này"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditSign(sign)}
                            className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition cursor-pointer"
                            title="Chỉnh sửa thông tin để sửa lỗi"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
