import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Copy, 
  Check, 
  QrCode, 
  Upload, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Download,
  Maximize2,
  FileCheck
} from 'lucide-react';
import { GCashPaymentConfig } from '../../types';
import { generateGCashQRSvg } from '../../utils/gcashHelper';

interface GCashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  gcashConfig: GCashPaymentConfig;
  amount: number;
  label?: string;
  bookingRef?: string;
  onProofUploaded?: (proofDataUrl: string, refNumber?: string) => void;
  showToast?: (msg: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
}

export const GCashPaymentModal: React.FC<GCashPaymentModalProps> = ({
  isOpen,
  onClose,
  gcashConfig,
  amount,
  label = 'Payment Deposit',
  bookingRef,
  onProofUploaded,
  showToast
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isZoomedQR, setIsZoomedQR] = useState(false);
  const [refInput, setRefInput] = useState('');
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeQrCode = gcashConfig.qrCodeUrl || generateGCashQRSvg({
    accountName: gcashConfig.accountName,
    accountNumber: gcashConfig.accountNumber,
    amount,
  });

  const handleCopy = (text: string, fieldName: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      showToast?.(`Copied ${fieldName} (${text}) to clipboard!`, 'success');
      setTimeout(() => setCopiedField(null), 2500);
    } catch {
      showToast?.(`Copied to clipboard`, 'success');
    }
  };

  const handleUploadProof = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProofPreview(dataUrl);
      const generatedRef = refInput.trim() || `GCASH-${Math.floor(10000000 + Math.random() * 90000000)}`;
      onProofUploaded?.(dataUrl, generatedRef);
      showToast?.('GCash payment receipt attached successfully!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const cleanMobile = gcashConfig.accountNumber.replace(/[^0-9]/g, '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-stone-900 border border-blue-500/40 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col text-stone-100 relative max-h-[92vh] overflow-hidden"
      >
        
        {/* Modal Header with GCash Branding */}
        <div className="shrink-0 bg-gradient-to-r from-[#005CE6] via-[#004dc2] to-[#003399] p-5 text-white flex items-center justify-between relative shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg text-[#005CE6] font-black text-xl shrink-0">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight">GCash Scan to Pay</span>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
                  Verified Depot
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Official rental payment & reservation deposit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Amount Callout Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30">
            <div>
              <span className="text-[10px] text-blue-300 font-medium uppercase tracking-wider block">
                {label} {bookingRef ? `· ${bookingRef}` : ''}
              </span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">
                ₱{amount.toLocaleString()}
              </span>
            </div>
            
            {/* Direct Mobile Deep Link Button */}
            <a
              href="gcash://"
              onClick={() => {
                handleCopy(cleanMobile, 'GCash Mobile Number');
                showToast?.('Launching GCash app... Account number copied to clipboard!', 'info');
              }}
              className="py-2.5 px-3.5 rounded-xl bg-[#005CE6] hover:bg-[#004dc2] active:scale-95 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all shrink-0"
              title="Open GCash Mobile App"
            >
              <Smartphone className="w-4 h-4" />
              <span>Launch GCash App</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          </div>

          {/* QR Code and Account Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            
            {/* Scannable QR Code */}
            <div className="sm:col-span-5 flex flex-col items-center">
              <div 
                className="relative group p-2 rounded-2xl bg-white shadow-xl border border-stone-300 max-w-[190px] w-full aspect-[340/460] flex items-center justify-center cursor-pointer overflow-hidden transition-transform hover:scale-[1.02]"
                onClick={() => setIsZoomedQR(true)}
                title="Click to view large QR"
              >
                <img
                  src={activeQrCode}
                  alt="GCash Payment QR Code"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-blue-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1">
                  <Maximize2 className="w-5 h-5" />
                  <span>Click to Zoom</span>
                </div>
              </div>
              <span className="text-[10px] text-stone-400 mt-1.5 flex items-center gap-1 font-mono">
                <QrCode className="w-3 h-3 text-blue-400" />
                Scan using GCash app
              </span>
            </div>

            {/* Account Details & 1-Click Copy */}
            <div className="sm:col-span-7 space-y-3">
              
              {/* Account Name */}
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                  GCash Account Name
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-bold text-stone-100 font-mono truncate">
                    {gcashConfig.accountName}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(gcashConfig.accountName, 'Account Name')}
                    className="p-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white transition-colors flex items-center gap-1 text-[11px] shrink-0"
                  >
                    {copiedField === 'Account Name' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Mobile Number */}
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                  GCash Mobile Number
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm sm:text-base font-black text-blue-400 font-mono tracking-wider">
                    {gcashConfig.accountNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(cleanMobile, 'Mobile Number')}
                    className="p-1.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1 text-[11px] font-bold shrink-0 shadow-sm"
                  >
                    {copiedField === 'Mobile Number' ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Number</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Transfer Note */}
              <div className="p-2.5 rounded-xl bg-amber-400/5 border border-amber-400/20 text-[11px] text-amber-200/90 leading-tight">
                <strong>Tip:</strong> You can also pay via any Philippine bank app (BDO, BPI, Maya, UnionBank) via <strong>InstaPay ➔ GCash</strong> using this mobile number.
              </div>
            </div>
          </div>

          {/* 3 Simple Steps */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
            <span className="text-[11px] font-bold text-stone-300 block">
              How to complete your payment:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-stone-400">
              <div className="p-2 rounded-lg bg-stone-900 border border-stone-850">
                <span className="font-bold text-blue-400 block mb-0.5">1. Open GCash</span>
                Open app and select <strong>QR Scan</strong> or <strong>Send Money</strong>.
              </div>
              <div className="p-2 rounded-lg bg-stone-900 border border-stone-850">
                <span className="font-bold text-blue-400 block mb-0.5">2. Send ₱{amount.toLocaleString()}</span>
                Transfer to <strong className="text-stone-300">{cleanMobile}</strong>.
              </div>
              <div className="p-2 rounded-lg bg-stone-900 border border-stone-850">
                <span className="font-bold text-blue-400 block mb-0.5">3. Upload Receipt</span>
                Save screenshot of confirmation and upload below.
              </div>
            </div>
          </div>

          {/* Upload Screenshot / Reference Number */}
          <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 space-y-3">
            <span className="text-xs font-bold text-stone-200 block">
              Upload GCash Transfer Receipt (Optional here / counter check)
            </span>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                placeholder="Reference No. (e.g. 1004 8921 4410)"
                className="flex-1 px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 font-mono text-xs focus:outline-none focus:border-blue-400"
              />
              <label className="py-2 px-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0 border border-stone-700">
                <Upload className="w-3.5 h-3.5 text-blue-400" />
                <span>Upload Screenshot</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadProof}
                  className="hidden"
                />
              </label>
            </div>

            {proofPreview && (
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">Payment receipt attached successfully!</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between gap-3">
          <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Depot verified GCash merchant payments</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs transition-colors"
          >
            Done
          </button>
        </div>

      </div>

      {/* Large Zoomed QR Modal */}
      {isZoomedQR && (
        <div 
          onClick={() => setIsZoomedQR(false)}
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 cursor-pointer animate-fade-in"
        >
          <div className="relative max-w-sm w-full bg-white p-4 rounded-3xl shadow-2xl">
            <button
              onClick={() => setIsZoomedQR(false)}
              className="absolute top-2 right-2 p-1.5 text-stone-600 hover:text-black rounded-full bg-stone-100"
            >
              <X className="w-4 h-4" />
            </button>
            <img
              src={activeQrCode}
              alt="Zoomed GCash QR"
              className="w-full h-auto object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
