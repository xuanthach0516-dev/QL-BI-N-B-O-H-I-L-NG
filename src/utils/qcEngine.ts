import { SignItem, SignStatus, FitStatus } from '../types';
import { fitRoadName } from './fitRoadName';

export interface QcReport {
  total: number;
  passed: number;
  needCheck: number;
  error: number;
  exported: number;
  duplicateMaBiens: { maBien: string; count: number; stts: string[] }[];
  duplicateTenDuongs: { tenDuong: string; count: number; stts: string[] }[];
  tooLongItems: string[];
  emptyItems: string[];
  unicodeErrorItems: string[];
}

/**
 * Kiểm tra tính hợp lệ của chuỗi Unicode tiếng Việt
 */
export function checkVietnameseUnicode(text: string): { isValid: boolean; issue?: string } {
  if (!text) return { isValid: true };

  // 1. Kiểm tra ký tự lỗi encoding thường gặp:  (U+FFFD), dấu chấm hỏi lẻ loi, font vỡ
  if (text.includes('\uFFFD')) {
    return { isValid: false, issue: 'Ký tự lỗi encoding (Replacement character U+FFFD)' };
  }

  // 2. Kiểm tra dấu hỏi thay thế chữ có dấu (ví dụ: "TRAN HUNG D?O" hoặc "?UONG")
  if (/\b\w*\?\w*\b/.test(text)) {
    return { isValid: false, issue: 'Nghi vấn mất dấu tiếng Việt (chứa dấu hỏi ? trong từ)' };
  }

  // 3. Kiểm tra ký tự xuống dòng (yêu cầu không xuống dòng)
  if (/[\r\n]/.test(text)) {
    return { isValid: false, issue: 'Có ký tự xuống dòng (Tên đường chỉ được trên 1 dòng)' };
  }

  return { isValid: true };
}

/**
 * Chạy QC kiểm định tự động cho một biển
 */
export function runSignQc(
  item: Partial<SignItem>,
  allSigns?: SignItem[]
): {
  status: SignStatus;
  fitStatus: FitStatus;
  errors: string[];
  warnings: string[];
  fontSize: number;
  textWidth: number;
  textHeight: number;
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const rawTenDuong = (item.tenDuong || '').trim();
  const rawMaBien = (item.maBien || '').trim();
  const stt = item.stt !== undefined ? String(item.stt).trim() : '';

  // 1. Kiểm tra thiếu dữ liệu
  if (!stt) {
    errors.push('Thiếu STT');
  }
  if (!rawMaBien) {
    errors.push('Thiếu Mã Biển');
  }
  if (!rawTenDuong) {
    errors.push('Tên đường bị bỏ trống (ROAD_NAME rỗng)');
  }

  // 2. Kiểm tra Unicode tiếng Việt
  const unicodeCheck = checkVietnameseUnicode(rawTenDuong);
  if (!unicodeCheck.isValid) {
    errors.push(`Lỗi Unicode/font: ${unicodeCheck.issue}`);
  }

  // 3. Auto fit & kiểm tra kích thước chữ
  const fit = fitRoadName(rawTenDuong, 440, 60, 32);

  if (fit.status === 'EMPTY') {
    // Đã bắt ở trên
  } else if (fit.status === 'TOO_LONG') {
    errors.push(`Tên đường quá dài (${fit.textWidth}mm > 440mm ở font tối thiểu). Yêu cầu kiểm tra & rút gọn.`);
  } else if (fit.status === 'SCALED') {
    warnings.push(`Chữ được tự động co nhỏ font ${fit.fontSize}px (chiều cao ${fit.textHeight}mm) để vừa khung`);
  }

  // 4. Kiểm tra kích thước mặt in artwork
  if (item.artworkWidth && item.artworkWidth !== 500) {
    errors.push(`Kích thước mặt in phải là 500mm (hiện tại: ${item.artworkWidth}mm)`);
  }
  if (item.artworkHeight && item.artworkHeight !== 300) {
    errors.push(`Chiều cao mặt in phải là 300mm (hiện tại: ${item.artworkHeight}mm)`);
  }

  // 5. Kiểm tra trùng lặp nếu có danh sách đầy đủ
  if (allSigns && rawMaBien) {
    const dupMa = allSigns.filter(
      (s) => s.id !== item.id && s.maBien.trim().toUpperCase() === rawMaBien.toUpperCase()
    );
    if (dupMa.length > 0) {
      errors.push(`Trùng mã biển '${rawMaBien}' với STT: ${dupMa.map((d) => d.stt).join(', ')}`);
    }
  }

  if (allSigns && rawTenDuong) {
    const dupTen = allSigns.filter(
      (s) => s.id !== item.id && s.tenDuong.trim().toUpperCase() === rawTenDuong.toUpperCase()
    );
    if (dupTen.length > 0) {
      warnings.push(`Trùng tên đường với STT: ${dupTen.map((d) => d.stt).join(', ')} (Cần xác nhận 2 vị trí lắp)`);
    }
  }

  // Xác định trạng thái tổng kết
  let status: SignStatus = 'QC_PASSED';
  if (errors.length > 0) {
    status = 'ERROR';
  } else if (warnings.length > 0) {
    status = 'CHECK_REQUIRED';
  } else if (item.exportedFiles && (item.exportedFiles.svg || item.exportedFiles.pdf || item.exportedFiles.png)) {
    status = 'EXPORTED';
  }

  return {
    status,
    fitStatus: fit.status,
    errors,
    warnings,
    fontSize: fit.fontSize,
    textWidth: fit.textWidth,
    textHeight: fit.textHeight,
  };
}

