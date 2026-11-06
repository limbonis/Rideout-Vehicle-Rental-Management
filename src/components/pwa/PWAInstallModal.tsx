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
  ArrowRight,
  FileCode,
  Check
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
  const [downloadedFileName, setDownloadedFileName] = useState<string | null>(null);
  const [installSuccess, setInstallSuccess] = useState(false);
  const [inlineNotice, setInlineNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  // Function to create and download the actual standalone app launcher file
  const downloadStandaloneAppLauncher = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://rideoutrentals.netlify.app';
    const appHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Rideout Rentals - Standalone App</title>
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  <meta name="theme-color" content="#0c0a09">
  <link rel="icon" type="image/png" sizes="192x192" href="${origin}/pwa-192x192.png">
  <link rel="apple-touch-icon" href="${origin}/apple-touch-icon.png">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #0c0a09;
      color: #fafaf9;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      box-sizing: border-box;
      padding: 24px;
    }
    .card {
      background: #1c1917;
      border: 1px solid #292524;
      border-radius: 24px;
      padding: 32px 28px;
      max-width: 440px;
      width: 100%;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .logo-box {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #fbbf24, #d97706);
      border-radius: 20px;
      margin: 0 auto 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      box-shadow: 0 10px 25px rgba(245, 158, 11, 0.3);
    }
    h1 {
      font-size: 22px;
      margin: 0 0 8px;
      color: #ffffff;
      font-weight: 800;
    }
    p {
      color: #a8a29e;
      font-size: 14px;
      line-height: 1.5;
      margin: 0 0 24px;
    }
    .btn-launch {
      display: block;
      width: 100%;
      padding: 14px 20px;
      background: #fbbf24;
      color: #0c0a09;
      font-weight: 700;
      font-size: 15px;
      border: none;
      border-radius: 14px;
      cursor: pointer;
      text-decoration: none;
      box-sizing: border-box;
      transition: background 0.2s;
    }
    .btn-launch:hover {
      background: #f59e0b;
    }
    .badge {
      display: inline-block;
      margin-top: 20px;
      padding: 6px 12px;
      border-radius: 8px;
      background: #292524;
      color: #fbbf24;
      font-size: 11px;
      font-family: monospace;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="logo-box">🛵</div>
    <h1>Rideout Rentals</h1>
    <p>Standalone App Launcher for Depot Console, Fleet Management & Renter Bookings.</p>
    <a href="${origin}" id="launchBtn" class="btn-launch">Open Rideout Rentals</a>
    <div class="badge">STANDALONE APP PACKAGE v2.4</div>
  </div>
  <script>
    // Auto-launch full screen application window
    function launchStandalone() {
      const targetUrl = '${origin}';
      try {
        const standaloneWin = window.open(
          targetUrl,
          'RideoutRentalsStandalone',
          'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=' + screen.availWidth + ',height=' + screen.availHeight
        );
        if (!standaloneWin || standaloneWin.closed || typeof standaloneWin.closed == 'undefined') {
          window.location.href = targetUrl;
        }
      } catch (e) {
        window.location.href = targetUrl;
      }
    }
    document.getElementById('launchBtn').addEventListener('click', function(e) {
      e.preventDefault();
      launchStandalone();
    });
    // Auto-redirect if loaded inside browser
    setTimeout(launchStandalone, 800);
  </script>
</body>
</html>`;

    const blob = new Blob([appHtmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = 'Rideout-Rentals-Standalone.html';
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadedFileName(filename);
    setInstallSuccess(true);
    setInlineNotice(`Downloaded ${filename}! You can keep this file on your desktop or device to open Rideout Rentals anytime.`);
  };

  const handleInstallClick = async () => {
    // 1. Trigger the actual standalone launcher download
    downloadStandaloneAppLauncher();

    // 2. Also trigger native Chromium prompt if available
    if (isInstallable) {
      try {
        const ok = await install();
        if (ok) {
          setInstallSuccess(true);
        }
      } catch (err) {
        console.warn('Native install prompt deferred:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-stone-100 relative my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pr-8">
          <div className="w-12 h-12 rounded-2xl bg-[#1c6170]/20 border border-[#1c6170]/40 p-2 flex items-center justify-center shadow-lg shadow-[#1c6170]/20 shrink-0">
            <img src="/assets/aistudio/rideout-icon-mark-transparent_40eb04ee.png" alt="Rideout Rentals Icon" className="w-full h-full object-contain" />
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
              Download as a standalone application package for Windows, Mac, Android, and iOS.
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

        {/* Download Feedback Banner */}
        {downloadedFileName && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs flex items-start gap-2.5 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-bold text-emerald-300">File Downloaded Successfully!</strong>
              <p className="text-[11px] text-stone-300">
                <strong>{downloadedFileName}</strong> has been saved to your Downloads folder. You can now double-click it to launch Rideout Rentals directly in standalone mode.
              </p>
            </div>
          </div>
        )}

        {/* Device Selection Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-950 border border-stone-800 rounded-xl text-xs">
          <button
            type="button"
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
            type="button"
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
            type="button"
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
                  Click the <strong>"Download Standalone App"</strong> button below to save <code>Rideout-Rentals-Standalone.html</code>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <p className="text-stone-300 leading-relaxed">
                  Move the downloaded file to your <strong>Desktop</strong> or pin it to your taskbar/dock.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <p className="text-stone-300 leading-relaxed">
                  Double-click to open Rideout Rentals in dedicated full-screen standalone mode anytime!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'android' && (
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <p className="text-stone-300 leading-relaxed">
                  Click <strong>"Download Standalone App"</strong> to download the launcher to your Android downloads.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <p className="text-stone-300 leading-relaxed">
                  Or in Chrome, tap the <strong>Menu (⋮)</strong> ➔ <strong>"Add to Home screen"</strong> or <strong>"Install App"</strong>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <p className="text-stone-300 leading-relaxed">
                  The Rideout Rentals icon appears on your home screen for quick offline-ready rental access.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'ios' && (
            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <p className="text-stone-300 leading-relaxed">
                  Open this site in <strong>Safari</strong> on your iPhone or iPad.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <p className="text-stone-300 leading-relaxed flex items-center gap-1.5 flex-wrap">
                  Tap the <strong>Share</strong> button <Share className="w-3.5 h-3.5 text-blue-400 inline" /> at the bottom.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-stone-800 text-amber-400 font-mono font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <p className="text-stone-300 leading-relaxed flex items-center gap-1.5 flex-wrap">
                  Tap <strong>"Add to Home Screen"</strong> <PlusSquare className="w-3.5 h-3.5 text-stone-200 inline" /> ➔ <strong>Add</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-white transition-colors"
          >
            Close
          </button>

          <button
            type="button"
            onClick={handleInstallClick}
            className="px-5 py-2.5 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 bg-amber-400 hover:bg-amber-300 text-stone-950 shadow-amber-500/20 active:scale-95"
          >
            <Download className="w-4 h-4 stroke-[2.5]" />
            <span>Download Standalone App (.html)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
