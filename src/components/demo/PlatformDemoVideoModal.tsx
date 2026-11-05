import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2, 
  Sparkles, 
  CheckCircle2, 
  Camera, 
  FileSpreadsheet, 
  MessageSquare, 
  Fuel, 
  QrCode, 
  ChevronRight, 
  ArrowRight,
  ShieldCheck,
  Bike
} from 'lucide-react';

interface PlatformDemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenConsoleDemo?: () => void;
}

interface DemoChapter {
  id: string;
  title: string;
  timestamp: string;
  icon: any;
  summary: string;
  badge: string;
  details: string[];
  mockupImg: string;
}

const DEMO_CHAPTERS: DemoChapter[] = [
  {
    id: 'inspection',
    title: '360° Digital Inspections & Waivers',
    timestamp: '0:15',
    icon: Camera,
    badge: 'Dispute Elimination',
    summary: 'Capture front, left, right, rear condition photos, exact fuel bars, and digital renter signatures before handover.',
    details: [
      'Standardized 4-point photo capture prevents post-trip scratch disputes',
      'Renter digital fingerprint signature legally bound to PDF contract',
      'LTO Official Receipt & Registration Certificate auto-attached for road checkpoints',
      'Customer driver license & selfie verification held in secure custody'
    ],
    mockupImg: '/assets/images/bike_touring_scooter_1793338342942.jpg'
  },
  {
    id: 'sheets',
    title: 'Google Sheets Live Master Database',
    timestamp: '1:10',
    icon: FileSpreadsheet,
    badge: 'Real-Time Sync',
    summary: 'Every booking, cashflow entry, and vehicle odometer automatically live-updates in your private Google Sheets spreadsheet.',
    details: [
      'Master Ledger live database auto-created under your authorized Gmail',
      'Tabs for Bookings_Database, Daily_Revenue, Fuel_Deficits, and CRM',
      'Exportable to Microsoft Excel (CSV with UTF-8 BOM), PDF, and Word',
      'No proprietary lock-in: your business fully owns all data'
    ],
    mockupImg: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'inbox',
    title: 'Omnichannel Social Inbox',
    timestamp: '1:50',
    icon: MessageSquare,
    badge: '6-Platform Messaging',
    summary: 'Manage incoming renter inquiries from Messenger, WhatsApp, Instagram, TikTok, Viber, and Telegram in one screen.',
    details: [
      'Unified chat inbox routing customer inquiries across all active channels',
      'Instant AI-assisted quotes and policy explanations with 1-click dispatch',
      'Deep links generate pre-filled wa.me, m.me, and viber:// direct chat URLs',
      'Real-time unread counter badge prevents lost tourist inquiries'
    ],
    mockupImg: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'fuel',
    title: 'Fuel Bar Auto-Reconciliation',
    timestamp: '2:30',
    icon: Fuel,
    badge: 'Instant Settlement',
    summary: 'Automatic per-bar deficit penalty calculation when a motorbike is returned below pickup fuel level.',
    details: [
      'Digital 8-bar digital gauge verification on pickup and return',
      'Calculates deficit penalty (e.g., 2 missing bars × ₱100 = ₱200) automatically',
      'Deducted directly from deposit before security release',
      'Customer receives receipt breakdown explaining exact fuel shortage'
    ],
    mockupImg: '/assets/images/bike_adventure_dual_1793338342581.jpg'
  },
  {
    id: 'payments',
    title: 'GCash & PayMaya Direct Payouts',
    timestamp: '3:05',
    icon: QrCode,
    badge: '0% Commission',
    summary: 'Renters scan your personal or merchant GCash/Maya QR Ph to deposit directly into your mobile wallet.',
    details: [
      'QR Ph compatible with all Philippine digital banks and e-wallets',
      'Instant counter verification with payer reference numbers and slip upload',
      '0% platform transaction cut during your 30-day free trial',
      'Clear split between daily rental fee and refundable security deposit'
    ],
    mockupImg: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800&auto=format&fit=crop&q=80'
  }
];

