import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { 
  Download, 
  Smartphone, 
  Monitor, 
  CheckCircle2, 
  X, 
  Share, 
  PlusSquare, 
  Sparkles, 
  Wifi, 
  Zap, 
  Layers,
  ArrowRight
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'desktop' | 'android' | 'ios'>(
    isIOS ? 'ios' : typeof navigator !== 'undefined' && /android/i.test(navigator.userAgent) ? 'android' : 'desktop'
  );
  const [installSuccess, setInstallSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } else {
      // Browser didn't fire beforeinstallprompt (e.g. desktop manual install or already prompted)
      alert("To install Rideout Rentals on your browser:\n\n1. Look at the address bar at the top.\n2. Click the 'Install App' icon (or open browser menu ➔ 'Install Rideout Rentals').");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-stone-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-2.5 flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
            <img src="/icon.svg" alt="Rideout Rentals Icon" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded">
                Standalone App
              </span>
              {isInstalled && (
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Installed
                </span>
              )}
            </div>
            <h3 className="text-lg font-bold text-stone-100 mt-0.5">
              Download Rideout Rentals App
            </h3>
            <p className="text-xs text-stone-400">
              Install as a standalone native app on Android, iPhone/iPad, Mac, and Windows PC.
            </p>
          </div>
        </div>

        {/* Standalone Benefits Banner */}
        <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-stone-950 border border-stone-800 text-[11px]">
          <div className="flex flex-col items-center text-center p-1.5">
            <Zap className="w-4 h-4 text-amber-400 mb-1" />
            <span className="font-semibold text-stone-200">Zero Lag</span>
            <span className="text-[10px] text-stone-500">Instant launch</span>
          </div>
          <div className="flex flex-col items-center text-center p-1.5 border-x border-stone-800">
            <Wifi className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="font-semibold text-stone-200">Offline Cache</span>
            <span className="text-[10px] text-stone-500">Works on the road</span>
          </div>
          <div className="flex flex-col items-center text-center p-1.5">
            <Layers className="w-4 h-4 text-blue-400 mb-1" />
            <span className="font-semibold text-stone-200">No Browser Bars</span>
            <span className="text-[10px] text-stone-500">Full immersion</span>
          </div>
        </div>

        {/* Device Selection Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-950 border border-stone-800 rounded-xl text-xs">
          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'desktop'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop / PC</span>
          </button>
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'android'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              activeTab === 'ios'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>
        </div>

        {/* Tab Content Instructions */}
        <div className="p-4 rounded-xl bg-stone-950/80 border border-stone-800/80 text-xs space-y-3">
          {activeTab === 'desktop' && (
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <p className="text-stone-300 leading-relaxed">
                  Click the <strong>"Install Standalone App"</strong> button below, or click the <Monitor className="w-3 h-3 inline text-amber-400" /> icon in your browser URL bar (Chrome, Edge, Brave).
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <p className="text-stone-300 leading-relaxed">
                  Click <strong>Install</strong> in the popup prompt.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <p className="text-stone-300 leading-relaxed">
                  Rideout Rentals will launch in its own standalone window and appear in your desktop apps / dock.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <p className="text-stone-300 leading-relaxed">
                  Open this site in Chrome on your Android smartphone or tablet.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <p className="text-stone-300 leading-relaxed">
                  Click the <strong>"Install Standalone App"</strong> button below or tap Chrome menu (⋮) ➔ <strong>"Install App"</strong> or <strong>"Add to Home screen"</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <p className="text-stone-300 leading-relaxed">
                  The Rideout Rentals icon will appear on your Android home screen and app drawer with fast offline capability.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <p className="text-stone-300 leading-relaxed">
                  Open this link in <strong>Safari</strong> on your iPhone or iPad.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <p className="text-stone-300 leading-relaxed flex items-center gap-1.5 flex-wrap">
                  Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 text-blue-400 inline" /> at the bottom of Safari.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <p className="text-stone-300 leading-relaxed flex items-center gap-1.5 flex-wrap">
                  Scroll down and tap <strong>"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 text-stone-200 inline" />.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">4</span>
                <p className="text-stone-300 leading-relaxed">
                  Tap <strong>Add</strong> in the top-right corner. Rideout Rentals will be installed directly on your home screen.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          {activeTab === 'ios' ? (
            <button
              onClick={() => {
                alert("On iOS Safari:\n\n1. Tap the Share button at the bottom of your screen.\n2. Tap 'Add to Home Screen'.\n3. Tap 'Add'.");
              }}
              className="px-5 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all"
            >
              <Share className="w-4 h-4" />
              <span>Show iOS Share Instructions</span>
            </button>
          ) : (
            <button
              onClick={handleInstallClick}
              disabled={isInstalled}
              className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 ${
                isInstalled
                  ? 'bg-emerald-500 text-stone-950 opacity-90 cursor-default'
                  : 'bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-amber-500/20'
              }`}
            >
              {isInstalled ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-stone-950" />
                  <span>Already Installed</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 stroke-[2.5]" />
                  <span>Install Standalone App</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
