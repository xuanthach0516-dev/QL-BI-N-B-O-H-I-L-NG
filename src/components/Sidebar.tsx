import React from 'react';
import {
  LayoutDashboard,
  TableProperties,
  Layers,
  Eye,
  CheckCircle,
  FolderArchive,
  DownloadCloud,
  History,
  Settings,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  totalSigns: number;
  errorCount: number;
  needCheckCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  totalSigns,
  errorCount,
  needCheckCount,
}) => {
  const tabs: Array<{
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
    badgeColor?: string;
  }> = [
    {
      id: 'DASHBOARD',
      label: 'DASHBOARD',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'DATA',
      label: 'DỮ LIỆU',
      icon: <TableProperties className="w-4 h-4" />,
      badge: totalSigns,
      badgeColor: 'bg-slate-700 text-slate-200',
    },
    {
      id: 'MASTER',
      label: 'MASTER',
      icon: <Layers className="w-4 h-4" />,
      badge: 'V4.0',
      badgeColor: 'bg-blue-900 text-blue-200',
    },
    {
      id: 'PREVIEW',
      label: 'PREVIEW',
      icon: <Eye className="w-4 h-4" />,
    },
    {
      id: 'QC',
      label: 'QC',
      icon: <CheckCircle className="w-4 h-4" />,
      badge: errorCount > 0 ? `${errorCount} lỗi` : needCheckCount > 0 ? `${needCheckCount} lưu ý` : undefined,
      badgeColor: errorCount > 0 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white',
    },
    {
      id: 'BATCH',
      label: 'BATCH',
      icon: <FolderArchive className="w-4 h-4" />,
    },
    {
      id: 'EXPORT',
      label: 'XUẤT FILE',
      icon: <DownloadCloud className="w-4 h-4" />,
    },
    {
      id: 'HISTORY',
      label: 'LỊCH SỬ',
      icon: <History className="w-4 h-4" />,
    },
    {
      id: 'SETTINGS',
      label: 'CÀI ĐẶT',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Navigation List */}
      <div className="p-3">
        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
          Điều Hướng Sản Xuất
        </div>
        <nav className="space-y-1">
          {tabs.map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-slate-400'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                </div>

                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : tab.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* QC Status Quick Box */}
      <div className="mt-auto p-3 border-t border-slate-800">
        <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400">Kiểm soát quy chuẩn:</span>
            <span className="font-semibold text-emerald-400">500×300 mm</span>
          </div>

          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Nẹp lắp đặt:</span>
              <span className="font-mono text-slate-300">30 mm (Không in)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Tỷ lệ mặt in:</span>
              <span className="font-mono text-slate-300">5 : 3 (500×300)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Lỗi nghiêm trọng:</span>
              <span className={`font-bold ${errorCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {errorCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
