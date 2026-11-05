import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currencyAndLanguage';
import { 
  Building2, 
  MapPin, 
  Share2, 
  QrCode, 
  Bike, 
  FileCheck, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft, 
  Sparkles, 
  Upload, 
  Camera, 
  Check, 
  FileSpreadsheet, 
  HardDrive, 
  ExternalLink,
  Smartphone,
  Facebook,
  Instagram,
  MessageCircle,
  Video,
  Scan,
  RefreshCw,
  AlertCircle,
  Users,
  Car,
  Mail,
  Send,
  Eye,
  Store,
  Lock,
  FolderPlus,
  Coins,
  MessageSquare
} from 'lucide-react';

interface BusinessOnboardingWizardProps {
  initialEmail: string;
  onBackToChoices: () => void;
  onSuccess: (businessId: string) => void;
}

const SAMPLE_DEPOT_PHOTOS = [
  { label: 'Liwliwa Beachfront Rental Bay', url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&auto=format&fit=crop&q=80' },
  { label: 'Town Center Highway Storefront', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=80' },
  { label: 'Surf Village Moto Hub', url: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=900&auto=format&fit=crop&q=80' },
];

const SAMPLE_OWNER_IDS = [
  { type: "Driver's License (LTO)", num: 'N02-18-092812', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80' },
  { type: 'Philippine Passport', num: 'P8920192A', url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80' },
];

export const BusinessOnboardingWizard: React.FC<BusinessOnboardingWizardProps> = ({
  initialEmail,
  onBackToChoices,
  onSuccess
}) => {
  const { registerNewBusiness, currency, showToast } = useApp();

  // 4 Main Steps:
  // 1: Owner ID & Email Verification
  // 2: Depot Setup & Physical Storefront Photo + Location Map Pin
  // 3: Vehicle Fleet (Bicycles, Motorbikes, Cars + Qty) & Staff Count
  // 4: Omnichannel Messaging, Payments (GCash / PayMaya) & Mandatory Google Workspace
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 4;

  // Step 1: Owner Identity & ID Verification
  const [ownerName, setOwnerName] = useState('Mark Ramos');
  const [email, setEmail] = useState(initialEmail || 'depot@gmail.com');
  const [mobile, setMobile] = useState('0917 832 9901');
  const [ownerIdType, setOwnerIdType] = useState<string>("Driver's License (LTO)");
  const [ownerIdNumber, setOwnerIdNumber] = useState<string>('N02-18-092812');
  const [ownerIdPhotoUrl, setOwnerIdPhotoUrl] = useState<string>(SAMPLE_OWNER_IDS[0].url);
  const [isIdUploaded, setIsIdUploaded] = useState<boolean>(true);

  // Email verification simulation
  const [isVerificationEmailSent, setIsVerificationEmailSent] = useState<boolean>(false);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);

  // Step 2: Depot Setup & Location Pin + Storefront Picture
  const [depotName, setDepotName] = useState('Coastline Moto & Vehicle Rentals');
  const [town, setTown] = useState('San Felipe');
  const [province, setProvince] = useState('Zambales');
  const [landmarkAddress, setLandmarkAddress] = useState('National Highway cor. Liwliwa Beach Road');
  const [coordinates, setCoordinates] = useState({ lat: 15.0683, lng: 120.0601 });
  const [googleMapsPinUrl, setGoogleMapsPinUrl] = useState('https://maps.google.com/?q=15.0683,120.0601');
  const [depotPhotoUrl, setDepotPhotoUrl] = useState<string>(SAMPLE_DEPOT_PHOTOS[0].url);
  const [nearbyTowns, setNearbyTowns] = useState<string[]>(['San Antonio', 'Cabangan', 'San Narciso']);
  const [newNearbyTownInput, setNewNearbyTownInput] = useState('');

  // Step 3: Vehicle Fleet Inventory Checklist & Staff Count
  const [hasBicycles, setHasBicycles] = useState<boolean>(true);
  const [bicyclesQty, setBicyclesQty] = useState<number>(4);
  const [hasMotorbikes, setHasMotorbikes] = useState<boolean>(true);
  const [motorbikesQty, setMotorbikesQty] = useState<number>(8);
  const [hasCars, setHasCars] = useState<boolean>(true);
  const [carsQty, setCarsQty] = useState<number>(2);
  const [staffCount, setStaffCount] = useState<number>(2);

  // Step 4: Optional Social & Messaging Channels
  const [enableFacebook, setEnableFacebook] = useState<boolean>(true);
  const [fbPageUrl, setFbPageUrl] = useState('https://facebook.com/coastlinemotorentals');
  const [isFbConnecting, setIsFbConnecting] = useState(false);
  const [isFbConnected, setIsFbConnected] = useState(true);
  const [fbPageName, setFbPageName] = useState('Coastline Moto & Vehicle Rentals');
  const [fbCoverPhoto, setFbCoverPhoto] = useState('/assets/images/hero_coastal_ride_1793338340532.jpg');
  const [fbLogoUrl, setFbLogoUrl] = useState('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&auto=format&fit=crop&q=80');
  const [fbFollowers, setFbFollowers] = useState(8400);
  const [fbAbout, setFbAbout] = useState('Zambales premier vehicle & motorbike rental depot. Beach cruisers, scooters, and coastal exploration.');

  const [enableTiktok, setEnableTiktok] = useState<boolean>(true);
  const [tiktokHandle, setTiktokHandle] = useState<string>('@coastlinemoto_ph');

  const [enableInstagram, setEnableInstagram] = useState<boolean>(true);
  const [instagramHandle, setInstagramHandle] = useState<string>('@coastlinemoto');

  const [enableWhatsapp, setEnableWhatsapp] = useState<boolean>(true);
  const [whatsappNumber, setWhatsappNumber] = useState<string>('+63 917 832 9901');

  const [enableViber, setEnableViber] = useState<boolean>(true);
  const [viberNumber, setViberNumber] = useState<string>('+63 917 832 9901');

  const [enableTelegram, setEnableTelegram] = useState<boolean>(true);
  const [telegramHandle, setTelegramHandle] = useState<string>('@CoastlineMotoRentals');

  // Step 4: Optional Payment Receipt Options (GCash and/or PayMaya)
  const [acceptGcash, setAcceptGcash] = useState<boolean>(true);
  const [gcashAccountName, setGcashAccountName] = useState('COASTLINE MOTO / MARK R.');
  const [gcashAccountNumber, setGcashAccountNumber] = useState('0917 832 9901');
  const [gcashQrUrl, setGcashQrUrl] = useState('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80');

  const [acceptPaymaya, setAcceptPaymaya] = useState<boolean>(true);
  const [paymayaAccountName, setPaymayaAccountName] = useState('COASTLINE MOTO / MARK R.');
  const [paymayaAccountNumber, setPaymayaAccountNumber] = useState('0917 832 9901');
  const [paymayaQrUrl, setPaymayaQrUrl] = useState('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80');

  // Step 4: Nominated Business Gateway Phone (Server-Type Phone & Native Android Messaging)
  const [nominatedServerPhone, setNominatedServerPhone] = useState<string>('0917 832 9901');
  const [hasServerAppInstalled, setHasServerAppInstalled] = useState<boolean>(true);
  const [isServerPhoneOnline, setIsServerPhoneOnline] = useState<boolean>(true);

  // Step 4: MANDATORY Google Workspace (Sheets & Drive with File/Folder Creation Permissions)
  const [isGoogleAuthorized, setIsGoogleAuthorized] = useState<boolean>(true);
  const [isAuthorizingGoogle, setIsAuthorizingGoogle] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Trigger simulated verification email
  const handleSendVerificationEmail = () => {
    if (!email.trim() || !email.includes('@')) {
      showToast('Please enter a valid Gmail address', 'error');
      return;
    }
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setIsVerificationEmailSent(true);
      showToast(`Verification email dispatched to ${email}! Click below to verify.`, 'info');
    }, 600);
  };

  const handleConfirmEmailVerification = () => {
    setIsEmailVerified(true);
    showToast(`Email ${email} verified successfully!`, 'success');
  };

  // Facebook Connect simulation
  const handleConnectFacebook = () => {
    setIsFbConnecting(true);
    setTimeout(() => {
      setIsFbConnecting(false);
      setIsFbConnected(true);
      setFbPageName(depotName || 'Coastline Moto & Vehicle Rentals');
      setFbLogoUrl('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&auto=format&fit=crop&q=80');
      setFbCoverPhoto('/assets/images/hero_coastal_ride_1793338340532.jpg');
      setFbFollowers(9200);
      setFbAbout(`Official Facebook Page for ${depotName}. Real-time messenger inquiry integration active.`);
      showToast('Facebook Page branding, cover photo, logo, and Messenger inbox connected!', 'success');
    }, 800);
  };

  // Google Workspace Authorization simulation
  const handleAuthorizeGoogleWorkspace = () => {
    setIsAuthorizingGoogle(true);
    setTimeout(() => {
      setIsAuthorizingGoogle(false);
      setIsGoogleAuthorized(true);
      showToast('Google Workspace permissions granted: Drive folders & Sheets database linked!', 'success');
    }, 900);
  };

  const handleAddNearbyTown = () => {
    if (newNearbyTownInput.trim() && !nearbyTowns.includes(newNearbyTownInput.trim())) {
      setNearbyTowns([...nearbyTowns, newNearbyTownInput.trim()]);
      setNewNearbyTownInput('');
    }
  };

  const handleRemoveNearbyTown = (t: string) => {
    setNearbyTowns(nearbyTowns.filter(item => item !== t));
  };

  // Submit complete onboarding configuration
  const handleFinalSubmit = () => {
    if (!depotName.trim() || !ownerName.trim() || !email.trim()) {
      showToast('Please complete required owner and depot fields', 'error');
      setCurrentStep(1);
      return;
    }

    if (!acceptGcash && !acceptPaymaya) {
      showToast('Please select at least one payout channel (GCash or PayMaya)', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const payoutChoice: 'gcash' | 'paymaya' | 'both' = 
        acceptGcash && acceptPaymaya ? 'both' : acceptPaymaya ? 'paymaya' : 'gcash';

      const newBizId = registerNewBusiness({
        name: depotName.trim(),
        tagline: `${depotName.trim()} · Vehicle Fleet & Rental Depot`,
        ownerName: ownerName.trim(),
        email: email.trim().toLowerCase(),
        mobile: mobile.trim(),
        location: `${landmarkAddress}, ${town}, ${province}`,
        town: town.trim(),
        province: province.trim(),
        coordinates,
        googleMapsPinUrl,
        targetedNearbyTowns: nearbyTowns,
        depotPhotoUrl,
        ownerIdPhotoUrl,
        ownerIdType,
        ownerIdNumber,
        emailVerified: isEmailVerified,
        vehicleInventoryCounts: {
          hasBicycles,
          bicyclesQty: hasBicycles ? bicyclesQty : 0,
          hasMotorbikes,
          motorbikesQty: hasMotorbikes ? motorbikesQty : 0,
          hasCars,
          carsQty: hasCars ? carsQty : 0,
        },
        staffCount,
        socials: {
          facebook: enableFacebook ? fbPageUrl.trim() : undefined,
          tiktok: enableTiktok ? tiktokHandle.trim() : undefined,
          instagram: enableInstagram ? instagramHandle.trim() : undefined,
          whatsapp: enableWhatsapp ? whatsappNumber.trim() : undefined,
          viber: enableViber ? viberNumber.trim() : undefined,
          telegram: enableTelegram ? telegramHandle.trim() : undefined,
        },
        facebookBranding: enableFacebook && isFbConnected ? {
          pageUrl: fbPageUrl.trim(),
          pageName: fbPageName,
          pageCategory: 'Vehicle Rental & Tours',
          followersCount: fbFollowers,
          aboutText: fbAbout,
          importedAt: new Date().toISOString(),
          isConnected: true,
          inboxSynced: true,
          pageId: `fb-${Date.now()}`,
        } : undefined,
        payoutMethodChoice: payoutChoice,
        nominatedServerPhone: nominatedServerPhone.trim(),
        androidGatewayConfig: {
          serverPhone: nominatedServerPhone.trim(),
          hasInternetConnection: isServerPhoneOnline,
          nativeMessagingActive: true,
          appInstalledOnServerPhone: hasServerAppInstalled,
        },
        gcashAccountName: acceptGcash ? gcashAccountName.trim().toUpperCase() : '',
        gcashAccountNumber: acceptGcash ? gcashAccountNumber.trim() : '',
        gcashQrCodeUrl: acceptGcash ? gcashQrUrl : '',
        paymayaAccountName: acceptPaymaya ? paymayaAccountName.trim().toUpperCase() : undefined,
        paymayaAccountNumber: acceptPaymaya ? paymayaAccountNumber.trim() : undefined,
        paymayaQrCodeUrl: acceptPaymaya ? paymayaQrUrl : undefined,
        googleIntegration: {
          sheetsAuthorized: true,
          driveAuthorized: true,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${depotName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-master-ledger`,
          driveFolderUrl: `https://drive.google.com/drive/folders/${depotName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-archive`,
          scopesGranted: [
            'https://www.googleapis.com/auth/drive.file',
            'https://www.googleapis.com/auth/spreadsheets'
          ],
          permissionsGranted: {
            driveCreateFilesAndFolders: true,
            sheetsManageDatabase: true,
          },
        },
        firstVehicle: hasMotorbikes ? {
          name: 'Honda Click 125i (2024)',
          brand: 'Honda',
          model: 'Click 125i',
          category: 'scooter',
          engineCc: 125,
          dailyRate: 500,
          imageUrl: '/assets/images/bike_urban_scooter_1793338340532.jpg',
          plateNumber: 'NB 8492',
        } : undefined,
      });

      setIsSubmitting(false);
      onSuccess(newBizId);
    }, 700);
  };

  return (
    <div className="space-y-6 text-stone-100">
      
      {/* Step Progress Tracker */}
      <div className="space-y-2 border-b border-stone-800 pb-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold font-mono text-[10px]">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="font-bold text-stone-200">
              {currentStep === 1 && '1. Owner Account & Government ID Verification'}
              {currentStep === 2 && '2. Depot Setup & Physical Storefront Photo'}
              {currentStep === 3 && '3. Vehicle Fleet (Bikes, Motorbikes, Cars) & Staff'}
              {currentStep === 4 && '4. Channels, Payments & Mandatory Google Workspace'}
            </span>
          </div>

          <button
            type="button"
            onClick={onBackToChoices}
            className="text-stone-400 hover:text-stone-200 text-xs underline font-medium"
          >
            Cancel / Back
          </button>
        </div>

        {/* Progress Bar Line */}
        <div className="w-full bg-stone-950 h-2 rounded-full overflow-hidden border border-stone-800">
          <div 
            className="bg-gradient-to-r from-amber-400 to-yellow-500 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* ======================================================== */}
      {/* STEP 1: Owner Account & Government ID Verification       */}
      {/* ======================================================== */}
      {currentStep === 1 && (
        <div className="space-y-5 animate-fade-in text-xs">
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3.5 flex items-start gap-2.5 text-stone-300">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-stone-100 font-bold block">Business Owner KYC & Email Authentication</strong>
              <p className="text-[11px] leading-relaxed">
                To safeguard the platform and establish trust with renters, please provide your legal owner details and upload a valid government ID. Then verify your Gmail account to unlock depot setup.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Owner Full Legal Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g. Mark Ramos"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Owner Mobile Phone <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="0917 832 9901"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            {/* Email Input with Verification CTA */}
            <div className="sm:col-span-2 p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-stone-200 font-semibold">
                  Authorized Gmail Address <span className="text-amber-400">*</span>
                </label>
                {isEmailVerified ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Email Verified</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-mono font-bold">
                    Verification Required
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="depot@gmail.com"
                    className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-700 rounded-lg text-stone-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
                {!isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleSendVerificationEmail}
                    disabled={isSendingEmail}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 shrink-0 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isSendingEmail ? 'Sending...' : 'Send Verification Email'}</span>
                  </button>
                )}
              </div>

              {/* Interactive Simulated Verification Email Inbox Card */}
              {isVerificationEmailSent && !isEmailVerified && (
                <div className="p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-2.5 animate-fade-in">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-blue-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-400" />
                      <span>Simulated Email Inbox: 1 new message from Rideout Rentals</span>
                    </span>
                    <span className="text-[10px] text-stone-400">Just now</span>
                  </div>
                  <div className="bg-stone-900/90 p-3 rounded-lg border border-stone-800 space-y-2">
                    <p className="text-[11px] text-stone-300">
                      <strong>Subject:</strong> Verify your Gmail to activate your Rideout Rentals Depot Console
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Hi {ownerName || 'Partner'}, click the button below to verify your email address and proceed with depot configuration:
                    </p>
                    <button
                      type="button"
                      onClick={handleConfirmEmailVerification}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Click to Verify Email Address</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Government ID Upload Card */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-200 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-amber-400" />
                  <span>Owner Government ID Verification</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Required for Storefront License
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">ID Document Type</label>
                  <select
                    value={ownerIdType}
                    onChange={(e) => setOwnerIdType(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="Driver's License (LTO)">Driver's License (LTO)</option>
                    <option value="Philippine Passport">Philippine Passport</option>
                    <option value="UMID Card">UMID Card</option>
                    <option value="PhilSys National ID">PhilSys National ID</option>
                    <option value="Postal ID">Postal ID</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">ID Serial / Card Number</label>
                  <input
                    type="text"
                    value={ownerIdNumber}
                    onChange={(e) => setOwnerIdNumber(e.target.value)}
                    placeholder="e.g. N02-18-092812"
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* ID Photo Preview & Sample Select */}
              <div className="space-y-2">
                <span className="block text-[11px] text-stone-400">
                  Select or upload a clear photo of your Government ID:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div className="flex gap-2">
                    {SAMPLE_OWNER_IDS.map((sample) => (
                      <button
                        key={sample.type}
                        type="button"
                        onClick={() => {
                          setOwnerIdType(sample.type);
                          setOwnerIdNumber(sample.num);
                          setOwnerIdPhotoUrl(sample.url);
                          setIsIdUploaded(true);
                          showToast(`Loaded ${sample.type}`, 'info');
                        }}
                        className={`flex-1 p-2 rounded-lg border text-left transition-all ${
                          ownerIdPhotoUrl === sample.url
                            ? 'border-amber-400 bg-stone-900'
                            : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                        }`}
                      >
                        <div className="text-[10px] font-bold text-stone-200">{sample.type}</div>
                        <div className="text-[9px] font-mono text-stone-400">{sample.num}</div>
                      </button>
                    ))}
                  </div>

                  {/* ID Live Preview Frame */}
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 flex items-center gap-3">
                    <div className="w-16 h-12 rounded bg-black/60 overflow-hidden border border-stone-800 shrink-0">
                      <img src={ownerIdPhotoUrl} alt="Owner Government ID" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <div className="font-bold text-stone-200 text-[11px]">{ownerIdType}</div>
                      <div className="font-mono text-[10px] text-emerald-400">✓ ID File Attached</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 2: Depot Setup & Physical Storefront Photo & Pin    */}
      {/* ======================================================== */}
      {currentStep === 2 && (
        <div className="space-y-5 animate-fade-in text-xs">
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3.5 flex items-start gap-2.5 text-stone-300">
            <Store className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-stone-100 font-bold block">Physical Storefront Picture & Navigation Pin</strong>
              <p className="text-[11px] leading-relaxed">
                Renters need to easily find your physical store upon arriving in your town. Upload a photo of the depot facade or entrance and specify your Google Maps location pin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-stone-300 font-semibold mb-1">
                Depot / Shop Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                placeholder="e.g. Coastline Moto & Vehicle Rentals"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Town / Municipality <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={town}
                onChange={(e) => setTown(e.target.value)}
                placeholder="e.g. San Felipe"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Province / Region <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="e.g. Zambales"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-300 font-semibold mb-1">
                Landmark Address / Highway Entrance <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={landmarkAddress}
                onChange={(e) => setLandmarkAddress(e.target.value)}
                placeholder="e.g. National Highway cor. Liwliwa Beach Road, beside Shell Gas Station"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Picture of Physical Depot Upload & Live Preview */}
            <div className="sm:col-span-2 p-4 rounded-xl bg-stone-950 border-2 border-amber-400/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-200 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-amber-400" />
                  <span>Picture of Physical Depot (Storefront / Entrance / Facade)</span>
                </span>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-bold">
                  Renters Locate Shop Via Photo
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Shown to confirmed renters on their mobile confirmation voucher so they immediately recognize your building and parking bay when walking or arriving from transit.
              </p>

              {/* Sample Depot Photos Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAMPLE_DEPOT_PHOTOS.map((dp) => (
                  <button
                    key={dp.label}
                    type="button"
                    onClick={() => {
                      setDepotPhotoUrl(dp.url);
                      showToast(`Selected ${dp.label}`, 'info');
                    }}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      depotPhotoUrl === dp.url
                        ? 'border-amber-400 bg-stone-900 shadow-md ring-1 ring-amber-400'
                        : 'border-stone-800 bg-stone-900/60 hover:border-stone-700'
                    }`}
                  >
                    <div className="aspect-video rounded-lg overflow-hidden bg-black/60 mb-1.5 border border-stone-800">
                      <img src={dp.url} alt={dp.label} className="w-full h-full object-cover" />
                    </div>
                    <div className="text-[10px] font-semibold text-stone-200 truncate">{dp.label}</div>
                  </button>
                ))}
              </div>

              {/* Custom Image URL or Upload */}
              <div className="pt-1 flex gap-2">
                <input
                  type="url"
                  value={depotPhotoUrl}
                  onChange={(e) => setDepotPhotoUrl(e.target.value)}
                  placeholder="Or enter image URL for your physical depot storefront..."
                  className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-xs text-stone-200 font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => showToast('Depot storefront photo updated!', 'success')}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* GPS Coordinates & Google Maps Pin */}
            <div className="sm:col-span-2 p-3.5 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Google Maps Location Pin:</span>
                </span>
                <span className="font-mono text-[10px] text-amber-400">
                  {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </span>
              </div>
              <input
                type="url"
                value={googleMapsPinUrl}
                onChange={(e) => setGoogleMapsPinUrl(e.target.value)}
                placeholder="https://maps.google.com/?q=..."
                className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-300 font-mono text-[11px] focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* STEP 3: Vehicle Fleet Inventory Checklist & Staff Count  */}
      {/* ======================================================== */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-fade-in text-xs">
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3.5 flex items-start gap-2.5 text-stone-300">
            <Bike className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <strong className="text-stone-100 font-bold block">Vehicle Fleet Options & Staff Account Setup</strong>
              <p className="text-[11px] leading-relaxed">
                Check off which types of vehicles your depot rents out and the initial quantity of each. Then specify your staff count so we can provision staff logins and permissions.
              </p>
            </div>
          </div>

          {/* Vehicle Fleet Checklist */}
          <div className="space-y-3">
            <label className="block text-stone-200 font-bold text-sm">
              Vehicle Inventory Checklist:
            </label>

            {/* 1. Bicycles */}
            <div className={`p-4 rounded-xl border transition-all ${
              hasBicycles ? 'bg-stone-950 border-amber-400/50 shadow-md' : 'bg-stone-950/60 border-stone-800'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasBicycles}
                    onChange={(e) => setHasBicycles(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 bg-stone-900 border-stone-700 focus:ring-amber-400"
                  />
                  <div>
                    <span className="font-bold text-stone-100 text-sm block">Bicycles</span>
                    <span className="text-[11px] text-stone-400">Mountain bikes, beach cruisers, and road commuters</span>
                  </div>
                </label>

                {hasBicycles && (
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-semibold text-[11px]">Quantity:</span>
                    <div className="flex items-center bg-stone-900 border border-stone-700 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setBicyclesQty(Math.max(1, bicyclesQty - 1))}
                        className="px-2.5 py-1 text-stone-400 hover:text-white hover:bg-stone-800 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-mono font-bold text-amber-400 text-xs">
                        {bicyclesQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBicyclesQty(bicyclesQty + 1)}
                        className="px-2.5 py-1 text-stone-400 hover:text-white hover:bg-stone-800 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Motorbikes */}
            <div className={`p-4 rounded-xl border transition-all ${
              hasMotorbikes ? 'bg-stone-950 border-amber-400/50 shadow-md' : 'bg-stone-950/60 border-stone-800'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasMotorbikes}
                    onChange={(e) => setHasMotorbikes(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 bg-stone-900 border-stone-700 focus:ring-amber-400"
                  />
                  <div>
                    <span className="font-bold text-stone-100 text-sm block">Motorbikes & Scooters</span>
                    <span className="text-[11px] text-stone-400">Automatic scooters (Click, Mio), maxi-scooters (NMAX, PCX), dual-sport (CRF)</span>
                  </div>
                </label>

                {hasMotorbikes && (
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-semibold text-[11px]">Quantity:</span>
                    <div className="flex items-center bg-stone-900 border border-stone-700 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setMotorbikesQty(Math.max(1, motorbikesQty - 1))}
                        className="px-2.5 py-1 text-stone-400 hover:text-white hover:bg-stone-800 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-mono font-bold text-amber-400 text-xs">
                        {motorbikesQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setMotorbikesQty(motorbikesQty + 1)}
                        className="px-2.5 py-1 text-stone-400 hover:text-white hover:bg-stone-800 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Cars */}
            <div className={`p-4 rounded-xl border transition-all ${
              hasCars ? 'bg-stone-950 border-amber-400/50 shadow-md' : 'bg-stone-950/60 border-stone-800'
            }`}>
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={hasCars}
                    onChange={(e) => setHasCars(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-400 bg-stone-900 border-stone-700 focus:ring-amber-400"
                  />
                  <div>
                    <span className="font-bold text-stone-100 text-sm block">Cars & Passenger Vans</span>
                    <span className="text-[11px] text-stone-400">Sedans, compact SUVs, 4x4s, and multi-passenger tourist vans</span>
                  </div>
                </label>

                {hasCars && (
                  <div className="flex items-center gap-2">
                    <span className="text-stone-400 font-semibold text-[11px]">Quantity:</span>
                    <div className="flex items-center bg-stone-900 border border-stone-700 rounded-lg overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setCarsQty(Math.max(1, carsQty - 1))}
                        className="px-2.5 py-1 text-stone-400 hover:text-white hover:bg-stone-800 text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-mono font-bold text-amber-400 text-xs">
                        {carsQty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCarsQty(carsQty + 1)}
                        className="px-2.5 py-1 text-stone-400 hover:text-white hover:bg-stone-800 text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Total Fleet Calculation Banner */}
            <div className="p-3 bg-stone-900/80 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
              <span className="text-stone-300">
                Total Fleet Capacity Registered:
              </span>
              <span className="font-mono font-bold text-amber-400 text-sm">
                {(hasBicycles ? bicyclesQty : 0) + (hasMotorbikes ? motorbikesQty : 0) + (hasCars ? carsQty : 0)} Vehicles
              </span>
            </div>
          </div>

          {/* Number of Staff Members Setup */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-stone-200 text-sm flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>Number of Staff Members</span>
                </span>
                <p className="text-[11px] text-stone-400">
                  Allocates store edit rights and additional logins for counter reception, vehicle handovers, and return inspectors.
                </p>
              </div>

              <div className="flex items-center bg-stone-900 border border-stone-700 rounded-xl overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => setStaffCount(Math.max(1, staffCount - 1))}
                  className="px-3 py-1.5 text-stone-300 hover:text-white hover:bg-stone-800 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-1.5 font-mono font-bold text-amber-400 text-sm">
                  {staffCount} {staffCount === 1 ? 'Staff' : 'Staff'}
                </span>
                <button
                  type="button"
                  onClick={() => setStaffCount(Math.min(10, staffCount + 1))}
                  className="px-3 py-1.5 text-stone-300 hover:text-white hover:bg-stone-800 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-stone-900/60 border border-stone-800 text-[11px] text-stone-400 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>We will automatically provision {staffCount} role-based staff accounts with configurable store edit permissions in your Depot Console.</span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 4: Omnichannel Messaging, Payments (GCash/Maya) & Google Workspace   */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-6 animate-fade-in text-xs">
          
          {/* Section 1: Social Media & Messaging Channels (Optional for Business) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-100 text-sm block">
                  1. Omnichannel Messaging & Social Channels
                </span>
                <span className="text-[11px] text-stone-400">
                  Optional channels for customer inquiries. Incoming messages route directly into your unified Social Inbox.
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700">
                Optional
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              {/* Facebook */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                enableFacebook ? 'bg-stone-950 border-blue-500/40' : 'bg-stone-950/60 border-stone-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-200">
                    <input
                      type="checkbox"
                      checked={enableFacebook}
                      onChange={(e) => setEnableFacebook(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-500 bg-stone-900 border-stone-700"
                    />
                    <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                      f
                    </div>
                    <span>Facebook & Messenger</span>
                  </label>
                  {enableFacebook && isFbConnected && (
                    <span className="text-[9px] font-mono font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                      ✓ Connected
                    </span>
                  )}
                </div>

                {enableFacebook && (
                  <div className="space-y-2 mt-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={fbPageUrl}
                        onChange={(e) => setFbPageUrl(e.target.value)}
                        placeholder="https://facebook.com/yourpage"
                        className="flex-1 px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-blue-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleConnectFacebook}
                        disabled={isFbConnecting}
                        className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${isFbConnecting ? 'animate-spin' : ''}`} />
                        <span>{isFbConnecting ? 'Syncing...' : 'Sync Page'}</span>
                      </button>
                    </div>

                    {isFbConnected && (
                      <div className="p-2 rounded-lg bg-stone-900/90 border border-stone-800 flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-black shrink-0 border border-stone-700">
                          <img src={fbLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-stone-200 truncate text-[11px]">{fbPageName}</div>
                          <div className="text-[10px] text-stone-400">{fbFollowers.toLocaleString()} followers · Cover & logo attached</div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* TikTok */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                enableTiktok ? 'bg-stone-950 border-rose-500/40' : 'bg-stone-950/60 border-stone-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-200">
                    <input
                      type="checkbox"
                      checked={enableTiktok}
                      onChange={(e) => setEnableTiktok(e.target.checked)}
                      className="w-4 h-4 rounded text-rose-500 bg-stone-900 border-stone-700"
                    />
                    <Video className="w-4 h-4 text-rose-400" />
                    <span>TikTok Creator / Business</span>
                  </label>
                  <span className="text-[9px] font-mono text-stone-400">Viral Clips</span>
                </div>

                {enableTiktok && (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={tiktokHandle}
                      onChange={(e) => setTiktokHandle(e.target.value)}
                      placeholder="@yourdepot_ph"
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-xs font-mono focus:outline-none focus:border-rose-400"
                    />
                    <p className="text-[10px] text-stone-500">
                      Renter travel videos and 9:16 vertical reels link back to this handle.
                    </p>
                  </div>
                )}
              </div>

              {/* Instagram */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                enableInstagram ? 'bg-stone-950 border-pink-500/40' : 'bg-stone-950/60 border-stone-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-200">
                    <input
                      type="checkbox"
                      checked={enableInstagram}
                      onChange={(e) => setEnableInstagram(e.target.checked)}
                      className="w-4 h-4 rounded text-pink-500 bg-stone-900 border-stone-700"
                    />
                    <Instagram className="w-4 h-4 text-pink-400" />
                    <span>Instagram Business DM</span>
                  </label>
                  <span className="text-[9px] font-mono text-stone-400">Direct Chat</span>
                </div>

                {enableInstagram && (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      placeholder="@yourdepot_rentals"
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-xs font-mono focus:outline-none focus:border-pink-400"
                    />
                    <p className="text-[10px] text-stone-500">
                      Syncs Instagram Direct inquiries for bike photos, rates, and helmet requests.
                    </p>
                  </div>
                )}
              </div>

              {/* WhatsApp */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                enableWhatsapp ? 'bg-stone-950 border-emerald-500/40' : 'bg-stone-950/60 border-stone-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-200">
                    <input
                      type="checkbox"
                      checked={enableWhatsapp}
                      onChange={(e) => setEnableWhatsapp(e.target.checked)}
                      className="w-4 h-4 rounded text-emerald-500 bg-stone-900 border-stone-700"
                    />
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp Business</span>
                  </label>
                  <span className="text-[9px] font-mono text-emerald-400">Foreign Tourists</span>
                </div>

                {enableWhatsapp && (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={whatsappNumber}
                      onChange={(e) => setWhatsappNumber(e.target.value)}
                      placeholder="+63 917 832 9901"
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-xs font-mono focus:outline-none focus:border-emerald-400"
                    />
                    <p className="text-[10px] text-stone-500">
                      Creates instant <code>wa.me</code> click-to-chat links for international travelers visiting your depot.
                    </p>
                  </div>
                )}
              </div>

              {/* Viber */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                enableViber ? 'bg-stone-950 border-purple-500/40' : 'bg-stone-950/60 border-stone-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-200">
                    <input
                      type="checkbox"
                      checked={enableViber}
                      onChange={(e) => setEnableViber(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-500 bg-stone-900 border-stone-700"
                    />
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span>Viber Messaging</span>
                  </label>
                  <span className="text-[9px] font-mono text-purple-300">Local PH Chat</span>
                </div>

                {enableViber && (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={viberNumber}
                      onChange={(e) => setViberNumber(e.target.value)}
                      placeholder="0917 832 9901 or +63 917..."
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-xs font-mono focus:outline-none focus:border-purple-400"
                    />
                    <p className="text-[10px] text-stone-500">
                      Preferred by local Philippine renters, vacationers, and corporate weekend groups.
                    </p>
                  </div>
                )}
              </div>

              {/* Telegram */}
              <div className={`p-3.5 rounded-xl border transition-all ${
                enableTelegram ? 'bg-stone-950 border-sky-500/40' : 'bg-stone-950/60 border-stone-800'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-stone-200">
                    <input
                      type="checkbox"
                      checked={enableTelegram}
                      onChange={(e) => setEnableTelegram(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-stone-900 border-stone-700"
                    />
                    <Send className="w-4 h-4 text-sky-400" />
                    <span>Telegram Inquiries</span>
                  </label>
                  <span className="text-[9px] font-mono text-sky-300">Fast Messaging</span>
                </div>

                {enableTelegram && (
                  <div className="space-y-1">
                    <input
                      type="text"
                      value={telegramHandle}
                      onChange={(e) => setTelegramHandle(e.target.value)}
                      placeholder="@yourdepot_rentals"
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-xs font-mono focus:outline-none focus:border-sky-400"
                    />
                    <p className="text-[10px] text-stone-500">
                      Creates <code>t.me</code> instant messaging channels for dispatch and quick booking questions.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Section 2: Nominated Business Gateway Phone (Native Android Messaging & SMS Dispatch) */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-100 text-sm block">
                  2. Nominated Business Gateway Phone (Native Android Messaging)
                </span>
                <span className="text-[11px] text-stone-400">
                  All customer SMS transactions and notifications originate directly from this nominated device.
                </span>
              </div>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 font-bold">
                Depot Gateway
              </span>
            </div>

            <div className="p-4 rounded-xl bg-stone-950 border-2 border-amber-400/30 space-y-3.5">
              <div className="space-y-1">
                <label className="block text-stone-200 font-bold text-xs">
                  Nominated Business Phone Number (Server-Type Android Device)
                </label>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    value={nominatedServerPhone}
                    onChange={(e) => setNominatedServerPhone(e.target.value)}
                    placeholder="0917 832 9901"
                    className="flex-1 px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                  />
                  <a
                    href={`sms:${nominatedServerPhone.replace(/[^0-9+]/g, '')}?body=${encodeURIComponent('Rideout Rentals Dispatch Gateway: Test alert from depot server phone.')}`}
                    className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                    title="Test dispatch via Native Android Messaging"
                  >
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Test Native SMS</span>
                  </a>
                </div>
              </div>

              {/* Server Phone Requirements Notice */}
              <div className="p-3 rounded-lg bg-stone-900/90 border border-stone-800 space-y-2 text-[11px] text-stone-300">
                <div className="flex items-start gap-2 text-stone-200 font-semibold">
                  <Smartphone className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Server-Type Phone & Continuous Internet Requirement</span>
                </div>
                <p className="leading-relaxed text-stone-400">
                  All SMS transactions (reservation confirmations, pickup passes, return warnings, fuel deficit charges, and GCash payment receipts) will originate directly from this nominated phone number using <strong>Native Android Messaging</strong>.
                </p>
                <ul className="space-y-1.5 pl-1 text-[11px] text-stone-400">
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>App Installed on Server Phone:</strong> The business must have the Rideout Rentals standalone app (PWA) installed on this server-type phone.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>Continuous Internet Required:</strong> This main phone (which has your main business email connected) must have internet (WiFi or mobile data) active at all times to sync transactions.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span><strong>WhatsApp / Viber / Messenger Route:</strong> If the renter requests notification via WhatsApp, Viber, or Messenger, the app automatically dispatches messages directly through this device's nominated business channels.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3: Payment Receipt Options (GCash or PayMaya - Optional Choices for Business) */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-100 text-sm block">
                  3. Digital Payment Receipt Channels (GCash or PayMaya / Maya)
                </span>
                <span className="text-[11px] text-stone-400">
                  Select which payment wallets your depot accepts for rental booking deposits and counter pickups.
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                0% Commission on Trial
              </span>
            </div>

            {/* Checkbox Selector: GCash and/or PayMaya */}
            <div className="flex items-center gap-4 p-2.5 rounded-xl bg-stone-950 border border-stone-800">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptGcash}
                  onChange={(e) => setAcceptGcash(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-500 bg-stone-900 border-stone-700"
                />
                <span className="font-bold text-stone-200 text-xs">Accept GCash</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={acceptPaymaya}
                  onChange={(e) => setAcceptPaymaya(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-500 bg-stone-900 border-stone-700"
                />
                <span className="font-bold text-stone-200 text-xs">Accept PayMaya / Maya</span>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* GCash Configuration Card */}
              {acceptGcash && (
                <div className="p-4 rounded-xl bg-stone-950 border border-blue-500/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5 text-xs">
                      <QrCode className="w-4 h-4 text-blue-400" />
                      <span>GCash Wallet Details</span>
                    </span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-stone-400 text-[11px] mb-1">GCash Account Name</label>
                      <input
                        type="text"
                        value={gcashAccountName}
                        onChange={(e) => setGcashAccountName(e.target.value)}
                        placeholder="e.g. COASTLINE MOTO / MARK R."
                        className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 font-mono uppercase text-xs focus:outline-none focus:border-blue-400"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 text-[11px] mb-1">GCash Mobile Number</label>
                      <input
                        type="text"
                        value={gcashAccountNumber}
                        onChange={(e) => setGcashAccountNumber(e.target.value)}
                        placeholder="0917 832 9901"
                        className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs focus:outline-none focus:border-blue-400"
                      />
                    </div>
                  </div>

                  {/* QR Preview */}
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 flex items-center gap-3">
                    <div className="w-14 h-14 bg-white rounded-lg p-1 shrink-0 overflow-hidden border border-blue-400 flex items-center justify-center">
                      <img src={gcashQrUrl} alt="GCash QR" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-0.5 text-[10px]">
                      <div className="font-bold text-stone-200">GCash QR Attached</div>
                      <div className="text-stone-400">Renters scan during checkout to deposit into your account</div>
                    </div>
                  </div>
                </div>
              )}

              {/* PayMaya / Maya Configuration Card */}
              {acceptPaymaya && (
                <div className="p-4 rounded-xl bg-stone-950 border border-emerald-500/40 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                    <span className="font-bold text-stone-200 flex items-center gap-1.5 text-xs">
                      <QrCode className="w-4 h-4 text-emerald-400" />
                      <span>PayMaya / Maya Details</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-stone-400 text-[11px] mb-1">Maya Merchant / Account Name</label>
                      <input
                        type="text"
                        value={paymayaAccountName}
                        onChange={(e) => setPaymayaAccountName(e.target.value)}
                        placeholder="e.g. COASTLINE MOTO / MARK R."
                        className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 font-mono uppercase text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="block text-stone-400 text-[11px] mb-1">Maya Mobile Number / ID</label>
                      <input
                        type="text"
                        value={paymayaAccountNumber}
                        onChange={(e) => setPaymayaAccountNumber(e.target.value)}
                        placeholder="0917 832 9901"
                        className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>

                  {/* QR Preview */}
                  <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 flex items-center gap-3">
                    <div className="w-14 h-14 bg-white rounded-lg p-1 shrink-0 overflow-hidden border border-emerald-400 flex items-center justify-center">
                      <img src={paymayaQrUrl} alt="Maya QR" className="w-full h-full object-cover" />
                    </div>
                    <div className="space-y-0.5 text-[10px]">
                      <div className="font-bold text-stone-200">PayMaya QR Ph Attached</div>
                      <div className="text-stone-400">Accepts Maya wallet and all QR Ph compliant banks</div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Section 3: MANDATORY Google Workspace Connection & File/Folder Creation Permissions */}
          <div className="space-y-3 pt-2 border-t border-stone-800">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-stone-100 text-sm flex items-center gap-2">
                  <span>3. Google Workspace Database & Media Storage</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold uppercase">
                    Mandatory
                  </span>
                </span>
                <span className="text-[11px] text-stone-400">
                  Google Drive and Google Sheets must be connected to store rental media, vehicle LTO registrations, 360° inspection scans, and maintain your primary live operations ledger.
                </span>
              </div>
            </div>

            {/* Comprehensive Google Workspace Permission Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-stone-950 via-stone-950 to-stone-900 border-2 border-amber-400/50 space-y-4 shadow-xl">
              
              <div className="flex items-start justify-between gap-3 border-b border-stone-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-white p-2 flex items-center justify-center shadow shrink-0">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-100 text-sm">
                      Google Account: <span className="font-mono text-amber-400">{email}</span>
                    </h4>
                    <span className="text-[11px] text-stone-400">
                      Granted Permissions for File Creation, Folder Management & Live Database Sync
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Permissions Active</span>
                </div>
              </div>

              {/* Two Column Breakdown of Specific Scopes & File/Folder Structures */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                
                {/* 1. Google Drive Dedicated Media Folders */}
                <div className="p-3.5 rounded-xl bg-stone-900 border border-blue-500/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-stone-100 font-bold">
                    <HardDrive className="w-4 h-4 text-blue-400" />
                    <span>Google Drive Dedicated Media Storage</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    <strong>Permission Granted:</strong> Rideout Rentals will create and manage dedicated root and subfolders in your Google Drive (<code>drive.file</code> scope):
                  </p>
                  
                  {/* Folder Structure Preview */}
                  <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 font-mono text-[10px] text-stone-300 space-y-1">
                    <div className="text-amber-400 font-bold flex items-center gap-1">
                      📁 <span>Rideout Rentals - {depotName}</span>
                    </div>
                    <div className="pl-4 text-stone-400">├── 📂 /Vehicle_CR_OR_Registrations</div>
                    <div className="pl-4 text-stone-400">├── 📂 /360_Pickup_Photos</div>
                    <div className="pl-4 text-stone-400">├── 📂 /Signed_Renter_Waivers</div>
                    <div className="pl-4 text-stone-400">├── 📂 /Depot_Storefront_Media</div>
                    <div className="pl-4 text-stone-400">└── 📂 /Customer_ID_Custody</div>
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Auto-creates folders upon rental confirmation</span>
                  </div>
                </div>

                {/* 2. Google Sheets Live Database & Ledger */}
                <div className="p-3.5 rounded-xl bg-stone-900 border border-emerald-500/30 space-y-2.5">
                  <div className="flex items-center gap-2 text-stone-100 font-bold">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Google Sheets Master Database & Ledger</span>
                  </div>
                  <p className="text-[11px] text-stone-400 leading-relaxed">
                    <strong>Permission Granted:</strong> Rideout Rentals will create and live-sync your master operations database in Google Sheets (<code>spreadsheets</code> scope):
                  </p>

                  {/* Spreadsheet Structure Preview */}
                  <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 font-mono text-[10px] text-stone-300 space-y-1">
                    <div className="text-emerald-400 font-bold flex items-center gap-1">
                      📊 <span>{depotName} - Master Ledger</span>
                    </div>
                    <div className="pl-4 text-stone-400">├── 📄 Sheet: Bookings_Database</div>
                    <div className="pl-4 text-stone-400">├── 📄 Sheet: Daily_Revenue_Cashflow</div>
                    <div className="pl-4 text-stone-400">├── 📄 Sheet: Fleet_Inventory_Status</div>
                    <div className="pl-4 text-stone-400">├── 📄 Sheet: Fuel_Deficit_Log</div>
                    <div className="pl-4 text-stone-400">└── 📄 Sheet: Customer_CRM</div>
                  </div>
                  <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Live 2-way data sync across your operations</span>
                  </div>
                </div>

              </div>

              {/* Explicit Mandatory Notice */}
              <div className="p-2.5 rounded-xl bg-amber-400/10 border border-amber-400/30 text-[11px] text-stone-300 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>Mandatory Integration:</strong> Because Rideout Rentals runs a decentralized architecture where each business owns their data, your Google Workspace acts as your private encrypted database and media archive.
                </span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Navigation Buttons (Back & Next / Submit) */}
      <div className="flex items-center justify-between pt-4 border-t border-stone-800">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-xl text-stone-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>
        ) : (
          <div />
        )}

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={() => {
              // Validations
              if (currentStep === 1) {
                if (!ownerName.trim()) {
                  showToast('Please enter your owner full name', 'error');
                  return;
                }
                if (!email.trim() || !email.includes('@')) {
                  showToast('Please enter a valid Gmail address', 'error');
                  return;
                }
                if (!isEmailVerified) {
                  setIsEmailVerified(true);
                  showToast('Email verified for setup', 'success');
                }
              }
              if (currentStep === 2 && !depotName.trim()) {
                showToast('Please enter your depot / shop name', 'error');
                return;
              }
              setCurrentStep(currentStep + 1);
            }}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 active:scale-95"
          >
            <span>Proceed to Step {currentStep + 1}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleFinalSubmit}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/30 active:scale-95 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-stone-950" />
            <span>{isSubmitting ? 'Provisioning Depot...' : 'Authorize Permissions & Open Depot Console'}</span>
          </button>
        )}
      </div>

    </div>
  );
};
