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
  ArrowUpDown,
  MoveLeft,
  MoveRight,
  Edit2,
  Trash2,
  Check,
  ImageIcon,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface LeluhurQuViewProps {
  onBackToWarga: () => void;
  showNotification: (msg: string) => void;
}

export interface FamilySpouse {
  id: string;
  name: string;
  nickname?: string;
  binBinti?: string;
  photo?: string;
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
  nik?: string; // Privacy-first 16-digit NIK (disembunyikan di publik)
  photo?: string; // Auto-compressed Base64 photo
  kinshipTitle?: string; // Aki, Nini, Uyut, Uwa, Mang, Bibi, dll.
  role: string;
  relation: 'ayah' | 'ibu' | 'anak' | 'kakek' | 'nenek' | 'buyut' | 'paman_bibi' | 'cucu';
  trah: 'ayah' | 'ibu' | 'inti';
  gender: 'L' | 'P';
  birthYear: string;
  birthDate?: string;
  birthPlace?: string;
  deathYear?: string;
  status: 'Hidup' | 'Almarhum';
  origin?: string;
  phone?: string;
  notes?: string;
  address?: string;
  spouses?: FamilySpouse[];
}

export interface KartuKeluarga {
  noKk: string;
  kepalaKeluarga: string;
  alamat: string;
  rtRw: string;
  desaKelurahan: string;
  kecamatan: string;
  kabupatenKota: string;
  kodePos: string;
  fotoKeluarga?: string; // Selfie / Foto bersama keluarga (Family portrait)
  updatedAt?: string;
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
  trah: 'ayah' | 'ibu';
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

export interface ScannedKKCard {
  id: string;
  name: string;
  nickname: string;
  binBinti: string;
  nik?: string;
  role: string;
  gender: 'L' | 'P';
  birthDate: string;
  birthYear: string;
  birthPlace?: string;
  status?: 'Hidup' | 'Almarhum';
  address: string;
  photo?: string; // Selfie / Pas foto wajah
}

// Client-side HTML5 Canvas Auto-compression utility
const compressImage = (file: File, maxWidth = 400, quality = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = event => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = Math.min(maxWidth / img.width, maxWidth / img.height, 1);
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = err => reject(err);
  });
};

const DEMO_MEMBERS: FamilyMember[] = [
  // Generasi 0: Diri Sendiri (Ego) & Istri
  {
    id: '1',
    name: 'Hendriana',
    nickname: 'Bageur',
    binBinti: 'bin Karta',
    kinshipTitle: 'Kepala Keluarga',
    role: 'Ayah / Kepala Keluarga',
    relation: 'ayah',
    trah: 'inti',
    gender: 'L',
    birthYear: '1985',
    birthDate: '15/06/1985',
    status: 'Hidup',
    origin: 'Kuningan / Bogor',
    address: 'Nanggerang Indah Residence Blok A No. 12',
    notes: 'Pemilik silsilah utama, tinggal di Nanggerang Indah Residence',
    spouses: [
      {
        id: 'sp_1',
        name: 'Siti Nurhaliza',
        nickname: 'Neng Siti',
        binBinti: 'binti Suryana',
        gender: 'P',
        origin: 'Bogor',
        birthYear: '1988',
        status: 'Hidup',
        marriageNote: 'Istri Pertama (Pernikahan 2011)',
        childrenIds: ['3', '4']
      }
    ]
  },
  {
    id: '2',
    name: 'Siti Nurhaliza',
    nickname: 'Neng Siti',
    binBinti: 'binti Suryana',
    kinshipTitle: 'Ibu (Istri)',
    role: 'Ibu Rumah Tangga',
    relation: 'ibu',
    trah: 'inti',
    gender: 'P',
    birthYear: '1988',
    birthDate: '22/09/1988',
    status: 'Hidup',
    origin: 'Dramaga, Bogor',
    address: 'Nanggerang Indah Residence Blok A No. 12'
  },
  // Generasi -1: Anak-anak
  {
    id: '3',
    name: 'Rizky Al-Fathir',
    nickname: 'Iki',
    binBinti: 'bin Hendriana',
    kinshipTitle: 'Anak Pertama (Cikal)',
    role: 'Putra Sulung',
    relation: 'anak',
    trah: 'inti',
    gender: 'L',
    birthYear: '2012',
    birthDate: '10/03/2012',
    status: 'Hidup',
    origin: 'Bogor',
    address: 'Nanggerang Indah Residence Blok A No. 12'
  },
  {
    id: '4',
    name: 'Nabila Zahra',
    nickname: 'Bila',
    binBinti: 'binti Hendriana',
    kinshipTitle: 'Anak Kedua (Bungsu)',
    role: 'Putri Bungsu',
    relation: 'anak',
    trah: 'inti',
    gender: 'P',
    birthYear: '2016',
    birthDate: '18/07/2016',
    status: 'Hidup',
    origin: 'Bogor',
    address: 'Nanggerang Indah Residence Blok A No. 12'
  },
  // Generasi +1: Ayah Hendriana & Trah Kuningan
  {
    id: '5',
    name: 'Abah Karta',
    nickname: 'Aki Karta',
    binBinti: 'bin Abdul Ghani',
    kinshipTitle: 'Aki (Kakek Paternal)',
    role: 'Sesepuh Trah Kuningan',
    relation: 'kakek',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1948',
    birthDate: '01/01/1948',
    status: 'Hidup',
    origin: 'Cilimus, Kuningan',
    address: 'Jl. Pasarean No. 4, Cilimus, Kuningan',
    notes: 'Pernah memiliki 2 jalur keluarga besar di Kuningan & Cirebon',
    spouses: [
      {
        id: 'sp_karta_1',
        name: 'Emak Rohanah',
        nickname: 'Nini Rohanah',
        binBinti: 'binti Mansur',
        gender: 'P',
        origin: 'Cilimus, Kuningan',
        birthYear: '1952',
        deathYear: '2019',
        status: 'Almarhum',
        marriageNote: 'Istri Pertama (Ibu Kandung Hendriana)',
        childrenIds: ['1', '7']
      },
      {
        id: 'sp_karta_2',
        name: 'Mak Eni',
        nickname: 'Nini Eni',
        binBinti: 'binti Sanusi',
        gender: 'P',
        origin: 'Cirebon',
        birthYear: '1958',
        status: 'Hidup',
        marriageNote: 'Istri Kedua (Jalur Saudara Tiri)',
        childrenIds: ['11']
      }
    ]
  },
  {
    id: '6',
    name: 'Emak Rohanah',
    nickname: 'Nini Rohanah',
    binBinti: 'binti Mansur',
    kinshipTitle: 'Nini (Nenek Paternal)',
    role: 'Ibu dari Hendriana',
    relation: 'nenek',
    trah: 'ayah',
    gender: 'P',
    birthYear: '1952',
    deathYear: '2019',
    status: 'Almarhum',
    origin: 'Cilimus, Kuningan',
    notes: 'Almarhumah wafat di Kuningan. Al-Fatihah.'
  },
  {
    id: '7',
    name: 'Mang Dede Supriatna',
    nickname: 'Mang Dede',
    binBinti: 'bin Karta',
    kinshipTitle: 'Mang (Paman / Adik Ayah)',
    role: 'Paman',
    relation: 'paman_bibi',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1990',
    birthDate: '12/11/1990',
    status: 'Hidup',
    origin: 'Kuningan'
  },
  {
    id: '11',
    name: 'Asep Saepulloh',
    nickname: 'Kang Asep',
    binBinti: 'bin Karta',
    kinshipTitle: 'Uwa / Saudara Seayah (Jalur Mak Eni)',
    role: 'Kakak Tiri Seayah',
    relation: 'paman_bibi',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1982',
    birthDate: '04/05/1982',
    status: 'Hidup',
    origin: 'Cirebon'
  },
  // Generasi +2: Buyut Trah Ayah (Leluhur Tertinggi)
  {
    id: '12',
    name: 'Kyai Abdul Ghani',
    nickname: 'Uyut Ghani',
    binBinti: 'bin Hasanudin',
    kinshipTitle: 'Uyut (Buyut Paternal)',
    role: 'Tokoh Pendiri Pesantren Lembur',
    relation: 'buyut',
    trah: 'ayah',
    gender: 'L',
    birthYear: '1918',
    deathYear: '1994',
    status: 'Almarhum',
    origin: 'Kuningan',
    notes: 'Makam di Kompleks Pasarean Cilimus'
  },
  // Generasi +1: Keluarga Ibu (Trah Bogor)
  {
    id: '8',
    name: 'Abah Suryana',
    nickname: 'Aki Surya',
    binBinti: 'bin Hasan',
    kinshipTitle: 'Aki (Kakek Maternal)',
    role: 'Ayah dari Siti Nurhaliza',
    relation: 'kakek',
    trah: 'ibu',
    gender: 'L',
    birthYear: '1945',
    deathYear: '2016',
    status: 'Almarhum',
    origin: 'Dramaga, Bogor',
    notes: 'Mantan perangkat desa Dramaga. Al-Fatihah.'
  },
  {
    id: '9',
    name: 'Emak Siti Maryam',
    nickname: 'Nini Siti',
    binBinti: 'binti Syamsuddin',
    kinshipTitle: 'Nini (Nenek Maternal)',
    role: 'Ibu dari Siti Nurhaliza',
    relation: 'nenek',
    trah: 'ibu',
    gender: 'P',
    birthYear: '1950',
    birthDate: '14/02/1950',
    status: 'Hidup',
    origin: 'Dramaga, Bogor',
    notes: 'Koordinator Arisan Trah Bogor'
  },
  {
    id: '10',
    name: 'Bibi Lilis Suryani',
    nickname: 'Bibi Lilis',
    binBinti: 'binti Suryana',
    kinshipTitle: 'Bibi (Adik Ibu)',
    role: 'Bibi',
    relation: 'paman_bibi',
    trah: 'ibu',
    gender: 'P',
    birthYear: '1986',
    birthDate: '08/08/1986',
    status: 'Hidup',
    origin: 'Bogor'
  },
  {
    id: '13',
    name: 'H. Hasan Sulaeman',
    nickname: 'Uyut Hasan',
    binBinti: 'bin Asyikin',
    kinshipTitle: 'Uyut (Buyut Maternal)',
    role: 'Leluhur Trah Dramaga',
    relation: 'buyut',
    trah: 'ibu',
    gender: 'L',
    birthYear: '1912',
    deathYear: '1988',
    status: 'Almarhum',
    origin: 'Dramaga, Bogor'
  }
];

