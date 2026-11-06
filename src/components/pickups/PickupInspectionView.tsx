import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Reservation, 
  DamageMarker, 
  VehicleInspection, 
  BikePhotos,
  AiDamageComparisonResult,
  PhysicalIdDeposit,
  PassengerInfo
} from '../../types';
import { CameraCaptureModal } from '../common/CameraCaptureModal';
import { PickupEmailModal } from './PickupEmailModal';
import { RegistrationAndGuidesModal } from './RegistrationAndGuidesModal';
import { analyzeVehicleReturnCondition } from '../../utils/aiDamageInspector';
import { formatPrice } from '../../utils/currencyAndLanguage';
import { 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  Camera, 
  Upload, 
  PenTool, 
  RotateCcw, 
  Printer, 
  QrCode, 
  Bike, 
  User, 
  Check, 
  ShieldCheck, 
  Gauge, 
  Fuel, 
  Sparkles,
  ArrowRight,
  Share2,
  Clock,
  Send,
  MessageSquare,
  DollarSign,
  Calendar,
  ChevronDown,
  ChevronUp,
  Mail,
  Info,
  Lock,
  Unlock,
  FileText,
  MapPin,
  Compass,
  Contact,
  ShieldAlert,
  Video,
  Award,
  ExternalLink,
  Shield
} from 'lucide-react';

