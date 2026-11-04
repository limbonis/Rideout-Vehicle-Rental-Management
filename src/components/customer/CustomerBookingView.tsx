import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Motorbike, Reservation } from '../../types';
import { SAMPLE_LICENSES, validateLicenseCodes, validatePhilippineMobile } from '../../utils/licenseValidator';
import { 
  SAMPLE_PAYMENT_CONFIRMATIONS, 
  SamplePaymentSlip 
} from '../../utils/paymentConfirmationHelper';
import { 
  Bike, 
  MapPin, 
  Check, 
  Clock, 
  Calendar,
  Phone, 
  ArrowRight, 
  Sparkles,
  X,
  Upload,
  CheckCircle2,
  AlertTriangle,
  User,
  Building2,
  Tag,
  Mail,
  KeyRound,
  Search,
  Ticket,
  ShieldCheck,
  CreditCard,
  ChevronRight,
  ExternalLink,
  RotateCcw,
  LayoutDashboard,
  ThumbsUp,
  FileCheck,
  Eye,
  Maximize2,
  Lock,
  Instagram,
  Radio,
  Compass,
  Navigation,
  Zap,
  MessageSquare
} from 'lucide-react';
import { EmailConfirmationModal } from '../reservations/EmailConfirmationModal';
import { GCashCheckoutCard } from '../common/GCashCheckoutCard';
import { INITIAL_NOMINATED_LOCATIONS } from '../../utils/googleMapsHelper';
import { formatPrice } from '../../utils/currencyAndLanguage';
import { RenterLocationRadarModal } from './RenterLocationRadarModal';
import { calculateSmartPriceDiscount } from '../../types/smartPricing';

