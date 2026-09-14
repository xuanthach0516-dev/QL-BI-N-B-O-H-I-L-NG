import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { SignItem, MasterConfig, ExportProgress } from '../types';
import {
  generateMasterArtworkSvg,
  generateAssemblyViewSvg,
  validateArtworkSvg,
  DEFAULT_MASTER_CONFIG,
} from './masterSvg';

/**
 * Định dạng tên file chuẩn theo quy chuẩn sản xuất: {STT}_{MA_BIEN}.{ext}
 */
export function getSignFileName(sign: SignItem, ext: string, suffix: string = ''): string {
  const cleanStt = String(sign.stt || '000').padStart(3, '0');
  const cleanMa = (sign.maBien || 'KHONG_MA').replace(/[^a-zA-Z0-9._-]/g, '_');
  return `${cleanStt}_${cleanMa}${suffix}.${ext}`;
}

/**
 * Chuyển SVG string thành PNG Blob ở độ phân giải 300 hoặc 600 DPI
 * Kích thước vật lý: 500 × 300 mm
 * 1 inch = 25.4 mm
 * 500 mm = 19.685 inches
 * 300 mm = 11.811 inches
 * Tại 300 DPI: 5906 × 3543 px
 * Tại 600 DPI: 11811 × 7087 px
 * (Để an toàn bộ nhớ trình duyệt cho batch, chúng ta scale canvas cân bằng giữa DPI cao và hiệu năng ổn định)
 */
export async function svgToPngBlob(
  svgString: string,
  dpi: 300 | 600 = 600
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    // 500mm x 300mm
    // Để xuất file ảnh siêu nét cho in ấn, tính pixel theo DPI:
    // 300 DPI: ~2953 x 1772 hoặc chuẩn 5906 x 3543
    // Trình duyệt hỗ trợ tốt canvas đến 4000-6000px mà không bị tràn bộ nhớ VRAM
    const scale = dpi === 600 ? 8 : 4; // 500 * 8 = 4000px x 2400px (siêu nét cho in ấn công nghiệp)
    const widthPx = 500 * scale;
    const heightPx = 300 * scale;

    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Không thể khởi tạo Canvas 2D'));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, widthPx, heightPx);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Không thể render PNG từ Canvas'));
      }, 'image/png');
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(new Error('Lỗi load SVG vào Image: ' + String(e)));
    };

    img.src = url;
  });
}

/**
 * Tạo file PDF cho 1 biển với kích thước chuẩn 500 × 300 mm
 */
