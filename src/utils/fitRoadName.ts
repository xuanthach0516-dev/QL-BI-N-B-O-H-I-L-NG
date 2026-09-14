import { FitRoadNameResult, FitStatus } from '../types';

/**
 * Thuật toán fitRoadName() theo tiêu chuẩn sản xuất biển tên đường Hải Lăng
 * 
 * QUY TẮC:
 * - Nếu tên đường ngắn: sử dụng kích thước chuẩn (targetHeight = 60mm)
 * - Nếu tên đường dài: giảm font-size theo tỷ lệ
 * - TUYỆT ĐỐI KHÔNG:
 *   + scaleX
 *   + scaleY
 *   + bóp méo chữ
 *   + kéo giãn chữ
 *   + xuống dòng
 *   + cắt chữ
 * - Nếu tên đường quá dài (vẫn vượt availableWidth ở minHeight):
 *   STATUS = 'TOO_LONG' và yêu cầu người dùng kiểm tra.
 */

// Canvas context dùng để đo đạc chính xác font metrics
let measureCanvas: HTMLCanvasElement | null = null;
let measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof window === 'undefined') return null;
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
    measureCtx = measureCanvas.getContext('2d');
  }
  return measureCtx;
}

export function measureTextWidth(text: string, fontSizePx: number, fontFamily: string = 'Montserrat, Arial, sans-serif'): number {
  const ctx = getMeasureContext();
  if (ctx) {
    ctx.font = `900 ${fontSizePx}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    return metrics.width;
  }
  // Fallback nếu không có DOM canvas (ước tính hệ số chuẩn cho font in hoa đậm)
  return text.length * fontSizePx * 0.72;
}

export function fitRoadName(
  rawRoadName: string,
  availableWidth: number = 440, // mm (lòng khung 500mm trừ biên an toàn)
  targetHeight: number = 60,   // mm (chiều cao mục tiêu thiết kế)
  minHeight: number = 32,      // mm (chiều cao tối thiểu cho phép)
  fontFamily: string = 'Montserrat, Arial, sans-serif',
  customCenterX: number = 250, // mm (tọa độ tâm ngang X, mặc định 250)
  customCenterY: number = 230  // mm (tọa độ tâm dọc Y, mặc định 230)
): FitRoadNameResult {
  const roadName = (rawRoadName || '').trim().toUpperCase();

  if (!roadName) {
    return {
      fontSize: targetHeight,
      textWidth: 0,
      textHeight: targetHeight,
      x: customCenterX,
      y: Math.round(customCenterY + targetHeight * 0.38),
      status: 'EMPTY',
      scaleRatio: 1.0,
    };
  }

  // Trong SVG tọa độ 500x300, 1 đơn vị = 1mm.
  // Đối với font Montserrat / Sans-serif in hoa đậm:
  // Cap-height (chiều cao chữ in hoa) xấp xỉ 0.72 - 0.75 của fontSize (em).
  // Vì vậy để đạt cap-height = targetHeight, fontSize xấp xỉ targetHeight / 0.73.
  const targetFontSize = Math.round(targetHeight / 0.73);
  const minFontSize = Math.round(minHeight / 0.73);

  // Đo chiều rộng text ở kích thước chuẩn
  const standardWidth = measureTextWidth(roadName, targetFontSize, fontFamily);

  let finalFontSize = targetFontSize;
  let finalWidth = standardWidth;
  let finalHeight = targetHeight;
  let status: FitStatus = 'OK';
  let scaleRatio = 1.0;

  if (standardWidth <= availableWidth) {
    // Tên ngắn hoặc vừa vặn -> giữ nguyên kích thước chuẩn 60mm
    finalFontSize = targetFontSize;
    finalWidth = standardWidth;
    finalHeight = targetHeight;
    status = 'OK';
    scaleRatio = 1.0;
  } else {
    // Tên dài -> tính tỷ lệ thu nhỏ đều cả 2 chiều (giữ nguyên tỷ lệ ký tự, KHÔNG scaleX/scaleY riêng lẻ)
    scaleRatio = availableWidth / standardWidth;
    const computedFontSize = Math.floor(targetFontSize * scaleRatio);

    if (computedFontSize >= minFontSize) {
      finalFontSize = computedFontSize;
      finalHeight = Math.round(computedFontSize * 0.73);
      finalWidth = measureTextWidth(roadName, finalFontSize, fontFamily);
      status = 'SCALED';
    } else {
      // Vượt quá độ dài cho phép ngay cả ở cỡ tối thiểu minFontSize
      finalFontSize = minFontSize;
      finalHeight = minHeight;
      finalWidth = measureTextWidth(roadName, minFontSize, fontFamily);
      status = 'TOO_LONG';
    }
  }

  // Y baseline được tính sao cho tâm chữ nằm ở Y ≈ customCenterY
  // Tọa độ y của <text> trong SVG là baseline
  const centerY = customCenterY;
  const baselineY = Math.round(centerY + finalHeight * 0.38);

  return {
    fontSize: finalFontSize,
    textWidth: Math.round(finalWidth * 10) / 10,
    textHeight: finalHeight,
    x: customCenterX, // Căn ngang theo tọa độ X
    y: baselineY,     // Tọa độ Y baseline tính từ tâm Y
    status,
    scaleRatio: Math.round(scaleRatio * 100) / 100,
  };
}
