import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  LayoutDashboard, 
  CalendarCheck, 
  KeyRound, 
  Bike, 
  FileSpreadsheet, 
  MessageSquare, 
  Share2, 
  Tag, 
  Palette, 
  Building2, 
  ChevronDown, 
  HardDrive, 
  Plus, 
  CheckCircle2, 
  LogOut,
  Maximize2,
  Sliders,
  Settings
} from 'lucide-react';
import { OverviewStats } from '../analytics/OverviewStats';
import { ReservationsView } from '../reservations/ReservationsView';
import { PickupInspectionView } from '../pickups/PickupInspectionView';
import { FleetView } from '../fleet/FleetView';
import { DepotSummaryReportView } from '../analytics/DepotSummaryReportView';
import { UnifiedInboxView } from '../inbox/UnifiedInboxView';
import { SocialMediaStudio } from '../social/SocialMediaStudio';
import { PromoManagementView } from '../promos/PromoManagementView';
import { ShopBrandingView } from './ShopBrandingView';
import { BusinessActivationView } from './BusinessActivationView';
import { BusinessLoginModal } from './BusinessLoginModal';
import { GoogleDriveArchiveModal } from './GoogleDriveArchiveModal';
import { Reservation } from '../../types';

interface DepotConsoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNewBooking: (bikeId?: string) => void;
}

type ConsoleTab = 
  | 'overview' 
  | 'reservations' 
  | 'pickups' 
  | 'social' 
  | 'inbox' 
  | 'management' 
  | 'network';

type ManagementSubTab = 'fleet' | 'reports' | 'promos' | 'branding';

