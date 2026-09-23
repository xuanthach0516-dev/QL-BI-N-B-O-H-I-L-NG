import { MasterConfig } from '../types';
import { DEFAULT_MASTER_CONFIG } from './masterSvg';

export const MASTER_CONFIG_STORAGE_KEY = 'HAILANG_MASTER_TEMPLATE_CONFIG_V4';
export const MASTER_CONFIG_LAST_SAVED_KEY = 'HAILANG_MASTER_TEMPLATE_SAVED_TIMESTAMP';

/**
 * Nạp cấu hình mẫu Master đã lưu từ LocalStorage.
 * Tự động hợp nhất với cấu hình mặc định DEFAULT_MASTER_CONFIG
 * để đảm bảo an toàn nếu có trường mới hoặc cấu hình phiên bản cũ.
 */
export function loadSavedMasterConfig(): MasterConfig {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_MASTER_CONFIG };
  }

  try {
    const raw = window.localStorage.getItem(MASTER_CONFIG_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_MASTER_CONFIG };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ...DEFAULT_MASTER_CONFIG };
    }

    // Merge với DEFAULT_MASTER_CONFIG để luôn có đủ tất cả các trường mới
    const merged: MasterConfig = {
      ...DEFAULT_MASTER_CONFIG,
      ...parsed,
      // Đảm bảo các thuộc tính số quan trọng không bị NaN hoặc null
      borderInset: Number(parsed.borderInset) || DEFAULT_MASTER_CONFIG.borderInset,
      borderThickness: Number(parsed.borderThickness) || DEFAULT_MASTER_CONFIG.borderThickness,
      cornerNotchRadius: Number(parsed.cornerNotchRadius) || DEFAULT_MASTER_CONFIG.cornerNotchRadius,
      cornerStyle: (['CONCAVE', 'ROUNDED', 'RECTANGULAR'].includes(parsed.cornerStyle) ? parsed.cornerStyle : DEFAULT_MASTER_CONFIG.cornerStyle) || 'CONCAVE',
      titleHeight: Number(parsed.titleHeight) || DEFAULT_MASTER_CONFIG.titleHeight,
      titleX: Number(parsed.titleX ?? DEFAULT_MASTER_CONFIG.titleX),
      titleY: Number(parsed.titleY ?? DEFAULT_MASTER_CONFIG.titleY),
      roadNameX: Number(parsed.roadNameX ?? DEFAULT_MASTER_CONFIG.roadNameX),
      roadNameY: Number(parsed.roadNameY ?? DEFAULT_MASTER_CONFIG.roadNameY),
      targetRoadNameHeight: Number(parsed.targetRoadNameHeight) || DEFAULT_MASTER_CONFIG.targetRoadNameHeight,
      minRoadNameHeight: Number(parsed.minRoadNameHeight) || DEFAULT_MASTER_CONFIG.minRoadNameHeight,
      availableWidth: Number(parsed.availableWidth) || DEFAULT_MASTER_CONFIG.availableWidth,
      logoX: Number(parsed.logoX ?? DEFAULT_MASTER_CONFIG.logoX),
      logoY: Number(parsed.logoY ?? DEFAULT_MASTER_CONFIG.logoY),
      logoSize: Number(parsed.logoSize ?? DEFAULT_MASTER_CONFIG.logoSize),
      roadNameLetterSpacing: Number(parsed.roadNameLetterSpacing ?? DEFAULT_MASTER_CONFIG.roadNameLetterSpacing ?? 0.5),
      roadNameLineSpacing: Number(parsed.roadNameLineSpacing ?? DEFAULT_MASTER_CONFIG.roadNameLineSpacing ?? 10),
      roadNameTarget2LineHeight: Number(parsed.roadNameTarget2LineHeight ?? DEFAULT_MASTER_CONFIG.roadNameTarget2LineHeight ?? 38),
    };

    return merged;
  } catch (error) {
    console.warn('Không thể đọc cấu hình Master Template từ localStorage, sử dụng mặc định:', error);
    return { ...DEFAULT_MASTER_CONFIG };
  }
}

/**
 * Lưu cấu hình Master Template vào LocalStorage của trình duyệt.
 * Trả về true nếu lưu thành công, false nếu thất bại (ví dụ vượt quota dung lượng).
 */
export function saveMasterConfig(config: MasterConfig): boolean {
  if (typeof window === 'undefined' || !window.localStorage) {
    return false;
  }

  try {
    const json = JSON.stringify(config);
    window.localStorage.setItem(MASTER_CONFIG_STORAGE_KEY, json);
    window.localStorage.setItem(MASTER_CONFIG_LAST_SAVED_KEY, new Date().toISOString());
    return true;
  } catch (error) {
    console.error('Lỗi khi lưu cấu hình Master Template vào localStorage:', error);
    // Nếu bị lỗi quota (có thể do ảnh base64 customLogoUrl quá lớn), thử lưu bản không có customLogoUrl
    try {
      if (config.customLogoUrl) {
        const fallbackConfig = { ...config, customLogoUrl: undefined };
        window.localStorage.setItem(MASTER_CONFIG_STORAGE_KEY, JSON.stringify(fallbackConfig));
        window.localStorage.setItem(MASTER_CONFIG_LAST_SAVED_KEY, new Date().toISOString());
        console.warn('Đã lưu cấu hình Master Template không kèm logo base64 lớn do vượt dung lượng.');
        return true;
      }
    } catch {
      // Ignored
    }
    return false;
  }
}

/**
 * Lấy thời gian lần lưu cấu hình gần nhất (chuỗi định dạng giờ:phút:giây)
 */
export function getLastSavedTimestamp(): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const ts = window.localStorage.getItem(MASTER_CONFIG_LAST_SAVED_KEY);
    if (!ts) return null;
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d.toLocaleTimeString('vi-VN');
  } catch {
    return null;
  }
}

/**
 * Xóa cấu hình tùy chỉnh đã lưu và khôi phục về mặc định gốc V4.0
 */
export function resetSavedMasterConfig(): MasterConfig {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem(MASTER_CONFIG_STORAGE_KEY);
      window.localStorage.removeItem(MASTER_CONFIG_LAST_SAVED_KEY);
    } catch (e) {
      console.error(e);
    }
  }
  return { ...DEFAULT_MASTER_CONFIG, isLocked: false };
}

/**
 * Xuất cấu hình Master dưới dạng tệp tin JSON tải về máy để sao lưu.
 */
export function exportMasterConfigAsJson(config: MasterConfig, fileName = 'hailang-master-template-config.json'): void {
  const jsonStr = JSON.stringify(
    {
      appName: 'Hải Lăng Street Sign Master Production',
      exportedAt: new Date().toISOString(),
      version: config.templateVersion || 'V4.0',
      config,
    },
    null,
    2
  );

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Nhập cấu hình Master từ chuỗi JSON hoặc đối tượng tải lên.
 */
export function parseAndValidateConfigJson(jsonContent: string): MasterConfig {
  const data = JSON.parse(jsonContent);
  const rawConfig = data.config && typeof data.config === 'object' ? data.config : data;

  if (!rawConfig || typeof rawConfig !== 'object') {
    throw new Error('Định dạng tệp JSON không hợp lệ!');
  }

  // Hợp nhất an toàn với mặc định
  const merged: MasterConfig = {
    ...DEFAULT_MASTER_CONFIG,
    ...rawConfig,
  };

  return merged;
}
