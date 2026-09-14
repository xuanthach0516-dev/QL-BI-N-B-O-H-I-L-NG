export const TOTAL_WIDTH = 530; // mm (Cụm biển lắp ghép)
export const TOTAL_HEIGHT = 300; // mm
export const ARTWORK_WIDTH = 500; // mm (Mặt biển in thực tế)
export const ARTWORK_HEIGHT = 300; // mm
export const MOUNTING_TRIM_WIDTH = 30; // mm (Nẹp kết cấu, KHÔNG IN)
export const MOUNTING_TRIM_HEIGHT = 300; // mm

export type SignStatus = 'QC_PASSED' | 'CHECK_REQUIRED' | 'ERROR' | 'EXPORTED';
export type FitStatus = 'OK' | 'SCALED' | 'TOO_LONG' | 'EMPTY';
export type ViewMode = 'ARTWORK' | 'ASSEMBLY';

export interface SignItem {
  id: string;
  stt: number | string;
  maBien: string;
  tenDuong: string;
  ghiChu?: string;
  batch: string; // e.g., 'BATCH 01'
  artworkWidth: number; // 500
  artworkHeight: number; // 300
  assemblyWidth: number; // 530
  assemblyHeight: number; // 300
  trimWidth: number; // 30
  trimHeight: number; // 300
  fontSize: number;
  textWidth: number;
  textHeight: number;
  status: SignStatus;
  fitStatus: FitStatus;
  qcErrors: string[];
  qcWarnings: string[];
  exportedFiles: {
    svg?: boolean;
    pdf?: boolean;
    png?: boolean;
  };
  lastExportedAt?: string;
}

export interface MasterConfig {
  templateVersion: string; // 'V4.0'
  isLocked: boolean;
  artworkWidth?: number; // mm (500)
  artworkHeight?: number; // mm (300)
  assemblyWidth?: number; // mm (530)
  assemblyHeight?: number; // mm (300)
  mountingTrimWidth?: number; // mm (30)
  backgroundColor: string; // #004b99
  borderColor: string; // #ffffff
  borderInset: number; // mm (13)
  borderThickness: number; // mm (3.5)
  cornerNotchRadius: number; // mm (16)
  titleText: string; // 'ĐƯỜNG'
  titleColor: string; // #ffffff
  titleFont: string; // 'Montserrat, sans-serif'
  titleHeight: number; // mm (approx 48-50)
  titleX?: number; // mm (tọa độ X tiêu đề, mặc định 330)
  titleY?: number; // mm (tọa độ Y tiêu đề, mặc định 126)
  roadNameColor: string; // #ffffff
  roadNameFont: string; // 'Montserrat, sans-serif'
  targetRoadNameHeight: number; // mm (60)
  minRoadNameHeight: number; // mm (32)
  availableWidth: number; // mm (440)
  roadNameX?: number; // mm (tọa độ tâm X tên đường, mặc định 250)
  roadNameY?: number; // mm (tọa độ tâm Y tên đường, mặc định 230)
  logoType: 'vector' | 'custom';
  customLogoUrl?: string;
  logoX?: number; // mm (tọa độ tâm X logo, mặc định 110)
  logoY?: number; // mm (tọa độ tâm Y logo, mặc định 96)
  logoSize?: number; // mm (kích thước đường kính logo, mặc định 76)
  defaultDpi: 300 | 600; // 600 default
  includeAssemblyInZip: boolean; // default false
  dpi?: 300 | 600;
  fixedTitleHeight?: number;
}

export interface FitRoadNameResult {
  fontSize: number;
  textWidth: number;
  textHeight: number;
  x: number;
  y: number;
  status: FitStatus;
  scaleRatio: number;
}

export interface BatchSummary {
  batchName: string;
  startIndex: number;
  endIndex: number;
  total: number;
  passed: number;
  warning: number;
  error: number;
  exported: number;
  isComplete: boolean;
}

export interface ExportProgress {
  isRunning: boolean;
  isPaused: boolean;
  total: number;
  current: number;
  currentSignName: string;
  batchName: string;
  completedIds: string[];
  failedIds: string[];
  lastError?: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: string;
  batchName: string;
  type: 'SVG' | 'PDF' | 'PNG' | 'ZIP' | 'EXCEL' | 'ASSEMBLY';
  itemCount: number;
  fileName: string;
  fileSize?: string;
  status: 'SUCCESS' | 'FAILED';
}

export type NavigationTab =
  | 'DASHBOARD'
  | 'DATA'
  | 'MASTER'
  | 'PREVIEW'
  | 'QC'
  | 'BATCH'
  | 'EXPORT'
  | 'HISTORY'
  | 'SETTINGS';