export const DepotConsoleModal: React.FC<DepotConsoleModalProps> = ({
  isOpen,
  onClose,
  onOpenNewBooking
}) => {
  const { 
    currentBusiness, 
    reservations, 
    businessReservations,
    unreadChatCount, 
    currentUser, 
    logoutUser,
    setSelectedReservationForPickup,
    isArchiveModalOpen,
    setIsArchiveModalOpen,
    isPlatformOwner
  } = useApp();

  const [activeConsoleTab, setActiveConsoleTab] = useState<ConsoleTab>('overview');
  const [activeManagementSubTab, setActiveManagementSubTab] = useState<ManagementSubTab>('fleet');
  const [isSwitchDepotOpen, setIsSwitchDepotOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSwitchDepotOpen && !isArchiveModalOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, isSwitchDepotOpen, isArchiveModalOpen, onClose]);

  if (!isOpen) return null;

  const currentReservations = businessReservations || reservations.filter(r => r.businessId === currentBusiness.id);
  const pendingCount = currentReservations.filter(r => r.status === 'pending' || r.status === 'confirmed').length;

  const handleSelectReservationForPickup = (res: Reservation) => {
    setSelectedReservationForPickup(res);
    setActiveConsoleTab('pickups');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md animate-fade-in p-2 sm:p-4 flex items-start sm:items-center justify-center">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-stone-950 border border-stone-800 rounded-2xl sm:rounded-3xl max-w-7xl w-full h-[95vh] shadow-2xl flex flex-col text-stone-100 relative my-auto overflow-hidden"
      >
        {/* Top Header of the Depot Console Modal */}
        <div className="shrink-0 bg-stone-900 border-b border-stone-800 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Depot Identity & Switcher */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-stone-950 px-2.5 py-1.5 rounded-xl border border-stone-800">
              <img
                src={currentBusiness.logoUrl}
                alt={currentBusiness.name}
                className="w-6 h-6 rounded-lg object-cover border border-amber-400/40 bg-stone-900 shrink-0"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-100 truncate max-w-[150px] sm:max-w-[200px]">
                    {currentBusiness.name}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <span className="text-[10px] text-amber-400 font-mono block -mt-0.5">
                  {currentBusiness.depots && currentBusiness.depots.length > 1 
                    ? `${currentBusiness.depots.length} Active Depots` 
                    : 'Active Depot Console'}
                </span>
              </div>
              <button
                onClick={() => setIsSwitchDepotOpen(true)}
                className="p-1 text-stone-400 hover:text-amber-400 rounded transition-colors ml-1"
                title="Switch Depot"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {currentUser && (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-950/60 border border-stone-800 text-[11px] font-mono text-stone-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{currentUser.email}</span>
                {isPlatformOwner && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-400/20 text-amber-300 font-bold uppercase ml-1">
                    Platform Owner
                  </span>
                )}
              </span>
            )}
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsArchiveModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-800 text-stone-300 hover:text-white transition-colors text-xs flex items-center gap-1.5"
              title="Google Drive & Sheets Master Cloud Archive"
            >
              <HardDrive className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Cloud Archive</span>
            </button>

            <button
              onClick={() => onOpenNewBooking()}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Manual Booking</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors ml-1"
              title="Close Depot Console"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Consolidated Console Navigation Tabs Bar */}
        <div className="shrink-0 bg-stone-950 border-b border-stone-800/80 px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none">
          <nav className="flex items-center gap-1.5 text-xs font-medium">
            <button
              onClick={() => setActiveConsoleTab('overview')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeConsoleTab === 'overview'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveConsoleTab('reservations')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeConsoleTab === 'reservations'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>Bookings ({pendingCount})</span>
            </button>

            <button
              onClick={() => setActiveConsoleTab('pickups')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeConsoleTab === 'pickups'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Pickups & Inspections</span>
            </button>

            <button
              onClick={() => setActiveConsoleTab('social')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeConsoleTab === 'social'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Social Studio</span>
            </button>

            <button
              onClick={() => setActiveConsoleTab('inbox')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeConsoleTab === 'inbox'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Omnichannel Inbox</span>
              {unreadChatCount > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>

            {/* Consolidated Depot Management Suite */}
            <button
              onClick={() => setActiveConsoleTab('management')}
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeConsoleTab === 'management'
                  ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Depot Management</span>
            </button>

            {/* Partner Depot Network: ONLY visible to platform owner */}
            {isPlatformOwner && (
              <button
                onClick={() => setActiveConsoleTab('network')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  activeConsoleTab === 'network'
                    ? 'bg-amber-400 text-stone-950 font-bold shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                }`}
                title="Only accessible to Platform Owner"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Partner Network (Owner)</span>
              </button>
            )}
          </nav>
        </div>

        {/* Sub-navigation bar when inside Depot Management Suite */}
        {activeConsoleTab === 'management' && (
          <div className="shrink-0 bg-stone-900/90 border-b border-stone-800 px-4 sm:px-6 py-1.5 flex items-center gap-2 overflow-x-auto">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mr-2 hidden sm:inline">
              Management Suite:
            </span>

            <button
              onClick={() => setActiveManagementSubTab('fleet')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeManagementSubTab === 'fleet'
                  ? 'bg-stone-100 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>Fleet Inventory</span>
            </button>

            <button
              onClick={() => setActiveManagementSubTab('reports')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeManagementSubTab === 'reports'
                  ? 'bg-stone-100 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Audit Reports</span>
            </button>

            <button
              onClick={() => setActiveManagementSubTab('promos')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeManagementSubTab === 'promos'
                  ? 'bg-stone-100 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>Promos & Rates</span>
            </button>

            <button
              onClick={() => setActiveManagementSubTab('branding')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeManagementSubTab === 'branding'
                  ? 'bg-stone-100 text-stone-950 shadow-sm'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Branding & Depots</span>
            </button>
          </div>
        )}

        {/* Modal Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-950">
          {activeConsoleTab === 'overview' && (
            <OverviewStats
              onOpenNewBooking={() => onOpenNewBooking()}
              onSelectReservationForPickup={handleSelectReservationForPickup}
            />
          )}

          {activeConsoleTab === 'reservations' && (
            <ReservationsView
              onOpenNewBooking={() => onOpenNewBooking()}
              onSelectForPickup={handleSelectReservationForPickup}
            />
          )}

          {activeConsoleTab === 'pickups' && (
            <PickupInspectionView />
          )}

          {activeConsoleTab === 'social' && (
            <SocialMediaStudio />
          )}

          {activeConsoleTab === 'inbox' && (
            <UnifiedInboxView />
          )}

          {activeConsoleTab === 'management' && (
            <>
              {activeManagementSubTab === 'fleet' && (
                <FleetView
                  onOpenNewBookingWithBike={(bikeId) => onOpenNewBooking(bikeId)}
                />
              )}
              {activeManagementSubTab === 'reports' && (
                <DepotSummaryReportView />
              )}
              {activeManagementSubTab === 'promos' && (
                <PromoManagementView />
              )}
              {activeManagementSubTab === 'branding' && (
                <ShopBrandingView />
              )}
            </>
          )}

          {activeConsoleTab === 'network' && isPlatformOwner && (
            <BusinessActivationView />
          )}
        </div>

        {/* Sub-modals inside Depot Console */}
        {isSwitchDepotOpen && (
          <BusinessLoginModal
            onClose={() => setIsSwitchDepotOpen(false)}
          />
        )}

        {isArchiveModalOpen && (
          <GoogleDriveArchiveModal
            onClose={() => setIsArchiveModalOpen(false)}
          />
        )}
      </div>
    </div>
  );
};
