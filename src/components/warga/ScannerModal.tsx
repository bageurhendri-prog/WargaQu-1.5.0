import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  X,
  Zap,
  ZapOff,
  RefreshCw,
  QrCode,
  Barcode,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  ShoppingBag
} from 'lucide-react';

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUsahaQu: () => void;
  showToast: (msg: string) => void;
}

export type ScanMode = 'all' | 'qris' | 'barcode' | 'warga';

interface ScannedResult {
  type: 'qris' | 'product' | 'warga';
  title: string;
  subtitle: string;
  nominal?: number;
  code: string;
  timestamp: string;
  details?: Record<string, string>;
}

export const ScannerModal: React.FC<ScannerModalProps> = ({
  isOpen,
  onClose,
  onOpenUsahaQu,
  showToast,
}) => {
  const [activeMode, setActiveMode] = useState<ScanMode>('all');
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedResult, setScannedResult] = useState<ScannedResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Play beep sound using Web Audio API
  const playScanBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.13);
    } catch {
      // Audio not permitted or supported
    }
  };

  // Start real camera when opened
  useEffect(() => {
    if (!isOpen) {
      // Stop stream if closing
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      setScannedResult(null);
      setIsScanning(true);
      return;
    }

    let isMounted = true;

    async function initCamera() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          if (isMounted) setHasCameraPermission(false);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });

        if (isMounted) {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
          setHasCameraPermission(true);
        } else {
          stream.getTracks().forEach((track) => track.stop());
        }
      } catch {
        if (isMounted) {
          setHasCameraPermission(false);
        }
      }
    }

    initCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  // Handle simulation scan
  const handleTriggerSimulation = (result: ScannedResult) => {
    playScanBeep();
    setIsScanning(false);
    setScannedResult(result);
    showToast(`Berhasil Memindai: ${result.title}`);
  };

  const handleResetScan = () => {
    setScannedResult(null);
    setIsScanning(true);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col justify-between max-w-[430px] mx-auto overflow-hidden select-none">
      {/* Top Header Bar */}
      <div className="bg-slate-900/95 backdrop-blur-md px-4 py-3.5 flex items-center justify-between border-b border-slate-800 text-white z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight">WargaQu Scanner</h3>
            <p className="text-[10px] text-emerald-400">Barcode, QRIS &amp; Kartu Warga</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTorchOn(!isTorchOn)}
            className={`p-2 rounded-full border transition ${
              isTorchOn
                ? 'bg-amber-400 border-amber-300 text-slate-950'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Flash / Torch"
          >
            {isTorchOn ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mode Selector Tabs */}
      <div className="px-4 py-2 bg-slate-950/70 flex gap-1.5 overflow-x-auto no-scrollbar z-20 border-b border-slate-800/80">
        <button
          onClick={() => setActiveMode('all')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
            activeMode === 'all'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          Semua Mode
        </button>
        <button
          onClick={() => setActiveMode('qris')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
            activeMode === 'qris'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          QRIS Iuran
        </button>
        <button
          onClick={() => setActiveMode('barcode')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
            activeMode === 'barcode'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Barcode className="w-3.5 h-3.5" />
          Barcode POS
        </button>
        <button
          onClick={() => setActiveMode('warga')}
          className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1 transition ${
            activeMode === 'warga'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Kartu Warga
        </button>
      </div>

      {/* Viewfinder / Camera View */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden bg-slate-950">
        {/* Real Video Element */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover ${
            hasCameraPermission ? 'opacity-90' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Fallback pattern when camera is simulated or desktop */}
        {!hasCameraPermission && (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-950 to-black opacity-90 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-3 animate-pulse">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-xs font-medium text-slate-300">
              Kamera Siaga Aktif (Simulasi Preview)
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Arahkan kamera ke QR Code QRIS atau Barcode Produk UMKM
            </p>
          </div>
        )}

        {/* Scan Reticle Box with Animated Laser */}
        {isScanning && !scannedResult && (
          <div className="relative w-64 h-64 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center justify-center z-10">
            {/* Reticle corner markers */}
            <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg"></div>
            <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg"></div>
            <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg"></div>
            <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg"></div>

            {/* Red / Green Scanning Laser Line */}
            <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-pulse"></div>

            <span className="text-[11px] font-mono font-medium text-emerald-300 bg-black/60 px-2.5 py-1 rounded-full border border-emerald-500/30 backdrop-blur-xs">
              Arahkan ke QR / Barcode
            </span>
          </div>
        )}

        {/* Scanned Result Pop-up Card */}
        {scannedResult && (
          <div className="absolute inset-x-4 max-w-sm mx-auto bg-slate-900/95 border border-emerald-500/50 rounded-2xl p-4 text-white shadow-2xl backdrop-blur-md z-30">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Pindai Berhasil
              </span>
              <span className="ml-auto text-[10px] text-slate-400 font-mono">
                {scannedResult.timestamp}
              </span>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 mb-3">
              <h4 className="font-bold text-sm text-white">{scannedResult.title}</h4>
              <p className="text-xs text-slate-400 mt-0.5">{scannedResult.subtitle}</p>
              {scannedResult.nominal && (
                <div className="mt-2 text-lg font-black text-emerald-400 font-mono">
                  Rp {scannedResult.nominal.toLocaleString('id-ID')}
                </div>
              )}
              <div className="mt-2 text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                KODE: {scannedResult.code}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleResetScan}
                className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Scan Ulang
              </button>
              {scannedResult.type === 'product' ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenUsahaQu();
                    showToast(`Membuka produk ${scannedResult.title} di POS Kasir`);
                  }}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  Buka di Kasir
                </button>
              ) : (
                <button
                  onClick={() => {
                    onClose();
                    showToast(`Transaksi ${scannedResult.title} berhasil diproses!`);
                  }}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Proses Bayar
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Simulation Bar / Quick Testing Buttons */}
      <div className="bg-slate-900 border-t border-slate-800 p-3 z-20 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Coba Pindai Cepat (Simulasi Kode):
          </span>
          <span className="text-[10px] text-emerald-400 font-semibold">1-Klik</span>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {/* Simulation 1: QRIS Kas RT */}
          <button
            onClick={() =>
              handleTriggerSimulation({
                type: 'qris',
                title: 'QRIS Iuran Kebersihan RT 03',
                subtitle: 'Kas RW 05 / RT 03 Kelurahan WargaQu',
                nominal: 50000,
                code: '00020101021226600016ID.CO.QRIS.WWW01189360000201100303000',
                timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              })
            }
            className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-left transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1">
              <QrCode className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[8px] bg-emerald-950 text-emerald-300 px-1 rounded font-bold">
                QRIS
              </span>
            </div>
            <div className="text-[10px] font-semibold text-slate-200 leading-tight">
              Iuran RT
            </div>
            <div className="text-[9px] text-emerald-400 font-mono">Rp 50.000</div>
          </button>

          {/* Simulation 2: Barcode Produk POS */}
          <button
            onClick={() =>
              handleTriggerSimulation({
                type: 'product',
                title: 'Bakso Urat Spesial Jumbo',
                subtitle: 'UsahaQu Bakso Qu 1.0 POS Resto',
                nominal: 25000,
                code: '8992753100234',
                timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              })
            }
            className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-left transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1">
              <Barcode className="w-3.5 h-3.5 text-sky-400" />
              <span className="text-[8px] bg-sky-950 text-sky-300 px-1 rounded font-bold">
                POS
              </span>
            </div>
            <div className="text-[10px] font-semibold text-slate-200 leading-tight">
              Bakso Urat
            </div>
            <div className="text-[9px] text-sky-400 font-mono">Rp 25.000</div>
          </button>

          {/* Simulation 3: Kartu Warga ID */}
          <button
            onClick={() =>
              handleTriggerSimulation({
                type: 'warga',
                title: 'KTP Digital: HENDRIANA',
                subtitle: 'Warga Tetap RT 03 / RW 05 - Blok A No. 12',
                code: '3273-0105-8900-0012',
                timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
              })
            }
            className="p-2 bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 rounded-xl text-left transition flex flex-col justify-between"
          >
            <div className="flex items-center justify-between mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[8px] bg-amber-950 text-amber-300 px-1 rounded font-bold">
                WARGA
              </span>
            </div>
            <div className="text-[10px] font-semibold text-slate-200 leading-tight">
              Hendriana
            </div>
            <div className="text-[9px] text-amber-400 font-mono">Blok A12</div>
          </button>
        </div>
      </div>
    </div>
  );
};
