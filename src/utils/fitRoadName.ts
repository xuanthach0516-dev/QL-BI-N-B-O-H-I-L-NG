import { FitRoadNameResult, FitStatus, MasterConfig } from '../types';

/**
 * Thuật toán fitRoadName() theo tiêu chuẩn sản xuất biển tên đường Hải Lăng
 * 
 * HỖ TRỢ ĐA NĂNG:
 * - 1 Hàng (Single Line): Co chữ theo tỷ lệ chuẩn, không bóp méo, không kéo giãn
 * - Tự động / 2 Hàng (Auto / Two Lines): Cho phép ngắt 2 hàng tự động hoặc thủ công
 * - Tùy chỉnh Font chữ: Phông chữ, Độ đậm (Font weight), Giãn ký tự (Letter spacing)
 * - Tùy chỉnh Hàng: Khoảng cách giữa các hàng, Căn lề dòng (Trái / Giữa / Phải)
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

export function measureTextWidth(
  text: string,
  fontSizePx: number,
  fontFamily: string = 'Montserrat, Arial, sans-serif',
  fontWeight: string = '900',
  letterSpacing: number = 0
): number {
  const ctx = getMeasureContext();
  let baseWidth = 0;
  if (ctx) {
    ctx.font = `${fontWeight} ${fontSizePx}px ${fontFamily}`;
    baseWidth = ctx.measureText(text).width;
  } else {
    baseWidth = text.length * fontSizePx * 0.72;
  }
  if (letterSpacing > 0 && text.length > 1) {
    baseWidth += (text.length - 1) * letterSpacing;
  }
  return baseWidth;
}

/**
 * Tách một chuỗi tên đường thành 2 hàng cân đối nhất theo từ ngữ
 */
export function splitRoadNameTo2Lines(text: string): [string, string] {
  const words = text.trim().split(/\s+/);
  if (words.length <= 1) {
    return [text, ''];
  }
  if (words.length === 2) {
    return [words[0], words[1]];
  }

  // Tìm điểm tách tối ưu sao cho độ dài 2 phần gần nhau nhất
  let bestIndex = 1;
  let minDiff = Infinity;
  for (let i = 1; i < words.length; i++) {
    const part1 = words.slice(0, i).join(' ');
    const part2 = words.slice(i).join(' ');
    const diff = Math.abs(part1.length - part2.length);
    if (diff < minDiff) {
      minDiff = diff;
      bestIndex = i;
    }
  }

  return [words.slice(0, bestIndex).join(' '), words.slice(bestIndex).join(' ')];
}

export interface FitRoadOptions {
  availableWidth?: number;
  targetHeight?: number;
  minHeight?: number;
  fontFamily?: string;
  fontWeight?: '700' | '800' | '900';
  letterSpacing?: number;
  customCenterX?: number;
  customCenterY?: number;
  lineMode?: 'SINGLE' | 'AUTO' | 'TWO_LINES';
  lineSpacing?: number;
  target2LineHeight?: number;
  alignment?: 'center' | 'left' | 'right';
  textTransform?: 'UPPERCASE' | 'ORIGINAL';
}

