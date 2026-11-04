import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Plus, 
  CheckCircle2, 
  Clock, 
  KeyRound, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  AlertTriangle, 
  Search,
  Sparkles,
  X,
  CreditCard
} from 'lucide-react';
import { RentalBusiness, SUBSCRIPTION_PRICING_SCHEDULE } from '../../types';

export const BusinessActivationView: React.FC = () => {
  const { 
    businesses, 
    currentBusinessId, 
    setCurrentBusinessId, 
    activateBusiness, 
    extendBusinessTrial, 
    registerNewBusiness, 
    showToast,
    setActiveTab 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // New Shop Registration Form
  const [newShopName, setNewShopName] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newMobile, setNewMobile] = useState('09');
  const [newLocation, setNewLocation] = useState('');
  const [newFbPage, setNewFbPage] = useState('');
  const [newGcashName, setNewGcashName] = useState('');
  const [newGcashNumber, setNewGcashNumber] = useState('');

  // Calculate Shop Monthly Bill based on Graduated Pricing Schedule:
  // Month 1: Free Trial (₱0)
  // Months 2-3: ₱500 / month
  // Months 4-6: ₱1,000 / month
  // Month 7+: ₱1,000 / month + 1% of total transaction volume
  const calculateShopMonthlyBill = (b: RentalBusiness): number => {
    if (b.isFlagship || b.subscription.status !== 'active') return 0;
    const monthNum = b.subscription.currentMonthNumber || (b.subscription.currentTierKey === 'months_2_3' ? 2 : b.subscription.currentTierKey === 'months_4_6' ? 5 : b.subscription.currentTierKey === 'month_7_plus' ? 7 : 2);
    if (monthNum === 1) return 0;
    if (monthNum >= 2 && monthNum <= 3) return 500;
    if (monthNum >= 4 && monthNum <= 6) return 1000;
    // Month 7+: ₱1,000 + 1% of total transaction volume
    const volume = b.subscription.monthlyTransactionVolume || 0;
    return 1000 + Math.round(volume * 0.01);
  };

  // Calculate Platform Revenue Metrics
  const totalShops = businesses.length;
  const activeSubscribers = businesses.filter(b => b.subscription.status === 'active' && !b.isFlagship).length;
  const activeTrials = businesses.filter(b => b.subscription.status === 'trial').length;
  const pendingActivation = businesses.filter(b => b.subscription.status === 'pending_activation').length;
  const estimatedMRR = businesses.reduce((sum, b) => sum + calculateShopMonthlyBill(b), 0);

  const filteredBusinesses = businesses.filter((b) => {
    const matchesStatus = filterStatus === 'all' || b.subscription.status === filterStatus;
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.mobile.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    showToast(`Copied to clipboard: ${text}`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleCreateNewShop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShopName.trim() || !newOwnerName.trim() || newMobile.length !== 11) {
      showToast('Please fill all required fields with an 11-digit mobile number', 'error');
      return;
    }

    const newId = registerNewBusiness({
      name: newShopName,
      tagline: `Quality Motorbike Rentals in ${newLocation}`,
      ownerName: newOwnerName,
      email: newEmail,
      mobile: newMobile,
      location: newLocation,
      facebookPageUrl: newFbPage || undefined,
      gcashAccountName: newGcashName || newShopName.toUpperCase(),
      gcashAccountNumber: newGcashNumber || newMobile,
    });

    setIsRegisterOpen(false);
    // Reset form
    setNewShopName('');
    setNewOwnerName('');
    setNewEmail('');
    setNewMobile('09');
    setNewLocation('');
    setNewFbPage('');
    setNewGcashName('');
    setNewGcashNumber('');
  };

  const getTrialDaysRemaining = (trialEndDate: string): number => {
    const end = new Date(trialEndDate).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-stone-100">
              Partner Network & Shop Activations
            </h1>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Multi-Tenant Architecture
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Onboard other small rental shops with our graduated SaaS subscription: 30-day trial ➔ ₱500/mo (Months 2–3) ➔ ₱1,000/mo (Months 4–6) ➔ ₱1,000/mo + 1% tx (Month 7+).
          </p>
        </div>

        <button
          onClick={() => setIsRegisterOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Onboard New Rental Business</span>
        </button>
      </div>

      {/* Platform Strategy Callout Card: Graduated Subscription Schedule */}
      <div className="rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-500/10 via-stone-900 to-stone-900 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>Official Graduated SaaS Subscription Pricing Schedule</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
            Partner Growth Engine
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-stone-300">
          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-1.5">
            <div className="font-bold text-stone-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-amber-400/20 text-amber-400 font-mono text-[11px] flex items-center justify-center font-bold">1</span>
                <span>Month 1</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold text-xs">FREE</span>
            </div>
            <div className="text-amber-400 font-bold text-[11px]">30-Day Free Trial</div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Full access to online reservations, digital vehicle inspection, waiver signing, and social media studio at zero upfront cost and 0% commission.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-1.5">
            <div className="font-bold text-stone-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-emerald-400/20 text-emerald-400 font-mono text-[11px] flex items-center justify-center font-bold">2</span>
                <span>Months 2–3</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold text-xs">₱500 / mo</span>
            </div>
            <div className="text-emerald-300 font-bold text-[11px]">Early Growth Tier</div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Subsidized rate of <strong>₱500/month</strong> for the 2nd to 3rd month with 0% transaction commission to support partner shops while they establish their fleet.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-stone-950/80 border border-stone-800 space-y-1.5">
            <div className="font-bold text-stone-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-400/20 text-blue-400 font-mono text-[11px] flex items-center justify-center font-bold">3</span>
                <span>Months 4–6</span>
              </span>
              <span className="font-mono text-blue-400 font-bold text-xs">₱1,000 / mo</span>
            </div>
            <div className="text-blue-300 font-bold text-[11px]">Established Depot Tier</div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Standard flat rate of <strong>₱1,000/month</strong> for months 4 through 6 with 0% transaction commission, full AI features and priority technical support.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-stone-950/80 border border-purple-500/30 space-y-1.5 bg-gradient-to-b from-purple-950/20 to-stone-950">
            <div className="font-bold text-stone-100 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-purple-400/20 text-purple-400 font-mono text-[11px] flex items-center justify-center font-bold">4</span>
                <span>Month 7+</span>
              </span>
              <span className="font-mono text-purple-300 font-bold text-xs">₱1k + 1% tx</span>
            </div>
            <div className="text-purple-300 font-bold text-[11px]">Scale & Revenue Share</div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              <strong>₱1,000/month</strong> base + <strong>1% of total monthly booking volume</strong>. Aligns platform revenue with high-volume partner success.
            </p>
          </div>
        </div>
      </div>

      {/* Metric KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Monthly Recurring Rev (MRR)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            ₱{estimatedMRR.toLocaleString()}
            <span className="text-xs text-stone-500 font-normal"> / mo</span>
          </div>
          <div className="text-[10px] text-stone-400 font-mono">
            From {activeSubscribers} active paying partner shops
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Total Partner Shops</span>
            <Building2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-stone-100">
            {totalShops}
          </div>
          <div className="text-[10px] text-stone-400 font-mono">
            {activeTrials} on free trial · {pendingActivation} pending
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Active 30-Day Trials</span>
            <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-blue-400">
            {activeTrials}
          </div>
          <div className="text-[10px] text-stone-400 font-mono">
            Evaluating platform features
          </div>
        </div>

        <div className="p-4 rounded-xl border border-stone-800 bg-stone-900/60 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-stone-400 text-xs">
            <span>Shareable Onboarding Link</span>
            <KeyRound className="w-4 h-4 text-purple-400" />
          </div>
          <button
            onClick={() => handleCopy('https://rideout.app/partner/join?trial=30days', 'invite-link')}
            className="w-full py-2 px-2.5 rounded bg-stone-950 border border-stone-800 hover:border-purple-400 text-[11px] text-purple-300 font-mono truncate flex items-center justify-between transition-colors"
          >
            <span className="truncate">rideout.app/join?trial=30d</span>
            {copiedCode === 'invite-link' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            )}
          </button>
          <div className="text-[10px] text-stone-400 font-mono">
            Click to copy registration link
          </div>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-lg overflow-x-auto">
          {[
            { id: 'all', label: 'All Businesses', count: businesses.length },
            { id: 'trial', label: '30-Day Trials', count: activeTrials },
            { id: 'active', label: 'Active Subscribers', count: businesses.filter(b => b.subscription.status === 'active').length },
            { id: 'pending_activation', label: 'Pending Approval', count: pendingActivation },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                filterStatus === tab.id
                  ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <span>{tab.label}</span>
              <span className="ml-1.5 text-[10px] opacity-80 font-mono">({tab.count})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search business name, location, owner..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400 text-xs"
          />
        </div>
      </div>

      {/* Businesses Directory Table */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/40 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-950/80 border-b border-stone-800 text-stone-400 text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Business & Depot</th>
                <th className="py-3 px-4">Owner & Contact</th>
                <th className="py-3 px-4">Subscription Status</th>
                <th className="py-3 px-4">GCash Payment Setup</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-800/60 font-sans">
              {filteredBusinesses.map((biz) => {
                const isCurrent = biz.id === currentBusinessId;
                const daysLeft = getTrialDaysRemaining(biz.subscription.trialEndDate);

                return (
                  <tr
                    key={biz.id}
                    className={`hover:bg-stone-800/20 transition-colors ${isCurrent ? 'bg-amber-400/5' : ''}`}
                  >
                    {/* Business Name & Depot */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-center gap-3">
                        <img
                          src={biz.logoUrl}
                          alt={biz.name}
                          className="w-10 h-10 rounded-lg object-cover border border-stone-700 bg-stone-900 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-stone-100 flex items-center gap-1.5">
                            <span className="truncate">{biz.name}</span>
                            {biz.isFlagship && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-400 font-bold border border-amber-400/30">
                                HOST
                              </span>
                            )}
                            {isCurrent && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 mt-0.5">
                            {biz.location}
                          </div>
                          {biz.facebookBranding && (
                            <div className="text-[10px] text-blue-400 mt-0.5 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-blue-400" />
                              <span>FB Verified: {biz.facebookBranding.pageName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Owner & Contact */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-medium text-stone-200">
                        {biz.ownerName}
                      </div>
                      <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                        {biz.mobile}
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                        {biz.email}
                      </div>
                    </td>

                    {/* Subscription Status */}
                    <td className="py-4 px-4 align-top">
                      {biz.isFlagship ? (
                        <div className="space-y-0.5">
                          <span className="text-amber-400 font-bold text-xs inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            Platform Owner (Lifetime)
                          </span>
                          <div className="text-[10px] text-stone-500 font-mono">Master Administrator</div>
                        </div>
                      ) : biz.subscription.status === 'trial' ? (
                        <div className="space-y-1">
                          <span className="text-blue-400 font-bold text-xs inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span>
                            30-Day Free Trial
                          </span>
                          <div className="text-[11px] text-stone-200 font-mono">
                            {daysLeft} days remaining
                          </div>
                          <div className="text-[10px] text-stone-400 font-mono">
                            Expires: {biz.subscription.trialEndDate}
                          </div>
                        </div>
                      ) : biz.subscription.status === 'active' ? (
                        <div className="space-y-1">
                          {(() => {
                            const monthNum = biz.subscription.currentMonthNumber || (biz.subscription.currentTierKey === 'months_2_3' ? 2 : biz.subscription.currentTierKey === 'months_4_6' ? 5 : biz.subscription.currentTierKey === 'month_7_plus' ? 8 : 2);
                            const bill = calculateShopMonthlyBill(biz);
                            const isMonths23 = monthNum >= 2 && monthNum <= 3;
                            const isMonths46 = monthNum >= 4 && monthNum <= 6;
                            const isMonth7Plus = monthNum >= 7;

                            return (
                              <>
                                <span className={`font-bold text-xs inline-flex items-center gap-1.5 ${
                                  isMonths23 ? 'text-emerald-400' :
                                  isMonths46 ? 'text-blue-400' : 'text-purple-300'
                                }`}>
                                  <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                  <span>
                                    {isMonths23 ? 'Months 2–3 (₱500/mo)' :
                                     isMonths46 ? 'Months 4–6 (₱1,000/mo)' :
                                     'Month 7+ (₱1,000 + 1% tx)'}
                                  </span>
                                </span>
                                <div className="text-[11px] font-mono font-bold text-stone-100">
                                  Fee: ₱{bill.toLocaleString()}/mo
                                  {isMonth7Plus && biz.subscription.monthlyTransactionVolume && (
                                    <span className="text-[10px] text-purple-300 font-normal block">
                                      (₱1,000 base + 1% of ₱{biz.subscription.monthlyTransactionVolume.toLocaleString()} tx volume)
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-stone-400 font-mono">
                                  Next Bill: {biz.subscription.nextBillingDate}
                                </div>
                                <div className="text-[10px] text-stone-500 font-mono">
                                  Key: {biz.subscription.activationCode}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <span className="text-amber-400 font-bold text-xs inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                            Awaiting Activation
                          </span>
                          <div className="text-[10px] text-stone-400">Ready to launch trial</div>
                        </div>
                      )}
                    </td>

                    {/* GCash Payment Setup */}
                    <td className="py-4 px-4 align-top">
                      <div className="font-mono text-stone-200 text-xs font-semibold">
                        {biz.gcashConfig.accountName}
                      </div>
                      <div className="text-[11px] text-blue-400 font-mono mt-0.5">
                        {biz.gcashConfig.accountNumber}
                      </div>
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        Deposit: ₱{biz.gcashConfig.depositAmount.toLocaleString()}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-4 align-top text-right">
                      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1.5">
                        {/* Switch Account */}
                        {!isCurrent && (
                          <button
                            onClick={() => {
                              setCurrentBusinessId(biz.id);
                              showToast(`Switched workspace to ${biz.name}!`, 'info');
                            }}
                            className="px-2.5 py-1 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded transition-colors whitespace-nowrap"
                          >
                            Switch Shop
                          </button>
                        )}

                        {/* If Pending or in Trial, Activate to Paid ₱1,000/mo */}
                        {(biz.subscription.status === 'pending_activation' || biz.subscription.status === 'trial') && !biz.isFlagship && (
                          <button
                            onClick={() => activateBusiness(biz.id)}
                            className="px-2.5 py-1 text-xs font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors whitespace-nowrap flex items-center gap-1 shadow-sm"
                            title="Activate subscription and set ₱1,000/month recurring billing"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Activate (₱1k/mo)</span>
                          </button>
                        )}

                        {/* Extend Trial */}
                        {biz.subscription.status === 'trial' && (
                          <button
                            onClick={() => extendBusinessTrial(biz.id, 30)}
                            className="p-1.5 text-stone-400 hover:text-blue-400 bg-stone-800/80 hover:bg-stone-800 rounded transition-colors"
                            title="Extend free trial by 30 days"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Copy Portal Link */}
                        <button
                          onClick={() => handleCopy(`https://rideout.app/${biz.slug}`, biz.id)}
                          className="p-1.5 text-stone-400 hover:text-amber-400 bg-stone-800/80 hover:bg-stone-800 rounded transition-colors"
                          title="Copy direct booking link"
                        >
                          {copiedCode === biz.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Register New Shop Modal */}
      {isRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden my-8 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-stone-100 text-sm">
                  Register New Rental Business (30-Day Free Trial)
                </span>
              </div>
              <button
                onClick={() => setIsRegisterOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateNewShop} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>30-Day Free Trial Activated Automatically</span>
                </div>
                <p className="text-[11px] text-emerald-200/80">
                  New shop will be granted 30 days of full access. After 30 days, billing will recur at ₱1,000/month.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-stone-400 mb-1">Rental Business Name *</label>
                  <input
                    type="text"
                    required
                    value={newShopName}
                    onChange={(e) => setNewShopName(e.target.value)}
                    placeholder="e.g. Baler Coast Moto Rentals"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1">Owner / Manager Name *</label>
                    <input
                      type="text"
                      required
                      value={newOwnerName}
                      onChange={(e) => setNewOwnerName(e.target.value)}
                      placeholder="e.g. Maria Santos"
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">Mobile Number (11 Digits) *</label>
                    <input
                      type="text"
                      required
                      maxLength={11}
                      value={newMobile}
                      onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, ''))}
                      placeholder="09171234567"
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">Business Email *</label>
                    <input
                      type="email"
                      required
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="shop@gmail.com"
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">Depot / Town Location *</label>
                    <input
                      type="text"
                      required
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Sabang Beach, Baler, Aurora"
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Facebook Page URL (Optional for auto-branding)</label>
                  <input
                    type="url"
                    value={newFbPage}
                    onChange={(e) => setNewFbPage(e.target.value)}
                    placeholder="https://facebook.com/balercoastmoto"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 font-mono text-xs"
                  />
                </div>

                <div className="pt-2 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1">GCash Account Name</label>
                    <input
                      type="text"
                      value={newGcashName}
                      onChange={(e) => setNewGcashName(e.target.value.toUpperCase())}
                      placeholder="e.g. BALER MOTO / MARIA S."
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1">GCash Number</label>
                    <input
                      type="text"
                      value={newGcashNumber}
                      onChange={(e) => setNewGcashNumber(e.target.value)}
                      placeholder="0917 123 4567"
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsRegisterOpen(false)}
                  className="px-4 py-2 text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
                >
                  Create Shop & Activate 30-Day Trial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
