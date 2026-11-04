import React, { useState } from 'react';
import { Reservation, Motorbike } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  MessageSquare, 
  Send, 
  Copy, 
  Check, 
  Sparkles, 
  Phone, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Zap,
  Smartphone,
  Facebook,
  Instagram
} from 'lucide-react';

interface QuickChatModalProps {
  reservation: Reservation;
  bike?: Motorbike;
  isOpen: boolean;
  onClose: () => void;
}

export const QuickChatModal: React.FC<QuickChatModalProps> = ({
  reservation,
  bike,
  isOpen,
  onClose,
}) => {
  const { currentBusiness, showToast, sendChatMessage, chatThreads } = useApp();

  // Preferred contact mode defaults to reservation's setting or 'sms'
  const initialMode = reservation.preferredContactMode || 'sms';
  const [selectedChannel, setSelectedChannel] = useState<'sms' | 'whatsapp' | 'facebook' | 'instagram'>(initialMode);
  
  // Contact handle default based on channel
  const [contactHandle, setContactHandle] = useState<string>(() => {
    if (reservation.preferredContactHandle) return reservation.preferredContactHandle;
    if (initialMode === 'facebook') return reservation.facebookName || reservation.customerName;
    if (initialMode === 'instagram') return `@${reservation.customerName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
    return reservation.customerPhone;
  });

  // Message templates
  const templates = [
    {
      id: 'confirm_depot',
      title: 'Booking Confirmed & Depot PIN',
      badge: 'Arrival',
      text: `Hi ${reservation.customerName}! 🛵 Greetings from ${currentBusiness.name}.\n\nYour reservation ${reservation.bookingRef} for the ${reservation.bikeName} is CONFIRMED!\n\n📅 Pickup: ${reservation.startDate} at ${reservation.startTime}\n📍 Location: ${reservation.pickupLocation}\n💰 Balance: ₱${(reservation.totalAmount - (reservation.depositPaid || 0)).toLocaleString()} (Sec. Deposit: ₱${reservation.securityDeposit.toLocaleString()})\n\nPlease bring your driver's license (Code A/A1 authorized). Arrive 5-10 mins early for quick vehicle inspection and digital handover.\n\nSee you on the road! 🌊`,
    },
    {
      id: 'bike_ready',
      title: 'Bike Staged & Ready in Bay',
      badge: 'Handover',
      text: `Hi ${reservation.customerName}! 🏁 Your ${reservation.bikeName} (Plate: ${bike?.plateNumber || 'TBA'}) is inspected, washed, and fueled up ready for you in Bay #1 at ${reservation.pickupLocation}.\n\nPlease head to the front desk whenever you arrive so our staff can hand over your keys and helmets! 🛵`,
    },
    {
      id: 'return_reminder',
      title: '1-Hour Return & Fuel Reminder',
      badge: 'Reminder',
      text: `Hi ${reservation.customerName}! ⏳ Friendly reminder that your motorbike rental is scheduled for return in 1 hour at ${reservation.endTime}.\n\n⛽ Depot Fuel Check: Please return with matching fuel levels to ensure immediate deposit clearance.\n📍 Drop-off Bay: ${reservation.dropoffLocation}\n\nDrive safe and see you shortly!`,
    },
    {
      id: 'deposit_cleared',
      title: 'Return Completed & Deposit Released',
      badge: 'Released',
      text: `Hi ${reservation.customerName}! 🎉 Thank you for renting with ${currentBusiness.name}.\n\nYour return inspection has been successfully completed with zero issues. Your security deposit of ₱${reservation.securityDeposit.toLocaleString()} has been released! 💵\n\nHope you loved exploring the coast. Tag us in your riding reels and ride safe! 🛵💨`,
    },
  ];

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('confirm_depot');
  const [customMessage, setCustomMessage] = useState<string>(templates[0].text);
  const [copied, setCopied] = useState<boolean>(false);
  const [isDispatched, setIsDispatched] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSelectTemplate = (tpl: typeof templates[0]) => {
    setSelectedTemplateId(tpl.id);
    setCustomMessage(tpl.text);
  };

  const handleChannelSwitch = (mode: 'sms' | 'whatsapp' | 'facebook' | 'instagram') => {
    setSelectedChannel(mode);
    if (mode === 'sms' || mode === 'whatsapp') {
      setContactHandle(reservation.customerPhone);
    } else if (mode === 'facebook') {
      setContactHandle(reservation.preferredContactHandle || reservation.facebookName || reservation.customerName);
    } else {
      setContactHandle(reservation.preferredContactHandle || `@${reservation.customerName.toLowerCase().replace(/[^a-z0-9]/g, '_')}`);
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    showToast('Message copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const cleanPhoneForWa = (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('09')) {
      return `63${digits.substring(1)}`;
    }
    if (digits.startsWith('63')) {
      return digits;
    }
    return `63${digits}`;
  };

  const handleDispatchQuickChat = () => {
    const encoded = encodeURIComponent(customMessage);
    const cleanPhone = reservation.customerPhone.replace(/\D/g, '');
    const waPhone = cleanPhoneForWa(reservation.customerPhone);

    // Sync to unified inbox if a thread matches or log
    const matchingThread = chatThreads.find(
      t => t.customer.name.toLowerCase() === reservation.customerName.toLowerCase() ||
           (t.customer.phone && t.customer.phone.includes(cleanPhone.slice(-7)))
    );
    if (matchingThread) {
      sendChatMessage(matchingThread.id, customMessage, 'staff', 'Depot Dispatcher');
    }

    // Launch native deep link
    if (selectedChannel === 'sms') {
      window.open(`sms:${cleanPhone}?body=${encoded}`, '_blank');
      showToast(`Opened SMS messenger for ${reservation.customerName} (${cleanPhone})!`, 'success');
    } else if (selectedChannel === 'whatsapp') {
      window.open(`https://wa.me/${waPhone}?text=${encoded}`, '_blank');
      showToast(`Opened WhatsApp chat for ${reservation.customerName} (+${waPhone})!`, 'success');
    } else if (selectedChannel === 'facebook') {
      navigator.clipboard.writeText(customMessage);
      const cleanFbHandle = contactHandle.replace(/https?:\/\/(www\.)?facebook\.com\//, '').replace(/@/, '');
      window.open(`https://m.me/${encodeURIComponent(cleanFbHandle)}`, '_blank');
      showToast(`Message copied & opened Messenger for ${cleanFbHandle}!`, 'success');
    } else if (selectedChannel === 'instagram') {
      navigator.clipboard.writeText(customMessage);
      const cleanIgHandle = contactHandle.replace(/@/, '');
      window.open(`https://ig.me/m/${encodeURIComponent(cleanIgHandle)}`, '_blank');
      showToast(`Message copied & opened Instagram DM for @${cleanIgHandle}!`, 'success');
    }

    setIsDispatched(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-6">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-100">
                  Quick Chat with Renter
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Breezy 1-Click
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Direct dispatch to {reservation.customerName} ({reservation.bookingRef})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* Renter Preferred Communication Mode Indicator */}
          <div className="p-3.5 rounded-xl bg-gradient-to-r from-stone-950 to-stone-900 border border-stone-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                  Renter's Preferred Communication Mode:
                </span>
                {reservation.preferredContactMode ? (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold uppercase font-mono bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    ⭐ {reservation.preferredContactMode}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] text-stone-400 bg-stone-800">
                    Default: SMS / WhatsApp
                  </span>
                )}
              </div>

              <div className="text-[11px] text-stone-400 font-mono">
                {reservation.bikeName} · {reservation.startDate}
              </div>
            </div>

            {/* Channel Selectors */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleChannelSwitch('sms')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                  selectedChannel === 'sms'
                    ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold shadow-md'
                    : 'bg-stone-950/70 text-stone-300 border-stone-800 hover:border-stone-700'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>📱 SMS (Text)</span>
              </button>

              <button
                type="button"
                onClick={() => handleChannelSwitch('whatsapp')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                  selectedChannel === 'whatsapp'
                    ? 'bg-emerald-500 text-white border-emerald-400 font-bold shadow-md'
                    : 'bg-stone-950/70 text-stone-300 border-stone-800 hover:border-stone-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 fill-current" />
                <span>💬 WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={() => handleChannelSwitch('facebook')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                  selectedChannel === 'facebook'
                    ? 'bg-[#0084FF] text-white border-blue-400 font-bold shadow-md'
                    : 'bg-stone-950/70 text-stone-300 border-stone-800 hover:border-stone-700'
                }`}
              >
                <Facebook className="w-4 h-4 fill-current" />
                <span>🔵 Messenger</span>
              </button>

              <button
                type="button"
                onClick={() => handleChannelSwitch('instagram')}
                className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${
                  selectedChannel === 'instagram'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400 font-bold shadow-md'
                    : 'bg-stone-950/70 text-stone-300 border-stone-800 hover:border-stone-700'
                }`}
              >
                <Instagram className="w-4 h-4" />
                <span>📸 Instagram</span>
              </button>
            </div>

            {/* Address / Handle display */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-stone-400">Target Handle / Phone:</span>
              <input
                type="text"
                value={contactHandle}
                onChange={(e) => setContactHandle(e.target.value)}
                placeholder={selectedChannel === 'instagram' ? '@username' : 'Mobile or username'}
                className="flex-1 px-2.5 py-1 bg-stone-900 border border-stone-800 rounded font-mono text-[11px] text-stone-200 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Quick Pre-Set Templates */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Breezy Message Templates:</span>
              </span>
              <span className="text-[10px] text-stone-500">Click to autofill message</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => handleSelectTemplate(tpl)}
                  className={`p-2.5 rounded-lg border text-left transition-colors ${
                    selectedTemplateId === tpl.id
                      ? 'bg-stone-800 border-amber-400 text-stone-100 shadow-sm'
                      : 'bg-stone-950 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-400">
                      {tpl.badge}
                    </span>
                  </div>
                  <div className="font-semibold text-[11px] line-clamp-1">{tpl.title}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Editable Message Box */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-stone-400 font-medium">Message Body (Live Preview & Editable)</label>
              <button
                type="button"
                onClick={handleCopyText}
                className="text-[11px] text-stone-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Text'}</span>
              </button>
            </div>

            <textarea
              rows={6}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="w-full p-3 bg-stone-950 border border-stone-800 rounded-xl text-stone-200 text-xs font-mono leading-relaxed focus:outline-none focus:border-amber-400"
              placeholder="Type custom note to renter..."
            />
          </div>

          {/* Delivery Note */}
          <div className="p-2.5 rounded-lg bg-stone-950 border border-stone-800/80 text-[11px] text-stone-400 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 truncate">
              <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">
                Staff: Quick Chat opens native app / chat window instantly with zero setup
              </span>
            </div>
            <span className="text-emerald-400 font-mono text-[10px] shrink-0 font-semibold">
              ✓ Ready
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-stone-950 border-t border-stone-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-stone-200 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 font-semibold text-xs flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>Copy</span>
            </button>

            <button
              type="button"
              onClick={handleDispatchQuickChat}
              disabled={isDispatched}
              className={`px-5 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-md transition-all ${
                selectedChannel === 'whatsapp'
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                  : selectedChannel === 'facebook'
                  ? 'bg-[#0084FF] hover:bg-[#0077e6] text-white'
                  : selectedChannel === 'instagram'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                  : 'bg-amber-400 hover:bg-amber-300 text-stone-950'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>
                {isDispatched ? 'Dispatched! ✓' : `Breezy Send via ${
                  selectedChannel === 'sms' ? 'SMS 📱' :
                  selectedChannel === 'whatsapp' ? 'WhatsApp 💬' :
                  selectedChannel === 'facebook' ? 'Messenger 🔵' : 'Instagram 📸'
                }`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
