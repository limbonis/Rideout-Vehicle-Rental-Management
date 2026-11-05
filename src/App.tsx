/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { RideoutRentalsLandingView } from './components/landing/RideoutRentalsLandingView';
import { CustomerBookingModal } from './components/customer/CustomerBookingModal';
import { PlatformDemoVideoModal } from './components/demo/PlatformDemoVideoModal';
import { DepotConsoleModal } from './components/tenant/DepotConsoleModal';
import { NewReservationModal } from './components/reservations/NewReservationModal';
import { GoogleOAuthSubscribeModal } from './components/auth/GoogleOAuthSubscribeModal';
import { CheckCircle2, AlertCircle, Info, X, RotateCcw } from 'lucide-react';

function AppContent() {
  const { 
    toasts, 
    removeToast, 
    resetDemoData,
    currentUser,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalInitialMode
  } = useApp();

  const [isCustomerBookingModalOpen, setIsCustomerBookingModalOpen] = useState(false);
  const [isVideoDemoModalOpen, setIsVideoDemoModalOpen] = useState(false);
  const [isDepotConsoleModalOpen, setIsDepotConsoleModalOpen] = useState(false);
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [initialBikeForBooking, setInitialBikeForBooking] = useState<string | undefined>(undefined);

  const handleOpenBookingWithBike = (bikeId?: string) => {
    setInitialBikeForBooking(bikeId);
    setIsNewBookingModalOpen(true);
  };

  const scrollToFeaturesAndPricing = () => {
    const el = document.getElementById('features-and-pricing');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Main Single-Section Viewport: Everything in one unified landing experience */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <RideoutRentalsLandingView
          onOpenCustomerBooking={() => setIsCustomerBookingModalOpen(true)}
          onOpenVideoDemo={() => setIsVideoDemoModalOpen(true)}
          onOpenDepotConsole={() => setIsDepotConsoleModalOpen(true)}
        />
      </main>

      {/* Customer Booking Portal Modal (Search a Motorbike through Our Business Partners) */}
      <CustomerBookingModal
        isOpen={isCustomerBookingModalOpen}
        onClose={() => setIsCustomerBookingModalOpen(false)}
      />

      {/* Platform Interactive Video Demo Modal */}
      <PlatformDemoVideoModal
        isOpen={isVideoDemoModalOpen}
        onClose={() => setIsVideoDemoModalOpen(false)}
        onOpenConsoleDemo={() => setIsDepotConsoleModalOpen(true)}
      />

      {/* Depot Console Modal (for active business subscribers & demo tests) */}
      <DepotConsoleModal
        isOpen={isDepotConsoleModalOpen}
        onClose={() => setIsDepotConsoleModalOpen(false)}
        onOpenNewBooking={(bikeId) => handleOpenBookingWithBike(bikeId)}
      />

      {/* Google OAuth & Subscription Modal */}
      <GoogleOAuthSubscribeModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalInitialMode}
      />

      {/* Manual Booking Modal */}
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

      {/* Clean Regional Footer */}
      <footer className="border-t border-stone-800 bg-stone-950/90 py-6 text-xs text-stone-400 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-stone-800/80 pb-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-bold text-amber-400 text-sm tracking-tight">Rideout Rentals</span>
              <span className="text-stone-600">|</span>
              <span className="text-stone-300">Vehicle Rental Management System</span>
              <span className="text-stone-600">·</span>
              <span className="text-stone-400">Southeast Asia: Philippines (Default) · Thailand · Indonesia · Vietnam · Malaysia · Singapore</span>
            </div>
            <div className="flex items-center gap-3 text-stone-400">
              <button 
                type="button"
                onClick={scrollToFeaturesAndPricing}
                className="hover:text-amber-400 transition-colors"
              >
                Features & Pricing
              </button>
              <span className="text-stone-600">·</span>
              <button 
                type="button"
                onClick={() => setIsCustomerBookingModalOpen(true)}
                className="hover:text-amber-400 transition-colors"
              >
                Search a Motorbike
              </button>
              <span className="text-stone-600">·</span>
              <button 
                type="button"
                onClick={() => setIsVideoDemoModalOpen(true)}
                className="hover:text-amber-400 transition-colors text-amber-400/90"
              >
                View Demo
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-500 text-[11px]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-stone-400">Country:</span>
              <span className="text-stone-300">Philippines (Default 🇵🇭)</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-stone-400">Currency:</span>
              <span className="text-stone-300">Philippine Peso (PHP ₱)</span>
              <span aria-hidden="true">·</span>
              <span className="font-semibold text-stone-400">Language:</span>
              <span className="text-stone-300">English</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={resetDemoData}
                className="hover:text-stone-300 transition-colors flex items-center gap-1.5"
                title="Reset fleet, bookings and posts to original demo state"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Demo State</span>
              </button>
            </div>
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
