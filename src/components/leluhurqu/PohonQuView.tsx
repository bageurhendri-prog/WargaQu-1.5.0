import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  Compass,
  GitBranch,
  Users,
  Search,
  ArrowDownUp,
  Heart,
  ChevronDown,
  Sparkles,
  UserPlus,
  Edit3,
  Trash2,
  X,
  MapPin,
  Calendar,
  ExternalLink,
  Sun,
  Moon,
  Info,
  Layers,
  ArrowLeft
} from 'lucide-react';
import { OrbitNode, OrbitTreeData } from './OrbitQuView';

export interface PohonQuViewProps {
  familyTree: OrbitTreeData;
  onUpdateFamilyTree?: React.Dispatch<React.SetStateAction<OrbitTreeData>>;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onSwitchToOrbitQu?: () => void;
  onBackToLeluhurQu?: () => void;
  onOpenInSilsilah?: (name: string, id?: string) => void;
  showNotification?: (msg: string) => void;
}

// Generasi label mapping
const GEN_LABELS: Record<number, { title: string; subtitle: string; levelName: string; color: string }> = {
  [-4]: { title: 'Canggah / Wareng', subtitle: 'Leluhur Purba', levelName: 'Generasi 1 (Paling Atas)', color: '#ec4899' },
  [-3]: { title: 'Uyut / Buyut', subtitle: 'Pusat Akar Trah', levelName: 'Generasi 2 (Uyut)', color: '#f59e0b' },
  [-2]: { title: 'Kakek & Nenek', subtitle: 'Batang Induk', levelName: 'Generasi 3 (Kakek)', color: '#10b981' },
  [-1]: { title: 'Orang Tua (Ayah / Ibu)', subtitle: 'Dahan Utama', levelName: 'Generasi 4 (Orang Tua)', color: '#3b82f6' },
  [0]: { title: 'Generasi Saya & Saudara', subtitle: 'Ranting Utama', levelName: 'Generasi 5 (Saya & Saudara)', color: '#8b5cf6' },
  [1]: { title: 'Anak-Anak', subtitle: 'Tunas Daun', levelName: 'Generasi 6 (Anak)', color: '#06b6d4' },
  [2]: { title: 'Cucu', subtitle: 'Pucuk Daun', levelName: 'Generasi 7 (Cucu)', color: '#14b8a6' },
  [3]: { title: 'Cicit', subtitle: 'Bunga Keturunan', levelName: 'Generasi 8 (Cicit)', color: '#84cc16' },
};

