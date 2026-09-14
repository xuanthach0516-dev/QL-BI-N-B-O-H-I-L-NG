import React, { useState, useMemo, useEffect } from 'react';
import {
  SignItem,
  MasterConfig,
  NavigationTab,
  HistoryEntry,
} from './types';
import {
  loadProductionSigns,
  INITIAL_TEST_SIGNS_DATA,
  createSignItemFromRaw,
  computeBatches,
} from './data/sampleSigns';
import { runBatchQc } from './utils/qcEngine';
import { exportSignsExcel } from './utils/exportUtils';
import { DEFAULT_MASTER_CONFIG } from './utils/masterSvg';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DataTableView } from './components/DataTableView';
import { MasterTemplateView } from './components/MasterTemplateView';
import { PreviewView } from './components/PreviewView';
import { QcView } from './components/QcView';
import { BatchView } from './components/BatchView';
import { ExportView } from './components/ExportView';
import { HistoryView } from './components/HistoryView';
import { SettingsView } from './components/SettingsView';
import { SignEditModal } from './components/SignEditModal';
import { BuiltInTestsModal } from './components/BuiltInTestsModal';

export default function App() {
  // 1. Cấu hình Master Template
  const [masterConfig, setMasterConfig] = useState<MasterConfig>(DEFAULT_MASTER_CONFIG);

  // 2. Kích thước Batch (Rule 24: Mặc định 500)
  const [batchSize, setBatchSize] = useState<number>(500);

  // 3. Danh sách biển (khởi tạo với 4.000 biển thực tế dự án Hải Lăng)
  const [signs, setSigns] = useState<SignItem[]>(() => {
    return loadProductionSigns(4000, 500);
  });

  // 4. Tab điều hướng hiện tại (Rule 32)
  const [currentTab, setCurrentTab] = useState<NavigationTab>('DASHBOARD');

  // 5. Biển đang được xem trước / chỉnh sửa
  const [selectedSign, setSelectedSign] = useState<SignItem | null>(null);
  const [editingSign, setEditingSign] = useState<SignItem | null>(null);

  // 6. Modal kiểm thử tự động
  const [isSelfTestOpen, setIsSelfTestOpen] = useState(false);

  // 7. Lịch sử xuất file
  const [history, setHistory] = useState<HistoryEntry[]>([
    {
      id: 'init_sample',
      timestamp: new Date().toLocaleDateString('vi-VN') + ' 08:30:00',
      batchName: 'BATCH 01',
      type: 'ZIP',
      itemCount: 500,
      fileName: 'HAI_LANG_BATCH_01.zip',
      fileSize: '42.5 MB',
      status: 'SUCCESS',
    },
  ]);

  // Tính toán tóm tắt Lô sản xuất (Batches)
  const batchSummaries = useMemo(() => {
    return computeBatches(signs, batchSize);
  }, [signs, batchSize]);

  // Thống kê lỗi QC tổng thể
  const { errorCount, needCheckCount } = useMemo(() => {
    let err = 0;
    let warn = 0;
    signs.forEach((s) => {
      if (s.status === 'ERROR') err++;
      else if (s.status === 'CHECK_REQUIRED') warn++;
    });
    return { errorCount: err, needCheckCount: warn };
  }, [signs]);

  // Đổi quy mô lô (Batch Size)
  const handleChangeBatchSize = (newSize: number) => {
    setBatchSize(newSize);
    // Cập nhật lại thuộc tính batch cho từng biển
    const updated = signs.map((sign, idx) => {
      const batchNum = Math.floor(idx / newSize) + 1;
      const batchName = `BATCH ${String(batchNum).padStart(2, '0')}`;
      return { ...sign, batch: batchName };
    });
    setSigns(updated);
  };

  // Nạp 12 mẫu kiểm thử chuẩn (Rule 34)
  const handleLoadTestSigns = () => {
    const testItems = INITIAL_TEST_SIGNS_DATA.map((item, idx) =>
      createSignItemFromRaw({
        stt: idx + 1,
        maBien: item.maBien,
        tenDuong: item.tenDuong,
        ghiChu: item.ghiChu,
      }, batchSize)
    );
    setSigns(testItems);
    setSelectedSign(testItems[0]);
    alert(`Đã nạp 12 biển kiểm thử bắt buộc (Rule 34) thành công!`);
  };

  // Sinh n biển sản xuất (ví dụ 500 hoặc 4.000)
  const handleGenerateProductionSigns = (count: number) => {
    const newItems = loadProductionSigns(count, batchSize);
    setSigns(newItems);
    setSelectedSign(newItems[0]);
    alert(`Đã nạp ${count.toLocaleString()} biển vào hệ thống!`);
  };

  // Cập nhật biển sau khi chỉnh sửa
  const handleSaveSign = (updatedSign: SignItem) => {
    const newSigns = signs.map((s) => (s.id === updatedSign.id ? updatedSign : s));
    setSigns(newSigns);
    if (selectedSign?.id === updatedSign.id) {
      setSelectedSign(updatedSign);
    }
  };

  // Xem trước 1 biển từ Table hoặc QC
  const handlePreviewSign = (sign: SignItem) => {
    setSelectedSign(sign);
    setCurrentTab('PREVIEW');
  };

  // Đánh dấu các biển đã xuất thành công
  const handleUpdateSignExported = (signIds: string[]) => {
    const idSet = new Set(signIds);
    setSigns((prev) =>
      prev.map((s) => (idSet.has(s.id) ? { ...s, status: 'EXPORTED' } : s))
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* 1. Header (Cố định ở trên) */}
      <Header
        config={masterConfig}
        onToggleLock={() => {
          setMasterConfig((prev) => ({ ...prev, isLocked: !prev.isLocked }));
        }}
        onOpenSelfTest={() => setIsSelfTestOpen(true)}
        onExportExcel={() => exportSignsExcel(signs)}
        totalSigns={signs.length}
        onQuickLoadDataset={handleGenerateProductionSigns}
      />

      {/* 2. Main Layout (Sidebar + Content View) */}
      <div className="flex-1 flex flex-col md:flex-row w-full overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          totalSigns={signs.length}
          errorCount={errorCount}
          needCheckCount={needCheckCount}
        />

        {/* Dynamic Main Workspace */}
        <main className="flex-1 overflow-y-auto bg-slate-950/60 pb-16">
          {currentTab === 'DASHBOARD' && (
            <DashboardView
              signs={signs}
              batchSummaries={batchSummaries}
              onNavigate={setCurrentTab}
              onQuickLoadCount={handleGenerateProductionSigns}
            />
          )}

          {currentTab === 'DATA' && (
            <DataTableView
              signs={signs}
              onUpdateSigns={setSigns}
              onPreviewSign={handlePreviewSign}
              onEditSign={setEditingSign}
              masterConfig={masterConfig}
              onExportExcel={() => exportSignsExcel(signs)}
              onLoadTestSigns={handleLoadTestSigns}
              onGenerateProductionSigns={handleGenerateProductionSigns}
            />
          )}

          {currentTab === 'MASTER' && (
            <MasterTemplateView
              config={masterConfig}
              onUpdateConfig={setMasterConfig}
            />
          )}

          {currentTab === 'PREVIEW' && (
            <PreviewView
              signs={signs}
              selectedSign={selectedSign}
              onSelectSign={setSelectedSign}
              masterConfig={masterConfig}
            />
          )}

          {currentTab === 'QC' && (
            <QcView
              signs={signs}
              onUpdateSigns={setSigns}
              onPreviewSign={handlePreviewSign}
              onEditSign={setEditingSign}
            />
          )}

          {currentTab === 'BATCH' && (
            <BatchView
              signs={signs}
              batchSummaries={batchSummaries}
              batchSize={batchSize}
              onChangeBatchSize={handleChangeBatchSize}
              onExportBatchZip={(batchName) => {
                setCurrentTab('EXPORT');
              }}
              onFilterByBatch={(batchName) => {
                setCurrentTab('DATA');
              }}
            />
          )}

          {currentTab === 'EXPORT' && (
            <ExportView
              signs={signs}
              batchSummaries={batchSummaries}
              masterConfig={masterConfig}
              onAddHistory={(entry) => setHistory([entry, ...history])}
              onUpdateSignExported={handleUpdateSignExported}
            />
          )}

          {currentTab === 'HISTORY' && (
            <HistoryView
              history={history}
              onClearHistory={() => setHistory([])}
            />
          )}

          {currentTab === 'SETTINGS' && (
            <SettingsView
              config={masterConfig}
              onUpdateConfig={setMasterConfig}
              onLoadTestSigns={handleLoadTestSigns}
              onGenerateSigns={handleGenerateProductionSigns}
            />
          )}
        </main>
      </div>

      {/* Edit Sign Modal */}
      <SignEditModal
        sign={editingSign}
        isOpen={!!editingSign}
        onClose={() => setEditingSign(null)}
        onSave={handleSaveSign}
        masterConfig={masterConfig}
        allSigns={signs}
      />

      {/* Built-in Automated Tests Modal (Rule 34 & 35) */}
      <BuiltInTestsModal
        isOpen={isSelfTestOpen}
        onClose={() => setIsSelfTestOpen(false)}
        masterConfig={masterConfig}
      />
    </div>
  );
}
