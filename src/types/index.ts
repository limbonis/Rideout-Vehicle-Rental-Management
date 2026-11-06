/**
 * Core type definitions for RideOut Zambales Moto Rentals & Operations
 */


export type BikeCategory = 'scooter' | 'maxi-scooter' | 'adventure' | 'classic';
export type BikeStatus = 'available' | 'rented' | 'maintenance' | 'cleaning';

export interface Motorbike {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: BikeCategory;
  engineCc: number;
  plateNumber: string;
  dailyRate: number; // in PHP
  weeklyRate: number; // in PHP
  currentMileage: number; // km
  nextServiceMileage: number; // km
  fuelLevel: number; // 0 to 100%
  status: BikeStatus;
  imageUrl: string;
  photos?: string[]; // Minimum 4 required photos: Front, Left Side, Right Side, Rear
  features: string[];
  helmetCapacity: number;
  transmission: 'Automatic (CVT)' | 'Manual (Clutch)' | 'Semi-Automatic';
  businessId?: string;
  registrationDocs?: MotorbikeRegistrationDocs;
  depotId?: string;
  depotName?: string;
}

export type ReservationStatus = 
  | 'pending'
  | 'confirmed'
  | 'active'
  | 'completed'
  | 'cancelled';

export interface PromoCode {
  id: string;
  code: string; // e.g. RIDEOUT15, ZAMBALES500
  discountType: 'percentage' | 'fixed';
  discountValue: number; // e.g. 15 for 15% or 500 for ₱500
  description: string;
  minRentalDays: number;
  expiryDate: string; // YYYY-MM-DD
  isActive: boolean;
  usageCount: number;
  maxUses?: number;
  businessId?: string;
}

export interface DriverLicenseInfo {
  extractedName?: string;
  licenseNumber?: string;
  licenseCodes: string[]; // e.g. ['A', 'A1', 'B']
  isValidForMotorcycle: boolean; // Must have 'A' or 'A1'
  imageUrl?: string;
  verifiedAt?: string;
}

export interface Reservation {
  id: string;
  bookingRef: string; // e.g. ROZ-2026-1042
  createdAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string; // 11-digit mobile (e.g. 09178329912)
  customerLicenseNumber: string;
  driverLicenseImageUrl?: string;
  driverLicenseCodes: string[]; // e.g. ['A', 'A1']
  driverLicenseValidated: boolean;
  facebookConnected: boolean;
  facebookEmail?: string;
  facebookName?: string;
  customerNationality: string;
  emergencyContact: string;
  bikeId: string;
  bikeName: string;
  startDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  pickupLocation: string;
  dropoffLocation: string;
  status: ReservationStatus;
  dailyRate: number;
  totalDays: number;
  promoCode?: string;
  discountAmount: number;
  subtotal: number; // (dailyRate * totalDays) - discountAmount
  securityDeposit: number;
  totalAmount: number; // subtotal + securityDeposit
  depositPaid: number;
  paymentMethod: 'Cash' | 'GCash' | 'Credit Card' | 'Bank Transfer';
  paymentStatus: 'Unpaid' | 'Deposit Paid' | 'Fully Paid' | 'Refunded';
  gcashReferenceNumber?: string;
  gcashReceiptUrl?: string;
  paymentProofUrl?: string;
  paymentProofType?: 'gcash-screenshot' | 'bank-transfer' | 'third-party-gcash' | 'cash-receipt';
  payerAccountName?: string;
  cashHandoverStaffName?: string;
  cashHandoverPhotoUrl?: string;
  pickupLocationId?: string;
  pickupLocationCoordinates?: { lat: number; lng: number };
  pickupDepotId?: string;
  pickupDepotName?: string;
  returnDepotId?: string;
  returnDepotName?: string;
  interDepotFee?: number;
  currency?: SupportedCurrency;
  language?: SupportedLanguage;
  socialPlatformChoice?: 'facebook' | 'instagram' | 'tiktok';
  socialHandleOrUrl?: string;
  transferConfirmationUploaded?: boolean;
  facebookPageLiked?: boolean;
  facebookAlertsPermitted?: boolean;
  passengerInfo?: PassengerInfo;
  depositRequirementType?: DepositRequirementType;
  physicalIdDeposit?: PhysicalIdDeposit;
  renterDlSelfieVerification?: RenterDlSelfieVerification;
  returnAiComparison?: AiDamageComparisonResult;
  returnAdminApproved?: boolean;
  returnAdminName?: string;
  returnFeedback?: string;
  tripVideos?: string[];
  tripVideosBlurFaces?: boolean;
  cashbackRewardGiven?: number;
  orCrIssued?: boolean;
  orCrDocs?: MotorbikeRegistrationDocs;
  googleSheetRowSynced?: boolean;
  googleDriveFolderSynced?: boolean;
  googleDriveFolderUrl?: string;
  businessId?: string;
  notes?: string;
  selectedAddOns?: Array<{ id: string; name: string; price: number }>;
  addOnsTotal?: number;
  returnReminderSent?: boolean;
  returnReminderSentAt?: string;
  pickupInspectionId?: string;
  returnInspectionId?: string;
  renterLocationSharing?: RenterLocationSharing;
  fuelDeficitCleared?: boolean;
  fuelDeficitAmount?: number;
  preferredContactMode?: 'sms' | 'whatsapp' | 'facebook' | 'instagram';
  preferredContactHandle?: string; // Phone number for SMS/WhatsApp, Facebook profile URL/name, Instagram @handle
}

