import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currencyAndLanguage';
import { RenterClosestDepotView } from './RenterClosestDepotView';
import { BusinessOnboardingWizard } from './BusinessOnboardingWizard';
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  KeyRound, 
  Mail, 
  Check, 
  Clock, 
  User, 
  Smartphone,
  AlertCircle,
  HelpCircle,
  Lock,
  Bike,
  Compass,
  ArrowLeft
} from 'lucide-react';

interface GoogleOAuthSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess?: (businessId: string) => void;
}

export const GoogleOAuthSubscribeModal: React.FC<GoogleOAuthSubscribeModalProps> = ({ 
  isOpen, 
  onClose,
  initialMode = 'login',
  onSuccess 
}) => {
  const { 
    businesses, 
    loginWithGoogleEmail,
    currency,
    showToast 
  } = useApp();

  const [modalMode, setModalMode] = useState<'login' | 'role_select' | 'renter_closest' | 'business_wizard'>(
    initialMode === 'signup' ? 'role_select' : 'login'
  );
  const [customLoginEmail, setCustomLoginEmail] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setModalMode(initialMode === 'signup' ? 'role_select' : 'login');
      setLoginError(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Handle Google OAuth Sign-In Attempt
  const handleAttemptLogin = (email: string) => {
    if (!email.trim() || !email.includes('@')) {
      setLoginError('Please enter a valid Gmail address (e.g. name@gmail.com).');
      return;
    }

    setIsSubmitting(true);
    setLoginError(null);

    setTimeout(() => {
      setIsSubmitting(false);
      const result = loginWithGoogleEmail(email.trim());

      if (result.success && result.hasActiveSubscription) {
        // Active subscription verified! Opened depot console
        onClose();
        if (onSuccess && result.business?.id) {
          onSuccess(result.business.id);
        }
      } else {
        // No active subscription or unregistered account!
        // Show explicit notice and transition to the Choice Window: Renter vs Rental Business
        setLoginError(`No active Rideout Rentals subscription found for "${email.trim()}".`);
        setCustomLoginEmail(email.trim().toLowerCase());
        setModalMode('role_select');
        showToast('No active subscription found. Please select how you want to proceed.', 'info');
      }
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`bg-stone-900 border border-stone-800 rounded-2xl sm:rounded-3xl w-full shadow-2xl flex flex-col text-stone-100 relative max-h-[90vh] my-auto overflow-hidden ${
          modalMode === 'business_wizard' ? 'max-w-3xl' : 'max-w-md'
        }`}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors z-30"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* NON-LOGIN MODES: Header with back navigation */}
        {modalMode !== 'login' && (
          <div className="shrink-0 p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between pr-12 bg-stone-900/90 backdrop-blur-sm">
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setModalMode('login')}
                className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                title="Back to Login"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div>
                <h3 className="text-sm font-bold text-stone-100">
                  {modalMode === 'role_select' && 'Select Your Profile'}
                  {modalMode === 'renter_closest' && 'Find Closest Rental Depot'}
                  {modalMode === 'business_wizard' && 'Rental Business Depot Setup'}
                </h3>
                <span className="text-[10px] text-stone-400">
                  Rideout Rentals · Southeast Asia
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-5">

        {/* ======================================================== */}
        {/* MODE 1: Authentic Google Sign-In Pop-up Card            */}
        {/* ======================================================== */}
        {modalMode === 'login' && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Authentic Centered Google Header */}
            <div className="text-center space-y-2 pt-2">
              <div className="w-12 h-12 rounded-full bg-white p-2.5 mx-auto flex items-center justify-center shadow-lg ring-1 ring-stone-700/50">
                <svg viewBox="0 0 24 24" width="24" height="24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Sign in with Google
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  to continue to <span className="text-stone-200 font-semibold">Rideout Rentals</span>
                </p>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="p-3.5 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block font-bold text-red-300">Account Notice</strong>
                  <p className="text-[11px] text-red-200/90">{loginError}</p>
                </div>
              </div>
            )}

            {/* Gmail Input & Sign-In Action */}
            <div className="space-y-3.5">
              <div className="space-y-1">
                <label className="block text-stone-300 font-medium text-xs">
                  Email or phone
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={customLoginEmail}
                    onChange={(e) => setCustomLoginEmail(e.target.value)}
                    placeholder="yourgmail@gmail.com"
                    autoFocus
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAttemptLogin(customLoginEmail);
                      }
                    }}
                  />
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAttemptLogin(customLoginEmail)}
                className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md shadow-amber-500/20 active:scale-98"
              >
                <span>{isSubmitting ? 'Verifying subscription...' : 'Sign In with Gmail'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                If an active subscription exists, your <strong>Depot Console</strong> opens immediately.
              </p>
            </div>

            {/* Quick Demo Test Accounts */}
            <div className="pt-2 border-t border-stone-800 space-y-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block font-mono">
                Quick test with active accounts:
              </span>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => handleAttemptLogin('rideoutzambales@gmail.com')}
                  className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-400/50 text-left transition-all flex items-center justify-between group"
                >
                  <div className="truncate">
                    <span className="font-bold text-stone-200 group-hover:text-amber-400 block text-xs">
                      RideOUT Zambales
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      rideoutzambales@gmail.com
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold shrink-0">
                    Active Depot
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAttemptLogin('jibmaxatnewroad@gmail.com')}
                  className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-400/50 text-left transition-all flex items-center justify-between group"
                >
                  <div className="truncate">
                    <span className="font-bold text-stone-200 group-hover:text-amber-400 block text-xs">
                      Platform Owner Account
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">
                      jibmaxatnewroad@gmail.com
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold shrink-0">
                    Dev Owner
                  </span>
                </button>
              </div>
            </div>

            {/* Link to Sign-Up / Choice Mode */}
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => setModalMode('role_select')}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold underline"
              >
                New user? Choose between Renter or Business sign-up ➔
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 2: Role Selection (Renter vs Rental Business)       */}
        {/* ======================================================== */}
        {modalMode === 'role_select' && (
          <div className="space-y-5 animate-fade-in">
            {loginError && (
              <div className="p-3.5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-200 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <strong className="block font-bold text-amber-300">Subscription Not Found</strong>
                  <p className="text-[11px] text-stone-300">
                    No active depot subscription found for <strong>{customLoginEmail || 'this email'}</strong>. Please choose how you want to continue:
                  </p>
                </div>
              </div>
            )}

            <div className="text-center space-y-1">
              <h4 className="text-base font-extrabold text-stone-100">
                How would you like to use Rideout Rentals?
              </h4>
              <p className="text-xs text-stone-400">
                Select your profile to be guided to the right experience.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              
              {/* Option 1: Renter */}
              <div 
                onClick={() => setModalMode('renter_closest')}
                className="p-4 rounded-2xl bg-stone-950 border-2 border-stone-800 hover:border-emerald-500/80 transition-all cursor-pointer group flex items-start justify-between gap-3 hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
                    <Bike className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
                      Customer / Tourist
                    </span>
                    <h5 className="text-sm font-bold text-stone-100 group-hover:text-emerald-300 transition-colors">
                      I am a Renter
                    </h5>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Looking to rent a motorbike, bicycle, or car. We will show you the <strong>proximally closest verified business subscriber</strong> in your town or province.
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0 mt-2" />
              </div>

              {/* Option 2: Rental Business */}
              <div 
                onClick={() => setModalMode('business_wizard')}
                className="p-4 rounded-2xl bg-stone-950 border-2 border-amber-400/40 hover:border-amber-400 transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-lg shadow-amber-500/10"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
                    <Building2 className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                      Fleet Operator · 30-Day Free Trial
                    </span>
                    <h5 className="text-sm font-bold text-stone-100 group-hover:text-amber-300 transition-colors">
                      I am a Rental Business
                    </h5>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Operate a fleet of bicycles, motorbikes, or cars. Complete our setup guide (owner ID, email verification, physical storefront photo, fleet checklist, and Facebook connect) to launch your depot console.
                    </p>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform shrink-0 mt-2" />
              </div>

            </div>

            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={() => {
                  setModalMode('login');
                  setLoginError(null);
                }}
                className="text-xs text-stone-400 hover:text-stone-200 underline font-medium flex items-center justify-center gap-1 mx-auto"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 3: Renter Looking for Closest Depot Subscriber      */}
        {/* ======================================================== */}
        {modalMode === 'renter_closest' && (
          <RenterClosestDepotView
            onBackToChoices={() => setModalMode('role_select')}
            onCloseModal={onClose}
          />
        )}

        {/* ======================================================== */}
        {/* MODE 4: First-Time Rental Business Onboarding Wizard     */}
        {/* ======================================================== */}
        {modalMode === 'business_wizard' && (
          <BusinessOnboardingWizard
            initialEmail={customLoginEmail || 'depot@gmail.com'}
            onBackToChoices={() => setModalMode('role_select')}
            onSuccess={(newBizId) => {
              onClose();
              if (onSuccess) onSuccess(newBizId);
            }}
          />
        )}

        </div>
      </div>
    </div>
  );
};
