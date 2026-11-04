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
  FileSpreadsheet
} from 'lucide-react';
import { BusinessLoginModal } from './tenant/BusinessLoginModal';
import { GoogleDriveArchiveModal } from './tenant/GoogleDriveArchiveModal';
import { SUPPORTED_CURRENCIES, SUPPORTED_LANGUAGES } from '../utils/currencyAndLanguage';

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
    isPlatformAdmin,
    currency,
    setCurrency,
    language,
    setLanguage,
    isArchiveModalOpen,
    setIsArchiveModalOpen,
    activeStaffUser,
    switchActiveStaffUser,
    unreadChatCount
  } = useApp();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const pendingCount = reservations.filter(r => r.status === 'pending' || r.status === 'confirmed').length;
  const activePromoCount = promoCodes.filter(p => p.isActive).length;

  return (
    <header className="sticky top-0 z-40 bg-stone-950/95 backdrop-blur-md border-b border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Current Business Profile & Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => setActiveTab('overview')}
              className="text-left font-bold tracking-tight text-stone-100 hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2.5"
            >
              <img
                src={currentBusiness.logoUrl}
                alt={currentBusiness.name}
                className="w-8 h-8 rounded-lg object-cover border border-amber-400/40 bg-stone-900 shrink-0"
              />
              <div className="hidden sm:block">
                <span className="text-sm md:text-base font-bold text-stone-100 block leading-tight truncate max-w-[170px]">
                  {currentBusiness.name}
                </span>
                <span className="text-[10px] text-stone-400 block font-normal truncate max-w-[170px]">
                  {currentBusiness.location}
                </span>
              </div>
            </button>

            {/* Quick Switcher Trigger */}
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="p-1 text-stone-400 hover:text-amber-400 rounded hover:bg-stone-900 border border-transparent hover:border-stone-800 transition-colors"
              title="Switch Rental Business Workspace or Login"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden xl:flex items-center gap-4 lg:gap-5 text-xs font-medium">
            <button
              onClick={() => setActiveTab('overview')}
              className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'overview' 
                  ? 'text-amber-400 font-semibold' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('reservations')}
              className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'reservations' 
                  ? 'text-amber-400 font-semibold' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Bookings</span>
              {pendingCount > 0 && (
                <span className="text-[10px] text-amber-400 font-mono">({pendingCount})</span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('pickups')}
              className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'pickups' 
                  ? 'text-amber-400 font-semibold' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Pickups</span>
            </button>

            <button
              onClick={() => setActiveTab('fleet')}
              className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'fleet' 
                  ? 'text-amber-400 font-semibold' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Fleet</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'reports' 
                  ? 'text-amber-400 font-semibold' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Depot Summary Report & Multi-format Export (Sheets, Excel, PDF, Word)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('promos')}
              className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'promos' 
                  ? 'text-amber-400 font-semibold' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Promos</span>
            </button>

            <button
              onClick={() => setActiveTab('social')}
              className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'social' 
                  ? 'text-amber-400 font-semibold' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Social</span>
            </button>

            <button
              onClick={() => setActiveTab('inbox')}
              className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 relative ${
                activeTab === 'inbox' 
                  ? 'text-amber-400 font-semibold' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Omnichannel Social Inbox (Messenger, WhatsApp, TikTok, Instagram)"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Social Inbox</span>
              {unreadChatCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-400 text-stone-950 font-mono">
                  {unreadChatCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('branding')}
              className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'branding' 
                  ? 'text-amber-400 font-semibold' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Shop Branding & Facebook Page Import Customization"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Branding</span>
            </button>

            <button
              onClick={() => setActiveTab('partner-network')}
              className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'partner-network' 
                  ? 'text-amber-400 font-semibold' 
                  : 'text-stone-400 hover:text-stone-200'
              }`}
              title="Multi-Tenant Partners & 30-Day Trial Activations"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Partner Shops</span>
            </button>

            <button
              onClick={() => setActiveTab('customer-portal')}
              className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
                activeTab === 'customer-portal' 
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm' 
                  : 'text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 font-semibold'
              }`}
              title="Switch to Customer-Facing Motorbike Reservation Portal"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Customer Portal</span>
            </button>
          </nav>

          {/* Zone 3: Actions & Subscription Status */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Quick Switcher between Customer & Staff Mode */}
            {activeTab === 'customer-portal' ? (
              <button
                onClick={() => setActiveTab('overview')}
                className="px-2.5 py-1.5 text-xs font-semibold text-stone-200 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                title="Switch back to Business Owner Operations Console"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Depot Console</span>
              </button>
            ) : (
              <button
                onClick={() => setActiveTab('customer-portal')}
                className="px-2.5 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                title="Switch to Customer Reservation View"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Customer View</span>
              </button>
            )}

            {/* Status Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-900 border border-stone-800 text-[11px] font-mono">
              <span className={`w-1.5 h-1.5 rounded-full ${
                currentBusiness.subscription.status === 'trial' ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'
              }`}></span>
              <span className="text-stone-300">
                {currentBusiness.subscription.status === 'trial' ? '30-Day Trial' : currentBusiness.isFlagship ? 'Platform Host' : '₱1,000/mo Active'}
              </span>
            </div>

            {/* Active Staff Operator Switcher Pill */}
            {currentBusiness.staffUsers && currentBusiness.staffUsers.length > 0 && (
              <div className="relative hidden md:block">
                <select
                  value={activeStaffUser.id}
                  onChange={(e) => switchActiveStaffUser(e.target.value)}
                  aria-label="Select Active Staff Operator"
                  className="bg-stone-900 border border-amber-400/30 text-amber-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400 font-mono cursor-pointer"
                  title="Switch Active Operator (Manager vs Staff RBAC)"
                >
                  {currentBusiness.staffUsers.map((staff) => (
                    <option key={staff.id} value={staff.id}>
                      {staff.role === 'manager' ? '👑' : '👤'} {staff.name} ({staff.role === 'manager' ? 'Manager' : staff.title})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Currency Selector */}
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as any)}
                aria-label="Select Currency"
                className="bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400 font-mono cursor-pointer"
                title="Select Currency (Southeast Asian defaults: PHP, USD, THB, IDR, VND, MYR, SGD)"
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                aria-label="Select Language"
                className="bg-stone-900 border border-stone-800 text-stone-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-amber-400 cursor-pointer"
                title="Select Language (English, Filipino, Bahasa, Thai, Vietnamese)"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Google Drive & Cloud Sheets Archive Button */}
            <button
              onClick={() => setIsArchiveModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Open Google Drive Folders & Master Google Sheets Archive"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden lg:inline">Cloud Archive</span>
            </button>

            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-2.5 py-1.5 text-xs font-medium text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg flex items-center gap-1.5 transition-colors"
              title="Switch business account or log in"
            >
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Switch / Login</span>
            </button>

            <button
              onClick={onOpenNewBookingModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-stone-950 bg-stone-100 hover:bg-white rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden md:inline">Manual Booking</span>
            </button>
          </div>
        </div>

        {/* Mobile secondary navigation strip */}
        <div className="flex xl:hidden items-center gap-2 py-2 overflow-x-auto border-t border-stone-800 text-xs text-stone-400 scrollbar-none">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'overview' ? 'text-amber-400 bg-stone-900 font-semibold' : ''}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('reservations')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'reservations' ? 'text-amber-400 bg-stone-900 font-semibold' : ''}`}
          >
            Bookings ({pendingCount})
          </button>
          <button
            onClick={() => setActiveTab('pickups')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'pickups' ? 'text-amber-400 bg-stone-900 font-semibold' : ''}`}
          >
            Pickups
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'fleet' ? 'text-amber-400 bg-stone-900 font-semibold' : ''}`}
          >
            Fleet
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'reports' ? 'text-amber-400 bg-stone-900 font-semibold' : ''}`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('promos')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'promos' ? 'text-amber-400 bg-stone-900 font-semibold' : ''}`}
          >
            Promos
          </button>
          <button
            onClick={() => setActiveTab('social')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'social' ? 'text-amber-400 bg-stone-900 font-semibold' : ''}`}
          >
            Social
          </button>
          <button
            onClick={() => setActiveTab('inbox')}
            className={`whitespace-nowrap px-2.5 py-1 rounded flex items-center gap-1 ${activeTab === 'inbox' ? 'text-amber-400 bg-stone-900 font-semibold' : ''}`}
          >
            <span>Inbox</span>
            {unreadChatCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'branding' ? 'text-amber-400 bg-stone-900 font-semibold' : ''}`}
          >
            Branding
          </button>
          <button
            onClick={() => setActiveTab('partner-network')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'partner-network' ? 'text-amber-400 bg-stone-900 font-semibold' : ''}`}
          >
            Partners
          </button>
          <button
            onClick={() => setActiveTab('customer-portal')}
            className={`whitespace-nowrap px-2.5 py-1 rounded ${activeTab === 'customer-portal' ? 'text-amber-400 bg-stone-900 font-semibold' : ''}`}
          >
            Portal
          </button>
        </div>
      </div>

      {/* Business Login / Switcher Modal */}
      {isLoginModalOpen && (
        <BusinessLoginModal
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* Google Cloud Archive & Drive Folders Modal */}
      {isArchiveModalOpen && (
        <GoogleDriveArchiveModal
          onClose={() => setIsArchiveModalOpen(false)}
        />
      )}
    </header>
  );
};