export interface RentalAddOnItem {
  id: string;
  name: string;
  price: number; // 0 for free
  isActive: boolean;
  description?: string;
  iconName?: string;
}

export type DepositRequirementType = 'monetary' | 'physical_id' | 'both_allowed';

export type RewardType = 'cashback_gcash' | 'cash_at_counter' | 'rental_voucher' | 'fuel_credit';
export type RewardReleaseTiming = 'instant_on_verification' | 'on_successful_inspection' | 'within_24_hours' | 'next_rental_booking';

export interface ContentRewardConfig {
  isEnabled: boolean; // Optional on the side of the businesses
  rewardAmount: number; // e.g. 200 PHP
  rewardType: RewardType;
  rewardPlatform?: string; // e.g. "GCash", "Maya", "Cash at Counter", "Rental Voucher"
  releaseTiming: RewardReleaseTiming;
  validityDays?: number; // e.g. 90 days validity if voucher
  customTerms?: string; // custom terms for availing the reward
  minVideoClips: number;
}

export * from './smartPricing';
export * from './socialInbox';
import { SmartPricingConfig } from './smartPricing';

export interface BusinessCustomization {
  depositPerMotorbike: number; // e.g. 2000
  depositRequirementType?: DepositRequirementType;
  fuelChargePerBar: number; // default 100 PHP per bar of missing fuel
  extensionFeePerHour: number; // default 150 PHP per hour rounded to nearest hour
  fuelMaxBars: number; // default 8 bars
  addOns: RentalAddOnItem[];
  nominatedPickupLocations?: PickupLocation[];
  instagramUrl?: string;
  tiktokUrl?: string;
  googleIntegration?: GoogleAccountIntegration;
  contentCashbackReward?: number;
  contentRewardConfig?: ContentRewardConfig;
  smartPricingConfig?: SmartPricingConfig;
  targetedNearbyTowns?: string[];
  operatingTown?: string;
  marketingRadiusKm?: number;
}

export interface DamageMarker {
  id: string;
  part: 'front' | 'left' | 'right' | 'rear' | 'wheels';
  description: string;
  severity: 'minor_scratch' | 'deep_scratch' | 'dent' | 'wear';
}

export interface BikePhotos {
  front?: string;
  left?: string;
  right?: string;
  rear?: string;
  dashboard?: string;
}

export interface VehicleInspection {
  id: string;
  reservationId: string;
  bikeId: string;
  type: 'pickup' | 'return';
  timestamp: string;
  inspectorName: string;
  odometerKm: number;
  odometerPhotoUrl?: string; // photo of odometer reading
  fuelPercentage: number;
  fuelBars: number; // e.g. 8 out of 8 bars
  // Return inspection calculations
  pickupOdometerKm?: number;
  pickupFuelBars?: number;
  distanceTraveledKm?: number;
  missingFuelBars?: number;
  fuelDiscrepancyCharge?: number; // missingFuelBars * fuelChargePerBar (₱100/bar default)
  scheduledReturnTime?: string;
  actualReturnTime?: string;
  lateHoursRounded?: number; // rounded to nearest hour
  lateExtensionFee?: number;
  totalReturnPenalties?: number;
  finalDepositRefund?: number;
  existingDamages: DamageMarker[];
  helmetSerialsIssued: string[];
  toolkitChecked: boolean;
  registrationDocsVerified: boolean;
  brakesAndLightsWorking: boolean;
  tiresCondition: 'Good' | 'Fair' | 'Requires Attention';
  bikePhotos?: BikePhotos;
  riderSelfieUrl?: string;
  socialMediaConsentGiven: boolean;
  agreementResponses?: {
    helmetAndSafety: boolean;
    boundaryLimits: boolean;
    fuelPolicy: boolean;
    damageLiability: boolean;
  };
  customerSignatureUrl?: string;
  customerAgreedToTerms: boolean;
  waiverSignedAt?: string;
  inspectorNotes?: string;
}

