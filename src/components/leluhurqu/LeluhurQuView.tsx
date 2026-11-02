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
  trah: 'ayah' | 'ibu' | 'inti';
  gender: 'L' | 'P';
  birthYear: string;
  deathYear?: string;
  status: 'Hidup' | 'Almarhum';
  origin?: string;
  phone?: string;
  notes?: string;
  spouses?: FamilySpouse[];
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

const DEFAULT_MEMBERS: FamilyMember[] = [
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
    status: 'Hidup',
    origin: 'Kuningan / Bogor',
    notes: 'Pemilik silsilah, tinggal di Nanggerang Indah Residence',
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
    status: 'Hidup',
    origin: 'Dramaga, Bogor'
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
    status: 'Hidup',
    origin: 'Bogor'
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
    status: 'Hidup',
    origin: 'Bogor'
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
    status: 'Hidup',
    origin: 'Cilimus, Kuningan',
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

const DEFAULT_POSTS: PostItem[] = [
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

export const LeluhurQuView: React.FC<LeluhurQuViewProps> = ({
  onBackToWarga,
  showNotification
}) => {
  // Navigation Tabs: Silsilah | OrbitQu | Medsos | Doa Malam Jumat | Arsip & Ekspor
  const [activeTab, setActiveTab] = useState<'silsilah' | 'orbitqu' | 'medsos' | 'doa' | 'arsip'>('silsilah');
  const [activeMedsosTrah, setActiveMedsosTrah] = useState<'ayah' | 'ibu'>('ayah');

  // Silsilah Data (Offline-first LocalStorage)
  const [members, setMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_leluhur_members_v2');
      return saved ? JSON.parse(saved) : DEFAULT_MEMBERS;
    } catch {
      return DEFAULT_MEMBERS;
    }
  });

  // Medsos Posts Data
  const [posts, setPosts] = useState<PostItem[]>(() => {
    try {
      const saved = localStorage.getItem('wargaqu_leluhur_posts_v2');
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
  const [formTrah, setFormTrah] = useState<'inti' | 'ayah' | 'ibu'>('inti');
  const [formGender, setFormGender] = useState<'L' | 'P'>('L');
  const [formBirthYear, setFormBirthYear] = useState('2020');
  const [formDeathYear, setFormDeathYear] = useState('');
  const [formStatus, setFormStatus] = useState<'Hidup' | 'Almarhum'>('Hidup');
  const [formOrigin, setFormOrigin] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Persist Data
  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_leluhur_members_v2', JSON.stringify(members));
    } catch (e) {
      console.error(e);
    }
  }, [members]);

  useEffect(() => {
    try {
      localStorage.setItem('wargaqu_leluhur_posts_v2', JSON.stringify(posts));
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
      notes: formNotes || undefined
    };

    setMembers(prev => [...prev, newEntry]);
    setShowAddMemberModal(false);
    // Reset form
    setFormName('');
    setFormNickname('');
    setFormBinBinti('');
    setFormNotes('');
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
