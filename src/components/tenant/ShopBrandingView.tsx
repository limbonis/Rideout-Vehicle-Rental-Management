import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  RentalAddOnItem, 
  PickupLocation,
  StaffUser,
  StaffPermissions,
  ContentRewardConfig,
  RewardType,
  RewardReleaseTiming,
  SUBSCRIPTION_PRICING_SCHEDULE
} from '../../types';
import { 
  Building2, 
  Upload, 
  Sparkles, 
  Facebook, 
  Link2, 
  CheckCircle2, 
  Smartphone, 
  QrCode, 
  Eye, 
  Save, 
  RefreshCw, 
  Copy, 
  Check, 
  Palette,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Sliders,
  Fuel,
  Clock,
  Plus,
  Trash2,
  Tag,
  MapPin,
  HardDrive,
  Users,
  UserPlus,
  Shield,
  Award,
  Film,
  CheckSquare,
  Square,
  Zap,
  TrendingDown,
  Percent,
  Radio,
  Compass,
  Navigation2
} from 'lucide-react';
import { generateGCashQRSvg } from '../../utils/gcashHelper';
import { LocationPinningModal } from '../locations/LocationPinningModal';
import { INITIAL_NOMINATED_LOCATIONS } from '../../utils/googleMapsHelper';
import { 
  SmartPricingConfig, 
  SmartPricingDurationTier, 
  DEFAULT_SMART_PRICING_CONFIG, 
  calculateSmartPriceDiscount 
} from '../../types/smartPricing';
import { getNearbyTownsForLocation, NearbyTown } from '../../utils/nearbyTownsHelper';
import { FacebookConnectModal } from './FacebookConnectModal';
import { GCashPaymentModal } from '../common/GCashPaymentModal';