export type SocialPlatform = 'instagram' | 'facebook' | 'tiktok';

export interface SocialPost {
  id: string;
  title: string;
  platform: SocialPlatform;
  postType: 'reel' | 'story' | 'feed_photo' | 'carousel';
  topic: 'promo' | 'scenic_route' | 'fleet_spotlight' | 'rider_story' | 'safety_tips';
  caption: string;
  hashtags: string[];
  scheduledDate: string; // YYYY-MM-DD
  status: 'draft' | 'scheduled' | 'published';
  imageUrl?: string;
  likesCount?: number;
  musicTrack?: string;
  textOverlay?: string;
  targetDestinations?: string[];
  bestPostingTime?: string;
  riderSelfieUrl?: string;
  businessId?: string;
}

export interface TikTokStoryboardShot {
  timeframe?: string;
  action?: string;
  textOverlay?: string;
  cameraAngle: string;
  shotNumber?: number;
  durationSec?: number;
  actionDescription?: string;
  onScreenText?: string;
  audioCue?: string;
}

export interface TikTokTemplate {
  id: string;
  title: string;
  category: 'scenic' | 'guide' | 'pricing' | 'lifestyle' | 'action' | 'couple' | 'pov_ride' | 'hidden_gems' | 'budget_math' | 'golden_hour' | 'step_by_step' | 'offroad';
  badge?: string;
  durationSec?: number;
  hookOverlay: string;
  captionTemplate?: string;
  suggestedCaption?: string;
  musicTrack?: string;
  soundName?: string;
  capCutUrl?: string;
  capCutTemplateUrl?: string;
  tikTokTagUrl?: string;
  tiktokSoundUrl?: string;
  targetAudience?: string;
  recommendedTags?: string[];
  storyboard: TikTokStoryboardShot[];
  recommendedBikes?: string[];
}

export interface CustomerReview {
  id: string;
  customerName: string;
  location: string;
  bikeRented: string;
  rating: number;
  date: string;
  comment: string;
  destination: string;
  avatarInitials: string;
}

export interface GCashPaymentConfig {
  accountName: string; // e.g. "RIDEOUT ZAMBALES / MARK R."
  accountNumber: string; // e.g. "0917 832 9900"
  qrCodeUrl: string; // URL or base64 image data of GCash QR code
  instructions?: string;
  depositAmount: number; // in PHP, default 1000
}

export interface PayMayaPaymentConfig {
  accountName: string; // e.g. "RIDEOUT ZAMBALES / MARK R."
  accountNumber: string; // e.g. "0917 832 9900"
  qrCodeUrl: string; // URL or base64 image data of Maya QR code
  instructions?: string;
  depositAmount: number; // in PHP, default 1000
  isEnabled?: boolean;
}

export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'pending_activation';
export type SubscriptionTierKey = 'month_1_trial' | 'months_2_3' | 'months_4_6' | 'month_7_plus';

export interface SubscriptionPricingTier {
  key: SubscriptionTierKey;
  months: string; // e.g. "Month 1", "Months 2–3", "Months 4–6", "Month 7+"
  label: string; // "30-Day Free Trial", "Early Growth Tier", "Established Depot", "Scale & Revenue Share"
  baseMonthlyFee: number; // 0, 500, 1000, 1000 PHP
  transactionFeePercent: number; // 0, 0, 0, 1.0 (%)
  description: string;
}

export const SUBSCRIPTION_PRICING_SCHEDULE: SubscriptionPricingTier[] = [
  {
    key: 'month_1_trial',
    months: 'Month 1',
    label: '30-Day Free Trial',
    baseMonthlyFee: 0,
    transactionFeePercent: 0,
    description: '30 days full feature access completely free. Zero upfront fee and zero transaction commission.',
  },
  {
    key: 'months_2_3',
    months: 'Months 2–3',
    label: 'Early Growth Tier',
    baseMonthlyFee: 500,
    transactionFeePercent: 0,
    description: 'Subsidized rate of ₱500/month for the 2nd to 3rd month to support early growth.',
  },
  {
    key: 'months_4_6',
    months: 'Months 4–6',
    label: 'Established Depot Tier',
    baseMonthlyFee: 1000,
    transactionFeePercent: 0,
    description: 'Standard flat rate of ₱1,000/month for months 4 to 6 with 0% transaction commission.',
  },
  {
    key: 'month_7_plus',
    months: 'Month 7+',
    label: 'Scale & Revenue Share',
    baseMonthlyFee: 1000,
    transactionFeePercent: 1.0,
    description: '₱1,000/month base + 1% of total monthly booking transactions.',
  },
];

