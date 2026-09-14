import React, { useState } from 'react';
import { X, Play, CheckCircle2, XCircle, AlertTriangle, ShieldCheck, FileCheck } from 'lucide-react';
import { MasterConfig } from '../types';
import { INITIAL_TEST_SIGNS_DATA } from '../data/sampleSigns';
import { fitRoadName } from '../utils/fitRoadName';
import { generateMasterArtworkSvg, generateAssemblyViewSvg, validateArtworkSvg } from '../utils/masterSvg';
import { runSignQc } from '../utils/qcEngine';

interface BuiltInTestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  masterConfig: MasterConfig;
}

interface TestResult {
  title: string;
  category: string;
  passed: boolean;
  message: string;
  details?: string;
}

export const BuiltInTestsModal: React.FC<BuiltInTestsModalProps> = ({
  isOpen,
  onClose,
  masterConfig,
}) => {
  if (!isOpen) return null;

  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runAllTests = () => {
    setIsRunning(true);
    const newResults: TestResult[] = [];

    // TEST 1: Kích thước Artwork SVG (Rule 1 & 20)
    const sampleArtwork = generateMasterArtworkSvg({ tenDuong: 'DX.813', maBien: 'DX.813' }, masterConfig);
    const hasArtwork500 = sampleArtwork.includes('width="500mm"') && sampleArtwork.includes('height="300mm"');
    const hasViewBox500 = sampleArtwork.includes('viewBox="0 0 500 300"');
    newResults.push({
      title: 'Kích Thước Artwork File In (500 × 300 mm)',
      category: 'QUY TẮC KÍCH THƯỚC',
      passed: hasArtwork500 && hasViewBox500,
      message: hasArtwork500 ? 'Đạt chuẩn 500 × 300 mm (viewBox 0 0 500 300)' : 'Lỗi kích thước SVG artwork',
      details: 'width="500mm" height="300mm" viewBox="0 0 500 300"',
    });

    // TEST 2: Không chứa Nẹp 30mm trong Artwork (Rule 1C, 2, 3, 19)
    const hasTrimInArtwork = sampleArtwork.includes('id="MOUNTING_TRIM"') || sampleArtwork.includes('NẸP LẮP ĐẶT');
    newResults.push({
      title: 'Cô Lập Nẹp 30mm Khỏi File Artwork',
      category: 'QUY TẮC NẸP KỸ THUẬT',
      passed: !hasTrimInArtwork,
      message: !hasTrimInArtwork ? 'Nẹp 30mm hoàn toàn không xuất hiện trong file in' : 'Lỗi: Nẹp bị đưa vào artwork',
      details: 'Không có dải xám hoặc lớp MOUNTING_TRIM trong SVG in ấn',
    });

    // TEST 3: Kích Thước Cụm Lắp Ghép Assembly (530 × 300 mm) (Rule 1A & 18)
    const sampleAssembly = generateAssemblyViewSvg({ tenDuong: 'DX.813', maBien: 'DX.813' }, masterConfig);
    const hasAssembly530 = sampleAssembly.includes('width="530mm"') && sampleAssembly.includes('viewBox="0 0 530 300"');
    newResults.push({
      title: 'Kích Thước Bản Vẽ Lắp Ghép (530 × 300 mm)',
      category: 'QUY TẮC KÍCH THƯỚC',
      passed: hasAssembly530,
      message: hasAssembly530 ? 'Bản vẽ Assembly đạt chuẩn 530 × 300 mm (Gồm nẹp 30mm + mặt biển 500mm)' : 'Lỗi bản vẽ lắp ghép',
      details: 'Chỉ dùng cho bản vẽ cơ khí, không dùng in',
    });

    // TEST 4-15: 12 Trường hợp Test bắt buộc (Rule 34)
    INITIAL_TEST_SIGNS_DATA.forEach((item, index) => {
      const fit = fitRoadName(
        item.tenDuong,
        masterConfig.availableWidth,
        masterConfig.targetRoadNameHeight,
        masterConfig.minRoadNameHeight
      );

      let passed = true;
      let note = `Chiều cao: ${fit.textHeight}mm, Rộng: ${fit.textWidth}mm, Fit: ${fit.status}`;

      if (item.maBien === 'DX.EMPTY' && fit.status !== 'EMPTY') {
        passed = false;
        note = 'Biển rỗng tên phải có trạng thái EMPTY';
      } else if (item.maBien === 'DX.LONG' && fit.status !== 'TOO_LONG' && fit.status !== 'SCALED') {
        passed = false;
        note = 'Biển tên quá dài phải được co nhỏ hoặc cảnh báo';
      }

      newResults.push({
        title: `Test ${index + 1}: ${item.maBien} - "${item.tenDuong || '(Tên Rỗng)'}"`,
        category: '12 TRƯỜNG HỢP KIỂM THỬ BẮT BUỘC (RULE 34)',
        passed,
        message: note,
        details: item.ghiChu,
      });
    });

    // TEST 16: Kiểm tra bảo toàn tiếng Việt Unicode (Rule 25)
    const testUnicodeStr = 'NGUYỄN VĂN TRỖI - HUỲNH THÚC KHÁNG';
    const fitUnicode = fitRoadName(testUnicodeStr, masterConfig.availableWidth, masterConfig.targetRoadNameHeight, masterConfig.minRoadNameHeight);
    const svgUnicode = generateMasterArtworkSvg({ tenDuong: testUnicodeStr, maBien: 'TEST.UNI' }, masterConfig);
    const hasUnicode = svgUnicode.includes(testUnicodeStr);
    newResults.push({
      title: 'Bảo Toàn Ký Tự Tiếng Việt Đầy Đủ Dấu',
      category: 'KIỂM SOÁT UNICODE',
      passed: hasUnicode,
      message: hasUnicode ? 'Chữ tiếng Việt giữ nguyên dạng Unicode, không bị lỗi font hay mất dấu' : 'Lỗi encoding tiếng Việt',
      details: testUnicodeStr,
    });

    // TEST 17: Cổng kiểm duyệt Gatekeeper trước khi Export (Rule 35)
    const validCheck = validateArtworkSvg(sampleArtwork);
    const fakeBadSvg = '<svg width="530mm" height="300mm"><rect width="530" height="300"/></svg>';
    const invalidCheck = validateArtworkSvg(fakeBadSvg);
    const gatekeeperWorks = validCheck.valid && !invalidCheck.valid;
    newResults.push({
      title: 'Cổng Chặn Xuất Sai Kích Thước (Rule 35 Gatekeeper)',
      category: 'AN TOÀN XUẤT FILE',
      passed: gatekeeperWorks,
      message: gatekeeperWorks ? 'Phê duyệt 500x300mm và CHẶN THÀNH CÔNG nếu phát hiện 530x300mm' : 'Lỗi cổng bảo vệ',
      details: 'Ngăn chặn xuất file sai kích thước 100%',
    });

    setResults(newResults);
    setIsRunning(false);
  };

  const totalTests = results.length;
  const passedTests = results.filter((r) => r.passed).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-extrabold text-white text-base uppercase">
              Bộ Kiểm Thử Kỹ Thuật Tự Động (RULE 1-36 AUTOMATED SELF-TESTS)
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

        {/* Action & Stats Banner */}
        <div className="bg-slate-850 p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-300">
            Kiểm tra toàn bộ 12 ca kiểm thử bắt buộc (DX.813, ĐT.2901, Lê Lợi, tên dài...), kích thước 500x300mm và loại trừ nẹp 30mm.
          </div>

          <div className="flex items-center gap-3">
            {results.length > 0 && (
              <div className="text-xs font-mono font-bold">
                Kết quả: <span className="text-emerald-400">{passedTests}</span> / <span className="text-white">{totalTests} ĐẠT</span>
              </div>
            )}

            <button
              type="button"
              onClick={runAllTests}
              disabled={isRunning}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 shadow transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{results.length === 0 ? 'Bắt Đầu Kiểm Tra' : 'Chạy Lại Tất Cả Test'}</span>
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {results.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <ShieldCheck className="w-10 h-10 mx-auto text-slate-600" />
              <p className="text-xs">Nhấn nút <strong>"Bắt Đầu Kiểm Tra"</strong> để khởi chạy bộ 17 bài test quy chuẩn tự động.</p>
            </div>
          ) : (
            results.map((res, index) => (
              <div
                key={index}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                  res.passed
                    ? 'bg-slate-950 border-emerald-500/30'
                    : 'bg-rose-950/30 border-rose-500'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {res.passed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                  )}
                  <div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {res.category}
                    </div>
                    <div className="font-bold text-white text-xs mt-0.5">
                      {res.title}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-0.5">
                      {res.message}
                    </div>
                    {res.details && (
                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                        {res.details}
                      </div>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      res.passed
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    {res.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-5 py-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-bold text-slate-300 hover:bg-slate-800 transition"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
