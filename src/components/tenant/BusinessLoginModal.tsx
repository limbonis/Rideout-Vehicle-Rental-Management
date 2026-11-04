import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  X, 
  Check, 
  KeyRound, 
  Plus, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';

interface BusinessLoginModalProps {
  onClose: () => void;
  onOpenRegister?: () => void;
}

export const BusinessLoginModal: React.FC<BusinessLoginModalProps> = ({
  onClose,
  onOpenRegister,
}) => {
  const { businesses, currentBusinessId, setCurrentBusinessId, showToast, setActiveTab } = useApp();
  
  const [selectedId, setSelectedId] = useState(currentBusinessId);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authMode, setAuthMode] = useState<'quick_select' | 'credential_login'>('quick_select');

  const handleSelectBusiness = (id: string) => {
    setSelectedId(id);
    setCurrentBusinessId(id);
    const biz = businesses.find(b => b.id === id);
    showToast(`Logged in as ${biz?.name}! Workspace active.`, 'success');
    onClose();
  };

  const handleCredentialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Match by email if exists, otherwise fallback to selected
    const matched = businesses.find(b => b.email.toLowerCase() === loginEmail.toLowerCase());
    if (matched) {
      setCurrentBusinessId(matched.id);
      showToast(`Welcome back, ${matched.ownerName}! Logged in to ${matched.name}.`, 'success');
      onClose();
    } else {
      // Default to current
      showToast(`Logged in successfully!`, 'success');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden my-8 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            <div>
              <div className="font-bold text-stone-100 text-sm">Business Tenant Portal Login</div>
              <div className="text-[11px] text-stone-400">Select or sign in to your rental shop workspace</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Auth Mode Toggle */}
        <div className="p-3 bg-stone-950/80 border-b border-stone-800 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setAuthMode('quick_select')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              authMode === 'quick_select'
                ? 'bg-amber-400 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Quick Workspace Switcher
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('credential_login')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              authMode === 'credential_login'
                ? 'bg-amber-400 text-stone-950 font-bold'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            Owner Email & Password
          </button>
        </div>

        {authMode === 'quick_select' ? (
          /* Quick Business Workspace Switcher */
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="space-y-2">
              <span className="text-stone-400 font-semibold block">Available Rental Shop Accounts:</span>
              <div className="space-y-2">
                {businesses.map((biz) => {
                  const isSelected = biz.id === selectedId;
                  const isTrial = biz.subscription.status === 'trial';
                  const isActive = biz.subscription.status === 'active';

                  return (
                    <button
                      key={biz.id}
                      type="button"
                      onClick={() => handleSelectBusiness(biz.id)}
                      className={`w-full p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 shadow-sm ring-1 ring-amber-400/40'
                          : 'border-stone-800 bg-stone-950/80 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={biz.logoUrl}
                          alt={biz.name}
                          className="w-11 h-11 rounded-lg object-cover border border-stone-700 bg-stone-900 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-stone-100 flex items-center gap-1.5 truncate">
                            <span className="truncate">{biz.name}</span>
                            {biz.isFlagship && (
                              <span className="text-[10px] px-1.5 rounded bg-amber-400/20 text-amber-400 font-bold">
                                HOST
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-stone-400 truncate mt-0.5">
                            {biz.location} · {biz.ownerName}
                          </div>
                          <div className="text-[10px] mt-1 flex items-center gap-2">
                            {isTrial && (
                              <span className="text-blue-400 font-mono font-semibold">
                                30-Day Free Trial
                              </span>
                            )}
                            {isActive && !biz.isFlagship && (
                              <span className="text-emerald-400 font-mono font-semibold">
                                Active · ₱1,000/mo
                              </span>
                            )}
                            {biz.isFlagship && (
                              <span className="text-amber-400 font-mono font-semibold">
                                Platform Host (Unrestricted)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </div>
                        ) : (
                          <span className="text-[11px] text-stone-500 hover:text-stone-300">
                            Switch →
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Link to Customization and Partners */}
            <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveTab('branding');
                }}
                className="text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>Open Customization Window →</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveTab('partner-network');
                }}
                className="text-stone-400 hover:text-stone-200"
              >
                Manage All Partner Shops
              </button>
            </div>
          </div>
        ) : (
          /* Email & Password Form */
          <form onSubmit={handleCredentialLogin} className="p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-stone-400 mb-1 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Business Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="e.g. rideoutzambales@gmail.com"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-400 mb-1 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                <span>Log In to Workspace</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
