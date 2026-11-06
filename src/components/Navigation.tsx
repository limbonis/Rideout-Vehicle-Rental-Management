import React, { useState } from 'react';
import { useApp, NavigationTab } from '../context/AppContext';
import { 
  CalendarCheck, 
  KeyRound, 
  Bike, 
  Share2, 
  LayoutDashboard, 
  Globe, 
  Plus, 
  Tag, 
  Palette, 
  Users, 
  Building2, 
  ChevronDown, 
  HardDrive, 
  MessageSquare, 
  FileSpreadsheet,
  Download,
  Sparkles,
  Smartphone,
  LogOut,
  LogIn,
  UserCheck
} from 'lucide-react';
import { BusinessLoginModal } from './tenant/BusinessLoginModal';
import { GoogleDriveArchiveModal } from './tenant/GoogleDriveArchiveModal';
import { GoogleOAuthSubscribeModal } from './auth/GoogleOAuthSubscribeModal';
import { PWAInstallModal } from './pwa/PWAInstallModal';
import { 
  SUPPORTED_CURRENCIES, 
  SUPPORTED_LANGUAGES, 
  SOUTHEAST_ASIA_COUNTRIES,
  formatPrice, 
  CURRENCY_FLAGS 
} from '../utils/currencyAndLanguage';

