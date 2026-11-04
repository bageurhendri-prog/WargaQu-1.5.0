import React, { useEffect, useRef, useState, useMemo } from 'react';
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
  Compass,
  Move,
  Save,
  Image as ImageIcon,
  MapPin,
  Calendar,
  AlertTriangle,
  Hexagon,
  Square,
  Circle,
  Upload,
  Sun,
  Moon,
  Network,
  Layers,
  GitMerge,
  ArrowUp,
  ArrowDown,
  Share2
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
  customAngle?: number; // Sudut fleksibel yang bisa digeser bebas di garis orbit rasi bintang
  birthYear?: string;
  deathYear?: string;
  status?: 'Hidup' | 'Almarhum';
  origin?: string; // Alamat / Kota Asal
  photoUrl?: string; // URL Foto atau base64 foto
  frameShape?: 'circle' | 'square' | 'hexagon'; // Bentuk frame profil
  notes?: string;
  _renderX?: number;
  _renderY?: number;
  _spouseX?: number;
  _spouseY?: number;
  _angle?: number;
  _radius?: number;
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
// DATA & STRUKTUR NOTASI BATCH (UNIVERSAL ID & BOUNDING BOX ENGINE)
// ----------------------------------------------------------------------------
export interface BatchFamilyItem {
  id: string; // e.g. "0", "0.1", "0.1.1", "0.1.1.1"
  name: string;
  role?: string;
  isUser?: boolean;
  gender?: 'L' | 'P';
  originalNodeId?: string;
}

export interface BatchTreeNode extends BatchFamilyItem {
  children: BatchTreeNode[];
  width: number;
  x: number;
  y: number;
}

// 1. DATA SILSILAH BERBASIS BATCH DOT NOTATION (Universal ID - Kode Pengguna)
// Mendukung lengkap 5 Generasi & Urutan Anak 1, 2, 3, 4, 5, 6, 7 dst: Uyut -> Kakek -> Ayah -> Anak (1-7) -> Cucu
export const DEFAULT_BATCH_FAMILY_DATA: BatchFamilyItem[] = [
  { id: "0", name: "Uyut (Akar)", role: "Akar Leluhur (Gen 0)", gender: "L" },
  { id: "0.1", name: "Kakek A (Sulung)", role: "Kakek Sulung (Gen 1)", gender: "L" },
  { id: "0.2", name: "Kakek B (Bontot)", role: "Kakek Bungsu (Gen 1)", gender: "L" },
  { id: "0.1.1", name: "Ayah (Anak 7 Cucu)", role: "Ayah Kandung (Gen 2)", gender: "L" },
  { id: "0.1.2", name: "Paman A", role: "Paman (Gen 2)", gender: "L" },
  { id: "0.2.1", name: "Bibi (Single)", role: "Bibi (Gen 2)", gender: "P" },
  { id: "0.1.1.1", name: "User (Kang Hendri)", role: "Anak ke-1 (Sulung - Ego)", isUser: true, gender: "L" },
  { id: "0.1.1.2", name: "Adik 1", role: "Anak ke-2", gender: "L" },
  { id: "0.1.1.3", name: "Adik 2", role: "Anak ke-3", gender: "P" },
  { id: "0.1.1.4", name: "Adik 3", role: "Anak ke-4", gender: "L" },
  { id: "0.1.1.5", name: "Adik 4", role: "Anak ke-5", gender: "P" },
  { id: "0.1.1.6", name: "Adik 5", role: "Anak ke-6", gender: "L" },
  { id: "0.1.1.7", name: "Adik 6 (Bontot)", role: "Anak ke-7 (Bungsu)", gender: "L" },
  { id: "0.1.1.1.1", name: "Cucu 1 (Putra User)", role: "Cucu ke-1 (Sulung)", gender: "L" },
  { id: "0.1.1.1.2", name: "Cucu 2 (Putri User)", role: "Cucu ke-2 (Bungsu)", gender: "P" }
];

// Config Warna Jalur per Level Generasi
export const BATCH_LEVEL_COLORS: Record<number, string> = {
  0: "#f97316", // Uyut (Oranye)
  1: "#a855f7", // Kakek/Nenek (Ungu)
  2: "#3b82f6", // Ayah/Ibu/Paman (Biru)
  3: "#10b981", // Anak/User (Hijau)
  4: "#06b6d4", // Cucu (Cyan)
  5: "#ec4899"  // Cicit (Pink)
};

// Label Generasi Silsilah (Uyut -> Kakek -> Ayah -> Anak -> Cucu)
export const BATCH_LEVEL_LABELS: Record<number, string> = {
  0: "Uyut",
  1: "Kakek",
  2: "Ayah",
  3: "Anak",
  4: "Cucu",
  5: "Cicit"
};

// Helper konversi data rasi orbit ke Batch Dot Notation
export function convertOrbitNodesToBatchData(
  nodes: OrbitNode[],
  quadrantFilter: 'all' | 'Q1' | 'Q2' | 'Q3' | 'Q4' = 'Q1'
): BatchFamilyItem[] {
  const filtered = quadrantFilter === 'all'
    ? nodes
    : nodes.filter(n => (n.quadrant || 'Q1') === quadrantFilter);

  if (filtered.length === 0) return DEFAULT_BATCH_FAMILY_DATA;

  const idMap = new Map<string, OrbitNode>();
  filtered.forEach(n => idMap.set(n.id, n));

  const childrenMap = new Map<string, OrbitNode[]>();
  const rootNodes: OrbitNode[] = [];

  filtered.forEach(n => {
    if (!n.parentId || !idMap.has(n.parentId) || n.gen === -3) {
      rootNodes.push(n);
    } else {
      if (!childrenMap.has(n.parentId)) {
        childrenMap.set(n.parentId, []);
      }
      childrenMap.get(n.parentId)!.push(n);
    }
  });

  const result: BatchFamilyItem[] = [];

  const assignBatchId = (node: OrbitNode, prefix: string) => {
    result.push({
      id: prefix,
      name: node.name,
      isUser: node.isUser || node.name.includes("User"),
      role: node.role || node.order,
      gender: node.gender,
      originalNodeId: node.id
    });

    const children = childrenMap.get(node.id) || [];
    children.sort((a, b) => {
      const na = parseInt((a.order || '').match(/\d+/)?.[0] || '0', 10);
      const nb = parseInt((b.order || '').match(/\d+/)?.[0] || '0', 10);
      return na - nb;
    });

    children.forEach((child, idx) => {
      assignBatchId(child, `${prefix}.${idx + 1}`);
    });
  };

  rootNodes.forEach((root, rootIdx) => {
    assignBatchId(root, rootIdx === 0 ? "0" : `${rootIdx}`);
  });

  return result.length > 0 ? result : DEFAULT_BATCH_FAMILY_DATA;
}

// 3. KALKULASI KAPLING BEBAS TABRAKAN (BOUNDING BOX & TOPOLOGY MATH ENGINE)
// Mendukung Opsi Struktur: 'paralel' (menyebar), 'seri' (bus rel sirkuit 90°), 'linier' (poros lurus tegas)
export function buildTreeHierarchyEngine(
  data: BatchFamilyItem[],
  direction: 'bottom-up' | 'top-down' = 'bottom-up',
  structureMode: 'paralel' | 'seri' | 'linier' = 'paralel'
) {
  const map: Record<string, BatchTreeNode> = {};
  const roots: BatchTreeNode[] = [];

  data.forEach(item => {
    map[item.id] = { ...item, children: [], width: 0, x: 0, y: 0 };
  });

  data.forEach(item => {
    const parts = item.id.split('.');
    if (parts.length === 1) {
      roots.push(map[item.id]);
    } else {
      const parentId = parts.slice(0, -1).join('.');
      if (map[parentId]) {
        map[parentId].children.push(map[item.id]);
      } else {
        roots.push(map[item.id]);
      }
    }
  });

  // Hitung Lebar Kapling Rekursif (Anti Numpuk)
  function calculateSubtreeWidth(node: BatchTreeNode): number {
    if (!node) return 0;
    const baseNodeWidth = structureMode === 'linier' ? 122 : 132;
    if (node.children.length === 0) {
      node.width = baseNodeWidth;
      return node.width;
    }
    node.width = node.children.reduce((acc, child) => acc + calculateSubtreeWidth(child), 0);
    return Math.max(node.width, baseNodeWidth);
  }

  // Set Koordinat X dan Y Pas untuk setiap mode struktur
  function assignCoordinates(node: BatchTreeNode, startX: number, startY: number, levelGap = 160) {
    if (!node) return;
    const level = node.id.split('.').length - 1;
    node.y = direction === 'bottom-up' ? startY - (level * levelGap) : startY + (level * levelGap);

    if (structureMode === 'linier') {
      // Pada mode linier, posisikan anak terlebih dahulu, lalu luruskan parent sejajar sumbu anak utama (poros nasab lurus)
      let currentX = startX;
      node.children.forEach(child => {
        assignCoordinates(child, currentX, startY, levelGap);
        currentX += child.width;
      });

      // Cari anak poros utama (User atau anak pertama .1)
      const primaryChild = node.children.find(c => c.isUser || c.id.endsWith('.1')) || node.children[0];
      if (primaryChild && node.children.length > 0) {
        node.x = primaryChild.x;
      } else {
        node.x = startX + node.width / 2;
      }
    } else {
      // Mode Paralel & Seri: kapling terbagi seimbang di tengah
      node.x = startX + node.width / 2;

      let currentX = startX;
      node.children.forEach(child => {
        assignCoordinates(child, currentX, startY, levelGap);
        currentX += child.width;
      });
    }
  }

  // Start Y disesuaikan agar 5 tingkat generasi (Uyut - Kakek - Ayah - Anak - Cucu) lega
  const startY = direction === 'bottom-up' ? 1040 : 140;
  let runningX = 100;

  roots.forEach(root => {
    calculateSubtreeWidth(root);
    assignCoordinates(root, runningX, startY);
    runningX += root.width + 70;
  });

  return { roots, totalWidth: Math.max(runningX + 160, 1600), totalHeight: 1280 };
}

