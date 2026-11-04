import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatPrice } from '../../utils/currencyAndLanguage';
import { BikeCategory, MotorbikeRegistrationDocs } from '../../types';
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
  AlertCircle
} from 'lucide-react';

interface BusinessOnboardingWizardProps {
  initialEmail: string;
  onBackToChoices: () => void;
  onSuccess: (businessId: string) => void;
}

const SAMPLE_BIKE_IMAGES = [
  { label: 'Urban Scooter (Honda Click 125i)', url: '/src/assets/images/bike_urban_scooter_1793338342006.jpg', model: 'Honda Click 125i', category: 'scooter' as BikeCategory, cc: 125, rate: 500 },
  { label: 'Touring Maxi-Scooter (Yamaha NMAX 155)', url: '/src/assets/images/bike_touring_scooter_1793338342942.jpg', model: 'Yamaha NMAX 155', category: 'maxi-scooter' as BikeCategory, cc: 155, rate: 700 },
  { label: 'Adventure Dual-Sport (Honda CRF300L)', url: '/src/assets/images/bike_adventure_dual_1793338342581.jpg', model: 'Honda CRF300L Dual-Sport', category: 'adventure' as BikeCategory, cc: 300, rate: 1200 },
];

export const BusinessOnboardingWizard: React.FC<BusinessOnboardingWizardProps> = ({
  initialEmail,
  onBackToChoices,
  onSuccess
}) => {
  const { registerNewBusiness, currency, showToast } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // Step 1: Business Identity & Location Pin
  const [depotName, setDepotName] = useState('Coastline Moto Rentals');
  const [ownerName, setOwnerName] = useState('Mark Ramos');
  const [email, setEmail] = useState(initialEmail);
  const [mobile, setMobile] = useState('0917 832 9901');
  const [town, setTown] = useState('San Felipe');
  const [province, setProvince] = useState('Zambales');
  const [landmarkAddress, setLandmarkAddress] = useState('National Highway cor. Liwliwa Beach Road');
  const [coordinates, setCoordinates] = useState({ lat: 15.0683, lng: 120.0601 });
  const [googleMapsPinUrl, setGoogleMapsPinUrl] = useState('https://maps.google.com/?q=15.0683,120.0601');
  const [nearbyTowns, setNearbyTowns] = useState<string[]>(['San Antonio', 'Cabangan', 'San Narciso']);
  const [newNearbyTownInput, setNewNearbyTownInput] = useState('');

  // Step 2: Connect Socials
  const [facebookPage, setFacebookPage] = useState('https://facebook.com/coastlinemotorentals');
  const [instagramHandle, setInstagramHandle] = useState('@coastlinemoto');
  const [whatsappNumber, setWhatsappNumber] = useState('09178329901');
  const [tiktokHandle, setTiktokHandle] = useState('@coastlinerentals_ph');

  // Step 3: GCash QR Code Upload
  const [gcashAccountName, setGcashAccountName] = useState('COASTLINE MOTO / MARK R.');
  const [gcashAccountNumber, setGcashAccountNumber] = useState('0917 832 9901');
  const [gcashQrUrl, setGcashQrUrl] = useState('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80');
  const [isQrUploaded, setIsQrUploaded] = useState(true);

  // Step 4: First Vehicle Setup & LTO CR/OR Document Upload
  const [vehicleName, setVehicleName] = useState('Honda Click 125i (2024)');
  const [vehicleCategory, setVehicleCategory] = useState<BikeCategory>('scooter');
  const [engineCc, setEngineCc] = useState<number>(125);
  const [dailyRate, setDailyRate] = useState<number>(500);
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState<string>('/src/assets/images/bike_urban_scooter_1793338342006.jpg');

  // LTO Registration OCR / Verification
  const [crPhotoUrl, setCrPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80');
  const [orPhotoUrl, setOrPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80');
  const [isScanningOcr, setIsScanningOcr] = useState<boolean>(false);
  const [ocrExtracted, setOcrExtracted] = useState<boolean>(true);
  const [plateNumber, setPlateNumber] = useState<string>('NB 8492');
  const [engineNumber, setEngineNumber] = useState<string>('JF58E-2948102');
  const [chassisNumber, setChassisNumber] = useState<string>('MH1JF5812KK938102');
  const [expiryDate, setExpiryDate] = useState<string>('2027-08-30');

  // Step 5: Google Workspace Integration
  const [sheetsAuthorized, setSheetsAuthorized] = useState<boolean>(true);
  const [driveAuthorized, setDriveAuthorized] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Scan & Extract LTO Documents Simulation
  const handleScanOcr = () => {
    setIsScanningOcr(true);
    setTimeout(() => {
      setIsScanningOcr(false);
      setOcrExtracted(true);
      setPlateNumber(`NB ${Math.floor(1000 + Math.random() * 9000)}`);
      setEngineNumber(`JF58E-${Math.floor(1000000 + Math.random() * 9000000)}`);
      setChassisNumber(`MH1JF5812KK${Math.floor(100000 + Math.random() * 900000)}`);
      setExpiryDate('2027-09-30');
      showToast('LTO CR/OR auto-extracted successfully! Plate and Chassis validated.', 'success');
    }, 1200);
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

  const handleFinalSubmit = () => {
    if (!depotName.trim() || !ownerName.trim() || !email.trim()) {
      showToast('Please fill in required depot and owner information', 'error');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const registrationDocs: MotorbikeRegistrationDocs = {
        certificateOfRegistrationUrl: crPhotoUrl,
        officialReceiptUrl: orPhotoUrl,
        plateNumber: plateNumber.trim().toUpperCase(),
        engineNumber: engineNumber.trim().toUpperCase(),
        chassisNumber: chassisNumber.trim().toUpperCase(),
        expiryDate: expiryDate,
      };

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
        socials: {
          facebook: facebookPage.trim(),
          instagram: instagramHandle.trim(),
          whatsapp: whatsappNumber.trim(),
          tiktok: tiktokHandle.trim(),
        },
        gcashAccountName: gcashAccountName.trim().toUpperCase(),
        gcashAccountNumber: gcashAccountNumber.trim(),
        gcashQrCodeUrl: gcashQrUrl,
        googleIntegration: {
          sheetsAuthorized,
          driveAuthorized,
          spreadsheetUrl: `https://docs.google.com/spreadsheets/d/${depotName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-ledger`,
          driveFolderUrl: `https://drive.google.com/drive/folders/${depotName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-archive`,
        },
        firstVehicle: {
          name: vehicleName.trim(),
          brand: vehicleName.split(' ')[0] || 'Honda',
          model: vehicleName,
          category: vehicleCategory,
          engineCc: Number(engineCc) || 125,
          dailyRate: Number(dailyRate) || 500,
          imageUrl: vehiclePhotoUrl,
          plateNumber: plateNumber.trim().toUpperCase(),
          registrationDocs,
        },
      });

      setIsSubmitting(false);
      onSuccess(newBizId);
    }, 900);
  };

  return (
    <div className="space-y-6 text-stone-100">
      
      {/* Step Progress Tracker */}
      <div className="space-y-2 border-b border-stone-800 pb-4">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 font-bold font-mono text-[10px]">
              Step {currentStep} of {totalSteps}
            </span>
            <span className="font-bold text-stone-200">
              {currentStep === 1 && '1. Location Pin & Depot Info'}
              {currentStep === 2 && '2. Connect Socials (Inbox & TikTok)'}
              {currentStep === 3 && '3. GCash QR Code (Direct Payments)'}
              {currentStep === 4 && '4. First Vehicle & LTO CR/OR Registration'}
              {currentStep === 5 && '5. Google Workspace (Sheets & Drive Linking)'}
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

      {/* STEP 1: Business Identity & Location Pin */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3 flex items-start gap-2.5 text-stone-300">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Renters search for motorbikes by proximity. Your exact town, province, and location pin ensure nearby tourists and renters can find and navigate to your shop.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Depot / Shop Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={depotName}
                onChange={(e) => setDepotName(e.target.value)}
                placeholder="e.g. Coastline Moto Rentals"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Owner / Manager Name <span className="text-amber-400">*</span>
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
                Authorized Gmail (Subscriber Account) <span className="text-amber-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="depot@gmail.com"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div>
              <label className="block text-stone-300 font-semibold mb-1">
                Mobile / Contact Phone <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="0917 832 9901"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono focus:outline-none focus:border-amber-400 text-xs"
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
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-400 text-xs"
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
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-stone-300 font-semibold mb-1">
                Landmark Address / Highway Entrance
              </label>
              <input
                type="text"
                value={landmarkAddress}
                onChange={(e) => setLandmarkAddress(e.target.value)}
                placeholder="e.g. National Highway cor. Liwliwa Beach Road, near Shell Station"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-400 text-xs"
              />
            </div>

            <div className="sm:col-span-2 p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-200 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  Exact GPS Pin & Google Maps Share Link:
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

            {/* Nearby Towns Covered */}
            <div className="sm:col-span-2 space-y-2">
              <label className="block text-stone-300 font-semibold">
                Nominated Nearby Towns for Social Marketing & Delivery:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {nearbyTowns.map((t) => (
                  <span 
                    key={t}
                    className="px-2.5 py-1 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 text-xs flex items-center gap-1"
                  >
                    <span>📍 {t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNearbyTown(t)}
                      className="text-stone-500 hover:text-red-400 ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNearbyTownInput}
                  onChange={(e) => setNewNearbyTownInput(e.target.value)}
                  placeholder="Add nearby town (e.g. San Narciso, Botolan)..."
                  className="flex-1 px-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNearbyTown();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddNearbyTown}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-lg text-xs transition-colors"
                >
                  + Add Town
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Connect Socials */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3 flex items-start gap-2.5 text-stone-300">
            <Share2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Connect your shop's communication and social handles. Inquiries from Messenger, WhatsApp, Instagram, and TikTok feed into your unified <strong>Social Inbox</strong> with AI-assisted quick replies.
            </p>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
              <div className="flex items-center gap-2 text-stone-200 font-semibold">
                <Facebook className="w-4 h-4 text-blue-400" />
                <span>Facebook Page / Messenger</span>
              </div>
              <input
                type="text"
                value={facebookPage}
                onChange={(e) => setFacebookPage(e.target.value)}
                placeholder="https://facebook.com/yourdepot"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-amber-400"
              />
              <span className="text-[10px] text-stone-500 block">
                Enables customer booking inquiries and 1-click branding sync from your Facebook page.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
              <div className="flex items-center gap-2 text-stone-200 font-semibold">
                <Instagram className="w-4 h-4 text-pink-400" />
                <span>Instagram Business Handle</span>
              </div>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@yourdepot_rentals"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
              <div className="flex items-center gap-2 text-stone-200 font-semibold">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Business Number</span>
              </div>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="0917 832 9901 or +63 917..."
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[10px] text-stone-500 block">
                Preferred by foreign travelers and international tourists visiting Southeast Asia.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5">
              <div className="flex items-center gap-2 text-stone-200 font-semibold">
                <Video className="w-4 h-4 text-rose-400" />
                <span>TikTok Creator / Business Handle</span>
              </div>
              <input
                type="text"
                value={tiktokHandle}
                onChange={(e) => setTiktokHandle(e.target.value)}
                placeholder="@yourdepot_ph"
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-amber-400 font-mono"
              />
              <span className="text-[10px] text-stone-500 block">
                Integrated with TikTok Studio: transforms customer pickup selfies into viral 9:16 vertical travel clips.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: GCash Payment QR Code Upload */}
      {currentStep === 3 && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3 flex items-start gap-2.5 text-stone-300">
            <QrCode className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Upload your <strong>GCash Merchant or Personal QR Code</strong>. Renters scan this exact code during online checkout and counter pickup to pay deposits and rental fees directly to your account. <strong>Zero transaction commission</strong> during your free trial!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Input Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  GCash Account Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={gcashAccountName}
                  onChange={(e) => setGcashAccountName(e.target.value)}
                  placeholder="e.g. COASTLINE MOTO / MARK R."
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 uppercase font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  GCash Mobile Number <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={gcashAccountNumber}
                  onChange={(e) => setGcashAccountNumber(e.target.value)}
                  placeholder="0917 832 9901"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-2">
                <span className="font-semibold text-stone-200 block">
                  Upload GCash QR Code Image:
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsQrUploaded(true);
                      setGcashQrUrl('https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400&auto=format&fit=crop&q=80');
                      showToast('Standard GCash QR loaded & verified', 'info');
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-400" />
                    <span>Choose / Upload QR Image</span>
                  </button>
                </div>
                <p className="text-[10px] text-stone-500">
                  Accepts PNG, JPG, or screenshot directly exported from your GCash mobile app.
                </p>
              </div>
            </div>

            {/* QR Live Visual Preview */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-blue-950/40 via-stone-950 to-stone-950 border border-blue-500/30 flex flex-col items-center justify-center text-center space-y-2.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono uppercase font-bold">
                <Check className="w-3 h-3 text-blue-400" />
                <span>GCash Verified Payout Channel</span>
              </div>

              {/* QR Image Frame */}
              <div className="w-40 h-40 bg-white rounded-xl p-2.5 shadow-xl border-2 border-blue-400 flex items-center justify-center relative overflow-hidden">
                {gcashQrUrl ? (
                  <img
                    src={gcashQrUrl}
                    alt="GCash QR Code"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <QrCode className="w-24 h-24 text-stone-800" />
                )}
              </div>

              <div className="font-mono text-center">
                <div className="text-xs font-bold text-stone-100">{gcashAccountName}</div>
                <div className="text-[11px] text-blue-400 font-semibold">{gcashAccountNumber}</div>
              </div>
              <span className="text-[10px] text-stone-400 max-w-[220px]">
                Renters scan this QR during booking to deposit directly into your mobile wallet.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* STEP 4: First Fleet Vehicle & LTO Registration Documents (CR & OR) */}
      {currentStep === 4 && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3 flex items-start gap-2.5 text-stone-300">
            <Bike className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Add your first fleet vehicle! We pick up vehicle specs by scanning photos of your <strong>Certificate of Registration (CR)</strong> and <strong>Official Receipt (OR)</strong>. These validated papers are automatically attached to renter digital contracts for road checkpoints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Vehicle Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-stone-300 font-semibold mb-1">
                  Vehicle Model / Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={vehicleName}
                  onChange={(e) => setVehicleName(e.target.value)}
                  placeholder="e.g. Honda Click 125i (2024)"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 focus:outline-none focus:border-amber-400 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Category</label>
                  <select
                    value={vehicleCategory}
                    onChange={(e) => setVehicleCategory(e.target.value as BikeCategory)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-200 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="scooter">Scooter (Under 150cc)</option>
                    <option value="maxi-scooter">Maxi-Scooter (155cc+)</option>
                    <option value="adventure">Adventure / Dual-Sport</option>
                    <option value="classic">Classic / Cruiser</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-300 font-semibold mb-1">Daily Rental Rate</label>
                  <div className="flex items-center bg-stone-950 border border-stone-800 rounded-lg px-3 py-1.5 text-stone-100">
                    <span className="text-amber-400 font-mono mr-1">₱</span>
                    <input
                      type="number"
                      value={dailyRate}
                      onChange={(e) => setDailyRate(Number(e.target.value))}
                      className="w-full bg-transparent text-stone-100 font-mono text-xs focus:outline-none"
                    />
                    <span className="text-[10px] text-stone-500">/day</span>
                  </div>
                </div>
              </div>

              {/* Sample Bike Photo Selection */}
              <div className="space-y-1.5">
                <label className="block text-stone-300 font-semibold">
                  Choose Vehicle Photo:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SAMPLE_BIKE_IMAGES.map((sample) => {
                    const isSelected = vehiclePhotoUrl === sample.url;
                    return (
                      <button
                        key={sample.model}
                        type="button"
                        onClick={() => {
                          setVehiclePhotoUrl(sample.url);
                          setVehicleName(sample.model);
                          setVehicleCategory(sample.category);
                          setEngineCc(sample.cc);
                          setDailyRate(sample.rate);
                        }}
                        className={`p-1.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-stone-900 shadow-md ring-1 ring-amber-400'
                            : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                        }`}
                      >
                        <div className="aspect-video rounded-lg overflow-hidden bg-stone-900 mb-1">
                          <img src={sample.url} alt={sample.label} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-[10px] font-semibold text-stone-200 truncate">{sample.model}</div>
                        <div className="text-[9px] text-amber-400 font-mono">{formatPrice(sample.rate, currency)}/day</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* LTO CR & OR Documents Upload & Auto-Extraction Card */}
            <div className="p-4 rounded-xl bg-stone-950 border-2 border-amber-400/30 space-y-3.5">
              <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                  <span className="font-bold text-stone-200">LTO Registration (CR & OR)</span>
                </div>
                <button
                  type="button"
                  onClick={handleScanOcr}
                  disabled={isScanningOcr}
                  className="px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 text-xs font-bold transition-all flex items-center gap-1 shadow-sm disabled:opacity-50"
                  title="Simulate scanning CR & OR photos to extract plate and engine numbers"
                >
                  <Scan className={`w-3.5 h-3.5 ${isScanningOcr ? 'animate-spin' : ''}`} />
                  <span>{isScanningOcr ? 'Scanning OCR...' : 'Auto-Extract Data'}</span>
                </button>
              </div>

              {/* Uploaded Documents Preview Strip */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-[10px] font-mono text-stone-400 font-semibold block">
                    1. Certificate of Registration (CR)
                  </span>
                  <div className="aspect-[4/3] rounded bg-black/60 overflow-hidden relative border border-stone-800">
                    <img src={crPhotoUrl} alt="LTO CR Photo" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono text-emerald-400">
                      CR Verified
                    </span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-[10px] font-mono text-stone-400 font-semibold block">
                    2. Official Receipt (OR)
                  </span>
                  <div className="aspect-[4/3] rounded bg-black/60 overflow-hidden relative border border-stone-800">
                    <img src={orPhotoUrl} alt="LTO OR Photo" className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono text-emerald-400">
                      OR Valid
                    </span>
                  </div>
                </div>
              </div>

              {/* Extracted Fields from OCR */}
              <div className="space-y-2 pt-1">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-stone-400 block">Plate Number:</label>
                    <input
                      type="text"
                      value={plateNumber}
                      onChange={(e) => setPlateNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-100 font-mono font-bold text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-stone-400 block">Registration Expiry:</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-100 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-stone-400 block">Engine No.:</label>
                    <input
                      type="text"
                      value={engineNumber}
                      onChange={(e) => setEngineNumber(e.target.value)}
                      className="w-full px-2.5 py-1 bg-stone-900 border border-stone-800 rounded text-stone-300 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-stone-400 block">Chassis / Frame No.:</label>
                    <input
                      type="text"
                      value={chassisNumber}
                      onChange={(e) => setChassisNumber(e.target.value)}
                      className="w-full px-2.5 py-1 bg-stone-900 border border-stone-800 rounded text-stone-300 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>CR & OR will be issued digitally on renter contract PDFs for traffic enforcers.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* STEP 5: Google Workspace Integration (Sheets & Drive Linking) */}
      {currentStep === 5 && (
        <div className="space-y-4 animate-fade-in text-xs">
          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl p-3 flex items-start gap-2.5 text-stone-300">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Authorize Google Workspace linking for your depot. We automatically sync your daily rental data to <strong>Google Sheets</strong> and archive inspection photos and signed waivers in <strong>Google Drive</strong>.
            </p>
          </div>

          <div className="space-y-3.5">
            {/* Google Sheets Card */}
            <div className={`p-4 rounded-xl border transition-all ${
              sheetsAuthorized 
                ? 'bg-stone-950 border-emerald-500/50' 
                : 'bg-stone-950/60 border-stone-800'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-stone-100 text-sm">Google Sheets Live Ledger Sync</h4>
                      {sheetsAuthorized && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                          Authorized
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Automatically creates and live-updates <strong>"{depotName} - Master Ledger"</strong> with bookings, daily revenue, customer phone numbers, fuel bar deficit penalties, and fleet utilization.
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={sheetsAuthorized}
                    onChange={(e) => setSheetsAuthorized(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Google Drive Cloud Folders Card */}
            <div className={`p-4 rounded-xl border transition-all ${
              driveAuthorized 
                ? 'bg-stone-950 border-emerald-500/50' 
                : 'bg-stone-950/60 border-stone-800'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <HardDrive className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-stone-100 text-sm">Google Drive Dedicated Cloud Folders</h4>
                      {driveAuthorized && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                          Authorized
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">
                      Automatically provisions and organizes cloud folders inside your Google Drive:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 pt-1 font-mono text-[11px] text-stone-300">
                      <span className="flex items-center gap-1.5 bg-stone-900/80 px-2 py-1 rounded border border-stone-800">
                        📁 <span>/CR_OR_Registrations</span>
                      </span>
                      <span className="flex items-center gap-1.5 bg-stone-900/80 px-2 py-1 rounded border border-stone-800">
                        📁 <span>/360_Pickup_Photos</span>
                      </span>
                      <span className="flex items-center gap-1.5 bg-stone-900/80 px-2 py-1 rounded border border-stone-800">
                        📁 <span>/Signed_Waivers</span>
                      </span>
                      <span className="flex items-center gap-1.5 bg-stone-900/80 px-2 py-1 rounded border border-stone-800">
                        📁 <span>/Customer_ID_Custody</span>
                      </span>
                    </div>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={driveAuthorized}
                    onChange={(e) => setDriveAuthorized(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Launch Summary Card */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-amber-400/10 via-stone-950 to-stone-950 border border-amber-400/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>30-Day Free Trial Ready to Unlock</span>
              </div>
              <p className="text-[11px] text-stone-300">
                You will enjoy 30 full days of unlimited bookings, fleet inventory management, 360° digital waiver inspections, and omnichannel social messaging at {formatPrice(0, currency)} Month 1.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Buttons (Back & Next / Submit) */}
      <div className="flex items-center justify-between pt-3 border-t border-stone-800">
        {currentStep > 1 ? (
          <button
            type="button"
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onBackToChoices}
            className="px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 border border-stone-800 text-xs font-semibold"
          >
            Cancel
          </button>
        )}

        {currentStep < totalSteps ? (
          <button
            type="button"
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleFinalSubmit}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/25 transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-stone-950 stroke-[2.5]" />
            <span>{isSubmitting ? 'Configuring Depot...' : 'Complete Setup & Unlock Depot Console'}</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>
        )}
      </div>

    </div>
  );
};