const DEMO_POSTS: PostItem[] = [
  {
    id: 'post-1',
    authorName: 'Abah Karta',
    authorRole: 'Aki (Kakek)',
    trah: 'ayah',
    trahName: 'Trah Kuningan',
    category: 'Kisah Sejarah',
    timeAgo: '2 jam yang lalu',
    content: 'Alhamdulillah kumpul keluarga besar di lembur Cilimus berjalan lancar. Mengingatkan anak cucu, nasab kita dari Buyut Abdul Ghani selalu menjaga kerukunan dan silaturahmi. Sehat-sehat ya kabeh! 🙏',
    avatarColor: 'bg-emerald-700',
    initials: 'AK',
    likes: 18,
    isLiked: false,
    comments: [
      { id: 'c1', author: 'Hendriana (Bageur)', text: 'Aamiin Abah, baktos ti rombongan Bogor siap sowan.', time: '1 jam lalu' },
      { id: 'c2', author: 'Mang Dede', text: 'Siap Abah, buku silsilah tos dicitak rapi.', time: '40 mnt lalu' }
    ]
  },
  {
    id: 'post-2',
    authorName: 'Mang Dede',
    authorRole: 'Mang (Paman)',
    trah: 'ayah',
    trahName: 'Trah Kuningan',
    category: 'Foto Jadul',
    timeAgo: 'Kemarin',
    content: 'Ditemukan arsip foto hitam putih tahun 1978 saat syukuran rumah panggung peninggalan Uyut Abdul Ghani. Yang mengenali orang-orang di baris belakang tolong bantu tag namanya ya.',
    avatarColor: 'bg-teal-700',
    initials: 'MD',
    likes: 24,
    isLiked: true,
    comments: []
  },
  {
    id: 'post-3',
    authorName: 'Emak Siti Maryam',
    authorRole: 'Nini (Nenek)',
    trah: 'ibu',
    trahName: 'Trah Bogor',
    category: 'Agenda Arisan',
    timeAgo: '3 jam yang lalu',
    content: 'Pemberitahuan Arisan Trah Bogor bulan depan bertempat di saung Dramaga. Sekalian kirim doa haul ke-10 Almarhum Abah Suryana. Ditunggu kehadirannya anak cucu sekalian.',
    avatarColor: 'bg-rose-700',
    initials: 'EM',
    likes: 31,
    isLiked: false,
    comments: [
      { id: 'c3', author: 'Bibi Lilis', text: 'InsyaAllah konsumsi & tumpeng disiapkan Mak.', time: '2 jam lalu' },
      { id: 'c4', author: 'Siti Nurhaliza', text: 'Aamiin Mak, insyaAllah rombongan kami hadir lengkap.', time: '1 jam lalu' }
    ]
  }
];

// DATA AWAL BERSIH (MOCK DATA DIHAPUS)
const DEFAULT_MEMBERS: FamilyMember[] = [];
const DEFAULT_POSTS: PostItem[] = [];

