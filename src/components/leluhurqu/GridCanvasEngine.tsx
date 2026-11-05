import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import {
  Grid,
  Layers,
  Circle,
  Square,
  Hexagon,
  GitBranch,
  Move,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Printer,
  Download,
  Plus,
  Trash2,
  Edit3,
  RefreshCw,
  Sparkles,
  ArrowLeft,
  X,
  FileText,
  Sliders,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Save,
  UploadCloud,
  Share2,
  Sun,
  Moon
} from 'lucide-react';
import { OrbitTreeData, OrbitNode } from './OrbitQuView';

export interface GridNode {
  id: string;
  name: string;
  dotNotation: string; // Misal: 1, 1.1, 1.2, 1.2.1, dst.
  row: number; // Y level (Generasi / Row)
  col: number; // X slot (Column)
  parentId?: string | null;
  gender?: 'L' | 'P';
  spouseName?: string;
  status?: 'Hidup' | 'Almarhum';
  birthYear?: string;
  role?: string;
  color?: string;
}

export type NodeShapeType = 'circle' | 'hexagon' | 'card';
export type ConnectorLineType = 'straight' | 'bezier' | 'orthogonal';
export type PaperSizeType =
  | 'responsive'
  | 'a4-portrait'
  | 'a4-landscape'
  | 'a3-portrait'
  | 'a3-landscape'
  | 'a2-landscape'
  | 'a1-landscape'
  | 'a0-landscape';

export interface GridCanvasEngineProps {
  familyTree?: OrbitTreeData;
  onUpdateFamilyTree?: React.Dispatch<React.SetStateAction<OrbitTreeData>>;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onBackToLeluhurQu?: () => void;
  showNotification?: (msg: string) => void;
}

// Dimensi Standar Kertas Cetak (dalam piksel untuk DPI 96 & rasio SVG presisi)
const PAPER_DIMENSIONS: Record<PaperSizeType, { name: string; width: number; height: number; mm: string }> = {
  'responsive': { name: 'Auto-Fit Responsive (Tak Terbatas)', width: 2400, height: 1600, mm: 'Auto' },
  'a4-portrait': { name: 'A4 Portrait (210 × 297 mm)', width: 794, height: 1123, mm: '210 × 297 mm' },
  'a4-landscape': { name: 'A4 Landscape (297 × 210 mm)', width: 1123, height: 794, mm: '297 × 210 mm' },
  'a3-portrait': { name: 'A3 Portrait (297 × 420 mm)', width: 1123, height: 1587, mm: '297 × 420 mm' },
  'a3-landscape': { name: 'A3 Landscape (420 × 297 mm)', width: 1587, height: 1123, mm: '420 × 297 mm' },
  'a2-landscape': { name: 'A2 Landscape (594 × 420 mm)', width: 2245, height: 1587, mm: '594 × 420 mm' },
  'a1-landscape': { name: 'A1 Landscape (841 × 594 mm)', width: 3179, height: 2245, mm: '841 × 594 mm' },
  'a0-landscape': { name: 'A0 Super Poster (1189 × 841 mm)', width: 4494, height: 3179, mm: '1189 × 841 mm' },
};

// Data Awal Bawaan Berbasis Matriks Koordinat Bebas Nabrak
const INITIAL_GRID_NODES: GridNode[] = [
  // Generasi 1 (Row 0: Uyut Utama)
  { id: 'node_1', name: 'Kyai Abdul Ghani (Uyut)', dotNotation: '1', row: 0, col: 3, gender: 'L', status: 'Almarhum', birthYear: '1910', role: 'Leluhur Utama', color: '#f59e0b' },

  // Generasi 2 (Row 1: 3 Anak Uyut / Kakek)
  { id: 'node_1_1', name: 'Kakek Ahmad (Sulung)', dotNotation: '1.1', row: 1, col: 1, parentId: 'node_1', gender: 'L', status: 'Almarhum', birthYear: '1935', role: 'Kakek 1', color: '#10b981' },
  { id: 'node_1_2', name: 'Kakek Hasan (Tengah)', dotNotation: '1.2', row: 1, col: 3, parentId: 'node_1', gender: 'L', status: 'Almarhum', birthYear: '1938', role: 'Kakek 2 (Nasab Utama)', color: '#38bdf8' },
  { id: 'node_1_3', name: 'Nenek Maryam (Bungsu)', dotNotation: '1.3', row: 1, col: 5, parentId: 'node_1', gender: 'P', status: 'Almarhum', birthYear: '1942', role: 'Nenek 3', color: '#ec4899' },

  // Generasi 3 (Row 2: Ayah & Paman)
  { id: 'node_1_2_1', name: 'Paman Ridwan', dotNotation: '1.2.1', row: 2, col: 2, parentId: 'node_1_2', gender: 'L', status: 'Hidup', birthYear: '1962', role: 'Anak Kakek 1', color: '#38bdf8' },
  { id: 'node_1_2_2', name: 'Ayah Hendra Sukma', dotNotation: '1.2.2', row: 2, col: 3, parentId: 'node_1_2', gender: 'L', status: 'Hidup', birthYear: '1965', role: 'Ayah Kandung', spouseName: 'Ibu Ratna Dewi', color: '#06b6d4' },
  { id: 'node_1_2_3', name: 'Bibi Siti Aminah', dotNotation: '1.2.3', row: 2, col: 4, parentId: 'node_1_2', gender: 'P', status: 'Hidup', birthYear: '1968', role: 'Anak Kakek 3', color: '#a855f7' },

  // Generasi 4 (Row 3: Generasi Saya & Saudara)
  { id: 'node_1_2_2_1', name: 'Kakak Faisal', dotNotation: '1.2.2.1', row: 3, col: 2, parentId: 'node_1_2_2', gender: 'L', status: 'Hidup', birthYear: '1990', role: 'Kakak Sulung', color: '#8b5cf6' },
  { id: 'node_1_2_2_2', name: 'Hendri Bageur (SAYA)', dotNotation: '1.2.2.2', row: 3, col: 3, parentId: 'node_1_2_2', gender: 'L', status: 'Hidup', birthYear: '1993', role: 'Pengguna / Poros', spouseName: 'Siti Nurhaliza', color: '#eab308' },
  { id: 'node_1_2_2_3', name: 'Adik Sarah Maulida', dotNotation: '1.2.2.3', row: 3, col: 4, parentId: 'node_1_2_2', gender: 'P', status: 'Hidup', birthYear: '1998', role: 'Adik Bungsu', color: '#ec4899' },

  // Generasi 5 (Row 4: Anak-Anak)
  { id: 'node_1_2_2_2_1', name: 'Rizky Pratama (Anak 1)', dotNotation: '1.2.2.2.1', row: 4, col: 2.5, parentId: 'node_1_2_2_2', gender: 'L', status: 'Hidup', birthYear: '2020', role: 'Anak Sulung', color: '#14b8a6' },
  { id: 'node_1_2_2_2_2', name: 'Aisyah Putri (Anak 2)', dotNotation: '1.2.2.2.2', row: 4, col: 3.5, parentId: 'node_1_2_2_2', gender: 'P', status: 'Hidup', birthYear: '2023', role: 'Anak Bungsu', color: '#f43f5e' },
];