export const CustomerBookingView: React.FC = () => {
  const { 
    bikes, 
    reservations, 
    currentBusiness, 
    addReservation, 
    validatePromoCode, 
    showToast, 
    setActiveTab, 
    setSelectedReservationForPickup,
    currency,
    language
  } = useApp();

  // Sub-tab: Browse Fleet vs Lookup Existing Reservation
  const [customerSubTab, setCustomerSubTab] = useState<'browse' | 'lookup'>('browse');

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedBike, setSelectedBike] = useState<Motorbike | null>(null);

  // Booking Modal State
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Dates & Locations
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  
  const defaultReturn = new Date();
  defaultReturn.setDate(defaultReturn.getDate() + 2);
  const [endDate, setEndDate] = useState(defaultReturn.toISOString().split('T')[0]);
  const [endTime, setEndTime] = useState('17:00');
  const [pickupLocation, setPickupLocation] = useState('San Felipe HQ (Near Public Market)');

  // Rider Details & DL Verification
  const [customerName, setCustomerName] = useState('');
  const [customerLicenseNumber, setCustomerLicenseNumber] = useState('');
  const [driverLicenseCodes, setDriverLicenseCodes] = useState<string[]>([]);
  const [licenseValidated, setLicenseValidated] = useState<boolean | null>(null);
  const [licenseImageUrl, setLicenseImageUrl] = useState<string | null>(null);

  // Facebook Authentication & Page Like Permissions (Defaulted to YES)
  const [customerEmail, setCustomerEmail] = useState('');
  const [isFacebookConnected, setIsFacebookConnected] = useState(false);
  const [isConnectingFb, setIsConnectingFb] = useState(false);
  const [facebookPageLiked, setFacebookPageLiked] = useState<boolean>(true);
  const [facebookAlertsPermitted, setFacebookAlertsPermitted] = useState<boolean>(true);

  // 11-digit Mobile Number
  const [customerPhone, setCustomerPhone] = useState('0917');

  // Preferred Communication Mode (SMS, WhatsApp, Facebook, Instagram)
  const [preferredContactMode, setPreferredContactMode] = useState<'sms' | 'whatsapp' | 'facebook' | 'instagram'>('sms');
  const [preferredContactHandle, setPreferredContactHandle] = useState<string>('');

  // Promo Code
  const [promoInput, setPromoInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | undefined>(undefined);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  // Payment & Transfer Confirmation
  const [paymentMethod, setPaymentMethod] = useState<'GCash' | 'Cash' | 'Credit Card' | 'Bank Transfer'>('GCash');
  const [notes, setNotes] = useState('');
  const [confirmedBookingRef, setConfirmedBookingRef] = useState<string | null>(null);
  const [createdReservation, setCreatedReservation] = useState<Reservation | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [previewingReservation, setPreviewingReservation] = useState<Reservation | null>(null);
  const [gcashReferenceNumber, setGcashReferenceNumber] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState<string>('');
  const [payerAccountName, setPayerAccountName] = useState<string>('');
  const [paymentProofType, setPaymentProofType] = useState<string>('gcash-screenshot');
  const [isZoomedLookupProof, setIsZoomedLookupProof] = useState<boolean>(false);

  // Add-ons & FB Handshake state
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const [fbHandshakeSent, setFbHandshakeSent] = useState(false);

  // Lookup existing reservation state
  const [lookupQuery, setLookupQuery] = useState('ROZ-2026-9842');
  const [lookupSelectedResId, setLookupSelectedResId] = useState<string | null>(null);
  const [showLocationRadarModal, setShowLocationRadarModal] = useState<boolean>(false);

  const activeAddOnsList = currentBusiness.customization?.addOns?.filter(a => a.isActive) || [];
  const selectedAddOns = activeAddOnsList
    .filter(a => selectedAddOnIds.includes(a.id))
    .map(a => ({ id: a.id, name: a.name, price: a.price }));
  const addOnsTotal = selectedAddOns.reduce((sum, a) => sum + a.price, 0);

  const filteredBikes = bikes.filter((b) => {
    if (categoryFilter === 'all') return true;
    return b.category === categoryFilter;
  });

  // Calculate rental duration
  const start = new Date(`${startDate}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);
  const diffHours = Math.max(24, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
  const totalDays = Math.max(1, Math.ceil(diffHours / 24));

  const dailyRate = selectedBike?.dailyRate || 800;
  const baseSubtotal = dailyRate * totalDays;

  // Smart Dynamic Pricing Engine (Utilization on the day & Duration length discounts)
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

  const toggleAddon = (addonId: string) => {
    setSelectedAddOnIds(prev => 
      prev.includes(addonId) ? prev.filter(id => id !== addonId) : [...prev, addonId]
    );
  };

  // Phone validation
  const phoneValidation = validatePhilippineMobile(customerPhone);

  const handleStartBooking = (bike: Motorbike) => {
    setSelectedBike(bike);
    setConfirmedBookingRef(null);
    setStep(1);
    setIsBookingOpen(true);
  };

  const handleQuickFillDemo = () => {
    const sample = SAMPLE_LICENSES[0]; // Juan Dela Cruz
    setLicenseImageUrl(sample.imageUrl);
    setCustomerName(sample.name);
    setCustomerLicenseNumber(sample.licenseNo);
    setDriverLicenseCodes(sample.codes);
    setLicenseValidated(true);
    setIsFacebookConnected(true);
    setCustomerEmail('juan.delacruz@gmail.com');
    setCustomerPhone('09178829911');
    setPreferredContactMode('whatsapp');
    setPreferredContactHandle('09178829911');
    setFacebookPageLiked(true);
    setFacebookAlertsPermitted(true);
    
    // Auto-apply RIDEOUT15 promo
    const res = validatePromoCode('RIDEOUT15', totalDays, baseSubtotal);
    if (res.valid) {
      setAppliedPromo('RIDEOUT15');
      setDiscountAmount(res.discount);
      setPromoInput('RIDEOUT15');
      setPromoMessage(res.message);
    }

    if (activeAddOnsList.length > 0) {
      setSelectedAddOnIds([activeAddOnsList[0].id]);
    }

    // Attach sample transfer confirmation slip
    const sampleSlip = SAMPLE_PAYMENT_CONFIRMATIONS[0];
    setPaymentProofUrl(sampleSlip.imageUrl);
    setPayerAccountName('Juan Dela Cruz (0917 882 9911)');
    setGcashReferenceNumber(sampleSlip.refNumber);
    setPaymentProofType('gcash-screenshot');

    showToast(`Autofilled demo customer Juan Dela Cruz with verified Code A/A1 DL, FB alerts, and GCash proof!`, 'success');
  };

  const handleSelectSampleLicense = (sample: typeof SAMPLE_LICENSES[0]) => {
    setLicenseImageUrl(sample.imageUrl);
    setCustomerName(sample.name);
    setCustomerLicenseNumber(sample.licenseNo);
    setDriverLicenseCodes(sample.codes);
    const isValid = validateLicenseCodes(sample.codes);
    setLicenseValidated(isValid);

    if (isValid) {
      showToast(`Driver's license verified! Name: ${sample.name}. Code A/A1 authorized.`, 'success');
    } else {
      showToast(`Warning: Selected license lacks motorcycle Code A or A1!`, 'error');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setLicenseImageUrl(reader.result as string);
      const defaultName = customerName || 'JUAN DELA CRUZ';
      setCustomerName(defaultName);
      setCustomerLicenseNumber('N01-21-998822');
      setDriverLicenseCodes(['A', 'A1', 'B']);
      setLicenseValidated(true);
      showToast(`Driver's License uploaded! Extracted Name: ${defaultName}. Code A/A1 verified.`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleFacebookLogin = () => {
    setIsConnectingFb(true);
    setTimeout(() => {
      setIsConnectingFb(false);
      setIsFacebookConnected(true);
      const retrievedEmail = customerName 
        ? `${customerName.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`
        : 'rider.philippines@gmail.com';
      setCustomerEmail(retrievedEmail);
      showToast(`Connected with Facebook! Verified email: ${retrievedEmail}`, 'success');
    }, 600);
  };

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

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBike) return;

    if (!licenseValidated) {
      alert("Please upload a valid Driver's License showing Code A or A1 for motorcycle authorization.");
      return;
    }

    if (!isFacebookConnected && !customerEmail.trim()) {
      alert('Please connect your Facebook account to retrieve your contact email address.');
      return;
    }

    if (!phoneValidation.isValid) {
      alert(`Invalid Mobile Number: ${phoneValidation.error}`);
      return;
    }

    const generatedRef = `ROZ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const resPayload = {
      customerName,
      customerEmail,
      customerPhone: phoneValidation.cleaned,
      customerLicenseNumber: customerLicenseNumber || 'PH-VERIFIED',
      driverLicenseImageUrl: licenseImageUrl || undefined,
      driverLicenseCodes,
      driverLicenseValidated: true,
      facebookConnected: isFacebookConnected,
      facebookEmail: customerEmail,
      facebookName: customerName,
      facebookPageLiked,
      facebookAlertsPermitted,
      customerNationality: 'Renter',
      emergencyContact: 'Provided via Portal',
      bikeId: selectedBike.id,
      bikeName: selectedBike.name,
      startDate,
      startTime,
      endDate,
      endTime,
      pickupLocation,
      dropoffLocation: pickupLocation,
      status: 'confirmed' as const,
      dailyRate,
      totalDays,
      promoCode: appliedPromo || (smartDiscountAmount > 0 ? 'SMART_DYNAMIC' : undefined),
      discountAmount: discountAmount + smartDiscountAmount,
      subtotal,
      securityDeposit,
      totalAmount: grandTotal,
      depositPaid: paymentMethod === 'Cash' ? 0 : 1000,
      paymentMethod,
      paymentStatus: (paymentMethod === 'Cash' ? 'Unpaid' : 'Deposit Paid') as any,
      gcashReferenceNumber: gcashReferenceNumber || undefined,
      paymentProofUrl: paymentProofUrl || undefined,
      paymentProofType: paymentProofUrl ? (paymentProofType as any) : undefined,
      payerAccountName: payerAccountName || undefined,
      transferConfirmationUploaded: Boolean(paymentProofUrl),
      businessId: currentBusiness.id,
      notes,
      selectedAddOns,
      addOnsTotal,
      preferredContactMode,
      preferredContactHandle: preferredContactHandle.trim() || (preferredContactMode === 'facebook' ? (customerName) : (preferredContactMode === 'instagram' ? `@${customerName.toLowerCase().replace(/[^a-z0-9]/g, '_')}` : phoneValidation.cleaned)),
    };

    const bookingId = addReservation(resPayload);
    const fullCreatedRes: Reservation = {
      ...resPayload,
      id: bookingId,
      bookingRef: generatedRef,
      createdAt: new Date().toISOString(),
    };

    setCreatedReservation(fullCreatedRes);
    setConfirmedBookingRef(generatedRef);
    setPreviewingReservation(fullCreatedRes);
    setStep(3);
  };

  // Lookup reservation matching query or selected ID
  const matchedReservations = reservations.filter(r => {
    if (lookupSelectedResId) {
      return r.id === lookupSelectedResId;
    }
    const q = lookupQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.bookingRef?.toLowerCase().includes(q) ||
      r.customerName.toLowerCase().includes(q) ||
      r.customerPhone.includes(q) ||
      r.customerEmail.toLowerCase().includes(q)
    );
  });

  const activeLookupRes: Reservation | undefined = matchedReservations[0] || reservations[0];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner Notice & Mode Switcher */}
      <div className="bg-amber-400/10 border border-amber-400/30 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-300">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold shrink-0">
            🏍️
          </div>
          <div>
            <div className="font-bold text-stone-100 flex items-center gap-2">
              <span>Customer Reservation Portal</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Customer View Active
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Renters reserve bikes online with Driver's License Code A/A1 check, Facebook email verification & page follow alerts, and GCash/Bank transfer confirmation upload.
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveTab('overview')}
          className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap self-stretch sm:self-auto justify-center"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-amber-400" />
          <span>Go to Depot Console →</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs: Browse Fleet vs Check Active Reservation */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCustomerSubTab('browse')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              customerSubTab === 'browse'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-stone-800'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>Browse Fleet & Reserve Online</span>
          </button>

          <button
            onClick={() => setCustomerSubTab('lookup')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              customerSubTab === 'lookup'
                ? 'bg-amber-400 text-stone-950 shadow-sm'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-stone-800'
            }`}
          >
            <Ticket className="w-4 h-4" />
            <span>My Reservation / Pickup Pass</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-stone-800 text-amber-400">
              {reservations.length}
            </span>
          </button>
        </div>

        {/* Quick Reserve CTA */}
        {customerSubTab === 'browse' && (
          <button
            onClick={() => {
              const defaultBike = bikes.find(b => b.status === 'available') || bikes[0];
              if (defaultBike) handleStartBooking(defaultBike);
            }}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Quick Reserve Yamaha NMAX</span>
          </button>
        )}
      </div>

      {/* Hero Section */}
      <div className="relative rounded-2xl overflow-hidden border border-stone-800 bg-stone-900 shadow-2xl">
        <div className="relative h-[340px] md:h-[420px] overflow-hidden">
          <img
            src={currentBusiness.coverPhotoUrl}
            alt={currentBusiness.name}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/70 to-transparent"></div>

          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10 max-w-3xl">
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-2">
              <img src={currentBusiness.logoUrl} alt="" className="w-6 h-6 rounded object-cover border border-amber-400/50 inline-block" />
              <span>{currentBusiness.location} · {currentBusiness.name}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white leading-tight text-balance">
              {currentBusiness.tagline || `Explore Zambales Coast on Two Wheels.`}
            </h1>
            <p className="mt-2 text-xs md:text-sm text-stone-300 max-w-xl leading-relaxed">
              Explore San Felipe, San Antonio, San Narciso, and Cabangan with freedom. Verified DL Code A/A1 motorcycle authorization check, instant promo codes, and fast pickup handover at {currentBusiness.location}.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-stone-300">
              <div className="flex items-center gap-1.5 bg-stone-950/70 px-2.5 py-1 rounded-md border border-stone-800">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>DL Code A/A1 Verified</span>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-950/70 px-2.5 py-1 rounded-md border border-stone-800">
                <ThumbsUp className="w-4 h-4 text-blue-400" />
                <span>Facebook Alerts & Copies</span>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-950/70 px-2.5 py-1 rounded-md border border-stone-800">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>GCash & Bank Transfer Slips</span>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Trip Dates & Booking Picker Bar */}
        <div className="bg-stone-950/95 border-t border-stone-800 p-4 md:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-stone-400 font-medium mb-1">Pick Up Date & Time</label>
              <div className="flex gap-1.5">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="flex-1 px-2.5 py-2 bg-stone-900 border border-stone-800 rounded text-stone-100 font-mono text-xs focus:border-amber-400"
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-20 px-1.5 py-2 bg-stone-900 border border-stone-800 rounded text-stone-100 font-mono text-xs focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-400 font-medium mb-1">Return Date & Time</label>
              <div className="flex gap-1.5">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="flex-1 px-2.5 py-2 bg-stone-900 border border-stone-800 rounded text-stone-100 font-mono text-xs focus:border-amber-400"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-20 px-1.5 py-2 bg-stone-900 border border-stone-800 rounded text-stone-100 font-mono text-xs focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-stone-400 font-medium mb-1">Pickup Depot Location</label>
              <select
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                className="w-full px-2.5 py-2 bg-stone-900 border border-stone-800 rounded text-stone-100 text-xs focus:border-amber-400"
              >
                <option value="San Felipe HQ (Near Public Market)">San Felipe HQ (Near Public Market)</option>
                <option value="Liwliwa Beach Dropoff">Liwliwa Beach Dropoff</option>
                <option value="Crystal Beach Resort Front Gate">Crystal Beach Resort Front Gate</option>
                <option value="San Narciso Town Center">San Narciso Town Center</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  const defaultBike = bikes.find(b => b.status === 'available') || bikes[0];
                  if (defaultBike) handleStartBooking(defaultBike);
                }}
                className="w-full py-2 px-4 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Reserve Selected Dates ({totalDays} Days)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: FLEET CATALOG & RESERVATION CARDS */}
      {customerSubTab === 'browse' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-stone-100">
                Choose Your Motorbike
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                All rentals include standard helmet and full tank. Enter promo code <strong className="text-amber-400">RIDEOUT15</strong> at checkout for 15% off.
              </p>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-lg overflow-x-auto self-start sm:self-auto">
              {[
                { id: 'all', label: 'All Fleet' },
                { id: 'scooter', label: 'Scooters' },
                { id: 'maxi-scooter', label: 'Maxi Touring' },
                { id: 'adventure', label: 'Adventure / Dual' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                    categoryFilter === cat.id
                      ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bike Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBikes.map((bike) => {
              const isAvailable = bike.status === 'available';

              return (
                <div
                  key={bike.id}
                  className="rounded-xl border border-stone-800 bg-stone-900/50 overflow-hidden flex flex-col justify-between hover:border-stone-700 transition-all duration-200 shadow-sm"
                >
                  <div className="relative h-48 bg-stone-950 overflow-hidden">
                    <img
                      src={bike.imageUrl}
                      alt={bike.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>

                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-950/80 text-amber-400 border border-stone-800">
                        {bike.engineCc}cc · {bike.transmission}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3">
                      {isAvailable ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Available Now
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-800 text-stone-400 border border-stone-700">
                          Reserve Ahead
                        </span>
                      )}
                    </div>

                    {(() => {
                      const bikeSmart = calculateSmartPriceDiscount(bike.dailyRate, totalDays, smartPricingConfig);
                      return (
                        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                          <div>
                            {bikeSmart.isSmartPricingActive ? (
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                                    ₱{bikeSmart.effectiveDailyRate.toLocaleString()}
                                  </span>
                                  <span className="text-xs line-through text-stone-500 font-mono">
                                    ₱{bike.dailyRate.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-stone-400 font-normal"> / day</span>
                                </div>
                                <span className="inline-flex items-center gap-1 mt-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                                  <span>-{bikeSmart.durationDiscountPercent + bikeSmart.utilizationDiscountPercent}% Smart Rate</span>
                                </span>
                              </div>
                            ) : (
                              <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                                ₱{bike.dailyRate.toLocaleString()}
                                <span className="text-xs text-stone-400 font-normal"> / day</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-base font-bold text-stone-100">{bike.name}</h3>
                      <p className="text-xs text-stone-400 mt-1 line-clamp-1">
                        {bike.features.join(' · ')}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-stone-400">
                        <span className="text-amber-400 font-mono text-[11px] flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Requires DL Code A or A1</span>
                        </span>
                        <span className="text-stone-400 text-[11px]">Plate: {bike.plateNumber}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartBooking(bike)}
                      className="w-full py-2.5 px-4 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <span>Reserve Online Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: CUSTOMER DIGITAL RESERVATION PASS & STATUS LOOKUP */}
      {customerSubTab === 'lookup' && (
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-stone-800 bg-stone-900/60 space-y-4">
            <div>
              <h2 className="text-lg font-bold text-stone-100 flex items-center gap-2">
                <Ticket className="w-5 h-5 text-amber-400" />
                <span>Renter Booking Status & Digital Pass</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                Enter your booking reference or phone number to access your reservation, view verified driver's license status, preview your confirmation email, or begin your pickup inspection.
              </p>
            </div>

            {/* Search Input & Demo Quick Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={lookupQuery}
                  onChange={(e) => {
                    setLookupQuery(e.target.value);
                    setLookupSelectedResId(null);
                  }}
                  placeholder="Enter Booking Reference (e.g. ROZ-2026-9842) or Renter Name / Mobile"
                  className="w-full pl-9 pr-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs font-mono focus:border-amber-400"
                />
              </div>
            </div>

            {/* Quick Demo Renter Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
              <span className="text-[11px] text-stone-500">Quick view demo renters:</span>
              {reservations.slice(0, 3).map((res) => (
                <button
                  key={res.id}
                  onClick={() => {
                    setLookupSelectedResId(res.id);
                    setLookupQuery(res.bookingRef || res.customerName);
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                    activeLookupRes?.id === res.id
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 font-bold'
                      : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  {res.customerName} ({res.bookingRef})
                </button>
              ))}
            </div>
          </div>

          {/* Active Lookup Reservation Display */}
          {activeLookupRes ? (
            <div className="rounded-2xl border border-stone-800 bg-stone-900/80 overflow-hidden shadow-xl space-y-6">
              {/* Pass Header */}
              <div className="p-6 bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border-b border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold text-xl shrink-0">
                    🏍️
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-stone-400">BOOKING REFERENCE</span>
                      <span className="text-base font-bold font-mono text-amber-400">
                        {activeLookupRes.bookingRef}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-stone-100">
                      {activeLookupRes.bikeName}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wide border ${
                    activeLookupRes.status === 'confirmed'
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : activeLookupRes.status === 'active'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {activeLookupRes.status}
                  </span>

                  <span className="px-3 py-1 rounded-full text-xs font-mono bg-stone-800 text-stone-300 border border-stone-700">
                    {activeLookupRes.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Pass Content Grid */}
              <div className="px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Column 1: Renter Details & Verified DL */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                    1. Renter & Verification
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-stone-500">Name:</span>{' '}
                      <strong className="text-stone-100">{activeLookupRes.customerName}</strong>
                    </div>
                    <div>
                      <span className="text-stone-500">Facebook Email:</span>{' '}
                      <span className="font-mono text-amber-400">{activeLookupRes.customerEmail}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">Mobile (11 Digits):</span>{' '}
                      <span className="font-mono text-stone-200">{activeLookupRes.customerPhone}</span>
                    </div>

                    <div className="pt-2 border-t border-stone-800 space-y-1">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Driver's License Code A/A1 Validated</span>
                      </div>
                      <div className="text-[10px] text-stone-400 font-mono">
                        License: {activeLookupRes.customerLicenseNumber} · [{activeLookupRes.driverLicenseCodes?.join(', ')}]
                      </div>
                    </div>

                    {/* Facebook Page Follow & Alerts Badge */}
                    <div className="pt-2 border-t border-stone-800 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-blue-400 font-semibold text-[11px]">
                        <ThumbsUp className="w-3.5 h-3.5 text-blue-400" />
                        <span>Facebook Page Liked & Alerts Active</span>
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Receives 1-hr return alerts, reservation copies & pickup links
                      </div>
                    </div>

                    {/* Preferred Chat Platform Badge */}
                    {activeLookupRes.preferredContactMode && (
                      <div className="pt-2 border-t border-stone-800 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Preferred Chat: {
                            activeLookupRes.preferredContactMode === 'whatsapp' ? '💬 WhatsApp' :
                            activeLookupRes.preferredContactMode === 'facebook' ? '🔵 Messenger' :
                            activeLookupRes.preferredContactMode === 'instagram' ? '📸 Instagram' : '📱 SMS'
                          }</span>
                        </div>
                        <div className="text-[10px] text-stone-400 font-mono">
                          Direct Contact: {activeLookupRes.preferredContactHandle || activeLookupRes.customerPhone}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Column 2: Schedule & Pickup Depot */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                    2. Rental Schedule & Depot
                  </span>
                  <div className="space-y-1.5 text-xs">
                    <div>
                      <span className="text-stone-500">Pickup Date:</span>{' '}
                      <span className="font-mono text-stone-200">{activeLookupRes.startDate} at {activeLookupRes.startTime}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">Return Date:</span>{' '}
                      <span className="font-mono text-stone-200">{activeLookupRes.endDate} at {activeLookupRes.endTime}</span>
                    </div>
                    <div>
                      <span className="text-stone-500">Duration:</span>{' '}
                      <span className="font-mono text-amber-400 font-bold">{activeLookupRes.totalDays} Days</span>
                    </div>
                    <div className="pt-2 border-t border-stone-800 space-y-2">
                      <div>
                        <span className="text-stone-500 block">Depot Location:</span>
                        <span className="text-stone-200 font-medium block">{activeLookupRes.pickupLocation}</span>
                      </div>

                      {(() => {
                        const allLocs = currentBusiness.customization?.nominatedPickupLocations || INITIAL_NOMINATED_LOCATIONS;
                        const matchedDepot = allLocs.find(l => 
                          activeLookupRes.pickupLocation.toLowerCase().includes(l.name.toLowerCase()) ||
                          l.name.toLowerCase().includes(activeLookupRes.pickupLocation.toLowerCase())
                        );

                        if (!matchedDepot) return null;

                        return (
                          <div className="pt-1.5 border-t border-stone-800/80 space-y-2 text-[11px]">
                            {matchedDepot.contactStaff && (
                              <div className="bg-stone-900/80 p-2 rounded border border-stone-800">
                                <span className="text-amber-400 font-semibold block text-[10px] uppercase tracking-wider">
                                  Designated Depot Contact
                                </span>
                                <div className="text-stone-200 font-bold mt-0.5">
                                  {matchedDepot.contactStaff.name} ({matchedDepot.contactStaff.role})
                                </div>
                                <div className="text-stone-400 font-mono text-[10px] flex items-center gap-1 mt-0.5">
                                  <Phone className="w-3 h-3 text-amber-400" />
                                  <span>{matchedDepot.contactStaff.mobile}</span>
                                </div>
                              </div>
                            )}

                            {matchedDepot.timingsSchedule && (
                              <div className="text-[10px] text-stone-400 flex items-start gap-1">
                                <Clock className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                                <span>{matchedDepot.timingsSchedule}</span>
                              </div>
                            )}

                            {matchedDepot.photos && matchedDepot.photos.length > 0 && (
                              <div>
                                <span className="text-[10px] text-stone-500 block mb-1">Depot Photos:</span>
                                <div className="flex gap-1.5 overflow-x-auto pb-1">
                                  {matchedDepot.photos.map((ph, idx) => (
                                    <img
                                      key={idx}
                                      src={ph}
                                      alt={`Depot photo ${idx + 1}`}
                                      className="w-12 h-12 rounded object-cover border border-stone-800 shrink-0"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>

                {/* Column 3: Payment Breakdown & Add-ons */}
                <div className="p-4 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">
                    3. Payment & Add-ons
                  </span>
                  <div className="space-y-1 text-xs font-mono">
                    <div className="flex justify-between text-stone-400">
                      <span>Rate ({activeLookupRes.totalDays}d × ₱{activeLookupRes.dailyRate}):</span>
                      <span>₱{(activeLookupRes.totalDays * activeLookupRes.dailyRate).toLocaleString()}</span>
                    </div>
                    {activeLookupRes.selectedAddOns && activeLookupRes.selectedAddOns.length > 0 && (
                      <div className="flex justify-between text-stone-300">
                        <span>Add-ons ({activeLookupRes.selectedAddOns.length}):</span>
                        <span>+₱{activeLookupRes.addOnsTotal || 0}</span>
                      </div>
                    )}
                    {activeLookupRes.discountAmount && activeLookupRes.discountAmount > 0 ? (
                      <div className="flex justify-between text-emerald-400">
                        <span>Promo ({activeLookupRes.promoCode}):</span>
                        <span>-₱{activeLookupRes.discountAmount.toLocaleString()}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between text-stone-400">
                      <span>Security Deposit:</span>
                      <span className="text-amber-400">₱{activeLookupRes.securityDeposit?.toLocaleString()}</span>
                    </div>
                    <div className="pt-1.5 border-t border-stone-800 flex justify-between font-bold text-stone-100">
                      <span>Total:</span>
                      <span className="text-amber-400">₱{activeLookupRes.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="text-[10px] text-stone-400 pt-1">
                      Deposit Paid: ₱{activeLookupRes.depositPaid?.toLocaleString()} via {activeLookupRes.paymentMethod}
                    </div>

                    {/* Attached Proof of Payment / Transfer Confirmation Preview */}
                    {activeLookupRes.paymentProofUrl && (
                      <div className="pt-2 border-t border-stone-800">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Transfer Confirmation Slip</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setIsZoomedLookupProof(true)}
                            className="text-[10px] text-amber-400 hover:underline flex items-center gap-0.5"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Slip</span>
                          </button>
                        </div>
                        {activeLookupRes.payerAccountName && (
                          <div className="text-[10px] text-stone-400 font-mono truncate">
                            Sender: {activeLookupRes.payerAccountName}
                          </div>
                        )}
                        <div className="text-[10px] text-stone-500 font-mono">
                          Ref: {activeLookupRes.gcashReferenceNumber || 'Verified'}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Bar for Customer */}
              <div className="p-6 bg-stone-950 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-stone-400">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Ready to ride? Follow the digital inspection process upon arrival.</span>
                </div>

                {activeLookupRes.startDate > new Date().toISOString().split('T')[0] && (
                  <div className="w-full p-2.5 rounded-lg bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs flex items-center gap-2">
                    <Lock className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>
                      <strong>Pickup Active on Reservation Date:</strong> This booking is scheduled for <strong>{activeLookupRes.startDate} ({activeLookupRes.startTime})</strong>. Telemetry inspection options will unlock upon scheduled arrival.
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 flex-wrap">
                  {/* Button 0: Live GPS Radar & Proximity Social Alerts */}
                  <button
                    onClick={() => setShowLocationRadarModal(true)}
                    className="px-4 py-2 text-xs font-semibold text-stone-100 bg-stone-900 hover:bg-stone-800 border border-amber-400/40 hover:border-amber-400 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                  >
                    <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                    <span>Live GPS Radar & Proximity Social Alerts</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-400/20 text-amber-300">
                      Auto-Notify
                    </span>
                  </button>

                  {/* Button 1: Preview Email Confirmation with Pickup Button */}
                  <button
                    onClick={() => {
                      setPreviewingReservation(activeLookupRes);
                      setShowEmailPreview(true);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-700 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Preview Email (with Pickup Button)</span>
                  </button>

                  {/* Button 2: Start Depot Pickup Form */}
                  <button
                    onClick={() => {
                      setSelectedReservationForPickup(activeLookupRes);
                      setActiveTab('pickups');
                      showToast(`Opened Vehicle Pickup & Inspection Form for ${activeLookupRes.customerName}!`, 'info');
                    }}
                    className="px-5 py-2 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm flex items-center gap-2 transition-colors"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Arrived at Depot? Start Pickup Inspection</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-stone-400 bg-stone-900/40 rounded-xl border border-stone-800">
              No reservation found matching "{lookupQuery}". Try searching for Juan Dela Cruz or click one of the demo chips above.
            </div>
          )}
        </div>
      )}

      {/* Booking Modal with DL Upload, FB Login, Page Follow Consent & GCash/Bank Transfer */}
      {isBookingOpen && selectedBike && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-amber-400" />
                <span className="text-base font-bold text-stone-100">
                  {step === 3 ? 'Reservation Confirmed!' : `Reserve ${selectedBike.name}`}
                </span>
              </div>
              <button
                onClick={() => setIsBookingOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 3: Success Confirmation */}
            {step === 3 ? (
              <div className="p-8 text-center space-y-5 text-xs">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                  <Check className="w-7 h-7 stroke-[3]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-100">
                    Booking Request Confirmed!
                  </h3>
                  <div className="mt-1 text-sm font-mono text-amber-400 font-semibold">
                    Reference: {confirmedBookingRef}
                  </div>
                  <p className="text-stone-400 mt-2 max-w-sm mx-auto leading-relaxed">
                    Thank you, {customerName}! Your driver's license (Code A/A1) has been verified. We have sent electronic copies of your reservation, payment receipt, and pickup handover link to your Facebook email.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-stone-950 border border-stone-800 text-left space-y-2 text-stone-300 font-mono text-xs">
                  <div><span className="text-stone-500 font-sans">Renter:</span> {customerName}</div>
                  <div><span className="text-stone-500 font-sans">Contact:</span> {customerPhone} ({customerEmail})</div>
                  <div className="flex items-center gap-1.5 text-amber-300">
                    <span className="text-stone-500 font-sans">Preferred Chat Platform:</span>{' '}
                    <span className="font-bold uppercase px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px]">
                      {preferredContactMode === 'whatsapp' ? '💬 WhatsApp' :
                       preferredContactMode === 'facebook' ? '🔵 Facebook Messenger' :
                       preferredContactMode === 'instagram' ? '📸 Instagram DM' : '📱 SMS (Text)'}
                    </span>
                    {preferredContactHandle && (
                      <span className="text-stone-400 font-mono text-[11px]">({preferredContactHandle})</span>
                    )}
                  </div>
                  <div><span className="text-stone-500 font-sans">Pickup Schedule:</span> {startDate} at {startTime}</div>
                  <div><span className="text-stone-500 font-sans">Depot:</span> {pickupLocation}</div>
                  
                  {facebookAlertsPermitted && (
                    <div className="text-blue-400 font-sans flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                      <span>Facebook Alerts & Booking Copies Active (1-hr Return Notice Enabled)</span>
                    </div>
                  )}

                  {paymentProofUrl && (
                    <div className="text-emerald-400 font-sans flex items-center gap-1.5 text-[11px]">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Payment Transfer Confirmation Attached (Ref: {gcashReferenceNumber || 'Verified'})</span>
                    </div>
                  )}

                  {appliedPromo && (
                    <div className="text-emerald-400"><span className="text-stone-500 font-sans">Promo Applied:</span> {appliedPromo} (-₱{discountAmount.toLocaleString()})</div>
                  )}
                  <div className="font-bold text-stone-100 pt-1 border-t border-stone-800"><span className="text-stone-500 font-sans">Total:</span> ₱{grandTotal.toLocaleString()} (Includes ₱{securityDeposit.toLocaleString()} deposit)</div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                  <button
                    onClick={() => {
                      if (createdReservation) setPreviewingReservation(createdReservation);
                      setShowEmailPreview(true);
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-stone-200 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>Preview Email (with Pickup Button)</span>
                  </button>

                  <button
                    onClick={() => {
                      if (createdReservation) {
                        setSelectedReservationForPickup(createdReservation);
                      }
                      setIsBookingOpen(false);
                      setActiveTab('pickups');
                    }}
                    className="w-full sm:w-auto px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>Start Pickup Now ➔</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsBookingOpen(false);
                      setCustomerSubTab('lookup');
                      if (confirmedBookingRef) setLookupQuery(confirmedBookingRef);
                    }}
                    className="w-full sm:w-auto px-3.5 py-2 text-xs text-stone-400 hover:text-white"
                  >
                    View in My Reservations
                  </button>
                </div>
              </div>
            ) : (
              /* Steps 1 & 2 */
              <form onSubmit={handleConfirmReservation} className="p-6 space-y-5 text-xs max-h-[80vh] overflow-y-auto">
                {/* Demo Quick-Fill Top Button */}
                <div className="p-2.5 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-between text-xs">
                  <span className="text-amber-300">
                    Testing as a customer? <strong>Fast 1-click test fill:</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickFillDemo}
                    className="px-3 py-1 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded text-[11px] shadow-sm transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Autofill Juan Dela Cruz</span>
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-stone-400 pb-2 border-b border-stone-800">
                  <span>Step {step} of 2</span>
                  <span>{step === 1 ? 'Schedule & Driver License Verification' : 'Facebook Auth, Alerts & Payment'}</span>
                </div>

                {step === 1 ? (
                  <>
                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-stone-400 mb-1">Pick Up Date</label>
                        <input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-100 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-400 mb-1">Pickup Time</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-100 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-400 mb-1">Return Date</label>
                        <input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-100 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-stone-400 mb-1">Return Time</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => setEndTime(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-100 font-mono text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-stone-400">Nominated Pickup Location (Google Maps Pinned)</label>
                        <span className="text-[10px] text-amber-400 font-mono">Pinned Coordinates</span>
                      </div>
                      <select
                        value={pickupLocation}
                        onChange={(e) => setPickupLocation(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded text-stone-100 text-xs font-medium"
                      >
                        {(currentBusiness.customization?.nominatedPickupLocations || INITIAL_NOMINATED_LOCATIONS).map((loc) => (
                          <option key={loc.id} value={`${loc.name} (${loc.landmark})`}>
                            {loc.name} - {loc.landmark} {loc.deliveryFee > 0 ? `(+${formatPrice(loc.deliveryFee, currency)})` : '(Free HQ)'}
                          </option>
                        ))}
                      </select>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-stone-400">
                        <span>Selected Hub: <strong className="text-stone-200">{pickupLocation}</strong></span>
                        <a
                          href={`https://maps.google.com/?q=${encodeURIComponent(pickupLocation + ' Zambales')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" />
                          <span>View on Google Maps</span>
                        </a>
                      </div>

                      {(() => {
                        const allLocs = currentBusiness.customization?.nominatedPickupLocations || INITIAL_NOMINATED_LOCATIONS;
                        const matchedDepot = allLocs.find(l => 
                          pickupLocation.toLowerCase().includes(l.name.toLowerCase()) ||
                          l.name.toLowerCase().includes(pickupLocation.toLowerCase())
                        );
                        if (!matchedDepot) return null;
                        return (
                          <div className="mt-2 p-2.5 rounded-lg bg-stone-900 border border-stone-800 space-y-2 text-[11px]">
                            <div className="flex items-center justify-between text-[10px] text-amber-400 font-mono">
                              <span className="font-bold uppercase tracking-wider flex items-center gap-1">
                                <Building2 className="w-3 h-3" />
                                <span>Depot Contact & Facility Schedule</span>
                              </span>
                              {matchedDepot.isDepotHQ && (
                                <span className="bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px]">Primary HQ</span>
                              )}
                            </div>
                            
                            {matchedDepot.contactStaff && (
                              <div className="flex items-center justify-between bg-stone-950 p-2 rounded border border-stone-800/80">
                                <div>
                                  <div className="text-stone-200 font-bold">{matchedDepot.contactStaff.name}</div>
                                  <div className="text-[10px] text-stone-400">{matchedDepot.contactStaff.role}</div>
                                </div>
                                <a
                                  href={`tel:${matchedDepot.contactStaff.mobile}`}
                                  className="text-amber-400 font-mono text-[10px] flex items-center gap-1 bg-amber-400/10 hover:bg-amber-400/20 px-2 py-1 rounded border border-amber-400/30"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{matchedDepot.contactStaff.mobile}</span>
                                </a>
                              </div>
                            )}

                            {matchedDepot.timingsSchedule && (
                              <div className="text-[10px] text-stone-300 flex items-start gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                                <span>{matchedDepot.timingsSchedule}</span>
                              </div>
                            )}

                            {matchedDepot.photos && matchedDepot.photos.length > 0 && (
                              <div>
                                <span className="text-[10px] text-stone-400 block mb-1">Depot Photos (Premises & Bays):</span>
                                <div className="flex gap-2 overflow-x-auto pb-1">
                                  {matchedDepot.photos.map((ph, idx) => (
                                    <img
                                      key={idx}
                                      src={ph}
                                      alt={`Depot ${idx + 1}`}
                                      className="w-14 h-14 rounded object-cover border border-stone-700 shrink-0"
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {/* Driver's License Upload with Code A / A1 check */}
                    <div className="pt-3 border-t border-stone-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-stone-200 flex items-center gap-2">
                          <Upload className="w-4 h-4 text-amber-400" />
                          <span>Upload Driver's License (Front) *</span>
                        </span>
                        {licenseValidated !== null && (
                          <span className={`text-[11px] font-mono font-bold flex items-center gap-1 ${
                            licenseValidated ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {licenseValidated ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Code A/A1 Validated</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Lacks Code A/A1</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      <p className="text-stone-400 text-xs">
                        Philippine law requires <strong>Code A or A1</strong> under DL Codes on the front of your license. We extract your name automatically.
                      </p>

                      {/* Sample Selector */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-stone-500">Click a sample license to test:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {SAMPLE_LICENSES.map((s, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectSampleLicense(s)}
                              className="p-2 rounded border border-stone-800 bg-stone-950 text-left hover:border-amber-400/60"
                            >
                              <div className="font-semibold text-stone-200 truncate">{s.name}</div>
                              <div className="text-[10px] text-stone-400 font-mono">
                                DL: {s.codes.join(', ')} ({s.valid ? 'OK' : 'Invalid'})
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* File upload */}
                      <label className="border border-dashed border-stone-700 hover:border-amber-400 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer bg-stone-950 transition-colors">
                        <Upload className="w-5 h-5 text-stone-400 mb-1" />
                        <span className="text-xs text-stone-300 font-medium">Upload photo of Driver's License front</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      {licenseImageUrl && (
                        <div className="p-3 rounded bg-stone-950 border border-stone-800 flex items-center gap-3">
                          <img src={licenseImageUrl} alt="License" className="w-24 h-16 object-contain rounded border border-stone-700 shrink-0" />
                          <div className="text-xs space-y-0.5">
                            <div><span className="text-stone-500">Extracted Name:</span> <strong className="text-amber-400">{customerName}</strong></div>
                            <div><span className="text-stone-500">DL Codes:</span> <span className="font-mono text-stone-300">[{driverLicenseCodes.join(', ')}]</span></div>
                            {licenseValidated ? (
                              <div className="text-[11px] text-emerald-400 font-medium">✓ Authorized for Motorcycle (Code A/A1)</div>
                            ) : (
                              <div className="text-[11px] text-red-400 font-medium">✗ Cannot rent: No Code A or A1 on card</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end pt-3">
                      <button
                        type="button"
                        disabled={!licenseValidated}
                        onClick={() => setStep(2)}
                        className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm flex items-center gap-1.5"
                      >
                        <span>Next: Contact, Facebook & Payment</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Step 2: Facebook Auth, Alerts Consent, Phone, Promo & Payment */}
                    <div className="space-y-4">
                      {/* Name extracted from License */}
                      <div>
                        <label className="block text-stone-400 mb-1">Renter Name (Extracted from License)</label>
                        <input
                          type="text"
                          readOnly
                          value={customerName}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded text-amber-400 font-mono font-bold text-xs"
                        />
                      </div>

                      {/* Facebook Login for Email */}
                      <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-2">
                        <label className="block text-stone-300 font-semibold">
                          Login with Facebook to retrieve your email *
                        </label>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <button
                            type="button"
                            onClick={handleFacebookLogin}
                            disabled={isConnectingFb}
                            className="px-4 py-2 text-xs font-semibold bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-lg flex items-center gap-2"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <span>{isConnectingFb ? 'Authenticating...' : isFacebookConnected ? 'Connected with Facebook ✓' : 'Login with Facebook'}</span>
                          </button>

                          {customerEmail && (
                            <span className="font-mono text-amber-400 text-xs">
                              {customerEmail}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* NEW: Facebook Page Like & Permission Checkbox (Defaulted to YES) */}
                      <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-500/30 space-y-3">
                        <div className="flex items-start gap-2.5">
                          <input
                            type="checkbox"
                            id="fbAlertsPermitted"
                            checked={facebookAlertsPermitted}
                            onChange={(e) => {
                              setFacebookAlertsPermitted(e.target.checked);
                              if (e.target.checked) setFacebookPageLiked(true);
                            }}
                            className="mt-0.5 w-4 h-4 accent-[#1877F2] rounded cursor-pointer shrink-0"
                          />
                          <label htmlFor="fbAlertsPermitted" className="text-xs text-stone-200 cursor-pointer space-y-1">
                            <div className="font-semibold text-stone-100 flex items-center gap-1.5 flex-wrap">
                              <span>Yes, I follow/like {currentBusiness.name}'s Facebook page and permit booking alerts</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-mono">
                                Default: Yes
                              </span>
                            </div>
                            <p className="text-[11px] text-stone-300 leading-relaxed">
                              With your permission, we connect with your Facebook profile to send you instant booking copies, payment confirmations, and depot pickup links:
                            </p>
                          </label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-6 text-[11px] text-stone-300">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>1-Hour Return Alerts before deadline</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Copies of reservation voucher & contract</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Electronic GCash / Bank payment receipts</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Direct link for depot pickup handover</span>
                          </div>
                        </div>

                        {/* Interactive Like / Follow Facebook Page Button */}
                        <div className="pl-6 pt-1 flex items-center gap-2.5 flex-wrap">
                          <a
                            href={currentBusiness.facebookBranding?.pageUrl || 'https://facebook.com/rideoutzambales'}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              setFacebookPageLiked(true);
                              setFacebookAlertsPermitted(true);
                              showToast(`Followed ${currentBusiness.name} on Facebook! Alerts permitted.`, 'success');
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                              facebookPageLiked 
                                ? 'bg-emerald-600/30 border border-emerald-500/40 text-emerald-300' 
                                : 'bg-[#1877F2] hover:bg-[#166fe5] text-white shadow-sm'
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>
                              {facebookPageLiked 
                                ? `Liked & Following ${currentBusiness.name} ✓` 
                                : `Like & Follow ${currentBusiness.name} on Facebook`}
                            </span>
                          </a>

                          <span className="text-[10px] text-stone-400">
                            {facebookPageLiked ? '✓ Alerts & copies enabled' : 'Click to like official FB page'}
                          </span>
                        </div>
                      </div>

                      {/* 11-digit Mobile Number */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-stone-400 font-medium">Philippine Mobile Number (11 Digits) *</label>
                          <span className={`font-mono text-[11px] font-bold ${phoneValidation.isValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {phoneValidation.cleaned.length}/11 digits
                          </span>
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={11}
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="09171234567"
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded text-stone-100 font-mono text-sm font-bold tracking-wider focus:outline-none focus:border-amber-400"
                        />
                        {!phoneValidation.isValid && customerPhone.length > 0 && (
                          <p className="mt-1 text-[11px] text-amber-400 font-mono">
                            {phoneValidation.error}
                          </p>
                        )}
                      </div>

                      {/* Renter Preferred Communication Mode (SMS, WhatsApp, Facebook, Instagram) */}
                      <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-stone-200 font-semibold flex items-center gap-1.5 text-xs">
                            <MessageSquare className="w-4 h-4 text-amber-400" />
                            <span>Where would you prefer our depot staff to speak/chat with you? *</span>
                          </label>
                          <span className="text-[10px] text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/30">
                            Preferred Channel
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-400 leading-relaxed">
                          Choose where you want our depot crew to message your pickup bay staging, PIN, fuel check, and questions:
                        </p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { id: 'sms', label: '📱 SMS', sub: 'Direct Text', activeClass: 'bg-amber-400 text-stone-950 border-amber-400 font-bold shadow-md' },
                            { id: 'whatsapp', label: '💬 WhatsApp', sub: 'Instant Chat', activeClass: 'bg-emerald-500 text-white border-emerald-400 font-bold shadow-md' },
                            { id: 'facebook', label: '🔵 Facebook', sub: 'Messenger', activeClass: 'bg-[#0084FF] text-white border-blue-400 font-bold shadow-md' },
                            { id: 'instagram', label: '📸 Instagram', sub: 'Direct Message', activeClass: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-pink-400 font-bold shadow-md' },
                          ].map(platform => (
                            <button
                              key={platform.id}
                              type="button"
                              onClick={() => {
                                setPreferredContactMode(platform.id as any);
                                if (platform.id === 'sms' || platform.id === 'whatsapp') {
                                  setPreferredContactHandle(customerPhone);
                                } else if (platform.id === 'facebook') {
                                  setPreferredContactHandle(customerName || 'Facebook Profile');
                                } else if (platform.id === 'instagram') {
                                  setPreferredContactHandle(`@${customerName ? customerName.toLowerCase().replace(/[^a-z0-9]/g, '_') : 'rider'}`);
                                }
                              }}
                              className={`p-2.5 rounded-lg border text-center transition-all ${
                                preferredContactMode === platform.id
                                  ? platform.activeClass
                                  : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                              }`}
                            >
                              <div className="font-semibold text-xs">{platform.label}</div>
                              <div className="text-[10px] opacity-80 mt-0.5">{platform.sub}</div>
                            </button>
                          ))}
                        </div>

                        {/* Handle / Phone input for selected platform */}
                        <div className="pt-1 flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="text-[11px] text-stone-400 shrink-0">
                            {preferredContactMode === 'sms' ? 'SMS Mobile Number:' :
                             preferredContactMode === 'whatsapp' ? 'WhatsApp Number:' :
                             preferredContactMode === 'facebook' ? 'Facebook Profile / Name:' :
                             'Instagram Username (@handle):'}
                          </span>
                          <input
                            type="text"
                            value={preferredContactHandle}
                            onChange={(e) => setPreferredContactHandle(e.target.value)}
                            placeholder={
                              preferredContactMode === 'sms' || preferredContactMode === 'whatsapp' ? (customerPhone || '09171234567') :
                              preferredContactMode === 'facebook' ? (customerName || 'Facebook Profile Name') :
                              '@your_instagram_handle'
                            }
                            className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded font-mono text-xs text-stone-100 focus:outline-none focus:border-amber-400"
                          />
                        </div>
                      </div>

                      {/* Promo Code Input */}
                      <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-stone-300 font-semibold flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-amber-400" />
                            <span>Have a Promo Code?</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setPromoInput('RIDEOUT15');
                              const res = validatePromoCode('RIDEOUT15', totalDays, baseSubtotal);
                              if (res.valid) {
                                setAppliedPromo('RIDEOUT15');
                                setDiscountAmount(res.discount);
                                setPromoMessage(res.message);
                              }
                            }}
                            className="text-[10px] text-amber-400 hover:underline font-mono"
                          >
                            Quick apply: RIDEOUT15 (-15%)
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                            placeholder="e.g. RIDEOUT15, ZAMBALES500"
                            className="flex-1 px-3 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-100 font-mono uppercase text-xs focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={handleApplyPromo}
                            className="px-4 py-1.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded"
                          >
                            Apply
                          </button>
                        </div>
                        {appliedPromo && (
                          <div className="text-xs text-emerald-400 font-mono">
                            ✓ Promo {appliedPromo} applied: -₱{discountAmount.toLocaleString()}
                          </div>
                        )}
                        {promoMessage && !appliedPromo && (
                          <div className="text-xs text-red-400 font-mono">
                            {promoMessage}
                          </div>
                        )}
                      </div>

                      {/* Active Add-on Services & Accessories Selection */}
                      {activeAddOnsList.length > 0 && (
                        <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-2.5">
                          <div className="flex items-center justify-between">
                            <label className="text-stone-300 font-semibold text-xs flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                              <span>Optional Add-Ons & Riding Gear</span>
                            </label>
                            <span className="text-[10px] text-stone-500 font-mono">
                              {selectedAddOns.length} selected (+₱{addOnsTotal})
                            </span>
                          </div>

                          <div className="space-y-1.5">
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
                                  <div className="flex items-center gap-2.5 truncate flex-1 pr-2">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleAddon(addon.id)}
                                      className="accent-amber-400 w-4 h-4 shrink-0"
                                    />
                                    <div className="truncate">
                                      <div className="text-xs font-semibold truncate flex items-center gap-1.5">
                                        <span>{addon.name}</span>
                                        {addon.price === 0 && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded">
                                            FREE
                                          </span>
                                        )}
                                      </div>
                                      {addon.description && (
                                        <div className="text-[10px] text-stone-400 truncate">{addon.description}</div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="font-mono text-xs font-bold text-amber-400 shrink-0">
                                    {addon.price === 0 ? '₱0' : `+₱${addon.price}`}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Payment Method */}
                      <div>
                        <label className="block text-stone-400 mb-1">Payment Method</label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded text-stone-100 text-xs"
                        >
                          <option value="GCash">GCash & Bank Transfer (₱1,000 reservation deposit)</option>
                          <option value="Credit Card">Credit / Debit Card</option>
                          <option value="Cash">Cash at {currentBusiness.name} Depot</option>
                        </select>
                      </div>

                      {/* GCash & Bank Transfer Payment Drawer with Transfer Confirmation Slip Upload */}
                      {paymentMethod === 'GCash' && (
                        <GCashCheckoutCard
                          gcashConfig={currentBusiness.gcashConfig}
                          amount={1000}
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

                      {/* Itemized Price Breakdown */}
                      <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-2 font-mono text-xs">
                        <div className="flex justify-between text-stone-400">
                          <span>{totalDays} days × ₱{dailyRate.toLocaleString()}</span>
                          <span>₱{baseSubtotal.toLocaleString()}</span>
                        </div>

                        {/* Smart Dynamic Pricing Badges & Savings */}
                        {smartPricingResult.isSmartPricingActive && (
                          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-1 font-sans">
                            <div className="flex items-center justify-between text-emerald-400 font-bold text-xs">
                              <span className="flex items-center gap-1.5">
                                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                                <span>Smart Dynamic Pricing Applied:</span>
                              </span>
                              <span className="font-mono">-₱{smartDiscountAmount.toLocaleString()}</span>
                            </div>
                            {smartPricingResult.explanationBadges.map((badge, idx) => (
                              <div key={idx} className="text-[10px] text-stone-300 flex justify-between">
                                <span>• {badge.title}:</span>
                                <span className="font-mono text-emerald-400">-₱{badge.savings.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {addOnsTotal > 0 && (
                          <div className="flex justify-between text-stone-300">
                            <span>Selected Add-ons ({selectedAddOns.length}):</span>
                            <span>+₱{addOnsTotal.toLocaleString()}</span>
                          </div>
                        )}
                        {discountAmount > 0 && (
                          <div className="flex justify-between text-emerald-400">
                            <span>Promo Code Discount ({appliedPromo}):</span>
                            <span>-₱{discountAmount.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-stone-400">
                          <span>Refundable Security Deposit:</span>
                          <span className="text-amber-400">₱{securityDeposit.toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-stone-100 text-sm">
                          <span>Total Amount:</span>
                          <span className="text-amber-400">₱{grandTotal.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={!phoneValidation.isValid || !customerEmail}
                        className="px-6 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg shadow-sm"
                      >
                        Submit Reservation
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}

      {/* Email Confirmation Modal Preview with Direct Pickup Action */}
      {showEmailPreview && previewingReservation && (
        <EmailConfirmationModal
          reservation={previewingReservation}
          bike={bikes.find((b) => b.id === previewingReservation.bikeId) || selectedBike || undefined}
          onClose={() => setShowEmailPreview(false)}
          onStartPickup={(res) => {
            setShowEmailPreview(false);
            setIsBookingOpen(false);
            setSelectedReservationForPickup(res);
            setActiveTab('pickups');
          }}
        />
      )}

      {/* Zoom Modal for Attached Transfer Confirmation in Lookup Pass */}
      {isZoomedLookupProof && activeLookupRes?.paymentProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative max-w-md w-full bg-stone-950 p-6 rounded-2xl border border-stone-800 text-center space-y-4">
            <button
              onClick={() => setIsZoomedLookupProof(false)}
              className="absolute top-3 right-3 p-1.5 text-stone-400 hover:text-white rounded-lg bg-stone-900"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-sm font-bold text-stone-100 flex items-center justify-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              <span>Attached Transfer Confirmation Slip</span>
            </div>
            <div className="p-2 bg-stone-900 rounded-xl shadow-xl mx-auto max-w-[340px] max-h-[70vh] overflow-y-auto">
              <img 
                src={activeLookupRes.paymentProofUrl} 
                alt="Zoomed Proof of Payment" 
                className="w-full h-auto object-contain rounded-lg" 
              />
            </div>
            <div className="space-y-0.5 text-xs font-mono">
              <div className="text-emerald-400 font-bold">Ref: {activeLookupRes.gcashReferenceNumber || 'Verified'}</div>
              {activeLookupRes.payerAccountName && (
                <div className="text-stone-300">{activeLookupRes.payerAccountName}</div>
              )}
            </div>
            <button
              onClick={() => setIsZoomedLookupProof(false)}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Renter GPS Radar & Social Proximity Notification Modal */}
      {showLocationRadarModal && activeLookupRes && (
        <RenterLocationRadarModal
          reservation={activeLookupRes}
          onClose={() => setShowLocationRadarModal(false)}
        />
      )}
    </div>
  );
};