export function fitRoadName(
  rawRoadName: string,
  availableWidthOrConfig: number | MasterConfig = 440,
  targetHeight: number = 60,
  minHeight: number = 32,
  fontFamily: string = 'Montserrat, Arial, sans-serif',
  customCenterX: number = 250,
  customCenterY: number = 230,
  extraOptions?: FitRoadOptions
): FitRoadNameResult {
  // Chuẩn hóa config nếu truyền vào là MasterConfig
  const isConfigObj = typeof availableWidthOrConfig === 'object' && availableWidthOrConfig !== null;
  const cfg: Partial<MasterConfig> = isConfigObj ? (availableWidthOrConfig as MasterConfig) : {};

  const availWidth = isConfigObj ? (cfg.availableWidth ?? 440) : (availableWidthOrConfig as number);
  const targetH = extraOptions?.targetHeight ?? (isConfigObj ? (cfg.targetRoadNameHeight ?? 60) : targetHeight);
  const minH = extraOptions?.minHeight ?? (isConfigObj ? (cfg.minRoadNameHeight ?? 32) : minHeight);
  const font = extraOptions?.fontFamily ?? (isConfigObj ? (cfg.roadNameFont ?? 'Montserrat, Arial, sans-serif') : fontFamily);
  const weight = extraOptions?.fontWeight ?? (isConfigObj ? (cfg.roadNameFontWeight ?? '900') : '900');
  const letterSpace = extraOptions?.letterSpacing ?? (isConfigObj ? (cfg.roadNameLetterSpacing ?? 0.5) : 0.5);
  const centerX = extraOptions?.customCenterX ?? (isConfigObj ? (cfg.roadNameX ?? 250) : customCenterX);
  const centerY = extraOptions?.customCenterY ?? (isConfigObj ? (cfg.roadNameY ?? 230) : customCenterY);

  const lineMode = extraOptions?.lineMode ?? (isConfigObj ? (cfg.roadNameLineMode ?? 'AUTO') : 'AUTO');
  const lineSpacing = extraOptions?.lineSpacing ?? (isConfigObj ? (cfg.roadNameLineSpacing ?? 10) : 10);
  const target2LineH = extraOptions?.target2LineHeight ?? (isConfigObj ? (cfg.roadNameTarget2LineHeight ?? 38) : 38);
  const alignment = extraOptions?.alignment ?? (isConfigObj ? (cfg.roadNameAlign ?? 'center') : 'center');
  const transform = extraOptions?.textTransform ?? (isConfigObj ? (cfg.roadNameTransform ?? 'UPPERCASE') : 'UPPERCASE');

  let processedText = (rawRoadName || '').trim();
  if (transform === 'UPPERCASE') {
    processedText = processedText.toUpperCase();
  }

  if (!processedText) {
    return {
      fontSize: targetH,
      textWidth: 0,
      textHeight: targetH,
      x: centerX,
      y: Math.round(centerY + targetH * 0.38),
      status: 'EMPTY',
      scaleRatio: 1.0,
      lines: [''],
      lineYPositions: [Math.round(centerY + targetH * 0.38)],
      lineSpacing,
      alignment,
      letterSpacing: letterSpace,
      fontWeight: weight,
    };
  }

  // Xác định danh sách dòng:
  let lines: string[] = [];

  // 1. Nếu tên đường có ký tự ngắt dòng tường minh (\n hoặc | hoặc //)
  if (/[\r\n|]|\/{2}/.test(processedText)) {
    lines = processedText.split(/[\r\n|]|\/{2}/).map((s) => s.trim()).filter(Boolean);
  } else if (lineMode === 'TWO_LINES') {
    // 2. Chế độ ép 2 hàng
    const [l1, l2] = splitRoadNameTo2Lines(processedText);
    lines = l2 ? [l1, l2] : [l1];
  } else if (lineMode === 'AUTO') {
    // 3. Chế độ Tự động: đo thử 1 hàng trước
    const targetFontSize1Line = Math.round(targetH / 0.73);
    const width1Line = measureTextWidth(processedText, targetFontSize1Line, font, weight, letterSpace);
    const minFontSize1Line = Math.round(minH / 0.73);
    const scale1Line = availWidth / width1Line;
    const words = processedText.split(/\s+/);

    // Nếu 1 hàng quá dài (vượt khung hoặc co lại dưới mức đẹp) và có từ 2-3 từ trở lên -> ngắt 2 hàng
    if ((width1Line > availWidth && scale1Line < 0.76 && words.length >= 2) || (scale1Line * targetFontSize1Line < minFontSize1Line && words.length >= 2)) {
      const [l1, l2] = splitRoadNameTo2Lines(processedText);
      lines = l2 ? [l1, l2] : [l1];
    } else {
      lines = [processedText];
    }
  } else {
    // 4. Chế độ 1 hàng duy nhất (SINGLE)
    lines = [processedText];
  }

  const isMultiLine = lines.length > 1;
  const effectiveTargetH = isMultiLine ? target2LineH : targetH;
  const effectiveMinH = isMultiLine ? Math.max(22, Math.round(minH * 0.72)) : minH;

  const targetFontSize = Math.round(effectiveTargetH / 0.73);
  const minFontSize = Math.round(effectiveMinH / 0.73);

  // Đo chiều rộng của dòng dài nhất ở kích thước chuẩn
  const lineStandardWidths = lines.map((l) => measureTextWidth(l, targetFontSize, font, weight, letterSpace));
  const maxStandardWidth = Math.max(...lineStandardWidths);

  let finalFontSize = targetFontSize;
  let finalWidth = maxStandardWidth;
  let finalHeight = effectiveTargetH;
  let status: FitStatus = 'OK';
  let scaleRatio = 1.0;

  if (maxStandardWidth <= availWidth) {
    finalFontSize = targetFontSize;
    finalWidth = maxStandardWidth;
    finalHeight = effectiveTargetH;
    status = 'OK';
    scaleRatio = 1.0;
  } else {
    scaleRatio = availWidth / maxStandardWidth;
    const computedFontSize = Math.floor(targetFontSize * scaleRatio);

    if (computedFontSize >= minFontSize) {
      finalFontSize = computedFontSize;
      finalHeight = Math.round(computedFontSize * 0.73);
      finalWidth = Math.max(...lines.map((l) => measureTextWidth(l, finalFontSize, font, weight, letterSpace)));
      status = 'SCALED';
    } else {
      finalFontSize = minFontSize;
      finalHeight = effectiveMinH;
      finalWidth = Math.max(...lines.map((l) => measureTextWidth(l, minFontSize, font, weight, letterSpace)));
      status = 'TOO_LONG';
    }
  }

  // Tính tọa độ Y của từng dòng sao cho cả khối văn bản cân đối quanh centerY
  const lineYPositions: number[] = [];
  if (lines.length === 1) {
    lineYPositions.push(Math.round(centerY + finalHeight * 0.38));
  } else {
    const totalBlockHeight = lines.length * finalHeight + (lines.length - 1) * lineSpacing;
    const startY = centerY - totalBlockHeight / 2 + finalHeight / 2;
    for (let i = 0; i < lines.length; i++) {
      const lineCenterY = startY + i * (finalHeight + lineSpacing);
      lineYPositions.push(Math.round(lineCenterY + finalHeight * 0.38));
    }
  }

  // Tính tọa độ X theo căn lề
  let textX = centerX;
  if (alignment === 'left') {
    textX = Math.round(centerX - availWidth / 2 + 10);
  } else if (alignment === 'right') {
    textX = Math.round(centerX + availWidth / 2 - 10);
  }

  return {
    fontSize: finalFontSize,
    textWidth: Math.round(finalWidth * 10) / 10,
    textHeight: finalHeight,
    x: textX,
    y: lineYPositions[0],
    status,
    scaleRatio: Math.round(scaleRatio * 100) / 100,
    lines,
    lineYPositions,
    lineSpacing,
    alignment,
    letterSpacing: letterSpace,
    fontWeight: weight,
  };
}
