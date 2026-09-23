import React, { useState, useRef, useEffect } from 'react';
import { MasterConfig, ARTWORK_WIDTH, ARTWORK_HEIGHT } from '../types';
import { SelectableElement } from './PrecisionNudgeBar';

interface InteractiveSignCanvasOverlayProps {
  config: MasterConfig;
  previewMode: 'ARTWORK' | 'ASSEMBLY';
  selectedElement: SelectableElement;
  onSelectElement: (el: SelectableElement) => void;
  onUpdateConfig: (config: MasterConfig) => void;
  isLocked: boolean;
  sampleRoadName: string;
}

export const InteractiveSignCanvasOverlay: React.FC<InteractiveSignCanvasOverlayProps> = ({
  config,
  previewMode,
  selectedElement,
  onSelectElement,
  onUpdateConfig,
  isLocked,
  sampleRoadName,
}) => {
  const overlayRef = useRef<SVGSVGElement>(null);

  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragTarget, setDragTarget] = useState<SelectableElement>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [initialElemPos, setInitialElemPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  
  // Magnetic snapping feedback
  const [snappedToCenter, setSnappedToCenter] = useState(false);
  const [snappedToLogoY, setSnappedToLogoY] = useState(false);

  const logoX = config.logoX ?? 110;
  const logoY = config.logoY ?? 96;
  const logoSize = config.logoSize ?? 76;
  const logoR = logoSize / 2;

  const titleX = config.titleX ?? 330;
  const titleY = config.titleY ?? 126;
  const titleHeight = config.titleHeight || 48;

  const roadNameX = config.roadNameX ?? 250;
  const roadNameY = config.roadNameY ?? 230;

  // Chiều rộng và vị trí viewBox
  const viewWidth = previewMode === 'ARTWORK' ? 500 : 530;
  const viewHeight = 300;
  // Offset nếu là ASSEMBLY mode (phần nẹp 30mm nằm bên trái)
  const xOffset = previewMode === 'ARTWORK' ? 0 : 30;

  // Chuyển đổi tọa độ chuột từ client pixel sang SVG millimetre
  const clientToSvgPoint = (clientX: number, clientY: number): { x: number; y: number } | null => {
    if (!overlayRef.current) return null;
    const rect = overlayRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;

    const scaleX = viewWidth / rect.width;
    const scaleY = viewHeight / rect.height;

    const x = (clientX - rect.left) * scaleX - xOffset;
    const y = (clientY - rect.top) * scaleY;
    return { x, y };
  };

  const handlePointerDown = (
    e: React.PointerEvent,
    target: 'LOGO' | 'TITLE' | 'ROAD_NAME' | 'FRAME'
  ) => {
    if (isLocked) {
      onSelectElement(target);
      return;
    }

    e.stopPropagation();
    onSelectElement(target);

    const pt = clientToSvgPoint(e.clientX, e.clientY);
    if (!pt) return;

    setIsDragging(true);
    setDragTarget(target);
    setDragStartPos(pt);

    if (target === 'LOGO') {
      setInitialElemPos({ x: logoX, y: logoY });
    } else if (target === 'TITLE') {
      setInitialElemPos({ x: titleX, y: titleY });
    } else if (target === 'ROAD_NAME') {
      setInitialElemPos({ x: roadNameX, y: roadNameY });
    } else if (target === 'FRAME') {
      setInitialElemPos({ x: config.borderInset, y: config.borderInset });
    }
  };

  useEffect(() => {
    if (!isDragging || !dragTarget || isLocked) return;

    const handlePointerMove = (e: PointerEvent) => {
      const pt = clientToSvgPoint(e.clientX, e.clientY);
      if (!pt) return;

      const dx = pt.x - dragStartPos.x;
      const dy = pt.y - dragStartPos.y;

      if (dragTarget === 'LOGO') {
        let newX = Math.round((initialElemPos.x + dx) * 2) / 2;
        let newY = Math.round((initialElemPos.y + dy) * 2) / 2;

        // Nam châm trục giữa 250mm
        if (Math.abs(newX - 250) <= 4) {
          newX = 250;
          setSnappedToCenter(true);
        } else {
          setSnappedToCenter(false);
        }

        newX = Math.max(30, Math.min(470, newX));
        newY = Math.max(30, Math.min(270, newY));

        onUpdateConfig({ ...config, logoX: newX, logoY: newY });
      } else if (dragTarget === 'TITLE') {
        let newX = Math.round((initialElemPos.x + dx) * 2) / 2;
        let newY = Math.round((initialElemPos.y + dy) * 2) / 2;

        // Nam châm trục giữa 250mm
        if (Math.abs(newX - 250) <= 4) {
          newX = 250;
          setSnappedToCenter(true);
        } else {
          setSnappedToCenter(false);
        }

        // Nam châm ngang hàng với logo
        if (Math.abs(newY - (logoY + 30)) <= 3) {
          newY = logoY + 30;
          setSnappedToLogoY(true);
        } else {
          setSnappedToLogoY(false);
        }

        newX = Math.max(50, Math.min(460, newX));
        newY = Math.max(40, Math.min(270, newY));

        onUpdateConfig({ ...config, titleX: newX, titleY: newY });
      } else if (dragTarget === 'ROAD_NAME') {
        let newX = Math.round((initialElemPos.x + dx) * 2) / 2;
        let newY = Math.round((initialElemPos.y + dy) * 2) / 2;

        // Nam châm trục giữa 250mm
        if (Math.abs(newX - 250) <= 4) {
          newX = 250;
          setSnappedToCenter(true);
        } else {
          setSnappedToCenter(false);
        }

        newX = Math.max(50, Math.min(450, newX));
        newY = Math.max(120, Math.min(280, newY));

        onUpdateConfig({ ...config, roadNameX: newX, roadNameY: newY });
      } else if (dragTarget === 'FRAME') {
        const delta = Math.round(dy * 2) / 2;
        const newInset = Math.max(6, Math.min(28, initialElemPos.y + delta));
        onUpdateConfig({ ...config, borderInset: newInset });
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setDragTarget(null);
      setSnappedToCenter(false);
      setSnappedToLogoY(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, dragTarget, dragStartPos, initialElemPos, config, isLocked, logoY]);

  // Vùng bao ước tính của Title (chiều rộng chữ xấp xỉ)
  const titleBoxW = Math.max(140, config.titleText.length * 28);
  const titleBoxH = titleHeight * 1.1;

  // Vùng bao ước tính của Tên đường
  const roadBoxW = Math.min(440, Math.max(180, (sampleRoadName || 'DX.813').length * 22));
  const roadBoxH = Math.max(50, (config.targetRoadNameHeight || 60) * 1.3);

  const inset = config.borderInset;
  const frameX = xOffset + inset;
  const frameY = inset;
  const frameW = 500 - inset * 2;
  const frameH = 300 - inset * 2;

  return (
    <svg
      ref={overlayRef}
      viewBox={`0 0 ${viewWidth} ${viewHeight}`}
      className="absolute inset-0 w-full h-full pointer-events-auto select-none"
      style={{ touchAction: 'none' }}
      onClick={() => onSelectElement(null)}
    >
      <defs>
        {/* Drop shadow cho HUD tags */}
        <filter id="hudShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.8" />
        </filter>
      </defs>

      {/* Đường gióng nam châm trục dọc 250mm */}
      {(snappedToCenter || isDragging) && (
        <g opacity={snappedToCenter ? 1 : 0.4}>
          <line
            x1={xOffset + 250}
            y1={0}
            x2={xOffset + 250}
            y2={300}
            stroke="#06b6d4"
            strokeWidth={snappedToCenter ? "1.5" : "1"}
            strokeDasharray="4 3"
          />
          {snappedToCenter && (
            <text
              x={xOffset + 250}
              y={12}
              fill="#22d3ee"
              fontSize="8"
              fontFamily="monospace"
              fontWeight="bold"
              textAnchor="middle"
              filter="url(#hudShadow)"
            >
              | TRỤC GIỮA BIỂN X = 250 mm |
            </text>
          )}
        </g>
      )}

      {/* Đường gióng ngang hàng Logo cho Tiêu đề */}
      {snappedToLogoY && (
        <g>
          <line
            x1={xOffset + inset}
            y1={logoY + 30}
            x2={xOffset + 500 - inset}
            y2={logoY + 30}
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <text
            x={xOffset + 250}
            y={logoY + 25}
            fill="#fbbf24"
            fontSize="8"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
            filter="url(#hudShadow)"
          >
            — CÂN BẰNG TỌA ĐỘ VỚI LOGO —
          </text>
        </g>
      )}

      {/* 1. KHUNG VIỀN INTERACTIVE HOTSPOT */}
      <rect
        x={frameX}
        y={frameY}
        width={frameW}
        height={frameH}
        fill="transparent"
        stroke={selectedElement === 'FRAME' ? '#818cf8' : 'transparent'}
        strokeWidth={selectedElement === 'FRAME' ? '2' : '10'}
        strokeDasharray={selectedElement === 'FRAME' ? '5 3' : 'none'}
        className={isLocked ? 'cursor-pointer' : 'cursor-pointer hover:stroke-indigo-400/50'}
        onClick={(e) => {
          e.stopPropagation();
          onSelectElement('FRAME');
        }}
      />
      {selectedElement === 'FRAME' && (
        <g>
          {/* Nhãn viền trên */}
          <rect
            x={frameX + frameW / 2 - 50}
            y={frameY - 14}
            width="100"
            height="12"
            rx="3"
            fill="#1e1b4b"
            stroke="#6366f1"
            strokeWidth="0.8"
            filter="url(#hudShadow)"
          />
          <text
            x={frameX + frameW / 2}
            y={frameY - 5}
            fill="#c7d2fe"
            fontSize="7"
            fontFamily="monospace"
            fontWeight="bold"
            textAnchor="middle"
          >
            Lùi: {config.borderInset}mm · Dày: {config.borderThickness}mm
          </text>
        </g>
      )}

      {/* 2. LOGO INTERACTIVE BOUNDING BOX */}
      <g
        transform={`translate(${xOffset + logoX}, ${logoY})`}
        className={isLocked ? 'cursor-pointer' : 'cursor-move'}
        onPointerDown={(e) => handlePointerDown(e, 'LOGO')}
      >
        {/* Vòng chạm lớn (Touch hotspot) */}
        <circle cx={0} cy={0} r={logoR + 6} fill="transparent" />

        {/* Khung viền chọn (Selection ring) */}
        {selectedElement === 'LOGO' ? (
          <g>
            <circle
              cx={0}
              cy={0}
              r={logoR + 4}
              fill="rgba(6, 182, 212, 0.12)"
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            {/* Điểm neo 4 phía */}
            <circle cx={-logoR - 4} cy={0} r={2.5} fill="#22d3ee" />
            <circle cx={logoR + 4} cy={0} r={2.5} fill="#22d3ee" />
            <circle cx={0} cy={-logoR - 4} r={2.5} fill="#22d3ee" />
            <circle cx={0} cy={logoR + 4} r={2.5} fill="#22d3ee" />

            {/* Tâm chữ thập */}
            <circle cx={0} cy={0} r={1.5} fill="#22d3ee" />
            <line x1={-6} y1={0} x2={6} y2={0} stroke="#22d3ee" strokeWidth="1" />
            <line x1={0} y1={-6} x2={0} y2={6} stroke="#22d3ee" strokeWidth="1" />

            {/* Tooltip HUD tọa độ */}
            <g transform={`translate(0, ${logoR + 15})`}>
              <rect
                x="-46"
                y="-7"
                width="92"
                height="13"
                rx="3"
                fill="#083344"
                stroke="#06b6d4"
                strokeWidth="0.8"
                filter="url(#hudShadow)"
              />
              <text
                x="0"
                y="2.5"
                fill="#67e8f9"
                fontSize="7.5"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                LOGO: ({Math.round(logoX)}, {Math.round(logoY)}) ⌀{logoSize}
              </text>
            </g>
          </g>
        ) : (
          /* Subtle hover indicator */
          <circle
            cx={0}
            cy={0}
            r={logoR + 3}
            fill="transparent"
            stroke="transparent"
            className="hover:stroke-cyan-400/40 transition"
            strokeWidth="1"
          />
        )}
      </g>

      {/* 3. TIÊU ĐỀ "ĐƯỜNG" INTERACTIVE BOUNDING BOX */}
      <g
        transform={`translate(${xOffset + titleX}, ${titleY})`}
        className={isLocked ? 'cursor-pointer' : 'cursor-move'}
        onPointerDown={(e) => handlePointerDown(e, 'TITLE')}
      >
        {/* Vùng chạm */}
        <rect
          x={-titleBoxW / 2}
          y={-titleBoxH * 0.85}
          width={titleBoxW}
          height={titleBoxH}
          fill="transparent"
        />

        {selectedElement === 'TITLE' ? (
          <g>
            <rect
              x={-titleBoxW / 2}
              y={-titleBoxH * 0.85}
              width={titleBoxW}
              height={titleBoxH}
              rx="3"
              fill="rgba(245, 158, 11, 0.12)"
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            {/* Anchor handles */}
            <circle cx={-titleBoxW / 2} cy={-titleBoxH * 0.85} r={2.5} fill="#fbbf24" />
            <circle cx={titleBoxW / 2} cy={-titleBoxH * 0.85} r={2.5} fill="#fbbf24" />
            <circle cx={-titleBoxW / 2} cy={titleBoxH * 0.15} r={2.5} fill="#fbbf24" />
            <circle cx={titleBoxW / 2} cy={titleBoxH * 0.15} r={2.5} fill="#fbbf24" />

            {/* Baseline marker */}
            <line x1={-titleBoxW / 2} y1={0} x2={titleBoxW / 2} y2={0} stroke="#fbbf24" strokeWidth="0.8" />

            {/* Tooltip HUD */}
            <g transform={`translate(0, ${-titleBoxH * 0.85 - 8})`}>
              <rect
                x="-48"
                y="-7"
                width="96"
                height="13"
                rx="3"
                fill="#451a03"
                stroke="#f59e0b"
                strokeWidth="0.8"
                filter="url(#hudShadow)"
              />
              <text
                x="0"
                y="2.5"
                fill="#fde68a"
                fontSize="7.5"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                TIÊU ĐỀ: ({Math.round(titleX)}, {Math.round(titleY)}) H{titleHeight}
              </text>
            </g>
          </g>
        ) : (
          <rect
            x={-titleBoxW / 2}
            y={-titleBoxH * 0.85}
            width={titleBoxW}
            height={titleBoxH}
            rx="3"
            fill="transparent"
            stroke="transparent"
            className="hover:stroke-amber-400/40 transition"
            strokeWidth="1"
          />
        )}
      </g>

      {/* 4. TÊN ĐƯỜNG INTERACTIVE BOUNDING BOX */}
      <g
        transform={`translate(${xOffset + roadNameX}, ${roadNameY})`}
        className={isLocked ? 'cursor-pointer' : 'cursor-move'}
        onPointerDown={(e) => handlePointerDown(e, 'ROAD_NAME')}
      >
        {/* Vùng chạm */}
        <rect
          x={-roadBoxW / 2}
          y={-roadBoxH / 2}
          width={roadBoxW}
          height={roadBoxH}
          fill="transparent"
        />

        {selectedElement === 'ROAD_NAME' ? (
          <g>
            <rect
              x={-roadBoxW / 2}
              y={-roadBoxH / 2}
              width={roadBoxW}
              height={roadBoxH}
              rx="3"
              fill="rgba(16, 185, 129, 0.12)"
              stroke="#34d399"
              strokeWidth="1.5"
              strokeDasharray="4 2"
            />
            {/* Điểm neo 4 góc */}
            <circle cx={-roadBoxW / 2} cy={-roadBoxH / 2} r={2.5} fill="#34d399" />
            <circle cx={roadBoxW / 2} cy={-roadBoxH / 2} r={2.5} fill="#34d399" />
            <circle cx={-roadBoxW / 2} cy={roadBoxH / 2} r={2.5} fill="#34d399" />
            <circle cx={roadBoxW / 2} cy={roadBoxH / 2} r={2.5} fill="#34d399" />

            {/* Trục tâm chữ thập */}
            <line x1={-8} y1={0} x2={8} y2={0} stroke="#34d399" strokeWidth="1" />
            <line x1={0} y1={-8} x2={0} y2={8} stroke="#34d399" strokeWidth="1" />

            {/* Tooltip HUD */}
            <g transform={`translate(0, ${roadBoxH / 2 + 10})`}>
              <rect
                x="-52"
                y="-7"
                width="104"
                height="13"
                rx="3"
                fill="#064e3b"
                stroke="#10b981"
                strokeWidth="0.8"
                filter="url(#hudShadow)"
              />
              <text
                x="0"
                y="2.5"
                fill="#a7f3d0"
                fontSize="7.5"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                TÊN ĐƯỜNG: ({Math.round(roadNameX)}, {Math.round(roadNameY)})
              </text>
            </g>
          </g>
        ) : (
          <rect
            x={-roadBoxW / 2}
            y={-roadBoxH / 2}
            width={roadBoxW}
            height={roadBoxH}
            rx="3"
            fill="transparent"
            stroke="transparent"
            className="hover:stroke-emerald-400/40 transition"
            strokeWidth="1"
          />
        )}
      </g>
    </svg>
  );
};
