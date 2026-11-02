import React, { useEffect, useRef, useState } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Crosshair,
  Zap,
  BookOpen,
  X,
  Edit3,
  Trash2,
  Users,
  ArrowLeft,
  Sparkles,
  UserPlus,
  GitBranch,
  ExternalLink,
  RotateCcw,
  RefreshCw
} from 'lucide-react';

export interface OrbitNode {
  id: string;
  name: string;
  gen: number; // -3: Uyut (Pusat), -2: Kakek (Orbit 1), -1: Ayah (Orbit 2), 0: User & Saudara (Orbit 3), 1: Anak (Orbit 4), 2: Cucu (Orbit 5), 3: Cicit (Orbit 6)
  order: string;
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  claimed: boolean;
  parentId?: string; // ID atau nama orang tua di orbit sebelumnya
  gender?: 'L' | 'P';
  role?: string;
  isUser?: boolean;
  relationType?: 'user' | 'kakak' | 'adik' | 'pasangan' | 'saudara' | 'leluhur' | 'keturunan';
  birthYear?: string;
  deathYear?: string;
  status?: 'Hidup' | 'Almarhum';
  origin?: string;
  notes?: string;
  _renderX?: number;
  _renderY?: number;
}

export interface OrbitQuadrant {
  name: string;
  color: string;
  center: { x: number; y: number };
}

export interface OrbitTreeData {
  quadrants: {
    Q1: OrbitQuadrant;
    Q2: OrbitQuadrant;
    Q3: OrbitQuadrant;
    Q4: OrbitQuadrant;
  };
  nodes: OrbitNode[];
}

export interface LedgerLog {
  id: string;
  time: string;
  action: string;
  text: string;
}

// ----------------------------------------------------------------------------
// DATA REAL SESUAI SPESIFIKASI PENGGUNA (BERSIH DARI MOCK DUMMY):
// 1 Uyut (Pusat) -> 3 Kakek (A, B, C di Orbit 1)
// Kakek B punya 10 anak (Ayah/Paman/Bibi 1-10 di Orbit 2)
// Ayah No. 2 punya 6 anak (User & Saudara 1-6 di Orbit 3, User adalah No. 3)
// User No. 3 punya 3 anak (Anak 1-3 di Orbit 4)
// Serta cabang Trah Ibu & Pasangan yang tertata rapi
// ----------------------------------------------------------------------------
const CLEAN_REAL_TREE_DATA: OrbitTreeData = {
  quadrants: {
    Q1: { name: "Trah Ayah User (Kiri-Atas)", color: "#3b82f6", center: { x: -580, y: -520 } },
    Q2: { name: "Trah Ibu User (Kanan-Atas)", color: "#10b981", center: { x: 580, y: -520 } },
    Q3: { name: "Trah Ayah Pasangan (Kiri-Bawah)", color: "#f43f5e", center: { x: -580, y: 520 } },
    Q4: { name: "Trah Ibu Pasangan (Kanan-Bawah)", color: "#a855f7", center: { x: 580, y: 520 } }
  },
  nodes: [
    // ==========================================
    // TRAH AYAH USER (Q1)
    // ==========================================
    // 0. Pusat Kuadran: 1 Uyut
    {
      id: "uyut_1",
      name: "Uyut Utama",
      gen: -3,
      order: "Pusat Kuadran",
      quadrant: "Q1",
      claimed: true,
      role: "Uyut Utama (Pusat)"
    },

    // 1. Orbit 1: 3 Anak Uyut / Kakek (A, B, C)
    {
      id: "kakek_a",
      name: "Kakek A",
      gen: -2,
      order: "Anak ke-1 dari Uyut",
      quadrant: "Q1",
      claimed: true,
      role: "Kakek (Anak ke-1)",
      parentId: "uyut_1"
    },
    {
      id: "kakek_b",
      name: "Kakek B",
      gen: -2,
      order: "Anak ke-2 dari Uyut",
      quadrant: "Q1",
      claimed: true,
      role: "Kakek Utama (Anak ke-2)",
      parentId: "uyut_1"
    },
    {
      id: "kakek_c",
      name: "Kakek C",
      gen: -2,
      order: "Anak ke-3 dari Uyut",
      quadrant: "Q1",
      claimed: true,
      role: "Kakek (Anak ke-3)",
      parentId: "uyut_1"
    },

    // 2. Orbit 2: 10 Anak dari Kakek B (Ayah, Paman, Bibi 1 - 10)
    { id: "ayah_1", name: "Uwa No. 1", gen: -1, order: "Anak ke-1", quadrant: "Q1", claimed: true, role: "Uwa Pertama", parentId: "kakek_b" },
    { id: "ayah_2", name: "Bapak (Ayah No. 2)", gen: -1, order: "Anak ke-2", quadrant: "Q1", claimed: true, role: "Ayah Kandung User", parentId: "kakek_b" },
    { id: "ayah_3", name: "Paman No. 3", gen: -1, order: "Anak ke-3", quadrant: "Q1", claimed: true, role: "Paman", parentId: "kakek_b" },
    { id: "ayah_4", name: "Bibi No. 4", gen: -1, order: "Anak ke-4", quadrant: "Q1", claimed: true, role: "Bibi", parentId: "kakek_b" },
    { id: "ayah_5", name: "Paman No. 5", gen: -1, order: "Anak ke-5", quadrant: "Q1", claimed: false, role: "Paman", parentId: "kakek_b" },
    { id: "ayah_6", name: "Bibi No. 6", gen: -1, order: "Anak ke-6", quadrant: "Q1", claimed: false, role: "Bibi", parentId: "kakek_b" },
    { id: "ayah_7", name: "Paman No. 7", gen: -1, order: "Anak ke-7", quadrant: "Q1", claimed: false, role: "Paman", parentId: "kakek_b" },
    { id: "ayah_8", name: "Bibi No. 8", gen: -1, order: "Anak ke-8", quadrant: "Q1", claimed: false, role: "Bibi", parentId: "kakek_b" },
    { id: "ayah_9", name: "Paman No. 9", gen: -1, order: "Anak ke-9", quadrant: "Q1", claimed: false, role: "Paman", parentId: "kakek_b" },
    { id: "ayah_10", name: "Bibi No. 10", gen: -1, order: "Anak ke-10", quadrant: "Q1", claimed: false, role: "Bibi Bungsu", parentId: "kakek_b" },

    // 3. Orbit 3: 6 Anak dari Ayah No. 2 (User & Saudara 1 - 6, User adalah No. 3)
    { id: "user_sib_1", name: "Kakak No. 1", gen: 0, order: "Anak ke-1", quadrant: "Q1", claimed: true, role: "Kakak Sulung", relationType: "kakak", parentId: "ayah_2" },
    { id: "user_sib_2", name: "Kakak No. 2", gen: 0, order: "Anak ke-2", quadrant: "Q1", claimed: true, role: "Kakak Kedua", relationType: "kakak", parentId: "ayah_2" },
    { id: "user_node", name: "Hendriana (User No. 3)", gen: 0, order: "Anak ke-3", quadrant: "Q1", claimed: true, role: "User (Poros Utama)", isUser: true, relationType: "user", parentId: "ayah_2" },
    { id: "user_sib_4", name: "Adik No. 4", gen: 0, order: "Anak ke-4", quadrant: "Q1", claimed: true, role: "Adik Pertama", relationType: "adik", parentId: "ayah_2" },
    { id: "user_sib_5", name: "Adik No. 5", gen: 0, order: "Anak ke-5", quadrant: "Q1", claimed: false, role: "Adik Kedua", relationType: "adik", parentId: "ayah_2" },
    { id: "user_sib_6", name: "Adik No. 6", gen: 0, order: "Anak ke-6", quadrant: "Q1", claimed: false, role: "Adik Bungsu", relationType: "adik", parentId: "ayah_2" },

    // 4. Orbit 4: 3 Anak dari User No. 3
    { id: "anak_1", name: "Anak No. 1 (Sulung)", gen: 1, order: "Anak ke-1", quadrant: "Q1", claimed: true, role: "Anak Pertama", parentId: "user_node" },
    { id: "anak_2", name: "Anak No. 2 (Tengah)", gen: 1, order: "Anak ke-2", quadrant: "Q1", claimed: true, role: "Anak Kedua", parentId: "user_node" },
    { id: "anak_3", name: "Anak No. 3 (Bungsu)", gen: 1, order: "Anak ke-3", quadrant: "Q1", claimed: true, role: "Anak Bungsu", parentId: "user_node" },

    // ==========================================
    // TRAH IBU USER (Q2)
    // ==========================================
    { id: "q2_uyut", name: "Uyut Maternal", gen: -3, order: "Pusat Kuadran", quadrant: "Q2", claimed: true, role: "Uyut Jalur Ibu" },
    { id: "q2_kakek", name: "Kakek Maternal", gen: -2, order: "Anak Uyut", quadrant: "Q2", claimed: true, role: "Kakek (Abah Ibu)", parentId: "q2_uyut" },
    { id: "q2_ibu", name: "Ibu Kandung User", gen: -1, order: "Anak Kakek", quadrant: "Q2", claimed: true, role: "Ibu Kandung", parentId: "q2_kakek" },
    { id: "q2_user", name: "Hendriana (Jalur Ibu)", gen: 0, order: "Anak Kandung", quadrant: "Q2", claimed: true, role: "User (Trah Ibu)", parentId: "q2_ibu" },

    // ==========================================
    // TRAH AYAH PASANGAN (Q3)
    // ==========================================
    { id: "q3_uyut", name: "Uyut Besan Ayah", gen: -3, order: "Pusat Kuadran", quadrant: "Q3", claimed: true, role: "Uyut Besan" },
    { id: "q3_kakek", name: "Kakek Mertua Ayah", gen: -2, order: "Anak Uyut", quadrant: "Q3", claimed: false, role: "Kakek Mertua", parentId: "q3_uyut" },
    { id: "q3_mertua", name: "Bapak Mertua", gen: -1, order: "Anak Kakek", quadrant: "Q3", claimed: true, role: "Ayah Pasangan", parentId: "q3_kakek" },
    { id: "q3_pasangan", name: "Siti Nurhaliza (Pasangan)", gen: 0, order: "Anak Pertama", quadrant: "Q3", claimed: true, role: "Istri / Pasangan", parentId: "q3_mertua" },

    // ==========================================
    // TRAH IBU PASANGAN (Q4)
    // ==========================================
    { id: "q4_uyut", name: "Uyut Besan Ibu", gen: -3, order: "Pusat Kuadran", quadrant: "Q4", claimed: true, role: "Uyut Besan" },
    { id: "q4_kakek", name: "Nenek Mertua", gen: -2, order: "Anak Uyut", quadrant: "Q4", claimed: false, role: "Nenek Mertua", parentId: "q4_uyut" },
    { id: "q4_ibu_mertua", name: "Ibu Mertua", gen: -1, order: "Anak Nenek", quadrant: "Q4", claimed: true, role: "Ibu Pasangan", parentId: "q4_kakek" },
    { id: "q4_pasangan", name: "Siti Nurhaliza (Trah Ibu)", gen: 0, order: "Anak", quadrant: "Q4", claimed: true, role: "Pasangan", parentId: "q4_ibu_mertua" }
  ]
};

