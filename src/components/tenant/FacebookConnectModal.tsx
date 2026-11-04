import React, { useState } from 'react';
import { 
  X, 
  Facebook, 
  CheckCircle2, 
  Sparkles, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  Image as ImageIcon,
  Check,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FacebookConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFbUrl?: string;
  onConnected?: (data: { name: string; logoUrl: string; coverPhotoUrl: string }) => void;
}

interface DemoFacebookPage {
  id: string;
  name: string;
  category: string;
  followers: number;
  url: string;
  logoUrl: string;
  coverUrl: string;
}

const SAMPLE_FACEBOOK_PAGES: DemoFacebookPage[] = [
  {
    id: 'page-101',
    name: 'RideOUT Zambales',
    category: 'Motorcycle Rental & Tours',
    followers: 18400,
    url: 'https://facebook.com/rideoutzambales',
    logoUrl: '/assets/images/bike_urban_scooter_1793338342006.jpg',
    coverUrl: '/assets/images/hero_coastal_ride_1793338340532.jpg',
  },
  {
    id: 'page-102',
    name: 'Liwliwa Surf & Moto Rentals',
    category: 'Surf & Beach Scooter Hire',
    followers: 9200,
    url: 'https://facebook.com/liwliwasurfrentals',
    logoUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'page-103',
    name: 'Elyu Wheels & Waves Moto',
    category: 'Motorcycle & Scooter Rental',
    followers: 21500,
    url: 'https://facebook.com/elyuwheels',
    logoUrl: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&auto=format&fit=crop&q=80',
  },
  {
    id: 'page-104',
    name: 'Siargao Island Moto Rentals',
    category: 'Island Scooter Hire',
    followers: 14200,
    url: 'https://facebook.com/siargaomotos',
    logoUrl: 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=300&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=1200&auto=format&fit=crop&q=80',
  }
];

