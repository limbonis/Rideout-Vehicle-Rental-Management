import React, { useEffect } from 'react';
import { X, Bike, MapPin, Sparkles } from 'lucide-react';
import { CustomerBookingView } from './CustomerBookingView';

interface CustomerBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerBookingModal: React.FC<CustomerBookingModalProps> = ({
  isOpen,
  onClose
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md animate-fade-in p-2 sm:p-4 md:p-6 flex items-start sm:items-center justify-center">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-stone-950 border border-stone-800 rounded-2xl sm:rounded-3xl max-w-7xl w-full h-[94vh] shadow-2xl flex flex-col text-stone-100 relative my-auto overflow-hidden"
      >
        {/* Modal Top Header Bar */}
        <div className="shrink-0 px-4 sm:px-6 py-3.5 bg-stone-900/95 border-b border-stone-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-stone-950 font-bold shrink-0">
              <Bike className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded">
                  Partner Depot Network
                </span>
                <span className="text-[11px] text-emerald-400 font-mono hidden sm:inline">
                  Verified Local Fleet Partners
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-stone-100">
                Search a Motorbike through Our Business Partners
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-950 border border-stone-800 text-xs text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>Select Province or Nearest Partner Depot</span>
            </span>

            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
              title="Close Booking Portal"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Container with CustomerBookingView */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-950">
          <CustomerBookingView />
        </div>
      </div>
    </div>
  );
};