const DEFAULT_LOGS: LedgerLog[] = [
  { id: "log-1", time: "System Init", action: "Arsitektur 6 Orbit", text: "Susunan Baru: Uyut (Pusat) -> Kakek (O1) -> Ayah (O2) -> User & Saudara (O3) -> Anak (O4) -> Cucu (O5) -> Cicit (O6)." },
  { id: "log-2", time: "08:30", action: "Garis Hierarki Orbit", text: "Garis terkoneksi presisi: Uyut -> Kakek B -> Ayah No. 2 -> User No. 3 -> Anak 1-3." }
];

interface OrbitQuViewProps {
  onBackToLeluhurQu?: () => void;
  onOpenInSilsilah?: (memberName: string, memberId?: string) => void;
  showNotification?: (msg: string) => void;
}

export const OrbitQuView: React.FC<OrbitQuViewProps> = ({
  onBackToLeluhurQu,
  onOpenInSilsilah,
  showNotification
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tree State (Persisted)
  const [familyTree, setFamilyTree] = useState<OrbitTreeData>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_orbitqu_tree_v4');
      return saved ? JSON.parse(saved) : CLEAN_REAL_TREE_DATA;
    } catch {
      return CLEAN_REAL_TREE_DATA;
    }
  });

  const [logs, setLogs] = useState<LedgerLog[]>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_orbitqu_logs_v4');
      return saved ? JSON.parse(saved) : DEFAULT_LOGS;
    } catch {
      return DEFAULT_LOGS;
    }
  });

  // Modals
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);

  // Selected Node
  const [selectedNode, setSelectedNode] = useState<OrbitNode | null>(null);

  // Add Child State
  const [childNamesInput, setChildNamesInput] = useState('');
  const [childRoleInput, setChildRoleInput] = useState('');

  // Parent Linking State for Selected Node
  const [parentSelectMode, setParentSelectMode] = useState<'existing' | 'custom'>('existing');
  const [customParentName, setCustomParentName] = useState('');

  // Form State for Batch Quick-Input
  const [batchQuadrant, setBatchQuadrant] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [batchUyut, setBatchUyut] = useState('');
  const [batchKakek, setBatchKakek] = useState('');
  const [batchAyah, setBatchAyah] = useState('');
  const [batchUserSaudara, setBatchUserSaudara] = useState('');
  const [batchAnak, setBatchAnak] = useState('');
  const [batchCucu, setBatchCucu] = useState('');
  const [batchCicit, setBatchCicit] = useState('');

  // Camera & Transform
  const cameraRef = useRef({ x: 0, y: 0, zoom: 0.65 });
  const [zoomLevelDisplay, setZoomLevelDisplay] = useState(65);

  // Touch / Drag State
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    hasMoved: false,
    initialPinchDist: 0
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_orbitqu_tree_v4', JSON.stringify(familyTree));
    } catch (e) {
      console.error(e);
    }
  }, [familyTree]);

  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_orbitqu_logs_v4', JSON.stringify(logs));
    } catch (e) {
      console.error(e);
    }
  }, [logs]);

  const addLog = (action: string, text: string) => {
    const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [
      { id: 'log_' + Date.now() + Math.random().toString(36).substring(2, 5), time: timeStr, action, text },
      ...prev
    ]);
  };

  // Reset or Clean Data
  const handleResetCleanData = () => {
    setFamilyTree(CLEAN_REAL_TREE_DATA);
    addLog('Reset Data', 'Mengembalikan struktur silsilah ke contoh nyata resmi (1 Uyut - 3 Kakek - 10 Ayah - 6 User/Saudara - 3 Anak).');
    showNotification?.('Data silsilah dikembalikan ke struktur nyata (bersih dari mock dummy)!');
    renderCanvas();
  };

  const handleClearAllData = () => {
    // Sisakan minimal 1 user agar tidak kosong total
    const emptyTree: OrbitTreeData = {
      quadrants: CLEAN_REAL_TREE_DATA.quadrants,
      nodes: [
        {
          id: "user_initial",
          name: "Hendriana (User)",
          gen: 0,
          order: "Anak ke-1",
          quadrant: "Q1",
          claimed: true,
          isUser: true,
          role: "User (Poros Utama)"
        }
      ]
    };
    setFamilyTree(emptyTree);
    addLog('Bersihkan Data', 'Menghapus seluruh data dummy, kanvas siap diisi sendiri dari awal.');
    showNotification?.('Data silsilah berhasil dibersihkan! Silakan input silsilah keluarga Anda.');
    renderCanvas();
  };

  // -------------------------------------------------------------
  // CALCULATE NODE POSITIONS (6 CONCENTRIC ORBIT LEVELS)
  // Pusat: Uyut (R=0)
  // Orbit 1: Kakek (R=80)
  // Orbit 2: Ayah (R=150)
  // Orbit 3: User dan Saudara (R=220)
  // Orbit 4: Anak (R=290)
  // Orbit 5: Cucu (R=360)
  // Orbit 6: Cicit (R=430)
  // -------------------------------------------------------------
  const calculatePositions = (tree: OrbitTreeData) => {
    const orbitRadii: { [gen: string]: number } = {
      "-3": 0,    // Pusat: Uyut / Aki
      "-2": 80,   // Orbit 1: Kakek / Abah
      "-1": 150,  // Orbit 2: Ayah / Paman / Bibi
      "0": 220,   // Orbit 3: User dan Saudara
      "1": 290,   // Orbit 4: Anak / Sepupu
      "2": 360,   // Orbit 5: Cucu
      "3": 430    // Orbit 6: Cicit (Terluar)
    };

    const groups: { [key: string]: OrbitNode[] } = {};
    tree.nodes.forEach(node => {
      const q = node.quadrant || 'Q1';
      const key = `${q}_${node.gen}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(node);
    });

    Object.keys(groups).forEach(key => {
      const list = groups[key];
      const [qKey, genStr] = key.split("_") as ['Q1' | 'Q2' | 'Q3' | 'Q4', string];
      const qCenter = tree.quadrants[qKey]?.center || { x: 0, y: 0 };
      const radius = orbitRadii[genStr] !== undefined ? orbitRadii[genStr] : 200;

      list.forEach((node, index) => {
        if (radius === 0) {
          node._renderX = qCenter.x;
          node._renderY = qCenter.y;
        } else {
          const angleStep = (Math.PI * 2) / list.length;
          const angleOffset = (parseInt(genStr, 10) + 3) * 0.25;
          const angle = index * angleStep + angleOffset;
          node._renderX = qCenter.x + radius * Math.cos(angle);
          node._renderY = qCenter.y + radius * Math.sin(angle);
        }
      });
    });
  };

  // Helper untuk menghubungkan ke parent spesifik berdasarkan `parentId` atau fallback terdekat
  const getParentNode = (child: OrbitNode, candidateParents: OrbitNode[]): OrbitNode | null => {
    if (!candidateParents || candidateParents.length === 0) return null;

    // 1. Jika ada parentId langsung cocok dengan ID
    if (child.parentId) {
      const directMatch = candidateParents.find(p => p.id === child.parentId);
      if (directMatch) return directMatch;

      // 2. Jika cocok dengan nama orang tua
      const nameMatch = candidateParents.find(p => p.name.toLowerCase() === child.parentId?.toLowerCase());
      if (nameMatch) return nameMatch;
    }

    // 3. Fallback: cari yang paling dekat sudutnya / jaraknya di orbit sebelumnya
    let nearest = candidateParents[0];
    let minDist = Infinity;
    for (const c of candidateParents) {
      if (c._renderX === undefined || c._renderY === undefined) continue;
      const dx = (child._renderX ?? 0) - c._renderX;
      const dy = (child._renderY ?? 0) - c._renderY;
      const dist = dx * dx + dy * dy;
      if (dist < minDist) {
        minDist = dist;
        nearest = c;
      }
    }
    return nearest;
  };

  // -------------------------------------------------------------
  // CANVAS RENDER FUNCTION
  // -------------------------------------------------------------
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const { x: camX, y: camY, zoom } = cameraRef.current;

    calculatePositions(familyTree);

    // Background Tata Surya Gelap
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0b0f19";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + camX, height / 2 + camY);
    ctx.scale(zoom, zoom);

    // Titik bintang kosmos
    ctx.fillStyle = "#1e293b22";
    for (let gx = -1400; gx <= 1400; gx += 160) {
      for (let gy = -1200; gy <= 1200; gy += 160) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // =========================================================
    // 1. CINCIN 6 ORBIT TIAP KUADRAN
    // =========================================================
    const orbitRingsConfig = [
      { r: 80, label: "Orbit 1: Kakek", colorAlpha: "30" },
      { r: 150, label: "Orbit 2: Ayah / Paman", colorAlpha: "28" },
      { r: 220, label: "Orbit 3: User & Saudara (Gen 0)", colorAlpha: "55", isPoros: true },
      { r: 290, label: "Orbit 4: Anak", colorAlpha: "25" },
      { r: 360, label: "Orbit 5: Cucu", colorAlpha: "22" },
      { r: 430, label: "Orbit 6: Cicit (Terluar)", colorAlpha: "45", isOuter: true }
    ];

    (Object.keys(familyTree.quadrants) as Array<keyof typeof familyTree.quadrants>).forEach(qKey => {
      const q = familyTree.quadrants[qKey];

      // Draw 6 concentric rings
      orbitRingsConfig.forEach(ring => {
        ctx.beginPath();
        ctx.arc(q.center.x, q.center.y, ring.r, 0, Math.PI * 2);

        if (ring.isPoros) {
          ctx.strokeStyle = "#38bdf866";
          ctx.lineWidth = 2;
          ctx.setLineDash([6, 4]);
        } else if (ring.isOuter) {
          ctx.strokeStyle = q.color + "55";
          ctx.lineWidth = 1.8;
          ctx.setLineDash([4, 4]);
        } else {
          ctx.strokeStyle = q.color + ring.colorAlpha;
          ctx.lineWidth = 1.2;
          ctx.setLineDash([5, 5]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = ring.isPoros ? "bold 9px sans-serif" : "9px sans-serif";
        ctx.fillStyle = ring.isPoros ? "#38bdf8" : q.color + "99";
        ctx.textAlign = "left";
        ctx.fillText(ring.label, q.center.x + ring.r + 5, q.center.y);
      });

      // Batas Terluar Kuadran
      ctx.beginPath();
      ctx.arc(q.center.x, q.center.y, 480, 0, Math.PI * 2);
      ctx.strokeStyle = q.color + "45";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Judul Kuadran
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = q.color;
      ctx.textAlign = "center";
      ctx.fillText(q.name, q.center.x, q.center.y - 495);
    });

    // =========================================================
    // 2. GARIS KONEKTOR HIERARKI: BERTAHAP SESUAI URUTAN ORBIT & PARENT_ID
    // Uyut (Pusat) -> Kakek (O1) -> Ayah (O2) -> User&Saudara (O3) -> Anak (O4) -> Cucu (O5) -> Cicit (O6)
    // =========================================================
    (Object.keys(familyTree.quadrants) as Array<keyof typeof familyTree.quadrants>).forEach(qKey => {
      const q = familyTree.quadrants[qKey];
      const qNodes = familyTree.nodes.filter(n => (n.quadrant || 'Q1') === qKey);

      const uyutList = qNodes.filter(n => n.gen === -3);
      const kakekList = qNodes.filter(n => n.gen === -2);
      const ayahList = qNodes.filter(n => n.gen === -1);
      const userSaudaraList = qNodes.filter(n => n.gen === 0);
      const anakList = qNodes.filter(n => n.gen === 1);
      const cucuList = qNodes.filter(n => n.gen === 2);
      const cicitList = qNodes.filter(n => n.gen === 3);

      const drawStepLine = (fromX: number, fromY: number, toX: number, toY: number, isClaimed: boolean) => {
        ctx.beginPath();
        ctx.moveTo(fromX, fromY);
        ctx.lineTo(toX, toY);
        ctx.strokeStyle = isClaimed ? `${q.color}aa` : `${q.color}40`;
        ctx.lineWidth = isClaimed ? 1.8 : 1.2;
        ctx.stroke();
      };

      // A. Pusat (Uyut) -> Orbit 1 (Kakek)
      kakekList.forEach(kakek => {
        if (kakek._renderX !== undefined && kakek._renderY !== undefined) {
          const parentUyut = getParentNode(kakek, uyutList) || uyutList[0];
          const startX = parentUyut?._renderX ?? q.center.x;
          const startY = parentUyut?._renderY ?? q.center.y;
          drawStepLine(startX, startY, kakek._renderX, kakek._renderY, kakek.claimed);
        }
      });

      // B. Orbit 1 (Kakek) -> Orbit 2 (Ayah/Paman)
      ayahList.forEach(ayah => {
        if (ayah._renderX !== undefined && ayah._renderY !== undefined) {
          const parentKakek = getParentNode(ayah, kakekList);
          if (parentKakek && parentKakek._renderX !== undefined && parentKakek._renderY !== undefined) {
            drawStepLine(parentKakek._renderX, parentKakek._renderY, ayah._renderX, ayah._renderY, ayah.claimed);
          }
        }
      });

      // C. Orbit 2 (Ayah) -> Orbit 3 (User dan Saudara)
      userSaudaraList.forEach(person => {
        if (person._renderX !== undefined && person._renderY !== undefined) {
          const parentAyah = getParentNode(person, ayahList);
          if (parentAyah && parentAyah._renderX !== undefined && parentAyah._renderY !== undefined) {
            drawStepLine(parentAyah._renderX, parentAyah._renderY, person._renderX, person._renderY, person.claimed);
          }
        }
      });

      // D. Orbit 3 (User & Saudara) -> Orbit 4 (Anak)
      anakList.forEach(anak => {
        if (anak._renderX !== undefined && anak._renderY !== undefined) {
          const parentUser = getParentNode(anak, userSaudaraList);
          if (parentUser && parentUser._renderX !== undefined && parentUser._renderY !== undefined) {
            drawStepLine(parentUser._renderX, parentUser._renderY, anak._renderX, anak._renderY, anak.claimed);
          }
        }
      });

      // E. Orbit 4 (Anak) -> Orbit 5 (Cucu)
      cucuList.forEach(cucu => {
        if (cucu._renderX !== undefined && cucu._renderY !== undefined) {
          const parentAnak = getParentNode(cucu, anakList);
          if (parentAnak && parentAnak._renderX !== undefined && parentAnak._renderY !== undefined) {
            drawStepLine(parentAnak._renderX, parentAnak._renderY, cucu._renderX, cucu._renderY, cucu.claimed);
          }
        }
      });

      // F. Orbit 5 (Cucu) -> Orbit 6 (Cicit)
      cicitList.forEach(cicit => {
        if (cicit._renderX !== undefined && cicit._renderY !== undefined) {
          const parentCucu = getParentNode(cicit, cucuList);
          if (parentCucu && parentCucu._renderX !== undefined && parentCucu._renderY !== undefined) {
            drawStepLine(parentCucu._renderX, parentCucu._renderY, cicit._renderX, cicit._renderY, cicit.claimed);
          }
        }
      });
    });

    // =========================================================
    // 3. JALUR PENGHUBUNG KOSMOS PADA ORBIT 3 (POROS USER & PASANGAN)
    // =========================================================
    const userNodes = familyTree.nodes.filter(n => n.gen === 0 && (n.isUser || n.name.includes("User")));
    if (userNodes.length > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf844";
      ctx.fill();
      ctx.strokeStyle = "#38bdf888";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.save();
      ctx.font = "bold 9px sans-serif";
      ctx.fillStyle = "#38bdf8";
      ctx.textAlign = "center";
      ctx.fillText("POROS KELUARGA (GEN 0)", 0, -16);
      ctx.restore();

      userNodes.forEach(un => {
        if (un._renderX !== undefined && un._renderY !== undefined) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(un._renderX, un._renderY);
          ctx.strokeStyle = "#38bdf850";
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    // =========================================================
    // 4. NODES ANGGOTA KELUARGA
    // =========================================================
    familyTree.nodes.forEach(node => {
      if (node._renderX === undefined || node._renderY === undefined) return;

      const isUyut = node.gen === -3;
      const isKakek = node.gen === -2;
      const isAyah = node.gen === -1;
      const isUserSaudara = node.gen === 0;
      const isUserEgo = node.isUser || node.name.includes("User");
      const isAnak = node.gen === 1;
      const isCucu = node.gen === 2;
      const isCicit = node.gen === 3;

      let radius = 18;
      if (isUyut) radius = 24;
      else if (isUserEgo) radius = 24;
      else if (isUserSaudara) radius = 19;
      else if (isKakek || isAyah) radius = 18;
      else if (isAnak) radius = 17;
      else if (isCucu) radius = 16;
      else if (isCicit) radius = 15;

      let nodeColor = "#334155";
      let borderColor = "#0f172a";

      if (isUyut) {
        nodeColor = "#eab308";
        borderColor = "#fef08a";
      } else if (isUserEgo) {
        nodeColor = "#0284c7";
        borderColor = "#38bdf8";
      } else if (isUserSaudara) {
        nodeColor = node.claimed ? "#0d9488" : "#334155";
        borderColor = node.claimed ? "#2dd4bf" : "#64748b";
      } else if (node.claimed) {
        nodeColor = "#10b981";
        borderColor = "#6ee7b7";
      }

      ctx.beginPath();
      ctx.arc(node._renderX, node._renderY, radius, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = isUyut || isUserEgo ? 3.5 : 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(node._renderX, node._renderY);

      let icon = "?";
      if (isUyut) icon = "👑";
      else if (isUserEgo) icon = "👤";
      else if (isUserSaudara) icon = node.relationType === 'kakak' ? "🔺" : (node.relationType === 'adik' ? "🔻" : "👥");
      else if (node.claimed) icon = "✓";

      ctx.font = isUyut || isUserEgo ? "bold 12px sans-serif" : "11px sans-serif";
      ctx.fillStyle = isUyut ? "#0f172a" : "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(icon, 0, 4);

      ctx.font = isUserEgo ? "bold 12px sans-serif" : "bold 11px sans-serif";
      ctx.fillStyle = isUserEgo ? "#38bdf8" : "#f8fafc";
      ctx.fillText(node.name, 0, 30);

      let orbitLabel = "";
      if (isUyut) orbitLabel = "Pusat (Uyut)";
      else if (isKakek) orbitLabel = "Orbit 1 (Kakek)";
      else if (isAyah) orbitLabel = "Orbit 2 (Ayah)";
      else if (isUserSaudara) orbitLabel = isUserEgo ? "Orbit 3: USER" : "Orbit 3: Saudara";
      else if (isAnak) orbitLabel = "Orbit 4 (Anak)";
      else if (isCucu) orbitLabel = "Orbit 5 (Cucu)";
      else if (isCicit) orbitLabel = "Orbit 6 (Cicit)";

      ctx.font = "9px sans-serif";
      ctx.fillStyle = isUserEgo ? "#93c5fd" : (isUserSaudara ? "#2dd4bf" : "#94a3b8");
      ctx.fillText(`${node.order} • ${orbitLabel}`, 0, 42);

      if (!node.claimed && !isUyut) {
        ctx.fillStyle = "#f59e0b";
        ctx.fillText("Belum Diklaim", 0, 53);
      }

      ctx.restore();
    });

    ctx.restore();
  };

  // -------------------------------------------------------------
  // RESIZE & REDRAW LISTENER
  // -------------------------------------------------------------
  const handleResize = () => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.parentElement) return;
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    renderCanvas();
  };

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [familyTree]);

  useEffect(() => {
    renderCanvas();
  }, [familyTree]);

  // -------------------------------------------------------------
  // MOUSE & TOUCH GESTURES
  // -------------------------------------------------------------
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    dragRef.current.isDragging = true;
    dragRef.current.hasMoved = false;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!dragRef.current.isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragRef.current.hasMoved = true;
    }
    cameraRef.current.x += dx;
    cameraRef.current.y += dy;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
    renderCanvas();
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    let newZoom = cameraRef.current.zoom;
    if (e.deltaY < 0) newZoom *= 1.1;
    else newZoom /= 1.1;
    newZoom = Math.min(Math.max(0.25, newZoom), 2.8);
    cameraRef.current.zoom = newZoom;
    setZoomLevelDisplay(Math.round(newZoom * 100));
    renderCanvas();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1) {
      dragRef.current.isDragging = true;
      dragRef.current.hasMoved = false;
      dragRef.current.startX = e.touches[0].clientX;
      dragRef.current.startY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      dragRef.current.isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      dragRef.current.initialPinchDist = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && dragRef.current.isDragging) {
      const dx = e.touches[0].clientX - dragRef.current.startX;
      const dy = e.touches[0].clientY - dragRef.current.startY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        dragRef.current.hasMoved = true;
      }
      cameraRef.current.x += dx;
      cameraRef.current.y += dy;
      dragRef.current.startX = e.touches[0].clientX;
      dragRef.current.startY = e.touches[0].clientY;
      renderCanvas();
    } else if (e.touches.length === 2 && dragRef.current.initialPinchDist > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const currentDist = Math.sqrt(dx * dx + dy * dy);
      const ratio = currentDist / dragRef.current.initialPinchDist;

      let newZoom = cameraRef.current.zoom * (ratio > 1 ? 1.03 : 0.97);
      newZoom = Math.min(Math.max(0.25, newZoom), 2.8);
      cameraRef.current.zoom = newZoom;
      setZoomLevelDisplay(Math.round(newZoom * 100));
      dragRef.current.initialPinchDist = currentDist;
      renderCanvas();
    }
  };

  const handleTouchEnd = () => {
    dragRef.current.isDragging = false;
    dragRef.current.initialPinchDist = 0;
  };

  // Node Click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragRef.current.hasMoved) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const { x: camX, y: camY, zoom } = cameraRef.current;
    const worldX = (clickX - canvas.width / 2 - camX) / zoom;
    const worldY = (clickY - canvas.height / 2 - camY) / zoom;

    for (const node of familyTree.nodes) {
      if (node._renderX !== undefined && node._renderY !== undefined) {
        const dx = worldX - node._renderX;
        const dy = worldY - node._renderY;
        const radius = node.gen === -3 || node.isUser ? 25 : 20;
        if (Math.sqrt(dx * dx + dy * dy) <= radius + 6) {
          setSelectedNode(node);
          setCustomParentName(node.parentId || '');
          setParentSelectMode('existing');
          setShowEditModal(true);
          return;
        }
      }
    }
  };

  // -------------------------------------------------------------
  // CONTROLS & NAVIGATION HELPERS
  // -------------------------------------------------------------
  const handleZoomIn = () => {
    const next = Math.min(cameraRef.current.zoom * 1.25, 2.8);
    cameraRef.current.zoom = next;
    setZoomLevelDisplay(Math.round(next * 100));
    renderCanvas();
  };

  const handleZoomOut = () => {
    const next = Math.max(cameraRef.current.zoom / 1.25, 0.25);
    cameraRef.current.zoom = next;
    setZoomLevelDisplay(Math.round(next * 100));
    renderCanvas();
  };

  const handleGpsCenter = () => {
    const userNode = familyTree.nodes.find(n => n.gen === 0 && (n.isUser || n.name.includes("User")));
    if (userNode && userNode._renderX !== undefined && userNode._renderY !== undefined) {
      cameraRef.current.x = -userNode._renderX;
      cameraRef.current.y = -userNode._renderY;
      cameraRef.current.zoom = 0.85;
      setZoomLevelDisplay(85);
      renderCanvas();
      showNotification?.(`🎯 GPS Center fokus ke ${userNode.name} di Orbit 3!`);
    } else {
      cameraRef.current.x = 0;
      cameraRef.current.y = 0;
      cameraRef.current.zoom = 0.65;
      setZoomLevelDisplay(65);
      renderCanvas();
      showNotification?.('🎯 Kamera kembali ke Pusat Orbit Silsilah');
    }
  };

  // -------------------------------------------------------------
  // TAMBAH ANAK / KETURUNAN KE ORBIT BERIKUTNYA
  // -------------------------------------------------------------
  const handleOpenAddChildModal = () => {
    if (!selectedNode) return;
    setChildNamesInput('');
    setChildRoleInput('');
    setShowAddChildModal(true);
  };

  const handleSaveAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode || !childNamesInput.trim()) return;

    const targetGen = Math.min(selectedNode.gen + 1, 3);
    const names = childNamesInput.split(',').map(n => n.trim()).filter(Boolean);
    const newChildren: OrbitNode[] = [];

    // Cari berapa anak yang sudah ada untuk orang tua ini
    const existingChildren = familyTree.nodes.filter(n => n.parentId === selectedNode.id);

    names.forEach((name, i) => {
      const orderNum = existingChildren.length + i + 1;
      let defaultRole = "Keturunan";
      if (targetGen === -2) defaultRole = "Kakek (Anak Uyut)";
      else if (targetGen === -1) defaultRole = "Ayah / Paman / Bibi";
      else if (targetGen === 0) defaultRole = "Saudara Kandung / Tiri";
      else if (targetGen === 1) defaultRole = "Anak";
      else if (targetGen === 2) defaultRole = "Cucu";
      else if (targetGen === 3) defaultRole = "Cicit";

      newChildren.push({
        id: 'node_' + Date.now() + '_' + i,
        name,
        gen: targetGen,
        order: `Anak ke-${orderNum}`,
        quadrant: selectedNode.quadrant,
        claimed: false,
        role: childRoleInput.trim() || defaultRole,
        parentId: selectedNode.id
      });
    });

    setFamilyTree(prev => ({
      ...prev,
      nodes: [...prev.nodes, ...newChildren]
    }));

    addLog('Tambah Keturunan', `Menambahkan ${names.length} anak/keturunan ke Orbit ${targetGen + 3} di bawah ${selectedNode.name}`);
    setShowAddChildModal(false);
    showNotification?.(`Berhasil menambahkan ${names.length} anak ke bawah ${selectedNode.name}!`);
    renderCanvas();
  };

  // -------------------------------------------------------------
  // SAVE / EDIT / CLAIM & RAPIKAN GARIS INDUK (PARENT)
  // -------------------------------------------------------------
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;

    const finalParentId = parentSelectMode === 'custom'
      ? (customParentName.trim() || undefined)
      : (selectedNode.parentId || undefined);

    setFamilyTree(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === selectedNode.id
          ? {
              ...n,
              name: selectedNode.name,
              order: selectedNode.order,
              claimed: selectedNode.claimed,
              role: selectedNode.role,
              parentId: finalParentId
            }
          : n
      )
    }));

    addLog('Klaim & Rapikan Garis', `Profil ${selectedNode.name} diperbarui [Induk Garis: ${finalParentId || 'Otomatis'}]`);
    setShowEditModal(false);
    setSelectedNode(null);
    showNotification?.('Perubahan profil & garis induk berhasil dirapikan!');
    renderCanvas();
  };

  const handleDeleteNode = () => {
    if (!selectedNode) return;

    if (selectedNode.isUser) {
      showNotification?.('Node User utama tidak dapat dihapus!');
      return;
    }

    setFamilyTree(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== selectedNode.id)
    }));

    addLog('Hapus Anggota', `${selectedNode.name} dihapus dari orbit silsilah`);
    setShowEditModal(false);
    setSelectedNode(null);
    showNotification?.('Anggota berhasil dihapus dari orbit.');
    renderCanvas();
  };

  // Direct Integration to Silsilah Tab
  const handleJumpToSilsilah = () => {
    if (!selectedNode) return;
    const name = selectedNode.name;
    const id = selectedNode.id;
    setShowEditModal(false);
    setSelectedNode(null);
    if (onOpenInSilsilah) {
      onOpenInSilsilah(name, id);
    }
  };

  // -------------------------------------------------------------
  // BATCH QUICK-INPUT (6 ORBIT BERTINGKAT)
  // -------------------------------------------------------------
  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newNodes: OrbitNode[] = [...familyTree.nodes];

    const processBatch = (inputString: string, genLevel: number, defaultRole: string, isUserSaudara = false) => {
      if (!inputString.trim()) return;
      const names = inputString.split(',').map(n => n.trim()).filter(Boolean);
      names.forEach((name, i) => {
        const isUser = isUserSaudara && (name.toLowerCase().includes('user') || name.toLowerCase().includes('saya') || i === 0);
        newNodes.push({
          id: 'node_' + Math.random().toString(36).substring(2, 9) + '_' + i,
          name,
          gen: genLevel,
          order: `${i + 1} dari ${names.length}`,
          quadrant: batchQuadrant,
          claimed: isUser ? true : false,
          role: isUser ? 'User / Poros Utama' : defaultRole,
          isUser,
          relationType: isUserSaudara ? (isUser ? 'user' : (i < 2 ? 'kakak' : 'adik')) : undefined
        });
      });
    };

    processBatch(batchUyut, -3, 'Uyut / Aki (Pusat Kuadran)');
    processBatch(batchKakek, -2, 'Kakek / Abah (Orbit 1)');
    processBatch(batchAyah, -1, 'Ayah / Paman (Orbit 2)');
    processBatch(batchUserSaudara, 0, 'Saudara Kandung / Tiri (Orbit 3)', true);
    processBatch(batchAnak, 1, 'Anak (Orbit 4)');
    processBatch(batchCucu, 2, 'Cucu (Orbit 5)');
    processBatch(batchCicit, 3, 'Cicit (Orbit 6 Terluar)');

    addLog('Batch Quick-Input', `Memasukkan silsilah massal ke kuadran ${batchQuadrant} sesuai susunan 6 orbit bertingkat.`);

    setFamilyTree(prev => ({
      ...prev,
      nodes: newNodes
    }));

    setBatchUyut('');
    setBatchKakek('');
    setBatchAyah('');
    setBatchUserSaudara('');
    setBatchAnak('');
    setBatchCucu('');
    setBatchCicit('');
    setShowBatchModal(false);

    showNotification?.('🚀 Silsilah 6 orbit berhasil digenerate!');
    renderCanvas();
  };

  // Opsi Calon Orang Tua (Orbit N-1) untuk Modal Rapikan Garis
  const candidateParents = selectedNode
    ? familyTree.nodes.filter(n => n.quadrant === selectedNode.quadrant && n.gen === selectedNode.gen - 1)
    : [];

  return (
    <div className="w-full h-full relative flex flex-col bg-[#0b0f19] text-slate-100 overflow-hidden font-sans select-none">
      {/* ------------------------------------------------------------- */}
      {/* HEADER / TOP BAR                                              */}
      {/* ------------------------------------------------------------- */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-3.5 py-2.5 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2">
          {onBackToLeluhurQu && (
            <button
              onClick={onBackToLeluhurQu}
              className="p-1 -ml-1 text-slate-400 hover:text-emerald-400 rounded-lg transition active:scale-95"
              title="Kembali ke Tab Silsilah"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md">
            LQ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-xs sm:text-sm leading-none text-white">Leluhur<span className="text-emerald-400">Qu</span></h1>
              <span className="text-[9px] bg-emerald-950 text-emerald-400 border border-emerald-400/40 px-1 py-0.2 rounded font-mono font-bold">
                6 Orbit
              </span>
            </div>
            <p className="text-[9px] text-slate-400 truncate max-w-[150px] sm:max-w-none">
              Uyut Pusat $\rightarrow$ Kakek (O1) $\rightarrow$ Ayah (O2) $\rightarrow$ User/Saudara (O3) $\rightarrow$ Anak (O4) $\rightarrow$ Cucu (O5) $\rightarrow$ Cicit (O6)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowBatchModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Input Cepat</span>
            <span>(Batch)</span>
          </button>

          <button
            onClick={handleResetCleanData}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 px-2 py-1.5 rounded-lg transition active:scale-95 flex items-center gap-1"
            title="Reset Contoh Nyata (1 Uyut - 3 Kakek - 10 Ayah - 6 User - 3 Anak)"
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Reset Nyata</span>
          </button>

          <button
            onClick={handleClearAllData}
            className="bg-rose-950/40 hover:bg-rose-900 text-rose-300 text-[11px] border border-rose-800/40 px-2 py-1.5 rounded-lg transition active:scale-95 flex items-center gap-1"
            title="Bersihkan Semua Data Mock / Mulai Lembar Bersih"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Bersihkan Data</span>
          </button>

          <button
            onClick={() => setShowLedgerModal(true)}
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-[11px] border border-slate-700 px-2.5 py-1.5 rounded-lg transition text-slate-200 flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Buku Besar</span>
            <span className="sm:hidden">Ledger</span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* CANVAS / INTERACTIVE MAP AREA                                  */}
      {/* ------------------------------------------------------------- */}
      <main className="relative w-full h-full flex-1 touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleCanvasClick}
          onWheel={handleWheel}
          className="w-full h-full block cursor-grab active:cursor-grabbing"
        />

        {/* FLOATING NAVIGATION (ZOOM, GPS) */}
        <div className="absolute bottom-16 sm:bottom-6 right-3 sm:right-6 z-20 flex flex-col gap-2">
          <button
            onClick={handleZoomIn}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-800/90 border border-slate-700 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg hover:bg-slate-700 active:scale-95 transition text-white"
            title="Perbesar Orbit"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-800/90 border border-slate-700 rounded-xl flex items-center justify-center text-lg font-bold shadow-lg hover:bg-slate-700 active:scale-95 transition text-white"
            title="Perkecil Orbit"
          >
            -
          </button>
          <button
            onClick={handleGpsCenter}
            className="h-9 sm:h-10 px-2.5 sm:px-3 bg-emerald-600 border border-emerald-400/30 rounded-xl flex items-center justify-center text-[11px] font-bold shadow-lg hover:bg-emerald-500 active:scale-95 transition gap-1.5 text-slate-950"
            title="Fokus GPS ke User (Orbit 3)"
          >
            <Crosshair className="w-4 h-4" />
            <span>GPS Center (User)</span>
          </button>
        </div>

        {/* LEGEND KUADRAN: STRUKTUR 6 ORBIT TATA SURYA RESMI */}
        <div className="absolute bottom-16 sm:bottom-6 left-3 sm:left-6 z-20 bg-slate-900/90 backdrop-blur p-2.5 sm:p-3 rounded-xl border border-slate-800 text-xs flex flex-col gap-1.5 shadow-xl max-w-[290px] sm:max-w-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Struktur 6 Orbit Tata Surya:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{zoomLevelDisplay}%</span>
          </div>
          <div className="text-[10px] text-amber-300 bg-amber-950/40 p-1.5 rounded-lg border border-amber-500/30 font-medium">
            👑 <b>Pusat Kuadran:</b> Uyut / Aki (R=0)
          </div>
          <div className="text-[10px] text-slate-300 leading-relaxed">
            Orbit 1 (Kakek) $\rightarrow$ Orbit 2 (Ayah) $\rightarrow$ <b className="text-sky-300">Orbit 3 (User &amp; Saudara)</b> $\rightarrow$ Orbit 4 (Anak) $\rightarrow$ Orbit 5 (Cucu) $\rightarrow$ <b className="text-emerald-300">Orbit 6 (Cicit)</b>
          </div>
          <div className="text-[9px] text-slate-400 border-t border-slate-800 pt-1 flex items-center justify-between">
            <span>Klik node mana pun untuk klaim, rapikan garis, atau tambah anak!</span>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL EDIT / KLAIM / RAPIKAN GARIS / BUKA DI SILSILAH          */}
      {/* ------------------------------------------------------------- */}
      {showEditModal && selectedNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 text-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar">
            {/* Header Modal */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedNode.isUser ? 'bg-sky-600' : selectedNode.gen === 0 ? 'bg-teal-600' : selectedNode.gen === -3 ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-400 flex items-center gap-1.5">
                    {selectedNode.isUser
                      ? '👤 Profil User (Orbit 3)'
                      : selectedNode.gen === 0
                      ? '👥 Saudara (Orbit 3)'
                      : selectedNode.gen === -3
                      ? '👑 Pusat Kuadran (Uyut)'
                      : `👤 Profil Anggota (Orbit ${selectedNode.gen + 3})`}
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {selectedNode.id} • Kuadran {selectedNode.quadrant}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedNode(null);
                }}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action Buttons: Tambah Keturunan & Buka Silsilah */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenAddChildModal}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 font-bold py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Tambah Anak/Keturunan</span>
              </button>

              <button
                type="button"
                onClick={handleJumpToSilsilah}
                className="bg-sky-950/70 hover:bg-sky-900 border border-sky-400/50 text-sky-200 active:scale-95 font-bold py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
                title="Buka & Edit Lengkap di Tab Silsilah"
              >
                <ExternalLink className="w-4 h-4 text-sky-400" />
                <span>Buka di Silsilah</span>
              </button>
            </div>

            {/* Form Edit & Rapikan Garis */}
            <form onSubmit={handleSaveEdit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={selectedNode.name}
                  onChange={e => setSelectedNode({ ...selectedNode, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Keterangan / Urutan</label>
                  <input
                    type="text"
                    value={selectedNode.order}
                    onChange={e => setSelectedNode({ ...selectedNode, order: e.target.value })}
                    placeholder="Contoh: Anak ke-2"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Gelar / Peran</label>
                  <input
                    type="text"
                    value={selectedNode.role || ''}
                    onChange={e => setSelectedNode({ ...selectedNode, role: e.target.value })}
                    placeholder="Contoh: Kakek, Uwa, Anak"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* FITUR RAPIKAN GARIS / TENTUKAN ORANG TUA (INDUK ORBIT) */}
              {selectedNode.gen > -3 && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-sky-400 flex items-center gap-1.5 text-[11px]">
                      <GitBranch className="w-3.5 h-3.5" />
                      Rapikan Garis Induk Orang Tua (Orbit {selectedNode.gen + 2})
                    </label>
                    <div className="flex text-[10px] gap-1">
                      <button
                        type="button"
                        onClick={() => setParentSelectMode('existing')}
                        className={`px-2 py-0.5 rounded ${parentSelectMode === 'existing' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        Pilih Daftar
                      </button>
                      <button
                        type="button"
                        onClick={() => setParentSelectMode('custom')}
                        className={`px-2 py-0.5 rounded ${parentSelectMode === 'custom' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        Ketik Sendiri
                      </button>
                    </div>
                  </div>

                  {parentSelectMode === 'existing' ? (
                    <div>
                      <select
                        value={selectedNode.parentId || ''}
                        onChange={e => setSelectedNode({ ...selectedNode, parentId: e.target.value })}
                        className="w-full bg-slate-800 border border-sky-500/50 rounded-lg p-2 text-slate-100 focus:outline-none text-xs"
                      >
                        <option value="">-- Otomatis Sambung ke Induk Terdekat --</option>
                        {candidateParents.map(cp => (
                          <option key={cp.id} value={cp.id}>
                            {cp.name} ({cp.order || cp.role || 'Induk'})
                          </option>
                        ))}
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Pilih nama induk di Orbit {selectedNode.gen + 2} untuk mengarahkan garis konektor dengan presisi.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <input
                        type="text"
                        value={customParentName}
                        onChange={e => {
                          setCustomParentName(e.target.value);
                          setSelectedNode({ ...selectedNode, parentId: e.target.value });
                        }}
                        placeholder="Ketik nama ayah/induk (jika typo / belum ada)"
                        className="w-full bg-slate-800 border border-sky-500/50 rounded-lg p-2 text-slate-100 focus:outline-none text-xs"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        Jika nama typo atau belum terdaftar di silsilah, ketik nama untuk menentukan garis.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Status Klaim */}
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNode.claimed}
                    onChange={e => setSelectedNode({ ...selectedNode, claimed: e.target.checked })}
                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                  />
                  <span>Tandai Profil Sudah Diklaim / Terverifikasi</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 font-bold py-2.5 rounded-lg text-slate-950 transition active:scale-98 shadow"
                >
                  Simpan Perubahan
                </button>
                {!selectedNode.isUser && (
                  <button
                    type="button"
                    onClick={handleDeleteNode}
                    className="p-2.5 bg-rose-950/50 border border-rose-800 hover:bg-rose-900 text-rose-300 rounded-lg transition active:scale-95"
                    title="Hapus Dari Orbit"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL TAMBAH ANAK / KETURUNAN (KE ORBIT BERIKUTNYA)           */}
      {/* ------------------------------------------------------------- */}
      {showAddChildModal && selectedNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-400">
                    Tambah Anak / Keturunan
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Induk: <strong className="text-white">{selectedNode.name}</strong> (Orbit {selectedNode.gen + 3})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAddChildModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddChild} className="flex flex-col gap-3 text-xs">
              <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-500/30 text-[11px] text-emerald-200">
                Anak akan otomatis ditempatkan di <strong>Orbit {Math.min(selectedNode.gen + 1, 3) + 3}</strong> dengan garis konektor terhubung langsung ke <strong>{selectedNode.name}</strong>.
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nama Anak / Keturunan (Pisahkan dengan koma jika lebih dari 1)
                </label>
                <input
                  type="text"
                  required
                  value={childNamesInput}
                  onChange={e => setChildNamesInput(e.target.value)}
                  placeholder="Contoh: Anak 1, Anak 2, Anak 3"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">
                  Keterangan / Gelar (Opsional)
                </label>
                <input
                  type="text"
                  value={childRoleInput}
                  onChange={e => setChildRoleInput(e.target.value)}
                  placeholder="Contoh: Anak Kandung, Penerus Trah"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 rounded-lg transition active:scale-98"
                >
                  Simpan &amp; Hubungkan Garis
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddChildModal(false)}
                  className="px-3 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL BATCH QUICK INPUT                                        */}
      {/* ------------------------------------------------------------- */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 max-h-[92vh] overflow-y-auto no-scrollbar text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-emerald-400">
                  ⚡ Input Cepat Kerangka Silsilah (6 Orbit)
                </h3>
              </div>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBatchSubmit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">
                  Pilih Kuadran Trah Tujuan
                </label>
                <select
                  value={batchQuadrant}
                  onChange={e => setBatchQuadrant(e.target.value as any)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="Q1">Trah Ayah User (Kiri-Atas) • Biru</option>
                  <option value="Q2">Trah Ibu User (Kanan-Atas) • Hijau</option>
                  <option value="Q3">Trah Ayah Pasangan (Kiri-Bawah) • Merah</option>
                  <option value="Q4">Trah Ibu Pasangan (Kanan-Bawah) • Ungu</option>
                </select>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col gap-2.5">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  💡 <b>Urutan Orbit Dari Dalam ke Luar:</b> Pisahkan nama dengan koma (<code className="text-emerald-400">,</code>).
                </p>

                <div>
                  <label className="block text-amber-300 font-bold mb-1">
                    0. Pusat Kuadran: Uyut / Aki
                  </label>
                  <input
                    type="text"
                    value={batchUyut}
                    onChange={e => setBatchUyut(e.target.value)}
                    placeholder="Contoh: Uyut Utama"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    1. Orbit 1: Kakek / Abah (Contoh: A, B, C)
                  </label>
                  <input
                    type="text"
                    value={batchKakek}
                    onChange={e => setBatchKakek(e.target.value)}
                    placeholder="Contoh: Kakek A, Kakek B, Kakek C"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    2. Orbit 2: Ayah / Paman / Bibi (Contoh: No. 1 s/d 10)
                  </label>
                  <input
                    type="text"
                    value={batchAyah}
                    onChange={e => setBatchAyah(e.target.value)}
                    placeholder="Contoh: Ayah 1, Ayah 2, Paman 3, Bibi 4, dst."
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-2.5 bg-sky-950/40 rounded-lg border border-sky-500/30">
                  <label className="block text-sky-300 font-bold mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    3. Orbit 3: User dan Saudara (Contoh: No. 1 s/d 6)
                  </label>
                  <input
                    type="text"
                    value={batchUserSaudara}
                    onChange={e => setBatchUserSaudara(e.target.value)}
                    placeholder="Contoh: Kakak 1, Kakak 2, Hendriana (User), Adik 4, Adik 5, Adik 6"
                    className="w-full bg-slate-800 border border-sky-500/50 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    4. Orbit 4: Anak / Sepupu (Contoh: No. 1 s/d 3)
                  </label>
                  <input
                    type="text"
                    value={batchAnak}
                    onChange={e => setBatchAnak(e.target.value)}
                    placeholder="Contoh: Anak 1, Anak 2, Anak 3"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">
                    5. Orbit 5: Cucu
                  </label>
                  <input
                    type="text"
                    value={batchCucu}
                    onChange={e => setBatchCucu(e.target.value)}
                    placeholder="Contoh: Cucu 1, Cucu 2"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-emerald-400 font-bold mb-1">
                    6. Orbit 6 (Terluar): Cicit
                  </label>
                  <input
                    type="text"
                    value={batchCicit}
                    onChange={e => setBatchCicit(e.target.value)}
                    placeholder="Contoh: Cicit 1, Cicit 2"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="mt-1 w-full bg-emerald-600 hover:bg-emerald-500 font-bold py-2.5 rounded-lg text-slate-950 transition active:scale-98 shadow-md"
              >
                🚀 Generate ke Orbit Tata Surya
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL BUKU BESAR (AUTO-LEDGER ACTIVITY)                       */}
      {/* ------------------------------------------------------------- */}
      {showLedgerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-5 shadow-2xl flex flex-col gap-4 max-h-[82vh] text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-400">
                    Buku Besar (Auto-Ledger Activity)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Riwayat penataan silsilah 6 orbit &amp; garis hierarki
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLedgerModal(false)}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 text-xs text-slate-300">
              {logs.map(l => (
                <div
                  key={l.id}
                  className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/50 flex flex-col gap-0.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-mono text-[10px] font-bold">
                      {l.time} • [{l.action}]
                    </span>
                  </div>
                  <span className="text-slate-200">{l.text}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-500 font-mono text-[10px]">
                {logs.length} catatan aktivitas
              </span>
              <button
                onClick={() => setShowLedgerModal(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 font-semibold"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
