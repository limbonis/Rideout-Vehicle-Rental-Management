import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { OmnichannelPlatform, SocialChatThread } from '../../types/socialInbox';
import { 
  generateSocialReply, 
  getWhatsAppDirectUrl, 
  getMessengerDirectUrl, 
  getInstagramDirectUrl, 
  getTikTokDirectUrl 
} from '../../utils/aiSocialInboxHelper';
import { calculateSmartPriceDiscount } from '../../types/smartPricing';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  ExternalLink, 
  Search, 
  CheckCheck, 
  Bike, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Copy, 
  Check, 
  RefreshCw, 
  Zap, 
  Tag, 
  CornerDownLeft, 
  SlidersHorizontal,
  ChevronRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export const UnifiedInboxView: React.FC = () => {
  const { 
    chatThreads, 
    selectedThreadId, 
    setSelectedThreadId, 
    sendChatMessage, 
    markThreadRead, 
    updateThreadStatus, 
    unreadChatCount,
    bikes,
    currentBusiness,
    activeStaffUser,
    showToast
  } = useApp();

  // Filters & Search
  const [platformFilter, setPlatformFilter] = useState<'all' | OmnichannelPlatform>('all');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Active Chat Message Input
  const [inputText, setInputText] = useState('');

  // AI Assistant State
  const [aiIntent, setAiIntent] = useState<'quote' | 'deposit_policy' | 'route_recommendation' | 'license_check' | 'custom'>('quote');
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [aiTone, setAiTone] = useState<'Warm & Hospitable' | 'Quick & Informative' | 'Surf & Adventure Vibe' | 'Strict Policy Clarification'>('Warm & Hospitable');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState<string | null>(null);
  const [draftHighlights, setDraftHighlights] = useState<string[]>([]);
  const [suggestedFollowUp, setSuggestedFollowUp] = useState<string | null>(null);
  const [copiedDraft, setCopiedDraft] = useState(false);

  // Selected thread
  const activeThread = useMemo(() => {
    return chatThreads.find(t => t.id === selectedThreadId) || chatThreads[0];
  }, [chatThreads, selectedThreadId]);

  // Selected thread's bike context
  const activeBike = useMemo(() => {
    if (!activeThread?.inquiredBikeId) {
      return bikes.find(b => b.status === 'available') || bikes[0];
    }
    return bikes.find(b => b.id === activeThread.inquiredBikeId) || bikes[0];
  }, [activeThread, bikes]);

  // Smart pricing calculation for current active thread
  const smartPricingConfig = currentBusiness?.customization?.smartPricingConfig;
  const pricingResult = useMemo(() => {
    const days = activeThread?.inquiredDays || 3;
    const rate = activeBike?.dailyRate || 900;
    return calculateSmartPriceDiscount(rate, days, smartPricingConfig);
  }, [activeBike, activeThread, smartPricingConfig]);

  // Filtered thread list
  const filteredThreads = useMemo(() => {
    return chatThreads.filter(t => {
      if (platformFilter !== 'all' && t.platform !== platformFilter) return false;
      if (unreadOnly && t.unreadCount === 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = t.customer.name.toLowerCase().includes(q);
        const matchesHandle = t.customer.handle.toLowerCase().includes(q);
        const matchesTopic = t.inquiryTopic.toLowerCase().includes(q);
        const matchesLastMsg = t.lastMessageText.toLowerCase().includes(q);
        const matchesBike = t.inquiredBikeName?.toLowerCase().includes(q);
        if (!matchesName && !matchesHandle && !matchesTopic && !matchesLastMsg && !matchesBike) {
          return false;
        }
      }
      return true;
    });
  }, [chatThreads, platformFilter, unreadOnly, searchQuery]);

  const handleSelectThread = (thread: SocialChatThread) => {
    setSelectedThreadId(thread.id);
    if (thread.unreadCount > 0) {
      markThreadRead(thread.id);
    }
    setGeneratedDraft(null);
  };

  const handleSendMessage = (textToSend?: string) => {
    const content = textToSend || inputText;
    if (!content.trim() || !activeThread) return;

    sendChatMessage(
      activeThread.id,
      content.trim(),
      'staff',
      activeStaffUser?.name || 'Depot Staff'
    );
    setInputText('');
    setGeneratedDraft(null);
    showToast(`Reply dispatched to ${activeThread.customer.name} via ${activeThread.platform.toUpperCase()}!`, 'success');
  };

  const handleGenerateAiResponse = async (intentOverride?: typeof aiIntent) => {
    if (!activeThread) return;
    const intentToUse = intentOverride || aiIntent;
    setIsGeneratingAi(true);

    try {
      const response = await generateSocialReply({
        thread: activeThread,
        bike: activeBike,
        smartPricingConfig,
        intent: intentToUse,
        customInstructions: customAiPrompt,
        tone: aiTone,
      });

      setGeneratedDraft(response.replyText);
      setDraftHighlights(response.keyHighlights);
      setSuggestedFollowUp(response.suggestedFollowUp || null);
      showToast('AI response draft generated!', 'info');
    } catch (e) {
      console.error(e);
      showToast('Failed to generate AI response', 'error');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleInsertDraftToComposer = () => {
    if (generatedDraft) {
      setInputText(generatedDraft);
      showToast('AI draft inserted into composer', 'info');
    }
  };

  const handleCopyDraft = () => {
    if (generatedDraft) {
      navigator.clipboard.writeText(generatedDraft);
      setCopiedDraft(true);
      setTimeout(() => setCopiedDraft(false), 2000);
      showToast('Copied to clipboard', 'info');
    }
  };

  const getPlatformIcon = (platform: OmnichannelPlatform) => {
    switch (platform) {
      case 'messenger':
        return (
          <span className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
            M
          </span>
        );
      case 'whatsapp':
        return (
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
            W
          </span>
        );
      case 'instagram':
        return (
          <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white flex items-center justify-center text-[10px] font-bold shadow-sm">
            IG
          </span>
        );
      case 'tiktok':
        return (
          <span className="w-5 h-5 rounded-full bg-black text-cyan-400 border border-pink-500 flex items-center justify-center text-[9px] font-bold shadow-sm">
            TT
          </span>
        );
    }
  };

  const getPlatformLabel = (platform: OmnichannelPlatform) => {
    switch (platform) {
      case 'messenger': return 'Facebook Messenger';
      case 'whatsapp': return 'WhatsApp';
      case 'instagram': return 'Instagram DM';
      case 'tiktok': return 'TikTok Messages';
    }
  };

  const getExternalLink = () => {
    if (!activeThread) return '#';
    const msg = inputText || generatedDraft || '';
    switch (activeThread.platform) {
      case 'whatsapp':
        return getWhatsAppDirectUrl(activeThread.customer.phone || '09178329900', msg);
      case 'messenger':
        return getMessengerDirectUrl(activeThread.customer.handle);
      case 'instagram':
        return getInstagramDirectUrl(activeThread.customer.handle);
      case 'tiktok':
        return getTikTokDirectUrl(activeThread.customer.handle);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Omnichannel Integration Status & Operator Pill */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-stone-900 via-stone-900 to-stone-950 border border-stone-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-stone-100 flex items-center gap-2">
                  <span>Omnichannel Social Inbox & AI Response Dispatcher</span>
                  {unreadChatCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-stone-950">
                      {unreadChatCount} unread
                    </span>
                  )}
                </h2>
                <p className="text-xs text-stone-400">
                  Unified multi-channel customer communications across Messenger, WhatsApp, Instagram, and TikTok with Gemini AI-assisted pricing quotes & responses.
                </p>
              </div>
            </div>
          </div>

          {/* Connected Channels Pill Bar */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>Messenger (Page Live)</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>WhatsApp (+63 917)</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>Instagram (@rideout)</span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/30 text-pink-300 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-pink-400"></span>
              <span>TikTok (@rideout)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: 3 Columns (Threads | Chat Window | AI Response System) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[750px]">
        {/* COLUMN 1: Conversation List & Filter Bar (3 Cols) */}
        <div className="lg:col-span-4 xl:col-span-3 flex flex-col rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-sm">
          {/* Header & Search */}
          <div className="p-3.5 border-b border-stone-800 space-y-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search chats, customer or bike..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400/50"
              />
            </div>

            {/* Platform filter tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              <button
                onClick={() => setPlatformFilter('all')}
                className={`px-2 py-1 rounded-md font-semibold shrink-0 transition-colors ${
                  platformFilter === 'all'
                    ? 'bg-amber-400 text-stone-950'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                }`}
              >
                All ({chatThreads.length})
              </button>
              <button
                onClick={() => setPlatformFilter('messenger')}
                className={`px-2 py-1 rounded-md font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                  platformFilter === 'messenger'
                    ? 'bg-blue-600 text-white'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>Messenger</span>
              </button>
              <button
                onClick={() => setPlatformFilter('whatsapp')}
                className={`px-2 py-1 rounded-md font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                  platformFilter === 'whatsapp'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>WhatsApp</span>
              </button>
              <button
                onClick={() => setPlatformFilter('instagram')}
                className={`px-2 py-1 rounded-md font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                  platformFilter === 'instagram'
                    ? 'bg-gradient-to-r from-amber-500 to-purple-600 text-white'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>IG</span>
              </button>
              <button
                onClick={() => setPlatformFilter('tiktok')}
                className={`px-2 py-1 rounded-md font-semibold shrink-0 transition-colors flex items-center gap-1 ${
                  platformFilter === 'tiktok'
                    ? 'bg-stone-800 text-cyan-300 border border-cyan-500/50'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>TikTok</span>
              </button>
            </div>

            {/* Unread toggle */}
            <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
              <span>Showing {filteredThreads.length} conversations</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={unreadOnly}
                  onChange={(e) => setUnreadOnly(e.target.checked)}
                  className="rounded border-stone-800 bg-stone-950 text-amber-400 focus:ring-0 w-3 h-3"
                />
                <span className={unreadOnly ? 'text-amber-400 font-semibold' : ''}>Unread only</span>
              </label>
            </div>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-800/60 max-h-[640px]">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-500">
                No conversations match your filter.
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.id === activeThread?.id;
                return (
                  <button
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
                    className={`w-full p-3 text-left transition-colors flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-amber-400/10 border-l-4 border-amber-400'
                        : 'hover:bg-stone-950/60'
                    }`}
                  >
                    {/* Avatar with platform badge */}
                    <div className="relative shrink-0">
                      <img
                        src={thread.customer.avatarUrl}
                        alt={thread.customer.name}
                        className="w-10 h-10 rounded-full object-cover border border-stone-700"
                      />
                      <div className="absolute -bottom-1 -right-1">
                        {getPlatformIcon(thread.platform)}
                      </div>
                    </div>

                    {/* Thread details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-xs truncate ${thread.unreadCount > 0 ? 'font-bold text-stone-100' : 'font-semibold text-stone-300'}`}>
                          {thread.customer.name}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono shrink-0">
                          {thread.lastMessageTimestamp}
                        </span>
                      </div>

                      {/* Inquired bike tag */}
                      {thread.inquiredBikeName && (
                        <div className="flex items-center gap-1 text-[10px] text-amber-300/90 font-medium truncate">
                          <Bike className="w-3 h-3 shrink-0 text-amber-400" />
                          <span className="truncate">{thread.inquiredBikeName} ({thread.inquiredDays || 3}d)</span>
                        </div>
                      )}

                      <p className={`text-[11px] truncate leading-tight ${thread.unreadCount > 0 ? 'text-stone-200 font-medium' : 'text-stone-400'}`}>
                        {thread.lastMessageText}
                      </p>

                      <div className="flex items-center gap-1.5 pt-0.5">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold font-mono ${
                          thread.status === 'open' 
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' 
                            : thread.status === 'quoted' 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : thread.status === 'reserved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-stone-800 text-stone-400'
                        }`}>
                          {thread.status}
                        </span>
                        {thread.unreadCount > 0 && (
                          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0"></span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 2: Active Chat Window & Composer (5 Cols) */}
        <div className="lg:col-span-8 xl:col-span-5 flex flex-col rounded-2xl bg-stone-900 border border-stone-800 overflow-hidden shadow-sm">
          {activeThread ? (
            <>
              {/* Chat Window Header */}
              <div className="p-3.5 sm:p-4 border-b border-stone-800 bg-stone-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={activeThread.customer.avatarUrl}
                      alt={activeThread.customer.name}
                      className="w-11 h-11 rounded-full object-cover border border-stone-700"
                    />
                    <div className="absolute -bottom-1 -right-1">
                      {getPlatformIcon(activeThread.platform)}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-stone-100 text-sm">{activeThread.customer.name}</h3>
                      {activeThread.customer.isVerified && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                          VERIFIED
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-stone-400 flex items-center gap-2">
                      <span>{getPlatformLabel(activeThread.platform)}</span>
                      <span>·</span>
                      <span className="font-mono text-stone-500">{activeThread.customer.handle}</span>
                      {activeThread.customer.city && (
                        <>
                          <span>·</span>
                          <span className="text-stone-400">{activeThread.customer.city}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status selector & External Direct Link */}
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <select
                    value={activeThread.status}
                    onChange={(e) => updateThreadStatus(activeThread.id, e.target.value as any)}
                    className="px-2.5 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs font-semibold text-stone-200 focus:outline-none"
                  >
                    <option value="open">Status: Open</option>
                    <option value="quoted">Status: Quoted</option>
                    <option value="reserved">Status: Reserved</option>
                    <option value="closed">Status: Closed</option>
                  </select>

                  <a
                    href={getExternalLink()}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg text-stone-200 hover:text-amber-400 transition-colors"
                    title={`Open in official ${getPlatformLabel(activeThread.platform)}`}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Context Bar: Inquired Motorbike + Live Smart Pricing Summary */}
              {activeBike && (
                <div className="px-4 py-2.5 bg-amber-400/5 border-b border-amber-400/20 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <img
                      src={activeBike.imageUrl}
                      alt={activeBike.name}
                      className="w-9 h-7 rounded object-cover border border-stone-700"
                    />
                    <div>
                      <div className="font-bold text-stone-200 flex items-center gap-1.5">
                        <span>{activeBike.name}</span>
                        <span className="text-[10px] font-mono text-amber-400 font-normal">
                          (₱{activeBike.dailyRate}/day · {activeThread.inquiredDays || 3} Days)
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {activeBike.transmission} · Plate: {activeBike.plateNumber} · Fuel: {activeBike.fuelLevel}%
                      </div>
                    </div>
                  </div>

                  {pricingResult.isSmartPricingActive && (
                    <div className="text-right">
                      <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>Smart Price: ₱{pricingResult.discountedRentalSubtotal}</span>
                        <span className="line-through text-stone-500">₱{pricingResult.baseRentalSubtotal}</span>
                      </div>
                      <div className="text-[9px] text-stone-400 font-mono">
                        Saved ₱{pricingResult.totalSmartDiscountAmount} ({pricingResult.durationDiscountPercent + pricingResult.utilizationDiscountPercent}% off)
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Chat Message Transcript */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 max-h-[460px]">
                {activeThread.messages.map((msg) => {
                  const isStaff = msg.sender === 'staff' || msg.sender === 'ai_assistant';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isStaff ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-stone-500 mb-1">
                        <span className="font-semibold text-stone-400">
                          {isStaff ? (msg.staffName || 'Depot Staff') : activeThread.customer.name}
                        </span>
                        <span>·</span>
                        <span>{msg.timestamp}</span>
                        {isStaff && <CheckCheck className="w-3 h-3 text-amber-400" />}
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs whitespace-pre-line leading-relaxed shadow-sm ${
                          isStaff
                            ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-medium rounded-tr-none'
                            : 'bg-stone-950 text-stone-200 border border-stone-800 rounded-tl-none'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Optional attached quote card inside message */}
                      {msg.suggestedOffer && (
                        <div className="mt-2 p-2.5 rounded-xl bg-stone-950 border border-amber-400/30 max-w-[85%] space-y-1.5 text-xs">
                          <div className="flex items-center justify-between text-amber-300 font-bold">
                            <span>Quotation Offer: {msg.suggestedOffer.bikeModel}</span>
                            <span>{msg.suggestedOffer.totalDays} Days</span>
                          </div>
                          <div className="text-[11px] text-stone-400 flex justify-between">
                            <span>Smart Discount Applied:</span>
                            <span className="text-emerald-400 font-mono font-bold">-₱{msg.suggestedOffer.smartDiscount}</span>
                          </div>
                          <div className="text-xs text-stone-200 font-bold flex justify-between border-t border-stone-800 pt-1">
                            <span>Total Payable:</span>
                            <span className="text-amber-400 font-mono">₱{msg.suggestedOffer.grandTotal}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Action Suggestion Pills */}
              <div className="px-3.5 py-2 bg-stone-950/80 border-t border-stone-800 flex items-center gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
                <span className="text-[10px] text-stone-500 font-semibold shrink-0 uppercase tracking-wider">
                  Quick AI:
                </span>
                <button
                  type="button"
                  onClick={() => handleGenerateAiResponse('quote')}
                  className="px-2 py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 rounded border border-stone-800 shrink-0 transition-colors flex items-center gap-1"
                >
                  <Zap className="w-3 h-3 text-amber-400" />
                  <span>Send Smart Rate Quote</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateAiResponse('deposit_policy')}
                  className="px-2 py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 rounded border border-stone-800 shrink-0 transition-colors flex items-center gap-1"
                >
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  <span>Explain ID Deposit Policy</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateAiResponse('license_check')}
                  className="px-2 py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 rounded border border-stone-800 shrink-0 transition-colors flex items-center gap-1"
                >
                  <UserCheck className="w-3 h-3 text-emerald-400" />
                  <span>License Requirements</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleGenerateAiResponse('route_recommendation')}
                  className="px-2 py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-amber-300 rounded border border-stone-800 shrink-0 transition-colors flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3 text-rose-400" />
                  <span>Recommend Routes</span>
                </button>
              </div>

              {/* Message Composer Box */}
              <div className="p-3.5 border-t border-stone-800 bg-stone-950 space-y-2">
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder={`Write a reply to ${activeThread.customer.name} via ${activeThread.platform.toUpperCase()}...`}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        handleSendMessage();
                      }
                    }}
                    className="w-full px-3.5 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 leading-relaxed resize-none"
                  />
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-stone-500 hidden sm:inline">
                    Press <kbd className="px-1 py-0.5 rounded bg-stone-800 font-mono text-stone-400">Ctrl + Enter</kbd> to dispatch
                  </span>

                  <div className="flex items-center gap-2 ml-auto">
                    <a
                      href={getExternalLink()}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-stone-700"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Open in {getPlatformLabel(activeThread.platform).split(' ')[0]}</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim()}
                      className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Reply</span>
                    </button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-500 text-xs">
              <MessageSquare className="w-8 h-8 text-stone-600 mb-2" />
              <span>Select a conversation from the left to start replying.</span>
            </div>
          )}
        </div>

        {/* COLUMN 3: AI-Assisted Response System & Prompt Engineer (4 Cols) */}
        <div className="lg:col-span-12 xl:col-span-4 flex flex-col rounded-2xl bg-stone-900 border border-stone-800 p-4 sm:p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-stone-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-stone-100 text-sm">Gemini AI Response Assistant</h3>
                <p className="text-[10px] text-stone-400">Contextual draft generator with active smart pricing</p>
              </div>
            </div>

            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ACTIVE
            </span>
          </div>

          {/* Tone Selector */}
          <div className="space-y-1.5 text-xs">
            <label className="block text-stone-400 font-medium">Assistant Tone & Brand Voice</label>
            <select
              value={aiTone}
              onChange={(e) => setAiTone(e.target.value as any)}
              className="w-full px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 font-medium focus:outline-none"
            >
              <option value="Warm & Hospitable">Warm & Hospitable (Zambales Beach Welcome)</option>
              <option value="Quick & Informative">Quick & Informative (Key Points & Numbers)</option>
              <option value="Surf & Adventure Vibe">Surf & Adventure Vibe (Casual, Waves, Trail)</option>
              <option value="Strict Policy Clarification">Strict Policy Clarification (ID & Fuel)</option>
            </select>
          </div>

          {/* Quick Objective Presets */}
          <div className="space-y-2 text-xs">
            <label className="block text-stone-400 font-medium">Select Inquiry Objective</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setAiIntent('quote');
                  handleGenerateAiResponse('quote');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  aiIntent === 'quote'
                    ? 'bg-amber-400/10 border-amber-400/50 text-amber-300 font-semibold'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Smart Rate Quote</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Calculates duration + promo</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAiIntent('deposit_policy');
                  handleGenerateAiResponse('deposit_policy');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  aiIntent === 'deposit_policy'
                    ? 'bg-amber-400/10 border-amber-400/50 text-amber-300 font-semibold'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  <span>ID Deposit Policy</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Physical ID custody photo</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAiIntent('license_check');
                  handleGenerateAiResponse('license_check');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  aiIntent === 'license_check'
                    ? 'bg-amber-400/10 border-amber-400/50 text-amber-300 font-semibold'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>License Validation</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Code A/A1 & foreign 90d</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAiIntent('route_recommendation');
                  handleGenerateAiResponse('route_recommendation');
                }}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  aiIntent === 'route_recommendation'
                    ? 'bg-amber-400/10 border-amber-400/50 text-amber-300 font-semibold'
                    : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Scenic Route Guide</span>
                </div>
                <div className="text-[10px] text-stone-400 mt-0.5">Liwliwa & radar points</div>
              </button>
            </div>
          </div>

          {/* Custom Prompt Box */}
          <div className="space-y-1.5 text-xs">
            <label className="block text-stone-400 font-medium">Custom Operator Instructions (Optional)</label>
            <input
              type="text"
              placeholder="e.g. tell them we have 1 unit left and can hold until 3 PM..."
              value={customAiPrompt}
              onChange={(e) => setCustomAiPrompt(e.target.value)}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400/50"
            />
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={() => handleGenerateAiResponse()}
            disabled={isGeneratingAi}
            className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            {isGeneratingAi ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Crafting AI Response...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Smart AI Draft</span>
              </>
            )}
          </button>

          {/* Generated AI Draft Box */}
          {generatedDraft ? (
            <div className="p-3.5 rounded-xl bg-stone-950 border border-amber-400/30 space-y-3 text-xs flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1 font-mono">
                    <Sparkles className="w-3 h-3" />
                    <span>Generated AI Draft</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleCopyDraft}
                      className="p-1 text-stone-400 hover:text-stone-200"
                      title="Copy Draft"
                    >
                      {copiedDraft ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-200 whitespace-pre-line leading-relaxed max-h-[220px] overflow-y-auto">
                  {generatedDraft}
                </div>

                {draftHighlights.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {draftHighlights.map((hl, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded text-[9px] bg-stone-800 text-stone-300 border border-stone-700">
                        ✓ {hl}
                      </span>
                    ))}
                  </div>
                )}

                {suggestedFollowUp && (
                  <div className="p-2 rounded bg-amber-400/10 border border-amber-400/20 text-[10px] text-amber-300">
                    💡 <strong>Staff Tip:</strong> {suggestedFollowUp}
                  </div>
                )}
              </div>

              {/* Draft Actions */}
              <div className="pt-2 border-t border-stone-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleInsertDraftToComposer}
                  className="flex-1 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-stone-700"
                >
                  <CornerDownLeft className="w-3 h-3 text-amber-400" />
                  <span>Insert to Composer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSendMessage(generatedDraft)}
                  className="flex-1 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                >
                  <Send className="w-3 h-3" />
                  <span>Dispatch Now</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-stone-950/60 border border-stone-800/80 text-center text-stone-500 text-xs flex-1 flex flex-col items-center justify-center space-y-2">
              <Sparkles className="w-6 h-6 text-stone-600" />
              <p className="text-[11px] leading-relaxed max-w-[220px]">
                Click an objective above or hit <strong>Generate Smart AI Draft</strong> to get a quote, policy explainer, or custom reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