export const FacebookConnectModal: React.FC<FacebookConnectModalProps> = ({
  isOpen,
  onClose,
  currentFbUrl,
  onConnected
}) => {
  const { currentBusiness, importBrandingFromFacebook, showToast } = useApp();

  const [selectedPageId, setSelectedPageId] = useState<string>(SAMPLE_FACEBOOK_PAGES[0].id);
  const [customPageUrl, setCustomPageUrl] = useState<string>(currentFbUrl || '');
  const [useCustomUrl, setUseCustomUrl] = useState<boolean>(false);
  const [syncInbox, setSyncInbox] = useState<boolean>(true);
  const [isAuthorizing, setIsAuthorizing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleAuthorize = async () => {
    setIsAuthorizing(true);

    let targetUrl = '';
    let targetName = '';
    let targetLogo = '';
    let targetCover = '';

    if (useCustomUrl && customPageUrl.trim()) {
      targetUrl = customPageUrl.trim();
    } else {
      const selected = SAMPLE_FACEBOOK_PAGES.find(p => p.id === selectedPageId) || SAMPLE_FACEBOOK_PAGES[0];
      targetUrl = selected.url;
      targetName = selected.name;
      targetLogo = selected.logoUrl;
      targetCover = selected.coverUrl;
    }

    try {
      const result = await importBrandingFromFacebook(currentBusiness.id, targetUrl, {
        isConnected: true,
        inboxSynced: syncInbox,
        pageName: targetName || undefined,
        customLogoUrl: targetLogo || undefined,
        customCoverUrl: targetCover || undefined,
      });

      if (result) {
        onConnected?.({
          name: result.name,
          logoUrl: result.logoUrl,
          coverPhotoUrl: result.coverPhotoUrl,
        });
      }

      onClose();
    } catch {
      showToast('Could not complete Facebook authorization', 'error');
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-stone-900 border border-blue-500/40 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col text-stone-100 relative max-h-[92vh] overflow-hidden"
      >
        
        {/* Facebook Blue Header */}
        <div className="shrink-0 bg-[#1877F2] p-5 text-white flex items-center justify-between relative shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg text-[#1877F2] font-black text-2xl shrink-0">
              f
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight">Connect with Facebook</span>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/30">
                  Meta Graph API
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                Link Page Branding & Unified Messenger Inbox
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          
          {/* Permission Notice */}
          <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 space-y-2">
            <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              Permissions Requested by Rideout Rentals:
            </span>
            <ul className="text-[11px] text-stone-300 space-y-1 pl-5 list-disc">
              <li><strong>pages_show_list:</strong> Detect and list your verified rental business Facebook Pages.</li>
              <li><strong>pages_read_engagement:</strong> Pull official profile logo & high-res cover banner photo.</li>
              <li><strong>pages_messaging:</strong> Receive and reply to customer inquiries in your Unified Social Inbox.</li>
            </ul>
          </div>

          {/* Select Facebook Page */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-200">
                Choose your Facebook Page:
              </span>
              <button
                type="button"
                onClick={() => setUseCustomUrl(!useCustomUrl)}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold"
              >
                {useCustomUrl ? '← Select from list' : '+ Enter custom URL'}
              </button>
            </div>

            {!useCustomUrl ? (
              <div className="space-y-2">
                {SAMPLE_FACEBOOK_PAGES.map((page) => {
                  const isSelected = selectedPageId === page.id;
                  return (
                    <div
                      key={page.id}
                      onClick={() => setSelectedPageId(page.id)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'bg-blue-500/10 border-blue-500 shadow-md' 
                          : 'bg-stone-950 border-stone-800 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={page.logoUrl}
                          alt={page.name}
                          className="w-10 h-10 rounded-xl object-cover border border-stone-700 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/bike_urban_scooter_1793338342006.jpg';
                          }}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-stone-100 truncate">{page.name}</span>
                            <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 fill-blue-500/20" />
                          </div>
                          <span className="text-[10px] text-stone-400 block truncate">
                            {page.category} · {page.followers.toLocaleString()} followers
                          </span>
                        </div>
                      </div>

                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-blue-500 border-blue-400 text-white' : 'border-stone-700'
                      }`}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                <label className="text-xs text-stone-300 font-semibold block">
                  Paste your Facebook Page URL:
                </label>
                <input
                  type="url"
                  value={customPageUrl}
                  onChange={(e) => setCustomPageUrl(e.target.value)}
                  placeholder="https://facebook.com/yourpagename"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-700 rounded-xl text-stone-100 font-mono text-xs focus:outline-none focus:border-blue-400"
                />
                <span className="text-[10px] text-stone-500 block">
                  We will extract and apply your page logo and high-res cover photo automatically.
                </span>
              </div>
            )}
          </div>

          {/* Inbox Sync Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-2xl bg-stone-950 border border-stone-800 cursor-pointer hover:border-stone-700 transition-colors">
            <input
              type="checkbox"
              checked={syncInbox}
              onChange={(e) => setSyncInbox(e.target.checked)}
              className="mt-0.5 rounded text-blue-500 focus:ring-blue-500"
            />
            <div className="text-xs text-stone-300 space-y-0.5">
              <strong className="text-stone-100 block font-semibold flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                Sync Page Messenger with Unified Social Inbox
              </strong>
              <p className="text-[11px] text-stone-400">
                Allows counter staff to read incoming rental inquiries and dispatch AI quotes directly from Rideout Rentals.
              </p>
            </div>
          </label>

        </div>

        {/* Modal Footer */}
        <div className="shrink-0 p-4 border-t border-stone-800 bg-stone-950/80 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-400 hover:text-stone-200 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={isAuthorizing}
            onClick={handleAuthorize}
            className="px-6 py-2.5 rounded-xl bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            {isAuthorizing ? (
              <span>Authorizing & Syncing...</span>
            ) : (
              <>
                <Facebook className="w-3.5 h-3.5 fill-current" />
                <span>Connect & Apply Branding</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
