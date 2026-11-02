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
  Sparkles
} from 'lucide-react';

export interface OrbitNode {
  id: string;
  name: string;
  gen: number; // -3: Uyut (Pusat), -2: Kakek (Orbit 1), -1: Ayah (Orbit 2), 0: User & Saudara (Orbit 3), 1: Anak (Orbit 4), 2: Cucu (Orbit 5), 3: Cicit (Orbit 6)
  order: string;
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  claimed: boolean;
  gender?: 'L' | 'P';
  role?: string;
  isUser?: boolean;
  relationType?: 'user' | 'kakak' | 'adik' | 'pasangan' | 'saudara' | 'leluhur' | 'keturunan';
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

// -------------------------------------------------------------
// DEFAULT DATA DENGAN SUSUNAN 6 ORBIT GENERASI RESMI
// Pusat: Uyut -> Orbit 1: Kakek -> Orbit 2: Ayah -> Orbit 3: User & Saudara -> Orbit 4: Anak -> Orbit 5: Cucu -> Orbit 6: Cicit
// -------------------------------------------------------------
const DEFAULT_TREE_DATA: OrbitTreeData = {
  quadrants: {
    Q1: { name: "Trah Ayah User (Kiri-Atas)", color: "#3b82f6", center: { x: -580, y: -520 } },
    Q2: { name: "Trah Ibu User (Kanan-Atas)", color: "#10b981", center: { x: 580, y: -520 } },
    Q3: { name: "Trah Ayah Pasangan (Kiri-Bawah)", color: "#f43f5e", center: { x: -580, y: 520 } },
    Q4: { name: "Trah Ibu Pasangan (Kanan-Bawah)", color: "#a855f7", center: { x: 580, y: 520 } }
  },
  nodes: [
    // ==========================================
    // TRAH AYAH USER (Q1) - LENGKAP 6 TINGKAT ORBIT
    // ==========================================
    // 0. Pusat Kuadran: Uyut
    { id: "q1_uyut", name: "Uyut Kyai Abdul Ghani", gen: -3, order: "1 dari 2", quadrant: "Q1", claimed: true, role: "Uyut / Tokoh Pesantren" },
    // 1. Orbit 1: Kakek
    { id: "q1_kakek", name: "Abah Karta", gen: -2, order: "1 dari 4", quadrant: "Q1", claimed: true, role: "Kakek (Abah Paternal)" },
    // 2. Orbit 2: Ayah / Paman / Bibi
    { id: "q1_ayah", name: "Bapak / Paman Cilimus", gen: -1, order: "1 dari 3", quadrant: "Q1", claimed: true, role: "Ayah Kandung" },
    { id: "q1_uwa", name: "Uwa Suharja", gen: -1, order: "2 dari 3", quadrant: "Q1", claimed: true, role: "Uwa Paternal" },
    // 3. Orbit 3: User dan Saudara (Poros Utama Gen 0)
    { id: "q1_user", name: "Hendriana (User)", gen: 0, order: "Anak ke-3 dari 6", quadrant: "Q1", claimed: true, role: "User / Poros Silsilah", isUser: true, relationType: "user" },
    { id: "q1_sib1", name: "Kang Asep", gen: 0, order: "Anak ke-1", quadrant: "Q1", claimed: true, role: "Kakak Sulung", relationType: "kakak" },
    { id: "q1_sib2", name: "Teh Rina", gen: 0, order: "Anak ke-2", quadrant: "Q1", claimed: true, role: "Kakak Kedua", relationType: "kakak" },
    { id: "q1_sib3", name: "Dede Supriatna", gen: 0, order: "Anak ke-4", quadrant: "Q1", claimed: true, role: "Adik Pertama", relationType: "adik" },
    { id: "q1_sib4", name: "Budi Pratama", gen: 0, order: "Anak ke-5", quadrant: "Q1", claimed: false, role: "Adik Kedua", relationType: "adik" },
    { id: "q1_sib5", name: "Neng Lilis", gen: 0, order: "Anak ke-6", quadrant: "Q1", claimed: false, role: "Adik Bungsu", relationType: "adik" },
    // 4. Orbit 4: Anak
    { id: "q1_anak1", name: "Rizky Al-Fathir", gen: 1, order: "1 dari 2", quadrant: "Q1", claimed: true, role: "Anak Sulung" },
    { id: "q1_anak2", name: "Nabila Zahra", gen: 1, order: "2 dari 2", quadrant: "Q1", claimed: true, role: "Anak Bungsu" },
    // 5. Orbit 5: Cucu
    { id: "q1_cucu1", name: "Cucu Pertama Rizky", gen: 2, order: "1 dari 2", quadrant: "Q1", claimed: false, role: "Cucu Generasi A" },
    { id: "q1_cucu2", name: "Cucu Kedua Nabila", gen: 2, order: "2 dari 2", quadrant: "Q1", claimed: false, role: "Cucu Generasi B" },
    // 6. Orbit 6: Cicit (Terluar)
    { id: "q1_cicit1", name: "Cicit Alfa", gen: 3, order: "1 dari 2", quadrant: "Q1", claimed: false, role: "Cicit Terluar 1" },
    { id: "q1_cicit2", name: "Cicit Beta", gen: 3, order: "2 dari 2", quadrant: "Q1", claimed: false, role: "Cicit Terluar 2" },

    // ==========================================
    // TRAH IBU USER (Q2)
    // ==========================================
    { id: "q2_uyut", name: "Uyut H. Hasan Sulaeman", gen: -3, order: "1 dari 1", quadrant: "Q2", claimed: true, role: "Uyut Maternal" },
    { id: "q2_kakek", name: "Abah Suryana", gen: -2, order: "1 dari 3", quadrant: "Q2", claimed: true, role: "Kakek (Abah Maternal)" },
    { id: "q2_ayah", name: "Emak Siti Maryam", gen: -1, order: "1 dari 4", quadrant: "Q2", claimed: true, role: "Ibu Kandung" },
    { id: "q2_user", name: "Hendriana (Jalur Ibu)", gen: 0, order: "Anak Kandung", quadrant: "Q2", claimed: true, role: "User (Trah Ibu)" },
    { id: "q2_sepupu", name: "Sepupu Maternal A", gen: 0, order: "Sepupu", quadrant: "Q2", claimed: false, role: "Saudara Sepupu" },
    { id: "q2_anak", name: "Rizky & Nabila (Cucu Ibu)", gen: 1, order: "1 dari 2", quadrant: "Q2", claimed: true, role: "Anak" },
    { id: "q2_cucu", name: "Cucu Maternal X", gen: 2, order: "1 dari 3", quadrant: "Q2", claimed: false, role: "Cucu" },
    { id: "q2_cicit", name: "Cicit Maternal Y", gen: 3, order: "1 dari 10", quadrant: "Q2", claimed: false, role: "Cicit Terluar" },

    // ==========================================
    // TRAH AYAH PASANGAN (Q3)
    // ==========================================
    { id: "q3_uyut", name: "Uyut Besan Paternal", gen: -3, order: "1 dari 2", quadrant: "Q3", claimed: true, role: "Uyut Besan" },
    { id: "q3_kakek", name: "Kakek Mertua Paternal", gen: -2, order: "1 dari 2", quadrant: "Q3", claimed: false, role: "Kakek Mertua" },
    { id: "q3_ayah", name: "Bapak Mertua", gen: -1, order: "1 dari 3", quadrant: "Q3", claimed: true, role: "Ayah Mertua" },
    { id: "q3_pasangan", name: "Siti Nurhaliza (Pasangan)", gen: 0, order: "Anak ke-1", quadrant: "Q3", claimed: true, role: "Istri / Pasangan" },
    { id: "q3_ipar", name: "Saudara Ipar (Adik Pasangan)", gen: 0, order: "Anak ke-2", quadrant: "Q3", claimed: false, role: "Saudara Ipar" },
    { id: "q3_anak", name: "Rizky & Nabila", gen: 1, order: "1 dari 2", quadrant: "Q3", claimed: true, role: "Anak" },
    { id: "q3_cucu", name: "Cucu Mertua", gen: 2, order: "1 dari 2", quadrant: "Q3", claimed: false, role: "Cucu" },
    { id: "q3_cicit", name: "Cicit Mertua", gen: 3, order: "1 dari 5", quadrant: "Q3", claimed: false, role: "Cicit" },

    // ==========================================
    // TRAH IBU PASANGAN (Q4)
    // ==========================================
    { id: "q4_uyut", name: "Uyut Besan Maternal", gen: -3, order: "1 dari 2", quadrant: "Q4", claimed: true, role: "Uyut Besan" },
    { id: "q4_kakek", name: "Nenek Mertua Maternal", gen: -2, order: "1 dari 2", quadrant: "Q4", claimed: false, role: "Nenek Mertua" },
    { id: "q4_ayah", name: "Ibu Mertua", gen: -1, order: "1 dari 3", quadrant: "Q4", claimed: true, role: "Ibu Mertua" },
    { id: "q4_pasangan", name: "Siti Nurhaliza (Jalur Ibu Mertua)", gen: 0, order: "Anak", quadrant: "Q4", claimed: true, role: "Pasangan" },
    { id: "q4_anak", name: "Rizky & Nabila", gen: 1, order: "1 dari 2", quadrant: "Q4", claimed: true, role: "Anak" },
    { id: "q4_cucu", name: "Cucu Ibu Mertua", gen: 2, order: "1 dari 2", quadrant: "Q4", claimed: false, role: "Cucu" },
    { id: "q4_cicit", name: "Cicit Ibu Mertua", gen: 3, order: "1 dari 5", quadrant: "Q4", claimed: false, role: "Cicit" }
  ]
};

const DEFAULT_LOGS: LedgerLog[] = [
  { id: "log-1", time: "System Init", action: "Arsitektur 6 Orbit", text: "Susunan Baru: Uyut (Pusat) -> Kakek (Orbit 1) -> Ayah (Orbit 2) -> User & Saudara (Orbit 3) -> Anak (Orbit 4) -> Cucu (Orbit 5) -> Cicit (Orbit 6 Terluar) aktif." },
  { id: "log-2", time: "08:00", action: "Garis Hierarki Orbit", text: "Garis konektor diperbarui mengikuti urutan orbit bertingkat (parent-to-child) tanpa memotong sembarangan ke pusat." }
];

interface OrbitQuViewProps {
  onBackToLeluhurQu?: () => void;
  showNotification?: (msg: string) => void;
}

export const OrbitQuView: React.FC<OrbitQuViewProps> = ({
  onBackToLeluhurQu,
  showNotification
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tree & Ledger State (Persisted)
  const [familyTree, setFamilyTree] = useState<OrbitTreeData>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_orbitqu_tree_v3');
      return saved ? JSON.parse(saved) : DEFAULT_TREE_DATA;
    } catch {
      return DEFAULT_TREE_DATA;
    }
  });

  const [logs, setLogs] = useState<LedgerLog[]>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_orbitqu_logs_v3');
      return saved ? JSON.parse(saved) : DEFAULT_LOGS;
    } catch {
      return DEFAULT_LOGS;
    }
  });

  // Modals
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showSiblingsModal, setShowSiblingsModal] = useState(false);

  // Selected Node for Edit Modal
  const [selectedNode, setSelectedNode] = useState<OrbitNode | null>(null);

  // Form State for Batch Quick-Input: Sesuai Urutan 6 Orbit
  const [batchQuadrant, setBatchQuadrant] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [batchUyut, setBatchUyut] = useState('');
  const [batchKakek, setBatchKakek] = useState('');
  const [batchAyah, setBatchAyah] = useState('');
  const [batchUserSaudara, setBatchUserSaudara] = useState('');
  const [batchAnak, setBatchAnak] = useState('');
  const [batchCucu, setBatchCucu] = useState('');
  const [batchCicit, setBatchCicit] = useState('');

  // Sibling Quick-Add into Orbit 3
  const [newSiblingName, setNewSiblingName] = useState('');
  const [newSiblingRole, setNewSiblingRole] = useState<'kakak' | 'adik'>('kakak');
  const [newSiblingGender, setNewSiblingGender] = useState<'L' | 'P'>('L');

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
      localStorage.setItem('wargaqu_orbitqu_tree_v3', JSON.stringify(familyTree));
    } catch (e) {
      console.error(e);
    }
  }, [familyTree]);

  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_orbitqu_logs_v3', JSON.stringify(logs));
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
      "-3": 0,    // Pusat Kuadran: Uyut / Aki
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
          // Uyut tepat di titik pusat kuadran
          node._renderX = qCenter.x;
          node._renderY = qCenter.y;
        } else {
          // Melingkar harmonis pada cincin orbitnya
          const angleStep = (Math.PI * 2) / list.length;
          // Offset sedikit agar sudut tidak saling bertumpuk langsung antar generasi
          const angleOffset = (parseInt(genStr, 10) + 3) * 0.25;
          const angle = index * angleStep + angleOffset;
          node._renderX = qCenter.x + radius * Math.cos(angle);
          node._renderY = qCenter.y + radius * Math.sin(angle);
        }
      });
    });
  };

  // Helper untuk mencari node terdekat di orbit sebelumnya (konektor garis hierarki)
  const findNearestParent = (target: OrbitNode, candidates: OrbitNode[]): OrbitNode | null => {
    if (!candidates || candidates.length === 0) return null;
    let nearest = candidates[0];
    let minDist = Infinity;
    for (const c of candidates) {
      if (c._renderX === undefined || c._renderY === undefined) continue;
      const dx = (target._renderX ?? 0) - c._renderX;
      const dy = (target._renderY ?? 0) - c._renderY;
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

    // Titik bintang latar belakang kosmos
    ctx.fillStyle = "#1e293b25";
    for (let gx = -1400; gx <= 1400; gx += 160) {
      for (let gy = -1200; gy <= 1200; gy += 160) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // =========================================================
    // 1. CINCIN 6 ORBIT TIAP KUADRAN (EXPANSION RINGS)
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
          // Highlight Orbit 3: User dan Saudara dengan cahaya khusus
          ctx.strokeStyle = "#38bdf866";
          ctx.lineWidth = 2.2;
          ctx.setLineDash([6, 4]);
        } else if (ring.isOuter) {
          // Orbit 6 Cicit Terluar
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

        // Label cincin orbit
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

      // Quadrant Header Title
      ctx.font = "bold 16px sans-serif";
      ctx.fillStyle = q.color;
      ctx.textAlign = "center";
      ctx.fillText(q.name, q.center.x, q.center.y - 495);
    });

    // =========================================================
    // 2. GARIS KONEKTOR HIERARKI: BERTAHAP SESUAI URUTAN ORBIT!
    // Uyut (Pusat) -> Kakek (O1) -> Ayah (O2) -> User&Saudara (O3) -> Anak (O4) -> Cucu (O5) -> Cicit (O6)
    // Tidak ada lagi garis yang langsung memotong ke pusat (0,0)
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
        ctx.strokeStyle = isClaimed ? `${q.color}90` : `${q.color}35`;
        ctx.lineWidth = isClaimed ? 1.6 : 1.1;
        ctx.stroke();
      };

      // A. Pusat (Uyut) -> Orbit 1 (Kakek)
      kakekList.forEach(kakek => {
        if (kakek._renderX !== undefined && kakek._renderY !== undefined) {
          const parentUyut = uyutList[0];
          const startX = parentUyut?._renderX ?? q.center.x;
          const startY = parentUyut?._renderY ?? q.center.y;
          drawStepLine(startX, startY, kakek._renderX, kakek._renderY, kakek.claimed);
        }
      });

      // B. Orbit 1 (Kakek) -> Orbit 2 (Ayah/Paman)
      ayahList.forEach(ayah => {
        if (ayah._renderX !== undefined && ayah._renderY !== undefined) {
          const parentKakek = findNearestParent(ayah, kakekList) || kakekList[0];
          if (parentKakek && parentKakek._renderX !== undefined && parentKakek._renderY !== undefined) {
            drawStepLine(parentKakek._renderX, parentKakek._renderY, ayah._renderX, ayah._renderY, ayah.claimed);
          }
        }
      });

      // C. Orbit 2 (Ayah) -> Orbit 3 (User dan Saudara)
      userSaudaraList.forEach(person => {
        if (person._renderX !== undefined && person._renderY !== undefined) {
          const parentAyah = findNearestParent(person, ayahList) || ayahList[0];
          if (parentAyah && parentAyah._renderX !== undefined && parentAyah._renderY !== undefined) {
            drawStepLine(parentAyah._renderX, parentAyah._renderY, person._renderX, person._renderY, person.claimed);
          }
        }
      });

      // D. Orbit 3 (User & Saudara) -> Orbit 4 (Anak)
      anakList.forEach(anak => {
        if (anak._renderX !== undefined && anak._renderY !== undefined) {
          const parentUser = findNearestParent(anak, userSaudaraList) || userSaudaraList[0];
          if (parentUser && parentUser._renderX !== undefined && parentUser._renderY !== undefined) {
            drawStepLine(parentUser._renderX, parentUser._renderY, anak._renderX, anak._renderY, anak.claimed);
          }
        }
      });

      // E. Orbit 4 (Anak) -> Orbit 5 (Cucu)
      cucuList.forEach(cucu => {
        if (cucu._renderX !== undefined && cucu._renderY !== undefined) {
          const parentAnak = findNearestParent(cucu, anakList) || anakList[0];
          if (parentAnak && parentAnak._renderX !== undefined && parentAnak._renderY !== undefined) {
            drawStepLine(parentAnak._renderX, parentAnak._renderY, cucu._renderX, cucu._renderY, cucu.claimed);
          }
        }
      });

      // F. Orbit 5 (Cucu) -> Orbit 6 (Cicit)
      cicitList.forEach(cicit => {
        if (cicit._renderX !== undefined && cicit._renderY !== undefined) {
          const parentCucu = findNearestParent(cicit, cucuList) || cucuList[0];
          if (parentCucu && parentCucu._renderX !== undefined && parentCucu._renderY !== undefined) {
            drawStepLine(parentCucu._renderX, parentCucu._renderY, cicit._renderX, cicit._renderY, cicit.claimed);
          }
        }
      });
    });

    // =========================================================
    // 3. JALUR PENGHUBUNG ANTAR KUADRAN PADA ORBIT 3 (USER & PASANGAN)
    // =========================================================
    const userNodes = familyTree.nodes.filter(n => n.gen === 0 && (n.isUser || n.name.includes("User")));
    if (userNodes.length > 0) {
      // Pusat poros koordinat tengah (0,0)
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

      // Hubungkan garis poros kuadran ke pusat titik tengah
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
    // 4. NODES ANGGOTA KELUARGA (BERDASARKAN TINGKAT ORBIT)
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

      // Ukuran Radius Node
      let radius = 18;
      if (isUyut) radius = 24;
      else if (isUserEgo) radius = 24;
      else if (isUserSaudara) radius = 19;
      else if (isKakek || isAyah) radius = 18;
      else if (isAnak) radius = 17;
      else if (isCucu) radius = 16;
      else if (isCicit) radius = 15;

      // Warna Node
      let nodeColor = "#334155";
      let borderColor = "#0f172a";

      if (isUyut) {
        nodeColor = "#eab308"; // Kuning Emas Uyut
        borderColor = "#fef08a";
      } else if (isUserEgo) {
        nodeColor = "#0284c7"; // Biru Langit User
        borderColor = "#38bdf8";
      } else if (isUserSaudara) {
        nodeColor = node.claimed ? "#0d9488" : "#334155"; // Teal Saudara
        borderColor = node.claimed ? "#2dd4bf" : "#64748b";
      } else if (node.claimed) {
        nodeColor = "#10b981"; // Hijau Verified
        borderColor = "#6ee7b7";
      }

      // Draw Node Circle
      ctx.beginPath();
      ctx.arc(node._renderX, node._renderY, radius, 0, Math.PI * 2);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = isUyut || isUserEgo ? 3.5 : 2;
      ctx.stroke();

      ctx.save();
      ctx.translate(node._renderX, node._renderY);

      // Icon Center
      let icon = "?";
      if (isUyut) icon = "👑";
      else if (isUserEgo) icon = "👤";
      else if (isUserSaudara) icon = node.relationType === 'kakak' ? "🔺" : (node.relationType === 'adik' ? "🔻" : "👥");
      else if (node.claimed) icon = "✓";

      ctx.font = isUyut || isUserEgo ? "bold 12px sans-serif" : "11px sans-serif";
      ctx.fillStyle = isUyut ? "#0f172a" : "#ffffff";
      ctx.textAlign = "center";
      ctx.fillText(icon, 0, 4);

      // Label Nama Anggota
      ctx.font = isUserEgo ? "bold 12px sans-serif" : "bold 11px sans-serif";
      ctx.fillStyle = isUserEgo ? "#38bdf8" : "#f8fafc";
      ctx.fillText(node.name, 0, 30);

      // Label Urutan & Orbit
      let orbitLabel = "";
      if (isUyut) orbitLabel = "Pusat Kuadran (Uyut)";
      else if (isKakek) orbitLabel = "Orbit 1 (Kakek)";
      else if (isAyah) orbitLabel = "Orbit 2 (Ayah/Paman)";
      else if (isUserSaudara) orbitLabel = isUserEgo ? "Orbit 3: USER (Ego)" : "Orbit 3: Saudara";
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
  // MOUSE & TOUCH GESTURES (PAN & PINCH-TO-ZOOM)
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

  // Click Detection
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

    // Check click on any node
    for (const node of familyTree.nodes) {
      if (node._renderX !== undefined && node._renderY !== undefined) {
        const dx = worldX - node._renderX;
        const dy = worldY - node._renderY;
        const radius = node.gen === -3 || node.isUser ? 25 : 20;
        if (Math.sqrt(dx * dx + dy * dy) <= radius + 5) {
          setSelectedNode(node);
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
    // Cari node User di Orbit 3
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
  // BATCH QUICK-INPUT (SESUAI SUSUNAN BARU 6 ORBIT)
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

    // 0. Pusat Kuadran: Uyut
    processBatch(batchUyut, -3, 'Uyut / Aki (Pusat Kuadran)');
    // 1. Orbit 1: Kakek
    processBatch(batchKakek, -2, 'Kakek / Abah (Orbit 1)');
    // 2. Orbit 2: Ayah / Paman / Bibi
    processBatch(batchAyah, -1, 'Ayah / Paman (Orbit 2)');
    // 3. Orbit 3: User & Saudara (Gen 0)
    processBatch(batchUserSaudara, 0, 'Saudara Kandung / Tiri (Orbit 3)', true);
    // 4. Orbit 4: Anak / Sepupu
    processBatch(batchAnak, 1, 'Anak (Orbit 4)');
    // 5. Orbit 5: Cucu
    processBatch(batchCucu, 2, 'Cucu (Orbit 5)');
    // 6. Orbit 6: Cicit (Terluar)
    processBatch(batchCicit, 3, 'Cicit (Orbit 6 Terluar)');

    addLog('Batch Quick-Input', `Memasukkan silsilah massal ke kuadran ${batchQuadrant} sesuai susunan 6 orbit bertingkat.`);

    setFamilyTree(prev => ({
      ...prev,
      nodes: newNodes
    }));

    // Reset Inputs
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

  // -------------------------------------------------------------
  // SAVE / EDIT / CLAIM NODE
  // -------------------------------------------------------------
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;

    setFamilyTree(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === selectedNode.id
          ? {
              ...n,
              name: selectedNode.name,
              order: selectedNode.order,
              claimed: selectedNode.claimed,
              role: selectedNode.role
            }
          : n
      )
    }));

    addLog('Klaim / Edit Profil', `Profil ${selectedNode.name} diperbarui [Status: ${selectedNode.claimed ? 'Terverifikasi' : 'Belum Diklaim'}]`);
    setShowEditModal(false);
    setSelectedNode(null);
    showNotification?.('Perubahan profil berhasil disimpan!');
    renderCanvas();
  };

  // Delete node
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

  // Tambah Saudara Langsung ke Orbit 3
  const handleAddDirectSibling = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSiblingName.trim()) return;

    const existingInOrbit3 = familyTree.nodes.filter(n => n.gen === 0 && n.quadrant === 'Q1');
    const newSib: OrbitNode = {
      id: 'sib_' + Date.now(),
      name: newSiblingName.trim(),
      gen: 0, // Orbit 3
      order: `Anak ke-${existingInOrbit3.length + 1}`,
      quadrant: 'Q1',
      claimed: true,
      gender: newSiblingGender,
      role: newSiblingRole === 'kakak' ? 'Kakak Kandung' : 'Adik Kandung',
      relationType: newSiblingRole
    };

    setFamilyTree(prev => ({
      ...prev,
      nodes: [...prev.nodes, newSib]
    }));

    addLog('Orbit 3 Saudara', `Menambahkan ${newSib.name} (${newSib.role}) ke Orbit 3`);
    setNewSiblingName('');
    setShowSiblingsModal(false);
    showNotification?.(`${newSib.name} ditambahkan ke Orbit 3 (User & Saudara)!`);
    renderCanvas();
  };

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
                6 Orbit Bertingkat
              </span>
            </div>
            <p className="text-[9px] text-slate-400 truncate max-w-[150px] sm:max-w-none">
              Pusat Uyut $\rightarrow$ O1 Kakek $\rightarrow$ O2 Ayah $\rightarrow$ O3 User/Saudara $\rightarrow$ O4 Anak $\rightarrow$ O5 Cucu $\rightarrow$ O6 Cicit
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

        {/* FLOATING NAVIGATION (ZOOM, GPS, SIBLINGS QUICK ADD) */}
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
          <button
            onClick={() => setShowSiblingsModal(true)}
            className="h-8 px-2 bg-sky-700/80 border border-sky-400/30 rounded-xl flex items-center justify-center text-[10px] font-bold shadow hover:bg-sky-600 active:scale-95 transition gap-1 text-white"
            title="Kelola Saudara di Orbit 3"
          >
            <Users className="w-3.5 h-3.5 text-sky-200" />
            <span>+ Saudara (Orbit 3)</span>
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
            Orbit 1 (Kakek) $\rightarrow$ Orbit 2 (Ayah) $\rightarrow$ <b className="text-sky-300">Orbit 3 (User &amp; Saudara)</b> $\rightarrow$ Orbit 4 (Anak) $\rightarrow$ Orbit 5 (Cucu) $\rightarrow$ <b className="text-emerald-300">Orbit 6 (Cicit Terluar)</b>
          </div>
          <div className="text-[9px] text-slate-400 border-t border-slate-800 pt-1">
            Garis konektor bertingkat antar orbit generasi (tanpa garis silang ke pusat).
          </div>
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL BATCH QUICK INPUT (6 ORBIT BERTINGKAT)                   */}
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
              {/* KUADRAN TRAH TUJUAN */}
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

              {/* 6 ORBIT GENERASI BERTINGKAT DARI PUSAT KE LUAR */}
              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/50 flex flex-col gap-2.5">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  💡 <b>Urutan Orbit Dari Dalam ke Luar:</b> Pisahkan nama dengan koma (<code className="text-emerald-400">,</code>).
                </p>

                {/* PUSAT */}
                <div>
                  <label className="block text-amber-300 font-bold mb-1">
                    0. Pusat Kuadran: Uyut / Aki
                  </label>
                  <input
                    type="text"
                    value={batchUyut}
                    onChange={e => setBatchUyut(e.target.value)}
                    placeholder="Contoh: Uyut Kyai Abdul Ghani"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* ORBIT 1 */}
                <div>
                  <label className="block text-slate-400 mb-1">
                    1. Orbit 1: Kakek / Abah
                  </label>
                  <input
                    type="text"
                    value={batchKakek}
                    onChange={e => setBatchKakek(e.target.value)}
                    placeholder="Contoh: Abah Karta, Kakek 2"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* ORBIT 2 */}
                <div>
                  <label className="block text-slate-400 mb-1">
                    2. Orbit 2: Ayah / Paman / Bibi
                  </label>
                  <input
                    type="text"
                    value={batchAyah}
                    onChange={e => setBatchAyah(e.target.value)}
                    placeholder="Contoh: Bapak, Uwa Suharja, Mang Dede"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* ORBIT 3 - USER & SAUDARA */}
                <div className="p-2.5 bg-sky-950/40 rounded-lg border border-sky-500/30">
                  <label className="block text-sky-300 font-bold mb-1 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    3. Orbit 3: User dan Saudara (Kakak &amp; Adik)
                  </label>
                  <input
                    type="text"
                    value={batchUserSaudara}
                    onChange={e => setBatchUserSaudara(e.target.value)}
                    placeholder="Contoh: Hendriana (User), Kang Asep, Teh Rina, Dede"
                    className="w-full bg-slate-800 border border-sky-500/50 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-sky-400"
                  />
                </div>

                {/* ORBIT 4 */}
                <div>
                  <label className="block text-slate-400 mb-1">
                    4. Orbit 4: Anak / Sepupu
                  </label>
                  <input
                    type="text"
                    value={batchAnak}
                    onChange={e => setBatchAnak(e.target.value)}
                    placeholder="Contoh: Rizky Al-Fathir, Nabila Zahra"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* ORBIT 5 */}
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

                {/* ORBIT 6 */}
                <div>
                  <label className="block text-emerald-400 font-bold mb-1">
                    6. Orbit 6 (Terluar - Ekspansi Masif): Cicit
                  </label>
                  <input
                    type="text"
                    value={batchCicit}
                    onChange={e => setBatchCicit(e.target.value)}
                    placeholder="Contoh: Cicit 1, Cicit 2, Cicit 3, dst"
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
      {/* MODAL EDIT / KLAIM PROFIL                                      */}
      {/* ------------------------------------------------------------- */}
      {showEditModal && selectedNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedNode.isUser ? 'bg-sky-600' : selectedNode.gen === 0 ? 'bg-teal-600' : 'bg-emerald-600'}`}>
                  <Edit3 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-emerald-400">
                    {selectedNode.isUser
                      ? '👤 Profil User (Orbit 3)'
                      : selectedNode.gen === 0
                      ? '👥 Profil Saudara (Orbit 3)'
                      : selectedNode.gen === -3
                      ? '👑 Pusat Kuadran (Uyut)'
                      : '👤 Lengkapi / Klaim Profil'}
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

              <div>
                <label className="block text-slate-400 mb-1">Keterangan / Urutan Kelahiran</label>
                <input
                  type="text"
                  value={selectedNode.order}
                  onChange={e => setSelectedNode({ ...selectedNode, order: e.target.value })}
                  placeholder="Contoh: Anak ke-2 dari 6"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Gelar / Peran Silsilah</label>
                <input
                  type="text"
                  value={selectedNode.role || ''}
                  onChange={e => setSelectedNode({ ...selectedNode, role: e.target.value })}
                  placeholder="Contoh: Kakak Sulung, Kakek, Uyut"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNode.claimed}
                    onChange={e => setSelectedNode({ ...selectedNode, claimed: e.target.checked })}
                    className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                  />
                  <span>Tandai Profil Sudah Diklaim / Lengkap</span>
                </label>
              </div>

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
      {/* MODAL KELOLA SAUDARA DI ORBIT 3                                */}
      {/* ------------------------------------------------------------- */}
      {showSiblingsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3 max-h-[85vh] text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-sky-600/30 text-sky-400 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-sky-400">Orbit 3: User dan Saudara</h3>
                  <p className="text-[10px] text-slate-400">Saudara kandung &amp; tiri berada di Orbit 3</p>
                </div>
              </div>
              <button
                onClick={() => setShowSiblingsModal(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List Existing Siblings in Orbit 3 */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-2 max-h-56">
              {familyTree.nodes.filter(n => n.gen === 0).map((sib, i) => (
                <div
                  key={sib.id}
                  className="p-2.5 bg-slate-800/70 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full ${sib.isUser ? 'bg-sky-500 text-slate-950' : 'bg-teal-700 text-white'} flex items-center justify-center text-[10px] font-bold`}>
                      {sib.isUser ? 'U' : i + 1}
                    </div>
                    <div>
                      <span className="font-bold text-slate-100 block">{sib.name}</span>
                      <span className="text-[10px] text-sky-300 font-mono">
                        {sib.order} • {sib.role || 'Orbit 3'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowSiblingsModal(false);
                      setSelectedNode(sib);
                      setShowEditModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-sky-300 rounded-lg hover:bg-slate-700 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Form Tambah Saudara Langsung */}
            <form onSubmit={handleAddDirectSibling} className="pt-2 border-t border-slate-800 space-y-2 text-xs">
              <span className="font-bold text-slate-300 text-[11px] block">
                + Tambah Saudara Baru ke Orbit 3:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newSiblingName}
                  onChange={e => setNewSiblingName(e.target.value)}
                  placeholder="Nama saudara..."
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-sky-400"
                />
                <select
                  value={newSiblingRole}
                  onChange={e => setNewSiblingRole(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none"
                >
                  <option value="kakak">Kakak</option>
                  <option value="adik">Adik</option>
                </select>
                <select
                  value={newSiblingGender}
                  onChange={e => setNewSiblingGender(e.target.value as any)}
                  className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none"
                >
                  <option value="L">L</option>
                  <option value="P">P</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2 rounded-lg transition active:scale-98"
              >
                Tambahkan ke Orbit 3
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
                    Riwayat penataan silsilah 6 orbit &amp; hubungan generasi
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
                {logs.length} catatan aktivitas tersimpan
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
