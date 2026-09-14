import { SignItem } from '../types';
import { runSignQc } from '../utils/qcEngine';

// Danh sách các địa danh, tên đường thực tế tại huyện Hải Lăng, Quảng Trị
const HAI_LANG_COMMUNES = [
  'HẢI AN', 'HẢI BA', 'HẢI CHÁNH', 'HẢI DƯƠNG', 'HẢI ĐỊNH',
  'HẢI HƯNG', 'HẢI KHÊ', 'HẢI LÂM', 'HẢI PHONG', 'HẢI PHÚ',
  'HẢI QUY', 'HẢI SƠN', 'HẢI TÂN', 'HẢI THIỆN', 'HẢI THỌ',
  'HẢI THƯỢNG', 'HẢI VĨNH', 'HẢI XUÂN', 'DIÊN SANH'
];

const FAMOUS_NAMES = [
  'LÊ LỢI', 'TRẦN HƯNG ĐẠO', 'NGUYỄN THỊ MINH KHAI', 'QUANG TRUNG',
  'NGUYỄN HUỆ', 'VÕ NGUYÊN GIÁP', 'PHAN BỘI CHÂU', 'PHAN CHÂU TRINH',
  'HUỲNH THÚC KHÁNG', 'NGUYỄN HOÀNG', 'TRẦN PHÚ', 'NGÔ QUYỀN',
  'LÝ THƯỜNG KIỆT', 'ĐINH TIÊN HOÀNG', 'HAI BÀ TRƯNG', 'BÀ TRIỆU',
  'LÊ DUẨN', 'TRƯƠNG HÁN SIÊU', 'NGUYỄN TRÃI', 'CHU VĂN AN'
];

/**
 * 12 biển mẫu bắt buộc theo Rule 10 & Rule 34
 */
export const INITIAL_TEST_SIGNS_DATA: Array<{
  stt: number | string;
  maBien: string;
  tenDuong: string;
  ghiChu: string;
}> = [
  { stt: '001', maBien: 'DX.813', tenDuong: 'DX.813', ghiChu: 'Mẫu chuẩn 1 (Đường xã)' },
  { stt: '002', maBien: 'DX.813B', tenDuong: 'DX.813B', ghiChu: 'Mẫu chuẩn 2 (Đường xã nhánh B)' },
  { stt: '003', maBien: 'ĐT.2901', tenDuong: 'ĐT.2901', ghiChu: 'Mẫu chuẩn 3 (Đường tỉnh)' },
  { stt: '004', maBien: 'ĐT.2901B', tenDuong: 'ĐT.2901B', ghiChu: 'Mẫu chuẩn 4 (Đường tỉnh nhánh B)' },
  { stt: '005', maBien: 'HL.05', tenDuong: 'LÊ LỢI', ghiChu: 'Tên danh nhân ngắn chuẩn 60mm' },
  { stt: '006', maBien: 'HL.06', tenDuong: 'TRẦN HƯNG ĐẠO', ghiChu: 'Tên danh nhân chuẩn 60mm' },
  { stt: '007', maBien: 'HL.07', tenDuong: 'NGUYỄN THỊ MINH KHAI', ghiChu: 'Tên dài trung bình tự động co tỷ lệ' },
  { stt: '008', maBien: 'HL.08', tenDuong: 'ĐƯỜNG NGUYỄN TRÃI NỐI DÀI KHU DI TÍCH LỊCH SỬ HẢI LĂNG', ghiChu: 'TEST BẮT BUỘC: Tên rất dài cảnh báo TOO_LONG' },
  { stt: '009', maBien: 'HL.09', tenDuong: 'ĐƯỜNG LIÊN XÃ HẢI THIỆN - HẢI QUY - HẢI CHÁNH', ghiChu: 'TEST BẮT BUỘC: Đầy đủ dấu tiếng Việt & ký tự nối' },
  { stt: '010', maBien: 'HL.10', tenDuong: 'TRẦN HƯNG ĐẠO', ghiChu: 'TEST BẮT BUỘC: Trùng tên đường với STT 006' },
  { stt: '011', maBien: 'DX.813', tenDuong: 'DX.813 NỐI DÀI', ghiChu: 'TEST BẮT BUỘC: Trùng mã biển DX.813 với STT 001' },
  { stt: '012', maBien: 'DX.999', tenDuong: '', ghiChu: 'TEST BẮT BUỘC: Tên đường bị bỏ trống' },
];

/**
 * Khởi tạo dữ liệu SignItem chuẩn có gắn batch và tính toán QC
 */