/**
 * Chạy QC toàn bộ danh sách và tạo báo cáo tổng thể
 */
export function runBatchQc(signs: SignItem[]): {
  updatedSigns: SignItem[];
  report: QcReport;
} {
  // Thống kê trùng mã và tên trước
  const maMap = new Map<string, string[]>();
  const tenMap = new Map<string, string[]>();

  for (const s of signs) {
    const ma = (s.maBien || '').trim().toUpperCase();
    const ten = (s.tenDuong || '').trim().toUpperCase();
    const sttStr = String(s.stt);

    if (ma) {
      if (!maMap.has(ma)) maMap.set(ma, []);
      maMap.get(ma)!.push(sttStr);
    }
    if (ten) {
      if (!tenMap.has(ten)) tenMap.set(ten, []);
      tenMap.get(ten)!.push(sttStr);
    }
  }

  let passed = 0;
  let needCheck = 0;
  let errorCount = 0;
  let exported = 0;

  const tooLongItems: string[] = [];
  const emptyItems: string[] = [];
  const unicodeErrorItems: string[] = [];

  const updatedSigns = signs.map((sign) => {
    const qc = runSignQc(sign, signs);

    if (qc.fitStatus === 'TOO_LONG') {
      tooLongItems.push(String(sign.stt));
    }
    if (qc.fitStatus === 'EMPTY') {
      emptyItems.push(String(sign.stt));
    }
    if (qc.errors.some((e) => e.includes('Unicode'))) {
      unicodeErrorItems.push(String(sign.stt));
    }

    if (qc.status === 'ERROR') errorCount++;
    else if (qc.status === 'CHECK_REQUIRED') needCheck++;
    else if (qc.status === 'EXPORTED') exported++;
    else passed++;

    return {
      ...sign,
      status: qc.status,
      fitStatus: qc.fitStatus,
      qcErrors: qc.errors,
      qcWarnings: qc.warnings,
      fontSize: qc.fontSize,
      textWidth: qc.textWidth,
      textHeight: qc.textHeight,
    };
  });

  const duplicateMaBiens = Array.from(maMap.entries())
    .filter(([_, list]) => list.length > 1)
    .map(([maBien, stts]) => ({ maBien, count: stts.length, stts }));

  const duplicateTenDuongs = Array.from(tenMap.entries())
    .filter(([_, list]) => list.length > 1)
    .map(([tenDuong, stts]) => ({ tenDuong, count: stts.length, stts }));

  return {
    updatedSigns,
    report: {
      total: signs.length,
      passed,
      needCheck,
      error: errorCount,
      exported,
      duplicateMaBiens,
      duplicateTenDuongs,
      tooLongItems,
      emptyItems,
      unicodeErrorItems,
    },
  };
}