export const PohonQuView: React.FC<PohonQuViewProps> = ({
  familyTree,
  onUpdateFamilyTree,
  theme,
  onToggleTheme,
  onSwitchToOrbitQu,
  onBackToLeluhurQu,
  onOpenInSilsilah,
  showNotification
}) => {
  const isLight = theme === 'light';
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Pan and Zoom
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Filter & Search
  const [selectedQuadrant, setSelectedQuadrant] = useState<'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orientation, setOrientation] = useState<'down' | 'up'>('down'); // down = Ancestors at top; up = Root at bottom
  const [selectedNode, setSelectedNode] = useState<OrbitNode | null>(null);

  // Edit Modal State
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>('');
  const [editRole, setEditRole] = useState<string>('');
  const [editSpouse, setEditSpouse] = useState<string>('');
  const [editBirthYear, setEditBirthYear] = useState<string>('');
  const [editDeathYear, setEditDeathYear] = useState<string>('');
  const [editOrigin, setEditOrigin] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'Hidup' | 'Almarhum'>('Hidup');

  // Filter nodes based on quadrant and search
  const filteredNodes = useMemo(() => {
    let list = familyTree.nodes;
    if (selectedQuadrant !== 'ALL') {
      list = list.filter(n => n.quadrant === selectedQuadrant);
    }
    return list;
  }, [familyTree.nodes, selectedQuadrant]);

  // Group nodes by generation
  const generationGroups = useMemo(() => {
    const groups: { gen: number; nodes: OrbitNode[] }[] = [];
    const genSet = Array.from(new Set(filteredNodes.map(n => n.gen)));

    // Sort generations: if 'down', lowest gen first (-3, -2, -1, 0, 1...); if 'up', highest first
    genSet.sort((a, b) => (orientation === 'down' ? a - b : b - a));

    genSet.forEach(gen => {
      let nodesInGen = filteredNodes.filter(n => n.gen === gen);
      // Sort nodes: put siblings under common parents together
      nodesInGen.sort((a, b) => {
        if (a.parentId && b.parentId && a.parentId !== b.parentId) {
          return a.parentId.localeCompare(b.parentId);
        }
        return (a.order || '').localeCompare(b.order || '');
      });
      groups.push({ gen, nodes: nodesInGen });
    });

    return groups;
  }, [filteredNodes, orientation]);

  // Handle Pan Drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-tree-card')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch pan support
  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-tree-card')) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({ x: e.touches[0].clientX - pan.x, y: e.touches[0].clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    setPan({
      x: e.touches[0].clientX - dragStart.x,
      y: e.touches[0].clientY - dragStart.y
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    setZoom(prev => Math.min(2.5, Math.max(0.4, prev * zoomFactor)));
  };

  // Center on User node
  const handleCenterOnUser = () => {
    const userNode = familyTree.nodes.find(n => n.isUser || n.name.toLowerCase().includes('hendri'));
    if (userNode) {
      setSelectedNode(userNode);
      setPan({ x: 0, y: 0 });
      setZoom(1);
      showNotification?.(`Pohon dipusatkan ke ${userNode.name} 🌟`);
    } else {
      setPan({ x: 0, y: 0 });
      setZoom(1);
      showNotification?.('Posisi pohon diatur ulang ke tengah.');
    }
  };

  const handleOpenEdit = (node: OrbitNode) => {
    setSelectedNode(node);
    setEditName(node.name);
    setEditRole(node.role || '');
    setEditSpouse(node.spouseName || '');
    setEditBirthYear(node.birthYear || '');
    setEditDeathYear(node.deathYear || '');
    setEditOrigin(node.origin || '');
    setEditStatus(node.status || 'Hidup');
    setShowEditModal(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || !onUpdateFamilyTree) return;

    onUpdateFamilyTree(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === selectedNode.id
          ? {
              ...n,
              name: editName,
              role: editRole,
              spouseName: editSpouse || undefined,
              birthYear: editBirthYear || undefined,
              deathYear: editDeathYear || undefined,
              origin: editOrigin || undefined,
              status: editStatus
            }
          : n
      )
    }));

    setShowEditModal(false);
    showNotification?.(`Data ${editName} berhasil diperbarui di PohonQu & OrbitQu!`);
  };

  // Quick Stats
  const stats = useMemo(() => {
    const total = familyTree.nodes.length;
    const hidup = familyTree.nodes.filter(n => n.status !== 'Almarhum').length;
    const almarhum = total - hidup;
    const pasangan = familyTree.nodes.filter(n => !!n.spouseName).length;
    return { total, hidup, almarhum, pasangan };
  }, [familyTree.nodes]);

  return (
    <div className={`w-full h-full relative flex flex-col ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#060913] text-slate-100'} overflow-hidden select-none font-sans`}>
      {/* ----------------------------------------------------------------- */}
      {/* HEADER / NAVIGATION BAR                                           */}
      {/* ----------------------------------------------------------------- */}
      <header className={`z-20 ${isLight ? 'bg-white/95 border-b border-slate-200 text-slate-800 shadow-xs' : 'bg-slate-900/95 border-b border-slate-800 text-slate-100'} backdrop-blur px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-md gap-2 shrink-0`}>
        <div className="flex items-center gap-2 shrink-0">
          {onBackToLeluhurQu && (
            <button
              onClick={onBackToLeluhurQu}
              className={`p-1.5 -ml-1 ${isLight ? 'text-slate-500 hover:text-emerald-700 hover:bg-slate-100' : 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800'} rounded-lg transition active:scale-95`}
              title="Kembali ke Tab Silsilah"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center font-bold text-white shadow-md shrink-0">
            🌳
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className={`font-black text-sm leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Pohon<span className="text-emerald-500">Qu</span>
              </h1>
              <span className={`text-[9px] ${isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'} border px-1.5 py-0.5 rounded font-mono font-semibold`}>
                Bagan Silsilah
              </span>
            </div>
            <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} leading-tight mt-0.5`}>
              Bagan Pohon Hierarki &amp; Garis Keturunan
            </p>
          </div>
        </div>

        {/* TOP RIGHT: SWITCH TO ORBITQU, THEME TOGGLE, & CENTER */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* SWITCH MODUL BUTTON (ORBITQU vs POHONQU) */}
          <div className={`flex items-center p-0.5 rounded-xl border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-800/90 border-slate-700'}`}>
            <button
              onClick={onSwitchToOrbitQu}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition ${
                isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
              title="Ganti ke Mode OrbitQu (Tata Surya Rasi Bintang)"
            >
              <Compass className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">🪐 OrbitQu</span>
              <span className="sm:hidden">🪐 Orbit</span>
            </button>

            <button
              className={`px-2.5 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-xs ${
                isLight ? 'bg-white text-emerald-700 border border-slate-200' : 'bg-emerald-600 text-white'
              }`}
              title="Sedang dalam Mode PohonQu (Bagan Pohon Silsilah)"
            >
              <span>🌳 PohonQu</span>
            </button>
          </div>

          {/* THEME TOGGLE */}
          <button
            onClick={onToggleTheme}
            className={`px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition border cursor-pointer active:scale-95 ${
              isLight
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
            }`}
            title={`Beralih ke mode ${isLight ? 'Gelap (Dark Space)' : 'Terang (Light Heritage)'}`}
          >
            {isLight ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Moon className="w-3.5 h-3.5 text-amber-300" />}
            <span className="text-[11px] font-bold hidden sm:inline">{isLight ? 'Terang' : 'Gelap'}</span>
          </button>
        </div>
      </header>

      {/* ----------------------------------------------------------------- */}
      {/* SUB-HEADER TOOLBAR (FILTER TRAH, SEARCH, ORIENTATION)            */}
      {/* ----------------------------------------------------------------- */}
      <div className={`z-10 ${isLight ? 'bg-slate-100/95 border-b border-slate-200 text-slate-700' : 'bg-slate-900/90 border-b border-slate-800/80 text-slate-300'} backdrop-blur px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0 shadow-xs no-scrollbar`}>
        {/* Trah Filter Pill */}
        <div className="flex items-center gap-1 shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 hidden md:inline">
            Trah:
          </span>
          {[
            { id: 'ALL', label: 'Semua Trah', color: '#10b981' },
            { id: 'Q1', label: 'Q1 (Ayah User)', color: '#38bdf8' },
            { id: 'Q2', label: 'Q2 (Ibu User)', color: '#34d399' },
            { id: 'Q3', label: 'Q3 (Ayah Istri)', color: '#fb7185' },
            { id: 'Q4', label: 'Q4 (Ibu Istri)', color: '#c084fc' },
          ].map(t => {
            const isActive = selectedQuadrant === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedQuadrant(t.id as any)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition border ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                    : isLight
                    ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Right Tools: Orientation & Search */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Orientation Toggle: Down (Ancestors on top) vs Up (Roots at bottom) */}
          <button
            onClick={() => {
              const next = orientation === 'down' ? 'up' : 'down';
              setOrientation(next);
              showNotification?.(
                next === 'down'
                  ? '⬇️ Mode Silsilah: Leluhur / Uyut di Atas ➔ Keturunan di Bawah'
                  : '⬆️ Mode Pohon Alami: Akar di Bawah ➔ Tunas menjulang ke Atas'
              );
            }}
            className={`px-2 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition border ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="Ubah Arah Orientasi Pohon (Atas ke Bawah / Bawah ke Atas)"
          >
            <ArrowDownUp className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-[10px] hidden sm:inline">
              {orientation === 'down' ? 'Arah: Leluhur di Atas' : 'Arah: Akar di Bawah'}
            </span>
          </button>

          {/* Quick Search */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cari anggota keluarga..."
              className={`w-32 sm:w-44 text-xs pl-7 pr-2 py-1 rounded-lg border focus:outline-none transition ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-800 focus:border-emerald-500'
                  : 'bg-slate-800 border-slate-700 text-slate-100 focus:border-emerald-500'
              }`}
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-1.5 top-1.5 p-0.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* CANVAS / INTERACTIVE TREE WORKSPACE                               */}
      {/* ----------------------------------------------------------------- */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
        className={`flex-1 w-full h-full relative overflow-hidden cursor-grab active:cursor-grabbing ${
          isLight
            ? 'bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] bg-slate-50'
            : 'bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] bg-[#060913]'
        }`}
      >
        {/* Transforming Tree Content Container */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: '50% 50%',
            transition: isDragging ? 'none' : 'transform 0.08s ease-out',
          }}
          className="absolute inset-0 flex flex-col items-center justify-center min-w-max p-20"
        >
          {/* RENDER TIERS / GENERATIONS */}
          <div className="flex flex-col items-center gap-12 sm:gap-16 py-12">
            {generationGroups.map(({ gen, nodes }) => {
              const meta = GEN_LABELS[gen] || {
                title: `Generasi ${gen}`,
                subtitle: 'Garis Keturunan',
                levelName: `Gen ${gen}`,
                color: '#10b981'
              };

              return (
                <div key={gen} className="flex flex-col items-center w-full relative">
                  {/* Generation Tier Badge Header */}
                  <div className="flex items-center gap-2 mb-4 z-10">
                    <div
                      style={{ backgroundColor: meta.color }}
                      className="w-2.5 h-2.5 rounded-full shadow-xs"
                    />
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md shadow-xs flex items-center gap-2 ${
                        isLight
                          ? 'bg-white/90 border-slate-300 text-slate-800'
                          : 'bg-slate-900/90 border-slate-700 text-slate-200'
                      }`}
                    >
                      <span className="font-extrabold tracking-wide uppercase text-[10px]" style={{ color: meta.color }}>
                        {meta.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ({nodes.length} orang)
                      </span>
                    </div>
                  </div>

                  {/* Nodes Row for this Generation */}
                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 max-w-7xl px-4">
                    {nodes.map(node => {
                      const isMatch =
                        searchQuery &&
                        (node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (node.spouseName && node.spouseName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (node.role && node.role.toLowerCase().includes(searchQuery.toLowerCase())));

                      const isSelected = selectedNode?.id === node.id;
                      const quadrantMeta = familyTree.quadrants[node.quadrant];

                      return (
                        <div
                          key={node.id}
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedNode(node);
                          }}
                          className={`interactive-tree-card relative rounded-2xl transition-all duration-200 p-3.5 w-60 sm:w-64 border cursor-pointer select-none group ${
                            isSelected
                              ? 'ring-2 ring-emerald-500 shadow-xl scale-105'
                              : isMatch
                              ? 'ring-2 ring-amber-400 shadow-lg scale-105'
                              : 'hover:scale-[1.02] shadow-md'
                          } ${
                            isLight
                              ? 'bg-white border-slate-200 text-slate-800'
                              : 'bg-slate-900/95 border-slate-800 text-slate-100'
                          }`}
                          style={{
                            borderTop: `4px solid ${quadrantMeta?.color || meta.color}`
                          }}
                        >
                          {/* Trah & Role Badge */}
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded border"
                              style={{
                                color: quadrantMeta?.color || meta.color,
                                borderColor: `${quadrantMeta?.color || meta.color}44`,
                                backgroundColor: `${quadrantMeta?.color || meta.color}15`
                              }}
                            >
                              {node.quadrant} • {node.order || meta.title}
                            </span>

                            {node.isUser && (
                              <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                🌟 SAYA
                              </span>
                            )}

                            {!node.isUser && (
                              <span
                                className={`text-[9px] font-semibold px-1.5 py-0.2 rounded ${
                                  node.status === 'Almarhum'
                                    ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                                }`}
                              >
                                {node.status === 'Almarhum' ? 'Almarhum' : 'Hidup'}
                              </span>
                            )}
                          </div>

                          {/* Member Avatar and Main Details */}
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div
                              className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-sm text-white shrink-0 shadow-md ${
                                node.gender === 'P'
                                  ? 'bg-gradient-to-br from-rose-500 to-pink-600'
                                  : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                              }`}
                            >
                              {node.name
                                .split(' ')
                                .map(n => n[0])
                                .slice(0, 2)
                                .join('')}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3
                                className={`font-bold text-xs sm:text-sm truncate leading-tight ${
                                  isLight ? 'text-slate-900' : 'text-white'
                                }`}
                                title={node.name}
                              >
                                {node.name}
                              </h3>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {node.role || meta.title}
                              </p>
                              {(node.birthYear || node.origin) && (
                                <p className="text-[9px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                  {node.birthYear && <span>th. {node.birthYear}</span>}
                                  {node.birthYear && node.origin && <span>•</span>}
                                  {node.origin && <span className="truncate">{node.origin}</span>}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Spouse Card Section (If Any) */}
                          {node.spouseName && (
                            <div
                              className={`mt-2.5 pt-2 border-t flex items-center gap-2 ${
                                isLight ? 'border-slate-100' : 'border-slate-800/80'
                              }`}
                            >
                              <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-[10px] shrink-0">
                                💍
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[9px] text-slate-400 block leading-none">
                                  Pasangan:
                                </span>
                                <span
                                  className={`text-[11px] font-semibold truncate block ${
                                    isLight ? 'text-rose-700' : 'text-rose-300'
                                  }`}
                                >
                                  {node.spouseName}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Card Hover Action Bar */}
                          <div
                            className={`mt-2.5 pt-2 border-t flex items-center justify-between text-[10px] ${
                              isLight ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'
                            }`}
                          >
                            <button
                              onClick={e => {
                                e.stopPropagation();
                                handleOpenEdit(node);
                              }}
                              className="hover:text-emerald-500 flex items-center gap-1 transition"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Edit</span>
                            </button>

                            {onOpenInSilsilah && (
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  onOpenInSilsilah(node.name, node.id);
                                }}
                                className="hover:text-emerald-500 flex items-center gap-1 transition"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Silsilah</span>
                              </button>
                            )}

                            <button
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedNode(node);
                              }}
                              className="hover:text-emerald-500 font-semibold flex items-center gap-0.5"
                            >
                              <span>Detail ➔</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FLOATING CONTROLS: ZOOM & CENTER BUTTONS */}
        <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2 shadow-xl">
          <div
            className={`flex flex-col rounded-2xl border p-1 backdrop-blur-md ${
              isLight
                ? 'bg-white/95 border-slate-200 text-slate-800'
                : 'bg-slate-900/95 border-slate-700 text-slate-200'
            }`}
          >
            <button
              onClick={() => setZoom(prev => Math.min(2.5, prev + 0.15))}
              className="p-2 hover:bg-emerald-500 hover:text-white rounded-xl transition"
              title="Perbesar Bagan Pohon"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(0.4, prev - 0.15))}
              className="p-2 hover:bg-emerald-500 hover:text-white rounded-xl transition"
              title="Perkecil Bagan Pohon"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className={`h-px w-full my-0.5 ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
            <button
              onClick={handleCenterOnUser}
              className="p-2 hover:bg-emerald-500 hover:text-white rounded-xl transition"
              title="Pusatkan ke Saya / Reset Tampilan"
            >
              <Crosshair className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* FLOATING STATS PILL (BOTTOM LEFT) */}
        <div className="absolute bottom-6 left-6 z-20 hidden md:flex items-center gap-2">
          <div
            className={`px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-lg text-xs font-semibold flex items-center gap-3 ${
              isLight
                ? 'bg-white/90 border-slate-200 text-slate-700'
                : 'bg-slate-900/90 border-slate-800 text-slate-300'
            }`}
          >
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Total: <strong className={isLight ? 'text-slate-900' : 'text-white'}>{stats.total}</strong>
            </span>
            <span>•</span>
            <span className="text-emerald-500">Hidup: {stats.hidup}</span>
            <span>•</span>
            <span className="text-slate-400">Alm: {stats.almarhum}</span>
            <span>•</span>
            <span className="text-rose-400">Pasangan: {stats.pasangan}</span>
          </div>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: DETAIL ANGGOTA SILSILAH POHONQU                            */}
      {/* ----------------------------------------------------------------- */}
      {selectedNode && !showEditModal && (
        <div
          onClick={() => setSelectedNode(null)}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150"
        >
          <div
            onClick={e => e.stopPropagation()}
            className={`max-w-md w-full rounded-3xl p-5 shadow-2xl relative border ${
              isLight
                ? 'bg-white border-slate-200 text-slate-800'
                : 'bg-slate-900 border-slate-700 text-slate-100'
            }`}
          >
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg text-white shadow-lg ${
                  selectedNode.gender === 'P'
                    ? 'bg-gradient-to-br from-rose-500 to-pink-600'
                    : 'bg-gradient-to-br from-blue-500 to-indigo-600'
                }`}
              >
                {selectedNode.name
                  .split(' ')
                  .map(n => n[0])
                  .slice(0, 2)
                  .join('')}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="font-extrabold text-base leading-tight">
                    {selectedNode.name}
                  </h2>
                  {selectedNode.isUser && (
                    <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded">
                      SAYA
                    </span>
                  )}
                </div>
                <p className="text-xs text-emerald-500 font-semibold mt-0.5">
                  {selectedNode.role || selectedNode.order}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {familyTree.quadrants[selectedNode.quadrant]?.name || selectedNode.quadrant}
                </p>
              </div>
            </div>

            {/* Biodata List */}
            <div className={`space-y-2 rounded-2xl p-3 border text-xs mb-4 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-800/60 border-slate-700'}`}>
              <div className="flex justify-between">
                <span className="text-slate-400">Tingkat Generasi:</span>
                <span className="font-semibold">{GEN_LABELS[selectedNode.gen]?.title || `Gen ${selectedNode.gen}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Status Nasab:</span>
                <span className={`font-semibold ${selectedNode.status === 'Almarhum' ? 'text-slate-400' : 'text-emerald-500'}`}>
                  {selectedNode.status || 'Hidup'}
                </span>
              </div>
              {selectedNode.spouseName && (
                <div className="flex justify-between items-center text-rose-500">
                  <span className="text-slate-400 flex items-center gap-1">💍 Pasangan Resmi:</span>
                  <span className="font-bold">{selectedNode.spouseName}</span>
                </div>
              )}
              {selectedNode.birthYear && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Tahun Lahir / Wafat:</span>
                  <span className="font-semibold">{selectedNode.birthYear} {selectedNode.deathYear ? ` - ${selectedNode.deathYear}` : ''}</span>
                </div>
              )}
              {selectedNode.origin && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Kota Asal / Domisili:</span>
                  <span className="font-semibold">{selectedNode.origin}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleOpenEdit(selectedNode)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Data Anggota</span>
              </button>

              {onOpenInSilsilah && (
                <button
                  onClick={() => {
                    const node = selectedNode;
                    setSelectedNode(null);
                    onOpenInSilsilah(node.name, node.id);
                  }}
                  className={`px-3 py-2.5 rounded-xl font-bold text-xs border transition flex items-center gap-1.5 ${
                    isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Buka di Silsilah</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL: EDIT DATA ANGGOTA POHONQU                                  */}
      {/* ----------------------------------------------------------------- */}
      {showEditModal && selectedNode && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <form
            onSubmit={handleSaveEdit}
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
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm leading-tight">Edit Data Anggota PohonQu</h3>
                <p className="text-[10px] text-emerald-500 font-semibold">Tersinkronisasi otomatis ke OrbitQu &amp; Silsilah</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 font-semibold ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Gelar / Peran
                  </label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    placeholder="Contoh: Kakek Sulung"
                    className={`w-full p-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Status Nasab
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className={`w-full p-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  >
                    <option value="Hidup">Masih Hidup</option>
                    <option value="Almarhum">Almarhum / Wafat</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                  Nama Pasangan (Suami / Istri)
                </label>
                <input
                  type="text"
                  value={editSpouse}
                  onChange={e => setEditSpouse(e.target.value)}
                  placeholder="Ketik nama pasangan resmi..."
                  className={`w-full p-2.5 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                    isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Tahun Lahir
                  </label>
                  <input
                    type="text"
                    value={editBirthYear}
                    onChange={e => setEditBirthYear(e.target.value)}
                    placeholder="Contoh: 1965"
                    className={`w-full p-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                    Kota Asal / Domisili
                  </label>
                  <input
                    type="text"
                    value={editOrigin}
                    onChange={e => setEditOrigin(e.target.value)}
                    placeholder="Contoh: Kuningan"
                    className={`w-full p-2 rounded-xl border focus:outline-none focus:border-emerald-500 ${
                      isLight ? 'bg-slate-50 border-slate-300 text-slate-900' : 'bg-slate-800 border-slate-700 text-white'
                    }`}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
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
