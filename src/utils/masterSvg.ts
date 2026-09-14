import { SignItem, MasterConfig, ARTWORK_WIDTH, ARTWORK_HEIGHT, TOTAL_WIDTH, TOTAL_HEIGHT, MOUNTING_TRIM_WIDTH } from '../types';
import { fitRoadName } from './fitRoadName';

export const DEFAULT_MASTER_CONFIG: MasterConfig = {
  templateVersion: 'V4.0',
  isLocked: false, // Trạng thái mở khóa (Unlocked)
  backgroundColor: '#00479e', // Xanh dương đậm chuẩn biển tên đường
  borderColor: '#ffffff',
  borderInset: 13, // 13mm từ mép ngoài
  borderThickness: 3.5, // 3.5mm độ dày nét viền trắng
  cornerNotchRadius: 16, // Bo góc khuyết nghệ thuật (concave notch)
  titleText: 'ĐƯỜNG',
  titleColor: '#ffffff',
  titleFont: 'Montserrat, Arial, sans-serif',
  titleHeight: 48,
  titleX: 330, // mm (tọa độ X tiêu đề)
  titleY: 126, // mm (tọa độ Y tiêu đề)
  roadNameColor: '#ffffff',
  roadNameFont: 'Montserrat, Arial, sans-serif',
  targetRoadNameHeight: 60,
  minRoadNameHeight: 32,
  availableWidth: 440,
  roadNameX: 250, // mm (tọa độ tâm ngang X tên đường)
  roadNameY: 230, // mm (tọa độ tâm dọc Y tên đường)
  logoType: 'vector',
  logoX: 110, // mm (tọa độ tâm X logo)
  logoY: 96,  // mm (tọa độ tâm Y logo)
  logoSize: 76, // mm (đường kính logo, bán kính r=38)
  defaultDpi: 600,
  includeAssemblyInZip: false,
};

/**
 * Tạo vector path cho khung viền trắng có 4 góc khuyết nghệ thuật (Corner Scallop Notch)
 * Kích thước biển 500 x 300 mm
 */
export function generateBorderPath(
  width: number = ARTWORK_WIDTH,
  height: number = ARTWORK_HEIGHT,
  inset: number = 13,
  radius: number = 16
): string {
  const x1 = inset;
  const y1 = inset;
  const x2 = width - inset;
  const y2 = height - inset;
  const r = radius;

  // Điểm bắt đầu từ đỉnh sau góc trên-trái khuyết
  return [
    `M ${x1 + r} ${y1}`,
    `L ${x2 - r} ${y1}`,
    `A ${r} ${r} 0 0 0 ${x2} ${y1 + r}`, // Góc trên-phải khuyết lõm vào trong
    `L ${x2} ${y2 - r}`,
    `A ${r} ${r} 0 0 0 ${x2 - r} ${y2}`, // Góc dưới-phải khuyết lõm vào trong
    `L ${x1 + r} ${y2}`,
    `A ${r} ${r} 0 0 0 ${x1} ${y2 - r}`, // Góc dưới-trái khuyết lõm vào trong
    `L ${x1} ${y1 + r}`,
    `A ${r} ${r} 0 0 0 ${x1 + r} ${y1}`, // Góc trên-trái khuyết lõm vào trong
    `Z`,
  ].join(' ');
}

/**
 * Tạo vector Logo Xã Hải Lăng chuẩn nét sắc xảo
 * Đặt tại vị trí tâm cx, cy với bán kính r (mặc định cx=110, cy=96, r=38)
 */
