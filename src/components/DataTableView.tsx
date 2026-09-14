import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  Upload,
  Search,
  Filter,
  Eye,
  Edit2,
  FileSpreadsheet,
  Download,
  AlertCircle,
  CheckCircle,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { SignItem, SignStatus, MasterConfig } from '../types';
import { createSignItemFromRaw, INITIAL_TEST_SIGNS_DATA } from '../data/sampleSigns';
import { runSignQc } from '../utils/qcEngine';
import { exportSingleSvg, exportSinglePdf, exportSinglePng } from '../utils/exportUtils';

interface DataTableViewProps {
  signs: SignItem[];
  onUpdateSigns: (newSigns: SignItem[]) => void;
  onPreviewSign: (sign: SignItem) => void;
  onEditSign: (sign: SignItem) => void;
  masterConfig: MasterConfig;
  onExportExcel: () => void;
  onLoadTestSigns: () => void;
  onGenerateProductionSigns: (count: number) => void;
}

export const DataTableView: React.FC<DataTableViewProps> = ({
  signs,
  onUpdateSigns,
  onPreviewSign,
  onEditSign,
  masterConfig,
  onExportExcel,
  onLoadTestSigns,
  onGenerateProductionSigns,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Danh sách các batch hiện có
  const batchList = useMemo(() => {
    const set = new Set<string>();
    signs.forEach((s) => set.add(s.batch));
    return Array.from(set).sort();
  }, [signs]);

  // Bộ lọc dữ liệu tìm kiếm
  const filteredSigns = useMemo(() => {
    return signs.filter((sign) => {
      const matchSearch =
        !searchTerm ||
        sign.stt.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
        sign.maBien.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sign.tenDuong.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sign.ghiChu && sign.ghiChu.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchStatus =
        statusFilter === 'ALL' || sign.status === statusFilter;

      const matchBatch =
        batchFilter === 'ALL' || sign.batch === batchFilter;

      return matchSearch && matchStatus && matchBatch;
    });
  }, [signs, searchTerm, statusFilter, batchFilter]);

  // Phân trang
  const totalPages = Math.max(1, Math.ceil(filteredSigns.length / pageSize));
  const paginatedSigns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSigns.slice(start, start + pageSize);
  }, [filteredSigns, currentPage, pageSize]);

  // Xử lý Import Excel / CSV (Rule 14: Tự nhận diện STT, MA_BIEN, TEN_DUONG, GHI_CHU)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const workbook = XLSX.read(bstr, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const rawJson: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawJson || rawJson.length === 0) {
          alert('File Excel không có dữ liệu');
          setIsUploading(false);
          return;
        }

        // Tự động nhận diện cột (Rule 14)
        const parsedItems: SignItem[] = rawJson.map((row, index) => {
          // 1. Nhận diện STT
          const sttKey = Object.keys(row).find((k) =>
            /^(stt|số tt|so tt|stt\.)$/i.test(k.trim())
          );
          const rawStt = sttKey ? row[sttKey] : index + 1;

          // 2. Nhận diện MA_BIEN
          const maKey = Object.keys(row).find((k) =>
            /^(ma_bien|mã biển|ma bien|mã hiệu|code)$/i.test(k.trim())
          );
          const rawMaBien = maKey ? String(row[maKey]).trim() : `DX.${String(index + 1).padStart(3, '0')}`;

          // 3. Nhận diện TEN_DUONG
          const tenKey = Object.keys(row).find((k) =>
            /^(ten_duong|tên đường|ten duong|tên tuyến|name)$/i.test(k.trim())
          );
          const rawTenDuong = tenKey ? String(row[tenKey]).trim() : '';

          // 4. Nhận diện GHI_CHU
          const noteKey = Object.keys(row).find((k) =>
            /^(ghi_chu|ghi chú|ghi chu|note|notes)$/i.test(k.trim())
          );
          const rawNote = noteKey ? String(row[noteKey]).trim() : '';

          return createSignItemFromRaw({
            stt: rawStt,
            maBien: rawMaBien,
            tenDuong: rawTenDuong,
            ghiChu: rawNote,
          });
        });

        onUpdateSigns(parsedItems);
        setCurrentPage(1);
        alert(`Đã nhập thành công ${parsedItems.length} biển từ file Excel/CSV!`);
      } catch (err: any) {
        alert('Lỗi đọc file Excel: ' + (err.message || String(err)));
      } finally {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    reader.readAsBinaryString(file);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Top Controls: Import, Generator, Excel Export */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>{isUploading ? 'Đang đọc...' : 'Nhập Excel / CSV (XLSX)'}</span>
          </button>

          <button
            type="button"
            onClick={onLoadTestSigns}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
            title="Nạp 12 mẫu kiểm thử chuẩn (DX.813, DX.813B, ĐT.2901, Lê Lợi, Trần Hưng Đạo, Nguyễn Thị Minh Khai...)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>12 Biển Mẫu Bắt Buộc</span>
          </button>

          <button
            type="button"
            onClick={() => onGenerateProductionSigns(500)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Sinh Lô 1 (500 Biển)</span>
          </button>

          <button
            type="button"
            onClick={() => onGenerateProductionSigns(4000)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
          >
            <span>Sinh 4.000 Biển Toàn Huyện</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onExportExcel}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
            title="Xuất danh sách đầy đủ 17 cột kỹ thuật"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Xuất Excel (17 Cột Chuẩn)</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo STT, Mã biển, Tên đường..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-slate-900 border border-slate-700 text-white text-xs rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả trạng thái ({signs.length})</option>
            <option value="QC_PASSED">Đạt QC</option>
            <option value="CHECK_REQUIRED">Cần kiểm tra</option>
            <option value="ERROR">Lỗi</option>
            <option value="EXPORTED">Đã xuất</option>
          </select>

          {/* Batch Filter */}
          <select
            value={batchFilter}
            onChange={(e) => {
              setBatchFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Tất cả các lô</option>
            {batchList.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Page Size */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value={25}>25 / trang</option>
            <option value={50}>50 / trang</option>
            <option value={100}>100 / trang</option>
            <option value={250}>250 / trang</option>
          </select>
        </div>
      </div>

      {/* Main Table (Rule 16: STT | MÃ BIỂN | TÊN ĐƯỜNG | CHIỀU CAO CHỮ | CHIỀU RỘNG TEXT | STATUS | BATCH | FILE) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-3 w-16">STT</th>
                <th className="py-3 px-3 w-28">Mã Biển</th>
                <th className="py-3 px-4">Tên Đường</th>
                <th className="py-3 px-3 w-24 text-center">Chiều Cao Chữ</th>
                <th className="py-3 px-3 w-28 text-center">Chiều Rộng Text</th>
                <th className="py-3 px-3 w-28 text-center">Status</th>
                <th className="py-3 px-3 w-24 text-center">Batch</th>
                <th className="py-3 px-3 w-24 text-center">File In</th>
                <th className="py-3 px-3 w-28 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {paginatedSigns.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    Không tìm thấy dữ liệu biển nào phù hợp
                  </td>
                </tr>
              ) : (
                paginatedSigns.map((sign) => {
                  const hasError = sign.status === 'ERROR';
                  const hasWarning = sign.status === 'CHECK_REQUIRED';
                  const isPassed = sign.status === 'QC_PASSED';
                  const isExported = sign.status === 'EXPORTED';

                  return (
                    <tr
                      key={sign.id}
                      className="hover:bg-slate-850/60 transition group"
                    >
                      {/* STT */}
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-300">
                        {sign.stt}
                      </td>

                      {/* Mã Biển */}
                      <td className="py-2.5 px-3 font-mono font-bold text-white">
                        {sign.maBien}
                      </td>

                      {/* Tên Đường */}
                      <td className="py-2.5 px-4 font-bold text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-white text-xs">{sign.tenDuong || <em className="text-rose-400 font-normal">Chưa có tên</em>}</span>
                          {sign.fitStatus === 'SCALED' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-normal">
                              Co nhỏ
                            </span>
                          )}
                          {sign.fitStatus === 'TOO_LONG' && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-normal">
                              Quá dài
                            </span>
                          )}
                        </div>
                        {sign.qcErrors.length > 0 && (
                          <div className="text-[10px] text-rose-400 font-normal mt-0.5">
                            {sign.qcErrors[0]}
                          </div>
                        )}
                      </td>

                      {/* Chiều Cao Chữ (target 60mm) */}
                      <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                        <span className={sign.textHeight < 55 ? 'text-amber-300 font-bold' : 'text-slate-300'}>
                          {sign.textHeight} mm
                        </span>
                      </td>

                      {/* Chiều Rộng Text */}
                      <td className="py-2.5 px-3 text-center font-mono text-slate-300">
                        <span className={sign.textWidth > 430 ? 'text-amber-300 font-bold' : 'text-slate-300'}>
                          {sign.textWidth} mm
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        {hasError && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Lỗi
                          </span>
                        )}
                        {hasWarning && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Cần kiểm tra
                          </span>
                        )}
                        {isPassed && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Đạt QC
                          </span>
                        )}
                        {isExported && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                            Đã xuất
                          </span>
                        )}
                      </td>

                      {/* Batch */}
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-400">
                        {sign.batch}
                      </td>

                      {/* File In (500x300mm) */}
                      <td className="py-2.5 px-3 text-center font-mono text-[11px] text-emerald-400 font-bold">
                        500×300
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => onPreviewSign(sign)}
                            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                            title="Xem trước Artwork / Assembly"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditSign(sign)}
                            className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition cursor-pointer"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => exportSingleSvg(sign, masterConfig)}
                            className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition cursor-pointer"
                            title="Tải SVG 500x300mm"
                          >
                            <Download className="w-3.5 h-3.5" />
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

        {/* Pagination Bar */}
        <div className="bg-slate-950 px-4 py-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            Hiển thị <span className="text-white font-bold">{filteredSigns.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</span> đến{' '}
            <span className="text-white font-bold">{Math.min(currentPage * pageSize, filteredSigns.length)}</span> trong tổng số{' '}
            <span className="text-white font-bold">{filteredSigns.length.toLocaleString()}</span> biển
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 py-1 font-mono text-white">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-1 rounded bg-slate-800 text-slate-300 disabled:opacity-40 hover:bg-slate-700 transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
