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
  Shield,
  Eye,
  EyeOff,
  Heart,
  CheckCircle2
} from 'lucide-react';

export interface OrbitNode {
  id: string;
  name: string;
  gen: number; // -3: Uyut (Pusat), -2: Kakek (Orbit 1), -1: Ayah (Orbit 2), 0: User & Saudara (Orbit 3), 1: Anak (Orbit 4), 2: Cucu (Orbit 5), 3: Cicit (Orbit 6)
  order: string;
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  claimed: boolean;
  parentId?: string; // ID induk di orbit sebelumnya
  hideLine?: boolean; // Admin bisa memutus/menghapus garis langsung
  gender?: 'L' | 'P';
  role?: string;
  isUser?: boolean;
  spouseName?: string; // Pasangan tampil berdampingan/nempel beda warna
  spouseGender?: 'L' | 'P';
  relationType?: 'user' | 'kakak' | 'adik' | 'pasangan' | 'saudara' | 'leluhur' | 'keturunan';
  birthYear?: string;
  deathYear?: string;
  status?: 'Hidup' | 'Almarhum';
  origin?: string;
  notes?: string;
  _renderX?: number;
  _renderY?: number;
  _spouseX?: number;
  _spouseY?: number;
  _angle?: number;
  _sectorStart?: number;
  _sectorEnd?: number;
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
// DATA REAL SESUAI SPESIFIKASI MUTLAK:
// 1 Uyut (Pusat) -> 3 Anak/Kakek (1-3 di Orbit 1)
// Kakek No. 2 punya 10 anak (Ayah/Paman/Bibi 1-10 di Orbit 2)
// Ayah No. 2 punya 6 anak (User & Saudara 1-6 di Orbit 3, User adalah No. 3)
// User No. 3 punya 3 anak (Anak 1-3 di Orbit 4)
// Pasangan User (Siti Nurhaliza) tampil nempel/berdampingan beda warna
// ----------------------------------------------------------------------------
const CLEAN_REAL_TREE_DATA: OrbitTreeData = {
  quadrants: {
    Q1: { name: "Trah Ayah User (Kiri-Atas)", color: "#3b82f6", center: { x: -620, y: -540 } },
    Q2: { name: "Trah Ibu User (Kanan-Atas)", color: "#10b981", center: { x: 620, y: -540 } },
    Q3: { name: "Trah Ayah Pasangan (Kiri-Bawah)", color: "#f43f5e", center: { x: -620, y: 540 } },
    Q4: { name: "Trah Ibu Pasangan (Kanan-Bawah)", color: "#a855f7", center: { x: 620, y: 540 } }
  },
  nodes: [
    // ==========================================
    // TRAH AYAH USER (Q1)
    // ==========================================
    // 0. Pusat Kuadran: 1 Uyut
    {
      id: "uyut_1",
      name: "Uyut Utama (Kyai Abdul Ghani)",
      gen: -3,
      order: "Pusat Kuadran (1)",
      quadrant: "Q1",
      claimed: true,
      role: "Uyut Utama (Pusat)"
    },

    // 1. Orbit 1: 3 Anak Uyut / Kakek (A, B, C)
    {
      id: "kakek_1",
      name: "Kakek 1 (A)",
      gen: -2,
      order: "Anak ke-1",
      quadrant: "Q1",
      claimed: true,
      role: "Kakek Sulung",
      parentId: "uyut_1"
    },
    {
      id: "kakek_2",
      name: "Kakek 2 (B - Poros)",
      gen: -2,
      order: "Anak ke-2",
      quadrant: "Q1",
      claimed: true,
      role: "Kakek Utama (Poros Ayah)",
      parentId: "uyut_1"
    },
    {
      id: "kakek_3",
      name: "Kakek 3 (C)",
      gen: -2,
      order: "Anak ke-3",
      quadrant: "Q1",
      claimed: true,
      role: "Kakek Bungsu",
      parentId: "uyut_1"
    },

    // 2. Orbit 2: 10 Anak dari Kakek No. 2 (Ayah, Paman, Bibi 1 - 10)
    { id: "ayah_1", name: "Uwa No. 1", gen: -1, order: "Anak ke-1", quadrant: "Q1", claimed: true, role: "Uwa Pertama", parentId: "kakek_2" },
    { id: "ayah_2", name: "Ayah No. 2 (Karta)", gen: -1, order: "Anak ke-2", quadrant: "Q1", claimed: true, role: "Ayah Kandung User", parentId: "kakek_2" },
    { id: "ayah_3", name: "Paman No. 3", gen: -1, order: "Anak ke-3", quadrant: "Q1", claimed: true, role: "Paman", parentId: "kakek_2" },
    { id: "ayah_4", name: "Bibi No. 4", gen: -1, order: "Anak ke-4", quadrant: "Q1", claimed: true, role: "Bibi", parentId: "kakek_2" },
    { id: "ayah_5", name: "Paman No. 5", gen: -1, order: "Anak ke-5", quadrant: "Q1", claimed: false, role: "Paman", parentId: "kakek_2" },
    { id: "ayah_6", name: "Bibi No. 6", gen: -1, order: "Anak ke-6", quadrant: "Q1", claimed: false, role: "Bibi", parentId: "kakek_2" },
    { id: "ayah_7", name: "Paman No. 7", gen: -1, order: "Anak ke-7", quadrant: "Q1", claimed: false, role: "Paman", parentId: "kakek_2" },
    { id: "ayah_8", name: "Bibi No. 8", gen: -1, order: "Anak ke-8", quadrant: "Q1", claimed: false, role: "Bibi", parentId: "kakek_2" },
    { id: "ayah_9", name: "Paman No. 9", gen: -1, order: "Anak ke-9", quadrant: "Q1", claimed: false, role: "Paman", parentId: "kakek_2" },
    { id: "ayah_10", name: "Bibi No. 10", gen: -1, order: "Anak ke-10", quadrant: "Q1", claimed: false, role: "Bibi Bungsu", parentId: "kakek_2" },

    // 3. Orbit 3: 6 Anak dari Ayah No. 2 (User & Saudara 1 - 6, User adalah No. 3)
    { id: "user_sib_1", name: "Kakak No. 1", gen: 0, order: "Anak ke-1", quadrant: "Q1", claimed: true, role: "Kakak Sulung", relationType: "kakak", parentId: "ayah_2" },
    { id: "user_sib_2", name: "Kakak No. 2", gen: 0, order: "Anak ke-2", quadrant: "Q1", claimed: true, role: "Kakak Kedua", relationType: "kakak", parentId: "ayah_2" },
    {
      id: "user_node",
      name: "Hendriana (User No. 3)",
      gen: 0,
      order: "Anak ke-3",
      quadrant: "Q1",
      claimed: true,
      role: "User (Poros Utama)",
      isUser: true,
      relationType: "user",
      parentId: "ayah_2",
      spouseName: "Siti Nurhaliza",
      spouseGender: "P"
    },
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
    { id: "q2_kakek", name: "Kakek Maternal", gen: -2, order: "Anak ke-1", quadrant: "Q2", claimed: true, role: "Kakek (Abah Ibu)", parentId: "q2_uyut" },
    { id: "q2_ibu", name: "Ibu Kandung User", gen: -1, order: "Anak ke-1", quadrant: "Q2", claimed: true, role: "Ibu Kandung", parentId: "q2_kakek" },
    { id: "q2_user", name: "Hendriana (Trah Ibu)", gen: 0, order: "Anak ke-1", quadrant: "Q2", claimed: true, role: "User (Trah Ibu)", parentId: "q2_ibu" },

    // ==========================================
    // TRAH AYAH PASANGAN (Q3)
    // ==========================================
    { id: "q3_uyut", name: "Uyut Besan Ayah", gen: -3, order: "Pusat Kuadran", quadrant: "Q3", claimed: true, role: "Uyut Besan" },
    { id: "q3_kakek", name: "Kakek Mertua", gen: -2, order: "Anak ke-1", quadrant: "Q3", claimed: false, role: "Kakek Mertua", parentId: "q3_uyut" },
    { id: "q3_ayah_mertua", name: "Ayah Mertua (H. Suryana)", gen: -1, order: "Anak ke-1", quadrant: "Q3", claimed: true, role: "Ayah Pasangan", parentId: "q3_kakek" },
    { id: "q3_pasangan", name: "Siti Nurhaliza (Trah Ayah)", gen: 0, order: "Anak ke-1", quadrant: "Q3", claimed: true, role: "Pasangan", parentId: "q3_ayah_mertua" },

    // ==========================================
    // TRAH IBU PASANGAN (Q4)
    // ==========================================
    { id: "q4_uyut", name: "Uyut Besan Ibu", gen: -3, order: "Pusat Kuadran", quadrant: "Q4", claimed: true, role: "Uyut Besan" },
    { id: "q4_kakek", name: "Nenek Mertua", gen: -2, order: "Anak ke-1", quadrant: "Q4", claimed: false, role: "Nenek Mertua", parentId: "q4_uyut" },
    { id: "q4_ibu_mertua", name: "Ibu Mertua (Hj. Maryam)", gen: -1, order: "Anak ke-1", quadrant: "Q4", claimed: true, role: "Ibu Pasangan", parentId: "q4_kakek" },
    { id: "q4_pasangan", name: "Siti Nurhaliza (Trah Ibu)", gen: 0, order: "Anak ke-1", quadrant: "Q4", claimed: true, role: "Pasangan", parentId: "q4_ibu_mertua" }
  ]
};

const DEFAULT_LOGS: LedgerLog[] = [
  { id: "log-1", time: "System Init", action: "Silsilah Mutlak Admin", text: "Struktur Hierarki Mutlak: Uyut (1) -> Kakek (3) -> Ayah (10) -> User/Saudara (6) -> Anak (3)." },
  { id: "log-2", time: "09:00", action: "Pasangan User", text: "Pasangan (Siti Nurhaliza) dikonfigurasi berdampingan/nempel dengan warna Rose Pink kontras." }
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

  // Role Mode: Admin Trah (bisa edit silsilah mutlak, hapus garis, kelola batch) vs User Warga (klaim & keluarga inti)
  const [isAdminMode, setIsAdminMode] = useState<boolean>(true);

  // Global Line Visibility Toggle (Admin feature)
  const [showConnectingLines, setShowConnectingLines] = useState<boolean>(true);

  // Tree State (Persisted)
  const [familyTree, setFamilyTree] = useState<OrbitTreeData>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_orbitqu_tree_v5');
      return saved ? JSON.parse(saved) : CLEAN_REAL_TREE_DATA;
    } catch {
      return CLEAN_REAL_TREE_DATA;
    }
  });

  const [logs, setLogs] = useState<LedgerLog[]>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_orbitqu_logs_v5');
      return saved ? JSON.parse(saved) : DEFAULT_LOGS;
    } catch {
      return DEFAULT_LOGS;
    }
  });

  // Modals
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showAdminEditModal, setShowAdminEditModal] = useState(false);
  const [showUserClaimModal, setShowUserClaimModal] = useState(false);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);

  // Selected Node
  const [selectedNode, setSelectedNode] = useState<OrbitNode | null>(null);

  // User Claim & Core Family State
  const [claimNameInput, setClaimNameInput] = useState('');
  const [claimSpouseInput, setClaimSpouseInput] = useState('');
  const [claimNotesInput, setClaimNotesInput] = useState('');

  // Add Child State
  const [childNamesInput, setChildNamesInput] = useState('');
  const [childRoleInput, setChildRoleInput] = useState('');

  // Parent Linking State for Selected Node
  const [parentSelectMode, setParentSelectMode] = useState<'existing' | 'custom'>('existing');
  const [customParentName, setCustomParentName] = useState('');

  // Form State for Batch Quick-Input (Admin Mutlak)
  const [batchQuadrant, setBatchQuadrant] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [batchUyut, setBatchUyut] = useState('');
  const [batchKakek, setBatchKakek] = useState('');
  const [batchAyah, setBatchAyah] = useState('');
  const [batchUserSaudara, setBatchUserSaudara] = useState('');
  const [batchAnak, setBatchAnak] = useState('');
  const [batchCucu, setBatchCucu] = useState('');
  const [batchCicit, setBatchCicit] = useState('');
  const [batchLineEnabled, setBatchLineEnabled] = useState(true);

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
      localStorage.setItem('wargaqu_orbitqu_tree_v5', JSON.stringify(familyTree));
    } catch (e) {
      console.error(e);
    }
  }, [familyTree]);

  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_orbitqu_logs_v5', JSON.stringify(logs));
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
    addLog('Reset Data Mutlak', 'Mengembalikan silsilah ke contoh resmi: 1 Uyut -> 3 Kakek -> 10 Ayah (Kakek B) -> 6 User/Saudara (Ayah 2) -> 3 Anak (User 3).');
    showNotification?.('Data silsilah dikembalikan ke struktur resmi mutlak!');
    renderCanvas();
  };

  const handleClearAllData = () => {
    const emptyTree: OrbitTreeData = {
      quadrants: CLEAN_REAL_TREE_DATA.quadrants,
      nodes: [
        {
          id: "user_initial",
          name: "Hendriana (User No. 1)",
          gen: 0,
          order: "Anak ke-1",
          quadrant: "Q1",
          claimed: true,
          isUser: true,
          role: "User (Poros Utama)",
          spouseName: "Siti Nurhaliza"
        }
      ]
    };
    setFamilyTree(emptyTree);
    addLog('Bersihkan Data', 'Menghapus seluruh node silsilah untuk memulai lembar baru.');
    showNotification?.('Data silsilah berhasil dibersihkan!');
    renderCanvas();
  };

  // -------------------------------------------------------------
  // AUTO-LOAD BATCH DATA PREFILL DARI PENGISIAN SEBELUMNYA
  // -------------------------------------------------------------
  const loadBatchPrefill = (quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4', currentTree: OrbitTreeData = familyTree) => {
    const qNodes = currentTree.nodes.filter(n => (n.quadrant || 'Q1') === quadrant);

    const uyutStr = qNodes.filter(n => n.gen === -3).map(n => n.name).join(', ');
    const kakekStr = qNodes.filter(n => n.gen === -2).map(n => n.name).join(', ');
    const ayahStr = qNodes.filter(n => n.gen === -1).map(n => n.name).join(', ');
    const userSaudaraStr = qNodes.filter(n => n.gen === 0).map(n => n.name).join(', ');
    const anakStr = qNodes.filter(n => n.gen === 1).map(n => n.name).join(', ');
    const cucuStr = qNodes.filter(n => n.gen === 2).map(n => n.name).join(', ');
    const cicitStr = qNodes.filter(n => n.gen === 3).map(n => n.name).join(', ');

    setBatchUyut(uyutStr);
    setBatchKakek(kakekStr);
    setBatchAyah(ayahStr);
    setBatchUserSaudara(userSaudaraStr);
    setBatchAnak(anakStr);
    setBatchCucu(cucuStr);
    setBatchCicit(cicitStr);
  };

  const handleOpenBatchModal = () => {
    loadBatchPrefill(batchQuadrant);
    setShowBatchModal(true);
  };

  // -------------------------------------------------------------
  // HIERARCHICAL RADIAL TREE ALGORITHM (ZERO CROSSING LINES & CLUSTERED SIBLINGS)
  // Dynamic radial expansion: jika orbit penuh maka radius melebar tanpa penumpukan
  // -------------------------------------------------------------
  const calculatePositions = (tree: OrbitTreeData) => {
    (Object.keys(tree.quadrants) as Array<keyof typeof tree.quadrants>).forEach(qKey => {
      const q = tree.quadrants[qKey];
      const qCenter = q.center;
      const qNodes = tree.nodes.filter(n => (n.quadrant || 'Q1') === qKey);

      // Hitung jumlah node per generasi untuk pelebaran radius dinamis
      const counts: { [gen: number]: number } = {};
      qNodes.forEach(n => {
        counts[n.gen] = (counts[n.gen] || 0) + 1;
      });

      // Orbit radii dinamis (melebar otomatis jika penuh agar tidak menumpuk)
      const baseRadii: { [gen: number]: number } = {
        [-3]: 0,    // Pusat: Uyut
        [-2]: 85,   // Orbit 1: Kakek
        [-1]: 160,  // Orbit 2: Ayah / Paman / Bibi
        [0]: 235,   // Orbit 3: User & Saudara
        [1]: 310,   // Orbit 4: Anak
        [2]: 385,   // Orbit 5: Cucu
        [3]: 460    // Orbit 6: Cicit (Terluar)
      };

      const finalRadii: { [gen: number]: number } = { ...baseRadii };
      let prevRadius = 0;
      [-3, -2, -1, 0, 1, 2, 3].forEach(gen => {
        if (gen === -3) {
          finalRadii[gen] = 0;
          prevRadius = 0;
          return;
        }
        const count = counts[gen] || 0;
        // Jarak keliling minimal antar-node = 46px agar tidak berhimpit
        const minRadiusForCount = Math.max(baseRadii[gen], (count * 46) / (2 * Math.PI));
        const resolvedRadius = Math.max(minRadiusForCount, prevRadius + 70);
        finalRadii[gen] = resolvedRadius;
        prevRadius = resolvedRadius;
      });

      // 1. Tempatkan Pusat Kuadran: Uyut (R=0)
      const uyutList = qNodes.filter(n => n.gen === -3);
      uyutList.forEach(uyut => {
        uyut._renderX = qCenter.x;
        uyut._renderY = qCenter.y;
        uyut._angle = 0;
        uyut._sectorStart = 0;
        uyut._sectorEnd = Math.PI * 2;
      });

      // Helper bobot subtree untuk pembagian porsi sudut sektor
      const getSubtreeWeight = (nodeId: string): number => {
        const directChildren = qNodes.filter(n => n.parentId === nodeId);
        if (directChildren.length === 0) return 1;
        let sum = 0;
        directChildren.forEach(c => {
          sum += getSubtreeWeight(c.id);
        });
        return Math.max(directChildren.length, sum);
      };

      // 2. Orbit 1: Kakek (Membagi lingkaran 360 derajat sesuai porsi keturunan)
      const kakekList = qNodes.filter(n => n.gen === -2);
      if (kakekList.length > 0) {
        let totalKakekWeight = 0;
        kakekList.forEach(k => {
          totalKakekWeight += getSubtreeWeight(k.id);
        });

        let currentAngle = 0;
        const radiusO1 = finalRadii[-2];

        kakekList.forEach(kakek => {
          const weight = getSubtreeWeight(kakek.id);
          const sectorSpan = (weight / totalKakekWeight) * Math.PI * 2;
          const midAngle = currentAngle + sectorSpan / 2;

          kakek._sectorStart = currentAngle;
          kakek._sectorEnd = currentAngle + sectorSpan;
          kakek._angle = midAngle;
          kakek._renderX = qCenter.x + radiusO1 * Math.cos(midAngle);
          kakek._renderY = qCenter.y + radiusO1 * Math.sin(midAngle);

          currentAngle += sectorSpan;
        });
      }

      // 3. Rekursif menata generasi berikutnya dalam sektor orang tuanya (ZERO CROSSING LINES)
      const layoutChildrenInParentSector = (parentGen: number, childGen: number) => {
        const parents = qNodes.filter(n => n.gen === parentGen);
        const radius = finalRadii[childGen];

        parents.forEach(p => {
          const children = qNodes.filter(n => n.gen === childGen && n.parentId === p.id);
          if (children.length === 0) return;

          const pStart = p._sectorStart !== undefined ? p._sectorStart : 0;
          const pEnd = p._sectorEnd !== undefined ? p._sectorEnd : Math.PI * 2;
          const pSpan = pEnd - pStart;

          let totalChildWeight = 0;
          children.forEach(c => {
            totalChildWeight += getSubtreeWeight(c.id);
          });

          let cAngle = pStart;
          children.forEach((child) => {
            const cWeight = getSubtreeWeight(child.id);
            const cSpan = (cWeight / totalChildWeight) * pSpan;
            const midAngle = cAngle + cSpan / 2;

            child._sectorStart = cAngle;
            child._sectorEnd = cAngle + cSpan;
            child._angle = midAngle;
            child._renderX = qCenter.x + radius * Math.cos(midAngle);
            child._renderY = qCenter.y + radius * Math.sin(midAngle);

            cAngle += cSpan;
          });
        });

        // Tangani anak yatim (jika parentId belum tersambung)
        const unassigned = qNodes.filter(n => n.gen === childGen && n._renderX === undefined);
        if (unassigned.length > 0) {
          unassigned.forEach((node, idx) => {
            const angle = (idx / unassigned.length) * Math.PI * 2;
            node._angle = angle;
            node._renderX = qCenter.x + radius * Math.cos(angle);
            node._renderY = qCenter.y + radius * Math.sin(angle);
          });
        }
      };

      // Orbit 1 -> Orbit 2 (Ayah/Paman/Bibi 1..10 berkelompok presisi di kakeknya)
      layoutChildrenInParentSector(-2, -1);
      // Orbit 2 -> Orbit 3 (User & Saudara 1..6 berdampingan presisi)
      layoutChildrenInParentSector(-1, 0);
      // Orbit 3 -> Orbit 4 (Anak 1..3 presisi di User)
      layoutChildrenInParentSector(0, 1);
      // Orbit 4 -> Orbit 5 (Cucu)
      layoutChildrenInParentSector(1, 2);
      // Orbit 5 -> Orbit 6 (Cicit)
      layoutChildrenInParentSector(2, 3);

      // Hitung posisi nempel/berdampingan untuk Pasangan User
      qNodes.forEach(node => {
        if (node.spouseName && node._renderX !== undefined && node._renderY !== undefined) {
          const currentRadius = Math.sqrt(
            Math.pow(node._renderX - qCenter.x, 2) + Math.pow(node._renderY - qCenter.y, 2)
          );
          const currentAngle = node._angle !== undefined
            ? node._angle
            : Math.atan2(node._renderY - qCenter.y, node._renderX - qCenter.x);

          // Geser sedikit di orbit yang sama (nempel / berdampingan)
          const spouseAngle = currentAngle + 0.14;
          node._spouseX = qCenter.x + currentRadius * Math.cos(spouseAngle);
          node._spouseY = qCenter.y + currentRadius * Math.sin(spouseAngle);
        }
      });
    });
  };

  // Helper pencari induk
  const getParentNode = (child: OrbitNode, candidateParents: OrbitNode[]): OrbitNode | null => {
    if (!candidateParents || candidateParents.length === 0) return null;
    if (child.parentId) {
      const directMatch = candidateParents.find(p => p.id === child.parentId);
      if (directMatch) return directMatch;
      const nameMatch = candidateParents.find(p => p.name.toLowerCase() === child.parentId?.toLowerCase());
      if (nameMatch) return nameMatch;
    }
    return candidateParents[0] || null;
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

    // Background Kosmos Tata Surya
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#0b0f19";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + camX, height / 2 + camY);
    ctx.scale(zoom, zoom);

    // Grid bintang halus
    ctx.fillStyle = "#1e293b22";
    for (let gx = -1600; gx <= 1600; gx += 160) {
      for (let gy = -1400; gy <= 1400; gy += 160) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // =========================================================
    // 1. CINCIN 6 ORBIT TIAP KUADRAN
    // =========================================================
    (Object.keys(familyTree.quadrants) as Array<keyof typeof familyTree.quadrants>).forEach(qKey => {
      const q = familyTree.quadrants[qKey];
      const qNodes = familyTree.nodes.filter(n => (n.quadrant || 'Q1') === qKey);

      // Hitung radius dinamis kuadran ini
      const counts: { [gen: number]: number } = {};
      qNodes.forEach(n => { counts[n.gen] = (counts[n.gen] || 0) + 1; });
      const baseR = [85, 160, 235, 310, 385, 460];
      const ringRadii: number[] = [];
      let prevR = 0;
      baseR.forEach((br, idx) => {
        const gen = idx - 2; // -2 s/d 3
        const count = counts[gen] || 0;
        const minR = Math.max(br, (count * 46) / (2 * Math.PI));
        const resR = Math.max(minR, prevR + 70);
        ringRadii.push(resR);
        prevR = resR;
      });

      const orbitRings = [
        { r: ringRadii[0], label: "Orbit 1: Kakek" },
        { r: ringRadii[1], label: "Orbit 2: Ayah / Paman (1-10)" },
        { r: ringRadii[2], label: "Orbit 3: User & Saudara (Gen 0)", isPoros: true },
        { r: ringRadii[3], label: "Orbit 4: Anak (1-3)" },
        { r: ringRadii[4], label: "Orbit 5: Cucu" },
        { r: ringRadii[5], label: "Orbit 6: Cicit (Terluar)", isOuter: true }
      ];

      orbitRings.forEach(ring => {
        ctx.beginPath();
        ctx.arc(q.center.x, q.center.y, ring.r, 0, Math.PI * 2);

        if (ring.isPoros) {
          ctx.strokeStyle = "#38bdf877";
          ctx.lineWidth = 2.2;
          ctx.setLineDash([6, 4]);
        } else if (ring.isOuter) {
          ctx.strokeStyle = q.color + "55";
          ctx.lineWidth = 1.8;
          ctx.setLineDash([4, 4]);
        } else {
          ctx.strokeStyle = q.color + "30";
          ctx.lineWidth = 1.2;
          ctx.setLineDash([5, 5]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = ring.isPoros ? "bold 10px sans-serif" : "9px sans-serif";
        ctx.fillStyle = ring.isPoros ? "#38bdf8" : q.color + "aa";
        ctx.textAlign = "left";
        ctx.fillText(ring.label, q.center.x + ring.r + 6, q.center.y);
      });

      // Batas Luar Kuadran
      const maxR = ringRadii[5] + 55;
      ctx.beginPath();
      ctx.arc(q.center.x, q.center.y, maxR, 0, Math.PI * 2);
      ctx.strokeStyle = q.color + "40";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Judul Kuadran
      ctx.font = "bold 15px sans-serif";
      ctx.fillStyle = q.color;
      ctx.textAlign = "center";
      ctx.fillText(q.name, q.center.x, q.center.y - maxR - 15);
    });

    // =========================================================
    // 2. GARIS KONEKTOR HIERARKI MUTLAK (ZERO CROSSINGS)
    // Admin bisa sembunyikan/hapus garis (showConnectingLines & !node.hideLine)
    // =========================================================
    if (showConnectingLines) {
      (Object.keys(familyTree.quadrants) as Array<keyof typeof familyTree.quadrants>).forEach(qKey => {
        const q = familyTree.quadrants[qKey];
        const qNodes = familyTree.nodes.filter(n => (n.quadrant || 'Q1') === qKey);

        const drawHierarchyStep = (parentGen: number, childGen: number) => {
          const parents = qNodes.filter(n => n.gen === parentGen);
          const children = qNodes.filter(n => n.gen === childGen);

          children.forEach(child => {
            if (child.hideLine) return; // Admin toggle putus garis untuk node ini
            if (child._renderX === undefined || child._renderY === undefined) return;

            const parentNode = getParentNode(child, parents);
            if (!parentNode || parentNode.hideLine) return;
            if (parentNode._renderX === undefined || parentNode._renderY === undefined) return;

            ctx.beginPath();
            ctx.moveTo(parentNode._renderX, parentNode._renderY);
            ctx.lineTo(child._renderX, child._renderY);
            ctx.strokeStyle = child.claimed ? `${q.color}cc` : `${q.color}50`;
            ctx.lineWidth = child.claimed ? 2 : 1.3;
            ctx.stroke();
          });
        };

        // Gambar bertingkat dari Uyut -> Kakek -> Ayah -> User -> Anak -> Cucu -> Cicit
        drawHierarchyStep(-3, -2);
        drawHierarchyStep(-2, -1);
        drawHierarchyStep(-1, 0);
        drawHierarchyStep(0, 1);
        drawHierarchyStep(1, 2);
        drawHierarchyStep(2, 3);
      });
    }

    // =========================================================
    // 3. JALUR PENGHUBUNG KOSMOS PADA ORBIT 3 (POROS USER GEN 0)
    // =========================================================
    const userNodes = familyTree.nodes.filter(n => n.gen === 0 && (n.isUser || n.name.includes("User")));
    if (userNodes.length > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fillStyle = "#38bdf833";
      ctx.fill();
      ctx.strokeStyle = "#38bdf888";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      ctx.save();
      ctx.font = "bold 9px sans-serif";
      ctx.fillStyle = "#38bdf8";
      ctx.textAlign = "center";
      ctx.fillText("POROS KELUARGA (GEN 0)", 0, -18);
      ctx.restore();

      userNodes.forEach(un => {
        if (un._renderX !== undefined && un._renderY !== undefined) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(un._renderX, un._renderY);
          ctx.strokeStyle = "#38bdf844";
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    // =========================================================
    // 4. NODES ANGGOTA KELUARGA & PASANGAN BERDAMPINGAN
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
      if (isUyut) radius = 25;
      else if (isUserEgo) radius = 24;
      else if (isUserSaudara) radius = 20;
      else if (isKakek || isAyah) radius = 19;
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

      // Draw Main Node Circle
      ctx.beginPath();
      ctx.arc(node._renderX, node._renderY, radius, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = isUyut || isUserEgo ? 3.5 : 2;
      ctx.stroke();

      // Draw Node Icon & Text
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

      // Label Nama
      ctx.font = isUserEgo ? "bold 12px sans-serif" : "bold 11px sans-serif";
      ctx.fillStyle = isUserEgo ? "#38bdf8" : "#f8fafc";
      ctx.fillText(node.name, 0, radius + 13);

      // Label Urutan & Orbit
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
      ctx.fillText(`${node.order} • ${orbitLabel}`, 0, radius + 25);

      if (node.hideLine) {
        ctx.fillStyle = "#f43f5e";
        ctx.fillText("(Garis Terputus)", 0, radius + 36);
      } else if (!node.claimed && !isUyut) {
        ctx.fillStyle = "#f59e0b";
        ctx.fillText("Belum Diklaim", 0, radius + 36);
      }

      ctx.restore();

      // =========================================================
      // 5. PASANGAN USER TAMPIL NEMPEL / BERDAMPINGAN & BEDA WARNA
      // =========================================================
      if (node.spouseName && node._spouseX !== undefined && node._spouseY !== undefined) {
        const spouseR = 19;

        // Garis cincin cinta penghubung user & pasangan
        ctx.beginPath();
        ctx.moveTo(node._renderX, node._renderY);
        ctx.lineTo(node._spouseX, node._spouseY);
        ctx.strokeStyle = "#f43f5e99";
        ctx.lineWidth = 3;
        ctx.stroke();

        // Icon cincin di tengah ikatan
        const midX = (node._renderX + node._spouseX) / 2;
        const midY = (node._renderY + node._spouseY) / 2;
        ctx.save();
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("💍", midX, midY - 6);
        ctx.restore();

        // Lingkaran Pasangan (Warna Rose Pink Kontras & Beda Warna)
        ctx.beginPath();
        ctx.arc(node._spouseX, node._spouseY, spouseR, 0, Math.PI * 2);
        ctx.fillStyle = "#e11d48";
        ctx.fill();
        ctx.strokeStyle = "#fda4af";
        ctx.lineWidth = 2.8;
        ctx.stroke();

        // Text Pasangan
        ctx.save();
        ctx.translate(node._spouseX, node._spouseY);

        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("💍", 0, 4);

        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = "#fda4af";
        ctx.fillText(node.spouseName, 0, spouseR + 13);

        ctx.font = "9px sans-serif";
        ctx.fillStyle = "#f43f5e";
        ctx.fillText("Pasangan (Berdampingan)", 0, spouseR + 24);

        ctx.restore();
      }
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
  }, [familyTree, showConnectingLines]);

  useEffect(() => {
    renderCanvas();
  }, [familyTree, showConnectingLines]);

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

  // Node Click: Admin Modal vs User Claim/Keluarga Inti Modal
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

    // Cek apakah klik pada node atau pasangan
    for (const node of familyTree.nodes) {
      // 1. Cek klik pada Node Utama
      if (node._renderX !== undefined && node._renderY !== undefined) {
        const dx = worldX - node._renderX;
        const dy = worldY - node._renderY;
        const radius = node.gen === -3 || node.isUser ? 26 : 21;
        if (Math.sqrt(dx * dx + dy * dy) <= radius + 6) {
          openNodeModal(node);
          return;
        }
      }

      // 2. Cek klik pada Pasangan Berdampingan
      if (node._spouseX !== undefined && node._spouseY !== undefined) {
        const dx = worldX - node._spouseX;
        const dy = worldY - node._spouseY;
        if (Math.sqrt(dx * dx + dy * dy) <= 25) {
          openNodeModal(node);
          return;
        }
      }
    }
  };

  const openNodeModal = (node: OrbitNode) => {
    setSelectedNode(node);
    setCustomParentName(node.parentId || '');
    setParentSelectMode('existing');

    if (isAdminMode) {
      setShowAdminEditModal(true);
    } else {
      // User Mode: Modal Klaim & Keluarga Inti
      setClaimNameInput(node.name);
      setClaimSpouseInput(node.spouseName || '');
      setClaimNotesInput(node.notes || '');
      setShowUserClaimModal(true);
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
  // USER MODE: KLAIM & KELUARGA INTI (PASANGAN & ANAK)
  // -------------------------------------------------------------
  const handleSaveUserClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;

    setFamilyTree(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === selectedNode.id
          ? {
              ...n,
              name: claimNameInput.trim() || n.name,
              claimed: true,
              spouseName: claimSpouseInput.trim() || undefined,
              notes: claimNotesInput.trim() || undefined
            }
          : n
      )
    }));

    addLog('Klaim User', `Profil ${claimNameInput || selectedNode.name} diklaim oleh User. Pasangan: ${claimSpouseInput || 'Tidak diisi'}`);
    setShowUserClaimModal(false);
    setSelectedNode(null);
    showNotification?.('Profil & Data Keluarga Inti (Pasangan) berhasil disimpan!');
    renderCanvas();
  };

  // -------------------------------------------------------------
  // ADMIN MODE: EDIT MUTLAK, RAPIKAN & HAPUS/PUTUS GARIS
  // -------------------------------------------------------------
  const handleSaveAdminEdit = (e: React.FormEvent) => {
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
              parentId: finalParentId,
              hideLine: selectedNode.hideLine,
              spouseName: selectedNode.spouseName
            }
          : n
      )
    }));

    addLog('Admin Edit Mutlak', `Admin memperbarui ${selectedNode.name} [Induk: ${finalParentId || 'Auto'}, Garis: ${selectedNode.hideLine ? 'Putus' : 'Aktif'}]`);
    setShowAdminEditModal(false);
    setSelectedNode(null);
    showNotification?.('Perubahan silsilah mutlak berhasil disimpan!');
    renderCanvas();
  };

  const handleToggleHideLine = () => {
    if (!selectedNode) return;
    const nextHide = !selectedNode.hideLine;
    setSelectedNode({ ...selectedNode, hideLine: nextHide });
    showNotification?.(nextHide ? 'Garis langsung ke induk diputus / disembunyikan.' : 'Garis langsung ke induk kembali diaktifkan.');
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
    setShowAdminEditModal(false);
    setSelectedNode(null);
    showNotification?.('Anggota berhasil dihapus dari orbit.');
    renderCanvas();
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

  // Direct Integration to Silsilah Tab
  const handleJumpToSilsilah = () => {
    if (!selectedNode) return;
    const name = selectedNode.name;
    const id = selectedNode.id;
    setShowAdminEditModal(false);
    setShowUserClaimModal(false);
    setSelectedNode(null);
    if (onOpenInSilsilah) {
      onOpenInSilsilah(name, id);
    }
  };

  // -------------------------------------------------------------
  // BATCH QUICK-INPUT UNTUK ADMIN (SILSILAH MUTLAK)
  // Menjaga urutan awal, prefill otomatis data sebelumnya, & tanpa garis menyilang
  // -------------------------------------------------------------
  const handleBatchSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Hapus node lama dari kuadran ini dan gantikan dengan input mutlak Admin
    const otherQuadrantNodes = familyTree.nodes.filter(n => (n.quadrant || 'Q1') !== batchQuadrant);
    const newQuadrantNodes: OrbitNode[] = [];

    // 0. Uyut (Pusat)
    const uyutNames = batchUyut.split(',').map(n => n.trim()).filter(Boolean);
    const uyutId = `${batchQuadrant.toLowerCase()}_uyut_1`;
    newQuadrantNodes.push({
      id: uyutId,
      name: uyutNames[0] || `Uyut Pusat (${batchQuadrant})`,
      gen: -3,
      order: "Pusat Kuadran (1)",
      quadrant: batchQuadrant,
      claimed: true,
      role: "Uyut Utama (Pusat Kuadran)",
      hideLine: !batchLineEnabled
    });

    // 1. Kakek (Orbit 1)
    const kakekNames = batchKakek.split(',').map(n => n.trim()).filter(Boolean);
    const kakekIds: string[] = [];
    kakekNames.forEach((name, i) => {
      const kId = `${batchQuadrant.toLowerCase()}_kakek_${i + 1}`;
      kakekIds.push(kId);
      newQuadrantNodes.push({
        id: kId,
        name,
        gen: -2,
        order: `Anak ke-${i + 1}`,
        quadrant: batchQuadrant,
        claimed: true,
        role: `Kakek (Anak ke-${i + 1})`,
        parentId: uyutId,
        hideLine: !batchLineEnabled
      });
    });

    // 2. Ayah / Paman / Bibi (Orbit 2) - Dihubungkan ke Kakek No. 2 (atau Kakek 1 jika hanya ada 1)
    const primaryKakekId = kakekIds[1] || kakekIds[0] || uyutId;
    const ayahNames = batchAyah.split(',').map(n => n.trim()).filter(Boolean);
    const ayahIds: string[] = [];
    ayahNames.forEach((name, i) => {
      const aId = `${batchQuadrant.toLowerCase()}_ayah_${i + 1}`;
      ayahIds.push(aId);
      newQuadrantNodes.push({
        id: aId,
        name,
        gen: -1,
        order: `Anak ke-${i + 1}`,
        quadrant: batchQuadrant,
        claimed: i === 1 ? true : false,
        role: i === 1 ? "Ayah Kandung User (No. 2)" : (i === 0 ? "Uwa Sulung" : "Paman / Bibi"),
        parentId: primaryKakekId,
        hideLine: !batchLineEnabled
      });
    });

    // 3. User & Saudara (Orbit 3) - Dihubungkan ke Ayah No. 2 (atau Ayah 1)
    const primaryAyahId = ayahIds[1] || ayahIds[0] || primaryKakekId;
    const userSaudaraNames = batchUserSaudara.split(',').map(n => n.trim()).filter(Boolean);
    let userNodeId = '';
    userSaudaraNames.forEach((name, i) => {
      const uId = `${batchQuadrant.toLowerCase()}_user_${i + 1}`;
      const isUser = name.toLowerCase().includes('user') || name.toLowerCase().includes('hendriana') || name.toLowerCase().includes('saya') || i === 2;
      if (isUser) userNodeId = uId;

      newQuadrantNodes.push({
        id: uId,
        name,
        gen: 0,
        order: `Anak ke-${i + 1}`,
        quadrant: batchQuadrant,
        claimed: isUser ? true : false,
        role: isUser ? "User (Poros Utama)" : (i < 2 ? "Kakak Kandung" : "Adik Kandung"),
        isUser,
        relationType: isUser ? 'user' : (i < 2 ? 'kakak' : 'adik'),
        parentId: primaryAyahId,
        hideLine: !batchLineEnabled,
        spouseName: isUser ? "Siti Nurhaliza" : undefined
      });
    });

    // 4. Anak (Orbit 4) - Dihubungkan ke User
    const anakTargetParent = userNodeId || primaryAyahId;
    const anakNames = batchAnak.split(',').map(n => n.trim()).filter(Boolean);
    const anakIds: string[] = [];
    anakNames.forEach((name, i) => {
      const anId = `${batchQuadrant.toLowerCase()}_anak_${i + 1}`;
      anakIds.push(anId);
      newQuadrantNodes.push({
        id: anId,
        name,
        gen: 1,
        order: `Anak ke-${i + 1}`,
        quadrant: batchQuadrant,
        claimed: true,
        role: `Anak ke-${i + 1}`,
        parentId: anakTargetParent,
        hideLine: !batchLineEnabled
      });
    });

    // 5. Cucu (Orbit 5) - Dihubungkan ke Anak No. 1
    const cucuNames = batchCucu.split(',').map(n => n.trim()).filter(Boolean);
    const cucuIds: string[] = [];
    const cucuParentId = anakIds[0] || anakTargetParent;
    cucuNames.forEach((name, i) => {
      const cuId = `${batchQuadrant.toLowerCase()}_cucu_${i + 1}`;
      cucuIds.push(cuId);
      newQuadrantNodes.push({
        id: cuId,
        name,
        gen: 2,
        order: `Cucu ke-${i + 1}`,
        quadrant: batchQuadrant,
        claimed: false,
        role: `Cucu ke-${i + 1}`,
        parentId: cucuParentId,
        hideLine: !batchLineEnabled
      });
    });

    // 6. Cicit (Orbit 6) - Dihubungkan ke Cucu No. 1
    const cicitNames = batchCicit.split(',').map(n => n.trim()).filter(Boolean);
    const cicitParentId = cucuIds[0] || cucuParentId;
    cicitNames.forEach((name, i) => {
      const ciId = `${batchQuadrant.toLowerCase()}_cicit_${i + 1}`;
      newQuadrantNodes.push({
        id: ciId,
        name,
        gen: 3,
        order: `Cicit ke-${i + 1}`,
        quadrant: batchQuadrant,
        claimed: false,
        role: `Cicit ke-${i + 1}`,
        parentId: cicitParentId,
        hideLine: !batchLineEnabled
      });
    });

    addLog('Batch Admin Mutlak', `Admin memperbarui garis silsilah mutlak kuadran ${batchQuadrant}. Garis penghubung: ${batchLineEnabled ? 'Aktif' : 'Non-aktif'}.`);

    setFamilyTree({
      ...familyTree,
      nodes: [...otherQuadrantNodes, ...newQuadrantNodes]
    });

    setShowBatchModal(false);
    showNotification?.(`🚀 Silsilah mutlak ${batchQuadrant} berhasil diperbarui & auto-tampil di orbit!`);
    renderCanvas();
  };

  // Opsi Calon Orang Tua (Orbit N-1) untuk Modal Admin
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
                OrbitQu
              </span>
            </div>
            <p className="text-[9px] text-slate-400 truncate max-w-[150px] sm:max-w-none">
              Hierarki Mutlak: 1 Uyut $\rightarrow$ 3 Kakek $\rightarrow$ 10 Ayah $\rightarrow$ 6 User/Saudara $\rightarrow$ 3 Anak
            </p>
          </div>
        </div>

        {/* Center Mode Switch: Admin Trah vs User Warga */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setIsAdminMode(true);
              showNotification?.('🛡️ Beralih ke Mode Admin Trah (Pengelola Silsilah Mutlak)');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
              isAdminMode ? 'bg-amber-600 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>Admin Trah</span>
          </button>
          <button
            onClick={() => {
              setIsAdminMode(false);
              showNotification?.('👤 Beralih ke Mode User Warga (Klaim & Keluarga Inti)');
            }}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition ${
              !isAdminMode ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3 h-3" />
            <span>User Warga</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Toggle Garis Konektor (Admin) */}
          {isAdminMode && (
            <button
              onClick={() => {
                setShowConnectingLines(!showConnectingLines);
                showNotification?.(!showConnectingLines ? 'Garis konektor diaktifkan.' : 'Garis konektor disembunyikan/dihapus.');
              }}
              className={`p-1.5 rounded-lg border text-[11px] font-semibold transition active:scale-95 flex items-center gap-1 ${
                showConnectingLines
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              }`}
              title="Admin: Tampilkan atau Hapus/Sembunyikan Garis Hubung"
            >
              {showConnectingLines ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{showConnectingLines ? 'Garis: On' : 'Garis: Off'}</span>
            </button>
          )}

          {/* Batch Modal Button (Admin Mutlak) */}
          <button
            onClick={handleOpenBatchModal}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition shadow-xs flex items-center gap-1"
            title="Kelola & Edit Kerangka Silsilah Mutlak (Batch)"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">Input / Edit Batch</span>
            <span className="sm:hidden">Batch</span>
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
            title="Bersihkan Semua Data / Mulai Lembar Bersih"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Bersihkan</span>
          </button>

          <button
            onClick={() => setShowLedgerModal(true)}
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-[11px] border border-slate-700 px-2.5 py-1.5 rounded-lg transition text-slate-200 flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Buku Besar</span>
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

        {/* LEGEND & PETUNJUK KUADRAN */}
        <div className="absolute bottom-16 sm:bottom-6 left-3 sm:left-6 z-20 bg-slate-900/90 backdrop-blur p-2.5 sm:p-3 rounded-xl border border-slate-800 text-xs flex flex-col gap-1.5 shadow-xl max-w-[290px] sm:max-w-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-200 text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              OrbitQu: Tata Surya 6 Orbit
            </span>
            <span className="text-[10px] text-slate-400 font-mono">{zoomLevelDisplay}%</span>
          </div>
          <div className="text-[10px] text-amber-300 bg-amber-950/40 p-1.5 rounded-lg border border-amber-500/30 font-medium">
            👑 <b>Pusat:</b> 1 Uyut $\rightarrow$ <b>Orbit 1:</b> 3 Kakek $\rightarrow$ <b>Orbit 2:</b> 10 Ayah (Kakek B)
          </div>
          <div className="text-[10px] text-slate-300 leading-relaxed">
            <b className="text-sky-300">Orbit 3:</b> 6 User &amp; Saudara (Ayah 2) $\rightarrow$ <b className="text-pink-300">Pasangan Nempel</b> $\rightarrow$ <b className="text-emerald-300">Orbit 4:</b> 3 Anak
          </div>
          <div className="text-[9px] text-slate-400 border-t border-slate-800 pt-1 flex items-center justify-between">
            <span className={isAdminMode ? 'text-amber-400 font-bold' : 'text-sky-400 font-bold'}>
              {isAdminMode ? '🛡️ Mode Admin: Klik node untuk edit mutlak / putus garis' : '👤 Mode User: Klik node untuk klaim & keluarga inti'}
            </span>
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL USER: KLAIM & KELUARGA INTI (PASANGAN & ANAK)            */}
      {/* ------------------------------------------------------------- */}
      {showUserClaimModal && selectedNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600/30 text-sky-400 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-sky-400">
                    Klaim &amp; Data Keluarga Inti
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Posisi: <strong>{selectedNode.order}</strong> (Orbit {selectedNode.gen + 3})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowUserClaimModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUserClaim} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Nama Lengkap Anda</label>
                <input
                  type="text"
                  required
                  value={claimNameInput}
                  onChange={e => setClaimNameInput(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Data Pasangan Nempel Berdampingan */}
              <div className="p-3 bg-pink-950/30 rounded-xl border border-pink-500/40 flex flex-col gap-2">
                <label className="block text-pink-300 font-bold flex items-center gap-1.5">
                  <span>💍</span>
                  Nama Pasangan (Istri / Suami)
                </label>
                <input
                  type="text"
                  value={claimSpouseInput}
                  onChange={e => setClaimSpouseInput(e.target.value)}
                  placeholder="Contoh: Siti Nurhaliza"
                  className="w-full bg-slate-800 border border-pink-500/50 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-pink-400"
                />
                <p className="text-[10px] text-pink-200/80 leading-relaxed">
                  Pasangan akan tampil <strong>menempel berdampingan</strong> pada orbit yang sama dengan warna Rose Pink yang kontras.
                </p>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Catatan Tambahan Keluarga Inti</label>
                <input
                  type="text"
                  value={claimNotesInput}
                  onChange={e => setClaimNotesInput(e.target.value)}
                  placeholder="Contoh: Tanggal pernikahan atau kontak"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-lg transition active:scale-98 shadow"
                >
                  Simpan &amp; Klaim Profil
                </button>
                <button
                  type="button"
                  onClick={handleJumpToSilsilah}
                  className="px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg flex items-center gap-1"
                  title="Buka di Tab Silsilah"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Silsilah</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL ADMIN: EDIT MUTLAK, RAPIKAN & HAPUS/PUTUS GARIS         */}
      {/* ------------------------------------------------------------- */}
      {showAdminEditModal && selectedNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 text-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar">
            {/* Header Modal */}
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-600/30 text-amber-400 flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-amber-400 flex items-center gap-1.5">
                    🛡️ Pengaturan Mutlak (Admin Trah)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Node ID: {selectedNode.id} • Kuadran {selectedNode.quadrant} • Orbit {selectedNode.gen + 3}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAdminEditModal(false);
                  setSelectedNode(null);
                }}
                className="text-slate-400 hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action: Tambah Keturunan & Buka Silsilah */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenAddChildModal}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 font-bold py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Tambah Keturunan</span>
              </button>

              <button
                type="button"
                onClick={handleJumpToSilsilah}
                className="bg-sky-950/70 hover:bg-sky-900 border border-sky-400/50 text-sky-200 active:scale-95 font-bold py-2 px-2 rounded-xl text-xs flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4 text-sky-400" />
                <span>Buka di Silsilah</span>
              </button>
            </div>

            {/* Form Edit Mutlak Admin */}
            <form onSubmit={handleSaveAdminEdit} className="flex flex-col gap-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={selectedNode.name}
                  onChange={e => setSelectedNode({ ...selectedNode, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Nomor Urut Anak</label>
                  <input
                    type="text"
                    value={selectedNode.order}
                    onChange={e => setSelectedNode({ ...selectedNode, order: e.target.value })}
                    placeholder="Contoh: Anak ke-2"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Gelar / Peran</label>
                  <input
                    type="text"
                    value={selectedNode.role || ''}
                    onChange={e => setSelectedNode({ ...selectedNode, role: e.target.value })}
                    placeholder="Contoh: Kakek, Uwa, Anak"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Input Pasangan Berdampingan */}
              <div>
                <label className="block text-pink-300 font-semibold mb-1 flex items-center gap-1">
                  <span>💍</span> Nama Pasangan (Tampil Berdampingan)
                </label>
                <input
                  type="text"
                  value={selectedNode.spouseName || ''}
                  onChange={e => setSelectedNode({ ...selectedNode, spouseName: e.target.value })}
                  placeholder="Nama Istri / Suami (cth: Siti Nurhaliza)"
                  className="w-full bg-slate-800 border border-pink-500/40 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-pink-400"
                />
              </div>

              {/* FITUR RAPIKAN ATAU PUTUS/HAPUS GARIS LANGSUNG */}
              {selectedNode.gen > -3 && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-sky-400 flex items-center gap-1.5 text-[11px]">
                      <GitBranch className="w-3.5 h-3.5" />
                      Garis Induk Orang Tua (Orbit {selectedNode.gen + 2})
                    </label>

                    {/* Tombol Putus/Hapus Garis */}
                    <button
                      type="button"
                      onClick={handleToggleHideLine}
                      className={`px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                        selectedNode.hideLine
                          ? 'bg-rose-900/80 text-rose-200 border border-rose-500/40'
                          : 'bg-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      {selectedNode.hideLine ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{selectedNode.hideLine ? 'Garis Terputus' : 'Putus / Hapus Garis'}</span>
                    </button>
                  </div>

                  <div className="flex text-[10px] gap-1 justify-end">
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

                  {parentSelectMode === 'existing' ? (
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
                  ) : (
                    <input
                      type="text"
                      value={customParentName}
                      onChange={e => {
                        setCustomParentName(e.target.value);
                        setSelectedNode({ ...selectedNode, parentId: e.target.value });
                      }}
                      placeholder="Ketik nama orang tua (jika typo / belum ada)"
                      className="w-full bg-slate-800 border border-sky-500/50 rounded-lg p-2 text-slate-100 focus:outline-none text-xs"
                    />
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
                  <span>Tandai Profil Sudah Lengkap / Diklaim</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-amber-600 hover:bg-amber-500 font-bold py-2.5 rounded-lg text-slate-950 transition active:scale-98 shadow"
                >
                  Simpan Perubahan Admin
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
                Anak akan otomatis ditempatkan di <strong>Orbit {Math.min(selectedNode.gen + 1, 3) + 3}</strong> dalam kelompok induk <strong>{selectedNode.name}</strong> tanpa garis menyilang.
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
      {/* MODAL BATCH QUICK INPUT (ADMIN SILSILAH MUTLAK)                */}
      {/* ------------------------------------------------------------- */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3.5 max-h-[92vh] overflow-y-auto no-scrollbar text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-emerald-400 flex items-center gap-1.5">
                    ⚡ Input &amp; Edit Silsilah Mutlak di Batch (Admin)
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Otomatis menampilkan data pengisian sebelumnya saat kuadran dipilih
                  </p>
                </div>
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
                <label className="block text-slate-300 mb-1 font-semibold">
                  Pilih Kuadran Trah Tujuan (Data Otomatis Tampil)
                </label>
                <select
                  value={batchQuadrant}
                  onChange={e => {
                    const q = e.target.value as any;
                    setBatchQuadrant(q);
                    loadBatchPrefill(q);
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                >
                  <option value="Q1">Trah Ayah User (Kiri-Atas) • Biru</option>
                  <option value="Q2">Trah Ibu User (Kanan-Atas) • Hijau</option>
                  <option value="Q3">Trah Ayah Pasangan (Kiri-Bawah) • Merah</option>
                  <option value="Q4">Trah Ibu Pasangan (Kanan-Bawah) • Ungu</option>
                </select>
              </div>

              {/* Opsi Garis Terhubung oleh Admin */}
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block text-xs">Garis Konektor Hierarki</span>
                  <span className="text-[10px] text-slate-400">Hapus / sembunyikan jika ingin orbit tanpa garis terhubung</span>
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={batchLineEnabled}
                    onChange={e => setBatchLineEnabled(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-emerald-400">
                    {batchLineEnabled ? 'Garis Aktif' : 'Hapus Garis'}
                  </span>
                </label>
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col gap-2.5">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  💡 <b>Hierarki Mutlak Admin:</b> Urutan nomor anak sesuai urutan pengetikan koma (<code className="text-emerald-400">,</code>) dan langsung tampil berurutan berdekatan tanpa garis menyilang.
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
                  <label className="block text-slate-300 font-semibold mb-1">
                    1. Orbit 1: Anak Uyut / Kakek (Contoh: Kakek 1, Kakek 2, Kakek 3)
                  </label>
                  <input
                    type="text"
                    value={batchKakek}
                    onChange={e => setBatchKakek(e.target.value)}
                    placeholder="Contoh: Kakek 1, Kakek 2, Kakek 3"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    2. Orbit 2: Anak Kakek 2 / Ayah, Paman, Bibi (Contoh: No. 1 s/d 10)
                  </label>
                  <input
                    type="text"
                    value={batchAyah}
                    onChange={e => setBatchAyah(e.target.value)}
                    placeholder="Contoh: Uwa 1, Ayah 2, Paman 3, Bibi 4, Paman 5, Bibi 6, Paman 7, Bibi 8, Paman 9, Bibi 10"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="p-2.5 bg-sky-950/40 rounded-lg border border-sky-500/30">
                  <label className="block text-sky-300 font-bold mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    3. Orbit 3: Anak Ayah 2 / User &amp; Saudara (Contoh: No. 1 s/d 6)
                  </label>
                  <input
                    type="text"
                    value={batchUserSaudara}
                    onChange={e => setBatchUserSaudara(e.target.value)}
                    placeholder="Contoh: Kakak 1, Kakak 2, Hendriana (User No. 3), Adik 4, Adik 5, Adik 6"
                    className="w-full bg-slate-800 border border-sky-500/50 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    4. Orbit 4: Anak dari User (Contoh: No. 1 s/d 3)
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
                🚀 Terapkan Silsilah Mutlak ke Orbit
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
