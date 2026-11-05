import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft,
  Camera,
  Users,
  GitFork,
  BookOpen,
  Share2,
  Heart,
  MessageCircle,
  Plus,
  Send,
  X,
  Printer,
  Download,
  CheckCircle2,
  User,
  Sparkles,
  Search,
  Calendar,
  MapPin,
  ChevronRight,
  Shield,
  FileText,
  Upload,
  Copy,
  Moon,
  Sun,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  HeartHandshake,
  Layers,
  History,
  Archive,
  ExternalLink,
  MessageSquare,
  Compass,
  Edit3,
  Trash2,
  Baby,
  Grid
} from 'lucide-react';
import { OrbitQuView, OrbitNode, OrbitTreeData, CLEAN_REAL_TREE_DATA } from './OrbitQuView';
import { GridCanvasEngine } from './GridCanvasEngine';

interface LeluhurQuViewProps {
  onBackToWarga: () => void;
  showNotification: (msg: string) => void;
}

export interface FamilySpouse {
  id: string;
  name: string;
  nickname?: string;
  binBinti?: string;
  gender: 'L' | 'P';
  origin?: string;
  birthYear?: string;
  deathYear?: string;
  status: 'Hidup' | 'Almarhum';
  marriageNote?: string;
  childrenIds: string[];
}

export interface FamilyMember {
  id: string;
  name: string;
  nickname?: string;
  binBinti?: string;
  kinshipTitle?: string; // Aki, Nini, Uyut, Uwa, Mang, Bibi, dll.
  role: string;
  relation: 'ayah' | 'ibu' | 'anak' | 'kakek' | 'nenek' | 'buyut' | 'paman_bibi' | 'cucu';
  trah: 'ayah' | 'ibu' | 'inti' | 'ayah_pasangan' | 'ibu_pasangan';
  gender: 'L' | 'P';
  birthYear: string;
  deathYear?: string;
  status: 'Hidup' | 'Almarhum';
  origin?: string;
  phone?: string;
  notes?: string;
  isUser?: boolean;
  spouses?: FamilySpouse[];
  parentName?: string;
  kakekName?: string;
  uyutName?: string;
}

interface CommentItem {
  id: string;
  author: string;
  text: string;
  time: string;
}

interface PostItem {
  id: string;
  authorName: string;
  authorRole: string;
  trah: 'ayah' | 'ibu' | 'ayah_pasangan' | 'ibu_pasangan';
  trahName: string;
  timeAgo: string;
  content: string;
  category: 'Kisah Sejarah' | 'Foto Jadul' | 'Agenda Arisan' | 'Kabar Keluarga';
  avatarColor: string;
  initials: string;
  likes: number;
  isLiked?: boolean;
  comments: CommentItem[];
}

// -------------------------------------------------------------
// ADAPTER: CONVERT ORBITQU DATA KE DATA SILSILAH KELUARGA
// Mengintegrasikan OrbitQu sebagai Single Source of Truth
// -------------------------------------------------------------
export function orbitNodeToFamilyMember(node: OrbitNode, allNodes: OrbitNode[]): FamilyMember {
  const parent = node.parentId ? allNodes.find(n => n.id === node.parentId) : undefined;
  const kakek = parent?.parentId ? allNodes.find(n => n.id === parent.parentId) : undefined;
  const uyut = kakek?.parentId ? allNodes.find(n => n.id === kakek.parentId) : undefined;

  let relation: FamilyMember['relation'] = 'anak';
  if (node.gen === -3) relation = 'buyut';
  else if (node.gen === -2) relation = node.gender === 'P' ? 'nenek' : 'kakek';
  else if (node.gen === -1) {
    if (node.isUser) relation = 'ayah';
    else if (node.name.toLowerCase().includes('ibu')) relation = 'ibu';
    else if (node.name.toLowerCase().includes('ayah')) relation = 'ayah';
    else relation = 'paman_bibi';
  } else if (node.gen === 0) {
    relation = node.isUser ? 'ayah' : 'anak';
  } else if (node.gen === 1) {
    relation = 'anak';
  } else if (node.gen >= 2) {
    relation = 'cucu';
  }

  let trah: FamilyMember['trah'] = 'ayah';
  if (node.quadrant === 'Q2') trah = 'ibu';
  else if (node.quadrant === 'Q3') trah = 'ayah_pasangan';
  else if (node.quadrant === 'Q4') trah = 'ibu_pasangan';
  else if (node.isUser || (node.gen >= 0 && node.gen <= 1 && (node.parentId === 'user_node' || node.id === 'user_node'))) {
    trah = 'inti';
  }

  let kinshipTitle = node.order || '';
  if (node.gen === -3) kinshipTitle = `Pusat Kuadran: Uyut (${node.quadrant || 'Q1'})`;
  else if (node.gen === -2) kinshipTitle = `Orbit 1: ${node.gender === 'P' ? 'Nenek' : 'Kakek'} (${node.order || ''})`;
  else if (node.gen === -1) kinshipTitle = `Orbit 2: ${node.role || (node.gender === 'P' ? 'Bibi' : 'Paman/Ayah')} (${node.order || ''})`;
  else if (node.gen === 0) kinshipTitle = node.isUser ? 'Orbit 3: Poros User (Kepala Keluarga)' : `Orbit 3: Saudara Kandung (${node.order || ''})`;
  else if (node.gen === 1) kinshipTitle = `Orbit 4: Anak (${node.order || ''})`;
  else if (node.gen === 2) kinshipTitle = `Orbit 5: Cucu (${node.order || ''})`;
  else if (node.gen === 3) kinshipTitle = `Orbit 6: Cicit (${node.order || ''})`;

  let binBinti = '';
  if (parent) {
    binBinti = (node.gender === 'P' ? 'binti ' : 'bin ') + parent.name.replace(/\s*\(.*?\)\s*/g, '').trim();
  } else if (node.gen === -3) {
    binBinti = 'Moyang Pendiri Nasab';
  }

  const spouses: FamilySpouse[] = [];
  if (node.spouseName) {
    const directChildren = allNodes.filter(n => n.parentId === node.id);
    spouses.push({
      id: `${node.id}_spouse`,
      name: node.spouseName,
      gender: node.spouseGender || (node.gender === 'L' ? 'P' : 'L'),
      status: 'Hidup',
      childrenIds: directChildren.map(c => c.id),
      marriageNote: 'Pasangan Sah'
    });
  }

  return {
    id: node.id,
    name: node.name,
    nickname: node.isUser ? 'Bageur' : undefined,
    binBinti: binBinti || undefined,
    kinshipTitle,
    role: node.role || kinshipTitle,
    relation,
    trah,
    gender: node.gender || 'L',
    birthYear: node.birthYear || (node.gen === -3 ? '1910' : node.gen === -2 ? '1938' : node.gen === -1 ? '1965' : node.gen === 0 ? '1992' : node.gen === 1 ? '2020' : '2025'),
    deathYear: node.deathYear,
    status: node.status || 'Hidup',
    origin: node.origin || (node.quadrant === 'Q1' ? 'Bandung / Cianjur' : 'Bogor'),
    notes: node.notes,
    isUser: Boolean(node.isUser || node.id === 'user_node'),
    parentName: parent?.name,
    kakekName: kakek?.name,
    uyutName: uyut?.name,
    spouses: spouses.length > 0 ? spouses : undefined
  };
}

const DEFAULT_POSTS: PostItem[] = [
  {
    id: 'post-1',
    authorName: 'Ayah Karta',
    authorRole: 'Orbit 2 (Ayah)',
    trah: 'ayah',
    trahName: 'Trah Ayah User (Kuningan)',
    category: 'Kisah Sejarah',
    timeAgo: '2 jam lalu',
    content: 'Alhamdulillah silaturahmi keluarga besar Trah Ayah di Cilimus. Anak cucu dari Buyut Kyai Abdul Ghani dan 10 bersaudara anak Kakek B tetap rukun menjaga tali silaturahmi. 🙏',
    avatarColor: 'bg-emerald-700',
    initials: 'AK',
    likes: 18,
    isLiked: false,
    comments: [
      { id: 'c1', author: 'Hendriana (User)', text: 'Aamiin Ayah, rombongan Bogor siap berkunjung.', time: '1 jam lalu' }
    ]
  },
  {
    id: 'post-2',
    authorName: 'Siti Nurhaliza',
    authorRole: 'Ibu (Istri)',
    trah: 'ibu',
    trahName: 'Trah Ibu User (Bogor)',
    category: 'Agenda Arisan',
    timeAgo: '4 jam lalu',
    content: 'Pemberitahuan silaturahmi & arisan keluarga Trah Ibu bulan depan di Dramaga Bogor. Mohon kehadirannya untuk mempererat persaudaraan.',
    avatarColor: 'bg-teal-700',
    initials: 'SN',
    likes: 14,
    isLiked: true,
    comments: []
  },
  {
    id: 'post-3',
    authorName: 'H. Suryana',
    authorRole: 'Ayah Mertua',
    trah: 'ayah_pasangan',
    trahName: 'Trah Ayah Pasangan',
    category: 'Kabar Keluarga',
    timeAgo: 'Kemarin',
    content: 'Salam takzim dari keluarga besar Trah Ayah Pasangan. InsyaAllah syukuran keluarga diadakan di kediaman kami, ditunggu kedatangan menantu dan cucu-cucu.',
    avatarColor: 'bg-blue-700',
    initials: 'HS',
    likes: 22,
    isLiked: false,
    comments: [
      { id: 'c3', author: 'Hendriana (User)', text: 'InsyaAllah kami hadir sekeluarga Abah.', time: '18 jam lalu' }
    ]
  },
  {
    id: 'post-4',
    authorName: 'Hj. Maryam',
    authorRole: 'Ibu Mertua',
    trah: 'ibu_pasangan',
    trahName: 'Trah Ibu Pasangan',
    category: 'Foto Jadul',
    timeAgo: '2 hari lalu',
    content: 'Foto kenangan reuni keluarga besar Trah Ibu Pasangan tahun 1990-an. Semoga tali nasab keluarga besan dan cucu senantiasa diberkahi Allah SWT.',
    avatarColor: 'bg-purple-700',
    initials: 'HM',
    likes: 19,
    isLiked: false,
    comments: []
  }
];