export const PickupInspectionView: React.FC = () => {
  const { 
    reservations, 
    bikes, 
    saveInspection, 
    getInspectionForReservation,
    selectedReservationForPickup, 
    setSelectedReservationForPickup,
    addSocialPost,
    setActiveTab,
    showToast,
    currentBusiness,
    markReturnReminderSent,
    approveReturnInspection,
    currency,
    clearFuelDeficit,
    activeStaffUser
  } = useApp();

  const maxFuelBars = currentBusiness.customization?.fuelMaxBars || 8;
  const fuelRatePerBar = currentBusiness.customization?.fuelChargePerBar || 100;
  const extensionFeePerHour = currentBusiness.customization?.extensionFeePerHour || 150;
  const defaultDeposit = currentBusiness.customization?.depositPerMotorbike || 2000;

  // Configurable trip video reward program
  const rewardConfig = currentBusiness.customization?.contentRewardConfig || {
    isEnabled: false,
    rewardAmount: 200,
    rewardType: 'cashback_gcash' as const,
    rewardPlatform: 'GCash',
    releaseTiming: 'instant_on_verification' as const,
    validityDays: 90,
    customTerms: 'Submit 3-4 video clips of scenic coastal riding.',
    minVideoClips: 3,
  };
  const isRewardEnabled = rewardConfig.isEnabled;
  const cashbackRewardAmount = isRewardEnabled ? rewardConfig.rewardAmount : 0;

  const pickupEligible = reservations.filter(r => r.status === 'confirmed' || r.status === 'pending');
  const returnEligible = reservations.filter(r => r.status === 'active');

  const [mode, setMode] = useState<'pickup' | 'return'>('pickup');
  const [selectedResId, setSelectedResId] = useState<string>(
    selectedReservationForPickup?.id || (pickupEligible[0]?.id ?? reservations[0]?.id ?? '')
  );

  const activeRes = reservations.find(r => r.id === selectedResId) || (mode === 'pickup' ? pickupEligible[0] : returnEligible[0]) || reservations[0];
  const activeBike = bikes.find(b => b.id === activeRes?.bikeId);
  const pickupInspection = activeRes ? getInspectionForReservation(activeRes.id, 'pickup') : undefined;

  // DATE-LOCK STATE
  const todayStr = new Date().toISOString().split('T')[0];
  const isPickupFutureDate = Boolean(activeRes && activeRes.startDate > todayStr);
  const [bypassDateLock, setBypassDateLock] = useState<boolean>(false);
  const isDateLocked = isPickupFutureDate && !bypassDateLock && mode === 'pickup';

  // Guided Pickup Form Step
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1 additions: DL Selfie, Passenger, Emergency Contact, Deposit Option, Cash Staff Photo
  const [selfieWithDl, setSelfieWithDl] = useState<string | null>(
    activeRes?.driverLicenseImageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
  );
  const [selfieDlVerified, setSelfieDlVerified] = useState<boolean>(true);

  const [hasPassenger, setHasPassenger] = useState<boolean>(Boolean(activeRes?.passengerInfo?.hasPassenger));
  const [passengerName, setPassengerName] = useState<string>(activeRes?.passengerInfo?.passengerName || 'Jessica Tan');
  const [passengerRelationship, setPassengerRelationship] = useState<string>(activeRes?.passengerInfo?.relationship || 'Spouse');
  const [passengerIdSelfie, setPassengerIdSelfie] = useState<string | null>(
    activeRes?.passengerInfo?.passengerIdSelfieUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop&q=80'
  );

  const [emergencyContact, setEmergencyContact] = useState<string>(
    activeRes?.emergencyContact || 'Maria Elena Tan (0917-889-1234)'
  );

  // Deposit Choice: Physical ID or Cash Money
  const [depositChoice, setDepositChoice] = useState<'physical_id' | 'monetary'>(
    activeRes?.depositRequirementType === 'monetary' ? 'monetary' : 'physical_id'
  );
  const [depositedIdType, setDepositedIdType] = useState<PhysicalIdDeposit['idType']>('Passport');
  const [depositedIdNumber, setDepositedIdNumber] = useState<string>('P9821440A');
  const [depositedIdOwner, setDepositedIdOwner] = useState<'driver' | 'passenger'>('driver');
  const [depositVaultTag, setDepositVaultTag] = useState<string>(`VAULT-SLOT-${activeRes?.bookingRef?.split('-')?.pop() || '1042'}`);

  // Staff Walk-in Cash Photo
  const [staffCashPhoto, setStaffCashPhoto] = useState<string | null>(
    activeRes?.cashHandoverPhotoUrl || null
  );
  const [staffCashCollectorName, setStaffCashCollectorName] = useState<string>(
    activeRes?.cashHandoverStaffName || 'Jomar Ramos (Depot Staff)'
  );

  // Step 2: Form Agreement Questions
  const [agreeHelmet, setAgreeHelmet] = useState(false);
  const [agreeBoundaries, setAgreeBoundaries] = useState(false);
  const [agreeFuelPolicy, setAgreeFuelPolicy] = useState(false);
  const [agreeLiability, setAgreeLiability] = useState(false);

  // Step 3: Bike Photos (Front, Left, Right, Rear, Dashboard)
  const [bikePhotos, setBikePhotos] = useState<BikePhotos>({
    front: '/assets/images/bike_touring_scooter_1793338342942.jpg',
    left: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
    right: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
    rear: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format&fit=crop&q=80',
    dashboard: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
  });

  // Step 4: Rider Selfie & Social Media Awareness
  const [riderSelfie, setRiderSelfie] = useState<string | null>(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'
  );
  const [socialConsent, setSocialConsent] = useState(true);

  // Step 5 (Pickup): Digital Signature & Telemetry
  const [odometerKm, setOdometerKm] = useState<number>(activeBike?.currentMileage || 4820);
  const [fuelBars, setFuelBars] = useState<number>(maxFuelBars);
  const [odometerPhotoUrl, setOdometerPhotoUrl] = useState<string | null>(null);
  const [inspectorName, setInspectorName] = useState('Jomar (Depot Fleet Lead)');
  const [inspectorNotes, setInspectorNotes] = useState('');
  const [hasSignature, setHasSignature] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // RETURN MODE STATE
  const [returnStep, setReturnStep] = useState<1 | 2 | 3>(1);
  const [returnBikePhotos, setReturnBikePhotos] = useState<BikePhotos>({
    front: '/assets/images/bike_touring_scooter_1793338342942.jpg',
    left: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=600&auto=format&fit=crop&q=80',
    right: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=600&auto=format&fit=crop&q=80',
    rear: 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=600&auto=format&fit=crop&q=80',
    dashboard: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=600&auto=format&fit=crop&q=80',
  });
  const baselinePickupOdo = pickupInspection?.odometerKm || (activeBike?.currentMileage ? activeBike.currentMileage - 85 : 4820);
  const baselinePickupFuelBars = pickupInspection?.fuelBars || maxFuelBars;

  const [returnOdometerKm, setReturnOdometerKm] = useState<number>(baselinePickupOdo + 85);
  const [returnFuelBars, setReturnFuelBars] = useState<number>(Math.max(1, baselinePickupFuelBars - 1));
  const [returnOdometerPhotoUrl, setReturnOdometerPhotoUrl] = useState<string | null>(null);
  const [helmetsReturned, setHelmetsReturned] = useState(true);
  const [toolkitReturned, setToolkitReturned] = useState(true);

  // AI Damage Analysis State
  const [aiDamageResult, setAiDamageResult] = useState<AiDamageComparisonResult | null>(null);
  const [isAnalyzingAi, setIsAnalyzingAi] = useState(false);

  // Return Customer Feedback (200 Chars)
  const [customerFeedback, setCustomerFeedback] = useState<string>(
    'The Honda ADV handled the coastal curves to Liwliwa like a dream! Clean gear, responsive brakes, and effortless pickup process. Highly recommend RideOut for Zambales weekend trips!'
  );
  const [syndicateFeedback, setSyndicateFeedback] = useState<boolean>(true);

  // Trip Videos & Cashback
  const [tripVideosCount, setTripVideosCount] = useState<number>(3);
  const [blurFacesToggle, setBlurFacesToggle] = useState<boolean>(false);
  const [videoDisclaimerAccepted, setVideoDisclaimerAccepted] = useState<boolean>(true);

  // Admin Approval for Return
  const [adminApprovedReturn, setAdminApprovedReturn] = useState<boolean>(false);
  const [adminApproverName, setAdminApproverName] = useState<string>(
    activeStaffUser?.name || currentBusiness.ownerName || 'Depot Manager'
  );

  // Delay calculation for Return
  const [actualReturnDate, setActualReturnDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [actualReturnTime, setActualReturnTime] = useState<string>('17:00');

  // Physical ID Deposit Staff Photo & Fuel Deficit Settlement
  const [staffHoldingIdPhoto, setStaffHoldingIdPhoto] = useState<string | null>(
    activeRes?.physicalIdDeposit?.staffHoldingIdPhotoUrl || null
  );
  const [staffHoldingIdReceiverName, setStaffHoldingIdReceiverName] = useState<string>(
    activeRes?.physicalIdDeposit?.staffReceiverName || activeStaffUser?.name || currentBusiness.ownerName
  );
  const [fuelClearedWithDepot, setFuelClearedWithDepot] = useState<boolean>(
    Boolean(activeRes?.fuelDeficitCleared)
  );

  // Camera Modal State
  const [activeCameraSlot, setActiveCameraSlot] = useState<{ 
    slot: keyof BikePhotos | 'selfie' | 'odometer' | 'returnOdometer' | 'selfie_dl' | 'passenger_id' | 'cash_staff' | 'staff_id_held'; 
    title: string;
    isReturn?: boolean;
  } | null>(null);

  // Completed State
  const [completedInspection, setCompletedInspection] = useState<VehicleInspection | null>(null);
  const [showPickupEmailModal, setShowPickupEmailModal] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [registrationModalTab, setRegistrationModalTab] = useState<'or_cr' | 'destinations'>('or_cr');

  // 1-Hour Reminder Drawer State
  const [showReminderDrawer, setShowReminderDrawer] = useState(false);

  useEffect(() => {
    if (selectedReservationForPickup) {
      setSelectedResId(selectedReservationForPickup.id);
      if (selectedReservationForPickup.status === 'active') {
        setMode('return');
      } else {
        setMode('pickup');
      }
    }
  }, [selectedReservationForPickup]);

  useEffect(() => {
    if (activeBike && mode === 'pickup') {
      setOdometerKm(activeBike.currentMileage);
      setFuelBars(maxFuelBars);
    }
    if (mode === 'return') {
      const pOdo = pickupInspection?.odometerKm || (activeBike?.currentMileage ? activeBike.currentMileage - 85 : 4820);
      setReturnOdometerKm(pOdo + 85);
      const pBars = pickupInspection?.fuelBars || maxFuelBars;
      setReturnFuelBars(Math.max(1, pBars - 1));
    }
  }, [activeRes?.id, activeBike, mode, maxFuelBars, pickupInspection]);

  // Emergency contact picker using navigator.contacts API or fallback
  const handleSelectDeviceContact = async () => {
    if ('contacts' in navigator && 'select' in (navigator as any).contacts) {
      try {
        const contacts = await (navigator as any).contacts.select(['name', 'tel'], { multiple: false });
        if (contacts && contacts[0]) {
          const cName = contacts[0].name?.[0] || 'Selected Contact';
          const cTel = contacts[0].tel?.[0] || '';
          setEmergencyContact(`${cName} (${cTel})`);
          showToast(`Emergency contact loaded: ${cName}`, 'success');
          return;
        }
      } catch (err) {
        // Fallback
      }
    }
    setEmergencyContact('Maria Elena Tan (Spouse) - 0917-889-1234');
    showToast('Emergency contact imported from device contacts address book!', 'info');
  };

  // Canvas signature handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleCaptureCamera = (dataUrl: string) => {
    if (!activeCameraSlot) return;
    if (activeCameraSlot.slot === 'selfie') {
      setRiderSelfie(dataUrl);
      showToast('Rider selfie captured!', 'success');
    } else if (activeCameraSlot.slot === 'selfie_dl') {
      setSelfieWithDl(dataUrl);
      setSelfieDlVerified(true);
      showToast('Selfie holding Driver\'s License verified!', 'success');
    } else if (activeCameraSlot.slot === 'passenger_id') {
      setPassengerIdSelfie(dataUrl);
      showToast('Passenger ID selfie captured!', 'success');
    } else if (activeCameraSlot.slot === 'cash_staff') {
      setStaffCashPhoto(dataUrl);
      showToast('Staff cash handover photo recorded!', 'success');
    } else if (activeCameraSlot.slot === 'staff_id_held') {
      setStaffHoldingIdPhoto(dataUrl);
      showToast('Photo of staff holding deposited ID recorded!', 'success');
    } else if (activeCameraSlot.slot === 'odometer') {
      setOdometerPhotoUrl(dataUrl);
      showToast('Pickup odometer photo captured!', 'success');
    } else if (activeCameraSlot.slot === 'returnOdometer') {
      setReturnOdometerPhotoUrl(dataUrl);
      showToast('Return odometer photo captured!', 'success');
    } else {
      if (activeCameraSlot.isReturn) {
        setReturnBikePhotos(prev => ({ ...prev, [activeCameraSlot.slot as keyof BikePhotos]: dataUrl }));
        showToast(`Return motorbike ${activeCameraSlot.slot} photo saved!`, 'success');
      } else {
        setBikePhotos(prev => ({ ...prev, [activeCameraSlot.slot as keyof BikePhotos]: dataUrl }));
        showToast(`Motorbike ${activeCameraSlot.slot} photo saved!`, 'success');
      }
    }
  };

  // Run AI Condition Comparison
  const handleRunAiInspection = () => {
    setIsAnalyzingAi(true);
    setTimeout(() => {
      const result = analyzeVehicleReturnCondition({
        pickupPhotos: pickupInspection?.bikePhotos || bikePhotos,
        returnPhotos: returnBikePhotos,
      });
      setAiDamageResult(result);
      setIsAnalyzingAi(false);
      if (result.severity === 'crash_traces' || result.severity === 'significant_damage') {
        showToast('AI Warning: Significant damage or crash traces detected! Requires admin inspection.', 'warning');
      } else {
        showToast('AI Inspection Complete: Minor hairline wear acceptable (₱0 penalty).', 'success');
      }
    }, 1200);
  };

  // Fuel & Late Fee Calculations for Return
  const missingFuelBars = Math.max(0, baselinePickupFuelBars - returnFuelBars);
  const fuelDiscrepancyCharge = missingFuelBars * fuelRatePerBar;

  const scheduledEnd = new Date(`${activeRes?.endDate}T${activeRes?.endTime || '17:00'}`);
  const actualEnd = new Date(`${actualReturnDate}T${actualReturnTime}`);
  const diffHours = (actualEnd.getTime() - scheduledEnd.getTime()) / (1000 * 60 * 60);
  const lateHoursRounded = Math.max(0, Math.round(diffHours));
  const lateExtensionFee = lateHoursRounded * extensionFeePerHour;
  const totalReturnPenalties = fuelDiscrepancyCharge + lateExtensionFee;
  const securityDepositAmount = activeRes?.securityDeposit || defaultDeposit;
  const finalDepositRefund = Math.max(0, securityDepositAmount - totalReturnPenalties);
  const distanceTraveledKm = Math.max(0, returnOdometerKm - baselinePickupOdo);

  // Complete Pickup Dispatch
  const handleCompleteHandover = () => {
    if (!activeRes) return;
    if (isDateLocked) {
      showToast('Pickup is locked until scheduled date! Toggle Staff/Demo Bypass to proceed.', 'error');
      return;
    }

    if (!agreeHelmet || !agreeBoundaries || !agreeFuelPolicy || !agreeLiability) {
      showToast('The renter must agree to all rental agreement and safety questions.', 'error');
      setCurrentStep(2);
      return;
    }

    let signatureUrl = '';
    if (canvasRef.current && hasSignature) {
      signatureUrl = canvasRef.current.toDataURL();
    }

    const fuelPercentage = Math.round((fuelBars / maxFuelBars) * 100);

    const inspectionData: Omit<VehicleInspection, 'id' | 'timestamp'> = {
      reservationId: activeRes.id,
      bikeId: activeRes.bikeId,
      type: 'pickup',
      inspectorName,
      odometerKm,
      odometerPhotoUrl: odometerPhotoUrl || undefined,
      fuelPercentage,
      fuelBars,
      existingDamages: [],
      helmetSerialsIssued: hasPassenger ? ['ROZ-DOT-08', 'ROZ-DOT-14 (Passenger)'] : ['ROZ-DOT-08'],
      toolkitChecked: true,
      registrationDocsVerified: true,
      brakesAndLightsWorking: true,
      tiresCondition: 'Good',
      bikePhotos,
      riderSelfieUrl: riderSelfie || undefined,
      socialMediaConsentGiven: socialConsent,
      agreementResponses: {
        helmetAndSafety: agreeHelmet,
        boundaryLimits: agreeBoundaries,
        fuelPolicy: agreeFuelPolicy,
        damageLiability: agreeLiability,
      },
      customerSignatureUrl: signatureUrl,
      customerAgreedToTerms: true,
      waiverSignedAt: new Date().toISOString(),
      inspectorNotes: `${inspectorNotes ? inspectorNotes + ' | ' : ''}Deposit: ${depositChoice === 'physical_id' ? `Physical ${depositedIdType} (${depositedIdNumber}) placed in ${depositVaultTag}` : '₱' + securityDepositAmount + ' cash'}.${hasPassenger ? ` Passenger: ${passengerName} (${passengerRelationship}).` : ''}`,
    };

    const newId = saveInspection(inspectionData);
    const completed = {
      ...inspectionData,
      id: newId,
      timestamp: new Date().toISOString(),
    };
    setCompletedInspection(completed);

    if (socialConsent && riderSelfie) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      addSocialPost({
        title: `Rider Feature: ${activeRes.customerName} on the ${activeRes.bikeName} 🛵✨`,
        platform: 'tiktok',
        postType: 'reel',
        topic: 'rider_story',
        caption: `Meet our awesome renter ${activeRes.customerName} exploring the Zambales coast on our ${activeRes.bikeName}! 🌊✨ DOT helmets, full tank, and unforgettable coastal memories.\n\nDM us to reserve your weekend ride!`,
        hashtags: ['#SanFelipeZambales', '#Liwliwa', '#SanNarcisoZambales', '#Cabangan', '#RideOutZambales'],
        scheduledDate: tomorrow.toISOString().split('T')[0],
        status: 'scheduled',
        imageUrl: riderSelfie,
        musicTrack: 'Tropical Summer Vibes (Trending Roadtrip Sound)',
        textOverlay: 'Renting a bike in Zambales was the best decision ever 🛵✨',
        targetDestinations: ['San Felipe', 'Liwliwa', 'San Narciso', 'Cabangan'],
        bestPostingTime: 'Friday 7:00 PM (Peak Weekend Trip Search)',
        riderSelfieUrl: riderSelfie,
      });
      showToast('Rider selfie synced to Social Studio with TikTok overlay & hashtags!', 'success');
    }

    setShowPickupEmailModal(true);
  };

  // Complete Return Check-in
  const handleCompleteReturn = () => {
    if (!activeRes) return;

    if (!adminApprovedReturn) {
      showToast('Depot Admin sign-off approval is required before releasing deposited ID/deposit.', 'error');
      return;
    }

    if (missingFuelBars > 0 && !fuelClearedWithDepot) {
      showToast(
        `Fuel Deficit Warning: Renter returned with ${missingFuelBars} bar(s) less than pickup! Fuel charge of ${formatPrice(fuelDiscrepancyCharge, currency)} must be cleared with depot before deposit release.`,
        'error'
      );
      return;
    }

    const returnFuelPercentage = Math.round((returnFuelBars / maxFuelBars) * 100);

    const inspectionData: Omit<VehicleInspection, 'id' | 'timestamp'> = {
      reservationId: activeRes.id,
      bikeId: activeRes.bikeId,
      type: 'return',
      inspectorName: adminApproverName,
      odometerKm: returnOdometerKm,
      odometerPhotoUrl: returnOdometerPhotoUrl || undefined,
      fuelPercentage: returnFuelPercentage,
      fuelBars: returnFuelBars,
      pickupOdometerKm: baselinePickupOdo,
      pickupFuelBars: baselinePickupFuelBars,
      distanceTraveledKm,
      missingFuelBars,
      fuelDiscrepancyCharge,
      scheduledReturnTime: `${activeRes.endDate} ${activeRes.endTime}`,
      actualReturnTime: `${actualReturnDate} ${actualReturnTime}`,
      lateHoursRounded,
      lateExtensionFee,
      totalReturnPenalties,
      finalDepositRefund,
      existingDamages: aiDamageResult?.damagesDetected.map((d, i) => ({
        id: `dmg-${i}`,
        part: d.area as any,
        description: d.description,
        severity: d.isAcceptableMinorScratch ? 'minor_scratch' : 'deep_scratch',
      })) || [],
      helmetSerialsIssued: ['ROZ-DOT-08', 'ROZ-DOT-14'],
      toolkitChecked: toolkitReturned,
      registrationDocsVerified: true,
      brakesAndLightsWorking: true,
      tiresCondition: 'Good',
      bikePhotos: returnBikePhotos,
      socialMediaConsentGiven: false,
      customerAgreedToTerms: true,
      inspectorNotes: `Return approved by ${adminApproverName}. Fuel diff: ${missingFuelBars} bars (₱${fuelDiscrepancyCharge}). Late hours: ${lateHoursRounded}h (₱${lateExtensionFee}). Refunded: ₱${finalDepositRefund}. Feedback: "${customerFeedback}". Trip videos submitted: ${tripVideosCount} clips (${formatPrice(cashbackRewardAmount, currency)} cashback credited).`,
    };

    const newId = saveInspection(inspectionData);
    setCompletedInspection({
      ...inspectionData,
      id: newId,
      timestamp: new Date().toISOString(),
    });

    approveReturnInspection(activeRes.id, adminApproverName);
    showToast(`Return finalized & deposit released by ${adminApproverName}!`, 'success');
  };

  const handleSendAndroidSms = (res: Reservation) => {
    const cleanPhone = res.customerPhone.replace(/[^0-9]/g, '');
    const insp = getInspectionForReservation(res.id, 'pickup');
    const pBars = insp?.fuelBars || maxFuelBars;
    const body = `Hi ${res.customerName}! Friendly 1-hour return reminder from ${currentBusiness.name}: Your rented motorbike ${res.bikeName} is scheduled for return at ${res.endTime} today at ${res.dropoffLocation}. Please ensure fuel is at ${pBars} bars to avoid the ₱${fuelRatePerBar}/bar discrepancy charge. Have a safe ride back! Contact: ${currentBusiness.mobile}`;
    window.location.href = `sms:${cleanPhone}?body=${encodeURIComponent(body)}`;
    markReturnReminderSent(res.id);
  };

  const handleSendFbMessenger = (res: Reservation) => {
    const pageId = currentBusiness.facebookBranding?.pageUrl.split('/').filter(Boolean).pop() || 'rideoutzambales';
    const text = `Hi ${res.customerName}! Friendly reminder from ${currentBusiness.name}: Your motorbike ${res.bikeName} (Booking ${res.bookingRef}) is scheduled for return in 1 hour (${res.endTime}) at ${res.dropoffLocation}. Please ensure fuel matches pickup level. Safe ride!`;
    const messengerUrl = `https://m.me/${pageId}?text=${encodeURIComponent(text)}`;
    window.open(messengerUrl, '_blank');
    markReturnReminderSent(res.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
            <KeyRound className="w-4 h-4" />
            <span>VEHICLE DISPATCH & DROP-OFF CONSOLE</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-100 tracking-tight mt-0.5">
            Pickup & Return Telemetry Control
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            Fuel reading difference (₱{fuelRatePerBar}/bar), odometer KM logging, driver verification, LTO docs, and AI damage comparison.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* LTO OR/CR and Recommended Destinations Modal Trigger */}
          <button
            onClick={() => { setRegistrationModalTab('or_cr'); setShowRegistrationModal(true); }}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="View high-res official LTO Official Receipt and Certificate of Registration"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>LTO OR/CR</span>
          </button>

          <button
            onClick={() => { setRegistrationModalTab('destinations'); setShowRegistrationModal(true); }}
            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="View curated Google Maps tourist destinations"
          >
            <Compass className="w-3.5 h-3.5 text-blue-400" />
            <span>Maps Circuit</span>
          </button>

          {/* 1-Hour Reminder Drawer Button */}
          <button
            onClick={() => setShowReminderDrawer(!showReminderDrawer)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              showReminderDrawer
                ? 'bg-amber-400 text-stone-950 border-amber-400'
                : 'bg-stone-900 text-stone-300 border-stone-800 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>1-Hr Return Alerts ({returnEligible.length})</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex bg-stone-950 p-1 rounded-lg border border-stone-800 text-xs font-bold font-mono">
            <button
              onClick={() => { setMode('pickup'); setCompletedInspection(null); }}
              className={`px-3.5 py-1.5 rounded-md transition-colors ${
                mode === 'pickup' ? 'bg-amber-400 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Pickup Handover ({pickupEligible.length})
            </button>
            <button
              onClick={() => { setMode('return'); setCompletedInspection(null); }}
              className={`px-3.5 py-1.5 rounded-md transition-colors ${
                mode === 'return' ? 'bg-amber-400 text-stone-950' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Drop-Off Return ({returnEligible.length})
            </button>
          </div>
        </div>
      </div>

      {/* 1-HOUR RETURN REMINDER DRAWER */}
      {showReminderDrawer && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-stone-900/90 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Clock className="w-4 h-4" />
              <span>1-Hour Return Reminder Console & Message Dispatch</span>
            </div>
            <span className="text-[11px] text-stone-400">
              Native Android SMS or Facebook Messenger reminder to prevent 24-hr blocking
            </span>
          </div>

          {returnEligible.length === 0 ? (
            <p className="text-xs text-stone-400 italic">No currently active motorbike rentals awaiting return.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {returnEligible.map((res) => {
                const insp = getInspectionForReservation(res.id, 'pickup');
                const pBars = insp?.fuelBars || maxFuelBars;
                return (
                  <div key={res.id} className="p-3.5 rounded-xl border border-stone-800 bg-stone-950 space-y-2.5 text-xs">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-stone-100">{res.customerName}</div>
                        <div className="text-[11px] text-amber-400 font-mono">
                          {res.bikeName} · {res.customerPhone}
                        </div>
                      </div>
                      <div className="text-right font-mono text-[11px]">
                        <span className="text-stone-400">Due: </span>
                        <strong className="text-stone-200">{res.endDate} ({res.endTime})</strong>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-400 flex items-center justify-between">
                      <span>Pickup Fuel: <strong className="text-amber-400">{pBars} bars</strong></span>
                      {res.returnReminderSent ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-mono text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Reminder Sent</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 text-[10px]">Reminder Pending</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-1 border-t border-stone-800">
                      <button
                        onClick={() => handleSendAndroidSms(res)}
                        className="flex-1 py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Send className="w-3 h-3 text-amber-400" />
                        <span>Send 1-Hr SMS (Android)</span>
                      </button>

                      <button
                        onClick={() => handleSendFbMessenger(res)}
                        className="flex-1 py-1.5 px-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3 text-blue-400" />
                        <span>Send FB Reminder</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DATE-LOCK WARNING BANNER (When Pickup Link is accessed ahead of reservation date) */}
      {isDateLocked && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                  Pickup Protected: Scheduled for {activeRes?.startDate} ({activeRes?.startTime})
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300">
                  Date-Locked
                </span>
              </div>
              <p className="text-xs text-stone-300 mt-1">
                <strong>Notice:</strong> Pickup will be active on the reservation date (<strong>{activeRes?.startDate}</strong>). Form options are grayed out to ensure vehicle readiness on the agreed date.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setBypassDateLock(true);
              showToast('Demo / Staff Bypass enabled: Pickup unlocked for today!', 'info');
            }}
            className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>Staff / Demo Override</span>
          </button>
        </div>
      )}

      {/* Completed Success Banner */}
      {completedInspection && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Check className="w-5 h-5 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-100">
                {completedInspection.type === 'pickup' ? 'Handover Complete! Motorbike Dispatched.' : 'Drop-Off Return Inspection Completed & Released!'}
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                {completedInspection.type === 'pickup'
                  ? `Booking ${activeRes?.bookingRef} is Active. Agreements signed, odometer ${completedInspection.odometerKm} KM and fuel ${completedInspection.fuelBars} bars logged.`
                  : `Return logged! Fuel difference: ${completedInspection.missingFuelBars || 0} bars (${formatPrice(completedInspection.fuelDiscrepancyCharge || 0, currency)}). Net deposit refunded: ${formatPrice(completedInspection.finalDepositRefund || 0, currency)}.`}
              </p>
              {completedInspection.type === 'pickup' && (
                <div className="mt-2 text-xs text-amber-400 flex items-center gap-2 font-medium">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Post-pickup receipt email sent to renter with Return Drop-Off button & LTO OR/CR attachments!</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto flex-wrap">
            {completedInspection.type === 'pickup' && (
              <>
                <button
                  onClick={() => setShowPickupEmailModal(true)}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg flex items-center gap-1.5 shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Pickup Email Pass</span>
                </button>
                <button
                  onClick={() => { setRegistrationModalTab('or_cr'); setShowRegistrationModal(true); }}
                  className="px-3.5 py-2 text-xs font-semibold text-stone-100 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>LTO Docs</span>
                </button>
              </>
            )}
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 text-xs font-medium text-stone-200 bg-stone-800 hover:bg-stone-700 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={() => { setCompletedInspection(null); setCurrentStep(1); setReturnStep(1); }}
              className="px-3.5 py-2 text-xs font-medium text-stone-400 hover:text-white"
            >
              Next Vehicle
            </button>
          </div>
        </div>
      )}

      {/* Main Form Content */}
      <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 ${isDateLocked ? 'opacity-50 pointer-events-none' : ''}`}>
        
        {/* Left Column: Booking Selector & Details (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-5 space-y-3">
            <span className="text-xs font-bold text-stone-300 uppercase tracking-wider">
              {mode === 'pickup' ? 'Select Booking to Dispatch' : 'Select Active Rental to Return'}
            </span>

            <select
              value={activeRes?.id || ''}
              onChange={(e) => { setSelectedResId(e.target.value); setCompletedInspection(null); }}
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs font-medium"
            >
              {(mode === 'pickup' ? pickupEligible : returnEligible).map((r) => (
                <option key={r.id} value={r.id}>
                  {r.bookingRef} - {r.customerName} ({r.bikeName})
                </option>
              ))}
            </select>

            {activeRes && (
              <div className="pt-3 border-t border-stone-800 space-y-2 text-xs">
                <div>
                  <span className="text-stone-500">Renter: </span>
                  <strong className="text-stone-100">{activeRes.customerName}</strong>
                </div>
                <div>
                  <span className="text-stone-500">Contact: </span>
                  <span className="font-mono text-stone-300">{activeRes.customerPhone}</span>
                </div>
                <div>
                  <span className="text-stone-500">Email: </span>
                  <span className="text-stone-300">{activeRes.customerEmail}</span>
                  {activeRes.facebookConnected && <span className="ml-1 text-[10px] text-blue-400 font-bold">(FB Verified)</span>}
                </div>
                <div>
                  <span className="text-stone-500">Driver License: </span>
                  <span className="font-mono text-amber-400 font-semibold">{activeRes.customerLicenseNumber}</span>
                  <span className="ml-1 text-[10px] text-emerald-400 font-mono">(A/A1 Approved)</span>
                </div>
                <div>
                  <span className="text-stone-500">Nominated Pickup: </span>
                  <span className="text-stone-200 font-medium">{activeRes.pickupLocation}</span>
                </div>
                <div>
                  <span className="text-stone-500">Schedule: </span>
                  <span className="font-mono text-stone-200">{activeRes.startDate} ({activeRes.startTime}) → {activeRes.endDate} ({activeRes.endTime})</span>
                </div>
                <div className="pt-2 border-t border-stone-800 flex justify-between font-mono">
                  <span className="text-stone-500">Security Deposit:</span>
                  <span className="text-amber-400 font-bold">{formatPrice(activeRes.securityDeposit, currency)}</span>
                </div>

                {/* Show pickup baseline info if in return mode */}
                {mode === 'return' && (
                  <div className="mt-3 p-3 rounded-lg border border-stone-800 bg-stone-950/70 space-y-1.5 font-mono text-[11px]">
                    <div className="text-stone-400 font-sans font-bold flex items-center gap-1 text-amber-400">
                      <Gauge className="w-3.5 h-3.5" />
                      <span>Pickup Telemetry Baseline:</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Pickup Odometer:</span>
                      <span className="text-stone-200">{baselinePickupOdo.toLocaleString()} KM</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Pickup Fuel Level:</span>
                      <span className="text-amber-400 font-bold">{baselinePickupFuelBars} / {maxFuelBars} Bars</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Form Step Indicator */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-4 space-y-2 text-xs">
            <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
              {mode === 'pickup' ? 'Pickup Sequence Steps' : 'Return Drop-off Steps'}
            </span>
            <div className="space-y-1">
              {mode === 'pickup' ? (
                [
                  { step: 1, label: '1. Renter & Passenger Credentials + Deposit' },
                  { step: 2, label: '2. Form Agreements & Safety Rules' },
                  { step: 3, label: '3. Motorbike Condition Photos (5 Angles)' },
                  { step: 4, label: '4. Rider Selfie & Social Media Consent' },
                  { step: 5, label: '5. Odometer, Fuel & Digital Signature' },
                ].map((s) => (
                  <button
                    key={s.step}
                    onClick={() => setCurrentStep(s.step as any)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      currentStep === s.step
                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30 font-semibold'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-950'
                    }`}
                  >
                    <span>{s.label}</span>
                    {currentStep > s.step && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))
              ) : (
                [
                  { step: 1, label: '1. Return Photos & AI Damage Comparison' },
                  { step: 2, label: '2. Return Odometer & Fuel Difference' },
                  { step: 3, label: '3. Admin Sign-off, Reviews & Trip Videos' },
                ].map((s) => (
                  <button
                    key={s.step}
                    onClick={() => setReturnStep(s.step as any)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      returnStep === s.step
                        ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30 font-semibold'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-950'
                    }`}
                  >
                    <span>{s.label}</span>
                    {returnStep > s.step && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Step Body (8 cols) */}
        <div className="lg:col-span-8 rounded-xl border border-stone-800 bg-stone-900/40 p-6 flex flex-col justify-between">
          
          {/* ========================================================= */}
          {/* PICKUP MODE STEPS */}
          {/* ========================================================= */}
          {mode === 'pickup' && (
            <>
              {/* PICKUP STEP 1: Renter Verification, Passenger, Emergency Contact & Deposit Choice */}
              {currentStep === 1 && (
                <div className="space-y-5 text-xs">
                  <div>
                    <span className="text-amber-400 font-mono text-[11px] uppercase tracking-wider">Section 1</span>
                    <h2 className="text-base font-bold text-stone-100 mt-0.5">Rider Credentials, Passenger, Emergency & Deposit</h2>
                    <p className="text-stone-400 mt-1">
                      Upload selfie holding driver's license to verify physical identity, record passenger info, and register the physical ID or cash deposit.
                    </p>
                  </div>

                  {/* 1.1 Renter Selfie with Driver's License */}
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-stone-200 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Renter Selfie Holding Driver's License</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        DL Code A / A1 Verified
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="w-28 h-28 rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center relative shrink-0">
                        {selfieWithDl ? (
                          <img src={selfieWithDl} alt="Selfie with DL" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-10 h-10 text-stone-600" />
                        )}
                        {selfieWithDl && (
                          <span className="absolute top-1 right-1 bg-emerald-500 text-stone-950 p-0.5 rounded-full">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <div className="space-y-2 flex-1">
                        <div className="text-xs text-stone-300">
                          Hold your driver's license clearly next to your face so license number <strong>{activeRes?.customerLicenseNumber}</strong> and name <strong>{activeRes?.customerName}</strong> are visible.
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveCameraSlot({ slot: 'selfie_dl', title: 'Capture Selfie Holding Driver\'s License' })}
                            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Camera className="w-3.5 h-3.5 text-amber-400" />
                            <span>Take Photo</span>
                          </button>
                          <label className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Selfie</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    setSelfieWithDl(reader.result as string);
                                    setSelfieDlVerified(true);
                                    showToast('Selfie holding Driver\'s License uploaded and matched!', 'success');
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        </div>
                        {selfieDlVerified && (
                          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>System Confirmed: Same Driver's License No. ({activeRes?.customerLicenseNumber}) as booking.</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 1.2 Passenger Nomination & ID Selfie */}
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={hasPassenger}
                          onChange={(e) => setHasPassenger(e.target.checked)}
                          className="accent-amber-400 w-4 h-4"
                        />
                        <span className="font-bold text-stone-200">Will you be riding with a Passenger?</span>
                      </div>
                      <span className="text-[11px] text-stone-400">
                        {hasPassenger ? 'Passenger ID Required' : 'Solo Rider'}
                      </span>
                    </label>

                    {hasPassenger && (
                      <div className="pt-2 border-t border-stone-800 space-y-3 pl-6 animate-fadeIn">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <span className="text-stone-400 text-[11px] block">Passenger Full Name:</span>
                            <input
                              type="text"
                              value={passengerName}
                              onChange={(e) => setPassengerName(e.target.value)}
                              placeholder="e.g. Jessica Tan"
                              className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-100 text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-stone-400 text-[11px] block">Relationship:</span>
                            <input
                              type="text"
                              value={passengerRelationship}
                              onChange={(e) => setPassengerRelationship(e.target.value)}
                              placeholder="e.g. Spouse / Friend"
                              className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-100 text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 rounded-lg bg-stone-900 border border-stone-800 overflow-hidden relative shrink-0">
                            {passengerIdSelfie ? (
                              <img src={passengerIdSelfie} alt="Passenger ID" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-6 h-6 m-auto mt-4 text-stone-600" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <span className="text-[11px] text-stone-300 block">Passenger Selfie holding valid ID:</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveCameraSlot({ slot: 'passenger_id', title: 'Capture Passenger Selfie Holding Valid ID' })}
                                className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[11px] flex items-center gap-1"
                              >
                                <Camera className="w-3 h-3 text-amber-400" />
                                <span>Camera</span>
                              </button>
                              <label className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded text-[11px] cursor-pointer flex items-center gap-1">
                                <Upload className="w-3 h-3" />
                                <span>Upload</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = () => {
                                        setPassengerIdSelfie(reader.result as string);
                                        showToast('Passenger ID selfie saved!', 'success');
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 1.3 Emergency Contact Button */}
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-200 flex items-center gap-2">
                        <Contact className="w-4 h-4 text-amber-400" />
                        <span>Emergency Contact Nomination</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleSelectDeviceContact}
                        className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 rounded text-[11px] font-semibold flex items-center gap-1"
                        title="Opens native device contact address book"
                      >
                        <Contact className="w-3 h-3" />
                        <span>Import from Contacts</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={emergencyContact}
                      onChange={(e) => setEmergencyContact(e.target.value)}
                      placeholder="Name, Relationship & Phone (e.g. Maria Tan - 0917-889-1234)"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-xs font-medium"
                    />
                  </div>

                  {/* 1.4 Business Deposit Choice: Physical ID or Money */}
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-200 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400" />
                        <span>Depot Security Deposit Policy</span>
                      </span>
                      <span className="text-[11px] text-stone-400 font-mono">
                        Admin Choice
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <button
                        type="button"
                        onClick={() => setDepositChoice('physical_id')}
                        className={`p-3 rounded-xl border text-left transition-colors ${
                          depositChoice === 'physical_id'
                            ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold'
                            : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <div className="font-bold">Hold Physical ID in Vault</div>
                        <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                          Deposit valid passport, DL, or national ID in shop lockbox.
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDepositChoice('monetary')}
                        className={`p-3 rounded-xl border text-left transition-colors ${
                          depositChoice === 'monetary'
                            ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-bold'
                            : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                        }`}
                      >
                        <div className="font-bold">Hold {formatPrice(securityDepositAmount, currency)} Cash/GCash</div>
                        <div className="text-[10px] text-stone-400 font-normal mt-0.5">
                          Refundable monetary sum held during the rental period.
                        </div>
                      </button>
                    </div>

                    {depositChoice === 'physical_id' && (
                      <div className="pt-3 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-4 gap-2 animate-fadeIn text-xs">
                        <div>
                          <span className="text-[10px] text-stone-400 block">ID Document:</span>
                          <select
                            value={depositedIdType}
                            onChange={(e) => setDepositedIdType(e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-100"
                          >
                            <option value="Passport">Passport</option>
                            <option value="Driver License">Driver License</option>
                            <option value="UMID">UMID</option>
                            <option value="National ID">PhilSys National ID</option>
                            <option value="Postal ID">Postal ID</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">ID Serial Number:</span>
                          <input
                            type="text"
                            value={depositedIdNumber}
                            onChange={(e) => setDepositedIdNumber(e.target.value)}
                            className="w-full px-2 py-1.5 bg-stone-900 border border-stone-800 rounded font-mono text-stone-100"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">ID Owner:</span>
                          <select
                            value={depositedIdOwner}
                            onChange={(e) => setDepositedIdOwner(e.target.value as any)}
                            className="w-full px-2 py-1.5 bg-stone-900 border border-stone-800 rounded text-stone-100"
                          >
                            <option value="driver">Driver ({activeRes?.customerName.split(' ')[0]})</option>
                            {hasPassenger && <option value="passenger">Passenger ({passengerName.split(' ')[0]})</option>}
                          </select>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block">Vault Box Slot:</span>
                          <input
                            type="text"
                            value={depositVaultTag}
                            onChange={(e) => setDepositVaultTag(e.target.value)}
                            className="w-full px-2 py-1.5 bg-stone-900 border border-stone-800 rounded font-mono text-amber-400 font-bold"
                          />
                        </div>

                        {/* Required: Picture of the ID being deposited held in the hands of the depot staff */}
                        <div className="col-span-1 sm:col-span-4 p-3.5 rounded-xl bg-stone-900 border border-amber-400/40 space-y-2 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-100 flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-amber-400" />
                              <span>Picture of Deposited ID Being Held by Depot Staff *</span>
                            </span>
                            <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                              Physical Custody Proof
                            </span>
                          </div>

                          <p className="text-[11px] text-stone-300 leading-relaxed">
                            The renter must take a picture of the ID being deposited <strong>held by the staff of the depot</strong> in the picture, verifying physical handover inside the facility.
                          </p>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-1">
                            <div className="w-20 h-20 rounded-xl bg-stone-950 border border-stone-800 overflow-hidden relative shrink-0 flex items-center justify-center">
                              {staffHoldingIdPhoto ? (
                                <img src={staffHoldingIdPhoto} alt="Staff holding deposited ID" className="w-full h-full object-cover" />
                              ) : (
                                <div className="text-stone-600 text-[10px] text-center p-1 font-mono">
                                  No Photo Taken
                                </div>
                              )}
                              {staffHoldingIdPhoto && (
                                <span className="absolute top-1 right-1 bg-emerald-500 text-stone-950 p-0.5 rounded-full">
                                  <Check className="w-3 h-3 stroke-[3]" />
                                </span>
                              )}
                            </div>

                            <div className="space-y-2 flex-1 w-full">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setActiveCameraSlot({ slot: 'staff_id_held', title: 'Take Photo of Staff Holding Deposited ID' })}
                                  className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 rounded-lg text-xs flex items-center gap-1.5 font-bold shadow-sm transition-colors"
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>{staffHoldingIdPhoto ? 'Retake Photo' : 'Capture Staff Holding ID'}</span>
                                </button>

                                <label className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer font-medium transition-colors">
                                  <Upload className="w-3 h-3 text-amber-400" />
                                  <span>Upload Photo</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                          setStaffHoldingIdPhoto(reader.result as string);
                                          showToast('Staff holding deposited ID photo uploaded!', 'success');
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="hidden"
                                  />
                                </label>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-stone-400 whitespace-nowrap">Depot Staff Receiver:</span>
                                <input
                                  type="text"
                                  value={staffHoldingIdReceiverName}
                                  onChange={(e) => setStaffHoldingIdReceiverName(e.target.value)}
                                  placeholder="Staff member name receiving ID"
                                  className="px-2.5 py-1 bg-stone-950 border border-stone-800 rounded text-stone-200 text-xs font-medium flex-1"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 1.5 Cash Walk-In Handover Staff Photo */}
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-200 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        <span>Walk-in Cash Payment Verification</span>
                      </span>
                      <span className="text-[10px] text-stone-400 font-mono">
                        Physical Cash at Counter
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-stone-900 border border-stone-800 overflow-hidden relative shrink-0">
                        {staffCashPhoto ? (
                          <img src={staffCashPhoto} alt="Staff holding cash" className="w-full h-full object-cover" />
                        ) : (
                          <DollarSign className="w-8 h-8 m-auto mt-6 text-stone-600" />
                        )}
                        {staffCashPhoto && (
                          <span className="absolute top-1 right-1 bg-emerald-500 text-stone-950 p-0.5 rounded-full">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 flex-1">
                        <p className="text-[11px] text-stone-400">
                          For cash walk-ins, take a photo of the staff member holding the cash notes as audit verification.
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setActiveCameraSlot({ slot: 'cash_staff', title: 'Take Photo of Staff Holding Cash' })}
                            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[11px] flex items-center gap-1 font-semibold"
                          >
                            <Camera className="w-3 h-3 text-amber-400" />
                            <span>Capture Photo</span>
                          </button>
                          <input
                            type="text"
                            value={staffCashCollectorName}
                            onChange={(e) => setStaffCashCollectorName(e.target.value)}
                            placeholder="Staff member name"
                            className="px-2 py-1 bg-stone-900 border border-stone-800 rounded text-stone-200 text-xs flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm flex items-center gap-1.5"
                    >
                      <span>Next: Form Agreement Questions</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* PICKUP STEP 2: Form Agreement Questions */}
              {currentStep === 2 && (
                <div className="space-y-5 text-xs">
                  <div>
                    <span className="text-amber-400 font-mono text-[11px] uppercase tracking-wider">Section 2</span>
                    <h2 className="text-base font-bold text-stone-100 mt-0.5">Rental Terms & Safety Rules Confirmation</h2>
                    <p className="text-stone-400 mt-1">
                      Present each safety rule clearly to the renter. All four checkpoints must be agreed to before dispatch.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        id: 'helmet',
                        state: agreeHelmet,
                        setter: setAgreeHelmet,
                        title: 'Mandatory Helmet & Protective Gear Policy',
                        desc: 'Driver and passenger must wear issued DOT certified safety helmets at all times. Riding without a helmet violates RA 10054 and forfeits all insurance coverage.',
                      },
                      {
                        id: 'boundaries',
                        state: agreeBoundaries,
                        setter: setAgreeBoundaries,
                        title: 'Zambales Coastal Boundary & Road Limits',
                        desc: 'Approved boundary includes Subic, San Antonio, San Narciso, San Felipe, Cabangan, and Botolan. Off-road riverbeds, sand dunes, and provincial crossing beyond Pangasinan are prohibited.',
                      },
                      {
                        id: 'fuel',
                        state: agreeFuelPolicy,
                        setter: setAgreeFuelPolicy,
                        title: `Full-to-Full Fuel Policy (₱${fuelRatePerBar} / Missing Bar)`,
                        desc: `Motorbike is handed over at ${fuelBars} of ${maxFuelBars} bars. Renter agrees to return with the same level or pay ₱${fuelRatePerBar} per missing bar.`,
                      },
                      {
                        id: 'liability',
                        state: agreeLiability,
                        setter: setAgreeLiability,
                        title: 'Damage Liability & Mechanical Care',
                        desc: 'Renter is responsible for minor drops, tire punctures, fairing scrapes, or third-party liabilities during the rental duration.',
                      },
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => item.setter(!item.state)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                          item.state
                            ? 'border-amber-400/50 bg-amber-400/5 text-stone-100'
                            : 'border-stone-800 bg-stone-950 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={item.state}
                          onChange={(e) => item.setter(e.target.checked)}
                          className="mt-0.5 accent-amber-400 w-4 h-4 rounded cursor-pointer shrink-0"
                        />
                        <div className="space-y-1">
                          <div className={`font-semibold text-xs ${item.state ? 'text-amber-400' : 'text-stone-200'}`}>
                            {item.title}
                          </div>
                          <p className="text-[11px] leading-relaxed text-stone-400">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="px-4 py-2 text-stone-400 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!agreeHelmet || !agreeBoundaries || !agreeFuelPolicy || !agreeLiability}
                      onClick={() => setCurrentStep(3)}
                      className={`px-5 py-2 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 ${
                        agreeHelmet && agreeBoundaries && agreeFuelPolicy && agreeLiability
                          ? 'bg-amber-400 hover:bg-amber-300 text-stone-950'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Next: 360° Bike Photos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* PICKUP STEP 3: Bike Photos (5 Angles) */}
              {currentStep === 3 && (
                <div className="space-y-5 text-xs">
                  <div>
                    <span className="text-amber-400 font-mono text-[11px] uppercase tracking-wider">Section 3</span>
                    <h2 className="text-base font-bold text-stone-100 mt-0.5">360° Motorbike Baseline Photos</h2>
                    <p className="text-stone-400 mt-1">
                      Snap or upload photos of all four sides and the dashboard to establish pre-rental condition baseline.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'front' as const, label: '1. Front View & Headlight' },
                      { key: 'left' as const, label: '2. Left Side & Crankcase' },
                      { key: 'right' as const, label: '3. Right Side & Exhaust' },
                      { key: 'rear' as const, label: '4. Rear Fender & Plate' },
                      { key: 'dashboard' as const, label: '5. Dashboard (Odo/Fuel)' },
                    ].map((item) => {
                      const photo = bikePhotos[item.key];
                      return (
                        <div key={item.key} className="rounded-xl border border-stone-800 bg-stone-950 p-2.5 space-y-2">
                          <div className="aspect-video rounded-lg overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center relative">
                            {photo ? (
                              <img src={photo} alt={item.label} className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="w-6 h-6 text-stone-600" />
                            )}
                            {photo && (
                              <span className="absolute top-1 right-1 bg-emerald-500 text-stone-950 p-0.5 rounded-full">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          <div className="font-semibold text-stone-200 text-[11px] truncate">
                            {item.label}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActiveCameraSlot({ slot: item.key, title: `Capture ${item.label}` })}
                              className="flex-1 py-1 px-2 text-[10px] font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded flex items-center justify-center gap-1"
                            >
                              <Camera className="w-3 h-3 text-amber-400" />
                              <span>Camera</span>
                            </button>

                            <label className="p-1 text-[10px] bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded cursor-pointer" title="Upload file">
                              <Upload className="w-3 h-3" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      setBikePhotos(prev => ({ ...prev, [item.key]: reader.result as string }));
                                      showToast(`${item.label} uploaded!`);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="px-4 py-2 text-stone-400 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm flex items-center gap-1.5"
                    >
                      <span>Next: Rider Selfie & Social Consent</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* PICKUP STEP 4: Rider Selfie & Social Consent */}
              {currentStep === 4 && (
                <div className="space-y-5 text-xs">
                  <div>
                    <span className="text-amber-400 font-mono text-[11px] uppercase tracking-wider">Section 4</span>
                    <h2 className="text-base font-bold text-stone-100 mt-0.5">Rider Departure Selfie & Social Media Consent</h2>
                    <p className="text-stone-400 mt-1">
                      Snap a departure photo with the motorbike for verification and optional feature on RideOut TikTok & Facebook reels.
                    </p>
                  </div>

                  <div className="p-5 rounded-xl border border-stone-800 bg-stone-950 flex flex-col sm:flex-row items-center gap-5">
                    <div className="w-36 h-36 rounded-2xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center relative shrink-0">
                      {riderSelfie ? (
                        <img src={riderSelfie} alt="Rider Departure Selfie" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-stone-600" />
                      )}
                      {riderSelfie && (
                        <span className="absolute top-2 right-2 bg-emerald-500 text-stone-950 p-1 rounded-full">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </span>
                      )}
                    </div>

                    <div className="space-y-3 flex-1 text-center sm:text-left">
                      <div>
                        <div className="font-bold text-sm text-stone-100">{activeRes?.customerName}</div>
                        <div className="text-stone-400 text-[11px] mt-0.5">
                          Departure photo with {activeRes?.bikeName}
                        </div>
                      </div>

                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveCameraSlot({ slot: 'selfie', title: 'Rider Departure Selfie' })}
                          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
                        >
                          <Camera className="w-4 h-4 text-amber-400" />
                          <span>Open Front Camera</span>
                        </button>

                        <label className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-4 h-4" />
                          <span>Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = () => {
                                  setRiderSelfie(reader.result as string);
                                  showToast('Rider departure photo saved!');
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>

                      <label className="flex items-start gap-2.5 pt-2 text-left cursor-pointer border-t border-stone-800">
                        <input
                          type="checkbox"
                          checked={socialConsent}
                          onChange={(e) => setSocialConsent(e.target.checked)}
                          className="mt-0.5 accent-amber-400 w-4 h-4 rounded shrink-0"
                        />
                        <span className="text-[11px] text-stone-300">
                          <strong>Social Media Awareness Consent:</strong> I am aware and consent that this departure photo may be featured on {currentBusiness.name}'s TikTok and Facebook pages with trending music and Zambales tourist destination hashtags.
                        </span>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="px-4 py-2 text-stone-400 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(5)}
                      className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm flex items-center gap-1.5"
                    >
                      <span>Next: Telemetry & Signature</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* PICKUP STEP 5: Odometer, Fuel & Digital Signature */}
              {currentStep === 5 && (
                <div className="space-y-5 text-xs">
                  <div>
                    <span className="text-amber-400 font-mono text-[11px] uppercase tracking-wider">Section 5</span>
                    <h2 className="text-base font-bold text-stone-100 mt-0.5">Telemetry Handover & Digital Signature</h2>
                    <p className="text-stone-400 mt-1">
                      Log starting odometer KM, verify initial fuel level bars, and capture renter's digital signature.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Odometer input */}
                    <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-200 flex items-center gap-1.5">
                          <Gauge className="w-4 h-4 text-amber-400" />
                          <span>Pickup Odometer (KM)</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setActiveCameraSlot({ slot: 'odometer', title: 'Capture Pickup Odometer Photo' })}
                          className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded text-[10px] flex items-center gap-1"
                        >
                          <Camera className="w-3 h-3 text-amber-400" />
                          <span>Photo</span>
                        </button>
                      </div>
                      <input
                        type="number"
                        value={odometerKm}
                        onChange={(e) => setOdometerKm(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 font-mono text-base font-bold tabular-nums"
                      />
                    </div>

                    {/* Fuel bars */}
                    <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-stone-200 flex items-center gap-1.5">
                          <Fuel className="w-4 h-4 text-amber-400" />
                          <span>Fuel Level ({fuelBars} / {maxFuelBars} Bars)</span>
                        </span>
                        <span className="text-amber-400 font-mono text-xs font-bold">
                          {Math.round((fuelBars / maxFuelBars) * 100)}%
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: maxFuelBars }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setFuelBars(i + 1)}
                            className={`flex-1 h-7 rounded transition-colors ${
                              i < fuelBars ? 'bg-amber-400 shadow-sm' : 'bg-stone-800 hover:bg-stone-700'
                            }`}
                            title={`Set fuel to ${i + 1} bars`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Canvas Signature Box */}
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-200 flex items-center gap-1.5">
                        <PenTool className="w-4 h-4 text-amber-400" />
                        <span>Renter Digital Signature</span>
                      </span>
                      <button
                        type="button"
                        onClick={clearSignature}
                        className="px-2 py-1 text-[11px] text-stone-400 hover:text-white"
                      >
                        Clear
                      </button>
                    </div>

                    <div className="border border-stone-800 rounded-xl bg-stone-900/80 overflow-hidden relative touch-none">
                      <canvas
                        ref={canvasRef}
                        width={600}
                        height={120}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="w-full h-28 cursor-crosshair block"
                      />
                      {!hasSignature && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-stone-600 text-xs">
                          Renter signs here with touch screen or mouse
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="px-4 py-2 text-stone-400 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleCompleteHandover}
                      className="px-6 py-2.5 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm flex items-center gap-2"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>Complete Pickup & Issue Digital Documents</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================= */}
          {/* RETURN DROP-OFF MODE STEPS */}
          {/* ========================================================= */}
          {mode === 'return' && (
            <>
              {/* RETURN STEP 1: Return Photos & AI Damage Comparison */}
              {returnStep === 1 && (
                <div className="space-y-5 text-xs">
                  <div>
                    <span className="text-amber-400 font-mono text-[11px] uppercase tracking-wider">Return Section 1</span>
                    <h2 className="text-base font-bold text-stone-100 mt-0.5">Return Photos & AI Condition Comparison</h2>
                    <p className="text-stone-400 mt-1">
                      Upload return photos from the same 5 angles. Internal AI will compare the return photos against pickup condition to detect any crash traces or deep scratches.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {[
                      { key: 'front' as const, label: '1. Front View & Tire' },
                      { key: 'left' as const, label: '2. Left Fairing & Pegs' },
                      { key: 'right' as const, label: '3. Right Fairing & Exhaust' },
                      { key: 'rear' as const, label: '4. Rear Fender & Plate' },
                      { key: 'dashboard' as const, label: '5. Return Dashboard (Odo/Fuel)' },
                    ].map((item) => {
                      const photo = returnBikePhotos[item.key];
                      return (
                        <div key={item.key} className="rounded-xl border border-stone-800 bg-stone-950 p-2.5 space-y-2">
                          <div className="aspect-video rounded-lg overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center relative">
                            {photo ? (
                              <img src={photo} alt={item.label} className="w-full h-full object-cover" />
                            ) : (
                              <Camera className="w-6 h-6 text-stone-600" />
                            )}
                            {photo && (
                              <span className="absolute top-1 right-1 bg-emerald-500 text-stone-950 p-0.5 rounded-full">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </span>
                            )}
                          </div>

                          <div className="font-semibold text-stone-200 text-[11px] truncate">
                            {item.label}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setActiveCameraSlot({ slot: item.key, title: `Return ${item.label}`, isReturn: true })}
                              className="flex-1 py-1 px-2 text-[10px] font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 rounded flex items-center justify-center gap-1"
                            >
                              <Camera className="w-3 h-3 text-amber-400" />
                              <span>Camera</span>
                            </button>

                            <label className="p-1 text-[10px] bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 rounded cursor-pointer" title="Upload file">
                              <Upload className="w-3 h-3" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => {
                                      setReturnBikePhotos(prev => ({ ...prev, [item.key]: reader.result as string }));
                                      showToast(`${item.label} uploaded!`);
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* AI CONDITION INSPECTOR TRIGGER & RESULTS */}
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="font-bold text-stone-200">Internal AI Damage & Crash Condition Inspector</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRunAiInspection}
                        disabled={isAnalyzingAi}
                        className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm self-start sm:self-auto"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{isAnalyzingAi ? 'Analyzing Condition...' : 'Run AI Condition Comparison'}</span>
                      </button>
                    </div>

                    {aiDamageResult && (
                      <div className="p-3.5 rounded-lg border bg-stone-900/80 space-y-2 animate-fadeIn text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-stone-100 flex items-center gap-1.5">
                            {aiDamageResult.severity === 'crash_traces' || aiDamageResult.severity === 'significant_damage' ? (
                              <ShieldAlert className="w-4 h-4 text-red-400" />
                            ) : (
                              <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            )}
                            <span>Condition Verdict: {aiDamageResult.severity.replace('_', ' ').toUpperCase()}</span>
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            aiDamageResult.requiresAdminApproval
                              ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {aiDamageResult.requiresAdminApproval ? 'Admin Sign-Off Required' : 'Normal Road Wear (Acceptable)'}
                          </span>
                        </div>

                        <p className="text-stone-300 text-[11px] leading-relaxed">
                          {aiDamageResult.summaryRecommendation}
                        </p>

                        <div className="space-y-1 pt-1 border-t border-stone-800">
                          {aiDamageResult.damagesDetected.map((d, idx) => (
                            <div key={idx} className="flex items-center justify-between text-[11px] font-mono">
                              <span className="text-stone-400">{d.area.toUpperCase()} SECTION: {d.description}</span>
                              <span className={d.isAcceptableMinorScratch ? 'text-emerald-400' : 'text-red-400 font-bold'}>
                                {d.isAcceptableMinorScratch ? 'Acceptable Hairline Scratch (₱0)' : 'Flagged Crash Trace'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Helmet & Tools check */}
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 flex flex-col sm:flex-row gap-4">
                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={helmetsReturned}
                        onChange={(e) => setHelmetsReturned(e.target.checked)}
                        className="accent-amber-400 w-4 h-4"
                      />
                      <span className="text-stone-300 font-medium">All Issued DOT Helmets Returned Intact</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={toolkitReturned}
                        onChange={(e) => setToolkitReturned(e.target.checked)}
                        className="accent-amber-400 w-4 h-4"
                      />
                      <span className="text-stone-300 font-medium">Emergency Toolkit & Docs Verified</span>
                    </label>
                  </div>

                  <div className="flex justify-end pt-3">
                    <button
                      type="button"
                      onClick={() => setReturnStep(2)}
                      className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm flex items-center gap-1.5"
                    >
                      <span>Next: Return Odometer & Fuel Difference</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* RETURN STEP 2: Odometer & Fuel Difference Calculator */}
              {returnStep === 2 && (
                <div className="space-y-5 text-xs">
                  <div>
                    <span className="text-amber-400 font-mono text-[11px] uppercase tracking-wider">Return Section 2</span>
                    <h2 className="text-base font-bold text-stone-100 mt-0.5">Return Odometer & Fuel Difference Calculator</h2>
                    <p className="text-stone-400 mt-1">
                      Log final odometer reading to compute distance traveled, and compare return fuel bars with pickup baseline.
                    </p>
                  </div>

                  {/* Odometer Reading Card */}
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-200 flex items-center gap-2">
                        <Gauge className="w-4 h-4 text-amber-400" />
                        <span>Return Odometer Reading</span>
                      </span>
                      <span className="text-stone-400 font-mono">
                        Pickup baseline: <strong className="text-stone-200">{baselinePickupOdo.toLocaleString()} KM</strong>
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={returnOdometerKm}
                          onChange={(e) => setReturnOdometerKm(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 font-mono text-base font-bold tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={() => setActiveCameraSlot({ slot: 'returnOdometer', title: 'Capture Return Odometer Photo', isReturn: true })}
                          className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg flex items-center gap-1 text-[11px] shrink-0"
                        >
                          <Camera className="w-3.5 h-3.5 text-amber-400" />
                          <span>Photo</span>
                        </button>
                      </div>

                      <div className="p-3 rounded-lg bg-stone-900/60 border border-stone-800 font-mono text-center sm:text-right">
                        <span className="text-stone-500 text-[11px] block">Total Distance Ridden:</span>
                        <span className="text-xl font-bold text-amber-400">+{distanceTraveledKm} KM</span>
                      </div>
                    </div>
                  </div>

                  {/* Fuel Difference & Discrepancy Card */}
                  <div className="p-5 rounded-xl border-2 border-amber-500/30 bg-amber-500/5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-bold text-stone-100 text-sm flex items-center gap-2">
                          <Fuel className="w-4 h-4 text-amber-400" />
                          <span>Fuel Level Check & Discrepancy ({formatPrice(fuelRatePerBar, currency)} / bar)</span>
                        </div>
                        <p className="text-stone-300 text-[11px] mt-0.5">
                          Motorbike was handed over with <strong>{baselinePickupFuelBars} bars</strong>. Any shortfall incurs a {formatPrice(fuelRatePerBar, currency)} fee per missing bar.
                        </p>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-xs text-stone-400 block">Fuel Discrepancy Fee:</span>
                        <span className={`text-xl font-bold ${missingFuelBars > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                          {missingFuelBars > 0 ? `-${formatPrice(fuelDiscrepancyCharge, currency)}` : '₱0 (Full Tank)'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-stone-400">Return Fuel Level:</span>
                        <span className="text-amber-400 font-bold">{returnFuelBars} of {maxFuelBars} Bars ({Math.round((returnFuelBars / maxFuelBars) * 100)}%)</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: maxFuelBars }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReturnFuelBars(i + 1)}
                            className={`flex-1 h-9 rounded transition-colors flex items-center justify-center text-[10px] font-mono font-bold ${
                              i < returnFuelBars
                                ? 'bg-amber-400 text-stone-950 shadow-sm'
                                : 'bg-stone-800 text-stone-500 hover:bg-stone-700'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>

                      {missingFuelBars > 0 && (
                        <div className="p-3 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 flex items-center gap-2 text-xs">
                          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                          <span>
                            Renter returned with <strong>{missingFuelBars} bar{missingFuelBars > 1 ? 's' : ''} less</strong> than pickup. Deducting <strong>{formatPrice(fuelDiscrepancyCharge, currency)}</strong> from security deposit.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Return Schedule & Late Extension Check */}
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-200 flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-amber-400" />
                        <span>Return Schedule & Extension Fee ({formatPrice(extensionFeePerHour, currency)}/hr)</span>
                      </span>
                      {lateHoursRounded > 0 ? (
                        <span className="text-red-400 font-mono font-bold">
                          +{lateHoursRounded} hr{lateHoursRounded > 1 ? 's' : ''} Late ({formatPrice(lateExtensionFee, currency)})
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-mono text-[11px] font-bold">
                          On-time Return
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <span className="text-stone-500 text-[11px]">Scheduled Return:</span>
                        <div className="font-mono text-stone-200 font-semibold">{activeRes?.endDate} at {activeRes?.endTime}</div>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <span className="text-stone-500 text-[11px]">Actual Date:</span>
                          <input
                            type="date"
                            value={actualReturnDate}
                            onChange={(e) => setActualReturnDate(e.target.value)}
                            className="w-full px-2 py-1.5 bg-stone-900 border border-stone-800 rounded font-mono text-stone-100 text-xs"
                          />
                        </div>
                        <div className="flex-1">
                          <span className="text-stone-500 text-[11px]">Actual Time:</span>
                          <input
                            type="time"
                            value={actualReturnTime}
                            onChange={(e) => setActualReturnTime(e.target.value)}
                            className="w-full px-2 py-1.5 bg-stone-900 border border-stone-800 rounded font-mono text-stone-100 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <button
                      type="button"
                      onClick={() => setReturnStep(1)}
                      className="px-4 py-2 text-stone-400 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setReturnStep(3)}
                      className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm flex items-center gap-1.5"
                    >
                      <span>Next: Admin Approval, Reviews & Trip Videos</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* RETURN STEP 3: Admin Sign-Off, 200-char feedback & Trip Videos */}
              {returnStep === 3 && (
                <div className="space-y-5 text-xs">
                  <div>
                    <span className="text-amber-400 font-mono text-[11px] uppercase tracking-wider">Return Section 3</span>
                    <h2 className="text-base font-bold text-stone-100 mt-0.5">Admin Approval, Customer Review & Video Cashback</h2>
                    <p className="text-stone-400 mt-1">
                      Depot admin must approve the return before releasing the deposited ID or security deposit. Collect 200-character customer review and optional trip video clips for {formatPrice(cashbackRewardAmount, currency)} cashback.
                    </p>
                  </div>

                  {/* 3.1 Financial Statement & Deposit Release */}
                  <div className="p-5 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
                    <div className="text-xs font-bold text-stone-200 uppercase tracking-wider border-b border-stone-800 pb-2">
                      Statement of Deductions & Deposit Release
                    </div>

                    <div className="space-y-2 font-mono text-xs">
                      <div className="flex justify-between text-stone-300">
                        <span>Original Security Deposit Held:</span>
                        <strong className="text-stone-100">{formatPrice(securityDepositAmount, currency)}</strong>
                      </div>

                      <div className="flex justify-between text-stone-400">
                        <span>Missing Fuel ({missingFuelBars} bars @ {formatPrice(fuelRatePerBar, currency)}/bar):</span>
                        <span className={missingFuelBars > 0 ? 'text-red-400 font-bold' : 'text-stone-400'}>
                          - {formatPrice(fuelDiscrepancyCharge, currency)}
                        </span>
                      </div>

                      <div className="flex justify-between text-stone-400">
                        <span>Late Return Extension ({lateHoursRounded} hrs @ {formatPrice(extensionFeePerHour, currency)}/hr):</span>
                        <span className={lateHoursRounded > 0 ? 'text-red-400 font-bold' : 'text-stone-400'}>
                          - {formatPrice(lateExtensionFee, currency)}
                        </span>
                      </div>

                      {isRewardEnabled && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Trip Video Content Reward ({rewardConfig.rewardType.replace('_', ' ')}):</span>
                          <span className="font-bold">+ {formatPrice(cashbackRewardAmount, currency)}</span>
                        </div>
                      )}

                      <div className="pt-3 border-t border-stone-800 flex justify-between items-center text-sm font-bold">
                        <span className="text-stone-200">Net Refund Due to Renter:</span>
                        <span className="text-2xl font-black text-emerald-400 font-mono">
                          {formatPrice(finalDepositRefund + cashbackRewardAmount, currency)}
                        </span>
                      </div>
                    </div>

                    {/* Fuel Deficit Clearance Notice & Gate */}
                    {missingFuelBars > 0 && (
                      <div className="p-3.5 rounded-xl border border-red-500/40 bg-red-950/30 space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-red-300 flex items-center gap-1.5 text-xs">
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>Fuel Deficit Alert: {missingFuelBars} Missing Bar{missingFuelBars > 1 ? 's' : ''} ({formatPrice(fuelDiscrepancyCharge, currency)})</span>
                          </span>
                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                            fuelClearedWithDepot
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}>
                            {fuelClearedWithDepot ? 'CLEARED WITH DEPOT ✓' : 'PAYMENT PENDING'}
                          </span>
                        </div>

                        <p className="text-[11px] text-stone-300 leading-relaxed">
                          The motorbike was returned with less fuel than at pickup. This shortfall of <strong>{formatPrice(fuelDiscrepancyCharge, currency)}</strong> must be settled and cleared with depot counter staff before the deposited ID or security deposit can be released.
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={fuelClearedWithDepot}
                              onChange={(e) => {
                                setFuelClearedWithDepot(e.target.checked);
                                if (e.target.checked && activeRes) {
                                  clearFuelDeficit(activeRes.id, adminApproverName || activeStaffUser.name);
                                }
                              }}
                              className="accent-emerald-400 w-4 h-4 rounded"
                            />
                            <span className="text-xs font-semibold text-stone-200">
                              Confirm: Renter has paid / settled {formatPrice(fuelDiscrepancyCharge, currency)} fuel deficit with depot staff
                            </span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 3.2 200-Character Customer Feedback (Facebook & Google Syndicate) */}
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-stone-200 flex items-center gap-1.5">
                        <MessageSquare className="w-4 h-4 text-amber-400" />
                        <span>Renter Feedback & Experience (Max 200 Characters)</span>
                      </span>
                      <span className="text-stone-400 font-mono text-[11px]">
                        {200 - customerFeedback.length} chars left
                      </span>
                    </div>

                    <textarea
                      value={customerFeedback}
                      maxLength={200}
                      onChange={(e) => setCustomerFeedback(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-xs font-medium"
                      placeholder="Share your experience with the bike and Zambales ride..."
                    />

                    <label className="flex items-center gap-2 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={syndicateFeedback}
                        onChange={(e) => setSyndicateFeedback(e.target.checked)}
                        className="accent-amber-400 w-4 h-4 rounded"
                      />
                      <span className="text-[11px] text-stone-300">
                        Post this feedback as a verified review to our <strong>Facebook Page & Google Business Profile</strong> (default: Yes).
                      </span>
                    </label>
                  </div>

                  {/* 3.3 Trip Videos & Optional Reward (Configured per Business) */}
                  <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-200 flex items-center gap-2">
                        <Video className="w-4 h-4 text-amber-400" />
                        <span>
                          {isRewardEnabled 
                            ? `Submit 3-4 Trip Videos for ${formatPrice(cashbackRewardAmount, currency)} ${rewardConfig.rewardType === 'rental_voucher' ? 'Rental Voucher' : 'Cashback Reward'}` 
                            : 'Submit 3-4 Trip Videos for Social Media Reel Feature (Optional)'}
                        </span>
                      </span>
                      {isRewardEnabled ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                          +{formatPrice(cashbackRewardAmount, currency)} ({rewardConfig.rewardType.replace('_', ' ')})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-800 text-stone-400 border border-stone-700">
                          Reward: Inactive for Shop
                        </span>
                      )}
                    </div>

                    {isRewardEnabled && rewardConfig.customTerms && (
                      <p className="text-[11px] text-amber-400/90 leading-relaxed bg-amber-400/5 p-2 rounded border border-amber-400/20">
                        <strong>Reward Terms:</strong> {rewardConfig.customTerms} · Timing: {rewardConfig.releaseTiming.replace(/_/g, ' ')}.
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 p-3 rounded-lg bg-stone-900 border border-stone-800 flex items-center justify-between">
                          <span className="text-stone-300">Video Clips Selected:</span>
                          <span className="text-amber-400 font-bold font-mono">{tripVideosCount} clips (1080p / 4K)</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTripVideosCount(prev => (prev < 4 ? prev + 1 : 3));
                            showToast('Added trip video clip!', 'success');
                          }}
                          className="px-3 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5 text-amber-400" />
                          <span>Attach Clip</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                          <input
                            type="checkbox"
                            checked={blurFacesToggle}
                            onChange={(e) => setBlurFacesToggle(e.target.checked)}
                            className="accent-amber-400 w-4 h-4 rounded"
                          />
                          <span className="text-[11px] text-stone-300">
                            <strong>Privacy:</strong> Blur / cover my face in social media reel
                          </span>
                        </label>

                        <label className="flex items-start gap-2 cursor-pointer p-2.5 rounded-lg bg-stone-900/60 border border-stone-800">
                          <input
                            type="checkbox"
                            checked={videoDisclaimerAccepted}
                            onChange={(e) => setVideoDisclaimerAccepted(e.target.checked)}
                            className="accent-amber-400 w-4 h-4 rounded mt-0.5"
                          />
                          <span className="text-[10px] text-stone-300">
                            <strong>Disclaimer:</strong> Uploaded video clips and final edit become property of {currentBusiness.name} for social media marketing.
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 3.4 Depot Admin Sign-Off & ID Release */}
                  <div className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-500/5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-100 flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-400" />
                        <span>Depot Admin Sign-Off & Deposited ID Release</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase">
                        Admin Approval Gate
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <span className="text-stone-400 text-[11px] block">Admin Approver Name:</span>
                        <input
                          type="text"
                          value={adminApproverName}
                          onChange={(e) => setAdminApproverName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-stone-900 border border-stone-800 rounded font-medium text-stone-100 text-xs"
                        />
                      </div>

                      <div>
                        <span className="text-stone-400 text-[11px] block">Vault Release Status:</span>
                        <label className="flex items-center gap-2 cursor-pointer p-1.5 bg-stone-900 rounded border border-stone-800">
                          <input
                            type="checkbox"
                            checked={adminApprovedReturn}
                            onChange={(e) => setAdminApprovedReturn(e.target.checked)}
                            className="accent-emerald-400 w-4 h-4"
                          />
                          <span className="text-xs text-stone-200 font-bold">
                            Authorize & Release Deposited ID / Vault Slot
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-800">
                    <button
                      type="button"
                      onClick={() => setReturnStep(2)}
                      className="px-4 py-2 text-stone-400 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!adminApprovedReturn || (missingFuelBars > 0 && !fuelClearedWithDepot)}
                      onClick={handleCompleteReturn}
                      className={`px-6 py-2.5 text-xs font-semibold rounded-lg shadow-sm flex items-center gap-2 ${
                        adminApprovedReturn && (missingFuelBars === 0 || fuelClearedWithDepot)
                          ? 'bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>
                        {missingFuelBars > 0 && !fuelClearedWithDepot
                          ? `Clear ₱${fuelDiscrepancyCharge} Fuel Deficit Before Release`
                          : `Approve Return & Release ${formatPrice(finalDepositRefund + cashbackRewardAmount, currency)}`}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Live Camera Modal */}
      {activeCameraSlot && (
        <CameraCaptureModal
          title={activeCameraSlot.title}
          isSelfie={activeCameraSlot.slot === 'selfie' || activeCameraSlot.slot === 'selfie_dl' || activeCameraSlot.slot === 'passenger_id'}
          onCapture={handleCaptureCamera}
          onClose={() => setActiveCameraSlot(null)}
        />
      )}

      {/* Post-Pickup Email Modal with Drop-off Button */}
      {showPickupEmailModal && activeRes && completedInspection && (
        <PickupEmailModal
          reservation={activeRes}
          inspection={completedInspection}
          bike={activeBike}
          business={currentBusiness}
          onClose={() => setShowPickupEmailModal(false)}
          onStartDropoff={(res) => {
            setShowPickupEmailModal(false);
            setMode('return');
            setReturnStep(1);
            setCompletedInspection(null);
          }}
        />
      )}

      {/* LTO Official Receipt / Certificate of Registration & Google Maps Guide Modal */}
      {showRegistrationModal && activeRes && (
        <RegistrationAndGuidesModal
          reservation={activeRes}
          bike={activeBike}
          initialTab={registrationModalTab}
          onClose={() => setShowRegistrationModal(false)}
        />
      )}

    </div>
  );
};