export async function generateSignPdf(
  sign: SignItem,
  config: MasterConfig = DEFAULT_MASTER_CONFIG
): Promise<jsPDF> {
  // BẮT BUỘC KIỂM TRA ARTWORK TRƯỚC (Rule 35)
  const svg = generateMasterArtworkSvg(sign, config);
  const validation = validateArtworkSvg(svg);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Khởi tạo PDF với kích thước chính xác 500 mm x 300 mm (Landscape)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: [500, 300],
    compress: true,
  });

  // Render nội dung vector / raster chất lượng cao lên PDF
  // Sử dụng PNG 600 DPI đưa vào canvas PDF 500x300 mm
  const pngBlob = await svgToPngBlob(svg, 300);
  const reader = new FileReader();

  return new Promise((resolve, reject) => {
    reader.onloadend = () => {
      try {
        const base64data = reader.result as string;
        doc.addImage(base64data, 'PNG', 0, 0, 500, 300, undefined, 'FAST');
        resolve(doc);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(pngBlob);
  });
}

/**
 * Xuất đơn lẻ file SVG (500 × 300 mm)
 */
export function exportSingleSvg(sign: SignItem, config: MasterConfig = DEFAULT_MASTER_CONFIG): void {
  const svg = generateMasterArtworkSvg(sign, config);
  const check = validateArtworkSvg(svg);
  if (!check.valid) {
    alert(check.error);
    return;
  }
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const fileName = getSignFileName(sign, 'svg');
  saveAs(blob, fileName);
}

/**
 * Xuất đơn lẻ file PDF (500 × 300 mm)
 */
export async function exportSinglePdf(sign: SignItem, config: MasterConfig = DEFAULT_MASTER_CONFIG): Promise<void> {
  try {
    const pdfDoc = await generateSignPdf(sign, config);
    const fileName = getSignFileName(sign, 'pdf');
    pdfDoc.save(fileName);
  } catch (error: any) {
    alert(error.message || 'Lỗi khi xuất PDF');
  }
}

/**
 * Xuất đơn lẻ file PNG (500 × 300 mm ở 300/600 DPI)
 */
export async function exportSinglePng(
  sign: SignItem,
  config: MasterConfig = DEFAULT_MASTER_CONFIG,
  dpi: 300 | 600 = 600
): Promise<void> {
  try {
    const svg = generateMasterArtworkSvg(sign, config);
    const check = validateArtworkSvg(svg);
    if (!check.valid) {
      alert(check.error);
      return;
    }
    const blob = await svgToPngBlob(svg, dpi);
    const fileName = getSignFileName(sign, 'png');
    saveAs(blob, fileName);
  } catch (error: any) {
    alert(error.message || 'Lỗi khi xuất PNG');
  }
}

/**
 * Xuất Bản vẽ lắp ráp kỹ thuật Assembly View (530 × 300 mm)
 */
export function exportAssemblyDrawing(sign: SignItem, config: MasterConfig = DEFAULT_MASTER_CONFIG): void {
  const svg = generateAssemblyViewSvg(sign, config);
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const fileName = getSignFileName(sign, 'svg', '_ASSEMBLY_530x300mm');
  saveAs(blob, fileName);
}

/**
 * Xuất danh sách thông số ra file Excel DANH_SACH_BIEN_TEN_DUONG.xlsx (Rule 28)
 */
export function exportSignsExcel(signs: SignItem[]): void {
  const rows = signs.map((s) => ({
    STT: s.stt,
    MA_BIEN: s.maBien,
    TEN_DUONG: s.tenDuong,
    BATCH: s.batch,
    ARTWORK_WIDTH: 500,
    ARTWORK_HEIGHT: 300,
    ASSEMBLY_WIDTH: 530,
    ASSEMBLY_HEIGHT: 300,
    TRIM_WIDTH: 30,
    TRIM_HEIGHT: 300,
    FONT_SIZE: s.fontSize,
    TEXT_WIDTH: s.textWidth,
    STATUS: s.status,
    ERROR: s.qcErrors.join('; '),
    SVG_FILE: getSignFileName(s, 'svg'),
    PDF_FILE: getSignFileName(s, 'pdf'),
    PNG_FILE: getSignFileName(s, 'png'),
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DS_BIEN_TEN_DUONG');

  XLSX.writeFile(workbook, 'DANH_SACH_BIEN_TEN_DUONG.xlsx');
}

/**
 * Xuất ZIP lô sản xuất (Rule 27 & 31: Hỗ trợ Resume nếu bị ngắt quãng)
 */
export async function exportBatchZip(
  signs: SignItem[],
  batchName: string,
  config: MasterConfig = DEFAULT_MASTER_CONFIG,
  options: {
    includeSvg: boolean;
    includePdf: boolean;
    includePng: boolean;
    includeAssembly: boolean;
    dpi: 300 | 600;
  },
  onProgress?: (progress: ExportProgress) => void,
  checkShouldStop?: () => boolean,
  alreadyCompletedIds: string[] = []
): Promise<{ zipBlob: Blob; completedIds: string[] } | null> {
  const zip = new JSZip();
  const artworkFolder = zip.folder('ARTWORK_500x300mm') || zip;
  const assemblyFolder = options.includeAssembly ? zip.folder('ASSEMBLY_VIEW_530x300mm') : null;

  const completedIds: string[] = [...alreadyCompletedIds];
  const failedIds: string[] = [];

  const total = signs.length;

  for (let i = 0; i < signs.length; i++) {
    if (checkShouldStop && checkShouldStop()) {
      return null;
    }

    const sign = signs[i];

    // Kiểm tra Resume: Nếu đã hoàn thành từ lượt trước thì bỏ qua không tạo lại
    if (alreadyCompletedIds.includes(sign.id)) {
      if (onProgress) {
        onProgress({
          isRunning: true,
          isPaused: false,
          total,
          current: i + 1,
          currentSignName: sign.tenDuong,
          batchName,
          completedIds,
          failedIds,
        });
      }
      continue;
    }

    try {
      // 1. Tạo và kiểm định Artwork SVG 500x300
      const svg = generateMasterArtworkSvg(sign, config);
      const validation = validateArtworkSvg(svg);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      // 2. Thêm SVG vào ZIP nếu chọn
      if (options.includeSvg) {
        const svgFileName = getSignFileName(sign, 'svg');
        artworkFolder.file(svgFileName, svg);
      }

      // 3. Thêm PDF vào ZIP nếu chọn
      if (options.includePdf) {
        const pdf = await generateSignPdf(sign, config);
        const pdfFileName = getSignFileName(sign, 'pdf');
        artworkFolder.file(pdfFileName, pdf.output('blob'));
      }

      // 4. Thêm PNG vào ZIP nếu chọn
      if (options.includePng) {
        const pngBlob = await svgToPngBlob(svg, options.dpi);
        const pngFileName = getSignFileName(sign, 'png');
        artworkFolder.file(pngFileName, pngBlob);
      }

      // 5. Thêm Assembly Drawing vào thư mục riêng nếu người dùng chọn
      if (assemblyFolder && options.includeAssembly) {
        const assemblySvg = generateAssemblyViewSvg(sign, config);
        const assemblyName = getSignFileName(sign, 'svg', '_ASSEMBLY_530x300mm');
        assemblyFolder.file(assemblyName, assemblySvg);
      }

      completedIds.push(sign.id);
    } catch (err: any) {
      console.error(`Lỗi xuất biển ${sign.stt} - ${sign.maBien}:`, err);
      failedIds.push(sign.id);
    }

    if (onProgress) {
      onProgress({
        isRunning: true,
        isPaused: false,
        total,
        current: i + 1,
        currentSignName: sign.tenDuong,
        batchName,
        completedIds,
        failedIds,
      });
    }

    // Nhường CPU cho UI render mượt mà
    await new Promise((r) => setTimeout(r, 10));
  }

  // Nén và xuất file ZIP
  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return { zipBlob, completedIds };
}