export const LeluhurQuView: React.FC<LeluhurQuViewProps> = ({
  onBackToWarga,
  showNotification
}) => {
  // Navigation Tabs: Silsilah | Medsos | Doa Malam Jumat | Arsip & Ekspor
  const [activeTab, setActiveTab] = useState<'silsilah' | 'medsos' | 'doa' | 'arsip'>('silsilah');
  const [activeMedsosTrah, setActiveMedsosTrah] = useState<'ayah' | 'ibu'>('ayah');

  // Silsilah Data (Offline-first LocalStorage - BERSIH DARI MOCK DATA)
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      const isCleared = localStorage.getItem('wargaqu_leluhur_cleared_mock_v4');
      if (isCleared === 'true') {
        const saved = localStorage.getItem('wargaqu_leluhur_members_v4');
        return saved ? JSON.parse(saved) : [];
      }
      const savedV4 = localStorage.getItem('wargaqu_leluhur_members_v4');
      if (savedV4) {
        return JSON.parse(savedV4);
      }
      // Bersihkan data mock lama
      localStorage.removeItem('wargaqu_leluhur_members_v3');
      localStorage.removeItem('wargaqu_leluhur_posts_v3');
      localStorage.setItem('wargaqu_leluhur_cleared_mock_v4', 'true');
      return [];
    } catch {
      return [];
    }
  });

  // Medsos Posts Data (Clean Initial State)
  const [posts, setPosts] = useState<PostItem[]>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_leluhur_posts_v4');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Data Struktur Kartu Keluarga (KK)
  const [kkData, setKkData] = useState<KartuKeluarga>(() => {
    try {
      const savedKk = localStorage.getItem('wargaqu_leluhur_kk_v4');
      return savedKk ? JSON.parse(savedKk) : {
        noKk: '',
        kepalaKeluarga: '',
        alamat: '',
        rtRw: '',
        desaKelurahan: '',
        kecamatan: '',
        kabupatenKota: '',
        kodePos: '',
        fotoKeluarga: undefined
      };
    } catch {
      return {
        noKk: '',
        kepalaKeluarga: '',
        alamat: '',
        rtRw: '',
        desaKelurahan: '',
        kecamatan: '',
        kabupatenKota: '',
        kodePos: ''
      };
    }
  });

  // Tree View Filter & Interactive Controls
  const [treeFilter, setTreeFilter] = useState<'all' | 'inti' | 'ayah' | 'ibu'>('all');
  const [treeZoom, setTreeZoom] = useState<number>(1);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // Modals
  const [showScanKKModal, setShowScanKKModal] = useState(false);
  const [kkModalTab, setKkModalTab] = useState<'manual' | 'scan'>('manual');
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showNikMap, setShowNikMap] = useState<{ [cardId: string]: boolean }>({});
  const [showResetConfirmModal, setShowResetConfirmModal] = useState(false);

  // Form KK Header state
  const [formNoKk, setFormNoKk] = useState('');
  const [formAlamatKk, setFormAlamatKk] = useState('');
  const [formRtRw, setFormRtRw] = useState('');
  const [formKota, setFormKota] = useState('');
  const [formFotoKeluarga, setFormFotoKeluarga] = useState<string | null>(null);

  // ==================== FITUR 1: FOTO & SCAN KK AUTO-TEXT + AUTO-KOMPRES + MINI STRUKTUR ====================
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<boolean>(false);
  const [kkRawPhoto, setKkRawPhoto] = useState<string | null>(null);
  const [autoReplaceExisting, setAutoReplaceExisting] = useState<boolean>(true);
  const [activeKkPreset, setActiveKkPreset] = useState<'hendriana' | 'ahmad_fauzi' | 'bambang_sutrisno'>('hendriana');

  // Kartu Anggota Terdeteksi dari KK yang dapat diedit / digeser / ditukar / ditambah / dihapus
  const [scannedCards, setScannedCards] = useState<ScannedKKCard[]>([]);

  // ==================== FITUR 2: BUKU SILSILAH 2 MODEL, GESER GARIS TERHUBUNG & KERTAS A4 - A0 ====================
  const [bukuTreeModel, setBukuTreeModel] = useState<'foto_sendiri' | 'keluarga_kompak'>('foto_sendiri');
  const [paperSize, setPaperSize] = useState<'A4' | 'A3' | 'A2' | 'A1' | 'A0'>('A4');
  const [bukuUpscaleScale, setBukuUpscaleScale] = useState<number>(1);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

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
  const [formTrah, setFormTrah] = useState<'inti' | 'ayah' | 'ibu'>('inti');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formBirthYear, setFormBirthYear] = useState('2020');
  const [formDeathYear, setFormDeathYear] = useState('');
  const [formStatus, setFormStatus] = useState<'Hidup' | 'Almarhum'>('Hidup');
  const [formOrigin, setFormOrigin] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formPhoto, setFormPhoto] = useState<string | undefined>(undefined);

  // Persist Data to LocalStorage (v4 Clean)
  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_leluhur_members_v4', JSON.stringify(members));
    } catch (e) {
      console.error(e);
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_leluhur_posts_v4', JSON.stringify(posts));
    } catch (e) {
      console.error(e);
    }
  }, [posts]);

  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_leluhur_kk_v4', JSON.stringify(kkData));
    } catch (e) {
      console.error(e);
    }
  }, [kkData]);

  // Format rentang tahun privacy-first (Format: 'Lahir 1985' atau '1950 - 2018')
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

  // Upload pas foto perorangan dengan auto-kompresi canvas
  const handlePhotoUploadForCard = async (cardId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showNotification('Mengompres pas foto wajah...');
      const compressed = await compressImage(file, 260, 0.82);
      setScannedCards(prev => prev.map(c => (c.id === cardId ? { ...c, photo: compressed } : c)));
      showNotification('Pas foto berhasil dikompres & dipasang!');
    } catch {
      showNotification('Gagal mengompres foto.');
    }
  };

  // Tukar / Geser Urutan Kartu KK
  const handleMoveCard = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= scannedCards.length) return;
    const updated = [...scannedCards];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setScannedCards(updated);
    showNotification(`Posisi kartu ${temp.name} berhasil ditukar! Garis struktur diperbarui.`);
  };

  // Edit Kartu KK langsung
  const handleUpdateCardField = (id: string, field: keyof ScannedKKCard, val: string) => {
    setScannedCards(prev => prev.map(c => (c.id === id ? { ...c, [field]: val } : c)));
  };

  // Geser Urutan Anggota pada Buku Silsilah (tetap terhubung garis)
  const handleShiftMemberOrder = (memberId: string, direction: 'left' | 'right') => {
    const idx = members.findIndex(m => m.id === memberId);
    if (idx === -1) return;
    const targetIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= members.length) return;
    const updated = [...members];
    const item = updated[idx];
    updated[idx] = updated[targetIdx];
    updated[targetIdx] = item;
    setMembers(updated);
    showNotification(`Posisi ${item.name} digeser! Garis konektor silsilah otomatis menyesuaikan.`);
  };

  // Tambah baris anggota baru pada kartu Scan KK
  const handleAddNewScannedCard = () => {
    const childNum = scannedCards.filter(c => c.role.toLowerCase().includes('anak')).length + 1;
    const parentName = scannedCards[0]?.name || 'Kepala Keluarga';
    const newCard: ScannedKKCard = {
      id: `kk_manual_${Date.now()}`,
      name: `Anak ke-${childNum}`,
      nickname: '',
      binBinti: `bin/binti ${parentName}`,
      role: `Anak ke-${childNum}`,
      gender: 'L',
      birthDate: '01/01/2020',
      birthYear: '2020',
      address: scannedCards[0]?.address || 'Alamat Keluarga'
    };
    setScannedCards(prev => [...prev, newCard]);
    showNotification(`Baris anggota baru (Anak ke-${childNum}) ditambahkan!`);
  };

  // Hapus baris anggota dari kartu Scan KK
  const handleDeleteScannedCard = (cardId: string) => {
    if (scannedCards.length <= 1) {
      showNotification('Minimal harus ada 1 anggota dalam KK.');
      return;
    }
    setScannedCards(prev => prev.filter(c => c.id !== cardId));
    showNotification('Baris anggota KK berhasil dihapus.');
  };

  // Muat Preset Template KK Siap Pakai
  const handleLoadPresetKK = (key: 'hendriana' | 'ahmad_fauzi' | 'bambang_sutrisno') => {
    setActiveKkPreset(key);
    if (key === 'hendriana') {
      setScannedCards([
        {
          id: 'kk_1',
          name: 'Hendriana',
          nickname: 'Bageur',
          binBinti: 'bin Karta',
          role: 'Kepala Keluarga',
          gender: 'L',
          birthDate: '15/06/1985',
          birthYear: '1985',
          address: 'Nanggerang Indah Residence Blok A No. 12'
        },
        {
          id: 'kk_2',
          name: 'Siti Nurhaliza',
          nickname: 'Neng Siti',
          binBinti: 'binti Suryana',
          role: 'Istri',
          gender: 'P',
          birthDate: '22/09/1988',
          birthYear: '1988',
          address: 'Nanggerang Indah Residence Blok A No. 12'
        },
        {
          id: 'kk_3',
          name: 'Rizky Al-Fathir',
          nickname: 'Iki',
          binBinti: 'bin Hendriana',
          role: 'Anak ke-1',
          gender: 'L',
          birthDate: '10/03/2012',
          birthYear: '2012',
          address: 'Nanggerang Indah Residence Blok A No. 12'
        },
        {
          id: 'kk_4',
          name: 'Nabila Zahra',
          nickname: 'Bila',
          binBinti: 'binti Hendriana',
          role: 'Anak ke-2',
          gender: 'P',
          birthDate: '18/07/2016',
          birthYear: '2016',
          address: 'Nanggerang Indah Residence Blok A No. 12'
        }
      ]);
      showNotification('Template KK Asli: Kel. Hendriana dimuat.');
    } else if (key === 'ahmad_fauzi') {
      setScannedCards([
        {
          id: 'kk_af_1',
          name: 'Drs. H. Ahmad Fauzi',
          nickname: 'Kang Fauzi',
          binBinti: 'bin H. Mansyur',
          role: 'Kepala Keluarga',
          gender: 'L',
          birthDate: '12/04/1982',
          birthYear: '1982',
          address: 'Jl. Melati Raya No. 18, RT 03/RW 04'
        },
        {
          id: 'kk_af_2',
          name: 'Hj. Siti Rahmah',
          nickname: 'Ummi Rahmah',
          binBinti: 'binti H. Sulaeman',
          role: 'Istri',
          gender: 'P',
          birthDate: '05/11/1985',
          birthYear: '1985',
          address: 'Jl. Melati Raya No. 18, RT 03/RW 04'
        },
        {
          id: 'kk_af_3',
          name: 'Muhammad Farhan Fauzi',
          nickname: 'Farhan',
          binBinti: 'bin Ahmad Fauzi',
          role: 'Anak ke-1',
          gender: 'L',
          birthDate: '14/01/2010',
          birthYear: '2010',
          address: 'Jl. Melati Raya No. 18, RT 03/RW 04'
        },
        {
          id: 'kk_af_4',
          name: 'Aisyah Zahra Fauzi',
          nickname: 'Zahra',
          binBinti: 'binti Ahmad Fauzi',
          role: 'Anak ke-2',
          gender: 'P',
          birthDate: '20/08/2015',
          birthYear: '2015',
          address: 'Jl. Melati Raya No. 18, RT 03/RW 04'
        }
      ]);
      showNotification('Template KK Baru: Kel. Drs. H. Ahmad Fauzi dimuat!');
    } else if (key === 'bambang_sutrisno') {
      setScannedCards([
        {
          id: 'kk_bs_1',
          name: 'Bambang Sutrisno, S.T.',
          nickname: 'Mas Bambang',
          binBinti: 'bin Sugeng',
          role: 'Kepala Keluarga',
          gender: 'L',
          birthDate: '08/03/1980',
          birthYear: '1980',
          address: 'Perum Griya Asri Blok C2 No. 05'
        },
        {
          id: 'kk_bs_2',
          name: 'Sri Wahyuni, S.Pd.',
          nickname: 'Mbak Yuni',
          binBinti: 'binti Kartoharjo',
          role: 'Istri',
          gender: 'P',
          birthDate: '19/06/1983',
          birthYear: '1983',
          address: 'Perum Griya Asri Blok C2 No. 05'
        },
        {
          id: 'kk_bs_3',
          name: 'Dimas Pratama',
          nickname: 'Dimas',
          binBinti: 'bin Bambang Sutrisno',
          role: 'Anak ke-1',
          gender: 'L',
          birthDate: '02/05/2009',
          birthYear: '2009',
          address: 'Perum Griya Asri Blok C2 No. 05'
        },
        {
          id: 'kk_bs_4',
          name: 'Putri Anggraini',
          nickname: 'Putri',
          binBinti: 'binti Bambang Sutrisno',
          role: 'Anak ke-2',
          gender: 'P',
          birthDate: '15/10/2013',
          birthYear: '2013',
          address: 'Perum Griya Asri Blok C2 No. 05'
        },
        {
          id: 'kk_bs_5',
          name: 'Bagas Ramadhan',
          nickname: 'Bagas',
          binBinti: 'bin Bambang Sutrisno',
          role: 'Anak ke-3',
          gender: 'L',
          birthDate: '27/04/2019',
          birthYear: '2019',
          address: 'Perum Griya Asri Blok C2 No. 05'
        }
      ]);
      showNotification('Template KK Baru: Kel. Bambang Sutrisno (3 Anak) dimuat!');
    }
  };

  // Buka Modal Kelola Kartu Keluarga (KK) & Anggota
  const handleOpenKkModal = (tab: 'manual' | 'scan' = 'manual') => {
    setKkModalTab(tab);
    setFormNoKk(kkData.noKk || '');
    setFormAlamatKk(kkData.alamat || (mainHead?.address || ''));
    setFormRtRw(kkData.rtRw || '');
    setFormKota(kkData.kabupatenKota || '');
    setFormFotoKeluarga(kkData.fotoKeluarga || null);

    // Populasikan kartu anggota
    if (members.length > 0) {
      const coreMembers = members.filter(m => m.trah === 'inti');
      if (coreMembers.length > 0) {
        const cards: ScannedKKCard[] = coreMembers.map(m => ({
          id: m.id,
          name: m.name,
          nickname: m.nickname || '',
          binBinti: m.binBinti || '',
          nik: m.nik || '',
          role: m.role || (m.relation === 'ayah' ? 'Kepala Keluarga' : m.relation === 'ibu' ? 'Istri' : 'Anak'),
          gender: m.gender,
          birthDate: m.birthDate || '',
          birthYear: m.birthYear || '1990',
          birthPlace: m.birthPlace || m.origin || '',
          status: m.status,
          address: m.address || kkData.alamat || '',
          photo: m.photo
        }));
        setScannedCards(cards);
      } else {
        setScannedCards([
          {
            id: 'card_head_' + Date.now(),
            name: '',
            nickname: '',
            binBinti: '',
            nik: '',
            role: 'Kepala Keluarga',
            gender: 'L',
            birthDate: '',
            birthYear: '1985',
            birthPlace: '',
            status: 'Hidup',
            address: '',
            photo: undefined
          }
        ]);
      }
    } else {
      // Jika masih kosong, siapkan 3 baris kartu anggota kosong
      setScannedCards([
        {
          id: 'card_head_' + Date.now(),
          name: '',
          nickname: '',
          binBinti: '',
          nik: '',
          role: 'Kepala Keluarga',
          gender: 'L',
          birthDate: '',
          birthYear: '1985',
          birthPlace: '',
          status: 'Hidup',
          address: '',
          photo: undefined
        },
        {
          id: 'card_spouse_' + (Date.now() + 1),
          name: '',
          nickname: '',
          binBinti: '',
          nik: '',
          role: 'Istri',
          gender: 'P',
          birthDate: '',
          birthYear: '1988',
          birthPlace: '',
          status: 'Hidup',
          address: '',
          photo: undefined
        },
        {
          id: 'card_child_' + (Date.now() + 2),
          name: '',
          nickname: '',
          binBinti: '',
          nik: '',
          role: 'Anak ke-1',
          gender: 'L',
          birthDate: '',
          birthYear: '2015',
          birthPlace: '',
          status: 'Hidup',
          address: '',
          photo: undefined
        }
      ]);
    }
    setShowScanKKModal(true);
  };

  // Upload Foto Bersama Seluruh Anggota Keluarga (Family Portrait / Selfie Bareng)
  const handleUploadFotoKeluarga = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      showNotification('Mengompres foto bersama keluarga...');
      const compressed = await compressImage(file, 650, 0.85);
      setFormFotoKeluarga(compressed);
      showNotification('Foto bersama keluarga berhasil diunggah!');
    } catch {
      showNotification('Gagal memproses foto keluarga.');
    }
  };

  const handleRemoveFotoKeluarga = () => {
    setFormFotoKeluarga(null);
    showNotification('Foto bersama keluarga dihapus.');
  };

  const toggleShowNik = (cardId: string) => {
    setShowNikMap(prev => ({ ...prev, [cardId]: !prev[cardId] }));
  };

  // Bersihkan semua data mock & reset ke nol
  const handleClearAllMockData = () => {
    setMembers([]);
    setPosts([]);
    setKkData({
      noKk: '',
      kepalaKeluarga: '',
      alamat: '',
      rtRw: '',
      desaKelurahan: '',
      kecamatan: '',
      kabupatenKota: '',
      kodePos: '',
      fotoKeluarga: undefined
    });
    setScannedCards([]);
    setKkRawPhoto(null);
    try {
      localStorage.removeItem('wargaqu_leluhur_members_v4');
      localStorage.removeItem('wargaqu_leluhur_posts_v4');
      localStorage.removeItem('wargaqu_leluhur_kk_v4');
      localStorage.removeItem('wargaqu_leluhur_members_v3');
      localStorage.removeItem('wargaqu_leluhur_posts_v3');
      localStorage.setItem('wargaqu_leluhur_cleared_mock_v4', 'true');
    } catch (e) {
      console.error(e);
    }
    setShowResetConfirmModal(false);
    showNotification('Semua data silsilah & mock data berhasil dibersihkan! Silsilah kini bersih.');
  };

  // Muat contoh data demo keluarga (Opsional)
  const handleLoadDemoData = () => {
    setMembers(DEMO_MEMBERS);
    setPosts(DEMO_POSTS);
    setKkData({
      noKk: '3201011506850001',
      kepalaKeluarga: 'Hendriana',
      alamat: 'Nanggerang Indah Residence Blok A No. 12',
      rtRw: '003/007',
      desaKelurahan: 'Nanggerang',
      kecamatan: 'Tajurhalang',
      kabupatenKota: 'Bogor',
      kodePos: '16320'
    });
    showNotification('Contoh data silsilah keluarga demo berhasil dimuat.');
  };

  // Simpan Kartu Keluarga (KK) & Anggota ke Pohon Silsilah Utama (SAVE)
  const handleSaveKkAndMembers = () => {
    const validCards = scannedCards.filter(c => c.name.trim().length > 0);
    if (validCards.length === 0) {
      showNotification('Silakan isi minimal 1 nama anggota keluarga (Kepala Keluarga).');
      return;
    }

    const headCard = validCards.find(c => c.role.toLowerCase().includes('kepala') || c.role.toLowerCase().includes('ayah')) || validCards[0];
    const spouseCard = validCards.find(c => (c.role.toLowerCase().includes('istri') || c.role.toLowerCase().includes('ibu')) && c.id !== headCard.id);
    const childCards = validCards.filter(c => c.id !== headCard.id && (!spouseCard || c.id !== spouseCard.id));

    // Simpan Data KK
    const newKkData: KartuKeluarga = {
      ...kkData,
      noKk: formNoKk.trim() || kkData.noKk,
      kepalaKeluarga: headCard.name.trim(),
      alamat: formAlamatKk.trim() || kkData.alamat,
      rtRw: formRtRw.trim() || kkData.rtRw,
      kabupatenKota: formKota.trim() || kkData.kabupatenKota,
      fotoKeluarga: formFotoKeluarga || undefined,
      updatedAt: new Date().toLocaleDateString('id-ID')
    };
    setKkData(newKkData);

    // Sinkronkan ke members silsilah
    setMembers(prev => {
      let updated = [...prev];
      const nonIntiMembers = updated.filter(m => m.trah !== 'inti');

      const headId = headCard.id.startsWith('card_') ? 'head_' + Date.now() : headCard.id;
      const spouseId = spouseCard ? (spouseCard.id.startsWith('card_') ? 'spouse_' + Date.now() : spouseCard.id) : undefined;

      const newChildIds: string[] = [];
      const newChildMembers: FamilyMember[] = childCards.map((c, idx) => {
        const cid = c.id.startsWith('card_') ? `child_${idx + 1}_${Date.now().toString(36)}` : c.id;
        newChildIds.push(cid);
        return {
          id: cid,
          name: c.name.trim(),
          nickname: c.nickname.trim() || undefined,
          binBinti: c.binBinti.trim() || (headCard ? (c.gender === 'L' ? `bin ${headCard.name}` : `binti ${headCard.name}`) : undefined),
          nik: c.nik?.trim() || undefined,
          kinshipTitle: c.role,
          role: c.role,
          relation: 'anak' as const,
          trah: 'inti' as const,
          gender: c.gender,
          birthYear: c.birthYear || '2020',
          birthDate: c.birthDate || undefined,
          birthPlace: c.birthPlace || undefined,
          status: c.status || 'Hidup',
          origin: newKkData.kabupatenKota || 'Bogor',
          address: c.address || newKkData.alamat,
          photo: c.photo
        };
      });

      const headMember: FamilyMember = {
        id: headId,
        name: headCard.name.trim(),
        nickname: headCard.nickname.trim() || undefined,
        binBinti: headCard.binBinti.trim() || undefined,
        nik: headCard.nik?.trim() || undefined,
        kinshipTitle: 'Kepala Keluarga',
        role: 'Ayah / Kepala Keluarga',
        relation: 'ayah' as const,
        trah: 'inti' as const,
        gender: headCard.gender || 'L',
        birthYear: headCard.birthYear || '1985',
        birthDate: headCard.birthDate || undefined,
        birthPlace: headCard.birthPlace || undefined,
        status: headCard.status || 'Hidup',
        origin: newKkData.kabupatenKota || 'Bogor',
        address: newKkData.alamat,
        photo: headCard.photo,
        spouses: spouseCard && spouseId ? [
          {
            id: 'sp_1',
            name: spouseCard.name.trim(),
            nickname: spouseCard.nickname.trim() || undefined,
            binBinti: spouseCard.binBinti.trim() || undefined,
            gender: spouseCard.gender || 'P',
            birthYear: spouseCard.birthYear || '1988',
            status: spouseCard.status || 'Hidup',
            marriageNote: 'Istri Tercatat di KK',
            childrenIds: newChildIds,
            photo: spouseCard.photo
          }
        ] : []
      };

      const newCoreMembers: FamilyMember[] = [headMember];

      if (spouseCard && spouseId) {
        newCoreMembers.push({
          id: spouseId,
          name: spouseCard.name.trim(),
          nickname: spouseCard.nickname.trim() || undefined,
          binBinti: spouseCard.binBinti.trim() || undefined,
          nik: spouseCard.nik?.trim() || undefined,
          kinshipTitle: 'Ibu (Istri)',
          role: spouseCard.role || 'Ibu Rumah Tangga',
          relation: 'ibu' as const,
          trah: 'inti' as const,
          gender: spouseCard.gender || 'P',
          birthYear: spouseCard.birthYear || '1988',
          birthDate: spouseCard.birthDate || undefined,
          birthPlace: spouseCard.birthPlace || undefined,
          status: spouseCard.status || 'Hidup',
          origin: newKkData.kabupatenKota || 'Bogor',
          address: newKkData.alamat,
          photo: spouseCard.photo
        });
      }

      newCoreMembers.push(...newChildMembers);

      return [...newCoreMembers, ...nonIntiMembers];
    });

    setShowScanKKModal(false);
    showNotification('Kartu Keluarga dan foto berhasil disimpan ke silsilah!');
  };

  // Scan KK Simulator dengan Auto-Text Parsing & Auto-Kompresi
  const handleStartScanKK = async (e?: React.ChangeEvent<HTMLInputElement>) => {
    const file = e?.target?.files?.[0];
    let photoData: string | null = null;
    if (file) {
      try {
        photoData = await compressImage(file, 650, 0.85);
        setKkRawPhoto(photoData);
      } catch (err) {
        console.error(err);
      }
    }
    setIsScanning(true);
    setScanResult(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(true);

      const timestamp = Date.now();
      const detectedNoKk = `320101${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      const detectedAddress = file
        ? `Nanggerang Indah Residence Blok ${String.fromCharCode(65 + Math.floor(Math.random() * 6))} No. ${Math.floor(Math.random() * 30) + 1}`
        : 'Jl. Merpati Indah No. 24, RT 02/RW 05';

      setFormNoKk(detectedNoKk);
      setFormAlamatKk(detectedAddress);
      setFormRtRw('003/007');
      setFormKota('Bogor');

      setScannedCards([
        {
          id: `kk_detected_${timestamp}_1`,
          name: 'Drs. H. Ahmad Fauzi',
          nickname: 'Kang Fauzi',
          binBinti: 'bin H. Mansyur',
          nik: '3201011204820003',
          role: 'Kepala Keluarga',
          gender: 'L',
          birthDate: '12/04/1982',
          birthYear: '1982',
          birthPlace: 'Kuningan',
          status: 'Hidup',
          address: detectedAddress,
          photo: photoData || undefined
        },
        {
          id: `kk_detected_${timestamp}_2`,
          name: 'Hj. Siti Rahmah',
          nickname: 'Ummi Rahmah',
          binBinti: 'binti H. Sulaeman',
          nik: '3201010511850002',
          role: 'Istri',
          gender: 'P',
          birthDate: '05/11/1985',
          birthYear: '1985',
          birthPlace: 'Bogor',
          status: 'Hidup',
          address: detectedAddress
        },
        {
          id: `kk_detected_${timestamp}_3`,
          name: 'Muhammad Farhan Fauzi',
          nickname: 'Farhan',
          binBinti: 'bin Ahmad Fauzi',
          nik: '3201011401100001',
          role: 'Anak ke-1',
          gender: 'L',
          birthDate: '14/01/2010',
          birthYear: '2010',
          birthPlace: 'Bogor',
          status: 'Hidup',
          address: detectedAddress
        },
        {
          id: `kk_detected_${timestamp}_4`,
          name: 'Aisyah Zahra Fauzi',
          nickname: 'Zahra',
          binBinti: 'binti Ahmad Fauzi',
          nik: '3201012008150004',
          role: 'Anak ke-2',
          gender: 'P',
          birthDate: '20/08/2015',
          birthYear: '2015',
          birthPlace: 'Bogor',
          status: 'Hidup',
          address: detectedAddress
        }
      ]);

      // Alihkan ke tab manual agar user bisa langsung cek & pasang foto selfie
      setKkModalTab('manual');
      showNotification('OCR Selesai: Teks KK terbaca! Silakan periksa, edit, pasang foto selfie & klik Simpan.');
    }, 1200);
  };

  // Add Member
  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showNotification('Silakan isi nama anggota keluarga.');
      return;
    }

    const newEntry: FamilyMember = {
      id: 'fam_' + Date.now(),
      name: formName.trim(),
      nickname: formNickname.trim() || undefined,
      binBinti: formBinBinti.trim() ? (formGender === 'L' ? `bin ${formBinBinti.trim()}` : `binti ${formBinBinti.trim()}`) : undefined,
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
      photo: formPhoto
    };

    setMembers(prev => [...prev, newEntry]);
    setShowAddMemberModal(false);
    // Reset form
    setFormName('');
    setFormNickname('');
    setFormBinBinti('');
    setFormNotes('');
    setFormPhoto(undefined);
    showNotification(`Alhamdulillah, ${newEntry.name} berhasil ditambahkan ke silsilah!`);
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

    const newPost: PostItem = {
      id: 'post-' + Date.now(),
      authorName: 'Hendriana (Bageur)',
      authorRole: 'Kepala Keluarga',
      trah: activeMedsosTrah,
      trahName: activeMedsosTrah === 'ayah' ? 'Trah Kuningan' : 'Trah Bogor',
      category: newPostCategory,
      timeAgo: 'Baru saja',
      content: newPostText.trim(),
      avatarColor: 'bg-emerald-700',
      initials: 'HB',
      likes: 1,
      isLiked: true,
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostText('');
    showNotification(`Postingan baru berhasil dibagikan di ${newPost.trahName}!`);
  };

  // Anggota Pokok Keluarga Inti (Dinamis dari state members)
  const mainHead = members.find(m => m.trah === 'inti' && (m.relation === 'ayah' || m.role?.toLowerCase().includes('kepala'))) || members.find(m => m.id === '1') || members[0];
  const mainSpouse = members.find(m => m.trah === 'inti' && (m.relation === 'ibu' || m.role?.toLowerCase().includes('istri'))) || members.find(m => m.id === '2');
  const mainChildren = members.filter(m => m.trah === 'inti' && m.relation === 'anak');

  // Filtered members for Tree View
  const displayedMembers = members.filter(m => {
    if (treeFilter === 'all') return true;
    if (treeFilter === 'inti') return m.trah === 'inti';
    if (treeFilter === 'ayah') return m.trah === 'ayah';
    if (treeFilter === 'ibu') return m.trah === 'ibu';
    return true;
  });

  return (
    <div className="w-full h-full bg-[#f0fdf4] font-sans antialiased flex flex-col relative select-none overflow-hidden text-slate-800">
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

        {/* Quick Top Right Actions: Kelola KK, Buku Silsilah, Bersihkan Mock */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => handleOpenKkModal('manual')}
            className="bg-emerald-950/40 hover:bg-emerald-950/60 active:scale-95 text-white border border-emerald-400/50 text-[11px] font-bold px-2.5 py-1.5 rounded-lg flex items-center space-x-1 transition shadow-xs"
            title="Kelola & Buat Kartu Keluarga"
          >
            <Camera className="w-3.5 h-3.5 text-[#5eead4]" />
            <span className="text-white">KK &amp; Scan</span>
          </button>
          <button
            onClick={() => setShowPdfModal(true)}
            className="bg-emerald-600/80 hover:bg-emerald-600 text-white p-1.5 rounded-lg active:scale-95 transition"
            title="Buku Silsilah Heritage (A4 - A0)"
          >
            <BookOpen className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowResetConfirmModal(true)}
            className="bg-rose-950/40 hover:bg-rose-900/60 border border-rose-400/30 text-rose-200 p-1.5 rounded-lg active:scale-95 transition"
            title="Hapus / Bersihkan Mock Data"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* SCROLLABLE MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-3.5 space-y-3.5 pb-24">

        {/* TAB 1: POHON SILSILAH INTERAKTIF (TREE VIEW & MULTI-SPOUSE) */}
        {activeTab === 'silsilah' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* KARTU PROFIL UTAMA (PRIVACY-FIRST, NIK DISEMBUNYIKAN) */}
            {members.length === 0 ? (
              <section className="bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#065f46] rounded-2xl p-4 text-white shadow-md border border-emerald-400/30 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/40">
                  <div className="flex items-center space-x-3">
                    <div className="w-13 h-13 bg-emerald-800/90 rounded-full flex items-center justify-center text-lg font-bold border-2 border-[#5eead4] shadow text-white shrink-0">
                      <Users className="w-6 h-6 text-[#5eead4]" />
                    </div>
                    <div>
                      <h2 className="font-bold text-base text-white">Kartu Keluarga Belum Dibuat</h2>
                      <p className="text-xs text-emerald-200">Data silsilah saat ini bersih (0 anggota)</p>
                      <p className="text-[10px] text-emerald-100 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#5eead4]" />
                        <span>Mulai dengan buat KK atau scan foto KK</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenKkModal('manual')}
                    className="bg-[#5eead4] hover:bg-[#2dd4bf] text-emerald-950 font-extrabold text-[11px] px-3 py-1.5 rounded-xl shadow transition flex items-center gap-1 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Buat KK</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2.5 text-xs">
                  <button
                    onClick={() => handleOpenKkModal('manual')}
                    className="bg-emerald-950/60 hover:bg-emerald-950/80 p-2.5 rounded-xl text-left border border-emerald-500/30 transition flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center shrink-0 text-[#5eead4]">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-[11px] block">Input Manual KK</span>
                      <span className="text-[9px] text-emerald-200 block">Ketik nama &amp; pas foto</span>
                    </div>
                  </button>
                  <button
                    onClick={() => handleOpenKkModal('scan')}
                    className="bg-emerald-950/60 hover:bg-emerald-950/80 p-2.5 rounded-xl text-left border border-emerald-500/30 transition flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center shrink-0 text-[#5eead4]">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-white text-[11px] block">Scan Foto KK</span>
                      <span className="text-[9px] text-emerald-200 block">Auto-text OCR pintar</span>
                    </div>
                  </button>
                </div>

                <div className="mt-2.5 flex items-center justify-between text-[10px] text-emerald-200/90 bg-emerald-950/40 px-2.5 py-1.5 rounded-lg border border-emerald-500/20">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#5eead4]" />
                    <span>Privasi Aman: Tersimpan Lokal di HP</span>
                  </span>
                  <button onClick={handleLoadDemoData} className="text-[#5eead4] font-bold hover:underline">
                    Muat Contoh Demo
                  </button>
                </div>
              </section>
            ) : (
              <section className="bg-gradient-to-br from-[#064e3b] via-[#047857] to-[#065f46] rounded-2xl p-4 text-white shadow-md border border-emerald-400/30 relative overflow-hidden">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/40">
                  <div className="flex items-center space-x-3">
                    <div className="w-13 h-13 bg-emerald-800 rounded-full flex items-center justify-center text-lg font-bold border-2 border-[#5eead4] shadow text-white shrink-0 overflow-hidden relative">
                      {kkData.fotoKeluarga ? (
                        <img src={kkData.fotoKeluarga} alt="Foto Keluarga" className="w-full h-full object-cover" />
                      ) : mainHead?.photo ? (
                        <img src={mainHead.photo} alt={mainHead.name} className="w-full h-full object-cover" />
                      ) : (
                        (mainHead?.name || 'KK').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h2 className="font-bold text-base text-white">
                          {kkData.kepalaKeluarga ? `Kel. ${kkData.kepalaKeluarga}` : (mainHead?.name || 'Kepala Keluarga')}
                        </h2>
                        {mainHead?.nickname && (
                          <span className="text-[10px] bg-emerald-950/60 text-[#5eead4] px-1.5 py-0.2 rounded font-medium">
                            "{mainHead.nickname}"
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-200 font-mono">
                        No. KK: {kkData.noKk ? `${kkData.noKk.slice(0, 4)}••••••••${kkData.noKk.slice(-4)}` : '3201••••••••0001'}
                      </p>
                      <p className="text-[10px] text-emerald-100 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-[#5eead4]" />
                        <span className="truncate max-w-[190px]">
                          {kkData.alamat || mainHead?.address || 'Nanggerang Indah Residence'} {kkData.rtRw ? `RT/RW ${kkData.rtRw}` : ''}
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenKkModal('manual')}
                    className="bg-emerald-500/20 hover:bg-emerald-500/30 text-[#5eead4] border border-emerald-400/40 text-[10px] font-bold px-2 py-1.5 rounded-lg flex items-center gap-1 active:scale-95"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Kelola KK</span>
                  </button>
                </div>

                {/* Trah 2 Jalur Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2.5 text-xs">
                  <div className="bg-emerald-950/60 p-2 rounded-xl text-center border border-emerald-500/30">
                    <span className="text-emerald-300 block text-[10px] font-medium">Trah Ayah (Paternal)</span>
                    <span className="font-bold text-white text-[11px]">
                      {members.find(m => m.trah === 'ayah')?.origin ? `Trah ${members.find(m => m.trah === 'ayah')?.origin}` : 'Trah Cilimus, Kuningan'}
                    </span>
                    <span className="text-[9px] text-emerald-200 block mt-0.5 font-mono">
                      {members.find(m => m.trah === 'ayah')?.name || 'Buyut Kyai Abdul Ghani'}
                    </span>
                  </div>
                  <div className="bg-emerald-950/60 p-2 rounded-xl text-center border border-emerald-500/30">
                    <span className="text-emerald-300 block text-[10px] font-medium">Trah Ibu (Maternal)</span>
                    <span className="font-bold text-white text-[11px]">
                      {members.find(m => m.trah === 'ibu')?.origin ? `Trah ${members.find(m => m.trah === 'ibu')?.origin}` : 'Trah Dramaga, Bogor'}
                    </span>
                    <span className="text-[9px] text-emerald-200 block mt-0.5 font-mono">
                      {members.find(m => m.trah === 'ibu')?.name || 'Buyut H. Hasan Sulaeman'}
                    </span>
                  </div>
                </div>

                {/* Privacy-First Badge & Foto Status */}
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-emerald-200/90 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-[#5eead4]" />
                    <span>Privasi Aman: NIK Tersembunyi Otomatis</span>
                  </span>
                  <span className="font-mono text-[#5eead4] font-bold">
                    {kkData.fotoKeluarga ? 'Foto KK Tersimpan' : 'Offline-First'}
                  </span>
                </div>
              </section>
            )}

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
              {members.length === 0 ? (
                <div className="py-8 px-4 text-center space-y-3.5 bg-emerald-50/50 rounded-xl border border-dashed border-emerald-300">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mx-auto">
                    <Users className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-800">Pohon Silsilah Belum Ada Anggota</h4>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Mulai dengan membuat Kartu Keluarga baru atau memindai foto KK fisik Anda untuk otomatis membuat pohon silsilah keluarga.
                    </p>
                  </div>
                  <div className="flex gap-2 justify-center pt-1">
                    <button
                      onClick={() => handleOpenKkModal('manual')}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Buat KK Baru</span>
                    </button>
                    <button
                      onClick={() => handleOpenKkModal('scan')}
                      className="bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-bold px-3 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Scan KK</span>
                    </button>
                  </div>
                </div>
              ) : (
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
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-[10px] shrink-0 overflow-hidden">
                            {m.photo ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" /> : m.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">{m.name}</h4>
                            <p className="text-[10px] text-slate-600 truncate">{m.binBinti} • {m.origin}</p>
                          </div>
                        </div>
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
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs overflow-hidden ${m.gender === 'L' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                            {m.photo ? (
                              <img src={m.photo} alt={m.name} className="w-full h-full object-cover" />
                            ) : (
                              m.name.slice(0, 2).toUpperCase()
                            )}
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
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold text-white shrink-0 overflow-hidden ${m.gender === 'L' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                            {m.photo ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" /> : m.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">{m.name}</h4>
                            <p className="text-[10px] text-slate-500 truncate">{m.binBinti} • {m.origin}</p>
                          </div>
                        </div>
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
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 overflow-hidden">
                            {m.photo ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" /> : m.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 leading-tight truncate">{m.name}</h4>
                            <p className="text-[10px] text-slate-500 truncate">{m.binBinti}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

              {/* Action Buttons: Tambah Anggota & Scan KK */}
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

        {/* TAB 2: MEDSOS TRAH (FEED 2 JALUR AYAH VS IBU) */}
        {activeTab === 'medsos' && (
          <div className="space-y-3.5 animate-in fade-in duration-200">
            {/* Sub-tab Jalur Trah Ayah vs Trah Ibu */}
            <div className="grid grid-cols-2 bg-emerald-100/70 p-1 rounded-2xl border border-emerald-200">
              <button
                onClick={() => setActiveMedsosTrah('ayah')}
                className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
                  activeMedsosTrah === 'ayah'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-emerald-900 hover:text-emerald-700'
                }`}
              >
                <span>Trah Ayah (Kuningan)</span>
              </button>
              <button
                onClick={() => setActiveMedsosTrah('ibu')}
                className={`py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1.5 ${
                  activeMedsosTrah === 'ibu'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-emerald-900 hover:text-emerald-700'
                }`}
              >
                <span>Trah Ibu (Bogor)</span>
              </button>
            </div>

            {/* Input Form Berbagi Cerita / Sejarah / Foto Jadul */}
            <form onSubmit={handleCreatePost} className="bg-white border border-emerald-100 rounded-2xl p-3.5 space-y-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-emerald-700 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs">
                    HB
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Bagikan ke {activeMedsosTrah === 'ayah' ? 'Trah Ayah' : 'Trah Ibu'}
                    </span>
                    <span className="text-[10px] text-slate-400 block">Hendriana (Bageur)</span>
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
                placeholder={`Bagikan arsip cerita, sejarah leluhur, atau agenda arisan untuk ${activeMedsosTrah === 'ayah' ? 'Trah Kuningan' : 'Trah Bogor'}...`}
                rows={2}
                className="w-full bg-[#f0fdf4] border border-emerald-200/80 rounded-xl p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-600 resize-none"
              />

              <div className="flex justify-between items-center pt-1">
                <span className="text-[10px] text-slate-400 italic">
                  Hanya terlihat oleh keluarga {activeMedsosTrah === 'ayah' ? 'Trah Ayah' : 'Trah Ibu'}
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
                Cetak dokumen silsilah keluarga besar 2 Model (Foto Sendiri atau Keluarga Kompak) dengan pilihan kertas dari A4 hingga A0 super tajam.
              </p>
              <button
                onClick={() => setShowPdfModal(true)}
                className="w-full bg-white text-emerald-900 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center space-x-1.5 shadow transition active:scale-98"
              >
                <Printer className="w-4 h-4 text-emerald-700" />
                <span>Buka Pratinjau &amp; Opsi Cetak Kertas (A4 - A0)</span>
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

      {/* BOTTOM NAVIGATION BAR KHUSUS LELUHURQU (WARGAQU EMERALD SIGNATURE THEME) */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-emerald-100 px-3 py-2 flex justify-around items-center z-40 shadow-lg">
        {/* Tab 1: Silsilah */}
        <button
          onClick={() => setActiveTab('silsilah')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 ${
            activeTab === 'silsilah' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-emerald-700 font-medium'
          }`}
        >
          <GitFork className={`w-5 h-5 rotate-180 ${activeTab === 'silsilah' ? 'text-emerald-700' : 'text-slate-400'}`} />
          <span className="text-[10px]">Silsilah</span>
        </button>

        {/* Tab 2: Medsos Trah */}
        <button
          onClick={() => setActiveTab('medsos')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 ${
            activeTab === 'medsos' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-emerald-700 font-medium'
          }`}
        >
          <Users className={`w-5 h-5 ${activeTab === 'medsos' ? 'text-emerald-700' : 'text-slate-400'}`} />
          <span className="text-[10px]">Medsos Trah</span>
        </button>

        {/* Tab 3: Doa Leluhur (Malam Jumat) */}
        <button
          onClick={() => setActiveTab('doa')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 relative ${
            activeTab === 'doa' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-emerald-700 font-medium'
          }`}
        >
          <div className="relative">
            <Moon className={`w-5 h-5 ${activeTab === 'doa' ? 'text-emerald-700' : 'text-slate-400'}`} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
          </div>
          <span className="text-[10px]">Doa Leluhur</span>
        </button>

        {/* Tab 4: Arsip & Buku */}
        <button
          onClick={() => setActiveTab('arsip')}
          className={`flex flex-col items-center gap-1 transition active:scale-95 ${
            activeTab === 'arsip' ? 'text-emerald-700 font-bold' : 'text-slate-400 hover:text-emerald-700 font-medium'
          }`}
        >
          <Archive className={`w-5 h-5 ${activeTab === 'arsip' ? 'text-emerald-700' : 'text-slate-400'}`} />
          <span className="text-[10px]">Arsip &amp; Buku</span>
        </button>
      </nav>

      {/* ========================================================================= */}
      {/* MODAL 1: SCAN KK AUTO-TEXT + KARTU NAMA/ALAMAT/TGL LAHIR + PAS FOTO + MINI STRUKTUR */}
      {/* ========================================================================= */}
      {showScanKKModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 space-y-3 shadow-2xl relative border border-emerald-100 text-slate-800 max-h-[92vh] flex flex-col">
            {/* Header Modal */}
            <div className="flex justify-between items-center border-b border-emerald-100 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-700 text-white rounded-xl flex items-center justify-center shadow-xs">
                  <Camera className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Kelola Kartu Keluarga (KK) &amp; Anggota</h3>
                  <p className="text-[10px] text-emerald-700 font-bold">Manual / Scan Foto KK • Selfie Bersama • Pas Foto Wajah</p>
                </div>
              </div>
              <button
                onClick={() => setShowScanKKModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* TAB SELECTOR: MANUAL INPUT VS SCAN FOTO KK */}
            <div className="grid grid-cols-2 gap-1.5 bg-emerald-100/70 p-1 rounded-xl border border-emerald-200 text-xs">
              <button
                type="button"
                onClick={() => setKkModalTab('manual')}
                className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  kkModalTab === 'manual'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-emerald-900 hover:text-emerald-700'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Input / Edit Manual</span>
              </button>
              <button
                type="button"
                onClick={() => setKkModalTab('scan')}
                className={`py-1.5 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
                  kkModalTab === 'scan'
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-emerald-900 hover:text-emerald-700'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan Foto Dokumen</span>
              </button>
            </div>

            {/* Body Scrollable */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3.5 pr-0.5">

              {/* TAB 2: SCAN FOTO DOKUMEN KK */}
              {kkModalTab === 'scan' && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  {/* Box Upload / Kamera KK */}
                  <div className="bg-[#f0fdf4] border-2 border-dashed border-emerald-300 rounded-xl p-3 text-center space-y-2">
                    {kkRawPhoto ? (
                      <div className="relative rounded-lg overflow-hidden max-h-32 mx-auto">
                        <img src={kkRawPhoto} alt="Hasil Scan KK" className="w-full h-full object-cover rounded-lg" />
                        <span className="absolute bottom-1 right-1 bg-emerald-950/80 text-[#5eead4] text-[9px] px-1.5 py-0.2 rounded font-mono font-bold">
                          Terscan &amp; Terkompres
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <FileText className="w-8 h-8 text-emerald-600 mx-auto" />
                        <p className="text-xs font-bold text-slate-800">Ambil Foto / Pilih Berkas Kartu Keluarga</p>
                        <p className="text-[10px] text-slate-500">Auto-deteksi baris nama, tanggal lahir, dan alamat</p>
                      </div>
                    )}

                    <div className="flex justify-center gap-2 pt-1">
                      <label className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1 shadow-xs transition">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Kamera HP</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleStartScanKK}
                          className="hidden"
                        />
                      </label>
                      <label className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[11px] font-bold px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1 transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Dari Galeri</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleStartScanKK}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Status OCR Scanner */}
                  {isScanning && (
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-1">
                      <Sparkles className="w-5 h-5 text-emerald-600 mx-auto animate-spin" />
                      <p className="text-xs font-bold text-emerald-800">Membaca Teks Dokumen KK...</p>
                      <p className="text-[10px] text-slate-500">Mengekstraksi baris nama, alamat &amp; tanggal lahir</p>
                    </div>
                  )}

                  {/* Template Dokumen KK Contoh */}
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-emerald-900 font-bold">
                      <span>ATAU PILIH PRESET CONTOH KK:</span>
                      <span className="text-[9px] text-emerald-700 font-mono">1-Klik Ekstraksi</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleLoadPresetKK('hendriana')}
                        className={`py-1.5 px-1 rounded-lg border font-bold text-center transition ${
                          activeKkPreset === 'hendriana'
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                            : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        KK Hendriana
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadPresetKK('ahmad_fauzi')}
                        className={`py-1.5 px-1 rounded-lg border font-bold text-center transition ${
                          activeKkPreset === 'ahmad_fauzi'
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                            : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        KK Ahmad Fauzi
                      </button>
                      <button
                        type="button"
                        onClick={() => handleLoadPresetKK('bambang_sutrisno')}
                        className={`py-1.5 px-1 rounded-lg border font-bold text-center transition ${
                          activeKkPreset === 'bambang_sutrisno'
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                            : 'bg-white text-slate-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        KK Bambang (5 Org)
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setKkModalTab('manual')}
                    className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Lanjut Periksa &amp; Lengkapi di Tab Manual ({scannedCards.length} Kartu)</span>
                  </button>
                </div>
              )}

              {/* SECTION: DATA INDUK KARTU KELUARGA (HEADER KK) & FOTO KELUARGA BERSAMA */}
              <div className="bg-[#f0fdf4] border border-emerald-200 rounded-xl p-3 space-y-2.5">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Informasi Dokumen Kartu Keluarga</span>
                  </h4>
                  <span className="text-[9px] text-emerald-700 font-mono font-bold">Data Induk</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                      No. Kartu Keluarga (KK)
                    </label>
                    <input
                      type="text"
                      value={formNoKk}
                      onChange={e => setFormNoKk(e.target.value)}
                      placeholder="Contoh: 3201011506850001"
                      className="w-full bg-white border border-emerald-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                      RT / RW
                    </label>
                    <input
                      type="text"
                      value={formRtRw}
                      onChange={e => setFormRtRw(e.target.value)}
                      placeholder="Contoh: 003/007"
                      className="w-full bg-white border border-emerald-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                      Alamat Lengkap KK
                    </label>
                    <input
                      type="text"
                      value={formAlamatKk}
                      onChange={e => setFormAlamatKk(e.target.value)}
                      placeholder="Nama jalan / perumahan / blok"
                      className="w-full bg-white border border-emerald-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 font-bold mb-0.5">
                      Kabupaten / Kota
                    </label>
                    <input
                      type="text"
                      value={formKota}
                      onChange={e => setFormKota(e.target.value)}
                      placeholder="Contoh: Bogor / Kuningan"
                      className="w-full bg-white border border-emerald-200 rounded-lg p-1.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* FOTO BERSAMA KELUARGA (FAMILY PORTRAIT / SELFIE BARENG) */}
                <div className="pt-2 border-t border-emerald-200/80 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Foto Bersama Seluruh Anggota Keluarga (Selfie / Galeri)</span>
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold">Auto-Kompres</span>
                  </div>

                  {formFotoKeluarga ? (
                    <div className="relative rounded-xl overflow-hidden border border-emerald-300 max-h-36 bg-slate-900">
                      <img
                        src={formFotoKeluarga}
                        alt="Foto Keluarga Bersama"
                        className="w-full h-36 object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-emerald-950/80 text-[#5eead4] text-[9px] font-bold px-2 py-0.5 rounded-md">
                        Foto Keluarga Bersama Tersimpan
                      </div>
                      <div className="absolute bottom-2 right-2 flex gap-1.5">
                        <label className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg cursor-pointer shadow transition">
                          Ganti
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleUploadFotoKeluarga}
                            className="hidden"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveFotoKeluarga}
                          className="bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow transition"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <label className="bg-white hover:bg-emerald-50 border border-dashed border-emerald-300 text-emerald-800 rounded-xl p-2.5 cursor-pointer text-center flex flex-col items-center justify-center gap-1 transition">
                        <Camera className="w-4 h-4 text-emerald-700" />
                        <span className="text-[10px] font-bold">Ambil Selfie Bareng</span>
                        <span className="text-[8px] text-slate-400">Kamera Depan HP</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="user"
                          onChange={handleUploadFotoKeluarga}
                          className="hidden"
                        />
                      </label>
                      <label className="bg-white hover:bg-emerald-50 border border-dashed border-emerald-300 text-emerald-800 rounded-xl p-2.5 cursor-pointer text-center flex flex-col items-center justify-center gap-1 transition">
                        <Upload className="w-4 h-4 text-emerald-700" />
                        <span className="text-[10px] font-bold">Pilih dari Galeri</span>
                        <span className="text-[8px] text-slate-400">Foto Keluarga Lengkap</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadFotoKeluarga}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION: DAFTAR KARTU ANGGOTA KELUARGA (EDIT, TUKAR, PAS FOTO, NIK TOGGLE) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Daftar Anggota Keluarga ({scannedCards.length})</span>
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddNewScannedCard}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition shadow-xs"
                    title="Tambah Anggota KK Baru"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Tambah Anggota</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {scannedCards.map((card, idx) => (
                    <div
                      key={card.id}
                      className="bg-white border border-emerald-200 rounded-xl p-3 shadow-2xs space-y-2.5 hover:border-emerald-400 transition"
                    >
                      {/* Top Row: Pas Foto / Selfie, Nama, Peran & Tombol Aksi */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                          {/* Pas Foto Wajah Auto-Kompres */}
                          <div className="relative group shrink-0">
                            <div className="w-13 h-13 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 font-bold text-xs overflow-hidden shadow-2xs">
                              {card.photo ? (
                                <img src={card.photo} alt={card.name} className="w-full h-full object-cover" />
                              ) : (
                                card.name ? card.name.slice(0, 2).toUpperCase() : '?'
                              )}
                            </div>
                            <label
                              className="absolute -bottom-1 -right-1 bg-emerald-700 hover:bg-emerald-800 text-white p-1 rounded-full cursor-pointer shadow-xs transition"
                              title="Unggah / Ambil Pas Foto Wajah"
                            >
                              <Camera className="w-2.5 h-2.5" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={e => handlePhotoUploadForCard(card.id, e)}
                                className="hidden"
                              />
                            </label>
                          </div>

                          {/* Info Pokok: Nama Lengkap, Peran Dropdown, Bin/Binti */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <input
                              type="text"
                              value={card.name}
                              onChange={e => handleUpdateCardField(card.id, 'name', e.target.value)}
                              className="font-bold text-xs text-slate-900 bg-transparent border-b border-slate-200 focus:border-emerald-600 focus:outline-none w-full pb-0.5"
                              placeholder="Nama Lengkap Anggota..."
                            />
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <select
                                value={card.role}
                                onChange={e => {
                                  const val = e.target.value;
                                  handleUpdateCardField(card.id, 'role', val);
                                  if (val === 'Kepala Keluarga') {
                                    handleUpdateCardField(card.id, 'gender', 'L');
                                  } else if (val === 'Istri') {
                                    handleUpdateCardField(card.id, 'gender', 'P');
                                  }
                                }}
                                className="text-[10px] bg-emerald-100 text-emerald-900 font-bold rounded px-1.5 py-0.5 border border-emerald-300 focus:outline-none"
                              >
                                <option value="Kepala Keluarga">Kepala Keluarga</option>
                                <option value="Istri">Istri</option>
                                <option value="Anak ke-1">Anak ke-1</option>
                                <option value="Anak ke-2">Anak ke-2</option>
                                <option value="Anak ke-3">Anak ke-3</option>
                                <option value="Anak ke-4">Anak ke-4</option>
                                <option value="Anak ke-5">Anak ke-5</option>
                                <option value="Orang Tua">Orang Tua</option>
                                <option value="Mertua">Mertua</option>
                                <option value="Famili Lain">Famili Lain</option>
                              </select>

                              <input
                                type="text"
                                value={card.binBinti}
                                onChange={e => handleUpdateCardField(card.id, 'binBinti', e.target.value)}
                                placeholder="bin / binti..."
                                className="text-[10px] text-slate-500 bg-transparent border-b border-slate-200 focus:border-emerald-600 focus:outline-none w-24"
                              />

                              <input
                                type="text"
                                value={card.nickname}
                                onChange={e => handleUpdateCardField(card.id, 'nickname', e.target.value)}
                                placeholder="Panggilan"
                                className="text-[10px] text-emerald-700 font-medium bg-transparent border-b border-slate-200 focus:border-emerald-600 focus:outline-none w-20"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Tombol Aksi: Pindah Urutan & Hapus Baris */}
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveCard(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-emerald-700 disabled:opacity-20"
                            title="Tukar Posisi ke Atas"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteScannedCard(card.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition"
                            title="Hapus Anggota Ini dari KK"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Detail Kartu: NIK (dengan Eye Toggle) & Tanggal Lahir / Tempat */}
                      <div className="grid grid-cols-2 gap-2 bg-[#f0fdf4] p-2 rounded-lg text-[10px] border border-emerald-100">
                        <div>
                          <div className="flex items-center justify-between text-slate-500 mb-0.5">
                            <span className="font-semibold">NIK (Privacy-First):</span>
                            <button
                              type="button"
                              onClick={() => toggleShowNik(card.id)}
                              className="text-emerald-700 hover:text-emerald-900"
                              title="Tampilkan / Sembunyikan NIK"
                            >
                              {showNikMap[card.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                          </div>
                          <input
                            type={showNikMap[card.id] ? 'text' : 'password'}
                            value={card.nik || ''}
                            onChange={e => handleUpdateCardField(card.id, 'nik', e.target.value)}
                            placeholder="16 digit NIK"
                            className="font-mono font-medium text-slate-800 bg-white border border-emerald-200 rounded px-1.5 py-0.5 w-full focus:outline-none focus:border-emerald-600"
                          />
                        </div>

                        <div>
                          <span className="text-slate-500 block font-semibold mb-0.5">Tgl Lahir / Th:</span>
                          <input
                            type="text"
                            value={card.birthDate}
                            onChange={e => {
                              const val = e.target.value;
                              handleUpdateCardField(card.id, 'birthDate', val);
                              const yearMatch = val.match(/\b(19\d\d|20\d\d)\b/);
                              if (yearMatch) {
                                handleUpdateCardField(card.id, 'birthYear', yearMatch[1]);
                              }
                            }}
                            placeholder="DD/MM/YYYY"
                            className="font-bold text-slate-800 bg-white border border-emerald-200 rounded px-1.5 py-0.5 w-full focus:outline-none focus:border-emerald-600"
                          />
                        </div>

                        <div>
                          <span className="text-slate-500 block font-semibold mb-0.5">Tempat Lahir:</span>
                          <input
                            type="text"
                            value={card.birthPlace || ''}
                            onChange={e => handleUpdateCardField(card.id, 'birthPlace', e.target.value)}
                            placeholder="Kota Lahir"
                            className="font-medium text-slate-800 bg-white border border-emerald-200 rounded px-1.5 py-0.5 w-full focus:outline-none focus:border-emerald-600"
                          />
                        </div>

                        <div>
                          <span className="text-slate-500 block font-semibold mb-0.5">Jenis Kelamin &amp; Status:</span>
                          <div className="flex items-center gap-1">
                            <select
                              value={card.gender}
                              onChange={e => handleUpdateCardField(card.id, 'gender', e.target.value as 'L' | 'P')}
                              className="bg-white border border-emerald-200 rounded px-1 py-0.5 text-[10px] font-bold text-slate-800 focus:outline-none"
                            >
                              <option value="L">L</option>
                              <option value="P">P</option>
                            </select>
                            <select
                              value={card.status || 'Hidup'}
                              onChange={e => handleUpdateCardField(card.id, 'status', e.target.value as any)}
                              className="bg-white border border-emerald-200 rounded px-1 py-0.5 text-[10px] font-bold text-slate-800 focus:outline-none flex-1"
                            >
                              <option value="Hidup">Hidup</option>
                              <option value="Almarhum">Almarhum</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MINI STRUKTUR / FAMILY TREE INTERAKTIF LANGSUNG DARI HASIL KARTU KK */}
              {scannedCards.length > 0 && (
                <div className="bg-[#f0fdf4] border border-emerald-200 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1">
                      <GitFork className="w-3.5 h-3.5 text-emerald-700 rotate-180" />
                      <span>Mini Struktur Kartu Keluarga</span>
                    </span>
                    <span className="text-[9px] text-emerald-700 font-mono font-bold">Terhubung Otomatis</span>
                  </div>

                  {/* Bagan Mini Visual */}
                  <div className="bg-white rounded-lg p-2.5 border border-emerald-100 flex flex-col items-center space-y-2 relative">
                    {/* Row Pasangan (Ayah & Ibu) */}
                    <div className="flex items-center gap-4 relative">
                      {scannedCards.slice(0, 2).map(parent => (
                        <div key={parent.id} className="flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full border-2 border-emerald-600 overflow-hidden bg-emerald-50 flex items-center justify-center font-bold text-xs text-emerald-800 shadow-2xs">
                            {parent.photo ? (
                              <img src={parent.photo} alt={parent.name} className="w-full h-full object-cover" />
                            ) : (
                              parent.name ? parent.name.slice(0, 2).toUpperCase() : '?'
                            )}
                          </div>
                          <span className="text-[10px] font-bold text-slate-900 mt-1 max-w-[70px] truncate text-center">
                            {parent.name || 'Nama'}
                          </span>
                          <span className="text-[8px] text-emerald-700 font-medium">{parent.role}</span>
                        </div>
                      ))}
                      {/* Garis Penghubung Pernikahan */}
                      <div className="absolute top-5 left-10 right-10 h-0.5 bg-emerald-400 -z-0"></div>
                    </div>

                    {/* Garis Vertikal Turun ke Anak */}
                    <div className="w-0.5 h-3 bg-emerald-400"></div>

                    {/* Row Anak-Anak */}
                    <div className="flex items-center justify-center gap-3 pt-1 border-t border-emerald-300 w-full overflow-x-auto">
                      {scannedCards.slice(2).map(child => (
                        <div key={child.id} className="flex flex-col items-center shrink-0">
                          <div className="w-8 h-8 rounded-full border border-emerald-500 overflow-hidden bg-emerald-50 flex items-center justify-center font-bold text-[10px] text-emerald-800 shadow-2xs">
                            {child.photo ? (
                              <img src={child.photo} alt={child.name} className="w-full h-full object-cover" />
                            ) : (
                              child.name ? child.name.slice(0, 2).toUpperCase() : '?'
                            )}
                          </div>
                          <span className="text-[9px] font-bold text-slate-900 mt-0.5 max-w-[65px] truncate text-center">
                            {child.name || 'Anak'}
                          </span>
                          <span className="text-[8px] text-slate-500">{child.birthYear || child.role}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer: Simpan (Save) */}
            <div className="pt-2 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={handleSaveKkAndMembers}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl shadow transition flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Kartu Keluarga (Save)</span>
              </button>
              <button
                type="button"
                onClick={() => setShowScanKKModal(false)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRATINJAU BUKU SILSILAH 2 MODEL, GESER POSISI & PILIHAN KERTAS A4 - A0 */}
      {/* ========================================================================= */}
      {showPdfModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 space-y-3 shadow-2xl relative border border-emerald-100 max-h-[92vh] flex flex-col text-slate-800">
            {/* Header Modal */}
            <div className="flex justify-between items-center border-b border-emerald-50 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-700 text-white rounded-xl flex items-center justify-center shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Buku Silsilah Heritage (2 Model)</h3>
                  <p className="text-[10px] text-emerald-700 font-bold">Pilihan Ukuran Kertas: A4, A3, A2, A1, A0 (Ultra Sharp)</p>
                </div>
              </div>
              <button
                onClick={() => setShowPdfModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-bar: Pemilih 2 Model Tampilan & Pemilih Ukuran Kertas */}
            <div className="space-y-2 bg-[#f0fdf4] p-2.5 rounded-xl border border-emerald-200/80">
              {/* 1. Pilih 2 Model Silsilah */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider">Model Tampilan:</span>
                <div className="grid grid-cols-2 gap-1 bg-white p-0.5 rounded-lg border border-emerald-200">
                  <button
                    onClick={() => setBukuTreeModel('foto_sendiri')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                      bukuTreeModel === 'foto_sendiri' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-800'
                    }`}
                  >
                    1. Pas Foto Sendiri
                  </button>
                  <button
                    onClick={() => setBukuTreeModel('keluarga_kompak')}
                    className={`px-2.5 py-1 rounded text-[10px] font-bold transition ${
                      bukuTreeModel === 'keluarga_kompak' ? 'bg-emerald-700 text-white shadow-2xs' : 'text-slate-600 hover:text-emerald-800'
                    }`}
                  >
                    2. Keluarga Kompak
                  </button>
                </div>
              </div>

              {/* 2. Pilih Ukuran Kertas A4 s/d A0 (High-DPI Upscale) */}
              <div className="flex items-center justify-between pt-1 border-t border-emerald-200/50">
                <span className="text-[10px] font-bold text-emerald-950 uppercase tracking-wider">Ukuran Kertas:</span>
                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-emerald-200">
                  {(['A4', 'A3', 'A2', 'A1', 'A0'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setPaperSize(size)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition font-mono ${
                        paperSize === size ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-emerald-800'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scrollable Dokumen Pratinjau Kertas */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 p-1">
              {/* Badge Skala Kertas Terpilih */}
              <div className="flex justify-between items-center text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span>
                  Format Cetak: <strong>Kertas {paperSize}</strong> • Vektor Tajam 300 DPI
                </span>
                <span className="text-emerald-700 font-bold">
                  {bukuTreeModel === 'foto_sendiri' ? 'Model Pas Foto Individual' : 'Model Unit Keluarga Kompak'}
                </span>
              </div>

              {/* COVER BUKU SILSILAH HERITAGE */}
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
                  <p>Trah Paternal: Cilimus, Kuningan • Trah Maternal: Dramaga, Bogor</p>
                  <p className="text-amber-300 font-mono text-[9px] pt-1">
                    Edisi Arsip Pusaka Digital WargaQu 2026 • Format Kertas {paperSize}
                  </p>
                </div>
              </div>

              {/* ================= MODEL 1: MODEL PAS FOTO SENDIRI ================= */}
              {bukuTreeModel === 'foto_sendiri' && (
                <div className="space-y-3 bg-[#f0fdf4] p-3 rounded-xl border border-emerald-200">
                  <div className="flex justify-between items-center border-b border-emerald-200 pb-1.5">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Model 1: Struktur Pas Foto Individual
                    </span>
                    <span className="text-[9px] text-slate-500">Klik panah untuk geser posisi</span>
                  </div>

                  {/* Generasi Buyut (Leluhur) */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-amber-800 uppercase block">1. Tingkat Buyut / Moyang</span>
                    <div className="grid grid-cols-2 gap-2">
                      {members.filter(m => m.relation === 'buyut').map(m => (
                        <div key={m.id} className="bg-white p-2 rounded-lg border border-amber-200 shadow-2xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-amber-100 overflow-hidden flex items-center justify-center text-xs font-bold text-amber-800 shrink-0">
                              {m.photo ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" /> : m.name.slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-900 truncate">{m.name}</p>
                              <p className="text-[9px] text-slate-500">{m.binBinti} • {getYearRangeDisplay(m)}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            <button onClick={() => handleShiftMemberOrder(m.id, 'left')} className="p-0.5 text-slate-400 hover:text-emerald-700" title="Geser">
                              <MoveLeft className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleShiftMemberOrder(m.id, 'right')} className="p-0.5 text-slate-400 hover:text-emerald-700" title="Geser">
                              <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SVG Garis Penghubung Generasi 1 ke 2 */}
                  <div className="w-full flex justify-center py-0.5">
                    <div className="w-0.5 h-4 bg-emerald-400"></div>
                  </div>

                  {/* Generasi Kakek & Nenek */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-emerald-900 uppercase block">2. Tingkat Aki &amp; Nini</span>
                    <div className="grid grid-cols-2 gap-2">
                      {members.filter(m => m.relation === 'kakek' || m.relation === 'nenek').slice(0, 4).map(m => (
                        <div key={m.id} className="bg-white p-2 rounded-lg border border-emerald-200 shadow-2xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white shrink-0 ${m.gender === 'L' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                              {m.photo ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" /> : m.name.slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-900 truncate">{m.name}</p>
                              <p className="text-[9px] text-slate-500">{m.kinshipTitle} • {getYearRangeDisplay(m)}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            <button onClick={() => handleShiftMemberOrder(m.id, 'left')} className="p-0.5 text-slate-400 hover:text-emerald-700" title="Geser">
                              <MoveLeft className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleShiftMemberOrder(m.id, 'right')} className="p-0.5 text-slate-400 hover:text-emerald-700" title="Geser">
                              <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SVG Garis Penghubung Generasi 2 ke 3 */}
                  <div className="w-full flex justify-center py-0.5">
                    <div className="w-0.5 h-4 bg-emerald-400"></div>
                  </div>

                  {/* Generasi Orang Tua & Anak */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-emerald-900 uppercase block">3. Tingkat Keluarga Inti &amp; Anak</span>
                    <div className="grid grid-cols-2 gap-2">
                      {members.filter(m => m.relation === 'ayah' || m.relation === 'ibu' || m.relation === 'anak').slice(0, 4).map(m => (
                        <div key={m.id} className="bg-white p-2 rounded-lg border border-emerald-200 shadow-2xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-emerald-700 text-white overflow-hidden flex items-center justify-center text-xs font-bold shrink-0">
                              {m.photo ? <img src={m.photo} alt={m.name} className="w-full h-full object-cover" /> : m.name.slice(0, 2)}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[11px] font-bold text-slate-900 truncate">{m.name}</p>
                              <p className="text-[9px] text-slate-500">{m.kinshipTitle || m.role} • {getYearRangeDisplay(m)}</p>
                            </div>
                          </div>
                          <div className="flex gap-0.5">
                            <button onClick={() => handleShiftMemberOrder(m.id, 'left')} className="p-0.5 text-slate-400 hover:text-emerald-700" title="Geser">
                              <MoveLeft className="w-3 h-3" />
                            </button>
                            <button onClick={() => handleShiftMemberOrder(m.id, 'right')} className="p-0.5 text-slate-400 hover:text-emerald-700" title="Geser">
                              <MoveRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= MODEL 2: MODEL KARTU KELUARGA KOMPAK ================= */}
              {bukuTreeModel === 'keluarga_kompak' && (
                <div className="space-y-3 bg-[#f0fdf4] p-3 rounded-xl border border-emerald-200">
                  <div className="flex justify-between items-center border-b border-emerald-200 pb-1.5">
                    <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      Model 2: Kartu Unit Keluarga Kompak
                    </span>
                    <span className="text-[9px] text-emerald-700 font-bold">Pasangan &amp; Cabang Anak</span>
                  </div>

                  {/* Unit Keluarga 1: Abah Karta & Emak Rohanah */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-emerald-900">Unit Trah Kuningan: Abah Karta</span>
                      <span className="text-[9px] text-slate-500">Cilimus, Kuningan</span>
                    </div>
                    <div className="flex items-center justify-around bg-emerald-50/60 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                          {members.find(m => m.name.includes('Karta'))?.photo ? (
                            <img src={members.find(m => m.name.includes('Karta'))?.photo} alt="Abah Karta" className="w-full h-full object-cover" />
                          ) : 'AK'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Abah Karta</p>
                          <p className="text-[9px] text-slate-500">Lahir 1948</p>
                        </div>
                      </div>
                      <span className="text-emerald-700 font-bold text-xs">+</span>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                          {members.find(m => m.name.includes('Rohanah'))?.photo ? (
                            <img src={members.find(m => m.name.includes('Rohanah'))?.photo} alt="Emak Rohanah" className="w-full h-full object-cover" />
                          ) : 'ER'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">Emak Rohanah</p>
                          <p className="text-[9px] text-slate-500">1952 - 2019 (Wafat)</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-600">
                      <strong>Anak-Anak:</strong> Hendriana (Bageur), Mang Dede Supriatna
                    </p>
                  </div>

                  {/* Unit Keluarga 2: Keluarga Inti (Dinamis dari mainHead, mainSpouse & mainChildren) */}
                  <div className="bg-white p-3 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-emerald-900">
                        Unit Keluarga Inti: {mainHead?.name || 'Kepala Keluarga'}
                      </span>
                      <span className="text-[9px] text-slate-500 max-w-[150px] truncate">
                        {mainHead?.address || 'Nanggerang Indah Residence'}
                      </span>
                    </div>
                    <div className="flex items-center justify-around bg-emerald-50/60 p-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                          {mainHead?.photo ? (
                            <img src={mainHead.photo} alt={mainHead.name} className="w-full h-full object-cover" />
                          ) : (
                            (mainHead?.name || 'HB').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{mainHead?.name || 'Kepala Keluarga'}</p>
                          <p className="text-[9px] text-slate-500">Lahir {mainHead?.birthYear || '1985'}</p>
                        </div>
                      </div>
                      <span className="text-emerald-700 font-bold text-xs">+</span>
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-pink-600 text-white font-bold flex items-center justify-center text-xs overflow-hidden">
                          {mainSpouse?.photo ? (
                            <img src={mainSpouse.photo} alt={mainSpouse.name} className="w-full h-full object-cover" />
                          ) : (
                            (mainSpouse?.name || 'SN').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{mainSpouse?.name || 'Istri'}</p>
                          <p className="text-[9px] text-slate-500">Lahir {mainSpouse?.birthYear || '1988'}</p>
                        </div>
                      </div>
                    </div>
                    <div className="pt-1">
                      <span className="text-[9px] font-bold text-slate-700 block mb-1">
                        Daftar Anak Terdaftar ({mainChildren.length} Orang):
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {mainChildren.map((ch, idx) => (
                          <div key={ch.id} className="bg-white p-1.5 rounded border border-emerald-100 flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[9px] font-bold flex items-center justify-center">
                              {idx + 1}
                            </span>
                            <span className="text-[10px] font-bold text-slate-800 truncate">
                              {ch.name} ({ch.birthYear})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions: Cetak Kertas Terpilih & Unduh */}
            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  window.print?.();
                  showNotification(`Membuka dialog cetak format Kertas ${paperSize} (300 DPI Ultra Sharp)...`);
                }}
                className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Ukuran Kertas {paperSize} (PDF)</span>
              </button>
              <button
                onClick={() => {
                  showNotification(`Bagan Silsilah Kertas ${paperSize} berhasil diunduh!`);
                  setShowPdfModal(false);
                }}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh Gambar</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-bold text-white shadow-xs shrink-0 overflow-hidden ${selectedMember.gender === 'L' ? 'bg-blue-600' : 'bg-pink-600'}`}>
                {selectedMember.photo ? (
                  <img src={selectedMember.photo} alt={selectedMember.name} className="w-full h-full object-cover" />
                ) : (
                  selectedMember.name.slice(0, 2).toUpperCase()
                )}
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
                  {selectedMember.trah === 'ayah' ? 'Trah Ayah (Kuningan)' : selectedMember.trah === 'ibu' ? 'Trah Ibu (Bogor)' : 'Keluarga Inti'}
                </span>
              </div>
              {selectedMember.notes && (
                <div className="pt-1">
                  <span className="text-[10px] text-slate-500 block">Catatan Silsilah:</span>
                  <p className="text-[11px] text-slate-700 italic mt-0.5">{selectedMember.notes}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
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
      {/* MODAL: KONFIRMASI BERSIHKAN / RESET MOCK DATA */}
      {showResetConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-4 space-y-3.5 shadow-2xl relative border border-rose-100 text-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Bersihkan Semua Mock Data?</h3>
                <p className="text-[10px] text-rose-600 font-bold">Reset Total Pohon Silsilah &amp; KK</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-rose-50/60 p-3 rounded-xl border border-rose-200">
              Tindakan ini akan mengosongkan semua data silsilah keluarga, data kartu keluarga (KK), dan riwayat linimasa postingan. Silsilah akan menjadi bersih untuk diisi dari awal secara offline.
            </p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleClearAllMockData}
                className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2.5 rounded-xl shadow transition flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Semua</span>
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirmModal(false)}
                className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