export const PlatformDemoVideoModal: React.FC<PlatformDemoVideoModalProps> = ({
  isOpen,
  onClose,
  onOpenConsoleDemo
}) => {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(35); // simulated playback percentage
  const currentChapter = DEMO_CHAPTERS[activeChapterIndex];

  // Auto-advance simulated playback
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // loop back or advance chapter
          setActiveChapterIndex((c) => (c + 1) % DEMO_CHAPTERS.length);
          return 5;
        }
        return prev + 1;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md animate-fade-in p-3 sm:p-6 flex items-start sm:items-center justify-center">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl max-w-4xl w-full shadow-2xl flex flex-col text-stone-100 relative my-auto overflow-hidden max-h-[92vh]"
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors z-30"
          title="Close Demo"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="shrink-0 p-5 border-b border-stone-800 pr-14 bg-stone-900/90 backdrop-blur-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-500/20">
              <Play className="w-5 h-5 fill-stone-950 stroke-none ml-0.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded">
                  Interactive Platform Tour
                </span>
                <span className="text-[10px] text-emerald-400 font-mono">
                  Full Feature Walkthrough (3:45)
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-stone-100 mt-0.5">
                Rideout Rentals Operations & Fleet System Demo
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* Main Video Presentation Player Stage */}
          <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-stone-800 aspect-video shadow-2xl group flex flex-col justify-between">
            {/* Background Simulated Video Imagery */}
            <div className="absolute inset-0 z-0">
              <img
                src={currentChapter.mockupImg}
                alt={currentChapter.title}
                className="w-full h-full object-cover opacity-60 filter brightness-95 transform scale-105 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60" />
            </div>

            {/* Top Video HUD Information */}
            <div className="relative z-10 p-4 sm:p-5 flex items-start justify-between">
              <div className="space-y-1 max-w-md">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-amber-400/30 text-[11px] font-bold text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span>DEMO PLAYING · CHAPTER {activeChapterIndex + 1} OF {DEMO_CHAPTERS.length}</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-black text-white drop-shadow-md">
                  {currentChapter.title}
                </h4>
                <p className="text-xs text-stone-300 drop-shadow line-clamp-2">
                  {currentChapter.summary}
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-lg bg-black/80 text-white font-mono text-xs border border-stone-700">
                {currentChapter.timestamp}
              </span>
            </div>

            {/* Simulated Live Inspection / Data Overlay */}
            <div className="relative z-10 px-5 max-w-sm hidden sm:block">
              <div className="p-3 rounded-xl bg-stone-950/85 backdrop-blur-md border border-stone-700/80 text-xs space-y-1.5 shadow-xl">
                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>DISPATCH RADAR</span>
                  <span className="text-emerald-400 font-bold">LIVE TELEMETRY</span>
                </div>
                <div className="font-bold text-stone-200 text-xs">
                  Yamaha NMAX 155 ABS · Plate: NB 8492
                </div>
                <div className="flex items-center gap-2 text-[10px] text-stone-300">
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold">
                    Fuel 8/8 Full
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                    Google Drive Synced
                  </span>
                </div>
              </div>
            </div>

            {/* Video Controls Bottom Bar */}
            <div className="relative z-10 p-3 sm:p-4 bg-gradient-to-t from-black via-black/90 to-transparent space-y-2">
              {/* Scrub Progress Bar */}
              <div 
                className="w-full bg-stone-800/80 h-1.5 rounded-full overflow-hidden cursor-pointer relative"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newPercent = (clickX / rect.width) * 100;
                  setProgress(newPercent);
                }}
              >
                <div 
                  className="bg-amber-400 h-full rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-stone-300">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white stroke-none" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  <span className="font-mono text-[11px] text-stone-400">
                    {Math.floor((progress * 225) / 100 / 60)}:
                    {String(Math.floor(((progress * 225) / 100) % 60)).padStart(2, '0')} / 3:45
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-amber-400 hidden sm:inline">
                    1080p Full HD · Interactive Guided Demo
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Chapter Selection Strip */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 font-bold block">
              Jump to Demo Chapter:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs">
              {DEMO_CHAPTERS.map((ch, idx) => {
                const isActive = activeChapterIndex === idx;
                const Icon = ch.icon;
                return (
                  <button
                    key={ch.id}
                    type="button"
                    onClick={() => {
                      setActiveChapterIndex(idx);
                      setProgress(idx * 20 + 5);
                      setIsPlaying(true);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'border-amber-400 bg-stone-800 text-white shadow-md ring-1 ring-amber-400'
                        : 'border-stone-800 bg-stone-950/80 hover:bg-stone-850 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                      <span className="font-mono text-[9px] text-stone-500">{ch.timestamp}</span>
                    </div>
                    <div className="font-bold text-[11px] truncate leading-tight">{ch.title}</div>
                    <div className="text-[9px] font-mono text-stone-500 mt-0.5">{ch.badge}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Chapter Deep-Dive Breakdown */}
          <div className="p-4 sm:p-5 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
                  {React.createElement(currentChapter.icon, { className: 'w-4 h-4' })}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-100">
                    {currentChapter.title}
                  </h4>
                  <p className="text-[11px] text-stone-400">
                    {currentChapter.summary}
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold shrink-0">
                {currentChapter.badge}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {currentChapter.details.map((point, i) => (
                <div key={i} className="flex items-start gap-2 text-stone-300 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{point}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer Action */}
        <div className="shrink-0 p-4 sm:p-5 border-t border-stone-800 bg-stone-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-400 text-center sm:text-left">
            Ready to test operations with your own depot fleet?
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-stone-400 hover:text-white transition-colors"
            >
              Close Demo
            </button>

            {onOpenConsoleDemo && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenConsoleDemo();
                }}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
              >
                <Bike className="w-4 h-4" />
                <span>Test Interactive Depot Console ➔</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
