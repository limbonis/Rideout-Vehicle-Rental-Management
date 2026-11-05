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
  Store
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
  // 4: Facebook Page Connect & GCash Payments + Google Workspace
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

  // Step 4: Facebook Connect & GCash Payments
  const [fbPageUrl, setFbPageUrl] = useState('https://facebook.com/coastlinemotorentals');
  const [isFbConnecting, setIsFbConnecting] = useState(false);
  const [isFbConnected, setIsFbConnected] = useState(true);
  const [fbPageName, setFbPageName] = useState('Coastline Moto & Vehicle Rentals');
  const [fbCoverPhoto, setFbCoverPhoto] = useState('/assets/images/hero_coastal_ride_1793338340532.jpg');
  const [fbLogoUrl, setFbLogoUrl] = useState('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=300&auto=format&fit=crop&q=80');
  const [fbFollowers, setFbFollowers] = useState(8400);
  const [fbAbout, setFbAbout] = useState('Zambales premier vehicle & motorbike rental depot. Beach cruisers, scooters, and coastal exploration.');

  const [gcashAccountName, setGcashAccountName] = useState('COASTLINE MOTO / MARK R.');
  const [gcashAccountNumber, setGcashAccountNumber] = useState('0917 832 9901');
  const [gcashQrUrl, setGcashQrUrl] = useState('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80');

  const [sheetsAuthorized, setSheetsAuthorized] = useState<boolean>(true);
  const [driveAuthorized, setDriveAuthorized] = useState<boolean>(true);
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

    setIsSubmitting(true);

    setTimeout(() => {
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
          facebook: fbPageUrl.trim(),
          instagram: '@' + depotName.toLowerCase().replace(/[^a-z0-9]/g, ''),
          whatsapp: mobile.trim(),
        },
        facebookBranding: isFbConnected ? {
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
        gcashAccountName: gcashAccountName.trim().toUpperCase(),
        gcashAccountNumber: gcashAccountNumber.trim(),
        gcashQrCodeUrl: gcashQrUrl,
        googleIntegration: {
          sheetsAuthorized,
          driveAuthorized,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${depotName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-ledger`,
          driveFolderUrl: `https://drive.google.com/drive/folders/${depotName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-archive`,
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
              {currentStep === 4 && '4. Facebook Connect & GCash Payments'}
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
                    {SAMPLE_OWNER_IDS.map((sample, idx) => (
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

      {/* ======================================================== */}
      {/* STEP 4: Facebook Connect & GCash Payments                */}
      {/* ======================================================== */}
      {currentStep === 4 && (
        <div className="space-y-5 animate-fade-in text-xs">
          
          {/* Facebook Connect Section */}
          <div className="p-4 rounded-xl bg-stone-950 border-2 border-blue-500/40 space-y-3.5">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  f
                </div>
                <div>
                  <span className="font-bold text-stone-100 text-sm block">Facebook Page Connect</span>
                  <span className="text-[10px] text-stone-400">Pulls cover photo, logo, description, and syncs Messenger inbox</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConnectFacebook}
                disabled={isFbConnecting}
                className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFbConnecting ? 'animate-spin' : ''}`} />
                <span>{isFbConnecting ? 'Connecting...' : 'Connect with Facebook'}</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="block text-stone-300 font-semibold">Facebook Page URL</label>
              <input
                type="text"
                value={fbPageUrl}
                onChange={(e) => setFbPageUrl(e.target.value)}
                placeholder="https://facebook.com/yourpagename"
                className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-blue-400 font-mono"
              />
            </div>

            {/* Live Facebook Branding Preview */}
            {isFbConnected && (
              <div className="rounded-xl overflow-hidden border border-stone-800 bg-stone-900 shadow-lg space-y-3 p-3">
                <div className="relative h-24 rounded-lg overflow-hidden bg-black/60 border border-stone-800">
                  <img src={fbCoverPhoto} alt="Cover Photo" className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 text-[10px] text-blue-400 font-mono font-bold flex items-center gap-1">
                    <Check className="w-3 h-3" />
                    <span>Facebook Page Synced</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 px-1">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-stone-700 bg-black shrink-0">
                    <img src={fbLogoUrl} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-bold text-stone-100 text-xs">{fbPageName}</div>
                    <div className="text-[10px] text-stone-400">{fbFollowers.toLocaleString()} followers · Messenger Inbox Connected</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* GCash Direct Payments Setup */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200 flex items-center gap-1.5 text-sm">
                <QrCode className="w-4 h-4 text-blue-400" />
                <span>GCash Payment Receiving Details</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                0% Commission on Trial
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">GCash Account Name</label>
                <input
                  type="text"
                  value={gcashAccountName}
                  onChange={(e) => setGcashAccountName(e.target.value)}
                  placeholder="e.g. COASTLINE MOTO / MARK R."
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 font-mono uppercase text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">GCash Mobile Number</label>
                <input
                  type="text"
                  value={gcashAccountNumber}
                  onChange={(e) => setGcashAccountNumber(e.target.value)}
                  placeholder="0917 832 9901"
                  className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Google Workspace Authorization */}
          <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
            <span className="font-bold text-stone-200 block text-sm">Google Workspace Integration:</span>
            <div className="space-y-2">
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-stone-900 border border-stone-800 cursor-pointer">
                <span className="text-stone-300 font-medium">Link Daily Rental Ledger to Google Sheets</span>
                <input
                  type="checkbox"
                  checked={sheetsAuthorized}
                  onChange={(e) => setSheetsAuthorized(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-400 bg-stone-800 border-stone-700"
                />
              </label>
              <label className="flex items-center justify-between p-2.5 rounded-lg bg-stone-900 border border-stone-800 cursor-pointer">
                <span className="text-stone-300 font-medium">Create Dedicated Cloud Folder in Google Drive</span>
                <input
                  type="checkbox"
                  checked={driveAuthorized}
                  onChange={(e) => setDriveAuthorized(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-400 bg-stone-800 border-stone-700"
                />
              </label>
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
                  // If not yet verified, verify it for convenience or remind user
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
            <span>{isSubmitting ? 'Launching Depot Console...' : 'Complete Setup & Open Depot Console'}</span>
          </button>
        )}
      </div>

    </div>
  );
};