interface NavigationProps {
  onOpenNewBookingModal: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ onOpenNewBookingModal }) => {
  const { 
    activeTab, 
    setActiveTab, 
    reservations, 
    promoCodes, 
    currentBusiness, 
    currency, 
    setCurrency,
    language,
    setLanguage,
    isArchiveModalOpen,
    setIsArchiveModalOpen,
    activeStaffUser,
    switchActiveStaffUser,
    unreadChatCount,
    currentUser,
    logoutUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalInitialMode,
    openAuthModal,
    showToast
  } = useApp();

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isPwaInstallModalOpen, setIsPwaInstallModalOpen] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState<string>('PH'); // Default Philippines

  const activeCountry = SOUTHEAST_ASIA_COUNTRIES.find(c => c.code === selectedCountryCode) || SOUTHEAST_ASIA_COUNTRIES[0];
  const pendingCount = reservations.filter(r => r.status === 'pending' || r.status === 'confirmed').length;

  const handleSelectCountry = (countryCode: string) => {
    setSelectedCountryCode(countryCode);
    const country = SOUTHEAST_ASIA_COUNTRIES.find(c => c.code === countryCode);
    if (country) {
      setCurrency(country.defaultCurrency);
      if (country.defaultLanguage) {
        setLanguage(country.defaultLanguage);
      }
      showToast(`${country.flag} Country set to ${country.name} · ${country.defaultCurrency}`, 'info');
    }
  };

  // Check if we are currently inside the Depot Console
  const isDepotConsoleActive = Boolean(
    currentUser && 
    currentUser.hasActiveSubscription && 
    activeTab !== 'landing' && 
    activeTab !== 'customer-portal'
  );

  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-stone-800">
      
      {/* Main Top Header: Brand, Country, Currency, Language, and Sign In Tab */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          
          {/* Brand: Rideout Rentals */}
          <button 
            onClick={() => setActiveTab('landing')}
            className="text-left group flex items-center gap-2.5 hover:opacity-95 transition-opacity shrink-0"
            title="Rideout Rentals - Vehicle Rental Management System"
          >
            <div className="w-9 h-9 rounded-xl bg-[#1c6170]/15 border border-[#1c6170]/40 flex items-center justify-center p-1 group-hover:scale-105 transition-transform shrink-0 shadow-sm">
              <img 
                src="/assets/aistudio/rideout-icon-mark-transparent_40eb04ee.png" 
                alt="Rideout Rentals Logo" 
                className="w-full h-full object-contain" 
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-tight text-stone-100 group-hover:text-amber-400 transition-colors whitespace-nowrap block">
                  RIDEOUT
                </span>
                <span className="text-[10px] font-bold text-amber-400 tracking-wider whitespace-nowrap uppercase">
                  RENTALS
                </span>
              </div>
              <span className="text-[10px] text-stone-400 block -mt-0.5 whitespace-nowrap">
                Vehicle Rental System
              </span>
            </div>
          </button>

          {/* Right Controls: Country, Currency, Language, and Sign In Tab */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Country Selector with Flag */}
            <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-xs">
              <span className="text-sm leading-none">{activeCountry.flag}</span>
              <select
                aria-label="Select Country"
                value={selectedCountryCode}
                onChange={(e) => handleSelectCountry(e.target.value)}
                className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer"
                title="Select Operating Country (Southeast Asia)"
              >
                {SOUTHEAST_ASIA_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-stone-900 text-stone-200">
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Currency Selector with Flag */}
            <div className="flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-xs">
              <span className="text-sm leading-none">{CURRENCY_FLAGS[currency] || '🪙'}</span>
              <select
                aria-label="Select Currency"
                value={currency}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setCurrency(val);
                  showToast(`Currency switched to ${val}`, 'info');
                }}
                className="bg-transparent text-stone-200 text-xs font-mono focus:outline-none cursor-pointer"
                title="Select Currency"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="bg-stone-900 text-stone-200">
                    {CURRENCY_FLAGS[c.code as keyof typeof CURRENCY_FLAGS]} {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector with Flag */}
            <div className="hidden sm:flex items-center gap-1 bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-xs">
              <select
                aria-label="Select Language"
                value={language}
                onChange={(e) => {
                  const val = e.target.value as any;
                  setLanguage(val);
                  showToast('Language updated', 'info');
                }}
                className="bg-transparent text-stone-200 text-xs focus:outline-none cursor-pointer"
                title="Select Language"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="bg-stone-900 text-stone-200">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sign In / Account Tab */}
            {currentUser ? (
              <div className="flex items-center gap-1.5">
                {/* Operator Pill */}
                <div 
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-900 border border-emerald-500/30 text-xs"
                  title={`Signed in with active subscription: ${currentUser.email}`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-mono text-stone-300 text-[11px] truncate max-w-[130px]">
                    {currentUser.email}
                  </span>
                </div>

                {/* Switch between Depot Console and Customer View */}
                {activeTab === 'customer-portal' ? (
                  <button
                    onClick={() => setActiveTab('overview')}
                    className="px-2.5 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                    title="Open Depot Console"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Depot Console</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('customer-portal')}
                    className="px-2.5 py-1.5 text-xs font-semibold text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg flex items-center gap-1.5 transition-colors"
                    title="View Customer Booking Portal"
                  >
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Customer View</span>
                  </button>
                )}

                {/* Sign Out Button */}
                <button
                  onClick={logoutUser}
                  className="px-2 py-1.5 text-xs text-stone-400 hover:text-red-400 hover:bg-stone-900 rounded-lg border border-transparent hover:border-stone-800 transition-colors flex items-center gap-1"
                  title="Sign out of Depot Console"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden xl:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              /* Unauthenticated: Clean "Sign In" Tab with Google G icon */
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 transform hover:-translate-y-0.5"
                title="Sign in with Google OAuth (Opens Depot Console if active subscription)"
              >
                <svg viewBox="0 0 24 24" width="14" height="14" className="shrink-0 bg-white p-0.5 rounded-full">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>
      </div>

      {/* Depot Operations Bar: Rendered ONLY when an active subscriber is inside the Depot Console */}
      {isDepotConsoleActive && (
        <div className="bg-stone-900/90 border-t border-stone-800/80 px-4 sm:px-6 lg:px-8 py-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
            
            {/* Active Depot Badge & Switcher */}
            <div className="flex items-center gap-1.5 shrink-0 bg-stone-950 px-2 py-1 rounded-lg border border-stone-800">
              <img
                src={currentBusiness.logoUrl}
                alt={currentBusiness.name}
                className="w-5 h-5 rounded object-cover border border-amber-400/40 bg-stone-900 shrink-0"
              />
              <span className="text-xs font-semibold text-stone-200 truncate max-w-[140px] block">
                {currentBusiness.name}
              </span>
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="p-0.5 text-stone-400 hover:text-amber-400 rounded transition-colors ml-0.5"
                title="Switch Rental Depot"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Depot Navigation Tabs */}
            <nav className="flex items-center gap-2 text-xs font-medium shrink-0">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'overview' 
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' 
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>

              <button
                onClick={() => setActiveTab('reservations')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'reservations' 
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' 
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Bookings ({pendingCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('pickups')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'pickups' 
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' 
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Pickups</span>
              </button>

              <button
                onClick={() => setActiveTab('fleet')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'fleet' 
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' 
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Fleet</span>
              </button>

              <button
                onClick={() => setActiveTab('reports')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'reports' 
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' 
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>Reports</span>
              </button>

              <button
                onClick={() => setActiveTab('inbox')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'inbox' 
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' 
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Inbox</span>
                {unreadChatCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('social')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'social' 
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' 
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Social Studio</span>
              </button>

              <button
                onClick={() => setActiveTab('promos')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'promos' 
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' 
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>Promos</span>
              </button>

              <button
                onClick={() => setActiveTab('branding')}
                className={`px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'branding' 
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' 
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/60'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>Branding</span>
              </button>
            </nav>

            {/* Quick Depot Actions: Manual Booking & Drive Archive */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setIsArchiveModalOpen(true)}
                className="p-1.5 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white transition-colors"
                title="Google Drive & Cloud Sheets Archive"
              >
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              </button>

              <button
                onClick={onOpenNewBookingModal}
                className="px-2.5 py-1 text-xs font-semibold text-stone-950 bg-stone-100 hover:bg-white rounded-lg transition-colors whitespace-nowrap flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>Manual Booking</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Global Modals */}
      {isLoginModalOpen && (
        <BusinessLoginModal
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {isArchiveModalOpen && (
        <GoogleDriveArchiveModal
          onClose={() => setIsArchiveModalOpen(false)}
        />
      )}

      <PWAInstallModal
        isOpen={isPwaInstallModalOpen}
        onClose={() => setIsPwaInstallModalOpen(false)}
      />

      <GoogleOAuthSubscribeModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalInitialMode}
      />
    </header>
  );
};