export function generateHaiLangLogoSvg(cx: number = 110, cy: number = 96, r: number = 38): string {
  const scale = r / 38;
  const uid = `${Math.round(cx)}_${Math.round(cy)}_${Math.round(r)}`;

  return `
    <g id="LOGO" transform="translate(${cx}, ${cy}) scale(${scale})">
      <!-- Vòng tròn nền trắng ngoài cùng -->
      <circle cx="0" cy="0" r="38" fill="#FFFFFF" />
      <!-- Vòng tròn đỏ chính -->
      <circle cx="0" cy="0" r="36" fill="#D32027" stroke="#FFFFFF" stroke-width="1.2" />
      
      <!-- Biểu tượng đài tưởng niệm chiến thắng & bông lúa / bánh răng Hải Lăng -->
      <g fill="#FFFFFF">
        <!-- Vành đai bông lúa cách điệu bên trái -->
        <path d="M -24 6 C -28 -12, -18 -26, -5 -30 C -8 -22, -12 -12, -8 4 C -12 2, -20 2, -24 6 Z" />
        
        <!-- Đài tưởng niệm / Tháp truyền thống cách điệu chính giữa -->
        <path d="M -3 -26 L 3 -26 L 4 6 L -4 6 Z" fill="#FFFFFF" />
        <path d="M -7 -18 L -5 -18 L -3 6 L -6 6 Z" fill="#FFFFFF" />
        <path d="M 5 -18 L 7 -18 L 6 6 L 3 6 Z" fill="#FFFFFF" />
        <path d="M -11 -6 L -9 -6 L -6 6 L -10 6 Z" fill="#FFFFFF" />
        <path d="M 9 -6 L 11 -6 L 10 6 L 6 6 Z" fill="#FFFFFF" />
        
        <!-- Bệ đài tưởng niệm -->
        <rect x="-14" y="6" width="28" height="3" rx="0.5" fill="#FFFFFF" />
        <rect x="-17" y="9" width="34" height="2.5" rx="0.5" fill="#FFFFFF" />

        <!-- Ngôi sao đỏ trên đỉnh đài tưởng niệm -->
        <path d="M 0 -29 L 1.2 -25.5 L 4.8 -25.5 L 1.9 -23.4 L 3 -19.8 L 0 -22 L -3 -19.8 L -1.9 -23.4 L -4.8 -25.5 L -1.2 -25.5 Z" fill="#D32027" stroke="#FFFFFF" stroke-width="0.6" />
      </g>

      <!-- Dải băng đỏ cung tròn phía dưới ghi "XÃ HẢI LĂNG" -->
      <path id="logoTextPath_${uid}" d="M -26 14 A 31 31 0 0 0 26 14 L 20 25 A 31 31 0 0 1 -20 25 Z" fill="#B3181E" stroke="#FFFFFF" stroke-width="0.8" />
      
      <!-- Cung đường dẫn cho chữ cong -->
      <path id="curvePath_${uid}" d="M -22 17 A 26 26 0 0 0 22 17" fill="none" stroke="none" />
      <text font-size="5.8" font-weight="900" fill="#FFFFFF" font-family="Montserrat, Arial, sans-serif" letter-spacing="0.6">
        <textPath href="#curvePath_${uid}" startOffset="50%" text-anchor="middle">
          XÃ HẢI LĂNG
        </textPath>
      </text>
    </g>
  `;
}

/**
 * TẠO MASTER ARTWORK SVG (500 × 300 mm)
 * 
 * QUY TẮC BẮT BUỘC:
 * - width="500mm" height="300mm" viewBox="0 0 500 300"
 * - CHỈ CHỨA PHẦN MẶT BIỂN ĐỂ IN
 * - TUYỆT ĐỐI KHÔNG CHỨA PHẦN NẸP 30MM
 * - TUYỆT ĐỐI KHÔNG CÓ DẢI XÁM
 */