export const GridCanvasEngine: React.FC<GridCanvasEngineProps> = ({
  familyTree,
  onUpdateFamilyTree,
  theme,
  onToggleTheme,
  onBackToLeluhurQu,
  showNotification
}) => {
  const isLight = theme === 'light';
  const svgRef = useRef<SVGSVGElement | null>(null);

  // 1. STATE PENGATURAN UTAMA ENGINE
  const [nodeShape, setNodeShape] = useState<NodeShapeType>('circle');
  const [lineType, setLineType] = useState<ConnectorLineType>('bezier');
  const [paperSize, setPaperSize] = useState<PaperSizeType>('responsive');
  const [showGridMatrix, setShowGridMatrix] = useState<boolean>(true);
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);

  // 2. DATA NODES & MATRIX COORDINATES
  const [nodes, setNodes] = useState<GridNode[]>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_grid_engine_nodes_v1');
      return saved ? JSON.parse(saved) : INITIAL_GRID_NODES;
    } catch {
      return INITIAL_GRID_NODES;
    }
  });

  // Simpan perubahan ke LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_grid_engine_nodes_v1', JSON.stringify(nodes));
    } catch (e) {
      console.error(e);
    }
  }, [nodes]);

  // 3. ZOOM & PAN ENGINE
  const [zoom, setZoom] = useState<number>(0.85);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 80, y: 80 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 4. DRAG & DROP SNAP TO GRID STATE
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeGhostPos, setActiveGhostPos] = useState<{ x: number; y: number; row: number; col: number } | null>(null);

  // 5. SIDEBAR & MODAL STATES
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'settings' | 'batch' | 'sync' | 'info'>('batch');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Batch Input Text
  const [batchInputText, setBatchInputText] = useState<string>(
    'Kyai Abdul Ghani, Kakek Hasan, Ayah Hendra, Hendri Bageur, Rizky Pratama'
  );
  const [batchParentTargetId, setBatchParentTargetId] = useState<string>('node_1');

  // Edit Node Modal
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editingNode, setEditingNode] = useState<GridNode | null>(null);

  // Konstanta Ukuran Grid Spatial
  const CELL_WIDTH = 200; // Lebar sel grid (px)
  const CELL_HEIGHT = 160; // Tinggi sel antar generasi (px)
  const GRID_OFFSET_X = 120;
  const GRID_OFFSET_Y = 120;

  // Konversi Baris/Kolom ke Koordinat Piksel Real
  const getPixelCoord = useCallback((col: number, row: number) => {
    return {
      x: GRID_OFFSET_X + col * CELL_WIDTH,
      y: GRID_OFFSET_Y + row * CELL_HEIGHT
    };
  }, []);

  // Hitung Dimensi Kertas / Canvas
  const canvasDimensions = useMemo(() => {
    if (paperSize === 'responsive') {
      // Hitung batas terluar node
      let maxCol = 6;
      let maxRow = 5;
      nodes.forEach(n => {
        if (n.col > maxCol) maxCol = n.col;
        if (n.row > maxRow) maxRow = n.row;
      });
      return {
        width: Math.max(2200, (maxCol + 3) * CELL_WIDTH),
        height: Math.max(1600, (maxRow + 3) * CELL_HEIGHT)
      };
    }
    return PAPER_DIMENSIONS[paperSize];
  }, [paperSize, nodes]);

  // --------------------------------------------------------------------------
  // LOGIKA ZERO-COLLISION MATRIX SOLVER (BEBAS TUMPANG TINDIH)
  // --------------------------------------------------------------------------
  const resolveCollision = (targetRow: number, targetCol: number, excludeNodeId?: string): number => {
    let resolvedCol = targetCol;
    const occupiedCols = nodes
      .filter(n => n.id !== excludeNodeId && n.row === targetRow)
      .map(n => n.col);

    while (occupiedCols.includes(resolvedCol)) {
      resolvedCol += 1; // Geser ke kolom kanan berikutnya yang kosong
    }
    return resolvedCol;
  };

  // --------------------------------------------------------------------------
  // PENOMORAN HIRARKIS BERANTAI OTOMATIS (DOT-NOTATION RE-CALCULATOR)
  // --------------------------------------------------------------------------
  const recalculateDotNotations = useCallback((currentNodes: GridNode[]): GridNode[] => {
    // Cari akar (nodes tanpa parent)
    const roots = currentNodes.filter(n => !n.parentId);
    const updatedMap = new Map<string, GridNode>();

    // Helper rekursif
    const assignNumber = (node: GridNode, prefix: string) => {
      const updatedNode = { ...node, dotNotation: prefix };
      updatedMap.set(node.id, updatedNode);

      // Cari anak-anaknya dan urutkan berdasarkan kolom dari kiri ke kanan
      const children = currentNodes
        .filter(n => n.parentId === node.id)
        .sort((a, b) => a.col - b.col);

      children.forEach((child, index) => {
        assignNumber(child, `${prefix}.${index + 1}`);
      });
    };

    roots.sort((a, b) => a.col - b.col).forEach((root, idx) => {
      assignNumber(root, `${idx + 1}`);
    });

    // Masukkan node yang tersisa (jika ada orphan)
    return currentNodes.map(n => updatedMap.get(n.id) || n);
  }, []);

  // --------------------------------------------------------------------------
  // DRAG & SNAP TO GRID INTERACTION
  // --------------------------------------------------------------------------
  const handlePointerDownNode = (e: React.PointerEvent, node: GridNode) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    const pos = getPixelCoord(node.col, node.row);
    setDraggingNodeId(node.id);
    setSelectedNodeId(node.id);
    setDragOffset({
      x: e.clientX - (pos.x * zoom + pan.x),
      y: e.clientY - (pos.y * zoom + pan.y)
    });
    setActiveGhostPos({ x: pos.x, y: pos.y, row: node.row, col: node.col });
  };

  const handlePointerMoveCanvas = (e: React.PointerEvent) => {
    // 1. Dragging Node
    if (draggingNodeId) {
      // Hitung koordinat kanvas saat ini
      const canvasX = (e.clientX - dragOffset.x - pan.x) / zoom;
      const canvasY = (e.clientY - dragOffset.y - pan.y) / zoom;

      // Hitung Grid Kolom & Baris Terdekat (Snap to Grid)
      const approxCol = Math.round((canvasX - GRID_OFFSET_X) / CELL_WIDTH);
      const approxRow = Math.round((canvasY - GRID_OFFSET_Y) / CELL_HEIGHT);

      const targetCol = Math.max(0, approxCol);
      const targetRow = Math.max(0, approxRow);

      const snapped = getPixelCoord(targetCol, targetRow);

      setActiveGhostPos({
        x: snapped.x,
        y: snapped.y,
        row: targetRow,
        col: targetCol
      });
      return;
    }

    // 2. Panning Canvas
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handlePointerUpCanvas = (e: React.PointerEvent) => {
    if (draggingNodeId && activeGhostPos) {
      // Terapkan Zero-Collision Matrix Swap/Assign
      setNodes(prev => {
        const nextNodes = prev.map(n => {
          if (n.id === draggingNodeId) {
            // Hindari tabrakan jika sudah ditempati node lain
            const safeCol = resolveCollision(activeGhostPos.row, activeGhostPos.col, draggingNodeId);
            return {
              ...n,
              row: activeGhostPos.row,
              col: safeCol
            };
          }
          return n;
        });
        return recalculateDotNotations(nextNodes);
      });

      showNotification?.(`Node disematkan rapi ke Grid [Baris ${activeGhostPos.row + 1}, Kolom ${activeGhostPos.col + 1}]`);
      setDraggingNodeId(null);
      setActiveGhostPos(null);
      return;
    }

    setIsPanning(false);
  };

  // Start Panning on background
  const handlePointerDownCanvas = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.node-element')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  // Zoom Controls
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(prev => Math.min(2.5, Math.max(0.25, prev * factor)));
  };

  const handleResetZoom = () => {
    setZoom(0.85);
    setPan({ x: 80, y: 80 });
    showNotification?.('Posisi kanvas & zoom diatur ulang ke default.');
  };

  // --------------------------------------------------------------------------
  // INPUT BATCH CEPAT (MASSAL DIPISAH KOMA)
  // --------------------------------------------------------------------------
  const handleProcessBatchInput = () => {
    if (!batchInputText.trim()) return;

    const names = batchInputText
      .split(/[,;\n]/)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (names.length === 0) {
      showNotification?.('Silakan masukkan nama-nama dipisah tanda koma.');
      return;
    }

    // Tentukan baris induk dan generasi anak
    const parentNode = nodes.find(n => n.id === batchParentTargetId);
    const targetRow = parentNode ? parentNode.row + 1 : 0;

    setNodes(prev => {
      let currentCol = parentNode ? parentNode.col - Math.floor(names.length / 2) : 0;
      if (currentCol < 0) currentCol = 0;

      const newNodes: GridNode[] = names.map((name, idx) => {
        const id = `node_batch_${Date.now()}_${idx}`;
        const safeCol = resolveCollision(targetRow, currentCol + idx);

        return {
          id,
          name,
          dotNotation: '', // akan dihitung ulang
          row: targetRow,
          col: safeCol,
          parentId: parentNode ? parentNode.id : undefined,
          gender: idx % 2 === 0 ? 'L' : 'P',
          status: 'Hidup',
          role: targetRow === 0 ? 'Leluhur' : `Generasi ${targetRow + 1}`,
          color: ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'][idx % 6]
        };
      });

      const combined = [...prev, ...newNodes];
      return recalculateDotNotations(combined);
    });

    setBatchInputText('');
    showNotification?.(`⚡ Berhasil menambahkan ${names.length} anggota secara massal dengan penomoran berantai!`);
  };

  // --------------------------------------------------------------------------
  // SINKRONISASI DENGAN SINGLE SOURCE OF TRUTH (FAMILY TREE LELUHURQU)
  // --------------------------------------------------------------------------
  const handleImportFromFamilyTree = () => {
    if (!familyTree || !familyTree.nodes.length) {
      showNotification?.('Data silsilah LeluhurQu belum tersedia.');
      return;
    }

    // Ubah nodes OrbitQu ke GridNodes
    const genOrderMap: Record<number, number> = {
      [-4]: 0,
      [-3]: 1,
      [-2]: 2,
      [-1]: 3,
      [0]: 4,
      [1]: 5,
      [2]: 6,
      [3]: 7,
    };

    const imported: GridNode[] = [];
    const rowCounts: Record<number, number> = {};

    familyTree.nodes.forEach(n => {
      const row = genOrderMap[n.gen] ?? 3;
      rowCounts[row] = (rowCounts[row] ?? 0);
      const col = rowCounts[row];
      rowCounts[row] += 1;

      imported.push({
        id: n.id,
        name: n.name,
        dotNotation: n.order || '',
        row,
        col,
        parentId: n.parentId,
        gender: n.gender,
        status: n.status,
        birthYear: n.birthYear,
        role: n.role,
        spouseName: n.spouseName,
        color: n.isUser ? '#eab308' : n.gender === 'P' ? '#ec4899' : '#38bdf8'
      });
    });

    const numbered = recalculateDotNotations(imported);
    setNodes(numbered);
    showNotification?.(`📥 Berhasil mengimpor ${imported.length} anggota dari Silsilah LeluhurQu ke Grid Canvas Engine!`);
  };

  // --------------------------------------------------------------------------
  // CETAK DAN EKSPOR PDF PRESISI (WINDOW.PRINT & SVG DOWNLOAD)
  // --------------------------------------------------------------------------
  const handlePrintCanvas = () => {
    showNotification?.('Mempersiapkan lembar cetak presisi SVG... Silakan pilih simpan sebagai PDF di menu printer.');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const handleDownloadSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LeluhurQu_GridCanvas_${paperSize}_${new Date().toISOString().slice(0, 10)}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification?.('File SVG silsilah presisi berhasil diunduh!');
  };

  const handleDownloadStandalonePWA = () => {
    const a = document.createElement('a');
    a.href = './grid-canvas.html';
    a.download = 'LeluhurQu-GridCanvas-Offline.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showNotification?.('Mengunduh aplikasi PWA Offline Single-File HTML5 (LeluhurQu - Grid Canvas Engine)...');
  };

  // --------------------------------------------------------------------------
  // EDIT NODE HANDLERS
  // --------------------------------------------------------------------------
  const handleOpenEditNode = (node: GridNode) => {
    setEditingNode({ ...node });
    setShowEditModal(true);
  };

  const handleSaveEditNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNode) return;

    setNodes(prev => {
      const updated = prev.map(n => (n.id === editingNode.id ? editingNode : n));
      return recalculateDotNotations(updated);
    });
    setShowEditModal(false);
    showNotification?.(`Data ${editingNode.name} berhasil diperbarui di Grid Engine.`);
  };

  const handleDeleteNode = (id: string) => {
    if (window.confirm('Hapus node ini beserta garis hubungannya?')) {
      setNodes(prev => {
        const filtered = prev.filter(n => n.id !== id);
        return recalculateDotNotations(filtered);
      });
      setSelectedNodeId(null);
      showNotification?.('Node silsilah berhasil dihapus.');
    }
  };

  // --------------------------------------------------------------------------
  // RENDER SVG CONNECTOR LINES (SERI VS TREE BEZIER VS ORTHOGONAL)
  // --------------------------------------------------------------------------
  const renderConnectorLines = () => {
    const lines: React.ReactNode[] = [];

    nodes.forEach(child => {
      if (!child.parentId) return;
      const parent = nodes.find(n => n.id === child.parentId);
      if (!parent) return;

      const pPos = getPixelCoord(parent.col, parent.row);
      const cPos = getPixelCoord(child.col, child.row);

      // Hitung titik awal & akhir konektor (tengah bawah parent ke tengah atas child)
      const startX = pPos.x;
      const startY = pPos.y + (nodeShape === 'card' ? 45 : 35);
      const endX = cPos.x;
      const endY = cPos.y - (nodeShape === 'card' ? 45 : 35);

      let pathD = '';

      if (lineType === 'straight') {
        // Garis Seri / Linear Straight direct lines
        pathD = `M ${startX} ${startY} L ${endX} ${endY}`;
      } else if (lineType === 'bezier') {
        // Garis Paralel / Tree (Smooth Cubic Bezier curve)
        const midY = (startY + endY) / 2;
        pathD = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
      } else {
        // Orthogonal (Step-Corner Tree line)
        const midY = (startY + endY) / 2;
        pathD = `M ${startX} ${startY} L ${startX} ${midY} L ${endX} ${midY} L ${endX} ${endY}`;
      }

      const strokeColor = child.color || (isLight ? '#059669' : '#10b981');

      lines.push(
        <g key={`line_${parent.id}_${child.id}`}>
          {/* Garis pendar latar (glow effect) */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="6"
            strokeOpacity="0.25"
            strokeLinecap="round"
          />
          {/* Garis konektor utama */}
          <path
            d={pathD}
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeOpacity="0.9"
            strokeLinecap="round"
            strokeDasharray={child.status === 'Almarhum' ? '4,4' : undefined}
          />
          {/* Titik sambung node */}
          <circle cx={startX} cy={startY} r="3" fill={strokeColor} />
          <circle cx={endX} cy={endY} r="3" fill={strokeColor} />
        </g>
      );
    });

    return lines;
  };

  // --------------------------------------------------------------------------
  // RENDER SVG NODE ITEM (CIRCLE, HEXAGON, CARD)
  // --------------------------------------------------------------------------
  const renderNodeElement = (node: GridNode) => {
    const pos = getPixelCoord(node.col, node.row);
    const isSelected = selectedNodeId === node.id;
    const isDragging = draggingNodeId === node.id;
    const nodeColor = node.color || '#10b981';

    return (
      <g
        key={node.id}
        transform={`translate(${pos.x}, ${pos.y})`}
        className="node-element cursor-grab active:cursor-grabbing select-none"
        onPointerDown={e => handlePointerDownNode(e, node)}
        onClick={e => {
          e.stopPropagation();
          setSelectedNodeId(node.id);
        }}
        opacity={isDragging ? 0.35 : 1}
      >
        {/* ========================================================= */}
        {/* OPSI 1: LINGKARAN (CIRCLE / ORBIT STYLE)                   */}
        {/* ========================================================= */}
        {nodeShape === 'circle' && (
          <g>
            {/* Outer Glow Ring */}
            <circle
              r="40"
              fill={isLight ? '#ffffff' : '#0f172a'}
              stroke={nodeColor}
              strokeWidth={isSelected ? '4' : '2.5'}
              filter="url(#shadow-filter)"
            />
            {/* Inner Accent Ring */}
            <circle
              r="34"
              fill={isLight ? '#f8fafc' : '#1e293b'}
              stroke={nodeColor}
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            {/* Dot-Notation Pill on Top */}
            <g transform="translate(0, -40)">
              <rect
                x="-28"
                y="-10"
                width="56"
                height="16"
                rx="8"
                fill={nodeColor}
              />
              <text
                textAnchor="middle"
                y="2"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {node.dotNotation}
              </text>
            </g>
            {/* Inisial Nama di Pusat */}
            <text
              textAnchor="middle"
              y="4"
              fill={isLight ? '#0f172a' : '#f8fafc'}
              fontSize="12"
              fontWeight="900"
            >
              {node.name
                .split(' ')
                .map(s => s[0])
                .slice(0, 2)
                .join('')}
            </text>
            {/* Label Nama di Bawah */}
            <text
              textAnchor="middle"
              y="54"
              fill={isLight ? '#1e293b' : '#e2e8f0'}
              fontSize="11"
              fontWeight="bold"
              className="drop-shadow-xs"
            >
              {node.name.length > 18 ? node.name.slice(0, 16) + '…' : node.name}
            </text>
            {/* Sub-label Gelar */}
            <text
              textAnchor="middle"
              y="68"
              fill={nodeColor}
              fontSize="9"
              fontWeight="600"
            >
              {node.role || `Baris ${node.row + 1}`}
            </text>
          </g>
        )}

        {/* ========================================================= */}
        {/* OPSI 2: SEGI ENAM (HEXAGON / MOLECULE STYLE)              */}
        {/* ========================================================= */}
        {nodeShape === 'hexagon' && (
          <g>
            {/* Hexagon Points: Radius 44 */}
            <polygon
              points="0,-44 38,-22 38,22 0,44 -38,22 -38,-22"
              fill={isLight ? '#ffffff' : '#0f172a'}
              stroke={nodeColor}
              strokeWidth={isSelected ? '4' : '2.5'}
              filter="url(#shadow-filter)"
            />
            <polygon
              points="0,-36 31,-18 31,18 0,36 -31,18 -31,-18"
              fill={isLight ? '#f1f5f9' : '#1e293b'}
              stroke={nodeColor}
              strokeWidth="1"
              strokeDasharray="3,2"
            />
            {/* Dot-Notation Badge */}
            <g transform="translate(0, -42)">
              <rect
                x="-26"
                y="-9"
                width="52"
                height="16"
                rx="8"
                fill={nodeColor}
              />
              <text
                textAnchor="middle"
                y="3"
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {node.dotNotation}
              </text>
            </g>
            <text
              textAnchor="middle"
              y="5"
              fill={isLight ? '#0f172a' : '#f8fafc'}
              fontSize="12"
              fontWeight="900"
            >
              {node.name
                .split(' ')
                .map(s => s[0])
                .slice(0, 2)
                .join('')}
            </text>
            <text
              textAnchor="middle"
              y="56"
              fill={isLight ? '#1e293b' : '#e2e8f0'}
              fontSize="11"
              fontWeight="bold"
            >
              {node.name.length > 18 ? node.name.slice(0, 16) + '…' : node.name}
            </text>
            <text
              textAnchor="middle"
              y="69"
              fill={nodeColor}
              fontSize="9"
              fontWeight="600"
            >
              {node.role || `Baris ${node.row + 1}`}
            </text>
          </g>
        )}

        {/* ========================================================= */}
        {/* OPSI 3: KOTAK ROUNDED (CARD STYLE)                        */}
        {/* ========================================================= */}
        {nodeShape === 'card' && (
          <g transform="translate(-75, -42)">
            {/* Card Body */}
            <rect
              width="150"
              height="84"
              rx="12"
              fill={isLight ? '#ffffff' : '#0f172a'}
              stroke={nodeColor}
              strokeWidth={isSelected ? '3' : '1.8'}
              filter="url(#shadow-filter)"
            />
            {/* Card Header Strip */}
            <path
              d="M 0 12 C 0 5.37 5.37 0 12 0 L 138 0 C 144.63 0 150 5.37 150 12 L 150 24 L 0 24 Z"
              fill={nodeColor}
            />
            {/* Dot Notation & Gen on Header */}
            <text
              x="10"
              y="16"
              fill="#ffffff"
              fontSize="10"
              fontWeight="bold"
              fontFamily="monospace"
            >
              {node.dotNotation}
            </text>
            <text
              x="140"
              y="16"
              textAnchor="end"
              fill="#ffffff"
              fontSize="9"
              fontWeight="semibold"
            >
              R{node.row + 1}:C{node.col + 1}
            </text>

            {/* Nama Anggota */}
            <text
              x="10"
              y="44"
              fill={isLight ? '#0f172a' : '#f8fafc'}
              fontSize="11"
              fontWeight="bold"
            >
              {node.name.length > 20 ? node.name.slice(0, 18) + '…' : node.name}
            </text>

            {/* Role & Status */}
            <text
              x="10"
              y="58"
              fill={nodeColor}
              fontSize="9"
              fontWeight="semibold"
            >
              {node.role || 'Anggota'}
            </text>

            {/* Spouse or Birth Year */}
            <text
              x="10"
              y="72"
              fill={isLight ? '#64748b' : '#94a3b8'}
              fontSize="8.5"
            >
              {node.spouseName ? `💍 ${node.spouseName}` : node.birthYear ? `Th. ${node.birthYear}` : node.status || 'Hidup'}
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className={`w-full h-full relative flex flex-col ${isLight ? 'bg-slate-100 text-slate-800' : 'bg-[#080d1a] text-slate-100'} overflow-hidden select-none font-sans`}>
      {/* ------------------------------------------------------------- */}
      {/* HEADER BAR LELUHURQU - GRID CANVAS ENGINE                    */}
      {/* ------------------------------------------------------------- */}
      <header className={`z-30 ${isLight ? 'bg-white/95 border-b border-slate-200 text-slate-800 shadow-xs' : 'bg-slate-900/95 border-b border-slate-800 text-slate-100'} backdrop-blur px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-md gap-2 shrink-0 print:hidden`}>
        <div className="flex items-center gap-2 shrink-0">
          {onBackToLeluhurQu && (
            <button
              onClick={onBackToLeluhurQu}
              className={`p-1.5 -ml-1 ${isLight ? 'text-slate-500 hover:text-emerald-700 hover:bg-slate-100' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'} rounded-xl transition active:scale-95`}
              title="Kembali ke Tab Silsilah Utama"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 flex items-center justify-center font-bold text-white shadow-md shrink-0">
            <Grid className="w-4 h-4" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className={`font-black text-sm leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Leluhur<span className="text-teal-500">Qu</span>
              </h1>
              <span className={`text-[9px] ${isLight ? 'bg-teal-100 text-teal-800 border-teal-300' : 'bg-teal-950/80 text-teal-300 border-teal-500/30'} border px-1.5 py-0.5 rounded font-mono font-semibold`}>
                Grid Canvas Engine
              </span>
            </div>
            <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} leading-tight mt-0.5`}>
              Spatial Matrix • Zero Collision • SVG A0–A4 Presisi
            </p>
          </div>
        </div>

        {/* TOP RIGHT TOOLBAR: PRINT, EXPORT SVG, OFFLINE PWA, THEME */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Download Standalone PWA Button */}
          <button
            onClick={handleDownloadStandalonePWA}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition border cursor-pointer active:scale-95 ${
              isLight
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300 shadow-xs'
                : 'bg-emerald-950/70 hover:bg-emerald-900/90 text-emerald-300 border-emerald-700/80'
            }`}
            title="Unduh PWA Single-File HTML5 (Jalankan 100% Offline Tanpa Build Tool)"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline">💾 Unduh PWA Offline (.html)</span>
            <span className="md:hidden">💾 PWA</span>
          </button>

          {/* Cetak / Print PDF Presisi */}
          <button
            onClick={handlePrintCanvas}
            className="bg-teal-600 hover:bg-teal-500 active:scale-95 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Cetak Presisi / Simpan ke PDF sesuai Ukuran Kertas Terpilih"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">🖨️ Cetak / PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>

          {/* Unduh SVG File */}
          <button
            onClick={handleDownloadSVG}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer active:scale-95 ${
              isLight
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
            }`}
            title="Unduh file vektor SVG murni"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span className="hidden lg:inline">Unduh SVG</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-xl text-xs font-semibold transition border cursor-pointer active:scale-95 ${
              isLight
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
            }`}
            title={`Beralih ke mode ${isLight ? 'Gelap' : 'Terang'}`}
          >
            {isLight ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Moon className="w-3.5 h-3.5 text-amber-300" />}
          </button>

          {/* Toggle Sidebar Button */}
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1 ${
              isSidebarOpen
                ? 'bg-teal-500 text-white border-teal-600'
                : isLight
                ? 'bg-white text-slate-700 border-slate-200'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="Tampilkan / Sembunyikan Panel Pengaturan"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Panel</span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* WORKSPACE AREA (CANVAS SVG + FLOATING / COLLAPSIBLE SIDEBAR)  */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 w-full h-full relative overflow-hidden flex">
        {/* INTERACTIVE SVG CANVAS VIEWPORT */}
        <div
          className="flex-1 w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing"
          onPointerDown={handlePointerDownCanvas}
          onPointerMove={handlePointerMoveCanvas}
          onPointerUp={handlePointerUpCanvas}
          onWheel={handleWheel}
        >
          {/* THE SVG CANVAS */}
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            className="w-full h-full block"
            style={{
              backgroundColor: isLight ? '#f8fafc' : '#080d1a'
            }}
          >
            {/* DEFINISI FILTER, SHADOW, & GRID PATTERN */}
            <defs>
              <filter id="shadow-filter" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.2" />
              </filter>
              <pattern
                id="matrix-grid-pattern"
                width={CELL_WIDTH}
                height={CELL_HEIGHT}
                patternUnits="userSpaceOnUse"
              >
                <rect
                  width={CELL_WIDTH}
                  height={CELL_HEIGHT}
                  fill="none"
                  stroke={isLight ? '#cbd5e1' : '#1e293b'}
                  strokeWidth="0.8"
                  strokeDasharray="4,4"
                  strokeOpacity="0.5"
                />
                <circle
                  cx={CELL_WIDTH / 2}
                  cy={CELL_HEIGHT / 2}
                  r="1.5"
                  fill={isLight ? '#94a3b8' : '#334155'}
                />
              </pattern>
            </defs>

            {/* TRANSFORM GROUP (ZOOM & PAN) */}
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {/* PRINT BOUNDING BOX OVERLAY (IF A0-A4 SELECTED) */}
              {paperSize !== 'responsive' && (
                <g>
                  <rect
                    x="20"
                    y="20"
                    width={canvasDimensions.width}
                    height={canvasDimensions.height}
                    fill={isLight ? '#ffffff' : '#090e1f'}
                    stroke={isLight ? '#059669' : '#10b981'}
                    strokeWidth="3"
                    strokeDasharray="8,6"
                    rx="8"
                  />
                  {/* Watermark Ukuran Kertas */}
                  <text
                    x="50"
                    y="70"
                    fill={isLight ? '#94a3b8' : '#334155'}
                    fontSize="22"
                    fontWeight="black"
                    fontFamily="monospace"
                  >
                    LEMBAR CETAK PRESISI {PAPER_DIMENSIONS[paperSize].name.toUpperCase()}
                  </text>
                </g>
              )}

              {/* BACKGROUND MATRIX GRID */}
              {showGridMatrix && (
                <rect
                  x="0"
                  y="0"
                  width={canvasDimensions.width + 600}
                  height={canvasDimensions.height + 600}
                  fill="url(#matrix-grid-pattern)"
                />
              )}

              {/* BARIS GENERASI HEADERS / ROW LABELS */}
              {showGridMatrix &&
                [0, 1, 2, 3, 4, 5, 6].map(rowIdx => (
                  <g key={`row_label_${rowIdx}`} transform={`translate(20, ${GRID_OFFSET_Y + rowIdx * CELL_HEIGHT})`}>
                    <rect
                      x="0"
                      y="-12"
                      width="80"
                      height="24"
                      rx="6"
                      fill={isLight ? '#e2e8f0' : '#1e293b'}
                      opacity="0.8"
                    />
                    <text
                      x="40"
                      y="4"
                      textAnchor="middle"
                      fill={isLight ? '#475569' : '#94a3b8'}
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="monospace"
                    >
                      Gen {rowIdx + 1}
                    </text>
                  </g>
                ))}

              {/* CONNECTOR LINES (GARIS HUBUNGAN ORANG TUA ➔ ANAK) */}
              <g className="connector-lines-layer">{renderConnectorLines()}</g>

              {/* GHOST SNAP TARGET INDICATOR (WHEN DRAGGING) */}
              {activeGhostPos && (
                <g transform={`translate(${activeGhostPos.x}, ${activeGhostPos.y})`}>
                  <rect
                    x="-60"
                    y="-40"
                    width="120"
                    height="80"
                    rx="12"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    strokeDasharray="6,4"
                    className="animate-pulse"
                  />
                  <text
                    textAnchor="middle"
                    y="4"
                    fill="#10b981"
                    fontSize="10"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    Snap: R{activeGhostPos.row + 1}:C{activeGhostPos.col + 1}
                  </text>
                </g>
              )}

              {/* RENDER ALL GRID NODES */}
              <g className="nodes-layer">{nodes.map(n => renderNodeElement(n))}</g>
            </g>
          </svg>

          {/* FLOATING QUICK TOOLS (BOTTOM RIGHT): ZOOM IN, OUT, RESET, MATRIX TOGGLE */}
          <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 print:hidden shadow-xl">
            <div
              className={`flex flex-col rounded-2xl border p-1 backdrop-blur-md ${
                isLight
                  ? 'bg-white/95 border-slate-200 text-slate-800'
                  : 'bg-slate-900/95 border-slate-700 text-slate-200'
              }`}
            >
              <button
                onClick={() => setZoom(prev => Math.min(2.5, prev + 0.15))}
                className="p-2 hover:bg-teal-500 hover:text-white rounded-xl transition"
                title="Perbesar Kanvas (Zoom In)"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(prev => Math.max(0.25, prev - 0.15))}
                className="p-2 hover:bg-teal-500 hover:text-white rounded-xl transition"
                title="Perkecil Kanvas (Zoom Out)"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <div className={`h-px w-full my-0.5 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
              <button
                onClick={handleResetZoom}
                className="p-2 hover:bg-teal-500 hover:text-white rounded-xl transition"
                title="Pusatkan Ulang (Reset View)"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowGridMatrix(prev => !prev)}
                className={`p-2 rounded-xl transition ${
                  showGridMatrix ? 'text-teal-500 font-bold' : 'text-slate-400'
                }`}
                title="Tampilkan / Sembunyikan Grid Matriks Spatial"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* FLOATING STATUS PILL (BOTTOM LEFT) */}
          <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-2 print:hidden">
            <div
              className={`px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-lg text-xs font-semibold flex items-center gap-3 ${
                isLight
                  ? 'bg-white/90 border-slate-200 text-slate-700'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5 text-teal-500">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Zero-Collision Active
              </span>
              <span>•</span>
              <span>Total: <strong>{nodes.length}</strong> node</span>
              <span>•</span>
              <span>Bentuk: <strong className="capitalize">{nodeShape}</strong></span>
              <span>•</span>
              <span>Garis: <strong className="capitalize">{lineType}</strong></span>
              <span>•</span>
              <span>Zoom: {Math.round(zoom * 100)}%</span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* COLLAPSIBLE SIDEBAR CONTROLS                                  */}
        {/* ------------------------------------------------------------- */}
        {isSidebarOpen && (
          <aside
            className={`w-80 sm:w-88 h-full border-l flex flex-col z-20 shrink-0 backdrop-blur-md print:hidden ${
              isLight
                ? 'bg-white/95 border-slate-200 text-slate-800'
                : 'bg-slate-900/95 border-slate-800 text-slate-100'
            }`}
          >
            {/* Sidebar Tabs Header */}
            <div className={`p-2 border-b flex items-center gap-1 ${isLight ? 'border-slate-200 bg-slate-50' : 'border-slate-800 bg-slate-950/50'}`}>
              {[
                { id: 'batch', label: '⚡ Input Cepat', icon: Sparkles },
                { id: 'settings', label: '⚙️ Engine', icon: Sliders },
                { id: 'sync', label: '🔄 Silsilah', icon: GitBranch },
                { id: 'info', label: 'ℹ️ Panduan', icon: HelpCircle },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveSidebarTab(tab.id as any)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                    activeSidebarTab === tab.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : isLight
                      ? 'text-slate-600 hover:bg-slate-200'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Sidebar Body Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 no-scrollbar text-xs">
              {/* ======================================================= */}
              {/* TAB 1: INPUT MASSAL (FAST BATCH)                        */}
              {/* ======================================================= */}
              {activeSidebarTab === 'batch' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-teal-500">
                      <Sparkles className="w-4 h-4" />
                      Input Batch Cepat &amp; Penomoran
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Masukkan nama-nama anggota dipisah koma. Sistem akan menyusun posisi grid bebas benturan dan menghitung penomoran berantai otomatis (1, 1.1, 1.1.2).
                    </p>
                  </div>

                  {/* Target Parent Selector */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Induk / Orang Tua Keturunan
                    </label>
                    <select
                      value={batchParentTargetId}
                      onChange={e => setBatchParentTargetId(e.target.value)}
                      className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-teal-500 font-semibold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                      }`}
                    >
                      {nodes.map(n => (
                        <option key={n.id} value={n.id}>
                          [{n.dotNotation}] {n.name} (Baris {n.row + 1})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Textarea Nama Anggota */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Daftar Nama Anggota (Pisah Koma)
                    </label>
                    <textarea
                      rows={4}
                      value={batchInputText}
                      onChange={e => setBatchInputText(e.target.value)}
                      placeholder="Contoh: Anak Pertama, Anak Kedua, Anak Ketiga..."
                      className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-teal-500 text-xs font-mono ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                      }`}
                    />
                  </div>

                  <button
                    onClick={handleProcessBatchInput}
                    className="w-full bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-extrabold py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>⚡ Proses &amp; Generate Matriks</span>
                  </button>

                  {/* Quick Add Single Node */}
                  <div className={`p-3 rounded-2xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-800'}`}>
                    <span className="font-bold text-[11px] block">Aksi Cepat Node Terpilih:</span>
                    {selectedNodeId ? (
                      (() => {
                        const sel = nodes.find(n => n.id === selectedNodeId);
                        if (!sel) return null;
                        return (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-teal-500">[{sel.dotNotation}] {sel.name}</span>
                              <span className="text-slate-400 font-mono">R{sel.row + 1}:C{sel.col + 1}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleOpenEditNode(sel)}
                                className="flex-1 bg-teal-600 text-white py-1.5 rounded-lg font-bold flex items-center justify-center gap-1"
                              >
                                <Edit3 className="w-3 h-3" />
                                <span>Edit Data</span>
                              </button>
                              <button
                                onClick={() => handleDeleteNode(sel.id)}
                                className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
                                title="Hapus Node"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    ) : (
                      <p className="text-[10px] text-slate-400">
                        Klik salah satu node di kanvas untuk mengedit data, memindahkan posisi, atau menghapus.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* TAB 2: PENGATURAN BENTUK & KANVAS (ENGINE SETTINGS)     */}
              {/* ======================================================= */}
              {activeSidebarTab === 'settings' && (
                <div className="space-y-4">
                  {/* BENTUK NODE (SHAPE SWITCHER) */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                      1. Bentuk Objek Node
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'circle', label: 'Lingkaran', sub: 'Orbit Style', icon: Circle },
                        { id: 'hexagon', label: 'Segi Enam', sub: 'Molecule', icon: Hexagon },
                        { id: 'card', label: 'Kotak', sub: 'Card Style', icon: Square },
                      ].map(shape => {
                        const Icon = shape.icon;
                        const isActive = nodeShape === shape.id;
                        return (
                          <button
                            key={shape.id}
                            onClick={() => {
                              setNodeShape(shape.id as any);
                              showNotification?.(`Bentuk node diubah ke ${shape.label}`);
                            }}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 transition text-center ${
                              isActive
                                ? 'bg-teal-600 text-white border-teal-500 shadow-sm'
                                : isLight
                                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            <Icon className="w-5 h-5" />
                            <span className="font-bold text-[11px] leading-tight">{shape.label}</span>
                            <span className="text-[9px] opacity-75">{shape.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* ALUR GARIS HUBUNG (CONNECTOR TYPE) */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                      2. Jenis Alur Garis (Connector)
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'straight', label: 'Garis Seri', sub: 'Linear Direct' },
                        { id: 'bezier', label: 'Paralel / Tree', sub: 'Cubic Bezier' },
                        { id: 'orthogonal', label: 'Garis Siku', sub: 'Orthogonal' },
                      ].map(line => {
                        const isActive = lineType === line.id;
                        return (
                          <button
                            key={line.id}
                            onClick={() => {
                              setLineType(line.id as any);
                              showNotification?.(`Alur garis diubah ke ${line.label}`);
                            }}
                            className={`p-2 rounded-xl border text-center transition ${
                              isActive
                                ? 'bg-teal-600 text-white border-teal-500 shadow-sm font-bold'
                                : isLight
                                ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                            }`}
                          >
                            <span className="block font-bold text-[11px]">{line.label}</span>
                            <span className="text-[9px] opacity-75">{line.sub}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* UKURAN KERTAS CETAK (A0-A4 & RESPONSIVE) */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                      3. Ukuran Kanvas Cetak Presisi (A0–A4)
                    </label>
                    <select
                      value={paperSize}
                      onChange={e => {
                        const val = e.target.value as PaperSizeType;
                        setPaperSize(val);
                        showNotification?.(`Ukuran kanvas diubah ke ${PAPER_DIMENSIONS[val].name}`);
                      }}
                      className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-teal-500 font-semibold ${
                        isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                      }`}
                    >
                      {Object.entries(PAPER_DIMENSIONS).map(([key, item]) => (
                        <option key={key} value={key}>
                          {item.name} ({item.mm})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* TOGGLES: GRID MATRIX & AUTO-SNAP */}
                  <div className={`p-3 rounded-2xl border space-y-2.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/50 border-slate-800'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">Tampilkan Kisi Matrix</span>
                      <button
                        onClick={() => setShowGridMatrix(prev => !prev)}
                        className={`w-10 h-6 rounded-full transition p-1 flex items-center ${
                          showGridMatrix ? 'bg-teal-600 justify-end' : 'bg-slate-400 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px]">Auto Snap to Grid</span>
                      <button
                        onClick={() => setSnapToGrid(prev => !prev)}
                        className={`w-10 h-6 rounded-full transition p-1 flex items-center ${
                          snapToGrid ? 'bg-teal-600 justify-end' : 'bg-slate-400 justify-start'
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full bg-white shadow-xs" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* TAB 3: SINKRONISASI DATA SILSILAH LELUHURQU             */}
              {/* ======================================================= */}
              {activeSidebarTab === 'sync' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-extrabold text-sm flex items-center gap-1.5 text-teal-500">
                      <GitBranch className="w-4 h-4" />
                      Sinkronisasi dengan LeluhurQu
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Hubungkan data silsilah keluarga dari modul OrbitQu &amp; Silsilah langsung ke Grid Engine untuk pengaturan posisi spasial dan cetak poster A0.
                    </p>
                  </div>

                  <button
                    onClick={handleImportFromFamilyTree}
                    className="w-full bg-teal-600 hover:bg-teal-500 active:scale-95 text-white font-bold py-2.5 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>📥 Impor dari Silsilah LeluhurQu</span>
                  </button>

                  <div className={`p-3 rounded-2xl border text-[11px] space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-800/50 border-slate-800 text-slate-300'}`}>
                    <span className="font-bold text-teal-500 block">Single Source of Truth:</span>
                    <p>
                      Setiap node memiliki koordinat baris (Row/Generasi) dan kolom (Column) independen. Anda bebas menggeser node tanpa takut menabrak node lain.
                    </p>
                  </div>
                </div>
              )}

              {/* ======================================================= */}
              {/* TAB 4: PANDUAN & SPESIFIKASI ENGINE                     */}
              {/* ======================================================= */}
              {activeSidebarTab === 'info' && (
                <div className="space-y-3.5 text-[11px]">
                  <h3 className="font-extrabold text-sm text-teal-500">
                    📐 Spesifikasi Matrix Engine
                  </h3>
                  <div className="space-y-2 text-slate-400">
                    <p>
                      <strong>1. Zero-Collision (Bebas Nabrak):</strong> Sistem membatasi tiap posisi sel matriks sehingga dua node tidak pernah saling tumpang tindih.
                    </p>
                    <p>
                      <strong>2. Drag &amp; Snap:</strong> Seret node ke manapun di kanvas, node akan otomatis mengunci (snap) ke koordinat kisi grid terdekat.
                    </p>
                    <p>
                      <strong>3. Penomoran Berantai:</strong> Menggunakan notasi titik standar internasional (1, 1.1, 1.2, 1.2.1, dst.) yang diperbarui secara otomatis.
                    </p>
                    <p>
                      <strong>4. Standar Cetak A0–A4:</strong> Dilengkapi skala presisi milimeter dan styling `@media print` untuk ekspor PDF siap cetak di percetakan.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT DATA NODE                                         */}
      {/* ------------------------------------------------------------- */}
      {showEditModal && editingNode && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <form
            onSubmit={handleSaveEditNode}
            className={`max-w-md w-full rounded-3xl p-5 shadow-2xl relative border space-y-3.5 ${
              isLight
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          >
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-md">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight">Edit Node Grid Matrix</h3>
                <p className="text-[10px] text-teal-500 font-semibold">
                  Posisi Grid: Baris {editingNode.row + 1}, Kolom {editingNode.col + 1}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Nama Anggota *
                </label>
                <input
                  type="text"
                  required
                  value={editingNode.name}
                  onChange={e => setEditingNode({ ...editingNode, name: e.target.value })}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-teal-500 font-semibold ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Nomor Rantai (Dot-Notation)
                  </label>
                  <input
                    type="text"
                    value={editingNode.dotNotation}
                    onChange={e => setEditingNode({ ...editingNode, dotNotation: e.target.value })}
                    className={`w-full p-2 rounded-xl border focus:outline-none focus:border-teal-500 font-mono font-bold ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Gelar / Peran
                  </label>
                  <input
                    type="text"
                    value={editingNode.role || ''}
                    onChange={e => setEditingNode({ ...editingNode, role: e.target.value })}
                    className={`w-full p-2 rounded-xl border focus:outline-none focus:border-teal-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Nama Pasangan
                </label>
                <input
                  type="text"
                  value={editingNode.spouseName || ''}
                  onChange={e => setEditingNode({ ...editingNode, spouseName: e.target.value })}
                  placeholder="Ketik nama pasangan resmi..."
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-teal-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={editingNode.status || 'Hidup'}
                    onChange={e => setEditingNode({ ...editingNode, status: e.target.value as any })}
                    className={`w-full p-2 rounded-xl border focus:outline-none focus:border-teal-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  >
                    <option value="Hidup">Hidup</option>
                    <option value="Almarhum">Almarhum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Warna Node
                  </label>
                  <input
                    type="color"
                    value={editingNode.color || '#10b981'}
                    onChange={e => setEditingNode({ ...editingNode, color: e.target.value })}
                    className="w-full h-9 rounded-xl border cursor-pointer p-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
              >
                Simpan Perubahan
              </button>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className={`px-4 py-2.5 rounded-xl font-bold text-xs border ${
                  isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
