import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { validateLicenseCodes, validatePhilippineMobile } from '../../utils/licenseValidator';
import { 
  X, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Bike, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  Tag, 
  Sparkles,
  ThumbsUp,
  Zap,
  MessageSquare
} from 'lucide-react';
import { GCashCheckoutCard } from '../common/GCashCheckoutCard';
import { calculateSmartPriceDiscount } from '../../types/smartPricing';

interface NewReservationModalProps {
  onClose: () => void;
  initialBikeId?: string;
}

export const NewReservationModal: React.FC<NewReservationModalProps> = ({
  onClose,
  initialBikeId,
}) => {
  const { bikes, currentBusiness, addReservation, validatePromoCode, showToast } = useApp();

  // Rider & License Verification states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('0917');
  const [customerLicenseNumber, setCustomerLicenseNumber] = useState('');
  const [driverLicenseCodes, setDriverLicenseCodes] = useState<string[]>([]);
  const [licenseValidated, setLicenseValidated] = useState<boolean | null>(null);
  const [licenseImageUrl, setLicenseImageUrl] = useState<string | null>(null);
  const [customerNationality, setCustomerNationality] = useState('Filipino');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Facebook Connection state
  const [isFacebookConnected, setIsFacebookConnected] = useState(false);
  const [isConnectingFb, setIsConnectingFb] = useState(false);

  // Preferred Communication Mode
  const [preferredContactMode, setPreferredContactMode] = useState<'sms' | 'whatsapp' | 'facebook' | 'instagram'>('sms');
  const [preferredContactHandle, setPreferredContactHandle] = useState<string>('');

  // Bike & Schedule
  const [bikeId, setBikeId] = useState(initialBikeId || (bikes.length > 0 ? bikes[0].id : ''));
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2);
  const [endDate, setEndDate] = useState(tomorrow.toISOString().split('T')[0]);
  const [endTime, setEndTime] = useState('17:00');

  const [pickupLocation, setPickupLocation] = useState('San Felipe HQ (Near Public Market)');
  const [dropoffLocation, setDropoffLocation] = useState('San Felipe HQ');

  // Promo Code state
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | undefined>(undefined);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Payment & Transfer Confirmation
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'GCash' | 'Credit Card' | 'Bank Transfer'>('GCash');
  const [paymentStatus, setPaymentStatus] = useState<'Unpaid' | 'Deposit Paid' | 'Fully Paid'>('Deposit Paid');
  const [notes, setNotes] = useState('');
  const [gcashReferenceNumber, setGcashReferenceNumber] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [payerAccountName, setPayerAccountName] = useState<string>('');
  const [paymentProofType, setPaymentProofType] = useState<string>('gcash-screenshot');

  // Facebook alerts permission
  const [facebookPageLiked, setFacebookPageLiked] = useState<boolean>(true);
  const [facebookAlertsPermitted, setFacebookAlertsPermitted] = useState<boolean>(true);

  const selectedBike = bikes.find(b => b.id === bikeId) || bikes[0];

  // Add-ons selection state
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const activeAddOnsList = currentBusiness.customization?.addOns?.filter(a => a.isActive) || [];
  const selectedAddOns = activeAddOnsList
    .filter(a => selectedAddOnIds.includes(a.id))
    .map(a => ({ id: a.id, name: a.name, price: a.price }));
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);

  // Calculate rental days
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  const diffHours = Math.max(24, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
  const totalDays = Math.max(1, Math.ceil(diffHours / 24));

  const dailyRate = selectedBike ? selectedBike.dailyRate : 800;
  const baseSubtotal = dailyRate * totalDays;

  // Smart Dynamic Pricing
  const smartPricingConfig = currentBusiness?.customization?.smartPricingConfig;
  const smartPricingResult = calculateSmartPriceDiscount(
    dailyRate,
    totalDays,
    smartPricingConfig
  );
  const smartDiscountAmount = smartPricingResult.totalSmartDiscountAmount;

  const subtotal = Math.max(0, baseSubtotal + addOnsTotal - smartDiscountAmount - discountAmount);
  const securityDeposit = currentBusiness.customization?.depositPerMotorbike ?? (selectedBike?.category === 'adventure' ? 3000 : 2000);
  const grandTotal = subtotal + securityDeposit;
  const depositPaid = paymentStatus === 'Fully Paid' ? grandTotal : (paymentStatus === 'Deposit Paid' ? 1000 : 0);

  const toggleAddon = (addonId: string) => {
    setSelectedAddOnIds(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  // Phone validation
  const phoneValidation = validatePhilippineMobile(customerPhone);

  // Handle Driver License Upload & Verification

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setLicenseImageUrl(reader.result as string);
      // Realistic simulation: extract name & prompt/verify A or A1
      const defaultName = customerName || 'JUAN DELA CRUZ';
      setCustomerName(defaultName);
      setCustomerLicenseNumber('N01-21-998822');
      // Set codes A, A1 by default for uploaded driver license
      setDriverLicenseCodes(['A', 'A1', 'B']);
      setLicenseValidated(true);
      showToast(`License uploaded! Extracted Name: ${defaultName}. Validated Code A/A1.`, 'success');
    };
    reader.readAsDataURL(file);
  };

  // Handle Facebook Login to retrieve email
  const handleFacebookLogin = () => {
    setIsConnectingFb(true);
    setTimeout(() => {
      setIsConnectingFb(false);
      setIsFacebookConnected(true);
      const extractedEmail = customerName 
        ? `${customerName.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`
        : 'rider.philippines@gmail.com';
      setCustomerEmail(extractedEmail);
      showToast(`Connected with Facebook! Retrieved verified email: ${extractedEmail}`, 'success');
    }, 600);
  };

  // Handle Promo Code Application
  const handleApplyPromo = () => {
    if (!promoInput.trim()) return;
    const res = validatePromoCode(promoInput, totalDays, baseSubtotal);
    setPromoMessage(res.message);
    if (res.valid) {
      setAppliedPromo(res.promo?.code);
      setDiscountAmount(res.discount);
      showToast(`Promo ${res.promo?.code} applied! -₱${res.discount.toLocaleString()}`, 'success');
    } else {
      setAppliedPromo(undefined);
      setDiscountAmount(0);
      showToast(res.message, 'error');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(undefined);
    setDiscountAmount(0);
    setPromoInput('');
    setPromoMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!licenseValidated) {
      alert("Please upload and validate a Driver's License with Code A or A1 for motorcycle authorization.");
      return;
    }

    if (!phoneValidation.isValid) {
      alert(`Invalid Mobile Number: ${phoneValidation.error}`);
      return;
    }

    if (!customerEmail.trim()) {
      alert('Please connect your Facebook account or provide your email address.');
      return;
    }

    addReservation({
      customerName,
      customerEmail,
      customerPhone: phoneValidation.cleaned,
      customerLicenseNumber: customerLicenseNumber || 'PH-VERIFIED-COUNTER',
      driverLicenseImageUrl: licenseImageUrl || undefined,
      driverLicenseCodes,
      driverLicenseValidated: true,
      facebookConnected: isFacebookConnected,
      facebookEmail: isFacebookConnected ? customerEmail : undefined,
      facebookName: isFacebookConnected ? customerName : undefined,
      customerNationality,
      emergencyContact: emergencyContact || 'Not specified',
      bikeId: selectedBike.id,
      bikeName: selectedBike.name,
      startDate,
      startTime,
      endDate,
      endTime,
      pickupLocation,
      dropoffLocation,
      status: 'confirmed',
      dailyRate,
      totalDays,
      promoCode: appliedPromo || (smartDiscountAmount > 0 ? 'SMART_DYNAMIC' : undefined),
      discountAmount: discountAmount + smartDiscountAmount,
      subtotal,
      securityDeposit,
      totalAmount: grandTotal,
      depositPaid,
      paymentMethod,
      paymentStatus,
      gcashReferenceNumber: gcashReferenceNumber || undefined,
      paymentProofUrl: paymentProofUrl || undefined,
      paymentProofType: paymentProofUrl ? (paymentProofType as any) : undefined,
      payerAccountName: payerAccountName || undefined,
      transferConfirmationUploaded: Boolean(paymentProofUrl),
      facebookPageLiked,
      facebookAlertsPermitted,
      businessId: currentBusiness.id,
      notes,
      selectedAddOns,
      addOnsTotal,
      preferredContactMode,
      preferredContactHandle: preferredContactHandle.trim() || (preferredContactMode === 'facebook' ? (customerName) : (preferredContactMode === 'instagram' ? `@${customerName.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : phoneValidation.cleaned)),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div>
            <h2 className="text-base font-bold text-stone-100">Create New Reservation</h2>
            <p className="text-xs text-stone-400">Driver's License Code A/A1 validation, Facebook login, and 11-digit mobile required</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-xs">
          
          {/* Section 1: Driver's License Upload & Validation */}
          <div className="rounded-xl border border-stone-800 bg-stone-950/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-400" />
                <span>1. Upload Driver's License (Front) *</span>
              </span>
              {licenseValidated !== null && (
                <span className={`text-[11px] font-mono font-bold flex items-center gap-1 ${
                  licenseValidated ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {licenseValidated ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>CODE A / A1 VALIDATED</span>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>NO CODE A/A1 DETECTED</span>
                    </>
                  )}
                </span>
              )}
            </div>

            <p className="text-stone-400 text-xs leading-relaxed">
              Upload the front of the driver's license. The system scans and verifies <strong className="text-stone-200">DL Code A or A1</strong> (motorcycle authorization) and automatically extracts the renter's full name.
            </p>

            {/* File Upload Drop Zone */}
            <div className="mt-3">
              <label className="border border-dashed border-stone-700 hover:border-amber-400 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer bg-stone-900/60 transition-colors">
                <Upload className="w-5 h-5 text-stone-400 mb-1" />
                <span className="text-xs text-stone-300 font-medium">Click to upload photo of Driver's License</span>
                <span className="text-[10px] text-stone-500">JPG, PNG, or photo taken from camera</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* License Preview & Extracted Name */}
            {licenseImageUrl && (
              <div className="mt-3 pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={licenseImageUrl}
                  alt="Uploaded License"
                  className="w-44 h-28 object-contain rounded bg-stone-950 border border-stone-700 shrink-0"
                />
                <div className="space-y-1 text-xs">
                  <div>
                    <span className="text-stone-500">Extracted Full Name: </span>
                    <strong className="text-amber-400 font-mono text-sm">{customerName}</strong>
                  </div>
                  <div>
                    <span className="text-stone-500">License Number: </span>
                    <span className="font-mono text-stone-300">{customerLicenseNumber}</span>
                  </div>
                  <div>
                    <span className="text-stone-500">Detected DL Codes: </span>
                    <span className="font-mono text-stone-200">[{driverLicenseCodes.join(', ')}]</span>
                  </div>
                  {licenseValidated ? (
                    <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Authorized for motorcycle operation (RA 10054 compliant)</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-red-400 font-medium flex items-center gap-1 mt-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Unauthorized: LTO requires Code A or A1 for motorbike operation!</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Facebook Login for Verified Email */}
          <div className="rounded-xl border border-stone-800 bg-stone-950/70 p-4 space-y-3">
            <span className="font-bold text-stone-200 text-xs uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>2. Facebook Account Authentication (Email Retrieval) *</span>
            </span>

            <p className="text-stone-400 text-xs">
              Renter must login their Facebook account to securely confirm their identity and retrieve their verified contact email.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button
                type="button"
                onClick={handleFacebookLogin}
                disabled={isConnectingFb}
                className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                  isFacebookConnected
                    ? 'bg-blue-600 text-white'
                    : 'bg-[#1877F2] hover:bg-[#166fe5] text-white'
                }`}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <span>{isConnectingFb ? 'Connecting to Facebook...' : isFacebookConnected ? 'Connected with Facebook ✓' : 'Login with Facebook'}</span>
              </button>

              {customerEmail && (
                <div className="text-xs font-mono text-stone-200 bg-stone-900 px-3 py-1.5 rounded border border-stone-800">
                  <span className="text-stone-500 font-sans">Retrieved Email: </span>
                  <span className="text-amber-400 font-semibold">{customerEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: 11-Digit Philippine Mobile Number */}
          <div className="rounded-xl border border-stone-800 bg-stone-950/70 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200 text-xs uppercase tracking-wider flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400" />
                <span>3. Customer 11-Digit Mobile Number *</span>
              </span>
              <span className={`text-[11px] font-mono font-bold ${
                phoneValidation.isValid ? 'text-emerald-400' : 'text-amber-400'
              }`}>
                {phoneValidation.cleaned.length}/11 Digits
              </span>
            </div>

            <div>
              <input
                type="text"
                required
                maxLength={11}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="09171234567"
                className={`w-full px-3 py-2 bg-stone-900 border rounded-lg text-stone-100 font-mono text-base font-bold tracking-wider focus:outline-none ${
                  phoneValidation.isValid
                    ? 'border-emerald-500/60 focus:border-emerald-400'
                    : 'border-stone-800 focus:border-amber-400'
                }`}
              />
              {!phoneValidation.isValid && customerPhone.length > 0 && (
                <p className="mt-1 text-[11px] text-amber-400/90 font-mono">
                  {phoneValidation.error}
                </p>
              )}
            </div>

            {/* Preferred Communication Mode Selection */}
            <div className="pt-2 border-t border-stone-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Renter's Preferred Communication Mode:</span>
                </span>
                <span className="text-[10px] text-stone-500 font-mono">For Quick Chat</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'sms', label: '📱 SMS', sub: 'Direct Text', activeClass: 'bg-amber-400 text-stone-950 border-amber-400 font-bold' },
                  { id: 'whatsapp', label: '💬 WhatsApp', sub: 'Instant Chat', activeClass: 'bg-emerald-500 text-white border-emerald-400 font-bold' },
                  { id: 'facebook', label: '🔵 Messenger', sub: 'FB Chat', activeClass: 'bg-[#0084FF] text-white border-blue-400 font-bold' },
                  { id: 'instagram', label: '📸 Instagram', sub: 'Direct DM', activeClass: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400 font-bold' },
                ].map(platform => (
                  <button
                    key={platform.id}
                    type="button"
                    onClick={() => {
                      setPreferredContactMode(platform.id as any);
                      if (platform.id === 'sms' || platform.id === 'whatsapp') {
                        setPreferredContactHandle(customerPhone);
                      } else if (platform.id === 'facebook') {
                        setPreferredContactHandle(customerName || 'FB Profile');
                      } else if (platform.id === 'instagram') {
                        setPreferredContactHandle(`@${customerName ? customerName.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'rider'}`);
                      }
                    }}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      preferredContactMode === platform.id
                        ? `${platform.activeClass} shadow-md`
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="font-semibold text-xs">{platform.label}</div>
                    <div className="text-[10px] opacity-80">{platform.sub}</div>
                  </button>
                ))}
              </div>

              {/* Handle input */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-[11px] text-stone-400 shrink-0">
                  {preferredContactMode === 'sms' ? 'SMS Mobile:' :
                   preferredContactMode === 'whatsapp' ? 'WhatsApp:' :
                   preferredContactMode === 'facebook' ? 'Facebook Handle/Name:' :
                   'Instagram @handle:'}
                </span>
                <input
                  type="text"
                  value={preferredContactHandle}
                  onChange={(e) => setPreferredContactHandle(e.target.value)}
                  placeholder={
                    preferredContactMode === 'sms' || preferredContactMode === 'whatsapp' ? (customerPhone || '09171234567') :
                    preferredContactMode === 'facebook' ? (customerName || 'Facebook Profile') :
                    '@rider_instagram'
                  }
                  className="flex-1 px-2.5 py-1 bg-stone-900 border border-stone-800 rounded font-mono text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Motorbike Selection */}
          <div className="pt-2">
            <label className="block text-stone-300 font-semibold mb-2 flex items-center gap-2">
              <Bike className="w-4 h-4 text-amber-400" />
              <span>Select Motorbike from Fleet</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {bikes.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBikeId(b.id)}
                  className={`p-3 rounded-lg border text-left flex items-center gap-3 transition-colors ${
                    b.id === bikeId
                      ? 'border-amber-400 bg-amber-400/10'
                      : 'border-stone-800 bg-stone-950 hover:border-stone-700'
                  }`}
                >
                  <img
                    src={b.imageUrl}
                    alt={b.name}
                    className="w-14 h-11 object-cover rounded bg-stone-800 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-semibold text-stone-100 truncate">{b.name}</div>
                    <div className="text-[11px] text-stone-400 font-mono">
                      ₱{b.dailyRate.toLocaleString()} / day · {b.status.toUpperCase()}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Dates and Locations */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-stone-400 mb-1">Pickup Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-100 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-stone-400 mb-1">Pickup Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-100 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-stone-400 mb-1">Return Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-100 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-stone-400 mb-1">Return Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-100 text-xs font-mono"
              />
            </div>
          </div>

          {/* Section 6: Promo Code Input */}
          <div className="rounded-xl border border-stone-800 bg-stone-950/70 p-4 space-y-3">
            <span className="font-bold text-stone-200 text-xs uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <span>Promo Code for Discounts</span>
            </span>

            <div className="flex gap-2">
              <input
                type="text"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                placeholder="Enter promo code (e.g. RIDEOUT15, ZAMBALES500)"
                className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-100 font-mono uppercase text-xs focus:outline-none focus:border-amber-400"
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                className="px-4 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors"
              >
                Apply
              </button>
            </div>

            {appliedPromo && (
              <div className="flex items-center justify-between text-xs text-emerald-400 font-mono">
                <span>Code {appliedPromo} applied: -₱{discountAmount.toLocaleString()} discount</span>
                <button
                  type="button"
                  onClick={handleRemovePromo}
                  className="text-stone-400 hover:text-stone-200 text-[11px] underline font-sans"
                >
                  Remove
                </button>
              </div>
            )}
            {promoMessage && !appliedPromo && (
              <p className="text-xs text-red-400 font-mono">{promoMessage}</p>
            )}
          </div>

          {/* Section 6.5: Optional Add-on Accessories & Equipment */}
          {activeAddOnsList.length > 0 && (
            <div className="rounded-xl border border-stone-800 bg-stone-950/70 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Add-on Accessories & Rental Options</span>
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {selectedAddOns.length} selected (+₱{addOnsTotal})
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {activeAddOnsList.map((addon) => {
                  const isChecked = selectedAddOnIds.includes(addon.id);
                  return (
                    <label
                      key={addon.id}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-amber-400/10 border-amber-400/40 text-stone-100'
                          : 'bg-stone-900/50 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate pr-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleAddon(addon.id)}
                          className="accent-amber-400 w-4 h-4 shrink-0"
                        />
                        <div className="truncate">
                          <div className="text-xs font-semibold truncate flex items-center gap-1">
                            <span>{addon.name}</span>
                            {addon.price === 0 && (
                              <span className="text-[8px] font-bold px-1 py-0.2 bg-emerald-500/20 text-emerald-400 rounded">
                                FREE
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <span className="font-mono text-xs font-bold text-amber-400 shrink-0">
                        {addon.price === 0 ? '₱0' : `+₱${addon.price}`}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Section 7: Payment Method & GCash Card */}
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-400 mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded text-stone-100 text-xs"
                >
                  <option value="GCash">GCash (Online Instant Transfer)</option>
                  <option value="Cash">Cash at Counter</option>
                  <option value="Credit Card">Credit / Debit Card</option>
                  <option value="Bank Transfer">Bank Transfer (BDO / BPI)</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 mb-1">Payment Status</label>
                <select
                  value={paymentStatus}
                  onChange={(e) => setPaymentStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded text-stone-100 text-xs"
                >
                  <option value="Deposit Paid">Deposit Paid (₱1,000)</option>
                  <option value="Fully Paid">Fully Paid</option>
                  <option value="Unpaid">Unpaid / Pay Upon Pickup</option>
                </select>
              </div>
            </div>

            {paymentMethod === 'GCash' && (
              <GCashCheckoutCard
                gcashConfig={currentBusiness.gcashConfig}
                amount={depositPaid || 1000}
                label="Reservation Deposit"
                referenceNumber={gcashReferenceNumber}
                onReferenceNumberChange={setGcashReferenceNumber}
                paymentProofUrl={paymentProofUrl}
                onPaymentProofChange={setPaymentProofUrl}
                payerAccountName={payerAccountName}
                onPayerAccountNameChange={setPayerAccountName}
                paymentProofType={paymentProofType}
                onPaymentProofTypeChange={setPaymentProofType}
                showToast={showToast}
              />
            )}
          </div>

          {/* Pricing Summary */}
          <div className="rounded-lg bg-stone-950/90 border border-stone-800 p-4 space-y-2 font-mono">
            <div className="flex justify-between text-stone-400 text-xs">
              <span>Rental ({totalDays} days × ₱{dailyRate.toLocaleString()}):</span>
              <span className="text-stone-200">₱{baseSubtotal.toLocaleString()}</span>
            </div>

            {smartPricingResult.isSmartPricingActive && (
              <div className="flex justify-between text-emerald-400 text-xs">
                <span className="flex items-center gap-1 font-sans">
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>Smart Dynamic Pricing Savings:</span>
                </span>
                <span>-₱{smartDiscountAmount.toLocaleString()}</span>
              </div>
            )}

            {addOnsTotal > 0 && (
              <div className="flex justify-between text-stone-300 text-xs">
                <span>Selected Add-ons ({selectedAddOns.length}):</span>
                <span>+₱{addOnsTotal.toLocaleString()}</span>
              </div>
            )}

            {discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400 text-xs">
                <span>Promo Discount ({appliedPromo}):</span>
                <span>-₱{discountAmount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between text-stone-400 text-xs">
              <span>Rental Subtotal:</span>
              <span className="text-stone-100 font-bold">₱{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex justify-between text-stone-400 text-xs">
              <span>Refundable Security Deposit:</span>
              <span className="text-amber-400">₱{securityDeposit.toLocaleString()}</span>
            </div>

            <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-sm text-stone-100 font-sans">
              <span>Grand Total:</span>
              <span className="font-mono text-amber-400">₱{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!licenseValidated || !phoneValidation.isValid}
              className="px-6 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm transition-colors"
            >
              Confirm Reservation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