// ----------------------------------------------------------------------------
// DATA REAL SESUAI SPESIFIKASI MUTLAK:
// 1 Uyut (Pusat) -> 3 Anak/Kakek (1-3 di Orbit 1)
// Kakek No. 2 punya 10 anak (Ayah/Paman/Bibi 1-10 di Orbit 2)
// Ayah No. 2 punya 6 anak (User & Saudara 1-6 di Orbit 3, User adalah No. 3)
// User No. 3 punya 3 anak (Anak 1-3 di Orbit 4)
// Pasangan User (Siti Nurhaliza) tampil nempel/berdampingan beda warna
// ----------------------------------------------------------------------------
export const CLEAN_REAL_TREE_DATA: OrbitTreeData = {
  quadrants: {
    Q1: { name: "Trah Ayah User (Kiri-Atas)", color: "#38bdf8", center: { x: -620, y: -540 } },
    Q2: { name: "Trah Ibu User (Kanan-Atas)", color: "#34d399", center: { x: 620, y: -540 } },
    Q3: { name: "Trah Ayah Pasangan (Kiri-Bawah)", color: "#fb7185", center: { x: -620, y: 540 } },
    Q4: { name: "Trah Ibu Pasangan (Kanan-Bawah)", color: "#c084fc", center: { x: 620, y: 540 } }
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
      gender: "L",
      role: "Uyut Utama (Pusat Bintang)",
      birthYear: "1910",
      deathYear: "1982",
      status: "Almarhum",
      origin: "Cianjur"
    },

    // 1. Orbit 1: 3 Anak Uyut / Kakek (1, 2, 3)
    {
      id: "kakek_1",
      name: "Kakek 1 (A)",
      gen: -2,
      order: "Anak ke-1",
      quadrant: "Q1",
      claimed: true,
      gender: "L",
      role: "Kakek Sulung",
      parentId: "uyut_1",
      birthYear: "1935",
      deathYear: "2008",
      status: "Almarhum",
      origin: "Bandung"
    },
    {
      id: "kakek_2",
      name: "Kakek 2 (B - Poros)",
      gen: -2,
      order: "Anak ke-2",
      quadrant: "Q1",
      claimed: true,
      gender: "L",
      role: "Kakek Utama (Poros Ayah)",
      parentId: "uyut_1",
      birthYear: "1938",
      deathYear: "2012",
      status: "Almarhum",
      origin: "Bandung"
    },
    {
      id: "kakek_3",
      name: "Kakek 3 (C)",
      gen: -2,
      order: "Anak ke-3",
      quadrant: "Q1",
      claimed: true,
      gender: "L",
      role: "Kakek Bungsu",
      parentId: "uyut_1",
      birthYear: "1942",
      deathYear: "2015",
      status: "Almarhum",
      origin: "Garut"
    },

    // 2. Orbit 2: 10 Anak dari Kakek No. 2 (Ayah, Paman, Bibi 1 - 10)
    { id: "ayah_1", name: "Uwa No. 1", gen: -1, order: "Anak ke-1", quadrant: "Q1", claimed: true, gender: "L", role: "Uwa Pertama", parentId: "kakek_2", birthYear: "1963", status: "Hidup", origin: "Bandung" },
    { id: "ayah_2", name: "Ayah No. 2 (Karta)", gen: -1, order: "Anak ke-2", quadrant: "Q1", claimed: true, gender: "L", role: "Ayah Kandung User", parentId: "kakek_2", birthYear: "1965", status: "Hidup", origin: "Bandung" },
    { id: "ayah_3", name: "Paman No. 3", gen: -1, order: "Anak ke-3", quadrant: "Q1", claimed: true, gender: "L", role: "Paman", parentId: "kakek_2", birthYear: "1968", status: "Hidup", origin: "Jakarta" },
    { id: "ayah_4", name: "Bibi No. 4", gen: -1, order: "Anak ke-4", quadrant: "Q1", claimed: true, gender: "P", role: "Bibi", parentId: "kakek_2", birthYear: "1970", status: "Hidup", origin: "Bandung" },
    { id: "ayah_5", name: "Paman No. 5", gen: -1, order: "Anak ke-5", quadrant: "Q1", claimed: false, gender: "L", role: "Paman", parentId: "kakek_2", birthYear: "1973", status: "Hidup", origin: "Bogor" },
    { id: "ayah_6", name: "Bibi No. 6", gen: -1, order: "Anak ke-6", quadrant: "Q1", claimed: false, gender: "P", role: "Bibi", parentId: "kakek_2", birthYear: "1975", status: "Hidup", origin: "Bekasi" },
    { id: "ayah_7", name: "Paman No. 7", gen: -1, order: "Anak ke-7", quadrant: "Q1", claimed: false, gender: "L", role: "Paman", parentId: "kakek_2", birthYear: "1978", status: "Hidup", origin: "Bandung" },
    { id: "ayah_8", name: "Bibi No. 8", gen: -1, order: "Anak ke-8", quadrant: "Q1", claimed: false, gender: "P", role: "Bibi", parentId: "kakek_2", birthYear: "1980", status: "Hidup", origin: "Tangerang" },
    { id: "ayah_9", name: "Paman No. 9", gen: -1, order: "Anak ke-9", quadrant: "Q1", claimed: false, gender: "L", role: "Paman", parentId: "kakek_2", birthYear: "1983", status: "Hidup", origin: "Depok" },
    { id: "ayah_10", name: "Bibi No. 10", gen: -1, order: "Anak ke-10", quadrant: "Q1", claimed: false, gender: "P", role: "Bibi Bungsu", parentId: "kakek_2", birthYear: "1986", status: "Hidup", origin: "Bandung" },

    // 3. Orbit 3: 6 Anak dari Ayah No. 2 (User & Saudara 1 - 6, User adalah No. 3)
    { id: "user_sib_1", name: "Kakak No. 1", gen: 0, order: "Anak ke-1", quadrant: "Q1", claimed: true, gender: "L", role: "Kakak Sulung", relationType: "kakak", parentId: "ayah_2", birthYear: "1988", status: "Hidup", origin: "Bandung" },
    { id: "user_sib_2", name: "Kakak No. 2", gen: 0, order: "Anak ke-2", quadrant: "Q1", claimed: true, gender: "P", role: "Kakak Kedua", relationType: "kakak", parentId: "ayah_2", birthYear: "1990", status: "Hidup", origin: "Bandung" },
    {
      id: "user_node",
      name: "Hendriana (User No. 3)",
      gen: 0,
      order: "Anak ke-3",
      quadrant: "Q1",
      claimed: true,
      gender: "L",
      role: "User (Poros Utama)",
      isUser: true,
      relationType: "user",
      parentId: "ayah_2",
      spouseName: "Siti Nurhaliza",
      spouseGender: "P",
      birthYear: "1992",
      status: "Hidup",
      origin: "Bandung"
    },
    { id: "user_sib_4", name: "Adik No. 4", gen: 0, order: "Anak ke-4", quadrant: "Q1", claimed: true, gender: "L", role: "Adik Pertama", relationType: "adik", parentId: "ayah_2", birthYear: "1995", status: "Hidup", origin: "Bandung" },
    { id: "user_sib_5", name: "Adik No. 5", gen: 0, order: "Anak ke-5", quadrant: "Q1", claimed: false, gender: "P", role: "Adik Kedua", relationType: "adik", parentId: "ayah_2", birthYear: "1998", status: "Hidup", origin: "Bandung" },
    { id: "user_sib_6", name: "Adik No. 6", gen: 0, order: "Anak ke-6", quadrant: "Q1", claimed: false, gender: "L", role: "Adik Bungsu", relationType: "adik", parentId: "ayah_2", birthYear: "2001", status: "Hidup", origin: "Bandung" },

    // 4. Orbit 4: 3 Anak dari User No. 3
    { id: "anak_1", name: "Anak No. 1 (Sulung)", gen: 1, order: "Anak ke-1", quadrant: "Q1", claimed: true, gender: "L", role: "Anak Pertama", parentId: "user_node", birthYear: "2018", status: "Hidup", origin: "Bandung" },
    { id: "anak_2", name: "Anak No. 2 (Tengah)", gen: 1, order: "Anak ke-2", quadrant: "Q1", claimed: true, gender: "P", role: "Anak Kedua", parentId: "user_node", birthYear: "2021", status: "Hidup", origin: "Bandung" },
    { id: "anak_3", name: "Anak No. 3 (Bungsu)", gen: 1, order: "Anak ke-3", quadrant: "Q1", claimed: true, gender: "L", role: "Anak Bungsu", parentId: "user_node", birthYear: "2024", status: "Hidup", origin: "Bandung" },

    // ==========================================
    // TRAH IBU USER (Q2)
    // ==========================================
    { id: "q2_uyut", name: "Uyut Maternal", gen: -3, order: "Pusat Kuadran", quadrant: "Q2", claimed: true, gender: "L", role: "Uyut Jalur Ibu", birthYear: "1915", deathYear: "1988", status: "Almarhum", origin: "Bogor" },
    { id: "q2_kakek", name: "Kakek Maternal", gen: -2, order: "Anak ke-1", quadrant: "Q2", claimed: true, gender: "L", role: "Kakek (Abah Ibu)", parentId: "q2_uyut", birthYear: "1940", deathYear: "2016", status: "Almarhum", origin: "Bogor" },
    { id: "q2_ibu", name: "Ibu Kandung User", gen: -1, order: "Anak ke-1", quadrant: "Q2", claimed: true, gender: "P", role: "Ibu Kandung", parentId: "q2_kakek", birthYear: "1968", status: "Hidup", origin: "Bogor" },
    { id: "q2_user", name: "Hendriana (Trah Ibu)", gen: 0, order: "Anak ke-1", quadrant: "Q2", claimed: true, gender: "L", role: "User (Trah Ibu)", parentId: "q2_ibu", birthYear: "1992", status: "Hidup", origin: "Bandung" },

    // ==========================================
    // TRAH AYAH PASANGAN (Q3)
    // ==========================================
    { id: "q3_uyut", name: "Uyut Besan Ayah", gen: -3, order: "Pusat Kuadran", quadrant: "Q3", claimed: true, gender: "L", role: "Uyut Besan", birthYear: "1912", deathYear: "1985", status: "Almarhum", origin: "Bogor" },
    { id: "q3_kakek", name: "Kakek Mertua", gen: -2, order: "Anak ke-1", quadrant: "Q3", claimed: false, gender: "L", role: "Kakek Mertua", parentId: "q3_uyut", birthYear: "1936", deathYear: "2010", status: "Almarhum", origin: "Bogor" },
    { id: "q3_ayah_mertua", name: "Ayah Mertua (H. Suryana)", gen: -1, order: "Anak ke-1", quadrant: "Q3", claimed: true, gender: "L", role: "Ayah Pasangan", parentId: "q3_kakek", birthYear: "1962", status: "Hidup", origin: "Bogor" },
    { id: "q3_pasangan", name: "Siti Nurhaliza (Trah Ayah)", gen: 0, order: "Anak ke-1", quadrant: "Q3", claimed: true, gender: "P", role: "Pasangan", parentId: "q3_ayah_mertua", birthYear: "1994", status: "Hidup", origin: "Bogor" },

    // ==========================================
    // TRAH IBU PASANGAN (Q4)
    // ==========================================
    { id: "q4_uyut", name: "Uyut Besan Ibu", gen: -3, order: "Pusat Kuadran", quadrant: "Q4", claimed: true, gender: "P", role: "Uyut Besan", birthYear: "1916", deathYear: "1989", status: "Almarhum", origin: "Bogor" },
    { id: "q4_kakek", name: "Nenek Mertua", gen: -2, order: "Anak ke-1", quadrant: "Q4", claimed: false, gender: "P", role: "Nenek Mertua", parentId: "q4_uyut", birthYear: "1939", deathYear: "2011", status: "Almarhum", origin: "Bogor" },
    { id: "q4_ibu_mertua", name: "Ibu Mertua (Hj. Maryam)", gen: -1, order: "Anak ke-1", quadrant: "Q4", claimed: true, gender: "P", role: "Ibu Pasangan", parentId: "q4_kakek", birthYear: "1965", status: "Hidup", origin: "Bogor" },
    { id: "q4_pasangan", name: "Siti Nurhaliza (Trah Ibu)", gen: 0, order: "Anak ke-1", quadrant: "Q4", claimed: true, gender: "P", role: "Pasangan", parentId: "q4_ibu_mertua", birthYear: "1994", status: "Hidup", origin: "Bogor" }
  ]
};

const DEFAULT_LOGS: LedgerLog[] = [
  { id: "log-1", time: "System Init", action: "Rasi Bintang Kosmik", text: "Garis rasi bintang melengkung halus aktif (anti saling silang & anti bersebrangan)." },
  { id: "log-2", time: "16:20", action: "Pola Sebaran", text: "Pola Kipas Kosmik (Fan Outward) aktif: percabangan melebar ke angkasa luar tanpa menyebrang kuadran lain." }
];

