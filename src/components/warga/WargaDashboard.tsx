import React, { useState } from 'react';
import {
  Bell,
  Headphones,
  Camera,
  ShoppingBag,
  Mic,
  ChevronRight,
  Sliders,
  Home,
  Lightbulb,
  Store,
  MapPin,
  HeartHandshake,
  MessageSquare,
  Settings,
  QrCode,
  Barcode,
  History,
  Sparkles,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Receipt,
  Info,
  Newspaper
} from 'lucide-react';
import { PWAInstallBanner } from '../pwa/PWAInstallBanner';
import { ScannerModal } from './ScannerModal';

interface WargaDashboardProps {
  onOpenRtQu: () => void;
  onOpenSiagaQu: () => void;
  onOpenUsahaQu: () => void;
  onOpenModularQu: () => void;
  onOpenBantuan: () => void;
  onOpenChatQu: () => void;
  onOpenMuamalahQu: () => void;
  onOpenAreaQu: () => void;
  onOpenEmptyModule: (moduleId: string) => void;
  activeOrderCount?: number;
}

export const WargaDashboard: React.FC<WargaDashboardProps> = ({
  onOpenRtQu,
  onOpenSiagaQu,
  onOpenUsahaQu,
  onOpenModularQu,
  onOpenBantuan,
  onOpenChatQu,
  onOpenMuamalahQu,
  onOpenAreaQu,
  onOpenEmptyModule,
  activeOrderCount = 0,
}) => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 2500);
  };

  const realBalance = '2.450.000';
  const maskedBalance = '••••••••';

  const bukaScanner = () => {
    setIsScannerOpen(true);
  };

  return (
    <div className="w-full h-full bg-[#f4fbf7] overflow-hidden flex flex-col relative no-scrollbar select-none">
      {/* Header Atas (Sesuaian UI Utama WargaQu / UsahaQu) */}
      <header className="bg-[#0b7a55] text-white pt-6 pb-8 px-5 rounded-b-[2rem] shadow-md relative shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-2xl tracking-tight italic">
              warga<span className="not-italic font-normal">Qu</span>
            </span>
            <span className="bg-emerald-900/40 text-emerald-100 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-400/30">
              RT 03
            </span>
          </div>

          {/* Dynamic Action Icons (Tidak Redundan) */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => showToast('Notifikasi: Tidak ada pengumuman mendesak baru')}
              className="relative text-white hover:text-emerald-200 active:scale-95 transition"
              title="Notifikasi"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full border-2 border-[#0b7a55]"></span>
            </button>
            <button
              onClick={onOpenBantuan}
              className="text-white hover:text-emerald-200 active:scale-95 transition"
              title="Smart Customer Care"
            >
              <Headphones className="w-5 h-5 text-emerald-200" />
            </button>
            {/* Scanner Kamera (Pengganti Akun/Profil) */}
            <button
              onClick={bukaScanner}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-full active:scale-95 transition"
              title="Scan Kamera / Barcode"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div>
          <p className="text-xs text-emerald-200 tracking-wider font-semibold uppercase">HALO,</p>
          <h1 className="text-2xl font-bold tracking-wide mt-0.5">HENDRIANA</h1>
        </div>
      </header>

      {/* SCROLLABLE MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-4 -mt-4 relative z-10 space-y-4 pb-28">
        {/* PWA Direct Mobile Install Banner */}
        <PWAInstallBanner showToast={showToast} />

        {/* Banner Card Kasir Utama (Resto & Multi-Usaha) */}
        <section className="bg-[#064e3b] text-white rounded-2xl p-4 shadow-lg border border-emerald-700/50">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-emerald-300">
              FOKUS USAHAQU • POS KASIR CERDAS
            </span>
            <span className="bg-emerald-900/80 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full border border-emerald-500/30">
              Resto &amp; Multi-Usaha
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Modul 1: Bakso Qu Resto */}
            <div className="bg-emerald-950/40 border border-emerald-700/60 rounded-xl p-3 relative flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <span className="bg-emerald-500 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    MEJA
                  </span>
                </div>
                <h3 className="font-bold text-sm">Bakso Qu Resto</h3>
                <p className="text-[10px] text-emerald-200/80 mt-0.5 line-clamp-2">
                  POS Dine-in, denah meja &amp; dapur
                </p>
              </div>
              <button
                onClick={onOpenUsahaQu}
                className="text-xs font-semibold text-emerald-300 hover:text-white mt-3 inline-flex items-center gap-1 active:scale-95 transition text-left"
              >
                Buka Resto <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modul 2: POS ModularQu */}
            <div className="bg-emerald-950/40 border border-emerald-700/60 rounded-xl p-3 relative flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <Mic className="w-5 h-5 text-emerald-400" />
                  <span className="bg-emerald-500 text-slate-900 text-[9px] font-bold px-1.5 py-0.5 rounded">
                    VOICE AI
                  </span>
                </div>
                <h3 className="font-bold text-sm">POS ModularQu</h3>
                <p className="text-[10px] text-emerald-200/80 mt-0.5 line-clamp-2">
                  Voice Kasir, 4 format struk &amp; omset
                </p>
              </div>
              <button
                onClick={onOpenModularQu}
                className="text-xs font-semibold text-emerald-300 hover:text-white mt-3 inline-flex items-center gap-1 active:scale-95 transition text-left"
              >
                Buka Modular <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* Menu Utama Grid (Icon Minimalis) */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-slate-800 text-base">Menu Utama</h2>
            <button
              onClick={() => showToast('Mode Atur Menu Utama Diaktifkan')}
              className="text-xs font-semibold text-[#0b7a55] flex items-center gap-1 hover:underline active:scale-95 transition"
            >
              <Sliders className="w-3.5 h-3.5" /> Atur
            </button>
          </div>

          <div className="grid grid-cols-4 gap-y-4 gap-x-2 text-center">
            {/* Row 1 */}
            {/* 1. RtQu */}
            <button
              onClick={onOpenRtQu}
              className="flex flex-col items-center group active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0b7a55] flex items-center justify-center border border-emerald-200/50 mb-1 shadow-xs group-hover:scale-105 transition">
                <Home className="w-5 h-5 text-[#0b7a55]" />
              </div>
              <span className="text-xs font-medium text-slate-700">RtQu</span>
            </button>

            {/* 2. SiagaQu */}
            <button
              onClick={onOpenSiagaQu}
              className="flex flex-col items-center relative group active:scale-95 transition"
            >
              <span className="absolute -top-1 right-2 bg-rose-500 text-white text-[9px] font-bold px-1 rounded-full z-10">
                SOS
              </span>
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-200/50 mb-1 shadow-xs group-hover:scale-105 transition">
                <Lightbulb className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-xs font-medium text-slate-700">SiagaQu</span>
            </button>

            {/* 3. UsahaQu (Bakso Qu) */}
            <button
              onClick={onOpenUsahaQu}
              className="flex flex-col items-center relative group active:scale-95 transition"
            >
              <span className="absolute -top-1 right-1 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded z-10">
                POS
              </span>
              {activeOrderCount > 0 && (
                <span className="absolute -top-1.5 left-1 bg-rose-600 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center z-10">
                  {activeOrderCount}
                </span>
              )}
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0b7a55] flex items-center justify-center border border-emerald-300 mb-1 shadow-xs group-hover:scale-105 transition">
                <ShoppingBag className="w-5 h-5 text-[#0b7a55]" />
              </div>
              <span className="text-xs font-medium text-slate-700 leading-tight">
                UsahaQu
                <br />
                <span className="text-[9px] text-slate-400">Bakso Qu</span>
              </span>
            </button>

            {/* 4. ModularQu (Voice POS) */}
            <button
              onClick={onOpenModularQu}
              className="flex flex-col items-center relative group active:scale-95 transition"
            >
              <span className="absolute -top-1 right-0 bg-emerald-600 text-white text-[8px] font-bold px-1 rounded z-10">
                MODULAR
              </span>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-300 mb-1 shadow-xs group-hover:scale-105 transition">
                <Store className="w-5 h-5 text-emerald-700" />
              </div>
              <span className="text-xs font-medium text-slate-700 leading-tight">
                ModularQu
                <br />
                <span className="text-[9px] text-slate-400">Voice POS</span>
              </span>
            </button>

            {/* Row 2 */}
            {/* 5. AreaQu */}
            <button
              onClick={onOpenAreaQu}
              className="flex flex-col items-center group active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0b7a55] flex items-center justify-center border border-emerald-200/50 mb-1 shadow-xs group-hover:scale-105 transition">
                <MapPin className="w-5 h-5 text-[#0b7a55]" />
              </div>
              <span className="text-xs font-medium text-slate-700">AreaQu</span>
            </button>

            {/* 6. MuamalahQu */}
            <button
              onClick={onOpenMuamalahQu}
              className="flex flex-col items-center group active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0b7a55] flex items-center justify-center border border-emerald-200/50 mb-1 shadow-xs group-hover:scale-105 transition">
                <HeartHandshake className="w-5 h-5 text-[#0b7a55]" />
              </div>
              <span className="text-xs font-medium text-slate-700">MuamalahQu</span>
            </button>

            {/* 7. ChatQu */}
            <button
              onClick={onOpenChatQu}
              className="flex flex-col items-center relative group active:scale-95 transition"
            >
              <span className="absolute -top-1 right-2 bg-emerald-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center z-10">
                3
              </span>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0b7a55] flex items-center justify-center border border-emerald-200/50 mb-1 shadow-xs group-hover:scale-105 transition">
                <MessageSquare className="w-5 h-5 text-[#0b7a55]" />
              </div>
              <span className="text-xs font-medium text-slate-700">ChatQu</span>
            </button>

            {/* 8. Setting */}
            <button
              onClick={() => onOpenEmptyModule('setting')}
              className="flex flex-col items-center group active:scale-95 transition"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#0b7a55] flex items-center justify-center border border-emerald-200/50 mb-1 shadow-xs group-hover:scale-105 transition">
                <Settings className="w-5 h-5 text-[#0b7a55]" />
              </div>
              <span className="text-xs font-medium text-slate-700">Setting</span>
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-4">
            <span className="w-5 h-1.5 bg-[#0b7a55] rounded-full"></span>
            <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
          </div>
        </section>

        {/* Banner Bayar Iuran / WargaPay */}
        <section
          onClick={bukaScanner}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-emerald-100 flex items-center justify-between cursor-pointer hover:bg-emerald-50/60 active:scale-[0.99] transition"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <QrCode className="w-5 h-5 text-[#0b7a55]" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-xs">Bayar Iuran via WargaPay</h4>
              <p className="text-[10px] text-slate-500">Scan QRIS atau Transfer Otomatis</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </section>

        {/* Saldo Kas & Iuran Warga (Komponen Ringkas) */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100">
          <div className="flex justify-between items-center pb-2.5 border-b border-emerald-50">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#0b7a55] px-2.5 py-1 rounded-lg text-xs font-semibold border border-emerald-200/60">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0b7a55]" />
              <span>ID WARGA: RT 03 / RW 05</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">Blok A No. 12</span>
          </div>

          <div className="pt-3 pb-2 flex justify-between items-center">
            <div>
              <span className="text-xs font-medium text-slate-500">Total Iuran Masuk (Kas RT)</span>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-sm font-bold text-[#0b7a55]">IDR</span>
                <span className="text-xl font-extrabold text-slate-800 tracking-tight font-mono">
                  {isBalanceHidden ? maskedBalance : realBalance}
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsBalanceHidden(!isBalanceHidden)}
              className="text-[#0b7a55] hover:text-emerald-800 p-2 rounded-lg bg-emerald-50 transition active:scale-95"
              title="Sembunyikan / Tampilkan Saldo"
            >
              {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <div className="pt-2 border-t border-emerald-50 flex justify-between items-center text-xs font-semibold text-[#0b7a55]">
            <button
              onClick={() => onOpenEmptyModule('riwayat_iuran')}
              className="flex items-center gap-1.5 hover:underline"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Lihat Riwayat Kas &amp; Iuran</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
          </div>
        </section>

        {/* Kabar & Info Warga RT 03 */}
        <section className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 space-y-2.5">
          <h3 className="font-bold text-[#0b7a55] text-xs uppercase tracking-wider">Kabar RT 03</h3>
          <div
            onClick={() => showToast('Membuka pengumuman: Jadwal Ronda & Gotong Royong RT 03')}
            className="flex gap-3 items-center cursor-pointer hover:bg-emerald-50/40 p-1.5 rounded-xl transition"
          >
            <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-lg shrink-0 flex items-center justify-center text-[#0b7a55]">
              <Newspaper className="w-5 h-5 text-[#0b7a55]" />
            </div>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-800 line-clamp-1">
                Jadwal Ronda Malam &amp; Gotong Royong Minggu Ini
              </p>
              <p className="text-[10px] text-slate-400">2 Jam yang lalu • Pengurus RT</p>
            </div>
          </div>
        </section>
      </main>

      {/* Navbar Bawah Sticky dengan Central Barcode/Scanner Floating */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-2 flex justify-between items-center z-40 shadow-lg">
        {/* Beranda */}
        <button
          onClick={() => showToast('Anda sedang di Beranda')}
          className="flex flex-col items-center text-[#0b7a55] w-14 active:scale-95 transition"
        >
          <Home className="w-5 h-5 text-[#0b7a55]" />
          <span className="text-[10px] font-bold mt-0.5">Beranda</span>
        </button>

        {/* Aktivitas */}
        <button
          onClick={() => onOpenEmptyModule('aktivitas')}
          className="flex flex-col items-center text-slate-400 hover:text-[#0b7a55] w-14 active:scale-95 transition"
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Aktivitas</span>
        </button>

        {/* Central Scanner / Barcode Floating Button */}
        <div className="relative -top-5 flex flex-col items-center">
          <button
            onClick={bukaScanner}
            className="w-14 h-14 bg-[#0b7a55] text-white rounded-full flex flex-col items-center justify-center shadow-lg hover:bg-emerald-700 transition border-4 border-[#f4fbf7] active:scale-95"
            title="Scan Barcode / QRIS"
          >
            <Barcode className="w-6 h-6 text-white" />
          </button>
          <span className="text-[10px] font-bold text-[#0b7a55] block text-center mt-0.5">
            SCANNER
          </span>
        </div>

        {/* Untukmu */}
        <button
          onClick={() => onOpenEmptyModule('untukmu')}
          className="flex flex-col items-center text-slate-400 hover:text-[#0b7a55] w-14 active:scale-95 transition"
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Untukmu</span>
        </button>

        {/* Akun Saya */}
        <button
          onClick={() => onOpenEmptyModule('akun')}
          className="flex flex-col items-center text-slate-400 hover:text-[#0b7a55] w-14 active:scale-95 transition"
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Akun Saya</span>
        </button>
      </nav>

      {/* Interactive In-App Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onOpenUsahaQu={onOpenUsahaQu}
        showToast={showToast}
      />

      {/* TOAST NOTIFICATION CONTAINER */}
      <div
        className={`absolute top-10 left-1/2 -translate-x-1/2 bg-emerald-950/95 text-[#5eead4] border border-emerald-500/50 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md shadow-xl z-50 flex items-center gap-2 transition-all duration-300 pointer-events-none ${
          toastMessage ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
      >
        <Info className="w-4 h-4 text-[#5eead4]" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