export function generateMasterArtworkSvg(
  sign: Partial<SignItem> | { tenDuong: string; maBien?: string; stt?: string | number },
  config: MasterConfig = DEFAULT_MASTER_CONFIG
): string {
  const roadName = (sign.tenDuong || '').trim().toUpperCase();

  const logoX = config.logoX ?? 110;
  const logoY = config.logoY ?? 96;
  const logoSize = config.logoSize ?? 76;
  const logoR = logoSize / 2;

  const titleX = config.titleX ?? 330;
  const titleY = config.titleY ?? 126;
  const titleHeight = config.titleHeight || 48;

  const roadNameX = config.roadNameX ?? 250;
  const roadNameY = config.roadNameY ?? 230;

  const fit = fitRoadName(
    roadName,
    config.availableWidth,
    config.targetRoadNameHeight,
    config.minRoadNameHeight,
    config.roadNameFont,
    roadNameX,
    roadNameY
  );

  const borderPath = generateBorderPath(
    ARTWORK_WIDTH,
    ARTWORK_HEIGHT,
    config.borderInset,
    config.cornerNotchRadius
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="500mm"
     height="300mm"
     viewBox="0 0 500 300"
     style="width: 100%; height: 100%; max-width: 100%; max-height: 100%; display: block;"
     data-artwork-standard="500x300"
     data-template-version="${config.templateVersion}">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@700;800;900&amp;family=Lexend:wght@700;800;900&amp;family=Montserrat:wght@700;800;900&amp;family=Oswald:wght@600;700&amp;family=Roboto:wght@700;900&amp;display=swap');
      .title-text {
        font-family: ${config.titleFont};
        font-weight: 900;
        fill: ${config.titleColor};
        font-size: ${titleHeight}px;
        letter-spacing: 2px;
      }
      .road-name-text {
        font-family: ${config.roadNameFont};
        font-weight: 900;
        fill: ${config.roadNameColor};
      }
    </style>
  </defs>

  <!-- 1. NỀN BIỂN 500 × 300 MM (KHÔNG CÓ NẸP) -->
  <rect id="BACKGROUND" x="0" y="0" width="500" height="300" fill="${config.backgroundColor}" />

  <!-- 2. KHUNG TRẮNG VIỀN KHUYẾT 4 GÓC NGHỆ THUẬT -->
  <path id="FRAME"
        d="${borderPath}"
        fill="none"
        stroke="${config.borderColor}"
        stroke-width="${config.borderThickness}"
        stroke-linecap="round"
        stroke-linejoin="round" />

  <!-- 3. LOGO XÃ HẢI LĂNG (TÙY CHỈNH VỊ TRÍ X, Y, SIZE) -->
  ${config.customLogoUrl ? `<image href="${config.customLogoUrl}" x="${logoX - logoR}" y="${logoY - logoR}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" />` : generateHaiLangLogoSvg(logoX, logoY, logoR)}

  <!-- 4. CHỮ ĐƯỜNG CỐ ĐỊNH (TÙY CHỈNH VỊ TRÍ X, Y) -->
  <text id="TITLE"
        class="title-text"
        x="${titleX}"
        y="${titleY}"
        text-anchor="middle">
    ${config.titleText}
  </text>

  <!-- 5. TÊN ĐƯỜNG AUTO-FIT CHUẨN TỶ LỆ (KHÔNG BÓP MÉO) -->
  <text id="ROAD_NAME"
        class="road-name-text"
        x="${fit.x}"
        y="${fit.y}"
        font-size="${fit.fontSize}px"
        text-anchor="middle"
        data-fit-status="${fit.status}"
        data-text-width="${fit.textWidth}"
        data-text-height="${fit.textHeight}">
    ${roadName}
  </text>
</svg>`.trim();
}

/**
 * TẠO BẢN VẼ TỔNG THỂ / LẮP RÁP (ASSEMBLY VIEW) 530 × 300 MM
 * 
 * PHỤC VỤ TRÌNH DUYỆT, NGHIỆM THU, MINH HỌA CẤU TẠO LẮP ĐẶT
 * BAO GỒM:
 * - 30 mm Nẹp kết cấu (trái) với 2 lỗ ốc kỹ thuật
 * - 500 mm Mặt biển in (phải)
 * - Đường dóng kích thước kỹ thuật (Dimension Callouts)
 * - Watermark cảnh báo rõ ràng: KHÔNG DÙNG ĐỂ IN
 */
export function generateAssemblyViewSvg(
  sign: Partial<SignItem> | { tenDuong: string; maBien?: string; stt?: string | number },
  config: MasterConfig = DEFAULT_MASTER_CONFIG
): string {
  const roadName = (sign.tenDuong || '').trim().toUpperCase();

  const logoX = config.logoX ?? 110;
  const logoY = config.logoY ?? 96;
  const logoSize = config.logoSize ?? 76;
  const logoR = logoSize / 2;

  const titleX = config.titleX ?? 330;
  const titleY = config.titleY ?? 126;
  const titleHeight = config.titleHeight || 48;

  const roadNameX = config.roadNameX ?? 250;
  const roadNameY = config.roadNameY ?? 230;

  const fit = fitRoadName(
    roadName,
    config.availableWidth,
    config.targetRoadNameHeight,
    config.minRoadNameHeight,
    config.roadNameFont,
    roadNameX,
    roadNameY
  );

  const borderPath = generateBorderPath(
    ARTWORK_WIDTH,
    ARTWORK_HEIGHT,
    config.borderInset,
    config.cornerNotchRadius
  );

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg"
     width="530mm"
     height="300mm"
     viewBox="0 0 530 300"
     style="width: 100%; height: 100%; max-width: 100%; max-height: 100%; display: block;"
     data-assembly-view="530x300">
  <defs>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@700;800;900&amp;family=Lexend:wght@700;800;900&amp;family=Montserrat:wght@700;800;900&amp;family=Oswald:wght@600;700&amp;family=Roboto:wght@700;900&amp;display=swap');
      .title-text {
        font-family: ${config.titleFont};
        font-weight: 900;
        fill: ${config.titleColor};
        font-size: ${titleHeight}px;
        letter-spacing: 2px;
      }
      .road-name-text {
        font-family: ${config.roadNameFont};
        font-weight: 900;
        fill: ${config.roadNameColor};
      }
      .dim-text {
        font-family: 'Plus Jakarta Sans', Arial, sans-serif;
        font-size: 8px;
        font-weight: 700;
        fill: #374151;
      }
      .dim-line {
        stroke: #ef4444;
        stroke-width: 1;
        stroke-dasharray: 2 1;
      }
    </style>
  </defs>

  <!-- ============================================== -->
  <!-- A. PHẦN NẸP KẾT CẤU (30 × 300 MM) - KHÔNG IN  -->
  <!-- ============================================== -->
  <g id="MOUNTING_TRIM" transform="translate(0, 0)">
    <!-- Nẹp nhôm màu xám kỹ thuật -->
    <rect x="0" y="0" width="30" height="300" fill="#6B7280" stroke="#374151" stroke-width="1" />
    
    <!-- Lỗ bắt vít trên: X=15mm, Y=60mm, Đường kính phi 8mm -->
    <circle cx="15" cy="60" r="4" fill="#E5E7EB" stroke="#1F2937" stroke-width="1" />
    <circle cx="15" cy="60" r="6" fill="none" stroke="#9CA3AF" stroke-width="0.5" stroke-dasharray="1 1" />
    
    <!-- Lỗ bắt vít dưới: X=15mm, Y=240mm, Đường kính phi 8mm -->
    <circle cx="15" cy="240" r="4" fill="#E5E7EB" stroke="#1F2937" stroke-width="1" />
    <circle cx="15" cy="240" r="6" fill="none" stroke="#9CA3AF" stroke-width="0.5" stroke-dasharray="1 1" />
    
    <!-- Nhãn kỹ thuật dọc trên nẹp -->
    <text x="15" y="150"
          font-family="Arial, sans-serif"
          font-size="6.5"
          font-weight="bold"
          fill="#FFFFFF"
          text-anchor="middle"
          transform="rotate(-90 15 150)">
      NẸP LẮP ĐẶT 30mm (KHÔNG IN)
    </text>
  </g>

  <!-- ============================================== -->
  <!-- B. PHẦN MẶT BIỂN ĐỂ IN (500 × 300 MM)          -->
  <!-- ============================================== -->
  <g id="ARTWORK_AREA" transform="translate(30, 0)">
    <!-- Nền biển -->
    <rect id="BACKGROUND" x="0" y="0" width="500" height="300" fill="${config.backgroundColor}" />

    <!-- Khung viền trắng khuyết 4 góc -->
    <path id="FRAME"
          d="${borderPath}"
          fill="none"
          stroke="${config.borderColor}"
          stroke-width="${config.borderThickness}"
          stroke-linecap="round"
          stroke-linejoin="round" />

    <!-- Logo xã Hải Lăng (Tùy chỉnh vị trí) -->
    ${config.customLogoUrl ? `<image href="${config.customLogoUrl}" x="${logoX - logoR}" y="${logoY - logoR}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet" />` : generateHaiLangLogoSvg(logoX, logoY, logoR)}

    <!-- Chữ ĐƯỜNG (Tùy chỉnh vị trí) -->
    <text id="TITLE"
          class="title-text"
          x="${titleX}"
          y="${titleY}"
          text-anchor="middle">
      ${config.titleText}
    </text>

    <!-- Tên đường (Tùy chỉnh vị trí) -->
    <text id="ROAD_NAME"
          class="road-name-text"
          x="${fit.x}"
          y="${fit.y}"
          font-size="${fit.fontSize}px"
          text-anchor="middle">
      ${roadName}
    </text>
  </g>

  <!-- CẢNH BÁO BẢN VẼ LẮP RÁP -->
  <rect x="180" y="278" width="280" height="16" rx="3" fill="#FEF2F2" stroke="#DC2626" stroke-width="0.8" opacity="0.9" />
  <text x="320" y="289" font-family="Arial, sans-serif" font-size="7" font-weight="bold" fill="#DC2626" text-anchor="middle">
    BẢN VẼ LẮP RÁP KỸ THUẬT (530 × 300 mm) - KHÔNG DÙNG ĐỂ IN MẶT BIỂN
  </text>
</svg>`.trim();
}

/**
 * KIỂM TRA NGHIÊM NGẶT KÍCH THƯỚC ARTWORK TRƯỚC KHI EXPORT (Rule 19 & 35)
 * 
 * Nếu phát hiện 530 x 300 mm hoặc chứa MOUNTING_TRIM trong file artwork:
 * EXPORT FAILED!
 */
export function validateArtworkSvg(svgContent: string): { valid: boolean; error?: string } {
  if (!svgContent) {
    return { valid: false, error: 'Nội dung file SVG rỗng.' };
  }

  // 1. Kiểm tra kích thước 500mm x 300mm
  const hasWidth500mm = /width\s*=\s*["']500mm["']/i.test(svgContent);
  const hasHeight300mm = /height\s*=\s*["']300mm["']/i.test(svgContent);
  const hasViewBox500x300 = /viewBox\s*=\s*["']0\s+0\s+500\s+300["']/i.test(svgContent);

  if (!hasWidth500mm || !hasHeight300mm || !hasViewBox500x300) {
    return {
      valid: false,
      error: 'SAI KÍCH THƯỚC ARTWORK. ARTWORK PHẢI LÀ 500 × 300 MM. 530 × 300 MM CHỈ LÀ KÍCH THƯỚC TỔNG THỂ SAU KHI LẮP NẸP.',
    };
  }

  // 2. Kiểm tra không được chứa nẹp hoặc id MOUNTING_TRIM trong file in artwork
  if (/MOUNTING_TRIM|assembly-view|530mm/i.test(svgContent)) {
    return {
      valid: false,
      error: 'PHÁT HIỆN PHẦN NẸP LẮP ĐẶT TRONG FILE ARTWORK IN. Nẹp 30mm là kết cấu cơ khí, KHÔNG ĐƯỢC đưa vào file in artwork.',
    };
  }

  // 3. Kiểm tra phần tử ROAD_NAME bắt buộc tồn tại
  if (!/id\s*=\s*["']ROAD_NAME["']/i.test(svgContent)) {
    return {
      valid: false,
      error: 'Thiếu thành phần ROAD_NAME trong file SVG Master.',
    };
  }

  return { valid: true };
}
