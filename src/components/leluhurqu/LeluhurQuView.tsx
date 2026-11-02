import React, { useState, useEffect, useRef } from 'react';
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
  Compass
} from 'lucide-react';
import { OrbitQuView } from './OrbitQuView';

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

const DEFAULT_MEMBERS: FamilyMember[] = [
  // 1. PUSAT KUADRAN: UYUT (Generasi +3)
  {
    id: 'uyut-ghani',
    name: 'Kyai Abdul Ghani',
    nickname: 'Uyut Ghani',
    binBinti: 'bin Hasanudin',
    kinshipTitle: 'Pusat: Uyut / Aki Moyang',
    role: 'Sesepuh Pendiri Trah',
    relation: 'buyut',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1918',
    deathYear: '1994',
    status: 'Almarhum',
    origin: 'Cilimus, Kuningan',
    notes: 'Pusat Kuadran Trah Ayah. Makam di Pasarean Cilimus.'
  },

  // 2. ORBIT 1: 3 KAKEK (A, B, C)
  {
    id: 'kakek-a',
    name: 'Kakek A (Sulung)',
    nickname: 'Aki Kolot',
    binBinti: 'bin Abdul Ghani',
    kinshipTitle: 'Orbit 1: Kakek A (Anak 1)',
    role: 'Kakek Tertua',
    relation: 'kakek',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1942',
    deathYear: '2015',
    status: 'Almarhum',
    origin: 'Kuningan',
    uyutName: 'Kyai Abdul Ghani'
  },
  {
    id: 'kakek-b',
    name: 'Kakek B (Poros Utama Ayah)',
    nickname: 'Abah Sepuh',
    binBinti: 'bin Abdul Ghani',
    kinshipTitle: 'Orbit 1: Kakek B (Anak 2 - Poros)',
    role: 'Kakek Kandung User',
    relation: 'kakek',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1945',
    status: 'Hidup',
    origin: 'Kuningan',
    notes: 'Memiliki 10 anak (Uwa 1 s/d Bibi 10).',
    uyutName: 'Kyai Abdul Ghani'
  },
  {
    id: 'kakek-c',
    name: 'Kakek C (Bungsu)',
    nickname: 'Aki Bungsu',
    binBinti: 'bin Abdul Ghani',
    kinshipTitle: 'Orbit 1: Kakek C (Anak 3)',
    role: 'Kakek Paman',
    relation: 'kakek',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1949',
    status: 'Hidup',
    origin: 'Kuningan',
    uyutName: 'Kyai Abdul Ghani'
  },

  // 3. ORBIT 2: 10 AYAH/PAMAN/BIBI (Anak-anak Kakek B)
  {
    id: 'ayah-1',
    name: 'Uwa 1',
    binBinti: 'bin Kakek B',
    kinshipTitle: 'Orbit 2: Uwa 1 (Anak 1)',
    role: 'Uwa Sulung',
    relation: 'paman_bibi',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1968',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Kakek B (Poros Utama Ayah)',
    kakekName: 'Kakek B (Poros Utama Ayah)',
    uyutName: 'Kyai Abdul Ghani'
  },
  {
    id: 'ayah-2',
    name: 'Ayah Karta (Anak 2 - Poros User)',
    nickname: 'Bapak Karta',
    binBinti: 'bin Kakek B',
    kinshipTitle: 'Orbit 2: Ayah Kandung User',
    role: 'Ayah Kandung (Anak 2)',
    relation: 'ayah',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1970',
    status: 'Hidup',
    origin: 'Kuningan',
    notes: 'Ayah kandung user (memiliki 6 anak: Kakak 1, Kakak 2, User Hendriana, Adik 4, Adik 5, Adik 6)',
    parentName: 'Kakek B (Poros Utama Ayah)',
    kakekName: 'Kakek B (Poros Utama Ayah)',
    uyutName: 'Kyai Abdul Ghani'
  },
  {
    id: 'ayah-3',
    name: 'Paman 3',
    binBinti: 'bin Kakek B',
    kinshipTitle: 'Orbit 2: Paman 3 (Anak 3)',
    role: 'Paman',
    relation: 'paman_bibi',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1972',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Kakek B (Poros Utama Ayah)'
  },
  {
    id: 'ayah-4',
    name: 'Bibi 4',
    binBinti: 'binti Kakek B',
    kinshipTitle: 'Orbit 2: Bibi 4 (Anak 4)',
    role: 'Bibi',
    relation: 'paman_bibi',
    trah: 'ayah',
    gender: 'P',
    birthYear: '1974',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Kakek B (Poros Utama Ayah)'
  },
  {
    id: 'ayah-5',
    name: 'Paman 5',
    binBinti: 'bin Kakek B',
    kinshipTitle: 'Orbit 2: Paman 5 (Anak 5)',
    role: 'Paman',
    relation: 'paman_bibi',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1976',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Kakek B (Poros Utama Ayah)'
  },
  {
    id: 'ayah-6',
    name: 'Bibi 6',
    binBinti: 'binti Kakek B',
    kinshipTitle: 'Orbit 2: Bibi 6 (Anak 6)',
    role: 'Bibi',
    relation: 'paman_bibi',
    trah: 'ayah',
    gender: 'P',
    birthYear: '1978',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Kakek B (Poros Utama Ayah)'
  },
  {
    id: 'ayah-7',
    name: 'Paman 7',
    binBinti: 'bin Kakek B',
    kinshipTitle: 'Orbit 2: Paman 7 (Anak 7)',
    role: 'Paman',
    relation: 'paman_bibi',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1980',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Kakek B (Poros Utama Ayah)'
  },
  {
    id: 'ayah-8',
    name: 'Bibi 8',
    binBinti: 'binti Kakek B',
    kinshipTitle: 'Orbit 2: Bibi 8 (Anak 8)',
    role: 'Bibi',
    relation: 'paman_bibi',
    trah: 'ayah',
    gender: 'P',
    birthYear: '1982',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Kakek B (Poros Utama Ayah)'
  },
  {
    id: 'ayah-9',
    name: 'Paman 9',
    binBinti: 'bin Kakek B',
    kinshipTitle: 'Orbit 2: Paman 9 (Anak 9)',
    role: 'Paman',
    relation: 'paman_bibi',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1984',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Kakek B (Poros Utama Ayah)'
  },
  {
    id: 'ayah-10',
    name: 'Bibi 10',
    binBinti: 'binti Kakek B',
    kinshipTitle: 'Orbit 2: Bibi 10 (Anak 10)',
    role: 'Bibi Bungsu',
    relation: 'paman_bibi',
    trah: 'ayah',
    gender: 'P',
    birthYear: '1986',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Kakek B (Poros Utama Ayah)'
  },

  // 4. ORBIT 3: 6 USER DAN SAUDARA (Anak-anak Ayah Karta No. 2)
  {
    id: 'saudara-1',
    name: 'Kakak 1',
    binBinti: 'bin Karta',
    kinshipTitle: 'Orbit 3: Kakak Sulung (1 dari 6)',
    role: 'Kakak Sulung',
    relation: 'anak',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1992',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Ayah Karta (Anak 2 - Poros User)'
  },
  {
    id: 'saudara-2',
    name: 'Kakak 2',
    binBinti: 'binti Karta',
    kinshipTitle: 'Orbit 3: Kakak Kedua (2 dari 6)',
    role: 'Kakak Kedua',
    relation: 'anak',
    trah: 'ayah',
    gender: 'P',
    birthYear: '1994',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Ayah Karta (Anak 2 - Poros User)'
  },
  {
    id: 'user',
    name: 'Hendriana (User)',
    nickname: 'Bageur',
    binBinti: 'bin Karta',
    kinshipTitle: 'Orbit 3: User Poros Inti (3 dari 6)',
    role: 'User (Poros Keluarga)',
    relation: 'ayah',
    trah: 'inti',
    gender: 'L',
    birthYear: '1996',
    status: 'Hidup',
    origin: 'Kuningan / Bogor',
    notes: 'Anak ke-3 dari 6 bersaudara. Memiliki 3 anak (Anak 1, 2, 3).',
    parentName: 'Ayah Karta (Anak 2 - Poros User)',
    kakekName: 'Kakek B (Poros Utama Ayah)',
    uyutName: 'Kyai Abdul Ghani'
  },
  {
    id: 'saudara-4',
    name: 'Adik 4',
    binBinti: 'bin Karta',
    kinshipTitle: 'Orbit 3: Adik Keempat (4 dari 6)',
    role: 'Adik Keempat',
    relation: 'anak',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1998',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Ayah Karta (Anak 2 - Poros User)'
  },
  {
    id: 'saudara-5',
    name: 'Adik 5',
    binBinti: 'binti Karta',
    kinshipTitle: 'Orbit 3: Adik Kelima (5 dari 6)',
    role: 'Adik Kelima',
    relation: 'anak',
    trah: 'ayah',
    gender: 'P',
    birthYear: '2001',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Ayah Karta (Anak 2 - Poros User)'
  },
  {
    id: 'saudara-6',
    name: 'Adik 6',
    binBinti: 'bin Karta',
    kinshipTitle: 'Orbit 3: Adik Bungsu (6 dari 6)',
    role: 'Adik Bungsu',
    relation: 'anak',
    trah: 'ayah',
    gender: 'L',
    birthYear: '2004',
    status: 'Hidup',
    origin: 'Kuningan',
    parentName: 'Ayah Karta (Anak 2 - Poros User)'
  },

  // 5. ORBIT 4: 3 ANAK USER (Hendriana)
  {
    id: 'anak-1',
    name: 'Anak 1 (Putra Sulung)',
    nickname: 'Iki',
    binBinti: 'bin Hendriana',
    kinshipTitle: 'Orbit 4: Anak 1 (Sulung)',
    role: 'Putra Sulung',
    relation: 'anak',
    trah: 'inti',
    gender: 'L',
    birthYear: '2018',
    status: 'Hidup',
    origin: 'Bogor',
    parentName: 'Hendriana (User)'
  },
  {
    id: 'anak-2',
    name: 'Anak 2 (Putri Tengah)',
    nickname: 'Bila',
    binBinti: 'binti Hendriana',
    kinshipTitle: 'Orbit 4: Anak 2 (Tengah)',
    role: 'Putri Tengah',
    relation: 'anak',
    trah: 'inti',
    gender: 'P',
    birthYear: '2021',
    status: 'Hidup',
    origin: 'Bogor',
    parentName: 'Hendriana (User)'
  },
  {
    id: 'anak-3',
    name: 'Anak 3 (Putra Bungsu)',
    nickname: 'Dede',
    binBinti: 'bin Hendriana',
    kinshipTitle: 'Orbit 4: Anak 3 (Bungsu)',
    role: 'Putra Bungsu',
    relation: 'anak',
    trah: 'inti',
    gender: 'L',
    birthYear: '2024',
    status: 'Hidup',
    origin: 'Bogor',
    parentName: 'Hendriana (User)'
  },

  // PASANGAN & TRAH LAINNYA (IBU, AYAH PASANGAN, IBU PASANGAN)
  {
    id: 'istri-user',
    name: 'Siti Nurhaliza',
    nickname: 'Neng Siti',
    binBinti: 'binti Suryana',
    kinshipTitle: 'Ibu (Istri Hendriana)',
    role: 'Istri Kepala Keluarga',
    relation: 'ibu',
    trah: 'ibu',
    gender: 'P',
    birthYear: '1997',
    status: 'Hidup',
    origin: 'Dramaga, Bogor'
  },
  {
    id: 'ibu-mertua-ayah',
    name: 'H. Suryana (Ayah Pasangan)',
    nickname: 'Abah Mertua',
    binBinti: 'bin Sanusi',
    kinshipTitle: 'Trah Ayah Pasangan',
    role: 'Ayah Mertua',
    relation: 'kakek',
    trah: 'ayah_pasangan',
    gender: 'L',
    birthYear: '1955',
    status: 'Hidup',
    origin: 'Bogor'
  },
  {
    id: 'ibu-mertua-ibu',
    name: 'Hj. Maryam (Ibu Pasangan)',
    nickname: 'Ibu Mertua',
    binBinti: 'binti Syamsuddin',
    kinshipTitle: 'Trah Ibu Pasangan',
    role: 'Ibu Mertua',
    relation: 'nenek',
    trah: 'ibu_pasangan',
    gender: 'P',
    birthYear: '1958',
    status: 'Hidup',
    origin: 'Bogor'
  }
];

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
  // Navigation Tabs: Silsilah | OrbitQu | Medsos | Doa Malam Jumat | Arsip & Ekspor
  const [activeTab, setActiveTab] = useState<'silsilah' | 'orbitqu' | 'medsos' | 'doa' | 'arsip'>('silsilah');
  const [activeMedsosTrah, setActiveMedsosTrah] = useState<'ayah' | 'ibu' | 'ayah_pasangan' | 'ibu_pasangan'>('ayah');

  // Silsilah Data (Offline-first LocalStorage)
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_leluhur_members_v3');
      return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
    } catch {
      return DEFAULT_MEMBERS;
    }
  });

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
  const [treeFilter, setTreeFilter] = useState<'all' | 'inti' | 'ayah' | 'ibu'>('all');
  const [treeZoom, setTreeZoom] = useState<number>(1);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Modals
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showScanKKModal, setShowScanKKModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<boolean>(false);

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

  // Persist Data (v3 clean data)
  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_leluhur_members_v3', JSON.stringify(members));
    } catch (e) {
      console.error(e);
    }
  }, [members]);

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

  // Generate Hadhoroh Doa Teks siap salin
  const generateHadhorohText = () => {
    const header = `بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\n*PENGINGAT DOA MALAM JUMAT - HADHOROH LELUHURQU*\n*Trah Besar Hendriana (Kuningan & Bogor)*\n\nIlaa hadhrotin Nabiyyil Musthafa Muhammadin SAW, wa 'alaa aalihi wa ash-habihi ajma'in... Al-Fatihah.\n\nTsumma ilaa arwahi aabaa-inaa wa ummahaatinaa wa ajdaadinaa wa jaddaatinaa (Khusushon Para Leluhur):\n`;

    const daftarAyah = deceasedAyah.map((m, i) => `  ${i + 1}. Almarhum ${m.name} ${m.binBinti || ''} (${m.kinshipTitle || 'Trah Kuningan'})`).join('\n');
    const daftarIbu = deceasedIbu.map((m, i) => `  ${i + 1}. Almarhum/ah ${m.name} ${m.binBinti || ''} (${m.kinshipTitle || 'Trah Bogor'})`).join('\n');

    const footer = `\n\nTsumma ilaa jami'i ahlil qubur minal muslimina wal muslimat wal mu'minina wal mu'minat min masyaariqil ardhi ilaa maghaaribiha... Allahummaghfir lahum, warhamhum, wa 'aafihim, wa'fu 'anhum. Lahumul FAATIHAH. 🤲\n\n(Dibagikan melalui Modul LeluhurQu - Ekosistem WargaQu)`;

    return `${header}\n*JALUR TRAH AYAH (Kuningan):*\n${daftarAyah || '  -'}\n\n*JALUR TRAH IBU (Bogor):*\n${daftarIbu || '  -'}${footer}`;
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

  // Export JSON Backup
  const handleExportJSON = () => {
    const dataBackup = {
      app: 'WargaQu - LeluhurQu Heritage System',
      exportDate: new Date().toISOString(),
      familyHead: 'Hendriana (HQ-2026-001)',
      membersCount: members.length,
      members,
      posts
    };
    const jsonStr = JSON.stringify(dataBackup, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Silsilah_LeluhurQu_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('File cadangan silsilah (.json) berhasil diunduh!');
  };

  // Import JSON Backup
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.members && Array.isArray(parsed.members)) {
          setMembers(parsed.members);
          if (parsed.posts && Array.isArray(parsed.posts)) {
            setPosts(parsed.posts);
          }
          showNotification('Berhasil memulihkan data silsilah keluarga dari file cadangan!');
        } else {
          showNotification('Format file JSON tidak sesuai struktur LeluhurQu.');
        }
      } catch {
        showNotification('Gagal membaca file JSON cadangan.');
      }
    };
    reader.readAsText(file);
  };

  // Add Member with Ayah, Kakek, and Uyut Lineage Determination
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotification('Silakan isi nama anggota keluarga.');
      return;
    }

    const finalAyah = formAyahSelect === 'custom' ? formAyahCustom.trim() : formAyahSelect;
    const finalKakek = formKakekSelect === 'custom' ? formKakekCustom.trim() : formKakekSelect;
    const finalUyut = formUyutSelect === 'custom' ? formUyutCustom.trim() : formUyutSelect;

    const newEntry: FamilyMember = {
      id: 'fam_' + Date.now(),
      name: formName.trim(),
      nickname: formNickname.trim() || undefined,
      binBinti: formBinBinti.trim()
        ? (formGender === 'L' ? `bin ${formBinBinti.trim()}` : `binti ${formBinBinti.trim()}`)
        : (finalAyah ? (formGender === 'L' ? `bin ${finalAyah}` : `binti ${finalAyah}`) : undefined),
      kinshipTitle: formKinship,
      role: formRole || formKinship,
      relation: formRelation,
      trah: formTrah,
      gender: formGender,
      birthYear: formBirthYear || '2020',
      deathYear: formStatus === 'Almarhum' ? (formDeathYear || undefined) : undefined,
      status: formStatus,
      origin: formOrigin || undefined,
      notes: formNotes || undefined,
      parentName: finalAyah || undefined,
      kakekName: finalKakek || undefined,
      uyutName: finalUyut || undefined,
    };

    setMembers(prev => [...prev, newEntry]);

    // Also sync to OrbitQu tree in localStorage if available
    try {
      const savedOrbit = localStorage.getItem('wargaqu_orbitqu_tree_v4');
      if (savedOrbit) {
        const orbitData = JSON.parse(savedOrbit);
        if (orbitData && Array.isArray(orbitData.nodes)) {
          let gen = 0;
          if (formKinship.includes('Uyut')) gen = -3;
          else if (formKinship.includes('Aki') || formKinship.includes('Nini')) gen = -2;
          else if (formKinship.includes('Ayah') || formKinship.includes('Uwa') || formKinship.includes('Mang') || formKinship.includes('Bibi')) gen = -1;
          else if (formKinship.includes('Anak')) gen = 1;
          else if (formKinship.includes('Cucu')) gen = 2;

          let q: 'Q1' | 'Q2' | 'Q3' | 'Q4' = 'Q1';
          if (formTrah === 'ibu') q = 'Q2';
          else if (formTrah === 'ayah_pasangan') q = 'Q3';
          else if (formTrah === 'ibu_pasangan') q = 'Q4';

          const matchingParentNode = finalAyah ? orbitData.nodes.find((n: any) => n.name.toLowerCase().includes(finalAyah.toLowerCase())) : null;

          orbitData.nodes.push({
            id: newEntry.id,
            name: newEntry.name,
            gen,
            order: newEntry.kinshipTitle || 'Baru',
            quadrant: q,
            claimed: true,
            role: newEntry.role,
            parentId: matchingParentNode ? matchingParentNode.id : undefined
          });

          localStorage.setItem('wargaqu_orbitqu_tree_v4', JSON.stringify(orbitData));
        }
      }
    } catch (err) {
      console.warn('Orbit sync skipped:', err);
    }

    setShowAddMemberModal(false);
    // Reset form
    setFormName('');
    setFormNickname('');
    setFormBinBinti('');
    setFormNotes('');
    setFormAyahCustom('');
    setFormKakekCustom('');
    setFormUyutCustom('');
    showNotification(`Alhamdulillah, ${newEntry.name} berhasil ditambahkan dan garis orbit dirapikan!`);
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

  // Filtered members for Tree View
  const displayedMembers = members.filter(m => {
    if (treeFilter === 'all') return true;
    if (treeFilter === 'inti') return m.trah === 'inti';
    if (treeFilter === 'ayah') return m.trah === 'ayah';
    if (treeFilter === 'ibu') return m.trah === 'ibu';
    return true;
  });

  return (
    <div className={`w-full h-full ${activeTab === 'orbitqu' ? 'bg-[#0b0f19]' : 'bg-[#f0fdf4]'} font-sans antialiased flex flex-col relative select-none overflow-hidden text-slate-800`}>
      {activeTab === 'orbitqu' ? (
        <div className="flex-1 w-full h-full relative overflow-hidden pb-14">
          <OrbitQuView
            onBackToLeluhurQu={() => setActiveTab('silsilah')}
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
      ) : (
        <>
          {/* TOP HEADER BAR (WARGAQU EMERALD SIGNATURE PALETTE) */}
          <header className="bg-gradient-to-r from-[#047857] via-[#059669] to-[#047857] text-white px-4 py-3.5 flex justify-between items-center shadow-md z-30 shrink-0">
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
          <button
            onClick={() => setActiveTab('orbitqu')}
            className="bg-emerald-950/40 hover:bg-emerald-950/60 active:scale-95 text-[#5eead4] border border-emerald-400/50 text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-xs"
            title="Buka Mode Orbit Silsilah Tata Surya"
          >
            <Compass className="w-3.5 h-3.5 text-[#5eead4]" />
            <span>OrbitQu</span>
          </button>
          <button
            onClick={() => setShowScanKKModal(true)}
            className="bg-emerald-950/40 hover:bg-emerald-950/60 active:scale-95 text-white border border-emerald-400/50 text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-xs"
            title="Scan Kartu Keluarga (Privacy-First)"
          >
            <Camera className="w-3.5 h-3.5 text-[#5eead4]" />
            <span className="text-white">Scan KK</span>
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
            <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-emerald-100 space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <GitFork className="w-4 h-4 text-emerald-700 rotate-180" />
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                    Pohon Silsilah Keluarga
                  </h3>
                </div>

                {/* Zoom & Action Controls */}
                <div className="flex items-center space-x-1 bg-emerald-50 p-1 rounded-xl border border-emerald-200">
                  <button
                    onClick={() => setTreeZoom(z => Math.max(0.7, z - 0.1))}
                    className="p-1 text-emerald-800 hover:bg-emerald-200 rounded transition"
                    title="Perkecil Tampilan"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[10px] font-bold text-emerald-800 px-1 font-mono">
                    {Math.round(treeZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setTreeZoom(z => Math.min(1.4, z + 0.1))}
                    className="p-1 text-emerald-800 hover:bg-emerald-200 rounded transition"
                    title="Perbesar Tampilan"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setTreeZoom(1)}
                    className="p-1 text-emerald-800 hover:bg-emerald-200 rounded transition"
                    title="Reset Ukuran"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Trah Filter Pill Buttons */}
              <div className="grid grid-cols-4 gap-1.5 bg-[#f0fdf4] p-1 rounded-xl border border-emerald-100 text-[10px]">
                <button
                  onClick={() => setTreeFilter('all')}
                  className={`py-1.5 rounded-lg font-bold transition ${treeFilter === 'all' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-800'}`}
                >
                  Semua ({members.length})
                </button>
                <button
                  onClick={() => setTreeFilter('inti')}
                  className={`py-1.5 rounded-lg font-bold transition ${treeFilter === 'inti' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-800'}`}
                >
                  Inti
                </button>
                <button
                  onClick={() => setTreeFilter('ayah')}
                  className={`py-1.5 rounded-lg font-bold transition ${treeFilter === 'ayah' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-800'}`}
                >
                  Trah Ayah
                </button>
                <button
                  onClick={() => setTreeFilter('ibu')}
                  className={`py-1.5 rounded-lg font-bold transition ${treeFilter === 'ibu' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-emerald-800'}`}
                >
                  Trah Ibu
                </button>
              </div>

              {/* VISUAL TREE CANVAS CONTAINER (RESPONSIVE & SCROLLABLE) */}
              <div
                style={{ transform: `scale(${treeZoom})`, transformOrigin: 'top left' }}
                className="transition-transform duration-150 space-y-3 overflow-x-auto p-1"
              >
                {/* 1. Generasi Buyut / Moyang */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-900 border-b border-emerald-100 pb-1">
                    <span className="uppercase tracking-wider">Generasi Buyut / Moyang (Uyut)</span>
                    <span className="text-slate-400 font-normal">Gelar Kekerabatan: Uyut</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {displayedMembers.filter(m => m.relation === 'buyut').map(m => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMember(m)}
                        className="bg-amber-50/70 hover:bg-amber-100/70 border border-amber-200 rounded-xl p-2.5 cursor-pointer transition shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold text-amber-800 bg-amber-200/70 px-1.5 py-0.2 rounded">
                            {m.kinshipTitle || 'Uyut'}
                          </span>
                          <span className="text-[9px] text-slate-500 font-mono">
                            {getYearRangeDisplay(m)}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">{m.name}</h4>
                        <p className="text-[10px] text-slate-600">{m.binBinti} • {m.origin}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Generasi Kakek & Nenek (Aki & Nini) Termasuk Dukungan Multi-Pasangan */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-900 border-b border-emerald-100 pb-1">
                    <span className="uppercase tracking-wider">Generasi Kakek &amp; Nenek (Aki &amp; Nini)</span>
                    <span className="text-emerald-700 font-normal">Mendukung Multi-Pasangan</span>
                  </div>

                  {displayedMembers.filter(m => m.relation === 'kakek' || m.relation === 'nenek').map(m => (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMember(m)}
                      className="bg-white hover:bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 cursor-pointer transition shadow-2xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs ${m.gender === 'L' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                            {m.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                              <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                                {m.kinshipTitle}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              {m.binBinti} • {getYearRangeDisplay(m)} • {m.origin}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${m.status === 'Almarhum' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-100 text-emerald-800'}`}>
                          {m.status}
                        </span>
                      </div>

                      {/* Tampilan Khusus Multi-Pasangan (Poligami / Multi-Istri/Suami) */}
                      {m.spouses && m.spouses.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-dashed border-emerald-100 space-y-1.5">
                          <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">
                            Pasangan &amp; Cabang Keturunan ({m.spouses.length} Jalur Pasangan):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {m.spouses.map(sp => (
                              <div
                                key={sp.id}
                                className="bg-[#f0fdf4] border border-emerald-200/70 p-2 rounded-lg text-[10px] space-y-0.5"
                              >
                                <div className="flex justify-between items-center">
                                  <span className="font-bold text-emerald-950">{sp.name}</span>
                                  <span className="text-[9px] text-slate-500">
                                    {sp.status === 'Almarhum' ? `${sp.birthYear || '?'} - ${sp.deathYear || 'Wafat'}` : `Lahir ${sp.birthYear}`}
                                  </span>
                                </div>
                                <p className="text-[9px] text-emerald-700 font-medium">{sp.marriageNote}</p>
                                <p className="text-[9px] text-slate-500">
                                  Anak dari jalur ini: {sp.childrenIds.length} orang terdaftar
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 3. Generasi Orang Tua & Paman/Bibi (Uwa, Mang, Bibi) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-900 border-b border-emerald-100 pb-1">
                    <span className="uppercase tracking-wider">Generasi Orang Tua, Uwa, Mang &amp; Bibi</span>
                    <span className="text-slate-400 font-normal">Keluarga Inti &amp; Saudara</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {displayedMembers.filter(m => m.relation === 'ayah' || m.relation === 'ibu' || m.relation === 'paman_bibi').map(m => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMember(m)}
                        className="bg-white hover:bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5 cursor-pointer transition shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${m.gender === 'L' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}`}>
                            {m.kinshipTitle || m.role}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">
                            {getYearRangeDisplay(m)}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">{m.name}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{m.binBinti} • {m.origin}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. Generasi Anak & Cucu */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-900 border-b border-emerald-100 pb-1">
                    <span className="uppercase tracking-wider">Generasi Anak &amp; Cucu (Penerus Nasab)</span>
                    <span className="text-emerald-700 font-normal">Cikal, Penengah &amp; Bungsu</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {displayedMembers.filter(m => m.relation === 'anak' || m.relation === 'cucu').map(m => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedMember(m)}
                        className="bg-white hover:bg-emerald-50/50 border border-emerald-100 rounded-xl p-2.5 cursor-pointer transition shadow-2xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                            {m.kinshipTitle || 'Anak'}
                          </span>
                          <span className="text-[9px] font-mono text-slate-500">
                            Th. {m.birthYear}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">{m.name}</h4>
                        <p className="text-[10px] text-slate-500">{m.binBinti}</p>
                      </div>
                    ))}
                  </div>
                </div>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-emerald-100/70 p-1.5 rounded-2xl border border-emerald-200">
              <button
                onClick={() => setActiveMedsosTrah('ayah')}
                className={`py-2 px-2 text-[11px] font-bold rounded-xl transition flex flex-col items-center justify-center text-center gap-0.5 ${
                  activeMedsosTrah === 'ayah'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-emerald-900 hover:bg-emerald-200/50'
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
                    : 'text-emerald-900 hover:bg-emerald-200/50'
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
                    : 'text-emerald-900 hover:bg-emerald-200/50'
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
                    : 'text-emerald-900 hover:bg-emerald-200/50'
                }`}
              >
                <span>Trah Ibu Pasangan</span>
                <span className="text-[9px] opacity-80">(Kanan-Bawah)</span>
              </button>
            </div>

            {/* Input Form Berbagi Cerita / Sejarah / Foto Jadul */}
            <form onSubmit={handleCreatePost} className="bg-white border border-emerald-100 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-700 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs">
                    HU
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
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
                  className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold rounded-lg px-2 py-1 focus:outline-none"
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
                className="w-full bg-[#f0fdf4] border border-emerald-200/80 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 resize-none"
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
                  className="bg-white border border-emerald-100 rounded-2xl p-4 space-y-2.5 shadow-sm"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className={`w-8 h-8 ${post.avatarColor} rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs`}>
                        {post.initials}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">
                          {post.authorName}{' '}
                          <span className="text-[10px] text-slate-500 font-normal">
                            ({post.authorRole})
                          </span>
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {post.timeAgo} • {post.trahName}
                        </span>
                      </div>
                    </div>
                    <span className="text-[9px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                      {post.category}
                    </span>
                  </div>

                  {/* Content */}
                  <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-emerald-50 text-xs text-slate-500">
                    <button
                      onClick={() => handleToggleLike(post.id)}
                      className={`flex items-center space-x-1.5 transition active:scale-95 ${
                        post.isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600 text-rose-600' : ''}`} />
                      <span>{post.likes} Suka</span>
                    </button>

                    <button
                      onClick={() => setOpenCommentBox(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                      className="hover:text-emerald-700 flex items-center space-x-1.5 transition active:scale-95"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>{post.comments.length} Komentar</span>
                    </button>
                  </div>

                  {/* Comment Section */}
                  {openCommentBox[post.id] && (
                    <div className="pt-2 border-t border-emerald-50 space-y-2 animate-in fade-in duration-150">
                      {post.comments.length > 0 && (
                        <div className="space-y-1.5 bg-[#f0fdf4] p-2.5 rounded-xl border border-emerald-100">
                          {post.comments.map(c => (
                            <div key={c.id} className="text-[11px] leading-tight">
                              <span className="font-bold text-emerald-800 mr-1.5">{c.author}:</span>
                              <span className="text-slate-700">{c.text}</span>
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
                          className="flex-1 bg-[#f0fdf4] border border-emerald-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
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
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 space-y-3">
              <div className="flex justify-between items-center border-b border-emerald-50 pb-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-emerald-700" />
                  <span>Draf Teks Hadhoroh Siap Salin</span>
                </h4>
                <span className="text-[10px] text-emerald-700 font-bold font-mono">Lengkap Bin / Binti</span>
              </div>

              {/* Teks Box Preformatted */}
              <div className="bg-[#f0fdf4] border border-emerald-200/80 rounded-xl p-3 text-xs text-slate-800 font-mono leading-relaxed max-h-60 overflow-y-auto whitespace-pre-wrap">
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
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Daftar Leluhur Almarhum &amp; Almarhumah
              </h4>
              <div className="space-y-2">
                {deceasedMembers.map((m, idx) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="text-xs font-bold text-slate-900">
                          {m.name} <span className="font-normal text-slate-500 font-mono">{m.binBinti}</span>
                        </h5>
                        <p className="text-[10px] text-slate-500">
                          {m.kinshipTitle} • {getYearRangeDisplay(m)} • {m.origin}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold">
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
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 space-y-3">
              <div className="flex items-center space-x-2 border-b border-emerald-50 pb-2">
                <Archive className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Cadangan &amp; Pemulihan Data (Offline-First)
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
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

                <label className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs transition active:scale-98 text-center">
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
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 space-y-2.5">
              <div className="flex items-center space-x-2">
                <Share2 className="w-4 h-4 text-emerald-700" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Undang Kerabat Keluarga Besar
                </h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ajak paman, bibi, sepupu, dan kerabat trah Kuningan &amp; Bogor untuk bersama-sama melengkapi pohon silsilah keluarga kita.
              </p>
              <button
                onClick={() => setShowShareModal(true)}
                className="w-full bg-[#f0fdf4] hover:bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 transition active:scale-98"
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

      {/* BOTTOM NAVIGATION BAR KHUSUS LELUHURQU (WARGAQU EMERALD & ORBITQU DARK PALETTE) */}
      <nav className={`absolute bottom-0 left-0 right-0 ${
        activeTab === 'orbitqu'
          ? 'bg-slate-900/95 border-slate-800 text-slate-300'
          : 'bg-white/95 border-emerald-100 text-slate-800'
      } backdrop-blur-md border-t px-2 py-2 flex justify-around items-center z-40 shadow-lg`}>
        {/* Tab 1: Silsilah */}
        <button
          onClick={() => setActiveTab('silsilah')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 ${
            activeTab === 'silsilah'
              ? 'text-emerald-700 font-bold'
              : activeTab === 'orbitqu'
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-400 hover:text-emerald-700 font-medium'
          }`}
        >
          <GitFork className={`w-5 h-5 rotate-180 ${activeTab === 'silsilah' ? 'text-emerald-700' : 'text-slate-400'}`} />
          <span className="text-[10px]">Silsilah</span>
        </button>

        {/* Tab 2: OrbitQu (Core Ancestor Solar Orbit & Poros Saudara) */}
        <button
          onClick={() => setActiveTab('orbitqu')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 relative ${
            activeTab === 'orbitqu'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-emerald-700 font-medium'
          }`}
        >
          <div className="relative">
            <Compass className={`w-5 h-5 ${activeTab === 'orbitqu' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
          </div>
          <span className="text-[10px]">OrbitQu</span>
        </button>

        {/* Tab 3: Medsos Trah */}
        <button
          onClick={() => setActiveTab('medsos')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 ${
            activeTab === 'medsos'
              ? 'text-emerald-700 font-bold'
              : activeTab === 'orbitqu'
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-400 hover:text-emerald-700 font-medium'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'medsos' ? 'text-emerald-700' : 'text-slate-400'}`} />
          <span className="text-[10px]">Medsos Trah</span>
        </button>

        {/* Tab 4: Doa Leluhur (Malam Jumat) */}
        <button
          onClick={() => setActiveTab('doa')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 relative ${
            activeTab === 'doa'
              ? 'text-emerald-700 font-bold'
              : activeTab === 'orbitqu'
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-400 hover:text-emerald-700 font-medium'
          }`}
        >
          <div className="relative">
            <Moon className={`w-5 h-5 ${activeTab === 'doa' ? 'text-emerald-700' : 'text-slate-400'}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
          </div>
          <span className="text-[10px]">Doa Leluhur</span>
        </button>

        {/* Tab 5: Arsip & Buku */}
        <button
          onClick={() => setActiveTab('arsip')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 ${
            activeTab === 'arsip'
              ? 'text-emerald-700 font-bold'
              : activeTab === 'orbitqu'
              ? 'text-slate-400 hover:text-slate-200'
              : 'text-slate-400 hover:text-emerald-700 font-medium'
          }`}
        >
          <Archive className={`w-5 h-5 ${activeTab === 'arsip' ? 'text-emerald-700' : 'text-slate-400'}`} />
          <span className="text-[10px]">Arsip &amp; Buku</span>
        </button>
      </nav>

      {/* MODAL: DETAIL ANGGOTA KELUARGA (INSPECTOR) */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl relative border border-emerald-100">
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shadow-xs shrink-0 ${selectedMember.gender === 'L' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                {selectedMember.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 leading-tight">
                  {selectedMember.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {selectedMember.binBinti || '-'}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.2 rounded-full">
                    {selectedMember.kinshipTitle || selectedMember.role}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${selectedMember.status === 'Almarhum' ? 'bg-slate-200 text-slate-700' : 'bg-emerald-50 text-emerald-700'}`}>
                    {selectedMember.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Grid (Privacy First, No NIK) */}
            <div className="bg-[#f0fdf4] border border-emerald-100 rounded-xl p-3 space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-emerald-100/70 pb-1.5">
                <span className="text-slate-500">Rentang Tahun:</span>
                <span className="font-bold font-mono text-slate-800">{getYearRangeDisplay(selectedMember)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-100/70 pb-1.5">
                <span className="text-slate-500">Asal Daerah:</span>
                <span className="font-bold text-slate-800">{selectedMember.origin || '-'}</span>
              </div>
              <div className="flex justify-between items-center border-b border-emerald-100/70 pb-1.5">
                <span className="text-slate-500">Jalur Nasab:</span>
                <span className="font-bold text-emerald-800">
                  {selectedMember.trah === 'ayah' ? 'Trah Ayah User' :
                   selectedMember.trah === 'ibu' ? 'Trah Ibu User' :
                   selectedMember.trah === 'ayah_pasangan' ? 'Trah Ayah Pasangan' :
                   selectedMember.trah === 'ibu_pasangan' ? 'Trah Ibu Pasangan' : 'Keluarga Inti'}
                </span>
              </div>
              {selectedMember.parentName && (
                <div className="flex justify-between items-center border-b border-emerald-100/70 pb-1.5">
                  <span className="text-slate-500">Ayah / Induk Orbit 2:</span>
                  <span className="font-bold text-slate-800">{selectedMember.parentName}</span>
                </div>
              )}
              {selectedMember.kakekName && (
                <div className="flex justify-between items-center border-b border-emerald-100/70 pb-1.5">
                  <span className="text-slate-500">Kakek / Induk Orbit 1:</span>
                  <span className="font-bold text-slate-800">{selectedMember.kakekName}</span>
                </div>
              )}
              {selectedMember.uyutName && (
                <div className="flex justify-between items-center border-b border-emerald-100/70 pb-1.5">
                  <span className="text-slate-500">Uyut / Pusat Kuadran:</span>
                  <span className="font-bold text-slate-800">{selectedMember.uyutName}</span>
                </div>
              )}
              {selectedMember.notes && (
                <div className="pt-1">
                  <span className="text-[10px] text-slate-500 block">Catatan Silsilah:</span>
                  <p className="text-[11px] text-slate-700 italic mt-0.5">{selectedMember.notes}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  setSelectedMember(null);
                  setActiveTab('orbitqu');
                  showNotification(`Membuka visualisasi orbit untuk ${selectedMember.name}`);
                }}
                className="w-full bg-slate-900 hover:bg-slate-800 text-emerald-400 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 border border-emerald-500/40 shadow-xs transition"
              >
                <span>🪐 Buka di OrbitQu (Tata Surya)</span>
              </button>

              <div className="flex gap-2">
                {selectedMember.status === 'Almarhum' && (
                  <button
                    onClick={() => {
                      showNotification(`Doa Al-Fatihah dikirimkan untuk ${selectedMember.name} 🤲`);
                      setSelectedMember(null);
                    }}
                    className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs"
                  >
                    Kirim Doa Al-Fatihah 🤲
                  </button>
                )}
                <button
                  onClick={() => setSelectedMember(null)}
                  className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
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
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-4 shadow-2xl relative border border-emerald-100 text-slate-800">
            <button
              onClick={() => setShowScanKKModal(false)}
              className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-700 text-white rounded-xl flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Scan Kartu Keluarga</h3>
                <p className="text-[10px] text-emerald-700 font-bold">Privacy-First • NIK Tidak Disimpan</p>
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
            className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3 shadow-2xl relative border border-emerald-100 text-slate-800 max-h-[92vh] overflow-y-auto no-scrollbar"
          >
            <button
              type="button"
              onClick={() => setShowAddMemberModal(false)}
              className="absolute top-3.5 right-3.5 p-1 text-slate-400 hover:text-slate-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-700 text-white rounded-xl flex items-center justify-center">
                <Plus className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Tambah Anggota Silsilah</h3>
                <p className="text-[10px] text-emerald-700 font-bold">Privacy-First (Tanpa NIK)</p>
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