export interface OrbitQuViewProps {
  onBackToLeluhurQu?: () => void;
  onOpenInSilsilah?: (memberName: string, memberId?: string) => void;
  showNotification?: (msg: string) => void;
  familyTree?: OrbitTreeData;
  onUpdateFamilyTree?: React.Dispatch<React.SetStateAction<OrbitTreeData>>;
  initialSelectedNodeId?: string | null;
  onClearInitialSelectedNodeId?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const OrbitQuView: React.FC<OrbitQuViewProps> = ({
  onBackToLeluhurQu,
  onOpenInSilsilah,
  showNotification,
  familyTree: propsFamilyTree,
  onUpdateFamilyTree,
  initialSelectedNodeId,
  onClearInitialSelectedNodeId,
  theme: propsTheme,
  onToggleTheme
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Tema Dark (Cosmic Space) vs Light (Heritage Parchment)
  const [internalTheme, setInternalTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_leluhur_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const currentTheme = propsTheme ?? internalTheme;
  const isLight = currentTheme === 'light';

  const toggleTheme = () => {
    if (onToggleTheme) {
      onToggleTheme();
    } else {
      const next = internalTheme === 'dark' ? 'light' : 'dark';
      setInternalTheme(next);
      try {
        localStorage.setItem('wargaqu_leluhur_theme', next);
      } catch {}
      showNotification?.(next === 'dark' ? '🌙 Mode Gelap (Dark Space) Aktif' : '☀️ Mode Terang (Light Heritage) Aktif');
    }
  };

  // Mode Peran: Admin Trah vs User Warga
  const [isAdminMode, setIsAdminMode] = useState<boolean>(true);

  // Pola Sebaran: 'fan' (Kipas Kosmik 180° Menghadap Keluar - Anti Bersebrangan) vs 'circle' (Melingkar 360°)
  const [orbitSpreadMode, setOrbitSpreadMode] = useState<'fan' | 'circle'>('fan');

  // Gaya Garis: 'curved' (Rasi Bintang Melengkung Bezier) vs 'straight' (Garis Lurus)
  const [lineCurveStyle, setLineCurveStyle] = useState<'curved' | 'straight'>('curved');

  // Global Line Visibility Toggle (Admin feature)
  const [showConnectingLines, setShowConnectingLines] = useState<boolean>(true);

  // Bentuk Frame Foto Profil: 'circle' (Bulat) | 'square' (Kotak) | 'hexagon' (Segi-6)
  const [globalFrameShape, setGlobalFrameShape] = useState<'circle' | 'square' | 'hexagon'>('circle');

  // Garis Urut Sambung Anak / Sibling (No. 1 ➔ No. 2 ➔ No. 3...)
  const [showOrderSequenceLines, setShowOrderSequenceLines] = useState<boolean>(true);

  // Mode Render Tampilan: 'batch_tree' (Advanced Line & Batch Notation Renderer) vs 'orbit' (Rasi Kosmik)
  const [activeRendererMode, setActiveRendererMode] = useState<'batch_tree' | 'orbit'>('batch_tree');

  // Opsi Gaya Garis: 'double' (2 Paralel), 'triple' (3 Kabel Rel), 'single' (1 Utama)
  const [lineStylePattern, setLineStylePattern] = useState<'single' | 'double' | 'triple'>('double');

  // Opsi Garis Keturunan & Struktur Nasab: 'paralel' (menyebar), 'seri' (bus rel sirkuit 90°), 'linier' (poros lurus langsung)
  const [lineageStructureMode, setLineageStructureMode] = useState<'paralel' | 'seri' | 'linier'>('paralel');

  // Opsi Rangkaian Saudara / Anak ke 1, 2, 3, 4, 5, 6, 7, dst: 'paralel' | 'seri' | 'paralel_seri'
  const [siblingCircuitMode, setSiblingCircuitMode] = useState<'paralel' | 'seri' | 'paralel_seri'>('paralel_seri');

  // Arah Pohon Notasi: 'bottom-up' (Bawah ke Atas - Sesuai Kode) vs 'top-down' (Atas ke Bawah)
  const [treeDirection, setTreeDirection] = useState<'bottom-up' | 'top-down'>('bottom-up');

  // Sumber Data: 'main' (Silsilah Aktif Di-Notasikan) vs 'sample' (12 Anggota Universal ID Spesifikasi Uyut-Cucu)
  const [batchDataSource, setBatchDataSource] = useState<'main' | 'sample'>('main');

  // Kamera SVG untuk Pan & Zoom Mode Batch Tree
  const [svgCamera, setSvgCamera] = useState<{ x: number; y: number; zoom: number }>({ x: 40, y: -450, zoom: 0.85 });
  const svgDragRef = useRef<{ isDragging: boolean; startX: number; startY: number; hasMoved: boolean; initialPinchDist: number }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    hasMoved: false,
    initialPinchDist: 0
  });

  // Popup Peringatan Hapus Silsilah
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<boolean>(false);

  // Cache gambar foto untuk render di Canvas
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Input State Tambahan untuk Modal User & Admin: Lahir, Wafat, Kota, Foto, Frame
  const [claimBirthYearInput, setClaimBirthYearInput] = useState('');
  const [claimDeathYearInput, setClaimDeathYearInput] = useState('');
  const [claimStatusInput, setClaimStatusInput] = useState<'Hidup' | 'Almarhum'>('Hidup');
  const [claimOriginInput, setClaimOriginInput] = useState('');
  const [claimPhotoUrlInput, setClaimPhotoUrlInput] = useState('');
  const [claimFrameShapeInput, setClaimFrameShapeInput] = useState<'circle' | 'square' | 'hexagon'>('circle');

  // Tree State (Single Source of Truth shared with Silsilah Keluarga)
  const [internalFamilyTree, setInternalFamilyTree] = useState<OrbitTreeData>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_orbitqu_tree_v6');
      return saved ? JSON.parse(saved) : CLEAN_REAL_TREE_DATA;
    } catch {
      return CLEAN_REAL_TREE_DATA;
    }
  });

  const familyTree = propsFamilyTree ?? internalFamilyTree;
  const setFamilyTree = onUpdateFamilyTree ?? setInternalFamilyTree;

  // Auto-focus on targeted node when redirected from Silsilah tab
  useEffect(() => {
    if (initialSelectedNodeId && familyTree) {
      calculatePositions(familyTree);
      const target = familyTree.nodes.find(n => n.id === initialSelectedNodeId);
      if (target) {
        setSelectedNode(target);
        if (target._renderX !== undefined && target._renderY !== undefined) {
          cameraRef.current.x = -target._renderX;
          cameraRef.current.y = -target._renderY;
          cameraRef.current.zoom = 0.95;
          setZoomLevelDisplay(95);
        }
        renderCanvas();
        onClearInitialSelectedNodeId?.();
      }
    }
  }, [initialSelectedNodeId, familyTree]);

  const [logs, setLogs] = useState<LedgerLog[]>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_orbitqu_logs_v6');
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

  // Selected Node (for highlight & edit)
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

  // Mouse / Touch Gesture & Interactive Node Drag State
  const dragRef = useRef({
    isDraggingCamera: false,
    startX: 0,
    startY: 0,
    hasMoved: false,
    initialPinchDist: 0
  });

  const nodeDragRef = useRef<{
    isDraggingNode: boolean;
    nodeId: string | null;
    quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4';
    hasDragged: boolean;
  }>({
    isDraggingNode: false,
    nodeId: null,
    quadrant: 'Q1',
    hasDragged: false
  });

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_orbitqu_tree_v6', JSON.stringify(familyTree));
    } catch (e) {
      console.error(e);
    }
  }, [familyTree]);

  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_orbitqu_logs_v6', JSON.stringify(logs));
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
  // DATA & HIERARCHY COMPUTATION KHUSUS MODE NOTASI BATCH
  // -------------------------------------------------------------
  const batchItems = useMemo(() => {
    if (batchDataSource === 'sample') {
      return DEFAULT_BATCH_FAMILY_DATA;
    }
    return convertOrbitNodesToBatchData(familyTree.nodes, 'all');
  }, [batchDataSource, familyTree.nodes]);

  const treeHierarchy = useMemo(() => {
    return buildTreeHierarchyEngine(batchItems, treeDirection, lineageStructureMode);
  }, [batchItems, treeDirection, lineageStructureMode]);

  // SVG Pan & Zoom Handlers
  const handleSvgMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    svgDragRef.current.isDragging = true;
    svgDragRef.current.startX = e.clientX - svgCamera.x;
    svgDragRef.current.startY = e.clientY - svgCamera.y;
    svgDragRef.current.hasMoved = false;
  };

  const handleSvgMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!svgDragRef.current.isDragging) return;
    svgDragRef.current.hasMoved = true;
    setSvgCamera(prev => ({
      ...prev,
      x: e.clientX - svgDragRef.current.startX,
      y: e.clientY - svgDragRef.current.startY
    }));
  };

  const handleSvgMouseUp = () => {
    svgDragRef.current.isDragging = false;
  };

  const handleSvgWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.88;
    setSvgCamera(prev => ({
      ...prev,
      zoom: Math.min(Math.max(prev.zoom * factor, 0.25), 2.8)
    }));
  };

  const handleSvgTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1) {
      svgDragRef.current.isDragging = true;
      svgDragRef.current.startX = e.touches[0].clientX - svgCamera.x;
      svgDragRef.current.startY = e.touches[0].clientY - svgCamera.y;
      svgDragRef.current.hasMoved = false;
    } else if (e.touches.length === 2) {
      svgDragRef.current.isDragging = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      svgDragRef.current.initialPinchDist = Math.hypot(dx, dy);
    }
  };

  const handleSvgTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 1 && svgDragRef.current.isDragging) {
      svgDragRef.current.hasMoved = true;
      setSvgCamera(prev => ({
        ...prev,
        x: e.touches[0].clientX - svgDragRef.current.startX,
        y: e.touches[0].clientY - svgDragRef.current.startY
      }));
    } else if (e.touches.length === 2 && svgDragRef.current.initialPinchDist > 0) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const ratio = dist / svgDragRef.current.initialPinchDist;
      svgDragRef.current.initialPinchDist = dist;
      setSvgCamera(prev => ({
        ...prev,
        zoom: Math.min(Math.max(prev.zoom * ratio, 0.25), 2.8)
      }));
    }
  };

  const handleSvgTouchEnd = () => {
    svgDragRef.current.isDragging = false;
    svgDragRef.current.initialPinchDist = 0;
  };

  const handleSvgZoomIn = () => {
    setSvgCamera(prev => ({
      ...prev,
      zoom: Math.min(prev.zoom * 1.25, 2.8)
    }));
  };

  const handleSvgZoomOut = () => {
    setSvgCamera(prev => ({
      ...prev,
      zoom: Math.max(prev.zoom / 1.25, 0.25)
    }));
  };

  const handleSvgReset = () => {
    setSvgCamera({ x: 40, y: -450, zoom: 0.85 });
    showNotification?.('Posisi kamera diatur ke default.');
  };

  const handleSvgCenter = () => {
    const userNode = batchItems.find(n => n.isUser || n.id === "0.1.1.1");
    if (userNode) {
      let target: BatchTreeNode | null = null;
      const findTarget = (n: BatchTreeNode) => {
        if (n.id === userNode.id) {
          target = n;
          return;
        }
        n.children.forEach(findTarget);
      };
      treeHierarchy.roots.forEach(findTarget);

      if (target) {
        setSvgCamera({
          x: -(target as BatchTreeNode).x + 200,
          y: -(target as BatchTreeNode).y + 350,
          zoom: 1.05
        });
        showNotification?.(`🎯 Kamera fokus ke ${userNode.name} [${userNode.id}]!`);
        return;
      }
    }
    handleSvgReset();
  };

  // Rendering elemen Garis & Node SVG
  const { renderedConnections, renderedNodes } = useMemo(() => {
    const linesList: React.ReactNode[] = [];
    const nodesList: React.ReactNode[] = [];

    const traverse = (node: BatchTreeNode) => {
      const level = node.id.split('.').length - 1;
      const isSelected = selectedNode?.id === (node.originalNodeId || node.id);

      // 1. Render Garis dari Parent ke Anak-Anak (Anak 1, 2, 3, 4, 5, 6, 7, dst)
      const sortedChildren = [...node.children].sort((a, b) => {
        const na = parseInt(a.id.split('.').pop() || '0', 10);
        const nb = parseInt(b.id.split('.').pop() || '0', 10);
        return na - nb;
      });

      sortedChildren.forEach((child, childIdx) => {
        const x1 = node.x;
        const y1 = treeDirection === 'bottom-up' ? node.y - 21 : node.y + 21;
        const x2 = child.x;
        const y2 = treeDirection === 'bottom-up' ? child.y + 21 : child.y - 21;
        const midY = y1 + (y2 - y1) / 2;

        let pathD = '';
        if (lineageStructureMode === 'linier') {
          // 1. LINIER: Garis lurus tegas langsung menghubungkan poros nasab
          pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
        } else if (lineageStructureMode === 'seri') {
          // 2. SERI: Sirkuit bus rel orthogonal bertingkat (siku 90°)
          pathD = `M ${x1} ${y1} V ${midY} H ${x2} V ${y2}`;
        } else {
          // 3. PARALEL: Kurva Bezier halus menyebar ke cabang paralel
          pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
        }

        const strokeColor = BATCH_LEVEL_COLORS[level % 6] || "#94a3b8";
        const baseWidth = Math.max(2, 6 - level * 1.1);

        // Jika mode anak adalah 'seri', maka aliran primer orang tua masuk ke Anak ke-1 (Sulung),
        // sedangkan anak ke-2, 3, 4, 5... tersambung lewat rantai seri horizontal antar-saudara
        const isSecondarySeriesChild = siblingCircuitMode === 'seri' && childIdx > 0 && sortedChildren.length > 1;

        if (lineStylePattern === 'single') {
          linesList.push(
            <path
              key={`line-${node.id}-${child.id}`}
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth={isSecondarySeriesChild ? 1.4 : baseWidth}
              strokeDasharray={isSecondarySeriesChild ? "4 3" : undefined}
              strokeOpacity={isSecondarySeriesChild ? 0.45 : 1}
              strokeLinecap="round"
            />
          );
        } else if (lineStylePattern === 'double') {
          linesList.push(
            <g key={`line-${node.id}-${child.id}`} opacity={isSecondarySeriesChild ? 0.45 : 1}>
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={Math.max(1.2, baseWidth / 2)}
                strokeDasharray={isSecondarySeriesChild ? "4 3" : undefined}
                strokeLinecap="round"
                transform="translate(-2, 0)"
              />
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={Math.max(1.2, baseWidth / 2)}
                strokeDasharray={isSecondarySeriesChild ? "4 3" : undefined}
                strokeLinecap="round"
                transform="translate(2, 0)"
              />
            </g>
          );
        } else {
          // triple (kabel rel / bus bar 3 jalur)
          linesList.push(
            <g key={`line-${node.id}-${child.id}`} opacity={isSecondarySeriesChild ? 0.45 : 1}>
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={1}
                strokeLinecap="round"
                transform="translate(-3, 0)"
              />
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={baseWidth}
                strokeDasharray={isSecondarySeriesChild ? "4 3" : undefined}
                strokeLinecap="round"
              />
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={1}
                strokeLinecap="round"
                transform="translate(3, 0)"
              />
            </g>
          );
        }

        // Khusus Mode SERI: Tambahkan Terminal Percabangan Bus (Junction Dots Siku)
        if (lineageStructureMode === 'seri') {
          linesList.push(
            <g key={`junction-${node.id}-${child.id}`} className="pointer-events-none">
              <circle
                cx={x1}
                cy={midY}
                r={3.2}
                fill={strokeColor}
                stroke={isLight ? "#ffffff" : "#0f172a"}
                strokeWidth={1.2}
              />
              <circle
                cx={x2}
                cy={midY}
                r={3.2}
                fill={strokeColor}
                stroke={isLight ? "#ffffff" : "#0f172a"}
                strokeWidth={1.2}
              />
            </g>
          );
        }

        // Khusus Mode LINIER: Tambahkan Pip Penanda Aliran Nasab Lurus
        if (lineageStructureMode === 'linier') {
          linesList.push(
            <circle
              key={`pip-${node.id}-${child.id}`}
              cx={(x1 + x2) / 2}
              cy={(y1 + y2) / 2}
              r={2.5}
              fill={strokeColor}
              className="pointer-events-none opacity-85"
            />
          );
        }

        traverse(child);
      });

      // 2. SIBLING CIRCUIT CONNECTIONS: Rangkaian Seri / Paralel-Seri untuk Anak ke 1, 2, 3, 4, 5, 6, 7, dst
      if (sortedChildren.length > 1 && (siblingCircuitMode === 'seri' || siblingCircuitMode === 'paralel_seri')) {
        for (let i = 0; i < sortedChildren.length - 1; i++) {
          const c1 = sortedChildren[i];
          const c2 = sortedChildren[i + 1];
          const order1 = c1.id.split('.').pop() || (i + 1).toString();
          const order2 = c2.id.split('.').pop() || (i + 2).toString();

          const startBridgeX = c1.x + 52;
          const endBridgeX = c2.x - 52;
          const bridgeY = c1.y;
          const midBridgeX = (startBridgeX + endBridgeX) / 2;
          const siblingColor = BATCH_LEVEL_COLORS[(level + 1) % 6] || BATCH_LEVEL_COLORS[level % 6] || "#94a3b8";

          if (endBridgeX > startBridgeX) {
            linesList.push(
              <g key={`sibling-link-${node.id}-${c1.id}-${c2.id}`} className="pointer-events-none select-none">
                {/* Garis Horizontal Penghubung Seri Anak 1 ➔ 2 ➔ 3 ➔ 4 ➔ ... */}
                <path
                  d={`M ${startBridgeX} ${bridgeY} L ${endBridgeX} ${c2.y}`}
                  fill="none"
                  stroke={siblingColor}
                  strokeWidth={siblingCircuitMode === 'seri' ? 2.8 : 2}
                  strokeDasharray={siblingCircuitMode === 'paralel_seri' ? "5 3" : undefined}
                  strokeLinecap="round"
                />

                {/* Junction Dots di tepi kartu anak */}
                <circle
                  cx={startBridgeX}
                  cy={bridgeY}
                  r={3.2}
                  fill={siblingColor}
                  stroke={isLight ? '#ffffff' : '#0f172a'}
                  strokeWidth={1.2}
                />
                <circle
                  cx={endBridgeX}
                  cy={c2.y}
                  r={3.2}
                  fill={siblingColor}
                  stroke={isLight ? '#ffffff' : '#0f172a'}
                  strokeWidth={1.2}
                />

                {/* Badge Aliran Seri Urutan Kelahiran Anak: Anak [1 ➔ 2], [2 ➔ 3], dst */}
                <g transform={`translate(${midBridgeX}, ${bridgeY})`}>
                  <rect
                    x={-19}
                    y={-8.5}
                    width={38}
                    height={17}
                    rx={8.5}
                    fill={isLight ? '#ffffff' : '#0f172a'}
                    stroke={siblingColor}
                    strokeWidth={1.5}
                    className="filter drop-shadow-xs"
                  />
                  <text
                    x={0}
                    y={3.5}
                    fontSize={8}
                    fontWeight="bold"
                    fill={siblingColor}
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {order1}➔{order2}
                  </text>
                </g>
              </g>
            );
          }
        }
      }

      // 3. Render node card
      const strokeColor = BATCH_LEVEL_COLORS[level % 6] || "#fff";
      const cardFill = isLight ? "#ffffff" : "#1e293b";
      const levelLabel = BATCH_LEVEL_LABELS[level] || `Gen ${level}`;
      const childNum = node.id.split('.').pop() || '1';

      nodesList.push(
        <g
          key={`node-${node.id}`}
          className="cursor-pointer group select-none"
          onClick={(e) => {
            e.stopPropagation();
            if (node.originalNodeId) {
              const matched = familyTree.nodes.find(n => n.id === node.originalNodeId);
              if (matched) {
                setSelectedNode(matched);
                if (isAdminMode) setShowAdminEditModal(true);
                else setShowUserClaimModal(true);
                showNotification?.(`Memilih [${node.id}] ${node.name} (${level === 3 ? `Anak ke-${childNum}` : levelLabel})`);
                return;
              }
            }
            showNotification?.(`Node terpilih: [${node.id}] ${node.name} • ${level === 3 ? `Anak ke-${childNum}` : levelLabel}`);
          }}
        >
          {isSelected && (
            <rect
              x={node.x - 58}
              y={node.y - 26}
              width={116}
              height={52}
              rx={10}
              fill={strokeColor}
              fillOpacity={0.25}
              stroke={strokeColor}
              strokeWidth={2}
            />
          )}

          <rect
            x={node.x - 52}
            y={node.y - 21}
            width={104}
            height={42}
            rx={8}
            fill={cardFill}
            stroke={strokeColor}
            strokeWidth={isSelected ? 2.5 : 2}
            className="filter drop-shadow-sm hover:brightness-110 transition"
          />

          {/* Badge Universal ID */}
          <text
            x={node.x - 44}
            y={node.y - 6}
            fill={isLight ? "#d97706" : "#f59e0b"}
            fontSize={9.5}
            fontWeight="bold"
            fontFamily="monospace"
            className="pointer-events-none"
          >
            [{node.id}]
          </text>

          {/* Badge Label Generasi & Nomor Urut Anak (Anak ke-1, ke-2, ke-3, dst) */}
          <text
            x={node.x + 44}
            y={node.y - 6}
            fill={strokeColor}
            fontSize={8}
            fontWeight="bold"
            textAnchor="end"
            className="pointer-events-none font-sans"
          >
            {level === 3 ? `Anak ke-${childNum}` : (level === 4 ? `Cucu ke-${childNum}` : (level > 0 ? `${levelLabel} ke-${childNum}` : levelLabel))}
          </text>

          {/* Nama Anggota */}
          <text
            x={node.x}
            y={node.y + 13}
            fill={isLight ? "#0f172a" : "#f8fafc"}
            fontSize={11}
            fontWeight="bold"
            textAnchor="middle"
            className="pointer-events-none"
          >
            {node.name.length > 13 ? node.name.slice(0, 12) + '…' : node.name}
          </text>

          {node.isUser && (
            <g transform={`translate(${node.x + 38}, ${node.y - 12})`}>
              <circle cx={0} cy={0} r={6} fill="#0284c7" />
              <text x={0} y={2.5} fontSize={7} fill="#ffffff" textAnchor="middle" fontWeight="bold">★</text>
            </g>
          )}
        </g>
      );
    };

    treeHierarchy.roots.forEach(traverse);

    return { renderedConnections: linesList, renderedNodes: nodesList };
  }, [treeHierarchy, lineStylePattern, lineageStructureMode, siblingCircuitMode, treeDirection, isLight, selectedNode, familyTree.nodes, isAdminMode]);

  // Simpan Silsilah Permanen & Lanjut Edit
  const handleSaveTreeData = () => {
    try {
      localStorage.setItem('wargaqu_orbitqu_tree_v6', JSON.stringify(familyTree));
      localStorage.setItem('wargaqu_orbitqu_logs_v6', JSON.stringify(logs));
      addLog('Simpan Silsilah', `Silsilah berhasil disimpan (${familyTree.nodes.length} bintang anggota). Anda dapat terus melanjutkan edit.`);
      showNotification?.('💾 Silsilah berhasil disimpan! Anda dapat terus melanjutkan edit.');
    } catch (e) {
      console.error(e);
      showNotification?.('Gagal menyimpan silsilah ke memori.');
    }
  };

  // Bersihkan Data dengan Konfirmasi Modal
  const handleConfirmClearAllData = () => {
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
          role: "User (Poros Bintang)",
          spouseName: "Siti Nurhaliza",
          origin: "Bandung",
          status: "Hidup"
        }
      ]
    };
    setFamilyTree(emptyTree);
    addLog('Bersihkan Data', 'Admin mengosongkan seluruh silsilah orbit untuk memulai lembar baru.');
    showNotification?.('Data silsilah berhasil dibersihkan!');
    setShowDeleteConfirmModal(false);
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
  // TRACE ANCESTORS & DESCENDANTS FOR ACTIVE HIGHLIGHT
  // -------------------------------------------------------------
  const getActiveLineageIds = (target: OrbitNode | null): Set<string> => {
    const set = new Set<string>();
    if (!target) return set;

    set.add(target.id);

    // Trace Ke Atas (Leluhur sampai Uyut)
    let curr: OrbitNode | undefined = target;
    while (curr && curr.parentId) {
      set.add(curr.parentId);
      curr = familyTree.nodes.find(n => n.id === curr?.parentId);
    }

    // Trace Ke Bawah (Anak & Keturunan langsung)
    const addDescendants = (parentId: string) => {
      const children = familyTree.nodes.filter(n => n.parentId === parentId);
      children.forEach(c => {
        set.add(c.id);
        addDescendants(c.id);
      });
    };
    addDescendants(target.id);

    return set;
  };

  // -------------------------------------------------------------
  // HIERARCHICAL CONSTELLATION RADIAL TREE ALGORITHM
  // Anti-Crossing (Zero Crossings) & Anti-Bersebrangan (Fan Outward Mode)
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

      // Orbit radii dinamis (melebar otomatis jika node banyak agar tidak menumpuk)
      const baseRadii: { [gen: number]: number } = {
        [-3]: 0,    // Pusat: Uyut
        [-2]: 90,   // Orbit 1: Kakek
        [-1]: 175,  // Orbit 2: Ayah / Paman / Bibi
        [0]: 260,   // Orbit 3: User & Saudara
        [1]: 345,   // Orbit 4: Anak
        [2]: 430,   // Orbit 5: Cucu
        [3]: 515    // Orbit 6: Cicit (Terluar)
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
        // Jarak keliling minimal antar-bintang = 52px
        const minRadiusForCount = Math.max(baseRadii[gen], (count * 52) / (2 * Math.PI));
        const resolvedRadius = Math.max(minRadiusForCount, prevRadius + 75);
        finalRadii[gen] = resolvedRadius;
        prevRadius = resolvedRadius;
      });

      // SUDUT SEKTOR UTAMA KUADRAN (Pola Kipas Kosmik / Fan Outward: Anti-Bersebrangan)
      // Menghadap ke luar angkasa bebas (menjauhi pusat kanvas 0,0) sehingga garis tidak saling menyebrang!
      let qSectorStart = 0;
      let qSectorEnd = Math.PI * 2;

      if (orbitSpreadMode === 'fan') {
        if (qKey === 'Q1') {
          // Kiri-Atas: Fan menghadap Up-Left (sudut 135° +/- 75°)
          qSectorStart = Math.PI * 0.75 - Math.PI * 0.42;
          qSectorEnd = Math.PI * 0.75 + Math.PI * 0.42;
        } else if (qKey === 'Q2') {
          // Kanan-Atas: Fan menghadap Up-Right (sudut 315° / -45° +/- 75°)
          qSectorStart = -Math.PI * 0.25 - Math.PI * 0.42;
          qSectorEnd = -Math.PI * 0.25 + Math.PI * 0.42;
        } else if (qKey === 'Q3') {
          // Kiri-Bawah: Fan menghadap Down-Left (sudut 225° / -135° +/- 75°)
          qSectorStart = Math.PI * 1.25 - Math.PI * 0.42;
          qSectorEnd = Math.PI * 1.25 + Math.PI * 0.42;
        } else {
          // Kanan-Bawah: Fan menghadap Down-Right (sudut 45° +/- 75°)
          qSectorStart = Math.PI * 0.25 - Math.PI * 0.42;
          qSectorEnd = Math.PI * 0.25 + Math.PI * 0.42;
        }
      }

      // 1. Tempatkan Pusat Kuadran: Uyut (R=0)
      const uyutList = qNodes.filter(n => n.gen === -3);
      uyutList.forEach(uyut => {
        uyut._renderX = qCenter.x;
        uyut._renderY = qCenter.y;
        uyut._angle = (qSectorStart + qSectorEnd) / 2;
        uyut._radius = 0;
        uyut._sectorStart = qSectorStart;
        uyut._sectorEnd = qSectorEnd;
      });

      // Helper bobot subtree
      const getSubtreeWeight = (nodeId: string): number => {
        const directChildren = qNodes.filter(n => n.parentId === nodeId);
        if (directChildren.length === 0) return 1;
        let sum = 0;
        directChildren.forEach(c => {
          sum += getSubtreeWeight(c.id);
        });
        return Math.max(directChildren.length, sum);
      };

      // 2. Orbit 1: Kakek (Membagi sektor kuadran sesuai porsi keturunan)
      const kakekList = qNodes.filter(n => n.gen === -2);
      if (kakekList.length > 0) {
        let totalKakekWeight = 0;
        kakekList.forEach(k => {
          totalKakekWeight += getSubtreeWeight(k.id);
        });

        const totalSpan = qSectorEnd - qSectorStart;
        let currentAngle = qSectorStart;
        const radiusO1 = finalRadii[-2];

        kakekList.forEach(kakek => {
          const weight = getSubtreeWeight(kakek.id);
          const sectorSpan = (weight / totalKakekWeight) * totalSpan;
          const midAngle = currentAngle + sectorSpan / 2;

          kakek._sectorStart = currentAngle;
          kakek._sectorEnd = currentAngle + sectorSpan;
          kakek._radius = radiusO1;

          // Gunakan customAngle jika user telah menggeser secara fleksibel
          const finalAngle = kakek.customAngle !== undefined ? kakek.customAngle : midAngle;
          kakek._angle = finalAngle;
          kakek._renderX = qCenter.x + radiusO1 * Math.cos(finalAngle);
          kakek._renderY = qCenter.y + radiusO1 * Math.sin(finalAngle);

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

          const pStart = p._sectorStart !== undefined ? p._sectorStart : qSectorStart;
          const pEnd = p._sectorEnd !== undefined ? p._sectorEnd : qSectorEnd;
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
            child._radius = radius;

            // Jika user/admin menggeser bintang di rasi bintang (customAngle)
            const finalAngle = child.customAngle !== undefined ? child.customAngle : midAngle;
            child._angle = finalAngle;
            child._renderX = qCenter.x + radius * Math.cos(finalAngle);
            child._renderY = qCenter.y + radius * Math.sin(finalAngle);

            cAngle += cSpan;
          });
        });

        // Anak tanpa parentId
        const unassigned = qNodes.filter(n => n.gen === childGen && n._renderX === undefined);
        if (unassigned.length > 0) {
          const totalSpan = qSectorEnd - qSectorStart;
          unassigned.forEach((node, idx) => {
            const angle = qSectorStart + ((idx + 0.5) / unassigned.length) * totalSpan;
            node._radius = radius;
            const finalAngle = node.customAngle !== undefined ? node.customAngle : angle;
            node._angle = finalAngle;
            node._renderX = qCenter.x + radius * Math.cos(finalAngle);
            node._renderY = qCenter.y + radius * Math.sin(finalAngle);
          });
        }
      };

      // Orbit 1 -> Orbit 2 (Ayah 1..10 presisi di sektor Kakek B)
      layoutChildrenInParentSector(-2, -1);
      // Orbit 2 -> Orbit 3 (User & Saudara 1..6 berdampingan)
      layoutChildrenInParentSector(-1, 0);
      // Orbit 3 -> Orbit 4 (Anak 1..3)
      layoutChildrenInParentSector(0, 1);
      // Orbit 4 -> Orbit 5 (Cucu)
      layoutChildrenInParentSector(1, 2);
      // Orbit 5 -> Orbit 6 (Cicit)
      layoutChildrenInParentSector(2, 3);

      // Hitung posisi nempel/berdampingan untuk Pasangan User
      qNodes.forEach(node => {
        if (node.spouseName && node._renderX !== undefined && node._renderY !== undefined) {
          const currentRadius = node._radius || Math.sqrt(
            Math.pow(node._renderX - qCenter.x, 2) + Math.pow(node._renderY - qCenter.y, 2)
          );
          const currentAngle = node._angle !== undefined
            ? node._angle
            : Math.atan2(node._renderY - qCenter.y, node._renderX - qCenter.x);

          // Geser sedikit di orbit yang sama (nempel / berdampingan)
          const spouseAngle = currentAngle + 0.12;
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

    // Kumpulan ID node yang sedang disorot (jalur aktif rasi bintang)
    const activeLineageIds = getActiveLineageIds(selectedNode);

    // Background Kosmos Tata Surya vs Kertas Heritage
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = isLight ? "#f8fafc" : "#070b14";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(width / 2 + camX, height / 2 + camY);
    ctx.scale(zoom, zoom);

    // Taburan rasi bintang latar belakang
    ctx.fillStyle = isLight ? "#94a3b833" : "#1e293b33";
    for (let gx = -1800; gx <= 1800; gx += 140) {
      for (let gy = -1600; gy <= 1600; gy += 140) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // =========================================================
    // 1. CINCIN 6 ORBIT TIAP KUADRAN (LENGKUNG HALUS)
    // =========================================================
    (Object.keys(familyTree.quadrants) as Array<keyof typeof familyTree.quadrants>).forEach(qKey => {
      const q = familyTree.quadrants[qKey];
      const qNodes = familyTree.nodes.filter(n => (n.quadrant || 'Q1') === qKey);

      // Hitung radius dinamis kuadran ini
      const counts: { [gen: number]: number } = {};
      qNodes.forEach(n => { counts[n.gen] = (counts[n.gen] || 0) + 1; });
      const baseR = [90, 175, 260, 345, 430, 515];
      const ringRadii: number[] = [];
      let prevR = 0;
      baseR.forEach((br, idx) => {
        const gen = idx - 2; // -2 s/d 3
        const count = counts[gen] || 0;
        const minR = Math.max(br, (count * 52) / (2 * Math.PI));
        const resR = Math.max(minR, prevR + 75);
        ringRadii.push(resR);
        prevR = resR;
      });

      const orbitRings = [
        { r: ringRadii[0], label: "Orbit 1: Kakek" },
        { r: ringRadii[1], label: "Orbit 2: Ayah / Paman" },
        { r: ringRadii[2], label: "Orbit 3: User & Saudara (Gen 0)", isPoros: true },
        { r: ringRadii[3], label: "Orbit 4: Anak" },
        { r: ringRadii[4], label: "Orbit 5: Cucu" },
        { r: ringRadii[5], label: "Orbit 6: Cicit (Terluar)", isOuter: true }
      ];

      orbitRings.forEach(ring => {
        ctx.beginPath();
        ctx.arc(q.center.x, q.center.y, ring.r, 0, Math.PI * 2);

        if (ring.isPoros) {
          ctx.strokeStyle = isLight ? "#0284c799" : "#38bdf866";
          ctx.lineWidth = 2.2;
          ctx.setLineDash([6, 5]);
        } else if (ring.isOuter) {
          ctx.strokeStyle = isLight ? q.color + "70" : q.color + "44";
          ctx.lineWidth = 1.8;
          ctx.setLineDash([4, 4]);
        } else {
          ctx.strokeStyle = isLight ? "#94a3b850" : q.color + "25";
          ctx.lineWidth = 1.2;
          ctx.setLineDash([5, 5]);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = ring.isPoros ? "bold 10px sans-serif" : "9px sans-serif";
        ctx.fillStyle = ring.isPoros
          ? (isLight ? "#0369a1" : "#38bdf8")
          : (isLight ? "#64748b" : q.color + "99");
        ctx.textAlign = "left";
        ctx.fillText(ring.label, q.center.x + ring.r + 6, q.center.y);
      });

      // Batas Luar Kuadran
      const maxR = ringRadii[5] + 55;
      ctx.beginPath();
      ctx.arc(q.center.x, q.center.y, maxR, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? q.color + "45" : q.color + "35";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Judul Kuadran
      ctx.font = "bold 15px sans-serif";
      ctx.fillStyle = isLight
        ? (qKey === 'Q1' ? '#0369a1' : qKey === 'Q2' ? '#047857' : qKey === 'Q3' ? '#be123c' : '#7e22ce')
        : q.color;
      ctx.textAlign = "center";
      ctx.fillText(q.name, q.center.x, q.center.y - maxR - 15);
    });

    // =========================================================
    // 2. GARIS RASI BINTANG MELENGKUNG (SMOOTH CURVED CONSTELLATION ARCS)
    // Menggunakan Cubic Bezier Curve radial alami agar tidak saling silang & tidak bersebrangan!
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

            const isHighlighted = activeLineageIds.has(child.id) && activeLineageIds.has(parentNode.id);

            ctx.save();

            const fromX = parentNode._renderX;
            const fromY = parentNode._renderY;
            const toX = child._renderX;
            const toY = child._renderY;

            if (lineageStructureMode === 'linier' || lineCurveStyle === 'straight') {
              // Garis lurus konvensional / linier langsung
              ctx.beginPath();
              ctx.moveTo(fromX, fromY);
              ctx.lineTo(toX, toY);
            } else if (lineageStructureMode === 'seri') {
              // Garis seri berjenjang antar orbit (bus step arc)
              ctx.beginPath();
              ctx.moveTo(fromX, fromY);
              const fromR = parentNode._radius || 0;
              const toR = child._radius || 100;
              const fromAngle = parentNode._angle || 0;
              const toAngle = child._angle || 0;

              if (fromR < 10) {
                ctx.lineTo(toX, toY);
              } else {
                const midR = (fromR + toR) * 0.5;
                const p1X = q.center.x + midR * Math.cos(fromAngle);
                const p1Y = q.center.y + midR * Math.sin(fromAngle);
                ctx.lineTo(p1X, p1Y);
                ctx.arc(q.center.x, q.center.y, midR, fromAngle, toAngle, fromAngle > toAngle);
                ctx.lineTo(toX, toY);
              }
            } else {
              // GARIS RASI BINTANG MELENGKUNG ALAMI (Paralel / Cubic Bezier Mengikuti Aliran Orbit)
              ctx.beginPath();
              ctx.moveTo(fromX, fromY);

              const fromR = parentNode._radius || 0;
              const toR = child._radius || 100;
              const fromAngle = parentNode._angle || 0;
              const toAngle = child._angle || 0;

              if (fromR < 10) {
                // Dari Uyut Pusat (R=0) ke Kakek: lengkungan radial lembut
                const midR = toR * 0.55;
                const cpX = q.center.x + midR * Math.cos(toAngle);
                const cpY = q.center.y + midR * Math.sin(toAngle);
                ctx.quadraticCurveTo(cpX, cpY, toX, toY);
              } else {
                // Antar Cincin Orbit: Cubic Bezier radial alami
                const midR = (fromR + toR) * 0.5;
                const cp1X = q.center.x + midR * Math.cos(fromAngle);
                const cp1Y = q.center.y + midR * Math.sin(fromAngle);
                const cp2X = q.center.x + midR * Math.cos(toAngle);
                const cp2Y = q.center.y + midR * Math.sin(toAngle);
                ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, toX, toY);
              }
            }

            if (isHighlighted) {
              // Sorotan Rasi Bintang Aktif: Jalur stardust bercahaya terang
              ctx.shadowColor = "#38bdf8";
              ctx.shadowBlur = 12;
              ctx.strokeStyle = "#38bdf8";
              ctx.lineWidth = 3.5;
              ctx.stroke();

              ctx.shadowBlur = 0;
              ctx.strokeStyle = "#ffffff";
              ctx.lineWidth = 1.6;
              ctx.stroke();
            } else {
              // Garis Rasi Bintang Reguler: Pendar kosmik lembut
              ctx.shadowColor = isLight ? "#94a3b8" : q.color;
              ctx.shadowBlur = child.claimed ? (isLight ? 2 : 6) : 2;
              ctx.strokeStyle = isLight
                ? (child.claimed ? `${q.color}` : `${q.color}77`)
                : (child.claimed ? `${q.color}dd` : `${q.color}45`);
              ctx.lineWidth = child.claimed ? 2.2 : 1.3;
              ctx.stroke();
            }

            ctx.restore();
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
    // 2B. TOMBOL GARIS URUT / SAMBUNG DARI NO 1 - SETERUSNYA
    // Sibling sequential connections (1 ➔ 2 ➔ 3 ➔ ...)
    // =========================================================
    if (showOrderSequenceLines) {
      (Object.keys(familyTree.quadrants) as Array<keyof typeof familyTree.quadrants>).forEach(qKey => {
        const q = familyTree.quadrants[qKey];
        const generations = [-2, -1, 0, 1, 2, 3];
        generations.forEach(gen => {
          const genNodes = familyTree.nodes.filter(n => (n.quadrant || 'Q1') === qKey && n.gen === gen);
          const parentGroups = new Map<string, OrbitNode[]>();
          genNodes.forEach(node => {
            const pKey = node.parentId || 'common_' + gen;
            if (!parentGroups.has(pKey)) parentGroups.set(pKey, []);
            parentGroups.get(pKey)!.push(node);
          });

          parentGroups.forEach(siblings => {
            if (siblings.length < 2) return;

            const extractNum = (n: OrbitNode) => {
              const m = n.order.match(/\d+/);
              if (m) return parseInt(m[0], 10);
              const nm = n.name.match(/(?:No\.?|ke-?)\s*(\d+)/i);
              if (nm) return parseInt(nm[1], 10);
              return 999;
            };

            const sorted = [...siblings].sort((a, b) => extractNum(a) - extractNum(b));

            for (let i = 0; i < sorted.length - 1; i++) {
              const current = sorted[i];
              const next = sorted[i + 1];
              if (current._renderX === undefined || current._renderY === undefined ||
                  next._renderX === undefined || next._renderY === undefined) continue;

              ctx.save();
              ctx.beginPath();

              const curR = current._radius;
              const nextR = next._radius;
              const curAngle = current._angle;
              const nextAngle = next._angle;

              // Jika berada pada radius orbit yang sama, gambar busur lengkung sepanjang cincin orbit
              if (curR !== undefined && nextR !== undefined && Math.abs(curR - nextR) < 15 &&
                  curAngle !== undefined && nextAngle !== undefined) {
                const startA = curAngle;
                const endA = nextAngle;
                let diff = endA - startA;
                while (diff < -Math.PI) diff += Math.PI * 2;
                while (diff > Math.PI) diff -= Math.PI * 2;

                ctx.arc(q.center.x, q.center.y, curR, startA, startA + diff, diff < 0);
              } else {
                ctx.moveTo(current._renderX, current._renderY);
                ctx.lineTo(next._renderX, next._renderY);
              }

              ctx.strokeStyle = isLight ? "#d97706" : "#f59e0b"; // Golden amber
              ctx.lineWidth = 2;
              ctx.setLineDash([4, 4]);
              ctx.shadowColor = isLight ? "#d9770644" : "#f59e0b";
              ctx.shadowBlur = isLight ? 2 : 5;
              ctx.stroke();
              ctx.setLineDash([]);

              // Arrow badge di tengah segmen garis urut
              const midX = (current._renderX + next._renderX) / 2;
              const midY = (current._renderY + next._renderY) / 2;

              ctx.beginPath();
              ctx.arc(midX, midY, 9, 0, Math.PI * 2);
              ctx.fillStyle = isLight ? "#fef3c7" : "#451a03";
              ctx.fill();
              ctx.strokeStyle = isLight ? "#d97706" : "#fbbf24";
              ctx.lineWidth = 1.2;
              ctx.stroke();

              ctx.font = "bold 8px sans-serif";
              ctx.fillStyle = isLight ? "#92400e" : "#fef08a";
              ctx.textAlign = "center";
              ctx.fillText(`${i + 1}➔${i + 2}`, midX, midY + 3);

              ctx.restore();
            }
          });
        });
      });
    }

    // =========================================================
    // 3. JALUR PENGHUBUNG KOSMOS PADA ORBIT 3 (POROS USER GEN 0)
    // =========================================================
    const userNodes = familyTree.nodes.filter(n => n.gen === 0 && (n.isUser || n.name.includes("User")));
    if (userNodes.length > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? "#e0f2fe" : "#38bdf833";
      ctx.fill();
      ctx.strokeStyle = isLight ? "#0284c7" : "#38bdf888";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      ctx.save();
      ctx.font = "bold 9px sans-serif";
      ctx.fillStyle = isLight ? "#0284c7" : "#38bdf8";
      ctx.textAlign = "center";
      ctx.fillText("POROS KELUARGA (GEN 0)", 0, -20);
      ctx.restore();

      userNodes.forEach(un => {
        if (un._renderX !== undefined && un._renderY !== undefined) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(un._renderX, un._renderY);
          ctx.strokeStyle = isLight ? "#0284c766" : "#38bdf844";
          ctx.lineWidth = 1.4;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    }

    // Helper functions untuk bentuk frame foto: Bulat, Kotak, Segi-6
    const drawHexagonPath = (context: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
      context.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        if (i === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
    };

    const drawFrameShapePath = (context: CanvasRenderingContext2D, cx: number, cy: number, r: number, nodeShape: 'circle' | 'square' | 'hexagon') => {
      if (nodeShape === 'square') {
        context.beginPath();
        context.roundRect(cx - r, cy - r, r * 2, r * 2, 7);
      } else if (nodeShape === 'hexagon') {
        drawHexagonPath(context, cx, cy, r * 1.15);
      } else {
        context.beginPath();
        context.arc(cx, cy, r, 0, Math.PI * 2);
      }
    };

    // =========================================================
    // 4. BINTANG-BINTANG ANGGOTA KELUARGA & PASANGAN BERDAMPINGAN
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
      const isHighlighted = activeLineageIds.has(node.id);
      const shape = node.frameShape || globalFrameShape;

      let radius = 18;
      if (isUyut) radius = 25;
      else if (isUserEgo) radius = 24;
      else if (isUserSaudara) radius = 20;
      else if (isKakek || isAyah) radius = 19;
      else if (isAnak) radius = 17;
      else if (isCucu) radius = 16;
      else if (isCicit) radius = 15;

      let nodeColor = isLight ? "#f1f5f9" : "#1e293b";
      let borderColor = isLight ? "#94a3b8" : "#334155";

      if (isUyut) {
        nodeColor = isLight ? "#f59e0b" : "#ca8a04";
        borderColor = isLight ? "#b45309" : "#fef08a";
      } else if (isUserEgo) {
        nodeColor = "#0284c7";
        borderColor = isLight ? "#0369a1" : "#38bdf8";
      } else if (isUserSaudara) {
        nodeColor = node.claimed ? "#0d9488" : (isLight ? "#cbd5e1" : "#1e293b");
        borderColor = node.claimed ? (isLight ? "#0f766e" : "#2dd4bf") : "#64748b";
      } else if (node.claimed) {
        nodeColor = "#059669";
        borderColor = isLight ? "#047857" : "#6ee7b7";
      }

      // Aura pendar bintang saat disorot / terpilih
      if (isHighlighted) {
        ctx.save();
        drawFrameShapePath(ctx, node._renderX, node._renderY, radius + 7, shape);
        ctx.fillStyle = isUserEgo ? (isLight ? "#0284c733" : "#38bdf833") : (isLight ? "#f59e0b33" : "#fef08a33");
        ctx.fill();
        ctx.restore();
      }

      // Frame / Bentuk Bintang (Bulat, Kotak, Segi-6)
      drawFrameShapePath(ctx, node._renderX, node._renderY, radius, shape);
      ctx.fillStyle = nodeColor;
      ctx.fill();
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = isUyut || isUserEgo ? 3.5 : 2.2;
      ctx.stroke();

      // Render Foto atau Ikon di dalam frame
      let hasRenderedPhoto = false;
      if (node.photoUrl) {
        let img = imageCacheRef.current.get(node.photoUrl);
        if (!img) {
          img = new Image();
          img.src = node.photoUrl;
          img.onload = () => {
            renderCanvas();
          };
          imageCacheRef.current.set(node.photoUrl, img);
        }
        if (img.complete && img.naturalWidth > 0) {
          ctx.save();
          drawFrameShapePath(ctx, node._renderX, node._renderY, radius - 2, shape);
          ctx.clip();
          ctx.drawImage(img, node._renderX - radius, node._renderY - radius, radius * 2, radius * 2);
          ctx.restore();
          hasRenderedPhoto = true;
        }
      }

      if (!hasRenderedPhoto) {
        ctx.save();
        ctx.translate(node._renderX, node._renderY);

        let icon = "?";
        if (isUyut) icon = "👑";
        else if (isUserEgo) icon = "👤";
        else if (isUserSaudara) icon = node.relationType === 'kakak' ? "🔺" : (node.relationType === 'adik' ? "🔻" : "👥");
        else if (node.claimed) icon = "✦";

        ctx.font = isUyut || isUserEgo ? "bold 12px sans-serif" : "11px sans-serif";
        ctx.fillStyle = isUyut ? (isLight ? "#ffffff" : "#0f172a") : (isLight && !node.claimed && !isUserSaudara ? "#334155" : "#ffffff");
        ctx.textAlign = "center";
        ctx.fillText(icon, 0, 4);
        ctx.restore();
      }

      // KAPSUL LABEL LENGKAP: NAMA, LAHIR-WAFAT, ALAMAT KOTA (ANTI-TUMPANG TINDIH)
      ctx.save();
      ctx.translate(node._renderX, node._renderY);

      interface LabelLine {
        text: string;
        font: string;
        color: string;
      }

      const lines: LabelLine[] = [];
      lines.push({
        text: node.name,
        font: isUserEgo ? "bold 11px sans-serif" : "bold 10px sans-serif",
        color: isUserEgo ? (isLight ? "#0284c7" : "#38bdf8") : (isLight ? "#0f172a" : "#f8fafc")
      });

      // Sub-label Urutan & Orbit
      let orbitLabel = "";
      if (isUyut) orbitLabel = "Pusat (Uyut)";
      else if (isKakek) orbitLabel = "Orbit 1 (Kakek)";
      else if (isAyah) orbitLabel = "Orbit 2 (Ayah)";
      else if (isUserSaudara) orbitLabel = isUserEgo ? "Orbit 3: USER" : "Orbit 3: Saudara";
      else if (isAnak) orbitLabel = "Orbit 4 (Anak)";
      else if (isCucu) orbitLabel = "Orbit 5 (Cucu)";
      else if (isCicit) orbitLabel = "Orbit 6 (Cicit)";

      lines.push({
        text: `${node.order} • ${orbitLabel}`,
        font: "9px sans-serif",
        color: isUserEgo ? (isLight ? "#0369a1" : "#93c5fd") : (isUserSaudara ? (isLight ? "#0f766e" : "#2dd4bf") : (isLight ? "#475569" : "#94a3b8"))
      });

      // Baris Lahir - Wafat / Status
      if (node.birthYear || node.deathYear || node.status) {
        let lifeText = "";
        if (node.birthYear && node.deathYear) {
          lifeText = `${node.birthYear} - ${node.deathYear}`;
        } else if (node.birthYear) {
          lifeText = `${node.birthYear} - ${node.status === 'Almarhum' ? 'Wafat' : 'Skrg'}`;
        } else if (node.status) {
          lifeText = node.status;
        }
        if (lifeText) {
          lines.push({
            text: `⏳ ${lifeText}`,
            font: "9px sans-serif",
            color: isLight ? "#334155" : "#cbd5e1"
          });
        }
      }

      // Baris Alamat / Kota Asal
      if (node.origin) {
        lines.push({
          text: `📍 ${node.origin}`,
          font: "9px sans-serif",
          color: isLight ? "#0891b2" : "#67e8f9"
        });
      }

      if (node.customAngle !== undefined) {
        lines.push({ text: "(Posisi Kustom)", font: "8px sans-serif", color: isLight ? "#4f46e5" : "#818cf8" });
      } else if (node.hideLine) {
        lines.push({ text: "(Garis Terputus)", font: "8px sans-serif", color: isLight ? "#e11d48" : "#f43f5e" });
      } else if (!node.claimed && !isUyut) {
        lines.push({ text: "Belum Diklaim", font: "8px sans-serif", color: isLight ? "#d97706" : "#f59e0b" });
      }

      let maxLineWidth = 0;
      lines.forEach(l => {
        ctx.font = l.font;
        const w = ctx.measureText(l.text).width;
        if (w > maxLineWidth) maxLineWidth = w;
      });

      const pillWidth = Math.max(maxLineWidth + 16, 72);
      const pillHeight = lines.length * 13 + 8;
      const pillY = radius + 4;

      ctx.fillStyle = isLight ? "#ffffffee" : "#070b14f0";
      ctx.beginPath();
      ctx.roundRect(-pillWidth / 2, pillY, pillWidth, pillHeight, 6);
      ctx.fill();
      ctx.strokeStyle = isUserEgo ? (isLight ? "#38bdf8" : "#38bdf888") : (isLight ? "#cbd5e1" : "#33415599");
      ctx.lineWidth = 1;
      ctx.stroke();

      lines.forEach((l, idx) => {
        ctx.font = l.font;
        ctx.fillStyle = l.color;
        ctx.textAlign = "center";
        ctx.fillText(l.text, 0, pillY + 12 + idx * 13);
      });

      ctx.restore();

      // =========================================================
      // 5. PASANGAN USER TAMPIL NEMPEL / BERDAMPINGAN & BEDA WARNA
      // =========================================================
      if (node.spouseName && node._spouseX !== undefined && node._spouseY !== undefined) {
        const spouseR = 19;
        const spouseShape = globalFrameShape;

        // Garis cincin cinta melengkung penghubung user & pasangan
        ctx.beginPath();
        ctx.moveTo(node._renderX, node._renderY);
        ctx.lineTo(node._spouseX, node._spouseY);
        ctx.strokeStyle = isLight ? "#e11d48dd" : "#f43f5ecc";
        ctx.lineWidth = 2.8;
        ctx.stroke();

        // Icon cincin di tengah ikatan
        const midX = (node._renderX + node._spouseX) / 2;
        const midY = (node._renderY + node._spouseY) / 2;
        ctx.save();
        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("💍", midX, midY - 6);
        ctx.restore();

        // Frame Pasangan (Warna Rose Pink Kontras & Beda Warna)
        drawFrameShapePath(ctx, node._spouseX, node._spouseY, spouseR, spouseShape);
        ctx.fillStyle = isLight ? "#e11d48" : "#be123c";
        ctx.fill();
        ctx.strokeStyle = isLight ? "#fb7185" : "#fda4af";
        ctx.lineWidth = 2.8;
        ctx.stroke();

        // Text Pasangan dengan Kapsul Anti-Tumpang Tindih
        ctx.save();
        ctx.translate(node._spouseX, node._spouseY);

        ctx.font = "bold 11px sans-serif";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText("💍", 0, 4);

        ctx.font = "bold 10px sans-serif";
        const spouseTextWidth = ctx.measureText(node.spouseName).width;
        const sPillWidth = Math.max(spouseTextWidth + 16, 75);

        ctx.fillStyle = isLight ? "#fff1f2fa" : "#070b14ea";
        ctx.beginPath();
        ctx.roundRect(-sPillWidth / 2, spouseR + 4, sPillWidth, 32, 6);
        ctx.fill();
        ctx.strokeStyle = isLight ? "#f43f5e" : "#fda4af88";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = isLight ? "#be123c" : "#fda4af";
        ctx.fillText(node.spouseName, 0, spouseR + 16);

        ctx.font = "9px sans-serif";
        ctx.fillStyle = isLight ? "#e11d48" : "#f43f5e";
        ctx.fillText("Pasangan (Berdampingan)", 0, spouseR + 29);

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
  }, [familyTree, showConnectingLines, orbitSpreadMode, lineCurveStyle, globalFrameShape, showOrderSequenceLines, currentTheme, lineageStructureMode]);

  useEffect(() => {
    renderCanvas();
  }, [familyTree, showConnectingLines, orbitSpreadMode, lineCurveStyle, selectedNode, globalFrameShape, showOrderSequenceLines, currentTheme, lineageStructureMode]);

  // -------------------------------------------------------------
  // MOUSE & TOUCH GESTURES (DRAGGING CAMERA ATAU DRAGGING BINTANG DI ORBIT)
  // -------------------------------------------------------------
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const { x: camX, y: camY, zoom } = cameraRef.current;
    const worldX = (clickX - canvas.width / 2 - camX) / zoom;
    const worldY = (clickY - canvas.height / 2 - camY) / zoom;

    // Cek apakah mouse menekan salah satu node untuk di-drag sepanjang orbit
    for (const node of familyTree.nodes) {
      if (node.gen > -3 && node._renderX !== undefined && node._renderY !== undefined) {
        const dx = worldX - node._renderX;
        const dy = worldY - node._renderY;
        if (Math.sqrt(dx * dx + dy * dy) <= 24) {
          nodeDragRef.current = {
            isDraggingNode: true,
            nodeId: node.id,
            quadrant: node.quadrant,
            hasDragged: false
          };
          return;
        }
      }
    }

    // Default: Drag Kamera / Pan
    dragRef.current.isDraggingCamera = true;
    dragRef.current.hasMoved = false;
    dragRef.current.startX = e.clientX;
    dragRef.current.startY = e.clientY;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 1. Interactive Node Dragging (Menggeser bintang bebas sepanjang garis orbit)
    if (nodeDragRef.current.isDraggingNode && nodeDragRef.current.nodeId) {
      nodeDragRef.current.hasDragged = true;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const { x: camX, y: camY, zoom } = cameraRef.current;
      const worldX = (clickX - canvas.width / 2 - camX) / zoom;
      const worldY = (clickY - canvas.height / 2 - camY) / zoom;

      const targetId = nodeDragRef.current.nodeId;
      const targetNode = familyTree.nodes.find(n => n.id === targetId);
      if (targetNode) {
        const q = familyTree.quadrants[targetNode.quadrant || 'Q1'];
        const newAngle = Math.atan2(worldY - q.center.y, worldX - q.center.x);
        targetNode.customAngle = newAngle;
        renderCanvas();
      }
      return;
    }

    // 2. Camera Panning
    if (!dragRef.current.isDraggingCamera) return;
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
    // Selesai drag bintang di orbit
    if (nodeDragRef.current.isDraggingNode) {
      if (nodeDragRef.current.hasDragged) {
        setFamilyTree({ ...familyTree });
        addLog('Ubah Posisi Bintang', 'Posisi bintang di garis orbit disesuaikan secara visual.');
        showNotification?.('Posisi bintang di rasi silsilah berhasil disimpan!');
      }
      nodeDragRef.current.isDraggingNode = false;
      nodeDragRef.current.nodeId = null;
      return;
    }

    dragRef.current.isDraggingCamera = false;
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
      dragRef.current.isDraggingCamera = true;
      dragRef.current.hasMoved = false;
      dragRef.current.startX = e.touches[0].clientX;
      dragRef.current.startY = e.touches[0].clientY;
    } else if (e.touches.length === 2) {
      dragRef.current.isDraggingCamera = false;
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      dragRef.current.initialPinchDist = Math.sqrt(dx * dx + dy * dy);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 1 && dragRef.current.isDraggingCamera) {
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
    dragRef.current.isDraggingCamera = false;
    dragRef.current.initialPinchDist = 0;
  };

  // Node Click: Admin Modal vs User Claim/Keluarga Inti Modal
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragRef.current.hasMoved || nodeDragRef.current.hasDragged) return;

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

    // Klik pada area kosong: batalkan sorotan
    setSelectedNode(null);
  };

  const openNodeModal = (node: OrbitNode) => {
    setSelectedNode(node);
    setCustomParentName(node.parentId || '');
    setParentSelectMode('existing');

    setClaimNameInput(node.name || '');
    setClaimSpouseInput(node.spouseName || '');
    setClaimNotesInput(node.notes || '');
    setClaimBirthYearInput(node.birthYear || '');
    setClaimDeathYearInput(node.deathYear || '');
    setClaimStatusInput(node.status || 'Hidup');
    setClaimOriginInput(node.origin || '');
    setClaimPhotoUrlInput(node.photoUrl || '');
    setClaimFrameShapeInput(node.frameShape || globalFrameShape);

    if (isAdminMode) {
      setShowAdminEditModal(true);
    } else {
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

  // Nudge sudut orbit secara presisi
  const handleNudgeAngle = (node: OrbitNode, delta: number) => {
    const current = node.customAngle !== undefined ? node.customAngle : (node._angle || 0);
    const updated = current + delta;
    const updatedNode = { ...node, customAngle: updated };
    setSelectedNode(updatedNode);
    setFamilyTree(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => (n.id === node.id ? updatedNode : n))
    }));
    showNotification?.(`Posisi ${node.name} digeser di garis orbit rasi bintang.`);
    renderCanvas();
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
              birthYear: claimBirthYearInput.trim() || undefined,
              deathYear: claimDeathYearInput.trim() || undefined,
              status: claimStatusInput,
              origin: claimOriginInput.trim() || undefined,
              photoUrl: claimPhotoUrlInput.trim() || undefined,
              frameShape: claimFrameShapeInput,
              notes: claimNotesInput.trim() || undefined
            }
          : n
      )
    }));

    addLog('Klaim User', `Profil ${claimNameInput || selectedNode.name} diklaim oleh User. Pasangan: ${claimSpouseInput || 'Tidak diisi'}`);
    setShowUserClaimModal(false);
    showNotification?.('Profil & Data Keluarga Inti berhasil disimpan!');
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
              spouseName: selectedNode.spouseName,
              customAngle: selectedNode.customAngle,
              birthYear: selectedNode.birthYear,
              deathYear: selectedNode.deathYear,
              status: selectedNode.status,
              origin: selectedNode.origin,
              photoUrl: selectedNode.photoUrl,
              frameShape: selectedNode.frameShape,
              notes: selectedNode.notes
            }
          : n
      )
    }));

    addLog('Admin Edit Mutlak', `Admin memperbarui ${selectedNode.name} [Induk: ${finalParentId || 'Auto'}, Garis: ${selectedNode.hideLine ? 'Putus' : 'Aktif'}]`);
    setShowAdminEditModal(false);
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
      role: "Uyut Utama (Pusat Bintang)",
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

    // 2. Ayah / Paman / Bibi (Orbit 2) - Dihubungkan ke Kakek No. 2
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

    // 3. User & Saudara (Orbit 3) - Dihubungkan ke Ayah No. 2
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

    // 5. Cucu (Orbit 5)
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

    // 6. Cicit (Orbit 6)
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

    addLog('Batch Admin Mutlak', `Admin memperbarui garis rasi bintang kuadran ${batchQuadrant}.`);

    setFamilyTree({
      ...familyTree,
      nodes: [...otherQuadrantNodes, ...newQuadrantNodes]
    });

    setShowBatchModal(false);
    showNotification?.(`🚀 Silsilah ${batchQuadrant} berhasil diperbarui di rasi bintang!`);
    renderCanvas();
  };

  // Opsi Calon Orang Tua (Orbit N-1) untuk Modal Admin
  const candidateParents = selectedNode
    ? familyTree.nodes.filter(n => n.quadrant === selectedNode.quadrant && n.gen === selectedNode.gen - 1)
    : [];

  return (
    <div className={`w-full h-full relative flex flex-col ${isLight ? 'bg-slate-50 text-slate-800' : 'bg-[#070b14] text-slate-100'} overflow-hidden font-sans select-none transition-colors duration-200`}>
      {/* ------------------------------------------------------------- */}
      {/* HEADER / TOP BAR                                              */}
      {/* ------------------------------------------------------------- */}
      <header className={`z-20 ${isLight ? 'bg-white/95 border-b border-slate-200 text-slate-800 shadow-xs' : 'bg-slate-900/95 border-b border-slate-800 text-slate-100'} backdrop-blur px-3 sm:px-4 py-2.5 flex items-center justify-between shadow-md gap-2 shrink-0`}>
        <div className="flex items-center gap-2 shrink-0">
          {onBackToLeluhurQu && (
            <button
              onClick={onBackToLeluhurQu}
              className={`p-1 -ml-1 ${isLight ? 'text-slate-500 hover:text-emerald-700' : 'text-slate-400 hover:text-emerald-400'} rounded-lg transition active:scale-95`}
              title="Kembali ke Tab Silsilah"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-slate-950 text-xs shadow-md shrink-0">
            LQ
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className={`font-bold text-sm leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>Leluhur<span className="text-emerald-500">Qu</span></h1>
              <span className={`text-[9px] ${isLight ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-950/80 text-emerald-300 border-emerald-500/30'} border px-1.5 py-0.5 rounded font-mono font-semibold`}>
                OrbitQu
              </span>
            </div>
            <p className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-slate-400'} leading-tight`}>
              Core Ancestor → Outer Cicit Expansion
            </p>
          </div>
        </div>

        {/* TOP RIGHT: THEME TOGGLE, BATCH ISI CEPAT & BUKU BESAR */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Tombol Tema Dark / Light */}
          <button
            onClick={toggleTheme}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border cursor-pointer active:scale-95 ${
              isLight
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
            }`}
            title={`Beralih ke mode ${isLight ? 'Gelap (Dark Space)' : 'Terang (Light Heritage)'}`}
          >
            {isLight ? <Sun className="w-3.5 h-3.5 text-amber-600" /> : <Moon className="w-3.5 h-3.5 text-amber-300" />}
            <span className="text-[11px] font-bold">{isLight ? 'Terang' : 'Gelap'}</span>
          </button>

          <button
            onClick={handleOpenBatchModal}
            className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-slate-950 text-xs font-semibold px-3 py-1.5 rounded-lg transition shadow-md flex items-center gap-1.5 cursor-pointer"
            title="Input Cepat (Batch) Kerangka Silsilah"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span className="hidden sm:inline">⚡ Input Cepat (Batch)</span>
            <span className="sm:hidden">⚡ Batch</span>
          </button>

          <button
            onClick={() => setShowLedgerModal(true)}
            className={`text-xs border px-2.5 sm:px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 active:scale-95 ${
              isLight
                ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
            title="Buka Buku Besar Riwayat Perubahan"
          >
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">📜 Buku Besar</span>
            <span className="sm:hidden">📜 Ledger</span>
          </button>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* SUB-HEADER TOOLBAR (DI BAWAH HEADER)                          */}
      {/* Mode Switcher: Notasi Batch vs Rasi Kosmik + Kontrol Garis     */}
      {/* ------------------------------------------------------------- */}
      <div className={`z-10 ${isLight ? 'bg-slate-100/95 border-b border-slate-200 text-slate-700' : 'bg-slate-900/90 border-b border-slate-800/80 text-slate-300'} backdrop-blur px-3 py-1.5 flex items-center justify-between gap-2 overflow-x-auto shrink-0 shadow-xs no-scrollbar`}>
        {/* Left: Mode Switcher & Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* TOGGLE UTAMA: BAGAN NOTASI BATCH vs RASI KOSMIK */}
          <div className={`flex items-center p-0.5 rounded-lg border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-slate-700'}`}>
            <button
              onClick={() => {
                setActiveRendererMode('batch_tree');
                showNotification?.('🌳 Mode Bagan Notasi Batch (Advanced Line & Anti-Numpuk) Aktif');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeRendererMode === 'batch_tree'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Bagan Notasi Batch</span>
            </button>
            <button
              onClick={() => {
                setActiveRendererMode('orbit');
                showNotification?.('🌌 Mode Rasi Bintang Orbit Kosmik Aktif');
              }}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer ${
                activeRendererMode === 'orbit'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Rasi Orbit Kosmik</span>
            </button>
          </div>

          {/* KONTROL KHUSUS MODE NOTASI BATCH */}
          {activeRendererMode === 'batch_tree' ? (
            <>
              {/* OPSI STRUKTUR GARIS KETURUNAN: LINIER / SERI / PARALEL */}
              <div className={`flex items-center p-0.5 rounded-lg border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-slate-700'}`}>
                <span className="text-[10px] font-bold px-1.5 opacity-70 hidden sm:inline">Struktur:</span>
                <button
                  onClick={() => {
                    setLineageStructureMode('linier');
                    showNotification?.('⚡ Struktur Keturunan: LINIER (Poros Lurus Tegas Uyut ➔ Kakek ➔ Ayah ➔ Anak ➔ Cucu)');
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    lineageStructureMode === 'linier'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                  title="Garis Keturunan Linier: Poros lurus tegak langsung menghubungkan Uyut - Kakek - Ayah - Anak - Cucu"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Linier</span>
                </button>

                <button
                  onClick={() => {
                    setLineageStructureMode('seri');
                    showNotification?.('🔀 Struktur Keturunan: SERI (Sirkuit Bus Rel 90° & Terminal Percabangan Uyut ➔ Cucu)');
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    lineageStructureMode === 'seri'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                  title="Garis Keturunan Seri: Jalur rel sirkuit orthogonal bertingkat dengan junction terminal"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>Seri</span>
                </button>

                <button
                  onClick={() => {
                    setLineageStructureMode('paralel');
                    showNotification?.('🔱 Struktur Keturunan: PARALEL (Cabang Kurva Bezier Menyebar Sejajar)');
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    lineageStructureMode === 'paralel'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                  title="Garis Keturunan Paralel: Cabang kapling menyebar dengan kurva Bezier mulus bebas benturan"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Paralel</span>
                </button>
              </div>

              {/* OPSI HUBUNGAN ANAK KE 1, 2, 3, 4, 5, 6, 7 dst: PARALEL / SERI / PARALEL & SERI */}
              <div className={`flex items-center p-0.5 rounded-lg border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-slate-700'}`}>
                <span className="text-[10px] font-bold px-1.5 opacity-70 hidden sm:inline">Anak (1-7+):</span>
                <button
                  onClick={() => {
                    setSiblingCircuitMode('paralel');
                    setShowOrderSequenceLines(false);
                    showNotification?.('🔱 Anak (1-7+): PARALEL (Tiap anak terhubung mandiri langsung ke orang tua)');
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    siblingCircuitMode === 'paralel'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                  title="Paralel: Masing-masing anak (ke-1, 2, 3, 4, 5, 6, 7, dst) memiliki jalur vertikal independen langsung dari orang tua"
                >
                  <Network className="w-3.5 h-3.5" />
                  <span>Paralel</span>
                </button>

                <button
                  onClick={() => {
                    setSiblingCircuitMode('seri');
                    setShowOrderSequenceLines(true);
                    showNotification?.('🔀 Anak (1-7+): SERI (Sirkuit Berantai: Ayah ➔ Anak 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 6 ➔ 7 dst)');
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    siblingCircuitMode === 'seri'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                  title="Seri: Jalur berantai berurutan dari Anak Sulung ke Bungsu (Anak 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 6 ➔ 7)"
                >
                  <GitMerge className="w-3.5 h-3.5" />
                  <span>Seri</span>
                </button>

                <button
                  onClick={() => {
                    setSiblingCircuitMode('paralel_seri');
                    setShowOrderSequenceLines(true);
                    showNotification?.('⚡ Anak (1-7+): PARALEL / SERI (Cabang Paralel + Bus Sirkuit Seri Anak 1 ➔ 7+)');
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition cursor-pointer ${
                    siblingCircuitMode === 'paralel_seri'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white')
                  }`}
                  title="Paralel / Seri: Hibrida jalur cabang pohon paralel ke semua anak DITAMBAH bus rel seri penghubung urutan kelahiran (Anak 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 6 ➔ 7)"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Paralel / Seri</span>
                </button>
              </div>

              {/* Opsi Gaya Garis: Single, Double, Triple */}
              <button
                onClick={() => {
                  const styles: Array<'double' | 'triple' | 'single'> = ['double', 'triple', 'single'];
                  const nextIdx = (styles.indexOf(lineStylePattern) + 1) % styles.length;
                  const next = styles[nextIdx];
                  setLineStylePattern(next);
                  const label = next === 'double' ? 'Double (2 Jalur Paralel)' : next === 'triple' ? 'Triple (3 Rel Sirkuit)' : 'Single (1 Jalur Utama)';
                  showNotification?.(`Gaya Garis: ${label}`);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                  lineStylePattern === 'double'
                    ? 'bg-sky-600 text-white border-sky-400 shadow-xs'
                    : lineStylePattern === 'triple'
                    ? 'bg-purple-600 text-white border-purple-400 shadow-xs'
                    : (isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700')
                }`}
                title="Pilihan Gaya Garis Hubung: Double (2 Jalur), Triple (3 Kabel Rel), atau Single"
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Garis: {lineStylePattern === 'double' ? 'Double (2 Jalur)' : lineStylePattern === 'triple' ? 'Triple (3 Rel)' : 'Single (1 Jalur)'}</span>
              </button>

              {/* Arah Susunan Pohon: Bawah ke Atas vs Atas ke Bawah */}
              <button
                onClick={() => {
                  const next = treeDirection === 'bottom-up' ? 'top-down' : 'bottom-up';
                  setTreeDirection(next);
                  showNotification?.(next === 'bottom-up' ? 'Arah: Bawah ke Atas (Akar di Bawah)' : 'Arah: Atas ke Bawah (Pohon Klasik)');
                }}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                  isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                title="Arah Susunan Pohon Silsilah"
              >
                {treeDirection === 'bottom-up' ? <ArrowUp className="w-3.5 h-3.5 text-amber-500" /> : <ArrowDown className="w-3.5 h-3.5 text-sky-500" />}
                <span>{treeDirection === 'bottom-up' ? 'Bawah ➔ Atas' : 'Atas ➔ Bawah'}</span>
              </button>

              {/* Sumber Data: Silsilah Utama vs Contoh Spesifikasi 12 Node (Uyut-Cucu) */}
              <button
                onClick={() => {
                  const next = batchDataSource === 'main' ? 'sample' : 'main';
                  setBatchDataSource(next);
                  showNotification?.(next === 'sample' ? 'Memuat 12 Anggota Contoh Spesifikasi (Uyut -> Kakek -> Ayah -> Anak -> Cucu)' : 'Memuat Seluruh Silsilah Keluarga Utama');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition border cursor-pointer ${
                  batchDataSource === 'sample'
                    ? 'bg-amber-500 text-slate-950 font-bold border-amber-300 shadow-xs'
                    : (isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700')
                }`}
                title="Beralih Sumber Data: Silsilah Utama Aktif vs Contoh Spesifikasi 5 Generasi"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{batchDataSource === 'sample' ? 'Data: Contoh 5 Gen' : 'Data: Silsilah Utama'}</span>
              </button>
            </>
          ) : (
            <>
              {/* OPSI STRUKTUR GARIS PADA RASI ORBIT KOSMIK */}
              <div className={`flex items-center p-0.5 rounded-lg border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-slate-700'}`}>
                <button
                  onClick={() => {
                    setLineageStructureMode('linier');
                    setLineCurveStyle('straight');
                    showNotification?.('⚡ Garis Rasi Bintang: LINIER (Sinar Radial Lurus Pusat Uyut ke Cucu)');
                    renderCanvas();
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                    lineageStructureMode === 'linier' ? 'bg-amber-500 text-slate-950 shadow-xs' : (isLight ? 'text-slate-600' : 'text-slate-400')
                  }`}
                  title="Garis Keturunan Linier: Sinar radial lurus dari Uyut ke Cucu"
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Linier</span>
                </button>
                <button
                  onClick={() => {
                    setLineageStructureMode('seri');
                    showNotification?.('🔀 Garis Rasi Bintang: SERI (Bus Rel Berantai Antar Orbit)');
                    renderCanvas();
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                    lineageStructureMode === 'seri' ? 'bg-purple-600 text-white shadow-xs' : (isLight ? 'text-slate-600' : 'text-slate-400')
                  }`}
                  title="Garis Keturunan Seri: Bus sirkuit bertingkat antar orbit"
                >
                  <GitMerge className="w-3 h-3" />
                  <span>Seri</span>
                </button>
                <button
                  onClick={() => {
                    setLineageStructureMode('paralel');
                    setLineCurveStyle('curved');
                    showNotification?.('🔱 Garis Rasi Bintang: PARALEL (Lengkung Radial Sektor Orbit)');
                    renderCanvas();
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                    lineageStructureMode === 'paralel' ? 'bg-sky-600 text-white shadow-xs' : (isLight ? 'text-slate-600' : 'text-slate-400')
                  }`}
                  title="Garis Keturunan Paralel: Lengkung halus rasi bintang"
                >
                  <Network className="w-3 h-3" />
                  <span>Paralel</span>
                </button>
              </div>

              {/* Pola Kipas Kosmik (Anti-Bersebrangan) vs Melingkar */}
              <button
                onClick={() => {
                  const next = orbitSpreadMode === 'fan' ? 'circle' : 'fan';
                  setOrbitSpreadMode(next);
                  showNotification?.(next === 'fan' ? '🌌 Pola Kipas Kosmik aktif (Percabangan melebar keluar tanpa menyebrang).' : '🪐 Pola Melingkar 360° aktif.');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition border ${
                  orbitSpreadMode === 'fan'
                    ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-xs'
                    : (isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700')
                }`}
                title="Klik untuk ubah pola sebaran: Kipas Kosmik (Anti-Bersebrangan) vs Melingkar 360°"
              >
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                <span>{orbitSpreadMode === 'fan' ? 'Pola: Kipas Kosmik' : 'Pola: Melingkar 360°'}</span>
              </button>

              {/* Gaya Garis Rasi Bintang Melengkung vs Lurus */}
              <button
                onClick={() => {
                  const next = lineCurveStyle === 'curved' ? 'straight' : 'curved';
                  setLineCurveStyle(next);
                  showNotification?.(next === 'curved' ? '✨ Garis rasi bintang melengkung halus aktif.' : '📏 Garis lurus konvensional aktif.');
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition border ${
                  lineCurveStyle === 'curved'
                    ? 'bg-sky-600/90 border-sky-400 text-white shadow-xs'
                    : (isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700')
                }`}
                title="Klik untuk ubah gaya garis: Rasi Melengkung vs Lurus"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>{lineCurveStyle === 'curved' ? 'Garis: Melengkung' : 'Garis: Lurus'}</span>
              </button>

              {/* OPSI HUBUNGAN ANAK / SAUDARA (1, 2, 3.. 7): PARALEL / SERI / PARALEL & SERI */}
              <div className={`flex items-center p-0.5 rounded-lg border ${isLight ? 'bg-slate-200 border-slate-300' : 'bg-slate-800 border-slate-700'}`}>
                <span className="text-[10px] font-bold px-1.5 opacity-70 hidden sm:inline">Anak (1-7+):</span>
                <button
                  onClick={() => {
                    setSiblingCircuitMode('paralel');
                    setShowOrderSequenceLines(false);
                    showNotification?.('🔱 Anak (1-7+): PARALEL (Radial langsung dari pusat/induk orbit)');
                    renderCanvas();
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                    siblingCircuitMode === 'paralel' && !showOrderSequenceLines
                      ? 'bg-sky-600 text-white shadow-xs'
                      : (isLight ? 'text-slate-600' : 'text-slate-400')
                  }`}
                  title="Paralel: Masing-masing anak berorbit langsung mandiri"
                >
                  <Network className="w-3 h-3" />
                  <span>Paralel</span>
                </button>
                <button
                  onClick={() => {
                    setSiblingCircuitMode('seri');
                    setShowOrderSequenceLines(true);
                    showNotification?.('🔀 Anak (1-7+): SERI (Bus Rel Berantai Antar Urutan Anak 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 6 ➔ 7)');
                    renderCanvas();
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                    siblingCircuitMode === 'seri'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : (isLight ? 'text-slate-600' : 'text-slate-400')
                  }`}
                  title="Seri: Sambungan bus berantai berurutan dari Sulung ke Bungsu"
                >
                  <GitMerge className="w-3 h-3" />
                  <span>Seri</span>
                </button>
                <button
                  onClick={() => {
                    setSiblingCircuitMode('paralel_seri');
                    setShowOrderSequenceLines(true);
                    showNotification?.('⚡ Anak (1-7+): PARALEL / SERI (Radial Induk + Rantai Urutan Anak 1-7+)');
                    renderCanvas();
                  }}
                  className={`px-2 py-1 rounded-md text-[11px] font-bold flex items-center gap-1 transition ${
                    siblingCircuitMode === 'paralel_seri'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : (isLight ? 'text-slate-600' : 'text-slate-400')
                  }`}
                  title="Paralel / Seri: Garis radial induk orbit ditambah garis sambung konstelasi nomor urut (1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 6 ➔ 7)"
                >
                  <Share2 className="w-3 h-3" />
                  <span>Paralel / Seri</span>
                </button>
              </div>

              {/* OPSI FRAME FOTO BULAT / KOTAK / SEGI 6 */}
              <button
                onClick={() => {
                  const shapes: Array<'circle' | 'square' | 'hexagon'> = ['circle', 'square', 'hexagon'];
                  const nextIdx = (shapes.indexOf(globalFrameShape) + 1) % shapes.length;
                  const next = shapes[nextIdx];
                  setGlobalFrameShape(next);
                  const label = next === 'circle' ? 'Bulat ⚪' : (next === 'square' ? 'Kotak ⬛' : 'Segi-6 ⬡');
                  showNotification?.(`Bentuk frame foto profil diubah ke: ${label}`);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition border ${
                  isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
                title="Ganti bentuk frame bintang & foto: Bulat, Kotak, atau Segi 6"
              >
                {globalFrameShape === 'circle' && <Circle className="w-3.5 h-3.5 text-emerald-500" />}
                {globalFrameShape === 'square' && <Square className="w-3.5 h-3.5 text-sky-500" />}
                {globalFrameShape === 'hexagon' && <Hexagon className="w-3.5 h-3.5 text-amber-500" />}
                <span>
                  {globalFrameShape === 'circle' ? 'Frame: Bulat' : (globalFrameShape === 'square' ? 'Frame: Kotak' : 'Frame: Segi-6')}
                </span>
              </button>

              {/* Mode Admin: Garis On / Off */}
              {isAdminMode && (
                <button
                  onClick={() => {
                    setShowConnectingLines(!showConnectingLines);
                    showNotification?.(!showConnectingLines ? 'Garis konektor diaktifkan.' : 'Garis konektor disembunyikan/dihapus.');
                  }}
                  className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1 ${
                    showConnectingLines
                      ? (isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300')
                      : (isLight ? 'bg-rose-100 border-rose-300 text-rose-800' : 'bg-rose-950/40 border-rose-500/50 text-rose-300')
                  }`}
                  title="Admin: Tampilkan atau Hapus/Sembunyikan Garis Hubung"
                >
                  {showConnectingLines ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  <span>{showConnectingLines ? 'Garis: On' : 'Garis: Off'}</span>
                </button>
              )}
            </>
          )}

          {/* Mode Switch: Admin Trah vs User Warga */}
          <button
            onClick={() => {
              setIsAdminMode(!isAdminMode);
              showNotification?.(!isAdminMode ? '🛡️ Mode Admin Trah Aktif' : '👤 Mode User Warga Aktif');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition border ${
              isAdminMode
                ? 'bg-amber-600 border-amber-400 text-slate-950 font-bold'
                : (isLight ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50' : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700')
            }`}
            title="Beralih peran: Admin (Pengelola Silsilah Mutlak) vs User (Klaim & Keluarga Inti)"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Peran: {isAdminMode ? 'Admin' : 'User'}</span>
          </button>
        </div>

        {/* Right: Simpan Silsilah & Hapus Semua */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleSaveTreeData}
            className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-[11px] px-3 py-1 rounded-lg transition active:scale-95 flex items-center gap-1.5 shadow-sm cursor-pointer"
            title="Simpan seluruh silsilah dan lanjutkan pengeditan kapan saja"
          >
            <Save className="w-3.5 h-3.5 fill-current" />
            <span>Simpan Silsilah</span>
          </button>

          <button
            onClick={() => setShowDeleteConfirmModal(true)}
            className={`text-[11px] border px-2.5 py-1 rounded-lg transition active:scale-95 flex items-center gap-1 cursor-pointer ${
              isLight
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                : 'bg-rose-950/40 hover:bg-rose-900 text-rose-300 border-rose-800/40'
            }`}
            title="Bersihkan / Hapus Semua Silsilah (Dengan Popup Konfirmasi)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Hapus Semua</span>
            <span className="sm:hidden">Hapus</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* CANVAS / INTERACTIVE MAP AREA                                  */}
      {/* ------------------------------------------------------------- */}
      <main className="relative w-full flex-1 touch-none overflow-hidden">
        {activeRendererMode === 'batch_tree' ? (
          <div
            className="w-full h-full relative overflow-hidden select-none cursor-grab active:cursor-grabbing"
            onMouseDown={handleSvgMouseDown}
            onMouseMove={handleSvgMouseMove}
            onMouseUp={handleSvgMouseUp}
            onMouseLeave={handleSvgMouseUp}
            onTouchStart={handleSvgTouchStart}
            onTouchMove={handleSvgTouchMove}
            onTouchEnd={handleSvgTouchEnd}
            onWheel={handleSvgWheel}
            style={{ backgroundColor: isLight ? '#f8fafc' : '#0b1120' }}
          >
            <svg
              id="treeCanvas"
              className="w-full h-full block"
              style={{ background: isLight ? '#f8fafc' : '#0b1120' }}
            >
              <g transform={`translate(${svgCamera.x}, ${svgCamera.y}) scale(${svgCamera.zoom})`}>
                {/* 1. LINES GROUP */}
                <g id="linesGroup">
                  {renderedConnections}
                </g>

                {/* 2. NODES GROUP */}
                <g id="nodesGroup">
                  {renderedNodes}
                </g>
              </g>
            </svg>

            {/* Info Legend Badge di pojok kiri atas */}
            <div className={`absolute top-3 left-3 z-10 px-3 py-2 rounded-xl border backdrop-blur-md shadow-md pointer-events-none text-xs ${
              isLight ? 'bg-white/95 border-slate-200 text-slate-700' : 'bg-slate-900/95 border-slate-800 text-slate-200'
            }`}>
              <div className="flex items-center gap-2 font-mono font-bold text-[11px] flex-wrap">
                <span className="text-amber-500 font-extrabold">[Universal ID]</span>
                <span>• Struktur: <span className="uppercase text-emerald-400 font-bold">{lineageStructureMode}</span></span>
                <span>• Anak (1-7+): <span className="uppercase text-sky-400 font-bold">{siblingCircuitMode === 'paralel_seri' ? 'PARALEL / SERI' : siblingCircuitMode}</span></span>
                <span className="text-[10px] text-slate-400">({lineStylePattern})</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1 flex-wrap">
                <span className="font-semibold text-slate-300">5 Generasi:</span>
                <span className="text-orange-400 font-bold">0. Uyut</span>
                <span>➔</span>
                <span className="text-purple-400 font-bold">1. Kakek</span>
                <span>➔</span>
                <span className="text-blue-400 font-bold">2. Ayah</span>
                <span>➔</span>
                <span className="text-emerald-400 font-bold">3. Anak (1..7+)</span>
                <span>➔</span>
                <span className="text-cyan-400 font-bold">4. Cucu</span>
              </div>
            </div>

            {/* FLOATING NAVIGATION (ZOOM, GPS, RESET) KHUSUS SVG */}
            <div className="absolute bottom-6 right-3 sm:right-6 z-20 flex flex-col gap-2">
              <button
                onClick={handleSvgZoomIn}
                className={`w-9 h-9 sm:w-10 sm:h-10 ${
                  isLight
                    ? 'bg-white/95 border border-slate-300 text-slate-800 shadow-md hover:bg-slate-100'
                    : 'bg-slate-800/90 border border-slate-700 text-white shadow-lg hover:bg-slate-700'
                } rounded-xl flex items-center justify-center text-lg font-bold active:scale-95 transition`}
                title="Perbesar Tampilan"
              >
                +
              </button>
              <button
                onClick={handleSvgZoomOut}
                className={`w-9 h-9 sm:w-10 sm:h-10 ${
                  isLight
                    ? 'bg-white/95 border border-slate-300 text-slate-800 shadow-md hover:bg-slate-100'
                    : 'bg-slate-800/90 border border-slate-700 text-white shadow-lg hover:bg-slate-700'
                } rounded-xl flex items-center justify-center text-lg font-bold active:scale-95 transition`}
                title="Perkecil Tampilan"
              >
                -
              </button>
              <button
                onClick={handleSvgCenter}
                className="h-9 sm:h-10 px-2.5 sm:px-3 bg-emerald-600 border border-emerald-400/30 rounded-xl flex items-center justify-center text-[11px] font-bold shadow-lg hover:bg-emerald-500 active:scale-95 transition gap-1.5 text-slate-950"
                title="Fokus ke User [0.1.1.1] / Akar [0]"
              >
                <Crosshair className="w-4 h-4" />
                <span>Fokus User</span>
              </button>
              <button
                onClick={handleSvgReset}
                className={`w-9 h-9 sm:w-10 sm:h-10 ${
                  isLight
                    ? 'bg-white/95 border border-slate-300 text-slate-800 shadow-md hover:bg-slate-100'
                    : 'bg-slate-800/90 border border-slate-700 text-white shadow-lg hover:bg-slate-700'
                } rounded-xl flex items-center justify-center text-xs font-bold active:scale-95 transition`}
                title="Reset Posisi Kamera"
              >
                <RotateCcw className="w-4 h-4 text-sky-400" />
              </button>
            </div>
          </div>
        ) : (
          <>
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

            {/* FLOATING NAVIGATION (ZOOM, GPS) KHUSUS CANVAS */}
            <div className="absolute bottom-6 right-3 sm:right-6 z-20 flex flex-col gap-2">
              <button
                onClick={handleZoomIn}
                className={`w-9 h-9 sm:w-10 sm:h-10 ${
                  isLight
                    ? 'bg-white/95 border border-slate-300 text-slate-800 shadow-md hover:bg-slate-100'
                    : 'bg-slate-800/90 border border-slate-700 text-white shadow-lg hover:bg-slate-700'
                } rounded-xl flex items-center justify-center text-lg font-bold active:scale-95 transition`}
                title="Perbesar Orbit"
              >
                +
              </button>
              <button
                onClick={handleZoomOut}
                className={`w-9 h-9 sm:w-10 sm:h-10 ${
                  isLight
                    ? 'bg-white/95 border border-slate-300 text-slate-800 shadow-md hover:bg-slate-100'
                    : 'bg-slate-800/90 border border-slate-700 text-white shadow-lg hover:bg-slate-700'
                } rounded-xl flex items-center justify-center text-lg font-bold active:scale-95 transition`}
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
                <span>GPS Center</span>
              </button>
            </div>
          </>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* POPUP PERINGATAN KONFIRMASI HAPUS SILSILAH                   */}
      {/* ------------------------------------------------------------- */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-rose-500/40 w-full max-w-sm rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/50 flex items-center justify-center text-rose-400 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-rose-400">Peringatan: Hapus Seluruh Silsilah?</h3>
                <p className="text-[11px] text-slate-400">Konfirmasi tindakan penghapusan</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-rose-950/30 p-3 rounded-xl border border-rose-900/40">
              Apakah Anda yakin ingin menghapus seluruh susunan data silsilah di kanvas orbit? Semua generasi dan hubungan keluarga akan dikosongkan. <strong>Tindakan ini tidak dapat dibatalkan.</strong>
            </p>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowDeleteConfirmModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmClearAllData}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md transition"
              >
                Ya, Hapus Semua
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL USER: KLAIM & KELUARGA INTI (PASANGAN, FOTO & DATA)     */}
      {/* ------------------------------------------------------------- */}
      {showUserClaimModal && selectedNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-4 sm:p-5 shadow-2xl flex flex-col gap-3 text-slate-100 max-h-[92vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-sky-600/30 text-sky-400 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-sky-400" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-sky-400">
                    Klaim &amp; Data Profil Lengkap
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Bintang: <strong>{selectedNode.name}</strong> ({selectedNode.order})
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

              {/* Lahir - Wafat & Status */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-sky-400" />
                    Tahun Lahir
                  </label>
                  <input
                    type="text"
                    value={claimBirthYearInput}
                    onChange={e => setClaimBirthYearInput(e.target.value)}
                    placeholder="cth: 1992"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-sky-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tahun Wafat</label>
                  <input
                    type="text"
                    value={claimDeathYearInput}
                    onChange={e => setClaimDeathYearInput(e.target.value)}
                    placeholder="cth: 2020"
                    disabled={claimStatusInput === 'Hidup'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-sky-500 disabled:opacity-40 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Status</label>
                  <select
                    value={claimStatusInput}
                    onChange={e => setClaimStatusInput(e.target.value as 'Hidup' | 'Almarhum')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-sky-500 text-xs"
                  >
                    <option value="Hidup">Hidup</option>
                    <option value="Almarhum">Almarhum</option>
                  </select>
                </div>
              </div>

              {/* Alamat / Kota Asal */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  Alamat / Kota Asal
                </label>
                <input
                  type="text"
                  value={claimOriginInput}
                  onChange={e => setClaimOriginInput(e.target.value)}
                  placeholder="Contoh: Bandung, Jawa Barat"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-sky-500 text-xs"
                />
              </div>

              {/* Foto Profil & Bentuk Frame */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
                    Foto Profil &amp; Frame Bintang
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setClaimFrameShapeInput('circle')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        claimFrameShapeInput === 'circle' ? 'bg-sky-600 border-sky-400 text-white' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      Bulat ⚪
                    </button>
                    <button
                      type="button"
                      onClick={() => setClaimFrameShapeInput('square')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        claimFrameShapeInput === 'square' ? 'bg-sky-600 border-sky-400 text-white' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      Kotak ⬛
                    </button>
                    <button
                      type="button"
                      onClick={() => setClaimFrameShapeInput('hexagon')}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        claimFrameShapeInput === 'hexagon' ? 'bg-sky-600 border-sky-400 text-white' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      Segi 6 ⬡
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={claimPhotoUrlInput}
                    onChange={e => setClaimPhotoUrlInput(e.target.value)}
                    placeholder="URL Foto atau upload file di samping"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-sky-500 text-xs"
                  />
                  <label className="px-2.5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 cursor-pointer flex items-center gap-1 shrink-0 text-xs font-semibold">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            if (ev.target?.result) {
                              setClaimPhotoUrlInput(ev.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Kontrol Fleksibel Geser Bintang di Orbit */}
              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/40 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-indigo-300 font-bold text-xs flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-indigo-400" />
                    Geser Posisi di Garis Orbit
                  </label>
                  {selectedNode.customAngle !== undefined && (
                    <button
                      type="button"
                      onClick={() => {
                        const resetNode = { ...selectedNode, customAngle: undefined };
                        setSelectedNode(resetNode);
                        setFamilyTree(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? resetNode : n)
                        }));
                        showNotification?.('Posisi bintang dikembalikan ke susunan otomatis.');
                        renderCanvas();
                      }}
                      className="text-[10px] text-amber-400 hover:text-amber-300 underline"
                    >
                      Reset Otomatis
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleNudgeAngle(selectedNode, -0.15)}
                    className="flex-1 py-1.5 px-2 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-500/50 rounded-lg text-indigo-200 text-xs font-semibold active:scale-95 transition"
                  >
                    ◀ Geser Kiri
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeAngle(selectedNode, 0.15)}
                    className="flex-1 py-1.5 px-2 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-500/50 rounded-lg text-indigo-200 text-xs font-semibold active:scale-95 transition"
                  >
                    Geser Kanan ▶
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Catatan Tambahan</label>
                <input
                  type="text"
                  value={claimNotesInput}
                  onChange={e => setClaimNotesInput(e.target.value)}
                  placeholder="Contoh: Pekerjaan, kontak atau catatan penting"
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
                    🛡️ Pengaturan Silsilah Mutlak (Admin)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {selectedNode.id} • Kuadran {selectedNode.quadrant} • Orbit {selectedNode.gen + 3}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAdminEditModal(false);
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

              {/* Lahir - Wafat & Status */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    Tahun Lahir
                  </label>
                  <input
                    type="text"
                    value={selectedNode.birthYear || ''}
                    onChange={e => setSelectedNode({ ...selectedNode, birthYear: e.target.value })}
                    placeholder="cth: 1965"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Tahun Wafat</label>
                  <input
                    type="text"
                    value={selectedNode.deathYear || ''}
                    onChange={e => setSelectedNode({ ...selectedNode, deathYear: e.target.value })}
                    placeholder="cth: 2012"
                    disabled={selectedNode.status === 'Hidup'}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500 disabled:opacity-40 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Status</label>
                  <select
                    value={selectedNode.status || 'Hidup'}
                    onChange={e => setSelectedNode({ ...selectedNode, status: e.target.value as 'Hidup' | 'Almarhum' })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                  >
                    <option value="Hidup">Hidup</option>
                    <option value="Almarhum">Almarhum</option>
                  </select>
                </div>
              </div>

              {/* Alamat / Kota Asal */}
              <div>
                <label className="block text-slate-400 mb-1 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  Alamat / Kota Asal
                </label>
                <input
                  type="text"
                  value={selectedNode.origin || ''}
                  onChange={e => setSelectedNode({ ...selectedNode, origin: e.target.value })}
                  placeholder="Contoh: Bandung, Jawa Barat"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                />
              </div>

              {/* Foto Profil & Bentuk Frame */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold flex items-center gap-1.5 text-xs">
                    <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
                    Foto Profil &amp; Frame Bintang
                  </label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setSelectedNode({ ...selectedNode, frameShape: 'circle' })}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        (selectedNode.frameShape || globalFrameShape) === 'circle' ? 'bg-amber-600 border-amber-400 text-slate-950 font-bold' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      Bulat ⚪
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedNode({ ...selectedNode, frameShape: 'square' })}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        selectedNode.frameShape === 'square' ? 'bg-amber-600 border-amber-400 text-slate-950 font-bold' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      Kotak ⬛
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedNode({ ...selectedNode, frameShape: 'hexagon' })}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${
                        selectedNode.frameShape === 'hexagon' ? 'bg-amber-600 border-amber-400 text-slate-950 font-bold' : 'border-slate-700 text-slate-400'
                      }`}
                    >
                      Segi 6 ⬡
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={selectedNode.photoUrl || ''}
                    onChange={e => setSelectedNode({ ...selectedNode, photoUrl: e.target.value })}
                    placeholder="URL Foto atau upload file di samping"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 focus:outline-none focus:border-amber-500 text-xs"
                  />
                  <label className="px-2.5 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-slate-200 cursor-pointer flex items-center gap-1 shrink-0 text-xs font-semibold">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = ev => {
                            if (ev.target?.result) {
                              setSelectedNode({ ...selectedNode, photoUrl: ev.target.result as string });
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Kontrol Fleksibel Geser Bintang di Orbit (Admin) */}
              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/40 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-indigo-300 font-bold text-xs flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5 text-indigo-400" />
                    Atur Posisi Bintang di Garis Orbit
                  </label>
                  {selectedNode.customAngle !== undefined && (
                    <button
                      type="button"
                      onClick={() => {
                        const resetNode = { ...selectedNode, customAngle: undefined };
                        setSelectedNode(resetNode);
                        setFamilyTree(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? resetNode : n)
                        }));
                        showNotification?.('Posisi bintang dikembalikan ke susunan otomatis.');
                        renderCanvas();
                      }}
                      className="text-[10px] text-amber-400 hover:text-amber-300 underline"
                    >
                      Reset Otomatis
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleNudgeAngle(selectedNode, -0.15)}
                    className="flex-1 py-1.5 px-2 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-500/50 rounded-lg text-indigo-200 text-xs font-semibold active:scale-95 transition"
                  >
                    ◀ Geser Kiri
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNudgeAngle(selectedNode, 0.15)}
                    className="flex-1 py-1.5 px-2 bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-500/50 rounded-lg text-indigo-200 text-xs font-semibold active:scale-95 transition"
                  >
                    Geser Kanan ▶
                  </button>
                </div>
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
                <button
                  type="button"
                  onClick={handleJumpToSilsilah}
                  className="px-3 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded-lg flex items-center gap-1 border border-slate-700 text-xs font-semibold"
                  title="Buka di Tab Silsilah"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Silsilah</span>
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
                Anak akan otomatis ditempatkan di <strong>Orbit {Math.min(selectedNode.gen + 1, 3) + 3}</strong> dalam kelompok induk <strong>{selectedNode.name}</strong> dengan garis melengkung anti-silang.
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
                  <option value="Q1">Trah Ayah User (Kiri-Atas) • Biru Langit</option>
                  <option value="Q2">Trah Ibu User (Kanan-Atas) • Zamrud Hijau</option>
                  <option value="Q3">Trah Ayah Pasangan (Kiri-Bawah) • Mawar Merah</option>
                  <option value="Q4">Trah Ibu Pasangan (Kanan-Bawah) • Lembayung Ungu</option>
                </select>
              </div>

              {/* Opsi Garis Terhubung oleh Admin */}
              <div className="p-2.5 bg-slate-800/60 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block text-xs">Garis Konektor Rasi Bintang</span>
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
                  💡 <b>Hierarki Mutlak Admin:</b> Urutan nomor anak sesuai urutan pengetikan koma (<code className="text-emerald-400">,</code>) dan langsung tampil berurutan berdekatan dengan garis melengkung anti-silang.
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
                    Riwayat penataan silsilah 6 orbit &amp; rasi bintang kosmik
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
