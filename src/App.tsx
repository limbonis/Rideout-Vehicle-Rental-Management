/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navigation } from './components/Navigation';
import { OverviewStats } from './components/analytics/OverviewStats';
import { ReservationsView } from './components/reservations/ReservationsView';
import { NewReservationModal } from './components/reservations/NewReservationModal';
import { PickupInspectionView } from './components/pickups/PickupInspectionView';
import { FleetView } from './components/fleet/FleetView';
import { SocialMediaStudio } from './components/social/SocialMediaStudio';
import { CustomerBookingView } from './components/customer/CustomerBookingView';
import { PromoManagementView } from './components/promos/PromoManagementView';
import { ShopBrandingView } from './components/tenant/ShopBrandingView';
import { BusinessActivationView } from './components/tenant/BusinessActivationView';
import { UnifiedInboxView } from './components/inbox/UnifiedInboxView';
import { DepotSummaryReportView } from './components/analytics/DepotSummaryReportView';
import { Reservation } from './types';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

function AppContent() {
  const { 
    activeTab, 
    setActiveTab, 
    toasts, 
    removeToast, 
    setSelectedReservationForPickup, 
    resetDemoData 
  } = useApp();

  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [initialBikeForBooking, setInitialBikeForBooking] = useState<string | undefined>(undefined);

  const handleOpenBookingWithBike = (bikeId?: string) => {
    setInitialBikeForBooking(bikeId);
    setIsNewBookingModalOpen(true);
  };

  const handleSelectReservationForPickup = (res: Reservation) => {
    setSelectedReservationForPickup(res);
    setActiveTab('pickups');
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Bar adhering to Top Bar Contract */}
      <Navigation onOpenNewBookingModal={() => handleOpenBookingWithBike()} />

      {/* Main Viewport Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        {activeTab === 'overview' && (
          <OverviewStats
            onOpenNewBooking={() => handleOpenBookingWithBike()}
            onSelectReservationForPickup={handleSelectReservationForPickup}
          />
        )}

        {activeTab === 'reservations' && (
          <ReservationsView
            onOpenNewBooking={() => handleOpenBookingWithBike()}
            onSelectForPickup={handleSelectReservationForPickup}
          />
        )}

        {activeTab === 'pickups' && (
          <PickupInspectionView />
        )}

        {activeTab === 'fleet' && (
          <FleetView
            onOpenNewBookingWithBike={(bikeId) => handleOpenBookingWithBike(bikeId)}
          />
        )}

        {activeTab === 'reports' && (
          <DepotSummaryReportView />
        )}

        {activeTab === 'promos' && (
          <PromoManagementView />
        )}

        {activeTab === 'social' && (
          <SocialMediaStudio />
        )}

        {activeTab === 'inbox' && (
          <UnifiedInboxView />
        )}

        {activeTab === 'branding' && (
          <ShopBrandingView />
        )}

        {activeTab === 'partner-network' && (
          <BusinessActivationView />
        )}

        {activeTab === 'customer-portal' && (
          <CustomerBookingView />
        )}
      </main>

      {/* Global New Reservation Modal */}
      {isNewBookingModalOpen && (
        <NewReservationModal
          onClose={() => {
            setIsNewBookingModalOpen(false);
            setInitialBikeForBooking(undefined);
          }}
          initialBikeId={initialBikeForBooking}
        />
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3.5 rounded-lg border shadow-lg flex items-center justify-between gap-3 text-xs backdrop-blur-md transition-all ${
              toast.type === 'success'
                ? 'bg-stone-900/95 border-emerald-500/40 text-stone-100'
                : toast.type === 'error'
                ? 'bg-stone-900/95 border-red-500/40 text-stone-100'
                : 'bg-stone-900/95 border-amber-500/40 text-stone-100'
            }`}
          >
            <div className="flex items-center gap-2">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-amber-400 shrink-0" />}
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Clean Footer */}
      <footer className="border-t border-stone-800 bg-stone-950/80 py-6 text-xs text-stone-500 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-stone-400">RideOut Zambales Moto Rentals</span>
            <span aria-hidden="true">·</span>
            <span>San Felipe Depot, Zambales, Philippines</span>
            <span aria-hidden="true">·</span>
            <span>rideoutzambales@gmail.com</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={resetDemoData}
              className="hover:text-stone-300 transition-colors flex items-center gap-1.5"
              title="Reset fleet, bookings and posts to original demo state"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Demo State</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
