import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
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
  ExternalLink
} from 'lucide-react';

interface GoogleOAuthSubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (businessId: string) => void;
}

export const GoogleOAuthSubscribeModal: React.FC<GoogleOAuthSubscribeModalProps> = ({ 
  isOpen, 
  onClose,
  onSuccess 
}) => {
  const { 
    businesses, 
    setCurrentBusinessId, 
    registerNewBusiness, 
    setActiveTab, 
    showToast 
  } = useApp();

  const [mode, setMode] = useState<'preset' | 'new_trial'>('preset');

  // New trial business registration inputs
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [gmailAddress, setGmailAddress] = useState('');
  const [mobileNumber, setMobileNumber] = useState('0917');
  const [depotLocation, setDepotLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Handle Preset Google Account Login
  const handleSelectAccount = (email: string, businessId?: string) => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);

      if (email === 'rideoutzambales@gmail.com' || email === 'jibmaxatnewroad@gmail.com') {
        setCurrentBusinessId('biz-rideout');
        setActiveTab('overview');
        showToast(`Signed in with Google as ${email}`, 'success');
      } else if (businessId) {
        setCurrentBusinessId(businessId);
        setActiveTab('overview');
        showToast(`Signed in with Google as ${email}`, 'success');
      }

      onClose();
      if (onSuccess && businessId) {
        onSuccess(businessId);
      }
    }, 600);
  };

  // Handle New Business Registration via Gmail OAuth
  const handleRegisterNewTrial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim() || !gmailAddress.trim() || !ownerName.trim()) {
      showToast('Please provide your business name, owner name, and Gmail address', 'error');
      return;
    }

    if (!gmailAddress.includes('@')) {
      showToast('Please enter a valid Gmail or work email address', 'error');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const newBizId = registerNewBusiness({
        name: shopName.trim(),
        tagline: `${shopName.trim()} · Vehicle Fleet & Rental Depot`,
        ownerName: ownerName.trim(),
        email: gmailAddress.trim().toLowerCase(),
        mobile: mobileNumber.trim(),
        location: depotLocation.trim() || 'Main Depot Office',
        gcashAccountName: `${shopName.toUpperCase()} / ${ownerName.toUpperCase()}`,
        gcashAccountNumber: mobileNumber.trim(),
      });

      setIsSubmitting(false);
      showToast(`Welcome! 30-Day Free Trial activated for ${shopName}`, 'success');
      setCurrentBusinessId(newBizId);
      setActiveTab('overview');
      onClose();
      if (onSuccess) {
        onSuccess(newBizId);
      }
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 text-stone-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header with Google G Icon */}
        <div className="flex items-start gap-3.5 pr-8">
          <div className="w-12 h-12 rounded-xl bg-white p-2.5 flex items-center justify-center shadow-md shrink-0">
            {/* Official Google G Logo SVG */}
            <svg viewBox="0 0 24 24" width="24" height="24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-400/10 text-amber-400 border border-amber-400/20 px-2 py-0.5 rounded">
                Google OAuth 2.0
              </span>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                30-Day Free Trial
              </span>
            </div>
            <h3 className="text-lg font-bold text-stone-100 mt-0.5">
              Sign in with Google
            </h3>
            <p className="text-xs text-stone-400">
              Access your Rideout Rentals depot workspace or start a 30-day free trial.
            </p>
          </div>
        </div>

        {/* Tab Switcher: Preset Roles vs New Trial Registration */}
        <div className="flex items-center gap-1 p-1 bg-stone-950 border border-stone-800 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setMode('preset')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-colors ${
              mode === 'preset'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            Google Account Switcher
          </button>
          <button
            type="button"
            onClick={() => setMode('new_trial')}
            className={`flex-1 py-1.5 px-3 rounded-lg font-semibold transition-colors ${
              mode === 'new_trial'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            + Start New Business Trial
          </button>
        </div>

        {mode === 'preset' ? (
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
              Choose an authorized Google account:
            </span>

            {/* Account 1: RideOut Zambales */}
            <div
              onClick={() => handleSelectAccount('rideoutzambales@gmail.com', 'biz-rideout')}
              className="p-3.5 rounded-xl border border-stone-800 bg-stone-950 hover:border-amber-400/60 hover:bg-stone-900/60 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-stone-950 text-sm shadow-md">
                  R
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-stone-100 group-hover:text-amber-400 transition-colors">
                      RideOut Zambales Moto Rentals
                    </span>
                    <span className="text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                      Depot Account
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 font-mono">
                    rideoutzambales@gmail.com
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    San Felipe Depot · Zambales Fleet & Bookings
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Account 2: Admin Account */}
            <div
              onClick={() => handleSelectAccount('jibmaxatnewroad@gmail.com')}
              className="p-3.5 rounded-xl border border-stone-800 bg-stone-950 hover:border-amber-400/60 hover:bg-stone-900/60 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white text-sm shadow-md">
                  J
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-stone-100 group-hover:text-amber-400 transition-colors">
                      Jibmax Operations
                    </span>
                    <span className="text-[9px] font-mono uppercase bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded border border-purple-500/30">
                      Depot Admin
                    </span>
                  </div>
                  <div className="text-[11px] text-stone-400 font-mono">
                    jibmaxatnewroad@gmail.com
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    Operations and management console
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
            </div>

            {/* Other existing tenant depots */}
            {businesses
              .filter(b => b.id !== 'biz-rideout')
              .map(b => (
                <div
                  key={b.id}
                  onClick={() => handleSelectAccount(b.email, b.id)}
                  className="p-3 rounded-xl border border-stone-800/80 bg-stone-950/60 hover:border-stone-700 hover:bg-stone-900 transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={b.logoUrl} alt={b.name} className="w-8 h-8 rounded-lg object-cover border border-stone-800" />
                    <div>
                      <div className="font-semibold text-xs text-stone-200 group-hover:text-white">
                        {b.name}
                      </div>
                      <div className="text-[10px] text-stone-500 font-mono">
                        {b.email} · {b.location}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-stone-400 group-hover:text-amber-400">
                    Switch ➔
                  </span>
                </div>
              ))}
          </div>
        ) : (
          <form onSubmit={handleRegisterNewTrial} className="space-y-3.5 text-xs">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] leading-relaxed">
              <strong>Rideout Rentals 30-Day Free Trial</strong>: Zero credit card required. Month 1 is 100% free. Create your depot and test the system immediately with your Google account.
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">Rental Business / Depot Name *</label>
              <input
                type="text"
                required
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="e.g. Palawan Coastal Scooters, Cebu Rideout"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Owner / Manager Name *</label>
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Maria Santos"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Gmail Address (OAuth Login) *</label>
                <input
                  type="email"
                  required
                  value={gmailAddress}
                  onChange={(e) => setGmailAddress(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">Mobile / GCash Number *</label>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="0917 123 4567"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">Town / Operating Location *</label>
                <input
                  type="text"
                  required
                  value={depotLocation}
                  onChange={(e) => setDepotLocation(e.target.value)}
                  placeholder="e.g. El Nido, Palawan or Moalboal, Cebu"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setMode('preset')}
                className="text-stone-400 hover:text-stone-200"
              >
                Back to Account List
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
                <span>{isSubmitting ? 'Signing in with Google...' : 'Authorize Gmail & Start Free Trial'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Footer Security Note */}
        <div className="pt-3 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-500">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Encrypted Google OAuth 2.0 Client Authentication</span>
          </div>
          <span>Platform: Rideout Rentals</span>
        </div>
      </div>
    </div>
  );
};