export interface BusinessSubscription {
  status: SubscriptionStatus;
  trialStartDate: string; // ISO date
  trialEndDate: string; // ISO date (30 days from trialStartDate)
  monthlyFee: number; // Current calculated monthly base fee (0, 500, or 1000 PHP)
  currentMonthNumber?: number; // 1, 2, 3, 4, 5, 6, 7...
  currentTierKey?: SubscriptionTierKey;
  transactionFeePercent?: number; // 0 or 1.0 (%)
  isActivated: boolean;
  activationCode: string; // e.g. ROZ-ACT-8291
  lastPaymentDate?: string;
  nextBillingDate: string;
  monthlyTransactionVolume?: number; // in PHP
  lastInvoiceTotal?: number; // baseMonthlyFee + (monthlyTransactionVolume * transactionFeePercent / 100)
}

export interface FacebookPageBranding {
  pageUrl: string;
  pageName: string;
  pageCategory?: string;
  followersCount?: number;
  aboutText?: string;
  importedAt?: string;
  isConnected?: boolean;
  inboxSynced?: boolean;
  pageId?: string;
  connectedAt?: string;
}

export interface StaffPermissions {
  canInspectPickups: boolean;      // Vehicle Pickup & Handover Inspections
  canApproveReturns: boolean;      // Return Inspections & Deposit Release
  canManageFleet: boolean;         // Fleet Editing, AI Photo Studio & Pricing
  canManageSettings: boolean;      // Shop Branding & GCash Financial Config
  canViewFinancialReports: boolean;// Revenue, Cashflow & Google Sheets
  canAcceptCashHandover: boolean;  // Counter Cash Payment Receipting
  canManageSmartPricing?: boolean; // Dynamic fleet utilization & length of stay discounts
  canAccessSocialInbox?: boolean;  // Omnichannel Messenger, WhatsApp, IG, TikTok
}

export interface DepotLocation {
  id: string;
  name: string;
  address: string;
  town: string;
  province: string;
  coordinates: { lat: number; lng: number };
  googleMapsPinUrl: string;
  storefrontPhotoUrl?: string;
  contactPhone?: string;
  isPrimary?: boolean;
  timingsSchedule?: string;
}

export interface StaffUser {
  id: string;
  businessId: string;
  name: string;
  email: string;
  mobile: string;
  role: 'manager' | 'staff';
  title: string; // e.g. "Depot Shift Supervisor", "Front Counter Receptionist"
  avatarUrl?: string;
  idCardPhotoUrl?: string;
  idNumber?: string;
  isActive: boolean;
  permissions: StaffPermissions;
  createdAt: string;
}

export interface RentalBusiness {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  ownerName: string;
  email: string;
  mobile: string;
  location: string;
  logoUrl: string;
  coverPhotoUrl: string;
  primaryColor?: string; // Brand accent e.g. amber, emerald, blue, purple
  facebookBranding?: FacebookPageBranding;
  gcashConfig: GCashPaymentConfig;
  paymayaConfig?: PayMayaPaymentConfig;
  payoutMethodChoice?: 'gcash' | 'paymaya' | 'both';
  subscription: BusinessSubscription;
  customization: BusinessCustomization;
  staffUsers?: StaffUser[];
  createdAt: string;
  isFlagship?: boolean; // Flagship / Platform owner (RideOut Zambales)
  town?: string;
  province?: string;
  coordinates?: { lat: number; lng: number };
  googleMapsPinUrl?: string;
  depotPhotoUrl?: string; // Physical picture of the depot facade / entrance for renters to locate shop
  ownerIdPhotoUrl?: string; // Uploaded Government ID of owner
  ownerIdType?: string;
  ownerIdNumber?: string;
  ownerIdExpiration?: string;
  emailVerified?: boolean;
  depots?: DepotLocation[];
  allowDifferentReturnDepot?: boolean;
  interDepotTransferFee?: number;
  vehicleInventoryCounts?: {
    hasBicycles: boolean;
    bicyclesQty: number;
    hasMotorbikes: boolean;
    motorbikesQty: number;
    hasCars: boolean;
    carsQty: number;
  };
  staffCount?: number;
  socials?: {
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    tiktok?: string;
    viber?: string;
    telegram?: string;
  };
  nominatedServerPhone?: string;
  androidGatewayConfig?: {
    serverPhone: string;
    hasInternetConnection: boolean;
    nativeMessagingActive: boolean;
    appInstalledOnServerPhone: boolean;
    permissionsAuthorized?: boolean;
    permissionsDate?: string;
  };
  googleIntegration?: GoogleAccountIntegration;
}