export function createSignItemFromRaw(
  raw: { stt: number | string; maBien: string; tenDuong: string; ghiChu?: string },
  batchSize: number = 500
): SignItem {
  const numStt = typeof raw.stt === 'number' ? raw.stt : parseInt(String(raw.stt).replace(/\D/g, ''), 10) || 1;
  const batchNum = Math.ceil(numStt / batchSize);
  const batchName = `BATCH ${String(batchNum).padStart(2, '0')}`;

  const baseItem: Partial<SignItem> = {
    id: `sign_${raw.maBien}_${numStt}_${Math.random().toString(36).substr(2, 6)}`,
    stt: typeof raw.stt === 'number' ? String(raw.stt).padStart(3, '0') : String(raw.stt),
    maBien: (raw.maBien || '').trim().toUpperCase(),
    tenDuong: (raw.tenDuong || '').trim(),
    ghiChu: raw.ghiChu || '',
    batch: batchName,
    artworkWidth: 500,
    artworkHeight: 300,
    assemblyWidth: 530,
    assemblyHeight: 300,
    trimWidth: 30,
    trimHeight: 300,
    exportedFiles: {},
  };

  const qc = runSignQc(baseItem);

  return {
    ...baseItem,
    fontSize: qc.fontSize,
    textWidth: qc.textWidth,
    textHeight: qc.textHeight,
    status: qc.status,
    fitStatus: qc.fitStatus,
    qcErrors: qc.errors,
    qcWarnings: qc.warnings,
  } as SignItem;
}

/**
 * Sinh danh sách 4.000 biển tên đường phục vụ kiểm thử hiệu năng và sản xuất thực tế
 */
export function generateProductionDataset(count: number = 4000, batchSize: number = 500): SignItem[] {
  const items: SignItem[] = [];

  // Thêm 12 biển test mẫu bắt buộc đầu tiên
  INITIAL_TEST_SIGNS_DATA.forEach((raw) => {
    items.push(createSignItemFromRaw(raw, batchSize));
  });

  // Sinh phần còn lại đến `count`
  for (let i = items.length + 1; i <= count; i++) {
    const stt = String(i).padStart(4, '0');
    let maBien = '';
    let tenDuong = '';
    let ghiChu = '';

    const mod = i % 10;
    if (mod < 4) {
      // Đường xã DX
      const dxNum = 800 + (i % 200);
      const sub = (i % 5 === 0) ? 'B' : (i % 7 === 0) ? 'C' : '';
      maBien = `DX.${dxNum}${sub}`;
      tenDuong = maBien;
      ghiChu = `Tuyến đường dân sinh liên thôn ${i % 15 + 1}`;
    } else if (mod < 6) {
      // Đường tỉnh ĐT
      const dtNum = 2900 + (i % 50);
      const sub = (i % 3 === 0) ? 'B' : '';
      maBien = `ĐT.${dtNum}${sub}`;
      tenDuong = maBien;
      ghiChu = 'Đường tỉnh lộ mở rộng';
    } else {
      // Tên danh nhân hoặc địa danh Hải Lăng
      const name = FAMOUS_NAMES[i % FAMOUS_NAMES.length];
      const commune = HAI_LANG_COMMUNES[i % HAI_LANG_COMMUNES.length];
      if (i % 4 === 0) {
        tenDuong = `${name} (${commune})`;
        maBien = `HL.${String(i).padStart(4, '0')}`;
      } else {
        tenDuong = name;
        maBien = `HL.${String(i).padStart(4, '0')}`;
      }
      ghiChu = `Khu trung tâm thị trấn Diên Sanh & xã ${commune}`;
    }

    items.push(createSignItemFromRaw({ stt, maBien, tenDuong, ghiChu }, batchSize));
  }

  return items;
}

export const loadProductionSigns = generateProductionDataset;

/**
 * Tính toán danh sách phân nhóm Batch từ danh sách biển
 */
export function computeBatches(signs: SignItem[], batchSize: number = 500): import('../types').BatchSummary[] {
  const map = new Map<string, SignItem[]>();
  signs.forEach((s) => {
    const list = map.get(s.batch) || [];
    list.push(s);
    map.set(s.batch, list);
  });

  const summaries: import('../types').BatchSummary[] = [];
  Array.from(map.entries()).forEach(([batchName, items]) => {
    let passed = 0;
    let warning = 0;
    let error = 0;
    let exported = 0;

    let minStt = 999999;
    let maxStt = 0;

    items.forEach((item) => {
      const num = parseInt(String(item.stt).replace(/\D/g, ''), 10) || 1;
      if (num < minStt) minStt = num;
      if (num > maxStt) maxStt = num;

      if (item.status === 'QC_PASSED') passed++;
      else if (item.status === 'CHECK_REQUIRED') warning++;
      else if (item.status === 'ERROR') error++;
      else if (item.status === 'EXPORTED') exported++;
    });

    summaries.push({
      batchName,
      startIndex: minStt === 999999 ? 1 : minStt,
      endIndex: maxStt === 0 ? items.length : maxStt,
      total: items.length,
      passed,
      warning,
      error,
      exported,
      isComplete: error === 0,
    });
  });

  return summaries.sort((a, b) => a.startIndex - b.startIndex);
}
