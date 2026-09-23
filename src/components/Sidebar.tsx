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
  ShieldAlert,
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
      label: 'Tổng Quan',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'DATA',
      label: 'Dữ Liệu',
      icon: <TableProperties className="w-4 h-4 shrink-0" />,
      badge: totalSigns,
      badgeColor: 'bg-slate-800 text-slate-300 border border-slate-700',
    },
    {
      id: 'MASTER',
      label: 'Master Mẫu',
      icon: <Layers className="w-4 h-4 shrink-0" />,
      badge: 'V4.0',
      badgeColor: 'bg-blue-900/60 text-blue-300 border border-blue-700/50',
    },
    {
      id: 'PREVIEW',
      label: 'Xem Trước',
      icon: <Eye className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'QC',
      label: 'Kiểm Định QC',
      icon: <CheckCircle className="w-4 h-4 shrink-0" />,
      badge: errorCount > 0 ? `${errorCount} lỗi` : needCheckCount > 0 ? `${needCheckCount} lưu ý` : undefined,
      badgeColor: errorCount > 0 ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
    },
    {
      id: 'BATCH',
      label: 'Lô Sản Xuất',
      icon: <FolderArchive className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'EXPORT',
      label: 'Xuất File',
      icon: <DownloadCloud className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'HISTORY',
      label: 'Lịch Sử',
      icon: <History className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'SETTINGS',
      label: 'Cài Đặt',
      icon: <Settings className="w-4 h-4 shrink-0" />,
    },
  ];

  return (
    <>
      {/* Mobile/Tablet Horizontal Scrolling Bar */}
      <nav className="md:hidden bg-slate-900/95 border-b border-slate-800 px-2 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none z-20 shrink-0">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-white/25 text-white' : tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Desktop Vertical Sidebar */}
      <aside className="hidden md:flex w-60 lg:w-64 bg-slate-900/95 border-r border-slate-800 flex-col shrink-0 select-none">
        {/* Navigation List */}
        <div className="p-3">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 mb-2">
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-900/40 ring-1 ring-blue-400/30'
                      : 'text-slate-300 hover:bg-slate-850 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}>
                      {tab.icon}
                    </span>
                    <span>{tab.label}</span>
                  </div>

                  {tab.badge !== undefined && (
                    <span
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
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
        <div className="mt-auto p-3 border-t border-slate-800/80">
          <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs pb-1.5 border-b border-slate-800/80">
              <span className="text-slate-400 text-[11px]">Quy Chuẩn In:</span>
              <span className="font-mono font-bold text-emerald-400 text-xs">500×300 mm</span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Nẹp lắp đặt:</span>
                <span className="text-slate-400">30 mm (Không in)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Tỷ lệ mặt in:</span>
                <span className="text-slate-300">5 : 3 (500×300)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans">Lỗi cần xử lý:</span>
                <span className={`font-bold ${errorCount > 0 ? 'text-rose-400 font-sans' : 'text-emerald-400 font-sans'}`}>
                  {errorCount > 0 ? `${errorCount} lỗi` : '0 lỗi (Sạch)'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