export interface PickupLocationContactStaff {
  name: string;
  mobile: string;
  role: string;
  photoUrl?: string;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  landmark: string;
  coordinates: { lat: number; lng: number };
  deliveryFee: number; // in PHP (0 for free)
  operatingHours: string;
  isDepotHQ: boolean;
  googleMapsUrl?: string;
  businessId?: string;
  photos?: string[]; // uploaded photos of depot facade, entrance, parking bay
  contactStaff?: PickupLocationContactStaff; // staff who should be contacted
  timingsSchedule?: string; // detailed opening timings & cut-offs
}

export type SupportedCurrency = 'PHP' | 'USD' | 'THB' | 'IDR' | 'VND' | 'MYR' | 'SGD';
export type SupportedLanguage = 'en' | 'fil' | 'id' | 'th' | 'vi';

export interface CurrencyConfig {
  code: SupportedCurrency;
  symbol: string;
  name: string;
  rateFromPHP: number;
}

export interface AiDamageComparisonResult {
  hasDamage: boolean;
  severity: 'none' | 'minor_scratches' | 'significant_damage' | 'crash_traces';
  confidenceScore: number;
  damagesDetected: Array<{
    area: 'front' | 'left' | 'right' | 'rear' | 'dashboard';
    description: string;
    isAcceptableMinorScratch: boolean;
  }>;
  summaryRecommendation: string;
  requiresAdminApproval: boolean;
  estimatedRepairCost?: number;
}

export interface PhysicalIdDeposit {
  idType: 'Driver License' | 'Passport' | 'UMID' | 'National ID' | 'Postal ID';
  idNumber: string;
  ownerType: 'driver' | 'passenger';
  ownerName: string;
  idPhotoUrl?: string;
  depositVaultTag?: string;
  isReturned: boolean;
  returnedAt?: string;
  adminApprovedBy?: string;
  // NEW: Photo of ID held by the depot staff member
  staffHoldingIdPhotoUrl?: string;
  staffReceiverName?: string;
  staffDepotUniformConfirmed?: boolean;
}

export interface ProximityAlertEvent {
  id: string;
  destinationId: string;
  destinationName: string;
  distanceMeters: number;
  triggeredAt: string;
  platform: 'facebook' | 'instagram' | 'tiktok';
  message: string;
  sentStatus: 'sent' | 'pending';
}

export interface RenterLocationSharing {
  isSharing: boolean;
  currentLat?: number;
  currentLng?: number;
  lastUpdated?: string;
  alerts: ProximityAlertEvent[];
}

export interface GoogleAccountIntegration {
  isConnected: boolean;
  email?: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
  driveFolderId?: string;
  driveFolderUrl?: string;
  lastSyncedAt?: string;
  syncedRowCount?: number;
  scopesGranted?: string[];
  permissionsGranted?: {
    driveCreateFilesAndFolders: boolean;
    sheetsManageDatabase: boolean;
  };
  googleBusinessProfileLinked?: boolean;
  googleBusinessProfileName?: string;
  googleBusinessRating?: number;
  googleBusinessReviewCount?: number;
}

export interface PassengerInfo {
  hasPassenger: boolean;
  passengerName?: string;
  relationship?: string;
  passengerIdSelfieUrl?: string;
  passengerIdType?: string;
}

export interface RenterDlSelfieVerification {
  selfieWithDlUrl?: string;
  licenseNumberMatches: boolean;
  matchedName: string;
  verifiedAt?: string;
}

export interface MotorbikeRegistrationDocs {
  officialReceiptUrl: string; // OR
  certificateOfRegistrationUrl: string; // CR
  plateNumber: string;
  engineNumber: string;
  chassisNumber: string;
  expiryDate: string;
  modelName?: string;
  customerName?: string;
  orUrl?: string;
  crUrl?: string;
}

export interface RecommendedDestination {
  id: string;
  name: string;
  category: 'surf' | 'beach' | 'falls' | 'scenic_loop' | 'food';
  location: string;
  coordinates: { lat: number; lng: number };
  description: string;
  googleMapsPlaceUrl: string;
  bestTimeToVisit: string;
}