export const ShopBrandingView: React.FC = () => {
  const { 
    currentBusiness, 
    updateBusinessProfile, 
    importBrandingFromFacebook, 
    showToast,
    setActiveTab,
    addNominatedPickupLocation,
    updateNominatedPickupLocation,
    deleteNominatedPickupLocation,
    setIsArchiveModalOpen,
    activeStaffUser,
    switchActiveStaffUser,
    addStaffUser,
    updateStaffUser,
    deleteStaffUser,
    updateContentRewardConfig,
    updateSmartPricingConfig,
    updateTargetedNearbyTowns,
    bikes
  } = useApp();

  // Local editable state initialized from currentBusiness
  const [name, setName] = useState(currentBusiness.name);
  const [tagline, setTagline] = useState(currentBusiness.tagline);
  const [ownerName, setOwnerName] = useState(currentBusiness.ownerName);
  const [email, setEmail] = useState(currentBusiness.email);
  const [mobile, setMobile] = useState(currentBusiness.mobile);
  const [location, setLocation] = useState(currentBusiness.location);
  const [logoUrl, setLogoUrl] = useState(currentBusiness.logoUrl);
  const [coverPhotoUrl, setCoverPhotoUrl] = useState(currentBusiness.coverPhotoUrl);
  const [primaryColor, setPrimaryColor] = useState(currentBusiness.primaryColor || '#f59e0b');

  // Facebook Import & Direct Connect State
  const [fbPageUrl, setFbPageUrl] = useState(currentBusiness.facebookBranding?.pageUrl || 'https://facebook.com/rideoutzambales');
  const [isImportingFb, setIsImportingFb] = useState(false);
  const [isFbConnectModalOpen, setIsFbConnectModalOpen] = useState(false);
  const [isGCashModalOpen, setIsGCashModalOpen] = useState(false);

  // GCash Configuration State
  const [gcashAccountName, setGcashAccountName] = useState(currentBusiness.gcashConfig.accountName);
  const [gcashAccountNumber, setGcashAccountNumber] = useState(currentBusiness.gcashConfig.accountNumber);
  const [gcashQrUrl, setGcashQrUrl] = useState(currentBusiness.gcashConfig.qrCodeUrl || '');
  const [gcashDepositAmount, setGcashDepositAmount] = useState(currentBusiness.gcashConfig.depositAmount || 1000);

  // Service Customization State
  const [depositPerMotorbike, setDepositPerMotorbike] = useState(
    currentBusiness.customization?.depositPerMotorbike ?? 2000
  );
  const [fuelChargePerBar, setFuelChargePerBar] = useState(
    currentBusiness.customization?.fuelChargePerBar ?? 100
  );
  const [extensionFeePerHour, setExtensionFeePerHour] = useState(
    currentBusiness.customization?.extensionFeePerHour ?? 150
  );
  const [fuelMaxBars, setFuelMaxBars] = useState(
    currentBusiness.customization?.fuelMaxBars ?? 8
  );
  const [addOns, setAddOns] = useState<RentalAddOnItem[]>(
    currentBusiness.customization?.addOns || [
      { id: 'addon-helmet', name: '2nd Passenger DOT Certified Helmet', price: 100, isActive: true, description: 'Clean sanitized helmet with clear UV drop-down visor' },
      { id: 'addon-raincoat', name: 'Waterproof Raincoats / Riding Poncho (Pair)', price: 0, isActive: true, description: 'Free emergency weather ponchos provided on request' },
      { id: 'addon-phone-mount', name: 'Vibration-Dampened Mobile Phone Dock & USB Cable', price: 100, isActive: true, description: 'Heavy-duty clamp mount for GPS navigation and charging' },
      { id: 'addon-action-cam', name: 'Action Camera / GoPro Chin & Handlebar Mount', price: 150, isActive: true, description: 'Fixed handlebar/chin bracket ready for action camera recording' },
      { id: 'addon-surf-rack', name: 'Surfboard Side Carrier Rack', price: 200, isActive: true, description: 'Liwliwa-ready padded surfboard carrier for beach rides' }
    ]
  );

  // New custom add-on inputs
  const [newAddonName, setNewAddonName] = useState('');
  const [newAddonPrice, setNewAddonPrice] = useState<number>(0);
  const [newAddonDesc, setNewAddonDesc] = useState('');

  // Social handles & Nominated Pickup Locations State
  const [instagramUrl, setInstagramUrl] = useState(currentBusiness.customization?.instagramUrl || '@rideoutzambales');
  const [tiktokUrl, setTiktokUrl] = useState(currentBusiness.customization?.tiktokUrl || '@rideoutzambales');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<PickupLocation | undefined>(undefined);

  // Preview tab
  const [previewMode, setPreviewMode] = useState<'portal' | 'contract'>('portal');

  // Trip Video Content Reward Program State
  const initialRewardConfig = currentBusiness.customization?.contentRewardConfig || {
    isEnabled: true,
    rewardAmount: 200,
    rewardType: 'cashback_gcash' as RewardType,
    rewardPlatform: 'GCash',
    releaseTiming: 'instant_on_verification' as RewardReleaseTiming,
    validityDays: 90,
    minVideoClips: 1,
    customTerms: 'Renter must take a short 15+ sec video enjoying the ride with helmet on and motorbike clearly visible, tag shop social page, and show public post at counter upon return.'
  };

  const [rewardEnabled, setRewardEnabled] = useState(initialRewardConfig.isEnabled);
  const [rewardAmount, setRewardAmount] = useState(initialRewardConfig.rewardAmount);
  const [rewardType, setRewardType] = useState<RewardType>(initialRewardConfig.rewardType);
  const [rewardPlatform, setRewardPlatform] = useState(initialRewardConfig.rewardPlatform || 'GCash');
  const [rewardReleaseTiming, setRewardReleaseTiming] = useState<RewardReleaseTiming>(initialRewardConfig.releaseTiming);
  const [rewardValidityDays, setRewardValidityDays] = useState(initialRewardConfig.validityDays || 90);
  const [rewardMinClips, setRewardMinClips] = useState(initialRewardConfig.minVideoClips || 1);
  const [rewardCustomTerms, setRewardCustomTerms] = useState(initialRewardConfig.customTerms || '');

  // Smart Dynamic Pricing Engine State
  const initialSmartPricing = currentBusiness.customization?.smartPricingConfig || DEFAULT_SMART_PRICING_CONFIG;
  const [smartPricingEnabled, setSmartPricingEnabled] = useState(initialSmartPricing.isEnabled);
  const [utilizationDiscountEnabled, setUtilizationDiscountEnabled] = useState(initialSmartPricing.utilizationDiscountEnabled);
  const [utilizationThresholdPercent, setUtilizationThresholdPercent] = useState(initialSmartPricing.utilizationThresholdPercent);
  const [utilizationDiscountPercent, setUtilizationDiscountPercent] = useState(initialSmartPricing.utilizationDiscountPercent);
  const [simulatedOccupancyPercent, setSimulatedOccupancyPercent] = useState(initialSmartPricing.simulatedOccupancyPercent ?? 25);
  const [durationDiscountEnabled, setDurationDiscountEnabled] = useState(initialSmartPricing.durationDiscountEnabled);
  const [durationTiers, setDurationTiers] = useState<SmartPricingDurationTier[]>(initialSmartPricing.durationTiers || [
    { id: 'tier-3days', minDays: 3, discountPercent: 10, tierName: 'Weekend Getaway (3+ Days)' },
    { id: 'tier-7days', minDays: 7, discountPercent: 20, tierName: 'Zambales Explorer (7+ Days / Weekly)' },
    { id: 'tier-14days', minDays: 14, discountPercent: 25, tierName: 'Extended Coastal Stay (14+ Days)' },
  ]);
  const [stackDiscounts, setStackDiscounts] = useState(initialSmartPricing.stackDiscounts ?? true);

  // New tier inputs
  const [newTierName, setNewTierName] = useState('Midweek Ride (5+ Days)');
  const [newTierMinDays, setNewTierMinDays] = useState(5);
  const [newTierDiscount, setNewTierDiscount] = useState(15);

  // Manager Simulator State
  const [simBikeId, setSimBikeId] = useState(bikes[0]?.id || 'bike-nmax-01');
  const [simDays, setSimDays] = useState(4);

  // Add Staff Member Form State
  const [showAddStaffForm, setShowAddStaffForm] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffTitle, setNewStaffTitle] = useState('Counter Receptionist');
  const [newStaffPhone, setNewStaffPhone] = useState('0917');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPermissions, setNewStaffPermissions] = useState<StaffPermissions>({
    canInspectPickups: true,
    canApproveReturns: true,
    canManageFleet: false,
    canManageSettings: false,
    canViewFinancialReports: false,
    canAcceptCashHandover: true,
    canManageSmartPricing: false,
    canAccessSocialInbox: true,
  });

  // Section 11: Nearby Towns Marketing Radius & Coverage State
  const [operatingTown, setOperatingTown] = useState(
    currentBusiness.customization?.operatingTown || currentBusiness.location || 'San Felipe, Zambales'
  );
  const [marketingRadiusKm, setMarketingRadiusKm] = useState(
    currentBusiness.customization?.marketingRadiusKm || 35
  );
  const detectedNearbyTowns = getNearbyTownsForLocation(operatingTown);
  const [targetedTowns, setTargetedTowns] = useState<string[]>(
    currentBusiness.customization?.targetedNearbyTowns || 
    detectedNearbyTowns.slice(0, 5).map(t => t.name)
  );
  const [customTownInput, setCustomTownInput] = useState('');

  const handleAddNewStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim()) {
      showToast('Please enter the staff member name', 'error');
      return;
    }
    const currentStaffCount = (currentBusiness.staffUsers?.filter(s => s.role === 'staff') || []).length;
    if (currentStaffCount >= 2) {
      showToast('Maximum of 2 staff accounts reached for this business tier.', 'error');
      return;
    }
    addStaffUser(currentBusiness.id, {
      businessId: currentBusiness.id,
      name: newStaffName.trim(),
      title: newStaffTitle.trim() || 'Counter Staff',
      role: 'staff',
      mobile: newStaffPhone.trim() || '09170000000',
      email: newStaffEmail.trim() || `${newStaffName.toLowerCase().replace(/[^a-z]/g, '')}@rideout.ph`,
      isActive: true,
      permissions: newStaffPermissions,
    });
    setNewStaffName('');
    setNewStaffTitle('Counter Receptionist');
    setNewStaffPhone('0917');
    setNewStaffEmail('');
    setShowAddStaffForm(false);
    showToast(`Added staff user "${newStaffName}" with assigned permissions!`, 'success');
  };

  const handleToggleStaffPermission = (staffId: string, permKey: keyof StaffPermissions, currentVal: boolean) => {
    const staff = currentBusiness.staffUsers?.find(s => s.id === staffId);
    if (!staff) return;
    const updatedPerms = { ...staff.permissions, [permKey]: !currentVal };
    updateStaffUser(currentBusiness.id, staffId, { permissions: updatedPerms });
    showToast(`Updated ${permKey} for ${staff.name}`, 'info');
  };

  const handleToggleAddon = (addonId: string) => {
    setAddOns(prev => prev.map(a => a.id === addonId ? { ...a, isActive: !a.isActive } : a));
  };

  const handleUpdateAddonPrice = (addonId: string, price: number) => {
    setAddOns(prev => prev.map(a => a.id === addonId ? { ...a, price: Math.max(0, price) } : a));
  };

  const handleDeleteAddon = (addonId: string) => {
    setAddOns(prev => prev.filter(a => a.id !== addonId));
    showToast('Add-on item removed');
  };

  const handleAddCustomAddon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddonName.trim()) {
      showToast('Please enter an add-on item name', 'error');
      return;
    }
    const newItem: RentalAddOnItem = {
      id: `addon-${Date.now()}`,
      name: newAddonName.trim(),
      price: Math.max(0, newAddonPrice),
      isActive: true,
      description: newAddonDesc.trim() || undefined,
    };
    setAddOns(prev => [...prev, newItem]);
    setNewAddonName('');
    setNewAddonPrice(0);
    setNewAddonDesc('');
    showToast(`Added "${newItem.name}" to add-ons list!`, 'success');
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile(currentBusiness.id, {
      name,
      tagline,
      ownerName,
      email,
      mobile,
      location,
      logoUrl,
      coverPhotoUrl,
      primaryColor,
      gcashConfig: {
        accountName: gcashAccountName,
        accountNumber: gcashAccountNumber,
        qrCodeUrl: gcashQrUrl,
        depositAmount: gcashDepositAmount,
        instructions: `Send ₱${gcashDepositAmount.toLocaleString()} reservation deposit to ${gcashAccountName} via GCash.`,
      },
      customization: {
        ...currentBusiness.customization,
        depositPerMotorbike,
        fuelChargePerBar,
        extensionFeePerHour,
        fuelMaxBars,
        addOns,
        instagramUrl,
        tiktokUrl,
        contentRewardConfig: {
          isEnabled: rewardEnabled,
          rewardAmount,
          rewardType,
          rewardPlatform,
          releaseTiming: rewardReleaseTiming,
          validityDays: rewardValidityDays,
          minVideoClips: rewardMinClips,
          customTerms: rewardCustomTerms,
        },
        smartPricingConfig: {
          isEnabled: smartPricingEnabled,
          utilizationDiscountEnabled,
          utilizationThresholdPercent,
          utilizationDiscountPercent,
          simulatedOccupancyPercent,
          durationDiscountEnabled,
          durationTiers,
          stackDiscounts,
        },
        targetedNearbyTowns: targetedTowns,
        operatingTown,
        marketingRadiusKm,
      },
    });
    showToast(`Saved branding & customization settings for ${name}!`, 'success');
  };

  const handleFetchFacebook = async () => {
    if (!fbPageUrl.trim()) {
      showToast('Please enter a Facebook Page URL', 'error');
      return;
    }
    setIsImportingFb(true);
    try {
      const result = await importBrandingFromFacebook(currentBusiness.id, fbPageUrl);
      if (result) {
        setName(result.name);
        setLogoUrl(result.logoUrl);
        setCoverPhotoUrl(result.coverPhotoUrl);
      }
    } finally {
      setIsImportingFb(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogoUrl(dataUrl);
      showToast('Custom logo uploaded!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCoverPhotoUrl(dataUrl);
      showToast('Custom cover banner uploaded!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleQrUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setGcashQrUrl(dataUrl);
      showToast('Custom GCash QR code uploaded!', 'success');
    };
    reader.readAsDataURL(file);
  };

  const activeQrCode = gcashQrUrl || generateGCashQRSvg({
    accountName: gcashAccountName || name,
    accountNumber: gcashAccountNumber || mobile,
    amount: gcashDepositAmount,
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-stone-100">
              Shop Branding & Customization
            </h1>
            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30">
              {currentBusiness.subscription.status === 'trial' ? '30-Day Free Trial' : 'Active Partner'}
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-0.5">
            Link your Facebook page to automatically import your logo and cover photos, or customize your brand colors and GCash QR code.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Save className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* SaaS Subscription Status & Graduated Pricing Schedule Banner */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-stone-100 text-xs">
                  Subscription Tier:
                </span>
                {currentBusiness.isFlagship ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Host (Lifetime)
                  </span>
                ) : currentBusiness.subscription.currentTierKey === 'month_7_plus' || (currentBusiness.subscription.currentMonthNumber && currentBusiness.subscription.currentMonthNumber >= 7) ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Month 7+ · Scale Tier (₱1,000 + 1% tx)
                  </span>
                ) : currentBusiness.subscription.currentTierKey === 'months_4_6' || (currentBusiness.subscription.currentMonthNumber && currentBusiness.subscription.currentMonthNumber >= 4) ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                    Months 4–6 · Established Tier (₱1,000/mo)
                  </span>
                ) : currentBusiness.subscription.currentTierKey === 'months_2_3' || (currentBusiness.subscription.currentMonthNumber && currentBusiness.subscription.currentMonthNumber >= 2) ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Months 2–3 · Early Growth (₱500/mo)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                    Month 1 · 30-Day Free Trial (₱0)
                  </span>
                )}
              </div>
              <div className="text-[11px] text-stone-400 mt-0.5">
                {currentBusiness.isFlagship
                  ? 'Master platform owner with unrestricted access'
                  : `Next billing cycle: ${currentBusiness.subscription.nextBillingDate} · Code: ${currentBusiness.subscription.activationCode}`}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-stone-400">Current Monthly Rate:</span>
            <span className="font-mono font-bold text-amber-400 text-sm">
              {currentBusiness.isFlagship
                ? '₱0 (Host)'
                : currentBusiness.subscription.currentTierKey === 'month_7_plus'
                ? `₱${(1000 + Math.round((currentBusiness.subscription.monthlyTransactionVolume || 0) * 0.01)).toLocaleString()}/mo`
                : currentBusiness.subscription.currentTierKey === 'months_4_6'
                ? '₱1,000/mo'
                : currentBusiness.subscription.currentTierKey === 'months_2_3'
                ? '₱500/mo'
                : '₱0 (Trial)'}
            </span>
          </div>
        </div>

        {/* 4-Step Pricing Schedule Progress Tracker */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
          {SUBSCRIPTION_PRICING_SCHEDULE.map((tier, idx) => {
            const isCurrent = currentBusiness.subscription.currentTierKey === tier.key || 
              (idx === 0 && currentBusiness.subscription.status === 'trial') ||
              (idx === 1 && currentBusiness.subscription.currentTierKey === 'months_2_3');

            return (
              <div
                key={tier.key}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  isCurrent
                    ? 'bg-amber-400/10 border-amber-400/50 shadow-sm'
                    : 'bg-stone-950/60 border-stone-800'
                }`}
              >
                <div className="flex items-center justify-between font-mono font-bold">
                  <span className={isCurrent ? 'text-amber-400' : 'text-stone-300'}>
                    {tier.months}
                  </span>
                  <span className={isCurrent ? 'text-amber-300 font-bold' : 'text-stone-400'}>
                    {tier.baseMonthlyFee === 0 ? 'FREE' : `₱${tier.baseMonthlyFee.toLocaleString()}${tier.transactionFeePercent > 0 ? ' + 1%' : ''}`}
                  </span>
                </div>
                <div className="font-semibold text-stone-200 mt-0.5 text-[10px]">
                  {tier.label}
                </div>
                <div className="text-[10px] text-stone-400 line-clamp-1 mt-0.5">
                  {tier.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customization Forms (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Section 1: Facebook Page Integration & Direct Sign In */}
          <div className="p-5 rounded-2xl border border-blue-500/30 bg-gradient-to-b from-blue-950/30 via-stone-900 to-stone-900 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase tracking-wider">
                <Facebook className="w-4 h-4 fill-current" />
                <span>1. Facebook Page Integration & Messenger Sync</span>
              </div>
              <span className="text-[10px] text-blue-300 font-semibold bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Meta Sync</span>
              </span>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              Sign in with Facebook or link your Page URL to pull your verified <strong className="text-white">logo</strong>, high-res <strong className="text-white">cover photo</strong>, and link the Page's Messenger inbox directly to your <strong className="text-white">Unified Social Inbox</strong>.
            </p>

            {/* Direct "Sign in & Connect with Facebook" Callout */}
            <div className="p-3.5 rounded-xl bg-blue-950/50 border border-blue-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Facebook className="w-3.5 h-3.5 fill-current text-blue-400" />
                  <span>Interactive Facebook Page OAuth</span>
                </div>
                <p className="text-[11px] text-blue-200/80">
                  Authorizes Messenger inbox sync, page logo, and cover photo in 1 step.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsFbConnectModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 shrink-0"
              >
                <Facebook className="w-3.5 h-3.5 fill-current" />
                <span>Connect with Facebook</span>
                <ExternalLink className="w-3 h-3 opacity-80" />
              </button>
            </div>

            {/* Connected Facebook Page Status Card */}
            {currentBusiness.facebookBranding && (
              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={logoUrl || currentBusiness.facebookBranding.pageUrl}
                    alt=""
                    className="w-9 h-9 rounded-lg object-cover border border-stone-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/assets/images/bike_urban_scooter_1793338342006.jpg';
                    }}
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-100 truncate">
                        {currentBusiness.facebookBranding.pageName}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    </div>
                    <span className="text-[10px] text-stone-400 block truncate">
                      {currentBusiness.facebookBranding.followersCount?.toLocaleString()} followers · {currentBusiness.facebookBranding.pageCategory || 'Motorcycle Rental'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                    Inbox Synced
                  </span>
                </div>
              </div>
            )}

            {/* Manual URL Input Option */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] text-stone-400 font-medium block">
                Or enter Facebook Page URL manually:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Link2 className="w-4 h-4 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={fbPageUrl}
                    onChange={(e) => setFbPageUrl(e.target.value)}
                    placeholder="https://facebook.com/yourrentalshop"
                    className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 focus:border-blue-400 rounded-lg text-stone-100 text-xs font-mono"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFetchFacebook}
                  disabled={isImportingFb}
                  className="px-4 py-2 text-xs font-semibold text-white bg-stone-800 hover:bg-stone-700 disabled:opacity-50 rounded-lg border border-stone-700 flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                >
                  {isImportingFb ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Extracting Branding...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      <span>Fetch & Apply FB Branding</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Demo Presets */}
            <div className="pt-2 border-t border-blue-500/20 space-y-1.5">
              <span className="text-[10px] text-stone-400 uppercase font-semibold">Quick test with sample Philippine rental depots:</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Liwliwa Surf & Moto', url: 'https://facebook.com/liwliwasurfrentals' },
                  { label: 'Elyu Wheels & Waves', url: 'https://facebook.com/elyuwheels' },
                  { label: 'Siargao Island Motos', url: 'https://facebook.com/siargaomotos' },
                  { label: 'RideOut Zambales', url: 'https://facebook.com/rideoutzambales' },
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFbPageUrl(preset.url);
                      importBrandingFromFacebook(currentBusiness.id, preset.url).then((res) => {
                        if (res) {
                          setName(res.name);
                          setLogoUrl(res.logoUrl);
                          setCoverPhotoUrl(res.coverPhotoUrl);
                        }
                      });
                    }}
                    className="text-[11px] px-2 py-1 rounded bg-stone-900 border border-stone-800 hover:border-blue-400 text-stone-300 hover:text-white transition-colors"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 2: Logo & Cover Photo Upload */}
          <div className="p-5 rounded-xl border border-stone-800 bg-stone-900 shadow-sm space-y-5 text-xs">
            <div className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
              <Upload className="w-4 h-4 text-amber-400" />
              <span>2. Visual Assets (Logo & Cover Photo)</span>
            </div>

            {/* Cover Photo Banner */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-stone-300 font-semibold">Panoramic Cover Banner Photo</label>
                <span className="text-[10px] text-stone-500">Recommended: 1200x450 JPG/PNG</span>
              </div>
              <div className="relative h-36 rounded-xl overflow-hidden border border-stone-800 bg-stone-950 group">
                <img
                  src={coverPhotoUrl}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="px-4 py-2 bg-stone-900/90 hover:bg-stone-800 text-stone-100 rounded-lg text-xs font-semibold cursor-pointer border border-stone-700 flex items-center gap-1.5 shadow-md">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Change Cover Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Logo Avatar */}
            <div className="flex items-center gap-5 pt-2">
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-stone-700 bg-stone-950 shrink-0 group shadow-md">
                <img
                  src={logoUrl}
                  alt="Logo Preview"
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white">
                  <Upload className="w-4 h-4 text-amber-400" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="space-y-1.5 flex-1">
                <div className="font-semibold text-stone-200">Shop Logo / Avatar</div>
                <p className="text-[11px] text-stone-400 leading-relaxed">
                  Displayed on customer confirmations, vehicle inspection certificates, and navigation bar.
                </p>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-xs font-medium cursor-pointer border border-stone-700 transition-colors">
                  <Upload className="w-3 h-3 text-amber-400" />
                  <span>Upload Custom Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Shop Identity & Contact Details */}
          <div className="p-5 rounded-xl border border-stone-800 bg-stone-900 shadow-sm space-y-4 text-xs">
            <div className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>3. Business Details & Depot Location</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-stone-400 mb-1">Rental Business Display Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-semibold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-stone-400 mb-1">Tagline / Subheading</label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Business Owner / Manager *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Depot Mobile (11 Digits) *</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Business Contact Email *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Depot / Main Pickup Address *</label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200"
                />
              </div>
            </div>
          </div>

          {/* Section 4: GCash Payment Settings & QR Code */}
          <div className="p-5 rounded-xl border border-stone-800 bg-stone-900 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-blue-400" />
                <span>4. GCash Payment Settings & QR Code</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Direct to Your Account
              </span>
            </div>

            <p className="text-stone-400 leading-relaxed">
              Customers will pay deposits directly to these details. They get an <strong>"Open GCash App"</strong> button along with your GCash QR code.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-stone-400 mb-1">GCash Verified Account Name *</label>
                <input
                  type="text"
                  required
                  value={gcashAccountName}
                  onChange={(e) => setGcashAccountName(e.target.value.toUpperCase())}
                  placeholder="e.g. LIWLIWA MOTO / CARLO M."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">GCash Mobile Number (11 Digits) *</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={gcashAccountNumber}
                  onChange={(e) => setGcashAccountNumber(e.target.value)}
                  placeholder="0917 832 9900"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono font-bold text-sm tracking-wider"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Default Reservation Deposit (PHP)</label>
                <input
                  type="number"
                  min={500}
                  step={100}
                  value={gcashDepositAmount}
                  onChange={(e) => setGcashDepositAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-amber-400 font-mono font-bold"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="w-full py-2 px-3 border border-dashed border-stone-700 hover:border-blue-400 rounded-lg text-stone-300 font-medium cursor-pointer bg-stone-950 flex items-center justify-center gap-2 transition-colors text-center">
                  <Upload className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span className="truncate">{gcashQrUrl ? 'Replace Uploaded QR Code' : 'Upload Your GCash QR Code'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleQrUpload}
                    className="hidden"
                  />
                </label>
                {gcashQrUrl && (
                  <button
                    type="button"
                    onClick={() => setGcashQrUrl('')}
                    className="text-[10px] text-stone-500 hover:text-red-400 underline mt-1 text-center"
                  >
                    Reset to auto-generated vector QR
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 5: Service Customization & Add-on Manager (Explicitly requested by user) */}
          <div className="p-5 rounded-xl border border-stone-800 bg-stone-900 shadow-sm space-y-5 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>5. Service Pricing, Fuel Rate & Add-on Manager</span>
              </div>
              <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                Customizable per Shop
              </span>
            </div>

            <p className="text-stone-400 leading-relaxed">
              Configure your shop's security deposit, missing fuel fee per bar, late return hourly extension fee, and customer add-on accessories.
            </p>

            {/* Core Service Rates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border border-stone-800 bg-stone-950">
              <div>
                <label className="block text-stone-400 mb-1 font-medium">1. Security Deposit per Bike</label>
                <div className="flex items-center gap-1">
                  <span className="text-stone-500 font-mono">₱</span>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={depositPerMotorbike}
                    onChange={(e) => setDepositPerMotorbike(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded font-mono font-bold text-amber-400"
                  />
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">Held during rental & refunded at return</span>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">2. Charge per Missing Fuel Bar</label>
                <div className="flex items-center gap-1">
                  <span className="text-stone-500 font-mono">₱</span>
                  <input
                    type="number"
                    min={0}
                    step={10}
                    value={fuelChargePerBar}
                    onChange={(e) => setFuelChargePerBar(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded font-mono font-bold text-amber-400"
                  />
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">Default ₱100 / missing bar at drop-off</span>
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">3. Extension Fee per Hour</label>
                <div className="flex items-center gap-1">
                  <span className="text-stone-500 font-mono">₱</span>
                  <input
                    type="number"
                    min={0}
                    step={25}
                    value={extensionFeePerHour}
                    onChange={(e) => setExtensionFeePerHour(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded font-mono font-bold text-amber-400"
                  />
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">Rounded off to the nearest hour</span>
              </div>
            </div>

            {/* Add-on Accessories Manager with Tick Boxes and P0 Support */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-stone-200">Add-On Accessories & Options</h4>
                  <p className="text-[11px] text-stone-400">
                    Use the tick box to activate options. Set <strong>₱0</strong> for items offered for free upon request.
                  </p>
                </div>
                <span className="text-[10px] text-stone-500 font-mono">
                  {addOns.filter(a => a.isActive).length} Active Add-ons
                </span>
              </div>

              <div className="space-y-2">
                {addOns.map((addon) => (
                  <div 
                    key={addon.id} 
                    className={`p-3 rounded-lg border transition-colors flex items-center justify-between gap-3 ${
                      addon.isActive 
                        ? 'border-stone-800 bg-stone-950/80' 
                        : 'border-stone-900 bg-stone-950/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={addon.isActive}
                        onChange={() => handleToggleAddon(addon.id)}
                        className="accent-amber-400 w-4 h-4 cursor-pointer shrink-0"
                        title={addon.isActive ? 'Deactivate add-on' : 'Activate add-on'}
                      />
                      <div className="truncate flex-1">
                        <div className="font-semibold text-stone-200 text-xs flex items-center gap-2">
                          <span className="truncate">{addon.name}</span>
                          {addon.price === 0 && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                              FREE ON REQUEST
                            </span>
                          )}
                        </div>
                        {addon.description && (
                          <div className="text-[10px] text-stone-500 truncate">{addon.description}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded px-2 py-1">
                        <span className="text-[11px] text-stone-500 font-mono">₱</span>
                        <input
                          type="number"
                          min={0}
                          step={10}
                          value={addon.price}
                          onChange={(e) => handleUpdateAddonPrice(addon.id, Number(e.target.value))}
                          className="w-16 bg-transparent font-mono font-bold text-stone-100 text-xs focus:outline-hidden"
                          title="Enter 0 for free item"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteAddon(addon.id)}
                        className="p-1.5 text-stone-600 hover:text-red-400 transition-colors rounded"
                        title="Delete add-on"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Custom Add-on Form */}
              <div className="p-3.5 rounded-lg border border-dashed border-stone-800 bg-stone-950/40 space-y-2.5">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add New Accessory / Add-on</span>
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-6">
                    <input
                      type="text"
                      placeholder="e.g. Action Camera / GoPro Mount, Surfboard Rack..."
                      value={newAddonName}
                      onChange={(e) => setNewAddonName(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-200 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-3 flex items-center gap-1 bg-stone-900 border border-stone-800 rounded px-2">
                    <span className="text-stone-500 font-mono text-xs">₱</span>
                    <input
                      type="number"
                      min={0}
                      step={10}
                      placeholder="Price (0 = free)"
                      value={newAddonPrice}
                      onChange={(e) => setNewAddonPrice(Number(e.target.value))}
                      className="w-full bg-transparent font-mono text-xs text-stone-200 py-1.5 focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <button
                      type="button"
                      onClick={handleAddCustomAddon}
                      className="w-full py-1.5 px-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded text-xs flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3 stroke-[3]" />
                      <span>Add Option</span>
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Optional short description for customers..."
                  value={newAddonDesc}
                  onChange={(e) => setNewAddonDesc(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-300 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 6: Nominated Pickup Locations & Google Maps Pinning */}
          <div className="p-5 rounded-xl border border-stone-800 bg-stone-900 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>6. Nominated Pickup Locations (Google Maps Pinned)</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setEditingLocation(undefined);
                  setIsLocationModalOpen(true);
                }}
                className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm transition-colors"
              >
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
                <span>Nominate Location</span>
              </button>
            </div>

            <p className="text-stone-400 leading-relaxed">
              Nominate specific pickup hubs, beach drops, and partner resorts for customers. Customers can view exact pins on Google Maps with turn-by-turn directions.
            </p>

            <div className="space-y-2.5">
              {(currentBusiness.customization?.nominatedPickupLocations || INITIAL_NOMINATED_LOCATIONS).map((loc) => (
                <div
                  key={loc.id}
                  className="p-3.5 rounded-xl border border-stone-800 bg-stone-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-100 text-xs">{loc.name}</span>
                      {loc.isDepotHQ && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          MAIN DEPOT HQ
                        </span>
                      )}
                      <span className="text-[10px] text-stone-400 font-mono">
                        ({loc.coordinates.lat.toFixed(4)}, {loc.coordinates.lng.toFixed(4)})
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400">
                      {loc.address} · <span className="text-amber-400/90 font-medium">{loc.landmark}</span>
                    </div>
                    <div className="text-[10px] text-stone-500">
                      Hours: {loc.operatingHours} · Delivery: <strong className="text-stone-300">{loc.deliveryFee === 0 ? 'FREE' : `+₱${loc.deliveryFee}`}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <a
                      href={loc.googleMapsUrl || `https://maps.google.com/?q=${loc.coordinates.lat},${loc.coordinates.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                      title="Open pinned coordinates in Google Maps"
                    >
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>Pin Map</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingLocation(loc);
                        setIsLocationModalOpen(true);
                      }}
                      className="px-2 py-1 text-[11px] text-stone-400 hover:text-stone-200"
                    >
                      Edit
                    </button>
                    {!loc.isDepotHQ && (
                      <button
                        type="button"
                        onClick={() => deleteNominatedPickupLocation(currentBusiness.id, loc.id)}
                        className="p-1 text-stone-600 hover:text-red-400"
                        title="Remove location"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 7: Social Media Channels (Instagram & TikTok) & Google Business */}
          <div className="p-5 rounded-xl border border-stone-800 bg-stone-900 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>7. Social Channels & Google Business Profile Hub</span>
              </div>
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(true)}
                className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Drive & Sheets Archive</span>
              </button>
            </div>

            <p className="text-stone-400 leading-relaxed">
              Connect your Instagram and TikTok handles so renters who don't use Facebook can follow your official channels for trip updates, tags, and reviews.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-400 mb-1 font-medium">Instagram Account (@handle or URL)</label>
                <input
                  type="text"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="@rideoutzambales"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 font-medium">TikTok Account (@handle or URL)</label>
                <input
                  type="text"
                  value={tiktokUrl}
                  onChange={(e) => setTiktokUrl(e.target.value)}
                  placeholder="@rideoutzambales"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-400/20 border border-emerald-400/30 flex items-center justify-center text-emerald-400 font-bold">
                  G
                </div>
                <div>
                  <div className="font-bold text-stone-200">Google Business Profile & Master Sheets</div>
                  <div className="text-[11px] text-stone-400">Syndicating customer reviews to Google search & maps</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsArchiveModalOpen(true)}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold"
              >
                Manage Profile & Archives
              </button>
            </div>
          </div>

          {/* SECTION 8: DEPOT STAFF ACCOUNTS & RBAC PERMISSIONS */}
          <div className="p-5 rounded-xl border border-stone-800 bg-stone-900/60 space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-stone-100 text-sm">
                    8. Depot Staff Accounts & Role Permissions
                  </h3>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  1 Manager (Owner) + up to 2 staff members. Managers customize exact rights per staff using tickboxes.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-800 text-stone-300 border border-stone-700">
                  {(currentBusiness.staffUsers?.filter(s => s.role === 'staff') || []).length} / 2 Staff Active
                </span>
                {(currentBusiness.staffUsers?.filter(s => s.role === 'staff') || []).length < 2 && (
                  <button
                    type="button"
                    onClick={() => setShowAddStaffForm(!showAddStaffForm)}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded text-xs flex items-center gap-1 shadow-sm transition-colors"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Add Staff</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Operator Switcher Pill */}
            <div className="p-3 rounded-lg bg-amber-400/10 border border-amber-400/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-stone-300">
                  Current Active Console Operator:{' '}
                  <strong className="text-amber-300 font-bold">{activeStaffUser.name}</strong> ({activeStaffUser.title} - {activeStaffUser.role.toUpperCase()})
                </span>
              </div>
              <span className="text-[10px] font-mono text-stone-400">
                Switch below to simulate staff login
              </span>
            </div>

            {/* Manager Account (Primary / Immutable) */}
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-sm">
                    👑
                  </div>
                  <div>
                    <div className="font-bold text-stone-100 flex items-center gap-1.5">
                      <span>{currentBusiness.ownerName}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
                        PRIMARY MANAGER
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono">
                      {currentBusiness.email} · {currentBusiness.mobile}
                    </div>
                  </div>
                </div>

                {activeStaffUser.role !== 'manager' && (
                  <button
                    type="button"
                    onClick={() => {
                      const managerUser = currentBusiness.staffUsers?.find(s => s.role === 'manager');
                      if (managerUser) switchActiveStaffUser(managerUser.id);
                    }}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded border border-stone-700"
                  >
                    Switch to Manager
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-800/80 text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Pickup Inspections</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Return Approvals</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Fleet & AI Studio</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Shop Settings & QR</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Financial Reports</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Cash Handover</span>
                </div>
              </div>
            </div>

            {/* Staff Users (1 to 2 members) */}
            <div className="space-y-3">
              {(currentBusiness.staffUsers?.filter(s => s.role === 'staff') || []).map((staff) => {
                const isOperator = activeStaffUser.id === staff.id;

                return (
                  <div
                    key={staff.id}
                    className={`p-4 rounded-xl border transition-all space-y-3 ${
                      isOperator
                        ? 'bg-amber-400/5 border-amber-400/50 shadow-sm'
                        : 'bg-stone-950 border-stone-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-stone-800 text-amber-400 font-bold flex items-center justify-center text-sm border border-stone-700">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-stone-100 flex items-center gap-2">
                            <span>{staff.name}</span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-stone-800 text-stone-300 border border-stone-700">
                              {staff.title}
                            </span>
                            {isOperator && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                ACTIVE OPERATOR
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 font-mono">
                            {staff.email} · {staff.mobile}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isOperator ? (
                          <button
                            type="button"
                            onClick={() => switchActiveStaffUser(staff.id)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-stone-800 hover:bg-stone-700 text-amber-400 rounded border border-stone-700"
                          >
                            Simulate Login as {staff.name.split(' ')[0]}
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                            Logged in
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Remove staff member ${staff.name}?`)) {
                              deleteStaffUser(currentBusiness.id, staff.id);
                            }
                          }}
                          className="p-1.5 text-stone-500 hover:text-red-400 rounded hover:bg-stone-900 transition-colors"
                          title="Remove Staff User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Permissions Matrix with Tickboxes */}
                    <div className="pt-2 border-t border-stone-800/80 space-y-1.5">
                      <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Manager-Assigned Rights (Check/Uncheck to Grant Rights):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-[11px]">
                        <label className="flex items-center gap-2 p-1.5 rounded bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700">
                          <input
                            type="checkbox"
                            checked={staff.permissions.canInspectPickups}
                            onChange={() => handleToggleStaffPermission(staff.id, 'canInspectPickups', staff.permissions.canInspectPickups)}
                            className="w-3.5 h-3.5 rounded text-amber-400 focus:ring-0 bg-stone-950 border-stone-700"
                          />
                          <span className={staff.permissions.canInspectPickups ? 'text-stone-200 font-medium' : 'text-stone-500'}>
                            Vehicle Pickup & Handover
                          </span>
                        </label>

                        <label className="flex items-center gap-2 p-1.5 rounded bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700">
                          <input
                            type="checkbox"
                            checked={staff.permissions.canApproveReturns}
                            onChange={() => handleToggleStaffPermission(staff.id, 'canApproveReturns', staff.permissions.canApproveReturns)}
                            className="w-3.5 h-3.5 rounded text-amber-400 focus:ring-0 bg-stone-950 border-stone-700"
                          />
                          <span className={staff.permissions.canApproveReturns ? 'text-stone-200 font-medium' : 'text-stone-500'}>
                            Returns & Deposit Release
                          </span>
                        </label>

                        <label className="flex items-center gap-2 p-1.5 rounded bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700">
                          <input
                            type="checkbox"
                            checked={staff.permissions.canManageFleet}
                            onChange={() => handleToggleStaffPermission(staff.id, 'canManageFleet', staff.permissions.canManageFleet)}
                            className="w-3.5 h-3.5 rounded text-amber-400 focus:ring-0 bg-stone-950 border-stone-700"
                          />
                          <span className={staff.permissions.canManageFleet ? 'text-stone-200 font-medium' : 'text-stone-500'}>
                            Fleet & AI Photo Studio
                          </span>
                        </label>

                        <label className="flex items-center gap-2 p-1.5 rounded bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700">
                          <input
                            type="checkbox"
                            checked={staff.permissions.canManageSettings}
                            onChange={() => handleToggleStaffPermission(staff.id, 'canManageSettings', staff.permissions.canManageSettings)}
                            className="w-3.5 h-3.5 rounded text-amber-400 focus:ring-0 bg-stone-950 border-stone-700"
                          />
                          <span className={staff.permissions.canManageSettings ? 'text-stone-200 font-medium' : 'text-stone-500'}>
                            Shop Settings & Branding
                          </span>
                        </label>

                        <label className="flex items-center gap-2 p-1.5 rounded bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700">
                          <input
                            type="checkbox"
                            checked={staff.permissions.canViewFinancialReports}
                            onChange={() => handleToggleStaffPermission(staff.id, 'canViewFinancialReports', staff.permissions.canViewFinancialReports)}
                            className="w-3.5 h-3.5 rounded text-amber-400 focus:ring-0 bg-stone-950 border-stone-700"
                          />
                          <span className={staff.permissions.canViewFinancialReports ? 'text-stone-200 font-medium' : 'text-stone-500'}>
                            Financial Reports & Sheets
                          </span>
                        </label>

                        <label className="flex items-center gap-2 p-1.5 rounded bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700">
                          <input
                            type="checkbox"
                            checked={staff.permissions.canAcceptCashHandover}
                            onChange={() => handleToggleStaffPermission(staff.id, 'canAcceptCashHandover', staff.permissions.canAcceptCashHandover)}
                            className="w-3.5 h-3.5 rounded text-amber-400 focus:ring-0 bg-stone-950 border-stone-700"
                          />
                          <span className={staff.permissions.canAcceptCashHandover ? 'text-stone-200 font-medium' : 'text-stone-500'}>
                            Counter Cash Handover
                          </span>
                        </label>

                        <label className="flex items-center gap-2 p-1.5 rounded bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700">
                          <input
                            type="checkbox"
                            checked={Boolean(staff.permissions.canManageSmartPricing)}
                            onChange={() => handleToggleStaffPermission(staff.id, 'canManageSmartPricing', Boolean(staff.permissions.canManageSmartPricing))}
                            className="w-3.5 h-3.5 rounded text-amber-400 focus:ring-0 bg-stone-950 border-stone-700"
                          />
                          <span className={staff.permissions.canManageSmartPricing ? 'text-stone-200 font-medium' : 'text-stone-500'}>
                            Smart Pricing Engine
                          </span>
                        </label>

                        <label className="flex items-center gap-2 p-1.5 rounded bg-stone-900 border border-stone-800 cursor-pointer hover:border-stone-700">
                          <input
                            type="checkbox"
                            checked={staff.permissions.canAccessSocialInbox !== false}
                            onChange={() => handleToggleStaffPermission(staff.id, 'canAccessSocialInbox', staff.permissions.canAccessSocialInbox !== false)}
                            className="w-3.5 h-3.5 rounded text-amber-400 focus:ring-0 bg-stone-950 border-stone-700"
                          />
                          <span className={staff.permissions.canAccessSocialInbox !== false ? 'text-stone-200 font-medium' : 'text-stone-500'}>
                            Social Inbox & Chats
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inline Add Staff Form */}
            {showAddStaffForm && (
              <form onSubmit={handleAddNewStaff} className="p-4 rounded-xl bg-stone-950 border border-amber-400/40 space-y-3">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <UserPlus className="w-4 h-4" />
                    <span>Add New Staff Account (1-2 Staff Limit)</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddStaffForm(false)}
                    className="text-stone-400 hover:text-white text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-stone-400 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      placeholder="e.g. Leo Miranda"
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">Job Title / Designation</label>
                    <input
                      type="text"
                      value={newStaffTitle}
                      onChange={(e) => setNewStaffTitle(e.target.value)}
                      placeholder="e.g. Lead Mechanic & Handover Staff"
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-100"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">Mobile (11 Digits)</label>
                    <input
                      type="tel"
                      value={newStaffPhone}
                      onChange={(e) => setNewStaffPhone(e.target.value)}
                      placeholder="0917 123 4567"
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 mb-1">Work Email</label>
                    <input
                      type="email"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      placeholder="staff@rideout.ph"
                      className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-100 font-mono"
                    />
                  </div>
                </div>

                {/* Permissions tickboxes for new staff */}
                <div className="pt-2 border-t border-stone-800 space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Initial Granted Permissions:
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={newStaffPermissions.canInspectPickups}
                        onChange={(e) => setNewStaffPermissions({ ...newStaffPermissions, canInspectPickups: e.target.checked })}
                        className="rounded text-amber-400 bg-stone-900 border-stone-700"
                      />
                      <span>Vehicle Pickups</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={newStaffPermissions.canApproveReturns}
                        onChange={(e) => setNewStaffPermissions({ ...newStaffPermissions, canApproveReturns: e.target.checked })}
                        className="rounded text-amber-400 bg-stone-900 border-stone-700"
                      />
                      <span>Returns & Deposit</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={newStaffPermissions.canManageFleet}
                        onChange={(e) => setNewStaffPermissions({ ...newStaffPermissions, canManageFleet: e.target.checked })}
                        className="rounded text-amber-400 bg-stone-900 border-stone-700"
                      />
                      <span>Fleet & AI Studio</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={newStaffPermissions.canManageSettings}
                        onChange={(e) => setNewStaffPermissions({ ...newStaffPermissions, canManageSettings: e.target.checked })}
                        className="rounded text-amber-400 bg-stone-900 border-stone-700"
                      />
                      <span>Shop Settings</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={newStaffPermissions.canViewFinancialReports}
                        onChange={(e) => setNewStaffPermissions({ ...newStaffPermissions, canViewFinancialReports: e.target.checked })}
                        className="rounded text-amber-400 bg-stone-900 border-stone-700"
                      />
                      <span>Financial Reports</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={newStaffPermissions.canAcceptCashHandover}
                        onChange={(e) => setNewStaffPermissions({ ...newStaffPermissions, canAcceptCashHandover: e.target.checked })}
                        className="rounded text-amber-400 bg-stone-900 border-stone-700"
                      />
                      <span>Cash Handover</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={Boolean(newStaffPermissions.canManageSmartPricing)}
                        onChange={(e) => setNewStaffPermissions({ ...newStaffPermissions, canManageSmartPricing: e.target.checked })}
                        className="rounded text-amber-400 bg-stone-900 border-stone-700"
                      />
                      <span>Smart Pricing</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-stone-300">
                      <input
                        type="checkbox"
                        checked={newStaffPermissions.canAccessSocialInbox !== false}
                        onChange={(e) => setNewStaffPermissions({ ...newStaffPermissions, canAccessSocialInbox: e.target.checked })}
                        className="rounded text-amber-400 bg-stone-900 border-stone-700"
                      />
                      <span>Social Inbox</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded text-xs transition-colors shadow-sm"
                  >
                    Save & Create Staff Account
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* SECTION 9: TRIP VIDEO RENTER REWARD PROGRAM (OPTIONAL) */}
          <div className="p-5 rounded-xl border border-stone-800 bg-stone-900/60 space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Film className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-stone-100 text-sm">
                    9. Trip Video Renter Reward Program (Optional)
                  </h3>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Reward renters who submit Zambales trip video clips and tag your business social media. Choose whether to enable this, reward sum, format, and payout terms.
                </p>
              </div>

              {/* Master Optional Program Toggle */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={rewardEnabled}
                  onChange={(e) => setRewardEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                <span className="ml-2 text-xs font-bold text-stone-200">
                  {rewardEnabled ? 'Reward Active' : 'Disabled'}
                </span>
              </label>
            </div>

            {rewardEnabled ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1 font-medium">Reward Amount (PHP)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-stone-500 font-mono">₱</span>
                      <input
                        type="number"
                        min="50"
                        step="50"
                        value={rewardAmount}
                        onChange={(e) => setRewardAmount(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full pl-7 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-amber-400 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1 font-medium">Reward Format</label>
                    <select
                      value={rewardType}
                      onChange={(e) => {
                        const val = e.target.value as RewardType;
                        setRewardType(val);
                        if (val === 'cashback_gcash') setRewardPlatform('GCash');
                        else if (val === 'cash_at_counter') setRewardPlatform('Cash Handover');
                        else if (val === 'rental_voucher') setRewardPlatform('Rental Voucher Pass');
                        else if (val === 'fuel_credit') setRewardPlatform('Fuel Bar Credit');
                      }}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs font-medium"
                    >
                      <option value="cashback_gcash">GCash Cashback (Direct to Mobile)</option>
                      <option value="cash_at_counter">Cash Handed Over at Depot Counter</option>
                      <option value="rental_voucher">Next Rental Voucher / Discount Pass</option>
                      <option value="fuel_credit">Fuel Bar Credit / Gas Refund</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1 font-medium">Release Timing</label>
                    <select
                      value={rewardReleaseTiming}
                      onChange={(e) => setRewardReleaseTiming(e.target.value as RewardReleaseTiming)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs font-medium"
                    >
                      <option value="instant_on_verification">Instant upon return counter verification</option>
                      <option value="on_successful_inspection">Released together with deposit refund</option>
                      <option value="within_24_hours">Credited within 24 hours of admin review</option>
                      <option value="next_rental_booking">Credited automatically on next booking</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-400 mb-1 font-medium">Payout Platform / Channel Label</label>
                    <input
                      type="text"
                      value={rewardPlatform}
                      onChange={(e) => setRewardPlatform(e.target.value)}
                      placeholder="e.g. GCash, Maya, Counter Cash, Voucher"
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-stone-400 mb-1 font-medium">Voucher Validity (Days, if applicable)</label>
                    <input
                      type="number"
                      min="7"
                      value={rewardValidityDays}
                      onChange={(e) => setRewardValidityDays(parseInt(e.target.value) || 90)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-medium">Custom Reward Terms & Availing Conditions</label>
                  <textarea
                    rows={2}
                    value={rewardCustomTerms}
                    onChange={(e) => setRewardCustomTerms(e.target.value)}
                    placeholder="Describe specific rules (e.g. 15-sec video with helmet on, tag shop page on IG/FB/TikTok, show post at return counter)"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs leading-relaxed"
                  />
                </div>

                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-stone-300">
                      Renter Reward Summary:{' '}
                      <strong className="text-amber-400">₱{rewardAmount}</strong> via{' '}
                      <span className="text-stone-200 font-semibold">{rewardPlatform}</span> (
                      {rewardReleaseTiming.replace(/_/g, ' ')})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateContentRewardConfig(currentBusiness.id, {
                        isEnabled: rewardEnabled,
                        rewardAmount,
                        rewardType,
                        rewardPlatform,
                        releaseTiming: rewardReleaseTiming,
                        validityDays: rewardValidityDays,
                        minVideoClips: rewardMinClips,
                        customTerms: rewardCustomTerms,
                      });
                      showToast('Saved Trip Video Renter Reward Program settings!', 'success');
                    }}
                    className="px-3 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 rounded font-semibold self-start sm:self-auto"
                  >
                    Save Reward Terms
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-stone-950 border border-stone-800 text-stone-400 text-center">
                The Trip Video Cashback Reward is currently <strong>disabled</strong> for {name}. Renters will not be prompted for video rewards during return inspection. Toggle on above to configure rewards.
              </div>
            )}
          </div>

          {/* SECTION 10: SMART DYNAMIC PRICING & FLEET UTILIZATION ENGINE */}
          <div className="p-5 rounded-xl border border-stone-800 bg-stone-900/60 space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-stone-100 text-sm">
                    10. Smart Dynamic Pricing & Utilization Engine
                  </h3>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Automate discounts based on daily fleet utilization and rental duration lengths (e.g. 10% discount if rented for X number of days).
                </p>
              </div>

              {/* Master Engine Toggle */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={smartPricingEnabled}
                  onChange={(e) => setSmartPricingEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-400"></div>
                <span className="ml-2 text-xs font-bold text-stone-200">
                  {smartPricingEnabled ? 'Engine Active' : 'Engine Paused'}
                </span>
              </label>
            </div>

            {smartPricingEnabled ? (
              <div className="space-y-5">
                {/* 10.1: Fleet Utilization Dynamic Discount */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-emerald-400" />
                      <span className="font-bold text-stone-200">
                        A. Daily Fleet Utilization Auto-Discount
                      </span>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={utilizationDiscountEnabled}
                        onChange={(e) => setUtilizationDiscountEnabled(e.target.checked)}
                        className="rounded text-amber-400 bg-stone-900 border-stone-700 w-3.5 h-3.5"
                      />
                      <span className="text-[11px] text-stone-300 font-medium">Enable Promo</span>
                    </label>
                  </div>

                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Automatically trigger a percentage flash discount on quiet days when depot booked motorbikes fall at or below your defined threshold.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-stone-300">
                        <label className="font-medium">Trigger Threshold (Fleet Occupancy):</label>
                        <span className="font-mono text-amber-400 font-bold">≤ {utilizationThresholdPercent}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        step="5"
                        value={utilizationThresholdPercent}
                        onChange={(e) => setUtilizationThresholdPercent(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                      <div className="text-[10px] text-stone-500">
                        Apply discount when depot booked fleet is at or under {utilizationThresholdPercent}%.
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-stone-300">
                        <label className="font-medium">Flash Discount Percentage:</label>
                        <span className="font-mono text-emerald-400 font-bold">-{utilizationDiscountPercent}% OFF</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="40"
                        step="5"
                        value={utilizationDiscountPercent}
                        onChange={(e) => setUtilizationDiscountPercent(Number(e.target.value))}
                        className="w-full accent-emerald-400 cursor-pointer"
                      />
                      <div className="text-[10px] text-stone-500">
                        Renters receive -{utilizationDiscountPercent}% off daily motorbike rates.
                      </div>
                    </div>
                  </div>

                  {/* Interactive Depot Occupancy Simulator Slider */}
                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-300">
                        Simulate Depot Fleet Occupancy Today:
                      </span>
                      <span className="font-mono text-xs font-bold text-stone-100">
                        {simulatedOccupancyPercent}% Booked
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={simulatedOccupancyPercent}
                      onChange={(e) => setSimulatedOccupancyPercent(Number(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSimulatedOccupancyPercent(20)}
                          className="px-2 py-0.5 rounded text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono"
                        >
                          20% Slow
                        </button>
                        <button
                          type="button"
                          onClick={() => setSimulatedOccupancyPercent(40)}
                          className="px-2 py-0.5 rounded text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono"
                        >
                          40% Normal
                        </button>
                        <button
                          type="button"
                          onClick={() => setSimulatedOccupancyPercent(85)}
                          className="px-2 py-0.5 rounded text-[10px] bg-stone-800 hover:bg-stone-700 text-stone-300 font-mono"
                        >
                          85% Peak
                        </button>
                      </div>

                      <div className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                        utilizationDiscountEnabled && simulatedOccupancyPercent <= utilizationThresholdPercent
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-stone-800 text-stone-400'
                      }`}>
                        {utilizationDiscountEnabled && simulatedOccupancyPercent <= utilizationThresholdPercent
                          ? `⚡ Promo ACTIVE (-${utilizationDiscountPercent}%)`
                          : 'Standard Rates Active'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 10.2: Rental Duration Discounts (Length of Stay) */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="font-bold text-stone-200">
                        B. Rental Duration Discounts (Length of Stay)
                      </span>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={durationDiscountEnabled}
                        onChange={(e) => setDurationDiscountEnabled(e.target.checked)}
                        className="rounded text-amber-400 bg-stone-900 border-stone-700 w-3.5 h-3.5"
                      />
                      <span className="text-[11px] text-stone-300 font-medium">Enable Tiers</span>
                    </label>
                  </div>

                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    Incentivize multi-day and weekly rentals. Nominate the minimum rental days and the percentage discount for each tier.
                  </p>

                  {/* Active Tiers Table */}
                  <div className="space-y-2">
                    {durationTiers.map((tier) => (
                      <div
                        key={tier.id}
                        className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-md bg-amber-400/10 border border-amber-400/30 text-amber-300 font-mono font-bold flex items-center justify-center text-xs">
                            {tier.minDays}d+
                          </span>
                          <div>
                            <div className="font-bold text-stone-200">{tier.tierName}</div>
                            <div className="text-[10px] text-stone-400">
                              Applies when rental is {tier.minDays} or more continuous days
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            -{tier.discountPercent}% OFF
                          </span>
                          <button
                            type="button"
                            onClick={() => setDurationTiers(durationTiers.filter(t => t.id !== tier.id))}
                            className="p-1 text-stone-500 hover:text-red-400 transition-colors"
                            title="Remove tier"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add New Tier Row */}
                  <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800/80 space-y-2">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      + Add New Duration Tier:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Tier Name (e.g. Midweek Ride)"
                          value={newTierName}
                          onChange={(e) => setNewTierName(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-200 text-xs"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="2"
                            max="60"
                            value={newTierMinDays}
                            onChange={(e) => setNewTierMinDays(Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-200 text-xs font-mono"
                          />
                          <span className="text-[10px] text-stone-500 shrink-0">days</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 flex-1">
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={newTierDiscount}
                            onChange={(e) => setNewTierDiscount(Number(e.target.value))}
                            className="w-full px-2 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-200 text-xs font-mono"
                          />
                          <span className="text-[10px] text-stone-500 shrink-0">%</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newTierName.trim()) return;
                            const newTier: SmartPricingDurationTier = {
                              id: `tier-${Date.now()}`,
                              tierName: newTierName.trim(),
                              minDays: newTierMinDays,
                              discountPercent: newTierDiscount,
                            };
                            setDurationTiers([...durationTiers, newTier]);
                            setNewTierName('');
                            showToast(`Added duration tier: ${newTier.tierName}`, 'success');
                          }}
                          className="px-2.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded text-xs shrink-0 transition-colors shadow-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 10.3: Stacking Policy & Interactive Rate Simulator */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-stone-800/80 pb-2">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5">
                      <Percent className="w-3.5 h-3.5 text-amber-400" />
                      <span>C. Discount Stacking & Live Rate Simulator</span>
                    </span>

                    <label className="flex items-center gap-2 cursor-pointer text-[11px] text-stone-300">
                      <input
                        type="checkbox"
                        checked={stackDiscounts}
                        onChange={(e) => setStackDiscounts(e.target.checked)}
                        className="rounded text-amber-400 bg-stone-900 border-stone-700 w-3.5 h-3.5"
                      />
                      <span>Stack discounts together (Recommended)</span>
                    </label>
                  </div>

                  {/* Simulator Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-stone-400 mb-1 text-[11px]">Select Motorbike to Simulate:</label>
                      <select
                        value={simBikeId}
                        onChange={(e) => setSimBikeId(e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-200 text-xs"
                      >
                        {bikes.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.name} (₱{b.dailyRate}/day)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-stone-400 mb-1 text-[11px]">
                        Rental Length ({simDays} Days):
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="14"
                        value={simDays}
                        onChange={(e) => setSimDays(Number(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Live Simulation Math Card */}
                  {(() => {
                    const testBike = bikes.find(b => b.id === simBikeId) || bikes[0];
                    const testRate = testBike?.dailyRate || 900;
                    const testConfig: SmartPricingConfig = {
                      isEnabled: smartPricingEnabled,
                      utilizationDiscountEnabled,
                      utilizationThresholdPercent,
                      utilizationDiscountPercent,
                      simulatedOccupancyPercent,
                      durationDiscountEnabled,
                      durationTiers,
                      stackDiscounts,
                    };
                    const res = calculateSmartPriceDiscount(testRate, simDays, testConfig);

                    return (
                      <div className="p-3.5 rounded-xl bg-stone-900 border border-amber-400/30 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-stone-300 font-semibold">
                            {testBike?.name} ({simDays} days @ ₱{testRate}/day):
                          </span>
                          <span className="font-mono text-stone-400">Base Subtotal: ₱{res.baseRentalSubtotal}</span>
                        </div>

                        <div className="space-y-1 text-[11px] border-y border-stone-800/80 py-2">
                          <div className="flex justify-between text-stone-400">
                            <span>Depot Utilization Flash Promo ({res.utilizationOccupancyPercent}% occupancy):</span>
                            <span className={res.utilizationPromoApplied ? 'text-emerald-400 font-mono font-bold' : 'text-stone-500'}>
                              {res.utilizationPromoApplied ? `-₱${res.utilizationDiscountAmount} (-${res.utilizationDiscountPercent}%)` : 'None (0%)'}
                            </span>
                          </div>

                          <div className="flex justify-between text-stone-400">
                            <span>Duration Long-Stay Tier ({res.durationTierApplied?.tierName || 'Under min tier'}):</span>
                            <span className={res.durationDiscountApplied ? 'text-emerald-400 font-mono font-bold' : 'text-stone-500'}>
                              {res.durationDiscountApplied ? `-₱${res.durationDiscountAmount} (-${res.durationDiscountPercent}%)` : 'None (0%)'}
                            </span>
                          </div>

                          <div className="flex justify-between text-amber-300 font-bold pt-1">
                            <span>Total Smart Savings:</span>
                            <span className="font-mono text-emerald-400">-₱{res.totalSmartDiscountAmount}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1">
                          <span className="font-bold text-stone-100">Final Price Paid by Customer:</span>
                          <div className="text-right">
                            <span className="text-sm font-mono font-bold text-amber-400">
                              ₱{res.discountedRentalSubtotal}
                            </span>
                            <span className="text-[10px] text-stone-400 block font-mono">
                              (₱{res.effectiveDailyRate}/day effective)
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Save Smart Pricing Engine Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-stone-800">
                  <div className="flex items-center gap-2 text-stone-400">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span>Settings update customer portal rates and AI quotes in real time.</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      updateSmartPricingConfig(currentBusiness.id, {
                        isEnabled: smartPricingEnabled,
                        utilizationDiscountEnabled,
                        utilizationThresholdPercent,
                        utilizationDiscountPercent,
                        simulatedOccupancyPercent,
                        durationDiscountEnabled,
                        durationTiers,
                        stackDiscounts,
                      });
                    }}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Smart Pricing Engine</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-stone-950 border border-stone-800 text-stone-400 text-center">
                Smart Dynamic Pricing is currently <strong>disabled</strong> for {name}. Motorbikes will be quoted at their fixed standard daily rate regardless of duration or depot occupancy. Toggle on above to activate smart pricing.
              </div>
            )}
          </div>

          {/* SECTION 11: NEARBY TOWNS TARGETING & SOCIAL MARKETING RADIUS */}
          <div className="p-5 rounded-xl border border-stone-800 bg-stone-900/60 space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-stone-100 text-sm">
                    11. Nearby Towns Targeting & Social Marketing Radius
                  </h3>
                </div>
                <p className="text-[11px] text-stone-400 mt-0.5">
                  Nominate your depot operating base to uncover nearby towns, coastal surf breaks, and scenic riding spots to automatically target in your social media campaigns and TikTok templates.
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {targetedTowns.length} Towns Targeted
                </span>
              </div>
            </div>

            {/* Operating Town Nomination & Presets */}
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
              <label className="block text-stone-300 font-semibold text-xs flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nominated Operating Town / Base Location</span>
                </span>
                <span className="text-[10px] text-stone-500 font-normal">
                  Auto-detects regional clusters
                </span>
              </label>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={operatingTown}
                  onChange={(e) => setOperatingTown(e.target.value)}
                  placeholder="e.g. San Felipe, Zambales or General Luna, Siargao"
                  className="flex-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-xs focus:outline-none focus:border-amber-400 font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    const detected = getNearbyTownsForLocation(operatingTown);
                    setTargetedTowns(detected.slice(0, 5).map(t => t.name));
                    showToast(`Refreshed nearby towns for ${operatingTown}`, 'info');
                  }}
                  className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors"
                >
                  Detect Towns
                </button>
              </div>

              {/* Regional Presets */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                <span className="text-stone-500 text-[10px]">Popular Hub Presets:</span>
                {[
                  { label: 'Zambales Coast', loc: 'San Felipe, Zambales' },
                  { label: 'La Union Surf', loc: 'San Juan, La Union' },
                  { label: 'Siargao Island', loc: 'General Luna, Siargao' },
                  { label: 'Boracay & Aklan', loc: 'Malay, Boracay' }
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setOperatingTown(preset.loc);
                      const detected = getNearbyTownsForLocation(preset.loc);
                      setTargetedTowns(detected.slice(0, 5).map(t => t.name));
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] border transition-colors ${
                      operatingTown.toLowerCase().includes(preset.loc.split(',')[0].toLowerCase())
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 font-semibold'
                        : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Marketing Radius Slider */}
            <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>Maximum Riding Marketing Radius:</span>
                </span>
                <span className="font-mono font-bold text-amber-400 text-sm">
                  {marketingRadiusKm} km
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                step="5"
                value={marketingRadiusKm}
                onChange={(e) => setMarketingRadiusKm(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-stone-500 font-mono">
                <span>10 km (Local strip)</span>
                <span>35 km (Standard coastal ride)</span>
                <span>80 km (Full province loop)</span>
              </div>
            </div>

            {/* Nearby Towns Interactive Checklist */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-200 text-xs">
                  Available Nearby Towns & Scenic Spots (Click to Target for Social Marketing):
                </span>
                <div className="flex items-center gap-2 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setTargetedTowns(detectedNearbyTowns.map(t => t.name))}
                    className="text-amber-400 hover:underline"
                  >
                    Select All ({detectedNearbyTowns.length})
                  </button>
                  <span className="text-stone-600">|</span>
                  <button
                    type="button"
                    onClick={() => setTargetedTowns([])}
                    className="text-stone-400 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {detectedNearbyTowns.map((town) => {
                  const isChecked = targetedTowns.includes(town.name);
                  const isWithinRadius = town.distanceKm <= marketingRadiusKm;

                  return (
                    <div
                      key={town.id}
                      onClick={() => {
                        if (isChecked) {
                          setTargetedTowns(prev => prev.filter(t => t !== town.name));
                        } else {
                          setTargetedTowns(prev => [...prev, town.name]);
                        }
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                        isChecked 
                          ? 'bg-amber-500/10 border-amber-500/40 text-stone-100 shadow-sm' 
                          : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by parent div onClick
                            className="rounded text-amber-500 focus:ring-0 bg-stone-900 border-stone-700"
                          />
                          <span className="font-bold text-xs text-stone-100">
                            {town.name}
                          </span>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                          isWithinRadius 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-stone-800 text-stone-400'
                        }`}>
                          {town.distanceKm} km · {town.travelTimeMins}m ride
                        </span>
                      </div>

                      <p className="text-[11px] text-stone-400 mt-1.5 line-clamp-1">
                        {town.highlight}
                      </p>

                      <div className="flex flex-wrap items-center gap-1 mt-2 pt-2 border-t border-stone-800/60">
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.2 rounded bg-stone-900 text-amber-400 font-mono">
                          {town.scenicType}
                        </span>
                        {town.popularHashtags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[10px] text-stone-500 font-mono">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Spot or Town */}
            <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
              <span className="font-semibold text-stone-300 text-xs block">
                Add Custom Nominated Spot / Attraction to Marketing Scope:
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTownInput}
                  onChange={(e) => setCustomTownInput(e.target.value)}
                  placeholder="e.g. Kwentong Dagat Seawall, San Felipe Pine Woods"
                  className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!customTownInput.trim()) return;
                    if (!targetedTowns.includes(customTownInput.trim())) {
                      setTargetedTowns(prev => [...prev, customTownInput.trim()]);
                      showToast(`Added "${customTownInput.trim()}" to marketing targets`, 'success');
                    }
                    setCustomTownInput('');
                  }}
                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs"
                >
                  Add Spot
                </button>
              </div>
            </div>

            {/* Save Button for Section 11 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-800">
              <div className="flex items-center gap-2 text-stone-400 text-xs">
                <Radio className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Selected towns automatically populate Social Media Studio prompts & TikTok hashtags.</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  updateTargetedNearbyTowns(currentBusiness.id, targetedTowns, operatingTown);
                }}
                className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
              >
                <Save className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Save Nearby Towns Marketing Coverage</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Customer Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-300 font-bold text-xs uppercase tracking-wider">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Live Customer Viewport Preview</span>
              </div>

              <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg p-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => setPreviewMode('portal')}
                  className={`px-2.5 py-1 rounded transition-colors ${previewMode === 'portal' ? 'bg-amber-400 text-stone-950 font-bold' : 'text-stone-400'}`}
                >
                  Portal
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewMode('contract')}
                  className={`px-2.5 py-1 rounded transition-colors ${previewMode === 'contract' ? 'bg-amber-400 text-stone-950 font-bold' : 'text-stone-400'}`}
                >
                  GCash QR
                </button>
              </div>
            </div>

            {/* Phone/Tablet Styled Container */}
            <div className="rounded-2xl border border-stone-800 bg-stone-950 overflow-hidden shadow-2xl">
              {/* Fake Browser Top */}
              <div className="px-4 py-2 bg-stone-900 border-b border-stone-800 flex items-center justify-between text-[11px] text-stone-400 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/60 inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60 inline-block"></span>
                </div>
                <div className="text-[10px] text-stone-500 truncate max-w-[200px]">
                  https://{currentBusiness.slug}.rideout.app
                </div>
                <div className="w-4"></div>
              </div>

              {previewMode === 'portal' ? (
                /* Customer Portal View Preview */
                <div className="p-4 space-y-4 text-xs">
                  {/* Hero Banner with Custom Cover */}
                  <div className="relative h-44 rounded-xl overflow-hidden border border-stone-800">
                    <img
                      src={coverPhotoUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/60 to-transparent"></div>

                    <div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
                      <img
                        src={logoUrl}
                        alt="Logo"
                        className="w-12 h-12 rounded-lg border-2 border-amber-400 object-cover shadow-lg shrink-0 bg-stone-900"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white truncate">{name}</div>
                        <div className="text-[10px] text-stone-300 truncate">{location}</div>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-400 italic">
                    "{tagline}"
                  </div>

                  {/* Sample Bike Card */}
                  <div className="p-3 rounded-lg border border-stone-800 bg-stone-900/60 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-stone-100">Yamaha NMAX 155 ABS</div>
                        <div className="text-[10px] text-amber-400 font-mono">155cc · Automatic</div>
                      </div>
                      <div className="font-mono font-bold text-amber-400 text-sm">₱900/day</div>
                    </div>

                    <button
                      type="button"
                      className="w-full py-1.5 text-[11px] font-semibold text-stone-950 bg-amber-400 rounded shadow-sm text-center"
                    >
                      Reserve with {name.split(' ')[0]}
                    </button>
                  </div>

                  {/* Facebook Verification Banner */}
                  {currentBusiness.facebookBranding && (
                    <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-500/20 text-[10px] flex items-center gap-2 text-blue-300">
                      <Facebook className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="truncate">
                        Verified FB: {currentBusiness.facebookBranding.pageName} ({currentBusiness.facebookBranding.followersCount?.toLocaleString()} followers)
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                /* GCash Checkout Preview */
                <div className="p-4 space-y-3 text-xs">
                  <div className="text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-blue-400">GCash Payment Preview</span>
                    <div className="font-bold text-stone-100">{name}</div>
                  </div>

                  <div className="p-2 bg-white rounded-xl shadow-lg mx-auto max-w-[190px]">
                    <img src={activeQrCode} alt="GCash QR" className="w-full h-auto object-contain" />
                  </div>

                  <div className="p-3 rounded-lg bg-stone-900 border border-stone-800 font-mono text-[11px] space-y-1">
                    <div className="text-stone-400 text-[10px]">ACCOUNT: <span className="text-stone-200 font-bold">{gcashAccountName}</span></div>
                    <div className="text-stone-400 text-[10px]">MOBILE: <span className="text-blue-400 font-bold">{gcashAccountNumber}</span></div>
                    <div className="text-stone-400 text-[10px]">DEPOSIT: <span className="text-emerald-400 font-bold">₱{gcashDepositAmount.toLocaleString()}</span></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsGCashModalOpen(true)}
                    className="w-full py-2.5 bg-[#005CE6] hover:bg-[#004dc2] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Open GCash App</span>
                  </button>
                </div>
              )}
            </div>

            {/* Direct Link Share Card */}
            <div className="p-4 rounded-xl border border-stone-800 bg-stone-900 text-xs space-y-2">
              <div className="font-semibold text-stone-300 flex items-center justify-between">
                <span>Customer Direct Booking Link:</span>
                <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded bg-stone-950 border border-stone-800 font-mono text-[11px] text-amber-400 truncate">
                <span>https://rideout.app/{currentBusiness.slug}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`https://rideout.app/${currentBusiness.slug}`);
                  showToast('Shop booking link copied to clipboard!', 'success');
                }}
                className="w-full py-1.5 text-xs text-stone-300 hover:text-white bg-stone-800 rounded font-medium transition-colors"
              >
                Copy Link to Share on Facebook & WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Google Maps Location Pinning Modal */}
      {isLocationModalOpen && (
        <LocationPinningModal
          location={editingLocation}
          onSave={(loc) => {
            const locToSave: PickupLocation = {
              id: loc.id || `loc-${Date.now()}`,
              name: loc.name,
              address: loc.address,
              landmark: loc.landmark,
              coordinates: loc.coordinates,
              deliveryFee: loc.deliveryFee,
              operatingHours: loc.operatingHours,
              isDepotHQ: loc.isDepotHQ,
              googleMapsUrl: loc.googleMapsUrl,
              businessId: currentBusiness.id,
            };
            if (editingLocation) {
              updateNominatedPickupLocation(currentBusiness.id, locToSave);
            } else {
              addNominatedPickupLocation(currentBusiness.id, locToSave);
            }
            setIsLocationModalOpen(false);
          }}
          onClose={() => setIsLocationModalOpen(false)}
        />
      )}

      {/* Interactive Facebook OAuth & Page Connection Modal */}
      <FacebookConnectModal
        isOpen={isFbConnectModalOpen}
        onClose={() => setIsFbConnectModalOpen(false)}
        currentFbUrl={fbPageUrl}
        onConnected={(data) => {
          setName(data.name);
          setLogoUrl(data.logoUrl);
          setCoverPhotoUrl(data.coverPhotoUrl);
        }}
      />

      {/* Interactive GCash Quick Pay & Scan-to-Pay Modal */}
      <GCashPaymentModal
        isOpen={isGCashModalOpen}
        onClose={() => setIsGCashModalOpen(false)}
        gcashConfig={{
          accountName: gcashAccountName || name,
          accountNumber: gcashAccountNumber || mobile,
          qrCodeUrl: gcashQrUrl,
          depositAmount: gcashDepositAmount,
          instructions: `Send ₱${gcashDepositAmount.toLocaleString()} reservation deposit to ${gcashAccountName} via GCash.`,
        }}
        amount={gcashDepositAmount}
        label="Depot Reservation Deposit"
        showToast={showToast}
      />
    </div>
  );
};