export const LeluhurQuView: React.FC<LeluhurQuViewProps> = ({
  onBackToWarga,
  showNotification
}) => {
  // Navigation Tabs: Silsilah | OrbitQu / Pohon | Grid Canvas | Medsos | Doa Malam Jumat | Arsip & Ekspor
  const [activeTab, setActiveTab] = useState<'silsilah' | 'orbitqu' | 'gridcanvas' | 'medsos' | 'doa' | 'arsip'>('silsilah');
  const [activeMedsosTrah, setActiveMedsosTrah] = useState<'ayah' | 'ibu' | 'ayah_pasangan' | 'ibu_pasangan'>('ayah');

  // Unified OrbitQu Tree Data (Single Source of Truth)
  const [familyTree, setFamilyTree] = useState<OrbitTreeData>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_orbitqu_tree_v6');
      return saved ? JSON.parse(saved) : CLEAN_REAL_TREE_DATA;
    } catch {
      return CLEAN_REAL_TREE_DATA;
    }
  });

  // Target Node to focus in OrbitQu
  const [targetOrbitNodeId, setTargetOrbitNodeId] = useState<string | null>(null);

  // Sync familyTree to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_orbitqu_tree_v6', JSON.stringify(familyTree));
    } catch (e) {
      console.error(e);
    }
  }, [familyTree]);

  // Derive rich members list directly from OrbitQu nodes
  const members: FamilyMember[] = useMemo(() => {
    return familyTree.nodes.map(n => orbitNodeToFamilyMember(n, familyTree.nodes));
  }, [familyTree]);

  // Medsos Posts Data
  const [posts, setPosts] = useState<PostItem[]>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_leluhur_posts_v3');
      return saved ? JSON.parse(saved) : DEFAULT_POSTS;
    } catch {
      return DEFAULT_POSTS;
    }
  });

  // Tree View Filter & Interactive Controls
  const [treeFilter, setTreeFilter] = useState<'all' | 'inti' | 'ayah' | 'ibu' | 'ayah_pasangan' | 'ibu_pasangan'>('all');
  const [generationFilter, setGenerationFilter] = useState<'all' | '-3' | '-2' | '-1' | '0' | '1' | '2' | '3'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [treeZoom, setTreeZoom] = useState<number>(1);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Theme Dark / Light State
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_leluhur_theme');
      return saved === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('wargaqu_leluhur_theme', next);
      } catch {}
      showNotification(next === 'dark' ? '🌙 Tema Gelap (Dark Space) Aktif' : '☀️ Tema Terang (Light Heritage) Aktif');
      return next;
    });
  };

  // Modals
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showScanKKModal, setShowScanKKModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<boolean>(false);

  // Edit Member Modal State
  const [editNodeId, setEditNodeId] = useState('');
  const [editName, setEditName] = useState('');
  const [editOrder, setEditOrder] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editGender, setEditGender] = useState<'L' | 'P'>('L');
  const [editBirthYear, setEditBirthYear] = useState('');
  const [editDeathYear, setEditDeathYear] = useState('');
  const [editStatus, setEditStatus] = useState<'Hidup' | 'Almarhum'>('Hidup');
  const [editOrigin, setEditOrigin] = useState('');
  const [editSpouseName, setEditSpouseName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editQuadrant, setEditQuadrant] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q1');
  const [editParentId, setEditParentId] = useState('');

  // Doa Malam Jumat State
  const [hadhorohCopied, setHadhorohCopied] = useState(false);

  // New Post Form State
  const [newPostText, setNewPostText] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<'Kisah Sejarah' | 'Foto Jadul' | 'Agenda Arisan' | 'Kabar Keluarga'>('Kisah Sejarah');
  const [commentInput, setCommentInput] = useState<{ [postId: string]: string }>({});
  const [openCommentBox, setOpenCommentBox] = useState<{ [postId: string]: boolean }>({});

  // Add Member Form State
  const [formName, setFormName] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formBinBinti, setFormBinBinti] = useState('');
  const [formKinship, setFormKinship] = useState('Anak');
  const [formRole, setFormRole] = useState('');
  const [formRelation, setFormRelation] = useState<'anak' | 'paman_bibi' | 'kakek' | 'nenek' | 'buyut' | 'cucu'>('anak');
  const [formTrah, setFormTrah] = useState<'inti' | 'ayah' | 'ibu' | 'ayah_pasangan' | 'ibu_pasangan'>('inti');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formBirthYear, setFormBirthYear] = useState('2020');
  const [formDeathYear, setFormDeathYear] = useState('');
  const [formStatus, setFormStatus] = useState<'Hidup' | 'Almarhum'>('Hidup');
  const [formOrigin, setFormOrigin] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Orbit Hierarchical Lineage Controls (Ayah, Kakek, Uyut) with typo/custom edit
  const [formAyahSelect, setFormAyahSelect] = useState<string>('custom');
  const [formAyahCustom, setFormAyahCustom] = useState<string>('');
  const [formKakekSelect, setFormKakekSelect] = useState<string>('custom');
  const [formKakekCustom, setFormKakekCustom] = useState<string>('');
  const [formUyutSelect, setFormUyutSelect] = useState<string>('custom');
  const [formUyutCustom, setFormUyutCustom] = useState<string>('');

  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_leluhur_posts_v3', JSON.stringify(posts));
    } catch (e) {
      console.error(e);
    }
  }, [posts]);

  // Format rentang tahun privacy-first (Format: '1985' atau '1950 - 2018')
  const getYearRangeDisplay = (m: FamilyMember) => {
    if (m.status === 'Almarhum') {
      return `${m.birthYear || '?'} - ${m.deathYear || 'Wafat'}`;
    }
    return `Lahir ${m.birthYear || 'Tercatat'}`;
  };

  // Filter Deceased Members for Hadhoroh Doa Malam Jumat
  const deceasedMembers = members.filter(m => m.status === 'Almarhum');
  const deceasedAyah = deceasedMembers.filter(m => m.trah === 'ayah' || m.trah === 'inti');
  const deceasedIbu = deceasedMembers.filter(m => m.trah === 'ibu');
  const deceasedPasanganAyah = deceasedMembers.filter(m => m.trah === 'ayah_pasangan');
  const deceasedPasanganIbu = deceasedMembers.filter(m => m.trah === 'ibu_pasangan');

  // Generate Hadhoroh Doa Teks siap salin
  const generateHadhorohText = () => {
    const header = `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n*PENGINGAT DOA MALAM JUMAT - HADHOROH LELUHURQU*\n*Trah Besar Hendriana (Kuningan & Bogor)*\n\nIlaa hadhrotin Nabiyyil Musthafa Muhammadin SAW, wa 'alaa aalihi wa ash-habihi ajma'in... Al-Fatihah.\n\nTsumma ilaa arwahi aabaa-inaa wa ummahaatinaa wa ajdaadinaa wa jaddaatinaa (Khusushon Para Leluhur):\n`;

    const daftarAyah = deceasedAyah.map((m, i) => `  ${i + 1}. Almarhum ${m.name} ${m.binBinti || ''} (${m.kinshipTitle || 'Trah Ayah'})`).join('\n');
    const daftarIbu = deceasedIbu.map((m, i) => `  ${i + 1}. Almarhum/ah ${m.name} ${m.binBinti || ''} (${m.kinshipTitle || 'Trah Ibu'})`).join('\n');
    const daftarPasangan = [...deceasedPasanganAyah, ...deceasedPasanganIbu].map((m, i) => `  ${i + 1}. Almarhum/ah ${m.name} ${m.binBinti || ''} (${m.kinshipTitle || 'Trah Pasangan'})`).join('\n');

    const footer = `\n\nTsumma ilaa jami'i ahlil qubur minal muslimina wal muslimat wal mu'minina wal mu'minat min masyaariqil ardhi ilaa maghaaribiha... Allahummaghfir lahum, warhamhum, wa 'aafihim, wa'fu 'anhum. Lahumul FAATIHAH. 🤲\n\n(Dibagikan melalui Modul LeluhurQu - Ekosistem WargaQu)`;

    return `${header}\n*JALUR TRAH AYAH (Kuningan/Cianjur):*\n${daftarAyah || '  -'}\n\n*JALUR TRAH IBU (Bogor):*\n${daftarIbu || '  -'}\n\n*JALUR TRAH PASANGAN (Besan/Mertua):*\n${daftarPasangan || '  -'}${footer}`;
  };

  const handleCopyHadhoroh = () => {
    const text = generateHadhorohText();
    navigator.clipboard?.writeText(text);
    setHadhorohCopied(true);
    showNotification('Teks Hadhoroh Doa Malam Jumat berhasil disalin ke clipboard!');
    setTimeout(() => setHadhorohCopied(false), 3000);
  };

  const handleShareToWA = () => {
    const text = generateHadhorohText();
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Export JSON Backup (OrbitQu Tree Single Source of Truth)
  const handleExportJSON = () => {
    const dataBackup = {
      app: 'WargaQu - LeluhurQu Heritage System',
      exportDate: new Date().toISOString(),
      familyHead: 'Hendriana (HQ-2026-001)',
      membersCount: familyTree.nodes.length,
      familyTree,
      posts
    };
    const jsonStr = JSON.stringify(dataBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Silsilah_LeluhurQu_OrbitQu_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('File cadangan silsilah & OrbitQu (.json) berhasil diunduh!');
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.familyTree && Array.isArray(parsed.familyTree.nodes)) {
          setFamilyTree(parsed.familyTree);
          if (parsed.posts && Array.isArray(parsed.posts)) {
            setPosts(parsed.posts);
          }
          showNotification('Berhasil memulihkan data silsilah & OrbitQu dari file cadangan!');
        } else if (parsed.nodes && Array.isArray(parsed.nodes)) {
          setFamilyTree(parsed);
          showNotification('Berhasil memulihkan data OrbitQu dari file cadangan!');
        } else {
          showNotification('Format file JSON tidak sesuai struktur LeluhurQu / OrbitQu.');
        }
      } catch {
        showNotification('Gagal membaca file JSON cadangan.');
      }
    };
    reader.readAsText(file);
  };

  // Jump to OrbitQu with target focus
  const handleOpenInOrbit = (nodeId: string) => {
    setTargetOrbitNodeId(nodeId);
    setActiveTab('orbitqu');
    const matched = familyTree.nodes.find(n => n.id === nodeId);
    showNotification(`Membuka dan menyorot ${matched?.name || 'anggota'} di rasi bintang OrbitQu 🪐`);
  };

  // Open Edit Member Modal
  const handleOpenEditMember = (node: OrbitNode | FamilyMember) => {
    const rawNode = familyTree.nodes.find(n => n.id === node.id);
    if (!rawNode) return;
    setEditNodeId(rawNode.id);
    setEditName(rawNode.name);
    setEditOrder(rawNode.order || '');
    setEditRole(rawNode.role || '');
    setEditGender(rawNode.gender || 'L');
    setEditBirthYear(rawNode.birthYear || '');
    setEditDeathYear(rawNode.deathYear || '');
    setEditStatus(rawNode.status || 'Hidup');
    setEditOrigin(rawNode.origin || '');
    setEditSpouseName(rawNode.spouseName || '');
    setEditNotes(rawNode.notes || '');
    setEditQuadrant(rawNode.quadrant || 'Q1');
    setEditParentId(rawNode.parentId || '');
    setShowEditMemberModal(true);
  };

  // Submit Edit Member
  const handleEditMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      showNotification('Nama anggota tidak boleh kosong.');
      return;
    }
    setFamilyTree(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => {
        if (n.id === editNodeId) {
          return {
            ...n,
            name: editName.trim(),
            order: editOrder.trim() || n.order,
            role: editRole.trim() || undefined,
            gender: editGender,
            birthYear: editBirthYear.trim() || undefined,
            deathYear: editStatus === 'Almarhum' ? (editDeathYear.trim() || undefined) : undefined,
            status: editStatus,
            origin: editOrigin.trim() || undefined,
            spouseName: editSpouseName.trim() || undefined,
            notes: editNotes.trim() || undefined,
            quadrant: editQuadrant,
            parentId: editParentId || undefined
          };
        }
        return n;
      })
    }));
    setShowEditMemberModal(false);
    if (selectedMember && selectedMember.id === editNodeId) {
      const updatedNode = familyTree.nodes.find(n => n.id === editNodeId);
      if (updatedNode) {
        setSelectedMember(orbitNodeToFamilyMember({
          ...updatedNode,
          name: editName.trim(),
          status: editStatus,
          origin: editOrigin.trim() || undefined,
          birthYear: editBirthYear.trim() || undefined,
          deathYear: editStatus === 'Almarhum' ? (editDeathYear.trim() || undefined) : undefined
        }, familyTree.nodes));
      }
    }
    showNotification(`Data ${editName} berhasil diperbarui di Silsilah & OrbitQu!`);
  };

  // Delete Member
  const handleDeleteMember = (nodeId: string) => {
    const target = familyTree.nodes.find(n => n.id === nodeId);
    if (!target) return;
    if (target.isUser) {
      showNotification('Node User Utama tidak dapat dihapus.');
      return;
    }
    setFamilyTree(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId)
    }));
    setSelectedMember(null);
    showNotification(`Data ${target.name} berhasil dihapus dari Silsilah & OrbitQu.`);
  };

  // Open Add Child modal from parent node
  const handleOpenAddChild = (parentMember: FamilyMember) => {
    const parentNode = familyTree.nodes.find(n => n.id === parentMember.id);
    if (!parentNode) return;
    const nextGen = Math.min(3, (parentNode.gen ?? 0) + 1);
    setFormKinship(nextGen === 1 ? 'Anak' : nextGen === 2 ? 'Cucu' : nextGen === 3 ? 'Cicit' : 'Keturunan');
    setFormAyahSelect(parentNode.name);
    setFormAyahCustom(parentNode.name);
    setFormTrah(
      parentNode.quadrant === 'Q2' ? 'ibu' :
      parentNode.quadrant === 'Q3' ? 'ayah_pasangan' :
      parentNode.quadrant === 'Q4' ? 'ibu_pasangan' : 'ayah'
    );
    setSelectedMember(null);
    setShowAddMemberModal(true);
  };

  // Add Member with Direct OrbitQu Integration
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotification('Silakan isi nama anggota keluarga.');
      return;
    }

    let gen = 1;
    if (formKinship.includes('Uyut') || formKinship.includes('Buyut')) gen = -3;
    else if (formKinship.includes('Aki') || formKinship.includes('Nini') || formKinship.includes('Kakek') || formKinship.includes('Nenek')) gen = -2;
    else if (formKinship.includes('Ayah') || formKinship.includes('Ibu') || formKinship.includes('Uwa') || formKinship.includes('Mang') || formKinship.includes('Bibi') || formKinship.includes('Paman')) gen = -1;
    else if (formKinship.includes('Saudara') || formKinship.includes('Kakak') || formKinship.includes('Adik')) gen = 0;
    else if (formKinship.includes('Anak')) gen = 1;
    else if (formKinship.includes('Cucu') || formKinship.includes('Incu')) gen = 2;
    else if (formKinship.includes('Cicit')) gen = 3;

    let q: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 'Q1';
    if (formTrah === 'ibu') q = 'Q2';
    else if (formTrah === 'ayah_pasangan') q = 'Q3';
    else if (formTrah === 'ibu_pasangan') q = 'Q4';

    const finalAyah = formAyahSelect === 'custom' ? formAyahCustom.trim() : formAyahSelect;
    const parentNode = finalAyah ? familyTree.nodes.find(n => n.name.toLowerCase().includes(finalAyah.toLowerCase())) : undefined;

    const newOrbitNode: OrbitNode = {
      id: 'node_' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: formName.trim(),
      gen,
      order: formNickname ? `${formKinship} (${formNickname})` : formKinship,
      quadrant: parentNode ? parentNode.quadrant : q,
      claimed: true,
      gender: formGender,
      role: formRole || formKinship,
      parentId: parentNode ? parentNode.id : undefined,
      birthYear: formBirthYear || '2020',
      deathYear: formStatus === 'Almarhum' ? (formDeathYear || undefined) : undefined,
      status: formStatus,
      origin: formOrigin || undefined,
      notes: formNotes || undefined
    };

    setFamilyTree(prev => ({
      ...prev,
      nodes: [...prev.nodes, newOrbitNode]
    }));

    setShowAddMemberModal(false);
    // Reset form
    setFormName('');
    setFormNickname('');
    setFormBinBinti('');
    setFormNotes('');
    setFormAyahCustom('');
    setFormKakekCustom('');
    setFormUyutCustom('');
    showNotification(`Alhamdulillah, ${newOrbitNode.name} berhasil ditambahkan ke silsilah & OrbitQu!`);
  };

  // Like & Comment
  const handleToggleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          const nextLiked = !p.isLiked;
          return {
            ...p,
            isLiked: nextLiked,
            likes: nextLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
          };
        }
        return p;
      })
    );
  };

  const handleAddComment = (postId: string) => {
    const text = commentInput[postId]?.trim();
    if (!text) return;

    setPosts(prev =>
      prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [
              ...p.comments,
              {
                id: 'c_' + Date.now(),
                author: 'Hendriana (Bageur)',
                text,
                time: 'Baru saja'
              }
            ]
          };
        }
        return p;
      })
    );
    setCommentInput(prev => ({ ...prev, [postId]: '' }));
    showNotification('Komentar silaturahmi terkirim!');
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostText.trim()) return;

    const trahLabels: Record<'ayah' | 'ibu' | 'ayah_pasangan' | 'ibu_pasangan', string> = {
      ayah: 'Trah Ayah User (Kuningan)',
      ibu: 'Trah Ibu User (Bogor)',
      ayah_pasangan: 'Trah Ayah Pasangan',
      ibu_pasangan: 'Trah Ibu Pasangan'
    };

    const newPost: PostItem = {
      id: 'post-' + Date.now(),
      authorName: 'Hendriana (User)',
      authorRole: 'Kepala Keluarga',
      trah: activeMedsosTrah,
      trahName: trahLabels[activeMedsosTrah],
      category: newPostCategory,
      timeAgo: 'Baru saja',
      content: newPostText.trim(),
      avatarColor: 'bg-emerald-700',
      initials: 'HU',
      likes: 1,
      isLiked: true,
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostText('');
    showNotification(`Postingan baru berhasil dibagikan di ${newPost.trahName}!`);
  };

  // Scan KK Simulator
  const handleStartScanKK = () => {
    setIsScanning(true);
    setScanResult(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(true);
      showNotification('Scan KK Selesai: NIK disembunyikan total demi privasi!');
    }, 1800);
  };

  // Filtered members for Tree View (Multi-Trah, Multi-Generation, Searchable)
  const displayedMembers = useMemo(() => {
    return members.filter(m => {
      // Filter Trah
      if (treeFilter === 'inti') {
        const raw = familyTree.nodes.find(n => n.id === m.id);
        const isCore = raw?.isUser || raw?.id === 'user_node' || raw?.parentId === 'user_node' || (raw?.gen === 0 && raw?.quadrant === 'Q1');
        if (!isCore) return false;
      } else if (treeFilter === 'ayah') {
        if (m.trah !== 'ayah') return false;
      } else if (treeFilter === 'ibu') {
        if (m.trah !== 'ibu') return false;
      } else if (treeFilter === 'ayah_pasangan') {
        if (m.trah !== 'ayah_pasangan') return false;
      } else if (treeFilter === 'ibu_pasangan') {
        if (m.trah !== 'ibu_pasangan') return false;
      }

      // Filter Generasi
      if (generationFilter !== 'all') {
        const genNum = parseInt(generationFilter, 10);
        const raw = familyTree.nodes.find(n => n.id === m.id);
        if (raw?.gen !== genNum) return false;
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = m.name.toLowerCase().includes(q);
        const matchRole = (m.role || '').toLowerCase().includes(q);
        const matchOrigin = (m.origin || '').toLowerCase().includes(q);
        const matchKinship = (m.kinshipTitle || '').toLowerCase().includes(q);
        if (!matchName && !matchRole && !matchOrigin && !matchKinship) return false;
      }

      return true;
    });
  }, [members, treeFilter, generationFilter, searchQuery, familyTree]);

  return (
    <div className={`w-full h-full ${theme === 'dark' ? 'bg-[#070b14] text-slate-100' : 'bg-[#f0fdf4] text-slate-800'} font-sans antialiased flex flex-col relative select-none overflow-hidden transition-colors duration-200`}>
      {activeTab === 'orbitqu' ? (
        <div className="flex-1 w-full h-full relative overflow-hidden pb-14">
          <OrbitQuView
            familyTree={familyTree}
            onUpdateFamilyTree={setFamilyTree}
            initialSelectedNodeId={targetOrbitNodeId}
            onClearInitialSelectedNodeId={() => setTargetOrbitNodeId(null)}
            onBackToLeluhurQu={() => setActiveTab('silsilah')}
            theme={theme}
            onToggleTheme={toggleTheme}
            onOpenInSilsilah={(name, id) => {
              setActiveTab('silsilah');
              const matched = members.find(m => (id && m.id === id) || m.name.toLowerCase().includes(name.toLowerCase()));
              if (matched) {
                setSelectedMember(matched);
              } else {
                setFormName(name);
                setShowAddMemberModal(true);
              }
              showNotification(`Membuka profil ${name} di tab Silsilah`);
            }}
            showNotification={showNotification}
          />
        </div>
      ) : activeTab === 'gridcanvas' ? (
        <div className="flex-1 w-full h-full relative overflow-hidden pb-14">
          <GridCanvasEngine
            familyTree={familyTree}
            onUpdateFamilyTree={setFamilyTree}
            theme={theme}
            onToggleTheme={toggleTheme}
            onBackToLeluhurQu={() => setActiveTab('silsilah')}
            showNotification={showNotification}
          />
        </div>
      ) : (
        <>
          {/* TOP HEADER BAR (WARGAQU EMERALD SIGNATURE PALETTE) */}
          <header className={`${theme === 'dark' ? 'bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-900/60' : 'bg-gradient-to-r from-[#047857] via-[#059669] to-[#047857]'} text-white px-4 py-3.5 flex justify-between items-center shadow-md z-30 shrink-0`}>
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onBackToWarga}
            className="p-1.5 -ml-1 text-emerald-100 hover:text-white hover:bg-emerald-800/60 rounded-xl transition active:scale-95"
            title="Kembali ke Beranda WargaQu"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 bg-emerald-950/40 border border-emerald-300/40 rounded-xl flex items-center justify-center text-[#5eead4] shadow-xs">
            <GitFork className="w-5 h-5 rotate-180" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-base tracking-wide leading-tight text-white">
                Leluhur<span className="text-[#5eead4]">Qu</span>
              </h1>
              <span className="text-[9px] bg-emerald-950/40 text-[#5eead4] border border-emerald-400/40 px-1.5 py-0.2 rounded font-mono font-bold">
                Nasab &amp; Medsos
              </span>
            </div>
            <p className="text-[10px] text-emerald-100 leading-none mt-0.5">
              Ekosistem WargaQu • Offline-First
            </p>
          </div>
        </div>

        {/* Quick Top Right Actions */}
        <div className="flex items-center space-x-1.5">
          {/* Tombol Tema Dark / Light */}
          <button
            onClick={toggleTheme}
            className="bg-emerald-950/40 hover:bg-emerald-950/60 active:scale-95 text-[#5eead4] border border-emerald-400/50 text-[11px] font-bold px-2 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-xs"
            title={`Beralih ke Tema ${theme === 'dark' ? 'Terang (Light Heritage)' : 'Gelap (Dark Space)'}`}
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-300" /> : <Moon className="w-3.5 h-3.5 text-[#5eead4]" />}
            <span>{theme === 'dark' ? 'Terang' : 'Gelap'}</span>
          </button>

          <button
            onClick={() => setActiveTab('orbitqu')}
            className="bg-emerald-950/40 hover:bg-emerald-950/60 active:scale-95 text-[#5eead4] border border-emerald-400/50 text-[11px] font-bold px-2 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-xs"
            title="Buka Visualisasi Silsilah (OrbitQu & PohonQu)"
          >
            <Compass className="w-3.5 h-3.5 text-[#5eead4]" />
            <span>Orbit &amp; Pohon</span>
          </button>
          <button
            onClick={() => setActiveTab('gridcanvas')}
            className="bg-emerald-950/40 hover:bg-emerald-950/60 active:scale-95 text-[#5eead4] border border-emerald-400/50 text-[11px] font-bold px-2 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-xs"
            title="Buka LeluhurQu - Grid Canvas Engine (Spatial Matrix Zero Collision & A0-A4)"
          >
            <Grid className="w-3.5 h-3.5 text-[#5eead4]" />
            <span>Grid Canvas</span>
          </button>
          <button
            onClick={() => setShowScanKKModal(true)}
            className="bg-emerald-950/40 hover:bg-emerald-950/60 active:scale-95 text-white border border-emerald-400/50 text-[11px] font-bold px-2 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-xs"
            title="Scan Kartu Keluarga (Privacy-First)"
          >
            <Camera className="w-3.5 h-3.5 text-[#5eead4]" />
            <span className="text-white hidden sm:inline">Scan KK</span>
          </button>
          <button
            onClick={() => setShowPdfModal(true)}
            className="bg-emerald-600/80 hover:bg-emerald-600 text-white p-1.5 rounded-lg active:scale-95 transition"
            title="Buku Silsilah Heritage"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* SCROLLABLE MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3.5 pb-24">

        {/* TAB 1: POHON SILSILAH INTERAKTIF (TREE VIEW & MULTI-SPOUSE) */}
        {activeTab === 'silsilah' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* KARTU PROFIL UTAMA (PRIVACY-FIRST, NIK DISEMBUNYIKAN) */}
            <section className="bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#065f46] rounded-2xl p-4 text-white shadow-md border border-emerald-400/30 relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/40">
                <div className="flex items-center space-x-3">
                  <div className="w-13 h-13 bg-emerald-800 rounded-full flex items-center justify-center text-lg font-bold border-2 border-[#5eead4] shadow text-white shrink-0">
                    HB
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-bold text-base text-white">Hendriana</h2>
                      <span className="text-[10px] bg-emerald-950/60 text-[#5eead4] px-1.5 py-0.2 rounded font-medium">
                        "Bageur"
                      </span>
                    </div>
                    <p className="text-xs text-emerald-200 font-mono">ID: HQ-2026-001</p>
                    <p className="text-[10px] text-emerald-100 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#5eead4]" />
                      Nanggerang Indah Residence, Blok A No. 12
                    </p>
                  </div>
                </div>
              </div>

              {/* Trah 2 Jalur Grid */}
              <div className="grid grid-cols-2 gap-2 pt-2.5 text-xs">
                <div className="bg-emerald-950/60 p-2 rounded-xl text-center border border-emerald-500/30">
                  <span className="text-emerald-300 block text-[10px] font-medium">Trah Ayah (Paternal)</span>
                  <span className="font-bold text-white text-[11px]">Trah Cilimus, Kuningan</span>
                  <span className="text-[9px] text-emerald-200 block mt-0.5 font-mono">Buyut Kyai Abdul Ghani</span>
                </div>
                <div className="bg-emerald-950/60 p-2 rounded-xl text-center border border-emerald-500/30">
                  <span className="text-emerald-300 block text-[10px] font-medium">Trah Ibu (Maternal)</span>
                  <span className="font-bold text-white text-[11px]">Trah Dramaga, Bogor</span>
                  <span className="text-[9px] text-emerald-200 block mt-0.5 font-mono">Buyut H. Hasan Sulaeman</span>
                </div>
              </div>

              {/* Privacy-First Badge */}
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-emerald-200/90 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                <span className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#5eead4]" />
                  <span>Privasi Aman: NIK Tersembunyi Otomatis</span>
                </span>
                <span className="font-mono text-[#5eead4] font-bold">Offline-First</span>
              </div>
            </section>

            {/* BANNER SHORTCUT: ORBITQU TATA SURYA & POROS SAUDARA */}
            <div
              onClick={() => setActiveTab('orbitqu')}
              className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 border border-emerald-500/40 hover:border-emerald-400 p-3 rounded-2xl cursor-pointer text-white shadow-md transition group active:scale-98 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 text-lg group-hover:scale-105 transition shrink-0">
                    🪐
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-xs text-white">Mode OrbitQu (Tata Surya)</span>
                      <span className="text-[9px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.2 rounded">
                        6 Orbit Generasi
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-0.5">
                      Pusat Uyut $\rightarrow$ O1 Kakek $\rightarrow$ O2 Ayah $\rightarrow$ O3 User/Saudara $\rightarrow$ O4 Anak $\rightarrow$ O5 Cucu $\rightarrow$ O6 Cicit
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-emerald-400 group-hover:translate-x-1 transition shrink-0" />
              </div>
            </div>

            {/* POHON SILSILAH: TOOLBAR FILTER & ZOOM CONTROLS */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-emerald-100 text-slate-800'} rounded-2xl p-3.5 shadow-sm border space-y-3 transition-colors`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <GitFork className={`w-4 h-4 rotate-180 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`} />
                  <h3 className={`font-bold text-xs uppercase tracking-wider ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>
                    Pohon Silsilah Keluarga
                  </h3>
                </div>

                {/* Zoom & Action Controls */}
                <div className={`flex items-center space-x-1 p-1 rounded-xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-emerald-50 border-emerald-200 text-emerald-800'}`}>
                  <button
                    onClick={() => setTreeZoom(z => Math.max(0.7, z - 0.1))}
                    className="p-1 hover:opacity-75 rounded transition"
                    title="Perkecil Tampilan"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold px-1 font-mono">
                    {Math.round(treeZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setTreeZoom(z => Math.min(1.4, z + 0.1))}
                    className="p-1 hover:opacity-75 rounded transition"
                    title="Perbesar Tampilan"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTreeZoom(1)}
                    className="p-1 hover:opacity-75 rounded transition"
                    title="Reset Ukuran"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Search Bar & Trah Filter Controls */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Cari nama anggota, panggilan, atau kota asal..."
                    className={`w-full border rounded-xl pl-8 pr-8 py-1.5 text-xs focus:outline-none transition ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500'
                        : 'bg-[#f0fdf4] border-emerald-200 text-slate-800 placeholder-slate-400 focus:border-emerald-600'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Trah Filter Pill Buttons (All 4 Quadrants & Core Family) */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[10px]">
                  <button
                    onClick={() => setTreeFilter('all')}
                    className={`py-1 px-2.5 rounded-lg font-bold shrink-0 transition ${
                      treeFilter === 'all'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : (theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-emerald-50 text-slate-600 hover:text-emerald-800')
                    }`}
                  >
                    Semua ({members.length})
                  </button>
                  <button
                    onClick={() => setTreeFilter('inti')}
                    className={`py-1 px-2.5 rounded-lg font-bold shrink-0 transition ${
                      treeFilter === 'inti'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : (theme === 'dark' ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-emerald-50 text-slate-600 hover:text-emerald-800')
                    }`}
                  >
                    Keluarga Inti
                  </button>
                  <button
                    onClick={() => setTreeFilter('ayah')}
                    className={`py-1 px-2.5 rounded-lg font-bold shrink-0 transition flex items-center gap-1 ${
                      treeFilter === 'ayah'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : (theme === 'dark' ? 'bg-sky-950/60 text-sky-300 border border-sky-800/40' : 'bg-sky-50 text-sky-800 hover:bg-sky-100')
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                    <span>Trah Ayah (Q1)</span>
                  </button>
                  <button
                    onClick={() => setTreeFilter('ibu')}
                    className={`py-1 px-2.5 rounded-lg font-bold shrink-0 transition flex items-center gap-1 ${
                      treeFilter === 'ibu'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : (theme === 'dark' ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100')
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span>Trah Ibu (Q2)</span>
                  </button>
                  <button
                    onClick={() => setTreeFilter('ayah_pasangan')}
                    className={`py-1 px-2.5 rounded-lg font-bold shrink-0 transition flex items-center gap-1 ${
                      treeFilter === 'ayah_pasangan'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : (theme === 'dark' ? 'bg-rose-950/60 text-rose-300 border border-rose-800/40' : 'bg-rose-50 text-rose-800 hover:bg-rose-100')
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span>Trah Ayah Pasangan (Q3)</span>
                  </button>
                  <button
                    onClick={() => setTreeFilter('ibu_pasangan')}
                    className={`py-1 px-2.5 rounded-lg font-bold shrink-0 transition flex items-center gap-1 ${
                      treeFilter === 'ibu_pasangan'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : (theme === 'dark' ? 'bg-purple-950/60 text-purple-300 border border-purple-800/40' : 'bg-purple-50 text-purple-800 hover:bg-purple-100')
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                    <span>Trah Ibu Pasangan (Q4)</span>
                  </button>
                </div>

                {/* Generasi / Orbit Filter */}
                <div className="flex gap-1 overflow-x-auto no-scrollbar py-0.5 text-[9px]">
                  {[
                    { id: 'all', label: 'Semua Orbit' },
                    { id: '-3', label: 'Pusat Uyut' },
                    { id: '-2', label: 'Orbit 1 (Kakek)' },
                    { id: '-1', label: 'Orbit 2 (Ayah/Paman)' },
                    { id: '0', label: 'Orbit 3 (User/Saudara)' },
                    { id: '1', label: 'Orbit 4 (Anak)' },
                    { id: '2', label: 'Orbit 5 (Cucu)' },
                    { id: '3', label: 'Orbit 6 (Cicit)' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setGenerationFilter(tab.id as any)}
                      className={`px-2 py-0.5 rounded-full font-medium shrink-0 transition ${
                        generationFilter === tab.id
                          ? 'bg-emerald-600 text-white font-bold'
                          : (theme === 'dark' ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200')
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* VISUAL TREE CANVAS CONTAINER (RESPONSIVE & SCROLLABLE) */}
              <div
                style={{ transform: `scale(${treeZoom})`, transformOrigin: 'top left' }}
                className="transition-transform duration-150 space-y-4 overflow-x-auto p-1"
              >
                {/* Helper Card Renderer */}
                {[
                  {
                    gen: -3,
                    title: 'Pusat Kuadran: Sesepuh Uyut / Aki Moyang',
                    sub: 'Pusat Rasi Bintang Tata Surya',
                    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300'
                  },
                  {
                    gen: -2,
                    title: 'Orbit 1: Generasi Kakek & Nenek (Aki & Nini)',
                    sub: '3 Cabang Utama / Kakek',
                    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300'
                  },
                  {
                    gen: -1,
                    title: 'Orbit 2: Generasi Ayah, Ibu, Uwa, Paman & Bibi',
                    sub: '10 Bersaudara & Paman Bibi Trah',
                    badgeColor: 'bg-teal-100 text-teal-900 border-teal-300'
                  },
                  {
                    gen: 0,
                    title: 'Orbit 3: Poros Inti — User (Hendriana) & Saudara Kandung',
                    sub: 'User No. 3, Pasangan Siti Nurhaliza & 6 Bersaudara',
                    badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-400 font-extrabold'
                  },
                  {
                    gen: 1,
                    title: 'Orbit 4: Generasi Anak (Penerus Nasab)',
                    sub: 'Putra & Putri Generasi Ke-4',
                    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300'
                  },
                  {
                    gen: 2,
                    title: 'Orbit 5: Generasi Cucu (Incu)',
                    sub: 'Keturunan Generasi Ke-5',
                    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300'
                  },
                  {
                    gen: 3,
                    title: 'Orbit 6: Generasi Cicit (Terluar)',
                    sub: 'Keturunan Orbit Terluar',
                    badgeColor: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300'
                  }
                ].map(section => {
                  const sectionNodes = displayedMembers.filter(m => {
                    const raw = familyTree.nodes.find(n => n.id === m.id);
                    return raw?.gen === section.gen;
                  });

                  if (sectionNodes.length === 0) return null;

                  return (
                    <div key={section.gen} className="space-y-2">
                      <div className={`flex items-center justify-between text-[11px] font-bold border-b pb-1 ${
                        theme === 'dark' ? 'text-slate-200 border-slate-800' : 'text-slate-800 border-emerald-200/70'
                      }`}>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full border ${section.badgeColor}`}>
                            Gen {section.gen > 0 ? `+${section.gen}` : section.gen}
                          </span>
                          <span className="uppercase tracking-wider font-extrabold">{section.title}</span>
                        </div>
                        <span className={`text-[10px] font-mono font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'}`}>
                          {sectionNodes.length} Anggota
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {sectionNodes.map(m => {
                          const rawNode = familyTree.nodes.find(n => n.id === m.id);
                          const directChildren = familyTree.nodes.filter(n => n.parentId === m.id);
                          const isUser = rawNode?.isUser || rawNode?.id === 'user_node';

                          return (
                            <div
                              key={m.id}
                              className={`border rounded-2xl p-3 transition space-y-2 relative group ${
                                theme === 'dark'
                                  ? (isUser ? 'bg-slate-900 border-2 border-emerald-500 shadow-md' : 'bg-slate-950/80 border-slate-800 hover:border-emerald-500/40 text-slate-100')
                                  : (isUser ? 'bg-white border-2 border-emerald-500 shadow-sm' : 'bg-white hover:bg-emerald-50/50 border-emerald-100 text-slate-800')
                              }`}
                            >
                              {/* Top Bar: Trah badge, Gender avatar, Name, Status */}
                              <div className="flex items-start justify-between gap-2">
                                <div
                                  onClick={() => setSelectedMember(m)}
                                  className="flex items-start space-x-2.5 cursor-pointer flex-1 min-w-0"
                                >
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0 ${m.gender === 'L' ? 'bg-gradient-to-br from-blue-500 to-blue-700' : 'bg-gradient-to-br from-pink-500 to-rose-600'}`}>
                                    {m.name.slice(0, 2).toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h4 className={`text-xs font-bold leading-tight truncate ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                        {m.name}
                                      </h4>
                                      {isUser && (
                                        <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.2 rounded">
                                          User Utama
                                        </span>
                                      )}
                                    </div>
                                    <p className={`text-[10px] truncate mt-0.5 font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                      {m.kinshipTitle}
                                    </p>
                                    <p className={`text-[9px] font-mono truncate ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                                      {m.binBinti || '-'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full ${
                                    m.status === 'Almarhum'
                                      ? (theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-700')
                                      : (theme === 'dark' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/40' : 'bg-emerald-100 text-emerald-800')
                                  }`}>
                                    {m.status}
                                  </span>
                                  <span className={`text-[9px] font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                    {getYearRangeDisplay(m)}
                                  </span>
                                </div>
                              </div>

                              {/* Attached Spouse Badge (if any) */}
                              {rawNode?.spouseName && (
                                <div className={`border rounded-xl px-2.5 py-1 flex items-center justify-between text-[10px] ${
                                  theme === 'dark' ? 'bg-rose-950/50 border-rose-900/60 text-rose-200' : 'bg-rose-50 border-rose-200 text-rose-800'
                                }`}>
                                  <span className="flex items-center gap-1 font-bold">
                                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                                    <span>Pasangan: {rawNode.spouseName}</span>
                                  </span>
                                  <span className={`text-[9px] font-medium ${theme === 'dark' ? 'text-rose-300' : 'text-rose-600'}`}>
                                    {rawNode.spouseGender === 'L' ? 'Suami' : 'Istri'}
                                  </span>
                                </div>
                              )}

                              {/* Lineage & Info Row */}
                              <div className={`flex items-center justify-between text-[10px] pt-1 border-t ${
                                theme === 'dark' ? 'border-slate-800/80 text-slate-400' : 'border-slate-100 text-slate-500'
                              }`}>
                                <span className="flex items-center gap-1">
                                  <MapPin className={`w-3 h-3 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                  <span>{m.origin || '-'}</span>
                                </span>
                                {directChildren.length > 0 && (
                                  <span className={`font-bold px-2 py-0.2 rounded-full text-[9px] border ${
                                    theme === 'dark' ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/50' : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  }`}>
                                    👶 {directChildren.length} Keturunan
                                  </span>
                                )}
                              </div>

                              {/* Bottom Action Bar on Card */}
                              <div className={`flex gap-1.5 pt-1 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-slate-100'}`}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenInOrbit(m.id);
                                  }}
                                  className="flex-1 bg-slate-900 hover:bg-slate-800 active:scale-95 text-[#5eead4] border border-emerald-500/40 text-[10px] font-bold py-1.5 rounded-xl flex items-center justify-center gap-1 transition shadow-2xs"
                                  title="Sorot dan pusatkan bintang anggota di kanvas OrbitQu"
                                >
                                  <Compass className="w-3 h-3 text-[#5eead4]" />
                                  <span>🪐 Sorot di OrbitQu</span>
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMember(m);
                                  }}
                                  className={`px-2.5 active:scale-95 text-[10px] font-bold py-1.5 rounded-xl transition ${
                                    theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                                  }`}
                                >
                                  Profil
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleOpenEditMember(m);
                                  }}
                                  className={`p-1.5 rounded-xl transition ${
                                    theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900'
                                  }`}
                                  title="Edit data anggota ini"
                                >
                                  <Edit3 className="w-3 h-3" />
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

              {/* Action Buttons: Tambah Anggota */}
              <div className="pt-2 border-t border-emerald-50 flex gap-2">
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs transition active:scale-98"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Anggota Silsilah</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEDSOS TRAH (FEED 4 JALUR TRAH: AYAH, IBU, AYAH PASANGAN, IBU PASANGAN) */}
        {activeTab === 'medsos' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Sub-tab Jalur 4 Menu Trah: Ayah, Ibu, Ayah Pasangan, Ibu Pasangan */}
            <div className={`grid grid-cols-2 sm:grid-cols-4 gap-1.5 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-emerald-100/70 border-emerald-200'} p-1.5 rounded-2xl border`}>
              <button
                onClick={() => setActiveMedsosTrah('ayah')}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl transition flex flex-col items-center justify-center text-center gap-0.5 ${
                  activeMedsosTrah === 'ayah'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-emerald-900 hover:bg-emerald-200/50'
                }`}
              >
                <span>Trah Ayah User</span>
                <span className="text-[9px] opacity-80">(Kiri-Atas)</span>
              </button>
              <button
                onClick={() => setActiveMedsosTrah('ibu')}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl transition flex flex-col items-center justify-center text-center gap-0.5 ${
                  activeMedsosTrah === 'ibu'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-emerald-900 hover:bg-emerald-200/50'
                }`}
              >
                <span>Trah Ibu User</span>
                <span className="text-[9px] opacity-80">(Kanan-Atas)</span>
              </button>
              <button
                onClick={() => setActiveMedsosTrah('ayah_pasangan')}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl transition flex flex-col items-center justify-center text-center gap-0.5 ${
                  activeMedsosTrah === 'ayah_pasangan'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-emerald-900 hover:bg-emerald-200/50'
                }`}
              >
                <span>Trah Ayah Pasangan</span>
                <span className="text-[9px] opacity-80">(Kiri-Bawah)</span>
              </button>
              <button
                onClick={() => setActiveMedsosTrah('ibu_pasangan')}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl transition flex flex-col items-center justify-center text-center gap-0.5 ${
                  activeMedsosTrah === 'ibu_pasangan'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-emerald-900 hover:bg-emerald-200/50'
                }`}
              >
                <span>Trah Ibu Pasangan</span>
                <span className="text-[9px] opacity-80">(Kanan-Bawah)</span>
              </button>
            </div>

            {/* Input Form Berbagi Cerita / Sejarah / Foto Jadul */}
            <form onSubmit={handleCreatePost} className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-emerald-100 text-slate-800'} border rounded-2xl p-3.5 space-y-2.5 shadow-sm`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-700 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs">
                    HU
                  </div>
                  <div>
                    <span className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
                      Bagikan ke {
                        activeMedsosTrah === 'ayah' ? 'Trah Ayah User' :
                        activeMedsosTrah === 'ibu' ? 'Trah Ibu User' :
                        activeMedsosTrah === 'ayah_pasangan' ? 'Trah Ayah Pasangan' : 'Trah Ibu Pasangan'
                      }
                    </span>
                    <span className="text-[10px] text-slate-400 block">Hendriana (User)</span>
                  </div>
                </div>

                {/* Category Picker */}
                <select
                  value={newPostCategory}
                  onChange={e => setNewPostCategory(e.target.value as any)}
                  className={`${theme === 'dark' ? 'bg-slate-950 text-emerald-400 border-slate-700' : 'bg-emerald-50 text-emerald-800 border-emerald-200'} text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none border`}
                >
                  <option value="Kisah Sejarah">Kisah Sejarah</option>
                  <option value="Foto Jadul">Foto Jadul</option>
                  <option value="Agenda Arisan">Agenda Arisan</option>
                  <option value="Kabar Keluarga">Kabar Keluarga</option>
                </select>
              </div>

              <textarea
                value={newPostText}
                onChange={e => setNewPostText(e.target.value)}
                placeholder={`Bagikan arsip cerita, sejarah leluhur, atau agenda silaturahmi untuk ${
                  activeMedsosTrah === 'ayah' ? 'Trah Ayah User' :
                  activeMedsosTrah === 'ibu' ? 'Trah Ibu User' :
                  activeMedsosTrah === 'ayah_pasangan' ? 'Trah Ayah Pasangan' : 'Trah Ibu Pasangan'
                }...`}
                rows={2}
                className={`w-full ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500' : 'bg-[#f0fdf4] border-emerald-200/80 text-slate-800 placeholder-slate-400 focus:border-emerald-600'} rounded-xl p-2.5 text-xs focus:outline-none border resize-none`}
              />

              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-slate-400 italic">
                  Hanya terlihat oleh keluarga {
                    activeMedsosTrah === 'ayah' ? 'Trah Ayah' :
                    activeMedsosTrah === 'ibu' ? 'Trah Ibu' :
                    activeMedsosTrah === 'ayah_pasangan' ? 'Trah Ayah Pasangan' : 'Trah Ibu Pasangan'
                  }
                </span>
                <button
                  type="submit"
                  disabled={!newPostText.trim()}
                  className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white text-xs font-bold px-4 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs transition"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </div>
            </form>

            {/* Linimasa Postingan */}
            <div className="space-y-3">
              {posts.filter(p => p.trah === activeMedsosTrah).map(post => (
                <div
                  key={post.id}
                  className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-emerald-100 text-slate-800'} border rounded-2xl p-4 space-y-2.5 shadow-sm`}
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 ${post.avatarColor} rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs`}>
                        {post.initials}
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                          {post.authorName}{' '}
                          <span className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} font-normal`}>
                            ({post.authorRole})
                          </span>
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {post.timeAgo} • {post.trahName}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[9px] ${theme === 'dark' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-emerald-50 text-emerald-800 border-emerald-200'} border px-2 py-0.5 rounded-full font-bold`}>
                      {post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <p className={`text-xs ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'} leading-relaxed whitespace-pre-line`}>
                    {post.content}
                  </p>

                  {/* Actions Bar */}
                  <div className={`flex items-center justify-between pt-2 border-t ${theme === 'dark' ? 'border-slate-800 text-slate-400' : 'border-emerald-50 text-slate-500'} text-xs`}>
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center space-x-1.5 transition active:scale-95 ${
                        post.isLiked ? 'text-rose-500 font-bold' : 'hover:text-rose-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                      <span>{post.likes} Suka</span>
                    </button>

                    <button
                      onClick={() => setOpenCommentBox(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="hover:text-emerald-400 flex items-center space-x-1.5 transition active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments.length} Komentar</span>
                    </button>
                  </div>

                  {/* Comment Section */}
                  {openCommentBox[post.id] && (
                    <div className={`pt-2 border-t ${theme === 'dark' ? 'border-slate-800' : 'border-emerald-50'} space-y-2 animate-in fade-in duration-150`}>
                      {post.comments.length > 0 && (
                        <div className={`space-y-1.5 ${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-[#f0fdf4] border-emerald-100'} p-2.5 rounded-xl border`}>
                          {post.comments.map(c => (
                            <div key={c.id} className="text-[11px] leading-tight">
                              <span className={`font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'} mr-1.5`}>{c.author}:</span>
                              <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>{c.text}</span>
                              <span className="text-[9px] text-slate-400 block mt-0.5">{c.time}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={commentInput[post.id] || ''}
                          onChange={e => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddComment(post.id);
                            }
                          }}
                          placeholder="Tulis balasan silaturahmi..."
                          className={`flex-1 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-emerald-500' : 'bg-[#f0fdf4] border-emerald-200 text-slate-800 placeholder-slate-400 focus:border-emerald-600'} rounded-xl px-3 py-1.5 text-xs focus:outline-none border`}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold"
                        >
                          Balas
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: FITUR KHUSUS "KIRIM DOA (AL-FATIHAH) MALAM JUMAT" */}
        {activeTab === 'doa' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Header Pengingat Malam Jumat Banner */}
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 rounded-2xl p-4 text-white shadow-md relative overflow-hidden border border-emerald-600/40">
              <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider mb-1">
                <Moon className="w-4 h-4 text-amber-300" />
                <span>Pengingat Khusus • Doa Leluhur Malam Jumat</span>
              </div>
              <h3 className="font-bold text-base leading-tight">
                Kirim Al-Fatihah &amp; Hadhoroh Leluhur
              </h3>
              <p className="text-xs text-emerald-100 leading-relaxed mt-1">
                Otomatis menyusun daftar para leluhur yang telah wafat lengkap dengan nama bin/binti untuk dikirimkan doa bersama ke grup WhatsApp keluarga besar.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="bg-emerald-950/60 text-[#5eead4] border border-emerald-500/40 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                  {deceasedMembers.length} Leluhur Tercatat Wafat
                </span>
                <span className="text-[10px] text-emerald-200 font-mono">
                  Malam Jumat Barokah
                </span>
              </div>
            </div>

            {/* Preview Teks Hadhoroh Siap Salin */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-emerald-100 text-slate-800'} rounded-2xl p-4 shadow-sm border space-y-3`}>
              <div className={`flex justify-between items-center border-b ${theme === 'dark' ? 'border-slate-800' : 'border-emerald-50'} pb-2`}>
                <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'} uppercase tracking-wider flex items-center gap-1.5`}>
                  <HeartHandshake className={`w-4 h-4 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`} />
                  <span>Draf Teks Hadhoroh Siap Salin</span>
                </h4>
                <span className={`text-[10px] ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'} font-bold font-mono`}>Lengkap Bin / Binti</span>
              </div>

              {/* Teks Box Preformatted */}
              <div className={`${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-emerald-300' : 'bg-[#f0fdf4] border-emerald-200/80 text-slate-800'} border rounded-xl p-3 text-xs font-mono leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap`}>
                {generateHadhorohText()}
              </div>

              {/* Action Buttons: Copy & Kirim WA */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleCopyHadhoroh}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs transition active:scale-98"
                >
                  <Copy className="w-4 h-4" />
                  <span>{hadhorohCopied ? 'Tersalin!' : 'Salin Teks Doa'}</span>
                </button>

                <button
                  onClick={handleShareToWA}
                  className="bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs transition active:scale-98"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Kirim ke WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Daftar Leluhur Wafat yang Didokan */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-emerald-100 text-slate-800'} rounded-2xl p-4 shadow-sm border space-y-2.5`}>
              <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'} uppercase tracking-wider`}>
                Daftar Leluhur Almarhum &amp; Almarhumah
              </h4>
              <div className="space-y-2">
                {deceasedMembers.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-2.5 ${theme === 'dark' ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200/80'} rounded-xl border`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className={`w-6 h-6 rounded-full ${theme === 'dark' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-800'} font-bold text-xs flex items-center justify-center`}>
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>
                          {m.name} <span className="font-normal text-slate-500 font-mono">{m.binBinti}</span>
                        </h5>
                        <p className={`text-[10px] ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                          {m.kinshipTitle} • {getYearRangeDisplay(m)} • {m.origin}
                        </p>
                      </div>
                    </div>
                    <span className={`text-[10px] ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'} font-bold`}>
                      Al-Fatihah 🤲
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ARSIP & BUKU (PDF HERITAGE, BACKUP JSON & GAMBAR) */}
        {activeTab === 'arsip' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Kartu Cetak Buku Silsilah PDF */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-2xl p-4 shadow-md space-y-2.5 border border-emerald-500/40">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">Buku Silsilah (PDF Heritage Edition)</h3>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Cetak dokumen resmi silsilah nasab keluarga besar Hendriana dalam format PDF klasik dengan bagan silsilah 3 generasi, biodata, dan cover emas warisan.
              </p>
              <button
                onClick={() => setShowPdfModal(true)}
                className="w-full bg-white text-emerald-900 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow transition active:scale-98"
              >
                <Printer className="w-4 h-4 text-emerald-700" />
                <span>Buka Pratinjau &amp; Cetak PDF Heritage</span>
              </button>
            </div>

            {/* Offline-first Backup & Restore JSON */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-emerald-100 text-slate-800'} rounded-2xl p-4 shadow-sm border space-y-3`}>
              <div className={`flex items-center space-x-2 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-emerald-50'} pb-2`}>
                <Archive className={`w-4 h-4 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`} />
                <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'} uppercase tracking-wider`}>
                  Cadangan &amp; Pemulihan Data (Offline-First)
                </h4>
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                Seluruh data tersimpan secara lokal dan aman di perangkat Anda. Simpan file cadangan .JSON untuk diarsipkan atau dibagikan ke saudara keluarga besar.
              </p>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  onClick={handleExportJSON}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow-xs transition active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>Ekspor Backup JSON</span>
                </button>

                <label className={`${theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 text-emerald-300 border-slate-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'} border font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs transition active:scale-98 text-center`}>
                  <Upload className="w-4 h-4" />
                  <span>Impor Backup JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Bagikan Undangan Keluarga Besar */}
            <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-emerald-100 text-slate-800'} rounded-2xl p-4 shadow-sm border space-y-2.5`}>
              <div className="flex items-center space-x-2">
                <Share2 className={`w-4 h-4 ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'}`} />
                <h4 className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'} uppercase tracking-wider`}>
                  Undang Kerabat Keluarga Besar
                </h4>
              </div>
              <p className={`text-xs ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'} leading-relaxed`}>
                Ajak paman, bibi, sepupu, dan kerabat trah Kuningan &amp; Bogor untuk bersama-sama melengkapi pohon silsilah keluarga kita.
              </p>
              <button
                onClick={() => setShowShareModal(true)}
                className={`w-full ${theme === 'dark' ? 'bg-slate-950 hover:bg-slate-800 text-emerald-300 border-slate-700' : 'bg-[#f0fdf4] hover:bg-emerald-50 text-emerald-800 border-emerald-200'} border font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition active:scale-98`}
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan Tautan Undangan Silaturahmi</span>
              </button>
            </div>
          </div>
        )}
      </main>
        </>
      )}

      {/* BOTTOM NAVIGATION BAR KHUSUS LELUHURQU (WARGAQU EMERALD & ORBITQU DARK/LIGHT PALETTE) */}
      <nav className={`absolute bottom-0 left-0 right-0 ${
        theme === 'dark'
          ? 'bg-slate-950/95 border-slate-800/80 text-slate-300'
          : 'bg-white/95 border-emerald-100 text-slate-800'
      } backdrop-blur-md border-t px-2 py-2 flex justify-around items-center z-40 shadow-lg`}>
        {/* Tab 1: Silsilah */}
        <button
          onClick={() => setActiveTab('silsilah')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 ${
            activeTab === 'silsilah'
              ? (theme === 'dark' ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold')
              : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-emerald-700 font-medium')
          }`}
        >
          <GitFork className={`w-5 h-5 rotate-180 ${activeTab === 'silsilah' ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700') : 'text-slate-400'}`} />
          <span className="text-[10px]">Silsilah</span>
        </button>

        {/* Tab 2: OrbitQu (Core Ancestor Solar Orbit & Poros Saudara) */}
        <button
          onClick={() => setActiveTab('orbitqu')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 relative ${
            activeTab === 'orbitqu'
              ? 'text-emerald-400 font-bold'
              : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200 font-medium' : 'text-slate-400 hover:text-emerald-700 font-medium')
          }`}
        >
          <div className="relative">
            <Compass className={`w-5 h-5 ${activeTab === 'orbitqu' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
          </div>
          <span className="text-[10px]">Orbit &amp; Pohon</span>
        </button>

        {/* Tab 3: Grid Canvas Engine (Spatial Matrix Zero Collision) */}
        <button
          onClick={() => setActiveTab('gridcanvas')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 ${
            activeTab === 'gridcanvas'
              ? (theme === 'dark' ? 'text-teal-400 font-bold' : 'text-teal-700 font-bold')
              : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-emerald-700 font-medium')
          }`}
          title="Buka LeluhurQu - Grid Canvas Engine"
        >
          <Grid className={`w-5 h-5 ${activeTab === 'gridcanvas' ? (theme === 'dark' ? 'text-teal-400' : 'text-teal-700') : 'text-slate-400'}`} />
          <span className="text-[10px]">Grid Canvas</span>
        </button>

        {/* Tab 4: Medsos Trah */}
        <button
          onClick={() => setActiveTab('medsos')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 ${
            activeTab === 'medsos'
              ? (theme === 'dark' ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold')
              : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-emerald-700 font-medium')
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'medsos' ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700') : 'text-slate-400'}`} />
          <span className="text-[10px]">Medsos Trah</span>
        </button>

        {/* Tab 4: Doa Leluhur (Malam Jumat) */}
        <button
          onClick={() => setActiveTab('doa')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 relative ${
            activeTab === 'doa'
              ? (theme === 'dark' ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold')
              : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-emerald-700 font-medium')
          }`}
        >
          <div className="relative">
            <Moon className={`w-5 h-5 ${activeTab === 'doa' ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700') : 'text-slate-400'}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
          </div>
          <span className="text-[10px]">Doa Leluhur</span>
        </button>

        {/* Tab 5: Arsip & Buku */}
        <button
          onClick={() => setActiveTab('arsip')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 ${
            activeTab === 'arsip'
              ? (theme === 'dark' ? 'text-emerald-400 font-bold' : 'text-emerald-700 font-bold')
              : (theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-emerald-700 font-medium')
          }`}
        >
          <Archive className={`w-5 h-5 ${activeTab === 'arsip' ? (theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700') : 'text-slate-400'}`} />
          <span className="text-[10px]">Arsip &amp; Buku</span>
        </button>
      </nav>

      {/* MODAL: DETAIL ANGGOTA KELUARGA (INSPECTOR) */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-emerald-100 text-slate-900'} rounded-2xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl relative border`}>
            <button
              onClick={() => setSelectedMember(null)}
              className={`absolute top-3.5 right-3.5 p-1 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'} rounded-lg`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shadow-xs shrink-0 ${selectedMember.gender === 'L' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                {selectedMember.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className={`font-bold text-base ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'} leading-tight`}>
                  {selectedMember.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedMember.binBinti || '-'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] ${theme === 'dark' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-800'} font-bold px-2 py-0.2 rounded-full`}>
                    {selectedMember.kinshipTitle || selectedMember.role}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${selectedMember.status === 'Almarhum' ? (theme === 'dark' ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700') : (theme === 'dark' ? 'bg-emerald-950/80 text-emerald-400' : 'bg-emerald-50 text-emerald-700')}`}>
                    {selectedMember.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Grid (Privacy First, No NIK) */}
            <div className={`${theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-[#f0fdf4] border-emerald-100'} border rounded-xl p-3 space-y-2 text-xs`}>
              <div className={`flex justify-between items-center border-b ${theme === 'dark' ? 'border-slate-800' : 'border-emerald-100/70'} pb-1.5`}>
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Rentang Tahun:</span>
                <span className={`font-bold font-mono ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{getYearRangeDisplay(selectedMember)}</span>
              </div>
              <div className={`flex justify-between items-center border-b ${theme === 'dark' ? 'border-slate-800' : 'border-emerald-100/70'} pb-1.5`}>
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Asal Daerah:</span>
                <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{selectedMember.origin || '-'}</span>
              </div>
              <div className={`flex justify-between items-center border-b ${theme === 'dark' ? 'border-slate-800' : 'border-emerald-100/70'} pb-1.5`}>
                <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Jalur Nasab:</span>
                <span className={`font-bold ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'}`}>
                  {selectedMember.trah === 'ayah' ? 'Trah Ayah User' :
                   selectedMember.trah === 'ibu' ? 'Trah Ibu User' :
                   selectedMember.trah === 'ayah_pasangan' ? 'Trah Ayah Pasangan' :
                   selectedMember.trah === 'ibu_pasangan' ? 'Trah Ibu Pasangan' : 'Keluarga Inti'}
                </span>
              </div>
              {selectedMember.parentName && (
                <div className={`flex justify-between items-center border-b ${theme === 'dark' ? 'border-slate-800' : 'border-emerald-100/70'} pb-1.5`}>
                  <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Ayah / Induk Orbit 2:</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{selectedMember.parentName}</span>
                </div>
              )}
              {selectedMember.kakekName && (
                <div className={`flex justify-between items-center border-b ${theme === 'dark' ? 'border-slate-800' : 'border-emerald-100/70'} pb-1.5`}>
                  <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Kakek / Induk Orbit 1:</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{selectedMember.kakekName}</span>
                </div>
              )}
              {selectedMember.uyutName && (
                <div className={`flex justify-between items-center border-b ${theme === 'dark' ? 'border-slate-800' : 'border-emerald-100/70'} pb-1.5`}>
                  <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Uyut / Pusat Kuadran:</span>
                  <span className={`font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>{selectedMember.uyutName}</span>
                </div>
              )}
              {selectedMember.notes && (
                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 block">Catatan Silsilah:</span>
                  <p className={`text-[11px] ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'} italic mt-0.5`}>{selectedMember.notes}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  handleOpenInOrbit(selectedMember.id);
                  setSelectedMember(null);
                }}
                className="w-full bg-slate-950 hover:bg-slate-800 text-[#5eead4] font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 border border-emerald-500/40 shadow-xs transition active:scale-98"
              >
                <Compass className="w-4 h-4 text-[#5eead4] animate-pulse" />
                <span>🪐 Sorot Posisi di OrbitQu</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleOpenEditMember(selectedMember);
                  }}
                  className={`${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'} font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 border transition active:scale-98`}
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Data</span>
                </button>
                <button
                  onClick={() => {
                    handleOpenAddChild(selectedMember);
                  }}
                  className={`${theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border-slate-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'} font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 border transition active:scale-98`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Anak</span>
                </button>
              </div>

              {selectedMember.status === 'Almarhum' && (
                <button
                  onClick={() => {
                    showNotification(`Doa Al-Fatihah dikirimkan untuk ${selectedMember.name} 🤲`);
                    setSelectedMember(null);
                  }}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
                >
                  <span>🤲 Kirim Doa Al-Fatihah</span>
                </button>
              )}

              <div className="flex gap-2 pt-1">
                {!selectedMember.isUser && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Hapus ${selectedMember.name} dari silsilah dan OrbitQu?`)) {
                        handleDeleteMember(selectedMember.id);
                      }
                    }}
                    className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center justify-center transition border border-rose-200"
                    title="Hapus Anggota Ini"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2 rounded-xl transition"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SCAN KK (OCR PRIVACY-FIRST SIMULATOR) */}
      {showScanKKModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-emerald-100 text-slate-800'} rounded-2xl max-w-sm w-full p-4 space-y-4 shadow-2xl relative border`}>
            <button
              onClick={() => setShowScanKKModal(false)}
              className={`absolute top-3.5 right-3.5 p-1 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'} rounded-lg`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-700 text-white rounded-xl flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Scan Kartu Keluarga</h3>
                <p className={`text-[10px] ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'} font-bold`}>Privacy-First • NIK Tidak Disimpan</p>
              </div>
            </div>

            <div className="relative bg-slate-900 rounded-xl h-44 flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-emerald-500">
              {isScanning ? (
                <div className="text-center space-y-1.5 z-10 text-white">
                  <Sparkles className="w-8 h-8 text-[#5eead4] mx-auto animate-spin" />
                  <p className="text-xs font-bold text-[#5eead4]">Memindai Baris Keluarga...</p>
                  <p className="text-[10px] text-slate-400">Menyaring nama anggota &amp; menyamarkan NIK</p>
                </div>
              ) : scanResult ? (
                <div className="text-center space-y-1.5 z-10 text-white p-3">
                  <CheckCircle2 className="w-10 h-10 text-[#5eead4] mx-auto" />
                  <p className="text-xs font-bold text-white">4 Anggota Terdeteksi Valid!</p>
                  <p className="text-[10px] text-emerald-300">NIK disembunyikan total sesuai standar privasi</p>
                </div>
              ) : (
                <div className="text-center space-y-1.5 p-4 text-slate-400">
                  <Camera className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-xs text-slate-300 font-medium">Arahkan kamera ke lembar Kartu Keluarga</p>
                  <p className="text-[10px] text-slate-500">Hanya membaca nama &amp; susunan keluarga</p>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!scanResult ? (
                <button
                  onClick={handleStartScanKK}
                  disabled={isScanning}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isScanning ? 'Memindai...' : 'Ambil Foto & Pindai'}</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setShowScanKKModal(false);
                    setScanResult(false);
                    showNotification('Struktur keluarga berhasil diperbarui dari hasil pindai!');
                  }}
                  className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Terapkan ke Silsilah</span>
                </button>
              )}
              <button
                onClick={() => setShowScanKKModal(false)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: TAMBAH ANGGOTA SILSILAH BARU */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <form
            onSubmit={handleAddMemberSubmit}
            className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-emerald-100 text-slate-800'} rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl relative border max-h-[92vh] overflow-y-auto no-scrollbar`}
          >
            <button
              type="button"
              onClick={() => setShowAddMemberModal(false)}
              className={`absolute top-3.5 right-3.5 p-1 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'} rounded-lg`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-700 text-white rounded-xl flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Tambah Anggota Silsilah</h3>
                <p className={`text-[10px] ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'} font-bold`}>Privacy-First (Tanpa NIK)</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Contoh: Muhammad Rizki"
                  className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Nama Ayah (Bin / Binti)
                  </label>
                  <input
                    type="text"
                    value={formBinBinti}
                    onChange={e => setFormBinBinti(e.target.value)}
                    placeholder="Nama ayah kandung"
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Panggilan / Gelar
                  </label>
                  <input
                    type="text"
                    value={formNickname}
                    onChange={e => setFormNickname(e.target.value)}
                    placeholder="Contoh: Kang Iki"
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Jalur Trah
                  </label>
                  <select
                    value={formTrah}
                    onChange={e => setFormTrah(e.target.value as any)}
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                  >
                    <option value="inti">Keluarga Inti</option>
                    <option value="ayah">Trah Ayah (Kuningan)</option>
                    <option value="ibu">Trah Ibu (Bogor)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Panggilan Kekerabatan
                  </label>
                  <select
                    value={formKinship}
                    onChange={e => {
                      setFormKinship(e.target.value);
                      if (e.target.value.includes('Aki')) setFormRelation('kakek');
                      else if (e.target.value.includes('Nini')) setFormRelation('nenek');
                      else if (e.target.value.includes('Uyut')) setFormRelation('buyut');
                      else if (e.target.value.includes('Anak')) setFormRelation('anak');
                      else if (e.target.value.includes('Mang') || e.target.value.includes('Bibi') || e.target.value.includes('Uwa')) setFormRelation('paman_bibi');
                    }}
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                  >
                    <option value="Anak">Anak (Putra/Putri)</option>
                    <option value="Uwa">Uwa (Kakak Ortu)</option>
                    <option value="Mang">Mang / Paman (Adik Ortu Laki-laki)</option>
                    <option value="Bibi">Bibi (Adik Ortu Perempuan)</option>
                    <option value="Aki">Aki (Kakek)</option>
                    <option value="Nini">Nini (Nenek)</option>
                    <option value="Uyut">Uyut (Buyut / Moyang)</option>
                    <option value="Cucu">Cucu (Incu)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Gender
                  </label>
                  <select
                    value={formGender}
                    onChange={e => setFormGender(e.target.value as any)}
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Th. Lahir
                  </label>
                  <input
                    type="number"
                    value={formBirthYear}
                    onChange={e => setFormBirthYear(e.target.value)}
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Status
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                  >
                    <option value="Hidup">Hidup</option>
                    <option value="Almarhum">Almarhum</option>
                  </select>
                </div>
              </div>

              {formStatus === 'Almarhum' && (
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Tahun Wafat (Almarhum)
                  </label>
                  <input
                    type="number"
                    value={formDeathYear}
                    onChange={e => setFormDeathYear(e.target.value)}
                    placeholder="Contoh: 2018"
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Asal Daerah / Kampung
                </label>
                <input
                  type="text"
                  value={formOrigin}
                  onChange={e => setFormOrigin(e.target.value)}
                  placeholder="Contoh: Cilimus, Kuningan"
                  className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Penentuan / Perapian Garis Orbit (Ayah, Kakek, Uyut) */}
              <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                  <span className="text-[10px] uppercase font-bold text-emerald-900 flex items-center gap-1">
                    🪐 Penentuan Garis Antar Orbit
                  </span>
                  <span className="text-[9px] text-emerald-700 italic">Bisa edit / isi sendiri jika typo</span>
                </div>

                {/* 1. Garis Ayah / Induk Orbit 2 */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-700 mb-0.5">
                    1. Garis Ayah / Induk Orbit 2:
                  </label>
                  <select
                    value={formAyahSelect}
                    onChange={e => {
                      setFormAyahSelect(e.target.value);
                      if (e.target.value !== 'custom') {
                        setFormAyahCustom(e.target.value);
                      }
                    }}
                    className="w-full bg-white border border-emerald-200 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="custom">✍️ Ketik Manual / Perbaiki Typo...</option>
                    {members.filter(m => m.gender === 'L' || m.relation === 'ayah' || m.relation === 'paman_bibi').map(m => (
                      <option key={m.id} value={m.name}>{m.name} ({m.kinshipTitle || m.role})</option>
                    ))}
                  </select>
                  {formAyahSelect === 'custom' && (
                    <input
                      type="text"
                      value={formAyahCustom}
                      onChange={e => setFormAyahCustom(e.target.value)}
                      placeholder="Ketik nama ayah kandung (misal: Ayah Karta)"
                      className="mt-1 w-full bg-white border border-emerald-300 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  )}
                </div>

                {/* 2. Garis Kakek / Induk Orbit 1 */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-700 mb-0.5">
                    2. Garis Kakek / Induk Orbit 1:
                  </label>
                  <select
                    value={formKakekSelect}
                    onChange={e => {
                      setFormKakekSelect(e.target.value);
                      if (e.target.value !== 'custom') {
                        setFormKakekCustom(e.target.value);
                      }
                    }}
                    className="w-full bg-white border border-emerald-200 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="custom">✍️ Ketik Manual / Perbaiki Typo...</option>
                    {members.filter(m => m.relation === 'kakek' || m.kinshipTitle?.includes('Kakek') || m.kinshipTitle?.includes('Aki')).map(m => (
                      <option key={m.id} value={m.name}>{m.name} ({m.kinshipTitle || m.role})</option>
                    ))}
                  </select>
                  {formKakekSelect === 'custom' && (
                    <input
                      type="text"
                      value={formKakekCustom}
                      onChange={e => setFormKakekCustom(e.target.value)}
                      placeholder="Ketik nama kakek (misal: Kakek B)"
                      className="mt-1 w-full bg-white border border-emerald-300 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  )}
                </div>

                {/* 3. Garis Uyut / Pusat Kuadran */}
                <div>
                  <label className="block text-[9px] font-bold text-slate-700 mb-0.5">
                    3. Garis Uyut / Pusat Kuadran:
                  </label>
                  <select
                    value={formUyutSelect}
                    onChange={e => {
                      setFormUyutSelect(e.target.value);
                      if (e.target.value !== 'custom') {
                        setFormUyutCustom(e.target.value);
                      }
                    }}
                    className="w-full bg-white border border-emerald-200 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                  >
                    <option value="custom">✍️ Ketik Manual / Perbaiki Typo...</option>
                    {members.filter(m => m.relation === 'buyut' || m.kinshipTitle?.includes('Uyut')).map(m => (
                      <option key={m.id} value={m.name}>{m.name} ({m.kinshipTitle || m.role})</option>
                    ))}
                  </select>
                  {formUyutSelect === 'custom' && (
                    <input
                      type="text"
                      value={formUyutCustom}
                      onChange={e => setFormUyutCustom(e.target.value)}
                      placeholder="Ketik nama uyut (misal: Kyai Abdul Ghani)"
                      className="mt-1 w-full bg-white border border-emerald-300 rounded-lg p-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Catatan Silsilah
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="Keterangan tambahan atau nama pasangan"
                  className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
              >
                Simpan ke Silsilah
              </button>
              <button
                type="button"
                onClick={() => setShowAddMemberModal(false)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EDIT ANGGOTA SILSILAH / ORBITQU */}
      {showEditMemberModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <form
            onSubmit={handleEditMemberSubmit}
            className={`${theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-emerald-100 text-slate-800'} rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl relative border max-h-[92vh] overflow-y-auto no-scrollbar`}
          >
            <button
              type="button"
              onClick={() => setShowEditMemberModal(false)}
              className={`absolute top-3.5 right-3.5 p-1 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-700'} rounded-lg`}
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-700 text-white rounded-xl flex items-center justify-center">
                <Edit3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-slate-100' : 'text-slate-900'}`}>Edit Anggota Silsilah &amp; OrbitQu</h3>
                <p className={`text-[10px] ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-700'} font-bold`}>Sinkronisasi Langsung ke Garis Orbit</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:border-emerald-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Gelar / Panggilan
                  </label>
                  <input
                    type="text"
                    value={editOrder}
                    onChange={e => setEditOrder(e.target.value)}
                    placeholder="Contoh: Anak ke-1 / Aki"
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Peran / Hubungan
                  </label>
                  <input
                    type="text"
                    value={editRole}
                    onChange={e => setEditRole(e.target.value)}
                    placeholder="Contoh: Ayah / Anak"
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Kuadran Trah
                  </label>
                  <select
                    value={editQuadrant}
                    onChange={e => setEditQuadrant(e.target.value as any)}
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                  >
                    <option value="Q1">Q1: Trah Ayah User (Kuningan)</option>
                    <option value="Q2">Q2: Trah Ibu User (Bogor)</option>
                    <option value="Q3">Q3: Trah Ayah Pasangan</option>
                    <option value="Q4">Q4: Trah Ibu Pasangan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Jenis Kelamin
                  </label>
                  <select
                    value={editGender}
                    onChange={e => setEditGender(e.target.value as any)}
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Nama Pasangan
                </label>
                <input
                  type="text"
                  value={editSpouseName}
                  onChange={e => setEditSpouseName(e.target.value)}
                  placeholder="Nama istri / suami"
                  className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Th. Lahir
                  </label>
                  <input
                    type="text"
                    value={editBirthYear}
                    onChange={e => setEditBirthYear(e.target.value)}
                    placeholder="1990"
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as any)}
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-bold"
                  >
                    <option value="Hidup">Hidup</option>
                    <option value="Almarhum">Almarhum</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                    Th. Wafat
                  </label>
                  <input
                    type="text"
                    value={editDeathYear}
                    onChange={e => setEditDeathYear(e.target.value)}
                    placeholder="2020"
                    disabled={editStatus === 'Hidup'}
                    className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600 font-mono disabled:opacity-40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Asal Daerah / Kampung
                </label>
                <input
                  type="text"
                  value={editOrigin}
                  onChange={e => setEditOrigin(e.target.value)}
                  placeholder="Contoh: Cilimus, Kuningan"
                  className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Induk Garis Silsilah / Orang Tua
                </label>
                <select
                  value={editParentId}
                  onChange={e => setEditParentId(e.target.value)}
                  className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                >
                  <option value="">-- Tanpa Induk (Pusat Uyut / Akar) --</option>
                  {familyTree.nodes.filter(n => n.id !== editNodeId).map(n => (
                    <option key={n.id} value={n.id}>{n.name} ({n.order || n.role || `Gen ${n.gen}`})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-slate-500 uppercase font-bold mb-1">
                  Catatan Silsilah
                </label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="Keterangan riwayat atau nasab"
                  className="w-full bg-[#f0fdf4] border border-emerald-200 rounded-xl p-2 text-slate-900 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition"
              >
                Simpan Perubahan
              </button>
              <button
                type="button"
                onClick={() => setShowEditMemberModal(false)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: PRATINJAU BUKU SILSILAH PDF HERITAGE */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl relative border border-emerald-100 max-h-[90vh] flex flex-col">
            <button
              onClick={() => setShowPdfModal(false)}
              className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-700 text-white rounded-xl flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Buku Silsilah (PDF Heritage)</h3>
                <p className="text-[10px] text-emerald-700 font-bold">Dokumen Resmi Silsilah Nasab Keluarga</p>
              </div>
            </div>

            {/* Book Preview Scroll Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 p-1">
              {/* Cover Emas & Emerald */}
              <div className="bg-gradient-to-b from-[#064e3b] via-[#047857] to-[#022c22] border-2 border-amber-300 rounded-xl p-4 text-center space-y-2 text-white shadow-md">
                <div className="w-12 h-12 bg-emerald-950/80 rounded-full mx-auto flex items-center justify-center border border-amber-300">
                  <GitFork className="w-6 h-6 text-amber-300 rotate-180" />
                </div>
                <span className="text-[9px] uppercase tracking-widest text-amber-300 font-bold block">
                  Kitab Nasab &amp; Buku Silsilah
                </span>
                <h4 className="font-serif text-lg font-bold text-white tracking-wide">
                  TRAH BESAR HENDRIANA
                </h4>
                <div className="text-[10px] text-emerald-200 space-y-0.5">
                  <p>Trah Paternal: Cilimus, Kuningan</p>
                  <p>Trah Maternal: Dramaga, Bogor</p>
                  <p className="text-amber-300 font-mono text-[9px] pt-1">
                    Edisi Arsip Pusaka Digital WargaQu 2026
                  </p>
                </div>
              </div>

              {/* Ringkasan Generasi */}
              <div className="bg-[#f0fdf4] border border-emerald-200 rounded-xl p-3 text-xs space-y-2">
                <div className="flex justify-between items-center border-b border-emerald-200/70 pb-1.5">
                  <span className="font-bold text-slate-900">Ikhtisar Silsilah Terdaftar</span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800">
                    {members.length} Jiwa Terdata
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-700">
                  <p>• <strong>Generasi Buyut:</strong> Kyai Abdul Ghani (Kuningan), H. Hasan Sulaeman (Bogor)</p>
                  <p>• <strong>Generasi Kakek/Nenek:</strong> Abah Karta, Emak Rohanah, Abah Suryana, Emak Siti</p>
                  <p>• <strong>Generasi Orang Tua:</strong> Hendriana &amp; Siti Nurhaliza</p>
                  <p>• <strong>Generasi Penerus:</strong> Rizky Al-Fathir, Nabila Zahra</p>
                </div>
              </div>
            </div>

            {/* Cetak & Unduh Action Buttons */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  window.print?.();
                  showNotification('Membuka dialog cetak PDF...');
                }}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Dokumen PDF</span>
              </button>
              <button
                onClick={() => {
                  showNotification('Buku silsilah PDF berhasil diunduh!');
                  setShowPdfModal(false);
                }}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BAGIKAN UNDANGAN KELUARGA */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl relative border border-emerald-100 text-slate-800">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-700 text-white rounded-xl flex items-center justify-center">
                <Share2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Undangan Silaturahmi Nasab</h3>
                <p className="text-[10px] text-emerald-700 font-bold">LeluhurQu • Keluarga Besar</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-[#f0fdf4] p-3 rounded-xl border border-emerald-100">
              Bagikan tautan ini ke grup WhatsApp keluarga Trah Kuningan &amp; Bogor untuk merajut silaturahmi, doa malam Jumat bersama, dan melengkapi garis keturunan keluarga besar.
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const shareText = `Assalamu'alaikum wr. wb. Mengajak keluarga besar Trah Hendriana (Trah Kuningan & Bogor) untuk bergabung di silsilah keluarga & doa malam Jumat bersama di aplikasi LeluhurQu. Klik: ${window.location.href}`;
                  if (navigator.share) {
                    navigator.share({ title: 'LeluhurQu', text: shareText, url: window.location.href }).catch(() => {});
                  } else {
                    navigator.clipboard?.writeText(shareText);
                    showNotification('Tautan undangan silsilah disalin!');
                  }
                  setShowShareModal(false);
                }}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <Share2 className="w-4 h-4" />
                <span>Bagikan ke WhatsApp</span>
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
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
