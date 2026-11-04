import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PWAInstallModal } from '../pwa/PWAInstallModal';
import { 
  formatPrice, 
  SUPPORTED_CURRENCIES, 
  SUPPORTED_LANGUAGES, 
  SOUTHEAST_ASIA_COUNTRIES, 
  CURRENCY_FLAGS 
} from '../../utils/currencyAndLanguage';
import { 
  Sparkles, 
  Bike, 
  ShieldCheck, 
  Download, 
  ArrowRight, 
  CheckCircle2, 
  Smartphone, 
  CalendarCheck, 
  FileSpreadsheet, 
  MessageSquare, 
  Share2, 
  Zap, 
  TrendingUp, 
  Fuel, 
  Users, 
  Globe, 
  Monitor, 
  ChevronRight, 
  Layers,
  Coins,
  MapPin,
  Check,
  Camera,
  Signature,
  FileCheck,
  KeyRound,
  LogIn,
  LogOut
} from 'lucide-react';

export const RideoutRentalsLandingView: React.FC = () => {
  const { 
    setActiveTab, 
    setCurrentBusinessId, 
    currency, 
    setCurrency,
    language,
    setLanguage,
    showToast,
    currentUser,
    openAuthModal,
    logoutUser
  } = useApp();

  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('PH'); // Default Philippines

  const activeCountry = SOUTHEAST_ASIA_COUNTRIES.find(c => c.code === selectedCountryCode) || SOUTHEAST_ASIA_COUNTRIES[0];
  const activeCurrencyConfig = SUPPORTED_CURRENCIES.find(c => c.code === currency) || SUPPORTED_CURRENCIES[0];

  const handleSelectCountry = (country: typeof SOUTHEAST_ASIA_COUNTRIES[0]) => {
    setSelectedCountryCode(country.code);
    setCurrency(country.defaultCurrency);
    if (country.defaultLanguage) {
      setLanguage(country.defaultLanguage);
    }
    showToast(`${country.flag} Region set to ${country.name} · Currency: ${country.defaultCurrency} (${CURRENCY_FLAGS[country.defaultCurrency]})`, 'success');
  };

  return (
    <div className="space-y-10 pb-16 text-stone-100">
      
      {/* Top Bar: Regional Settings with Flags (Country, Currency, Language) */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/90 backdrop-blur-md p-3.5 sm:p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Quick Flag Selector for Southeast Asia */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-300 mr-1">
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Southeast Asia:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {SOUTHEAST_ASIA_COUNTRIES.map((country) => {
                const isSelected = selectedCountryCode === country.code;
                return (
                  <button
                    key={country.code}
                    onClick={() => handleSelectCountry(country)}
                    className={`px-2.5 py-1 rounded-xl text-xs flex items-center gap-1.5 transition-all font-medium border ${
                      isSelected
                        ? 'bg-amber-400 text-stone-950 border-amber-400 shadow-sm font-bold scale-[1.02]'
                        : 'bg-stone-950/80 text-stone-300 hover:text-white border-stone-800 hover:border-stone-700'
                    }`}
                    title={`${country.name} · Default: ${country.defaultCurrency}`}
                  >
                    <span className="text-base leading-none">{country.flag}</span>
                    <span>{country.name}</span>
                    {isSelected && (
                      <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-stone-950 text-amber-400 ml-0.5 font-bold">
                        {country.defaultCurrency}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Fine-tuned Settings with Flags (Country, Currency, Language Dropdowns) */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto border-t lg:border-t-0 border-stone-800 pt-2 lg:pt-0">
            
            {/* Country Selector with Flag */}
            <div className="flex items-center gap-1 bg-stone-950 border border-stone-800 rounded-lg px-2 py-1 text-xs">
              <span className="text-sm">{activeCountry.flag}</span>
              <select
                aria-label="Select Country"
                value={selectedCountryCode}
                onChange={(e) => {
                  const found = SOUTHEAST_ASIA_COUNTRIES.find(c => c.code === e.target.value);
                  if (found) handleSelectCountry(found);
                }}
                className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer"
              >
                {SOUTHEAST_ASIA_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-stone-900 text-stone-200">
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Selector with Flag */}
            <div className="flex items-center gap-1 bg-stone-950 border border-stone-800 rounded-lg px-2 py-1 text-xs">
              <span className="text-sm">{CURRENCY_FLAGS[currency] || '🪙'}</span>
              <select
                aria-label="Select Currency"
                value={currency}
                onChange={(e) => {
                  const val = e.target.value as keyof typeof CURRENCY_FLAGS;
                  setCurrency(val);
                  showToast(`${CURRENCY_FLAGS[val] || ''} Currency switched to ${val}`, 'info');
                }}
                className="bg-transparent text-stone-200 text-xs font-mono focus:outline-none cursor-pointer"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-stone-900 text-stone-200">
                    {CURRENCY_FLAGS[c.code as keyof typeof CURRENCY_FLAGS]} {c.symbol} {c.code} ({c.name})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector with Flag */}
            <div className="flex items-center gap-1 bg-stone-950 border border-stone-800 rounded-lg px-2 py-1 text-xs">
              <select
                aria-label="Select Language"
                value={language}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setLanguage(val);
                  showToast(`Language updated`, 'info');
                }}
                className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-stone-900 text-stone-200">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Auth / Depot Console Access */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-stone-950 border border-emerald-500/30 rounded-lg px-2.5 py-1 text-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                <span className="text-stone-300 font-mono text-[11px] truncate max-w-[120px] hidden sm:inline" title={currentUser.email}>
                  {currentUser.email}
                </span>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="px-2 py-0.5 rounded bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-[11px] transition-colors flex items-center gap-1"
                >
                  <span>Depot Console</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white text-xs font-semibold transition-colors flex items-center gap-1"
                  title="Sign In with Google OAuth"
                >
                  <KeyRound className="w-3 h-3 text-amber-400" />
                  <span>Sign In</span>
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-colors flex items-center gap-1 shadow-sm"
                  title="Subscribe & Start 30-Day Free Trial"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Try 30d Free</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hero Visual Section with Graphic Mockup & Coastal Backdrop */}
      <div className="relative overflow-hidden rounded-3xl border border-stone-800 bg-stone-950 shadow-2xl">
        {/* Background Visual Graphic with Overlay */}
        <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
          <img
            src="/src/assets/images/hero_coastal_ride_1793338340532.jpg"
            alt="Southeast Asia Coastal Moto Route"
            className="w-full h-full object-cover object-center filter saturate-150"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-950/40" />
        </div>

        <div className="relative z-10 p-6 sm:p-10 md:p-12 space-y-8">
          <div className="max-w-3xl space-y-5">
            {/* Regional Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-stone-900/90 border border-amber-400/30 text-xs shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="font-semibold text-stone-200">Rideout Rentals</span>
              <span className="text-stone-500">·</span>
              <span className="text-amber-400 font-medium">{activeCountry.flag} {activeCountry.name} Edition</span>
              <span className="text-stone-500">·</span>
              <span className="text-stone-300 font-mono">{activeCurrencyConfig.symbol} {activeCurrencyConfig.code}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-stone-100 leading-[1.12]">
              The Operating System for <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">Vehicle & Scooter Rentals</span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base md:text-lg text-stone-300 max-w-2xl leading-relaxed">
              Dispatch fleets across Southeast Asia with digital 360° inspections, automatic fuel bar deficit reconciliation, smart dynamic pricing, and omnichannel customer chat.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => openAuthModal('signup')}
                className="px-6 py-3.5 text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/25 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" className="shrink-0 bg-white p-0.5 rounded-full">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Subscribe & Try Free with Google</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </button>

              {currentUser ? (
                <button
                  onClick={() => setActiveTab('overview')}
                  className="px-5 py-3.5 text-sm font-bold text-stone-950 bg-emerald-400 hover:bg-emerald-300 rounded-xl transition-all flex items-center gap-2 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-stone-950" />
                  <span>Open Depot Console</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-5 py-3.5 text-sm font-semibold text-stone-200 hover:text-white bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 rounded-xl transition-all flex items-center gap-2 shadow-sm"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>Sign In with Gmail</span>
                </button>
              )}

              <button
                onClick={() => setIsPwaModalOpen(true)}
                className="px-5 py-3.5 text-sm font-semibold text-stone-200 hover:text-white bg-stone-900/90 hover:bg-stone-800 border border-stone-700/80 rounded-xl transition-all flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Install Standalone App (PWA)</span>
              </button>

              <button
                onClick={() => setActiveTab('customer-portal')}
                className="px-5 py-3.5 text-sm font-semibold text-stone-300 hover:text-white bg-stone-950/90 hover:bg-stone-900 border border-stone-800 rounded-xl transition-all flex items-center gap-2"
              >
                <Bike className="w-4 h-4 text-amber-400" />
                <span>Customer Booking Portal</span>
              </button>
            </div>

            {/* Quick Guarantees */}
            <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-stone-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>30-Day Free Trial ({formatPrice(0, currency)} Month 1)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Works on PC, Mac, Android & iPhone</span>
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Offline Counter Mode</span>
              </span>
            </div>
          </div>

          {/* Interactive UI Graphic Preview: Tablet Device Frame Mockup */}
          <div className="mt-6 rounded-2xl border border-stone-700/80 bg-stone-900/90 shadow-2xl p-4 sm:p-6 backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4 text-xs">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span className="font-mono text-stone-400 text-[11px] ml-2">
                  Rideout Rentals Counter Terminal · {activeCountry.flag} {activeCountry.name}
                </span>
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Fleet Live: 100% Operational</span>
              </div>
            </div>

            {/* Mockup Dashboard Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              
              {/* Mockup Panel 1: 360 Inspection Card */}
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                    Digital Inspection
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                    Verified
                  </span>
                </div>
                <div className="aspect-video rounded-lg overflow-hidden relative border border-stone-800">
                  <img
                    src="/src/assets/images/bike_touring_scooter_1793338342942.jpg"
                    alt="Inspection vehicle photo"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 rounded text-[9px] font-mono text-stone-200">
                    Front / ODO 4,820km
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>Fuel Bar:</span>
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5,6,7,8].map(i => (
                      <span key={i} className="w-2 h-3 rounded-xs bg-emerald-400" />
                    ))}
                    <span className="font-mono font-bold text-stone-200 ml-1">8/8 Full</span>
                  </div>
                </div>
              </div>

              {/* Mockup Panel 2: Live Dispatch & Pricing */}
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                    Smart Dynamic Pricing
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-mono">
                    Active
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-stone-900 border border-stone-800/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-300">Fleet Occupancy Today</span>
                    <span className="font-mono font-bold text-amber-400">85% Utilized</span>
                  </div>
                  <div className="w-full bg-stone-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full w-[85%]" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                    <span>3+ Day Rental Discount</span>
                    <span className="text-emerald-400 font-bold">-10% Applied</span>
                  </div>
                </div>
                <div className="text-[11px] text-stone-400 leading-tight">
                  Auto-adjusts rental rates based on local weather, holiday weekends, and depot availability.
                </div>
              </div>

              {/* Mockup Panel 3: Omnichannel Quick Dispatch */}
              <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                    Omnichannel Inbox
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                    Live Chat
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 rounded bg-stone-900 border border-stone-800 flex items-center justify-between">
                    <span className="text-stone-200">💬 WhatsApp: Booking inquiry</span>
                    <span className="text-[10px] text-emerald-400 font-mono">Just now</span>
                  </div>
                  <div className="p-2 rounded bg-stone-900 border border-stone-800 flex items-center justify-between">
                    <span className="text-stone-200">📱 Messenger: Passport uploaded</span>
                    <span className="text-[10px] text-stone-400 font-mono">2m ago</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('inbox')}
                  className="w-full py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-center font-medium transition-colors text-[11px]"
                >
                  Open Social Inbox
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Fleet Graphics Showcase with Dynamic Regional Currency */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-stone-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                Fleet Catalog
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-800 font-mono">
                {activeCountry.flag} Converted to {activeCurrencyConfig.code} ({activeCurrencyConfig.symbol})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-100 mt-1">
              Popular Vehicles Ready for Dispatch
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('fleet')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View Complete Fleet Management</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Card 1: Maxi-Scooter */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden group hover:border-amber-400/50 transition-all shadow-lg flex flex-col justify-between">
            <div>
              <div className="aspect-[16/10] overflow-hidden relative bg-stone-950">
                <img
                  src="/src/assets/images/bike_touring_scooter_1793338342942.jpg"
                  alt="Yamaha NMAX 155 Touring Maxi-Scooter"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-[10px] font-mono font-semibold text-amber-400 border border-stone-700">
                  Touring Maxi-Scooter
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 font-mono text-[11px] font-bold text-white">
                  155cc ABS
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-base text-stone-100">Yamaha NMAX 155 VVA</h3>
                <p className="text-xs text-stone-400 line-clamp-2">
                  Spacious under-seat storage, long-distance dual rear suspension, and smooth coastal cruising power.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0 border-t border-stone-800/80 flex items-center justify-between mt-3">
              <div>
                <span className="text-[10px] text-stone-400 block font-mono">Daily Rate:</span>
                <span className="text-lg font-bold font-mono text-amber-400">
                  {formatPrice(850, currency)} <span className="text-xs font-normal text-stone-400">/ day</span>
                </span>
              </div>
              <button
                onClick={() => setActiveTab('customer-portal')}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
              >
                Reserve
              </button>
            </div>
          </div>

          {/* Card 2: Adventure Dual-Sport */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden group hover:border-amber-400/50 transition-all shadow-lg flex flex-col justify-between">
            <div>
              <div className="aspect-[16/10] overflow-hidden relative bg-stone-950">
                <img
                  src="/src/assets/images/bike_adventure_dual_1793338342581.jpg"
                  alt="Honda CRF 300L Rally Adventure Dual-Sport"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-[10px] font-mono font-semibold text-emerald-400 border border-stone-700">
                  Adventure Dual-Sport
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 font-mono text-[11px] font-bold text-white">
                  300cc EFI
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-base text-stone-100">Honda CRF 300L Rally</h3>
                <p className="text-xs text-stone-400 line-clamp-2">
                  Pro-link long-travel suspension, wind-deflecting rally fairing, and high ground clearance for rugged terrain.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0 border-t border-stone-800/80 flex items-center justify-between mt-3">
              <div>
                <span className="text-[10px] text-stone-400 block font-mono">Daily Rate:</span>
                <span className="text-lg font-bold font-mono text-amber-400">
                  {formatPrice(1600, currency)} <span className="text-xs font-normal text-stone-400">/ day</span>
                </span>
              </div>
              <button
                onClick={() => setActiveTab('customer-portal')}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
              >
                Reserve
              </button>
            </div>
          </div>

          {/* Card 3: Urban Commuter Scooter */}
          <div className="rounded-2xl border border-stone-800 bg-stone-900/60 overflow-hidden group hover:border-amber-400/50 transition-all shadow-lg flex flex-col justify-between">
            <div>
              <div className="aspect-[16/10] overflow-hidden relative bg-stone-950">
                <img
                  src="/src/assets/images/bike_urban_scooter_1793338342006.jpg"
                  alt="Honda Click 125i Urban Commuter"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-stone-950/80 backdrop-blur-md text-[10px] font-mono font-semibold text-blue-400 border border-stone-700">
                  Urban Commuter
                </div>
                <div className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/80 font-mono text-[11px] font-bold text-white">
                  125cc eSP
                </div>
              </div>
              <div className="p-5 space-y-2">
                <h3 className="font-bold text-base text-stone-100">Honda Click 125i</h3>
                <p className="text-xs text-stone-400 line-clamp-2">
                  Lightweight chassis, effortless automatic transmission, and maximum fuel economy for daily errands.
                </p>
              </div>
            </div>
            <div className="p-5 pt-0 border-t border-stone-800/80 flex items-center justify-between mt-3">
              <div>
                <span className="text-[10px] text-stone-400 block font-mono">Daily Rate:</span>
                <span className="text-lg font-bold font-mono text-amber-400">
                  {formatPrice(500, currency)} <span className="text-xs font-normal text-stone-400">/ day</span>
                </span>
              </div>
              <button
                onClick={() => setActiveTab('customer-portal')}
                className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition-colors"
              >
                Reserve
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Feature Pillars Grid */}
      <div className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-bold text-stone-100">
            Engineered for Ground-Level Rental Operations
          </h2>
          <p className="text-xs text-stone-400">
            Everything your depot counter and dispatch team needs to eliminate disputes and scale fleet revenue.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          
          <div className="p-5 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-3 hover:border-stone-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-stone-100">360° Inspection & Digital Waivers</h3>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              Take road-readiness photos, record exact fuel bar readings, capture renter selfie holding their driver's license, and obtain digital finger signatures on contracts.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-3 hover:border-stone-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-orange-400/10 border border-orange-400/20 flex items-center justify-center text-orange-400">
              <Fuel className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-stone-100">Fuel Calculation & Physical ID Deposit</h3>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              If fuel is returned lower than pickup, automatic per-bar penalties are calculated. Supports custody photos of physical IDs held by depot staff before deposit release.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-3 hover:border-stone-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-stone-100">Smart Pricing & Utilization Engine</h3>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              Automate rental length discounts (e.g., 10% off for multi-day rentals) and trigger instant occupancy discounts when depot fleet utilization drops.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-3 hover:border-stone-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-blue-400/10 border border-blue-400/20 flex items-center justify-center text-blue-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-stone-100">Unified Social Inbox & Quick Chat</h3>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              Manage customer chats across Messenger, WhatsApp, TikTok, and Instagram in one place. Quick chat buttons directly from the bookings table dispatch messages to customer's preferred channel.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-3 hover:border-stone-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-pink-400/10 border border-pink-400/20 flex items-center justify-center text-pink-400">
              <Share2 className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-stone-100">TikTok Studio & Town Marketing</h3>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              Turn rider selfies into viral 9:16 vertical TikTok videos with trending audio waveforms, CapCut templates, and auto-generated hashtags for nominated nearby towns.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-stone-800 bg-stone-900/60 space-y-3 hover:border-stone-700 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center text-cyan-400">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm text-stone-100">Audit Reports (Sheets, Excel, PDF, Word)</h3>
            <p className="text-stone-400 leading-relaxed text-[11px]">
              Filter operations from date to date and bike by bike. 1-click export to Google Sheets, UTF-8 BOM Excel CSV, print-ready PDF, and Microsoft Word.
            </p>
          </div>
        </div>
      </div>

      {/* Graduated Pricing Schedule with Flag Currency Calculation */}
      <div className="rounded-2xl border border-stone-800 bg-stone-900/60 p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                Fair & Transparent Subscription
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-mono">
                {activeCountry.flag} {activeCountry.name}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-stone-100">
              Graduated Subscription Pricing Schedule
            </h2>
            <p className="text-xs text-stone-400">
              Prices automatically calculated in {activeCurrencyConfig.name} ({activeCurrencyConfig.symbol} {activeCurrencyConfig.code}).
            </p>
          </div>

          <div className="text-xs text-stone-400 font-mono bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800 flex items-center gap-2">
            <span>Active:</span>
            <span className="text-base">{CURRENCY_FLAGS[currency]}</span>
            <strong className="text-amber-400 font-bold">{activeCurrencyConfig.symbol} {activeCurrencyConfig.code}</strong>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          
          {/* Tier 1 */}
          <div className="p-4 rounded-xl bg-stone-950 border border-amber-400/40 space-y-3 flex flex-col justify-between relative shadow-lg shadow-amber-500/10">
            <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded bg-amber-400 text-stone-950 font-bold text-[9px] uppercase">
              Free Trial
            </div>
            <div>
              <span className="text-[10px] font-mono text-stone-400 uppercase">Month 1</span>
              <h4 className="font-bold text-base text-stone-100">30-Day Free Trial</h4>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
                {formatPrice(0, currency)} <span className="text-xs font-normal text-stone-400">/ month</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-2">
                Test full software capabilities with unlimited bookings, fleet setup, and customer portal.
              </p>
            </div>
            <button
              onClick={() => openAuthModal('signup')}
              className="w-full py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg transition-colors text-center"
            >
              Start Free Trial
            </button>
          </div>

          {/* Tier 2 */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-stone-400 uppercase">Months 2–3</span>
              <h4 className="font-bold text-base text-stone-100">Early Growth Tier</h4>
              <div className="text-2xl font-bold font-mono text-stone-200 mt-2">
                {formatPrice(500, currency)} <span className="text-xs font-normal text-stone-400">/ month</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-2">
                Affordable ramp-up fee while building repeat customers. Zero transaction fee.
              </p>
            </div>
            <div className="text-[11px] text-stone-500 font-mono text-center py-1">
              0% transaction share
            </div>
          </div>

          {/* Tier 3 */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-stone-400 uppercase">Months 4–6</span>
              <h4 className="font-bold text-base text-stone-100">Established Depot</h4>
              <div className="text-2xl font-bold font-mono text-stone-200 mt-2">
                {formatPrice(1000, currency)} <span className="text-xs font-normal text-stone-400">/ month</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-2">
                Flat monthly fee for steady booking volumes and up to 2 staff user accounts.
              </p>
            </div>
            <div className="text-[11px] text-stone-500 font-mono text-center py-1">
              0% transaction share
            </div>
          </div>

          {/* Tier 4 */}
          <div className="p-4 rounded-xl bg-stone-950 border border-purple-500/30 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-purple-400 uppercase">Month 7+</span>
              <h4 className="font-bold text-base text-stone-100">Scale & Rev Share</h4>
              <div className="text-xl font-bold font-mono text-purple-300 mt-2">
                {formatPrice(1000, currency)} <span className="text-xs font-normal text-stone-400">+ 1% tx</span>
              </div>
              <p className="text-[11px] text-stone-400 mt-2">
                {formatPrice(1000, currency)} base fee plus 1% of total transaction volume.
              </p>
            </div>
            <div className="text-[11px] text-purple-400/80 font-mono text-center py-1">
              Continuous feature updates
            </div>
          </div>

        </div>
      </div>

      {/* Standalone App (PWA) Showcase Card */}
      <div className="p-6 md:p-8 rounded-2xl border border-stone-800 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
            <Download className="w-3.5 h-3.5" />
            <span>Standalone Web App (PWA)</span>
          </div>
          <h3 className="text-xl font-bold text-stone-100">
            Install Rideout Rentals Directly on Your Phone or PC
          </h3>
          <p className="text-xs text-stone-400 leading-relaxed">
            No app store download required. Install this web app as a standalone application on Android, iPhone/iPad (Safari), and Desktop Chrome/Edge for instant counter access.
          </p>
        </div>

        <button
          onClick={() => setIsPwaModalOpen(true)}
          className="px-6 py-3 bg-stone-100 hover:bg-white text-stone-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all shrink-0"
        >
          <Download className="w-4 h-4 stroke-[2.5]" />
          <span>Install Standalone App</span>
        </button>
      </div>

      {/* PWA Download Modal */}
      {isPwaModalOpen && (
        <PWAInstallModal
          isOpen={isPwaModalOpen}
          onClose={() => setIsPwaModalOpen(false)}
        />
      )}
    </div>
  );
};
