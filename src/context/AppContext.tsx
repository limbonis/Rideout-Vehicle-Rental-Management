import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Motorbike, 
  Reservation, 
  VehicleInspection, 
  SocialPost, 
  CustomerReview,
  ReservationStatus,
  BikeStatus,
  PromoCode,
  RentalBusiness,
  BusinessCustomization,
  RentalAddOnItem,
  SupportedCurrency,
  SupportedLanguage,
  PickupLocation,
  StaffUser,
  ContentRewardConfig,
  ProximityAlertEvent,
  SmartPricingConfig,
  SocialChatThread
} from '../types';
import { 
  INITIAL_BIKES, 
  INITIAL_RESERVATIONS, 
  INITIAL_INSPECTIONS, 
  INITIAL_SOCIAL_POSTS, 
  INITIAL_REVIEWS,
  INITIAL_PROMO_CODES,
  INITIAL_BUSINESSES
} from '../data/mockData';
import { INITIAL_NOMINATED_LOCATIONS } from '../utils/googleMapsHelper';
import { INITIAL_CHAT_THREADS } from '../data/mockSocialChats';
import { DEFAULT_SMART_PRICING_CONFIG } from '../types/smartPricing';

export type NavigationTab = 
  | 'overview' 
  | 'reservations' 
  | 'pickups' 
  | 'fleet' 
  | 'reports'
  | 'promos'
  | 'social' 
  | 'inbox'
  | 'branding'
  | 'partner-network'
  | 'customer-portal';

interface Toast {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  message: string;
}

export interface PromoValidationResult {
  valid: boolean;
  discount: number;
  message: string;
  promo?: PromoCode;
}

interface AppContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  bikes: Motorbike[];
  reservations: Reservation[];
  inspections: VehicleInspection[];
  socialPosts: SocialPost[];
  reviews: CustomerReview[];
  promoCodes: PromoCode[];
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeToast: (id: string) => void;
  
  // Bike Operations
  updateBikeStatus: (bikeId: string, status: BikeStatus) => void;
  addBike: (bike: Omit<Motorbike, 'id'>) => void;
  updateBikeMileage: (bikeId: string, newMileage: number, fuelLevel?: number) => void;
  
  // Reservation Operations
  addReservation: (reservation: Omit<Reservation, 'id' | 'bookingRef' | 'createdAt'>) => string;
  updateReservationStatus: (reservationId: string, status: ReservationStatus) => void;
  updateReservationPayment: (reservationId: string, paymentStatus: Reservation['paymentStatus'], depositPaid: number) => void;
  cancelReservation: (reservationId: string) => void;
  
  // Inspection / Pickup Operations
  saveInspection: (inspection: Omit<VehicleInspection, 'id' | 'timestamp'>) => string;
  getInspectionForReservation: (reservationId: string, type?: 'pickup' | 'return') => VehicleInspection | undefined;
  
  // Promo Code Operations
  addPromoCode: (promo: Omit<PromoCode, 'id' | 'usageCount'>) => void;
  updatePromoCode: (id: string, updates: Partial<PromoCode>) => void;
  togglePromoCode: (id: string) => void;
  deletePromoCode: (id: string) => void;
  validatePromoCode: (code: string, rentalDays: number, subtotalBeforeDiscount: number) => PromoValidationResult;

  // Social Media Operations
  addSocialPost: (post: Omit<SocialPost, 'id'>) => void;
  updatePostStatus: (postId: string, status: SocialPost['status']) => void;
  deleteSocialPost: (postId: string) => void;

  // Selected reservation to inspect
  selectedReservationForPickup: Reservation | null;
  setSelectedReservationForPickup: (res: Reservation | null) => void;

  // Multi-Tenant Business & Customization Operations
  businesses: RentalBusiness[];
  currentBusiness: RentalBusiness;
  currentBusinessId: string;
  setCurrentBusinessId: (id: string) => void;
  updateBusinessProfile: (id: string, updates: Partial<RentalBusiness>) => void;
  updateBusinessCustomization: (id: string, customization: Partial<BusinessCustomization>) => void;
  markReturnReminderSent: (reservationId: string) => void;
  importBrandingFromFacebook: (id: string, fbPageUrl: string) => Promise<boolean>;
  activateBusiness: (id: string) => void;
  extendBusinessTrial: (id: string, days: number) => void;
  registerNewBusiness: (data: {
    name: string;
    tagline: string;
    ownerName: string;
    email: string;
    mobile: string;
    location: string;
    facebookPageUrl?: string;
    gcashAccountName: string;
    gcashAccountNumber: string;
  }) => string;
  isPlatformAdmin: boolean;

  // Currency & Language (Southeast Asia defaults: PHP & en)
  currency: SupportedCurrency;
  setCurrency: (currency: SupportedCurrency) => void;
  language: SupportedLanguage;
  setLanguage: (language: SupportedLanguage) => void;

  // Google Workspace Cloud Archiving modal
  isArchiveModalOpen: boolean;
  setIsArchiveModalOpen: (open: boolean) => void;

  // Nominated Pickup Location Operations
  addNominatedPickupLocation: (businessId: string, location: PickupLocation) => void;
  updateNominatedPickupLocation: (businessId: string, location: PickupLocation) => void;
  deleteNominatedPickupLocation: (businessId: string, locationId: string) => void;

  // Admin Return Inspection Approval
  approveReturnInspection: (reservationId: string, adminName: string) => void;

  // AI Photo Studio for Fleet
  updateBikePhoto: (bikeId: string, imageUrl: string) => void;

  // Staff Users & RBAC (Manager + 1-2 Staff with granular permissions)
  activeStaffUser: StaffUser;
  switchActiveStaffUser: (staffId: string) => void;
  addStaffUser: (businessId: string, staff: Omit<StaffUser, 'id' | 'createdAt'>) => void;
  updateStaffUser: (businessId: string, staffId: string, updates: Partial<StaffUser>) => void;
  deleteStaffUser: (businessId: string, staffId: string) => void;

  // Trip Video Content Reward Config (Optional per business)
  updateContentRewardConfig: (businessId: string, config: Partial<ContentRewardConfig>) => void;

  // Fuel Deficit Settlement
  clearFuelDeficit: (reservationId: string, staffName: string) => void;

  // Renter GPS Location Sharing & Proximity Social Notifications
  updateRenterLocation: (reservationId: string, lat: number, lng: number) => void;
  triggerProximityAlert: (reservationId: string, alert: ProximityAlertEvent) => void;

  // Omnichannel Social Inbox (Messenger, WhatsApp, Instagram, TikTok)
  chatThreads: SocialChatThread[];
  selectedThreadId: string | null;
  setSelectedThreadId: (id: string | null) => void;
  sendChatMessage: (
    threadId: string, 
    text: string, 
    sender?: 'staff' | 'ai_assistant', 
    staffName?: string, 
    suggestedOffer?: {
      bikeModel: string;
      dailyRate: number;
      totalDays: number;
      smartDiscount: number;
      grandTotal: number;
    }
  ) => void;
  markThreadRead: (threadId: string) => void;
  updateThreadStatus: (threadId: string, status: SocialChatThread['status']) => void;
  unreadChatCount: number;

  // Smart Dynamic Pricing Engine (Utilization & Duration length)
  updateSmartPricingConfig: (businessId: string, config: Partial<SmartPricingConfig>) => void;

  // Nearby Towns Marketing Preference
  updateTargetedNearbyTowns: (businessId: string, towns: string[], operatingTown?: string) => void;

  // Reset to initial demo data
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  BIKES: 'rideout_bikes_v2',
  RESERVATIONS: 'rideout_reservations_v2',
  INSPECTIONS: 'rideout_inspections_v2',
  SOCIAL_POSTS: 'rideout_social_posts_v2',
  REVIEWS: 'rideout_reviews_v2',
  PROMOS: 'rideout_promos_v2',
  CHATS: 'rideout_social_chats_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('customer-portal');
  const [selectedReservationForPickup, setSelectedReservationForPickup] = useState<Reservation | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const [bikes, setBikes] = useState<Motorbike[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BIKES);
      return saved ? JSON.parse(saved) : INITIAL_BIKES;
    } catch {
      return INITIAL_BIKES;
    }
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
      return saved ? JSON.parse(saved) : INITIAL_RESERVATIONS;
    } catch {
      return INITIAL_RESERVATIONS;
    }
  });

  const [inspections, setInspections] = useState<VehicleInspection[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INSPECTIONS);
      return saved ? JSON.parse(saved) : INITIAL_INSPECTIONS;
    } catch {
      return INITIAL_INSPECTIONS;
    }
  });

  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROMOS);
      return saved ? JSON.parse(saved) : INITIAL_PROMO_CODES;
    } catch {
      return INITIAL_PROMO_CODES;
    }
  });

  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SOCIAL_POSTS);
      return saved ? JSON.parse(saved) : INITIAL_SOCIAL_POSTS;
    } catch {
      return INITIAL_SOCIAL_POSTS;
    }
  });

  const [reviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
    } catch {
      return INITIAL_REVIEWS;
    }
  });

  const [businesses, setBusinesses] = useState<RentalBusiness[]>(() => {
    try {
      const saved = localStorage.getItem('rideout_businesses_v2');
      return saved ? JSON.parse(saved) : INITIAL_BUSINESSES;
    } catch {
      return INITIAL_BUSINESSES;
    }
  });

  const [currentBusinessId, setCurrentBusinessId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('rideout_current_biz_id_v2');
      return saved || 'biz-rideout';
    } catch {
      return 'biz-rideout';
    }
  });

  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    try {
      const saved = localStorage.getItem('rideout_currency_v2');
      return (saved as SupportedCurrency) || 'PHP';
    } catch {
      return 'PHP';
    }
  });

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('rideout_lang_v2');
      return (saved as SupportedLanguage) || 'en';
    } catch {
      return 'en';
    }
  });

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState<boolean>(false);

  const [chatThreads, setChatThreads] = useState<SocialChatThread[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHATS);
      return saved ? JSON.parse(saved) : INITIAL_CHAT_THREADS;
    } catch {
      return INITIAL_CHAT_THREADS;
    }
  });

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>('thread-msg-01');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chatThreads));
    } catch (e) {
      console.error('Failed to sync chat threads to localStorage', e);
    }
  }, [chatThreads]);

  const setCurrency = (c: SupportedCurrency) => {
    setCurrencyState(c);
    localStorage.setItem('rideout_currency_v2', c);
  };

  const setLanguage = (l: SupportedLanguage) => {
    setLanguageState(l);
    localStorage.setItem('rideout_lang_v2', l);
  };

  const currentBusiness = businesses.find((b) => b.id === currentBusinessId) || businesses[0] || INITIAL_BUSINESSES[0];
  const isPlatformAdmin = Boolean(currentBusiness.isFlagship);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BIKES, JSON.stringify(bikes));
  }, [bikes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSPECTIONS, JSON.stringify(inspections));
  }, [inspections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(promoCodes));
  }, [promoCodes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SOCIAL_POSTS, JSON.stringify(socialPosts));
  }, [socialPosts]);

  useEffect(() => {
    localStorage.setItem('rideout_businesses_v2', JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem('rideout_current_biz_id_v2', currentBusinessId);
  }, [currentBusinessId]);

  const showToast = (message: string, type: Toast['type'] = 'success') => {
    const id = 'toast-' + Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Bike methods
  const updateBikeStatus = (bikeId: string, status: BikeStatus) => {
    setBikes((prev) =>
      prev.map((bike) => (bike.id === bikeId ? { ...bike, status } : bike))
    );
    showToast(`Motorbike status updated to ${status.toUpperCase()}`, 'info');
  };

  const addBike = (bikeData: Omit<Motorbike, 'id'>) => {
    const id = `bike-${Date.now()}`;
    const newBike: Motorbike = { ...bikeData, id };
    setBikes((prev) => [newBike, ...prev]);
    showToast(`${newBike.name} added to fleet inventory!`);
  };

  const updateBikeMileage = (bikeId: string, newMileage: number, fuelLevel?: number) => {
    setBikes((prev) =>
      prev.map((bike) =>
        bike.id === bikeId
          ? {
              ...bike,
              currentMileage: newMileage,
              fuelLevel: fuelLevel !== undefined ? fuelLevel : bike.fuelLevel,
            }
          : bike
      )
    );
  };

  const updateBikePhoto = (bikeId: string, imageUrl: string) => {
    setBikes((prev) =>
      prev.map((bike) => (bike.id === bikeId ? { ...bike, imageUrl } : bike))
    );
    showToast('Enhanced motorbike photo applied to fleet listing!', 'success');
  };

  // Promo Code Methods
  const addPromoCode = (promoData: Omit<PromoCode, 'id' | 'usageCount'>) => {
    const id = `promo-${Date.now()}`;
    const newPromo: PromoCode = {
      ...promoData,
      id,
      code: promoData.code.trim().toUpperCase(),
      usageCount: 0,
    };
    setPromoCodes((prev) => [newPromo, ...prev]);
    showToast(`Promo code ${newPromo.code} created!`);
  };

  const updatePromoCode = (id: string, updates: Partial<PromoCode>) => {
    setPromoCodes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast('Promo code updated');
  };

  const togglePromoCode = (id: string) => {
    setPromoCodes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p))
    );
    showToast('Promo status toggled', 'info');
  };

  const deletePromoCode = (id: string) => {
    setPromoCodes((prev) => prev.filter((p) => p.id !== id));
    showToast('Promo code removed', 'info');
  };

  const validatePromoCode = (
    code: string,
    rentalDays: number,
    subtotalBeforeDiscount: number
  ): PromoValidationResult => {
    const normalized = code.trim().toUpperCase();
    if (!normalized) {
      return { valid: false, discount: 0, message: 'Please enter a promo code.' };
    }

    const promo = promoCodes.find((p) => p.code.toUpperCase() === normalized);
    if (!promo) {
      return { valid: false, discount: 0, message: `Promo code "${normalized}" does not exist.` };
    }

    if (!promo.isActive) {
      return { valid: false, discount: 0, message: `Promo code "${normalized}" is currently inactive.` };
    }

    const today = new Date().toISOString().split('T')[0];
    if (promo.expiryDate && promo.expiryDate < today) {
      return { valid: false, discount: 0, message: `Promo code "${normalized}" expired on ${promo.expiryDate}.` };
    }

    if (promo.maxUses && promo.usageCount >= promo.maxUses) {
      return { valid: false, discount: 0, message: `Promo code "${normalized}" has reached its maximum usage limit.` };
    }

    if (promo.minRentalDays && rentalDays < promo.minRentalDays) {
      return { 
        valid: false, 
        discount: 0, 
        message: `Requires minimum rental of ${promo.minRentalDays} days (selected: ${rentalDays} days).` 
      };
    }

    let discount = 0;
    if (promo.discountType === 'percentage') {
      discount = Math.round((subtotalBeforeDiscount * promo.discountValue) / 100);
    } else {
      discount = Math.min(subtotalBeforeDiscount, promo.discountValue);
    }

    return {
      valid: true,
      discount,
      message: `Success! ${promo.discountType === 'percentage' ? `${promo.discountValue}%` : `₱${promo.discountValue}`} discount applied.`,
      promo,
    };
  };

  // Reservation methods
  const addReservation = (data: Omit<Reservation, 'id' | 'bookingRef' | 'createdAt'>): string => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingRef = `ROZ-2026-${randomSuffix}`;
    const id = `res-${Date.now()}`;
    const newReservation: Reservation = {
      ...data,
      id,
      bookingRef,
      createdAt: new Date().toISOString(),
    };

    setReservations((prev) => [newReservation, ...prev]);

    // If reservation has a promo code, increment usage count
    if (newReservation.promoCode) {
      setPromoCodes((prev) =>
        prev.map((p) =>
          p.code.toUpperCase() === newReservation.promoCode?.toUpperCase()
            ? { ...p, usageCount: p.usageCount + 1 }
            : p
        )
      );
    }

    // If reservation is immediately active, update bike
    if (newReservation.status === 'active') {
      updateBikeStatus(newReservation.bikeId, 'rented');
    }

    showToast(`Reservation ${bookingRef} created for ${newReservation.customerName}!`);
    return id;
  };

  const updateReservationStatus = (reservationId: string, status: ReservationStatus) => {
    let affectedBikeId: string | null = null;
    setReservations((prev) =>
      prev.map((res) => {
        if (res.id === reservationId) {
          affectedBikeId = res.bikeId;
          return { ...res, status };
        }
        return res;
      })
    );

    if (affectedBikeId) {
      if (status === 'active') {
        updateBikeStatus(affectedBikeId, 'rented');
      } else if (status === 'completed' || status === 'cancelled') {
        updateBikeStatus(affectedBikeId, 'available');
      }
    }

    showToast(`Reservation status updated to ${status.toUpperCase()}`);
  };

  const updateReservationPayment = (
    reservationId: string, 
    paymentStatus: Reservation['paymentStatus'], 
    depositPaid: number
  ) => {
    setReservations((prev) =>
      prev.map((res) =>
        res.id === reservationId
          ? { ...res, paymentStatus, depositPaid }
          : res
      )
    );
    showToast(`Payment recorded: ${paymentStatus}`);
  };

  const cancelReservation = (reservationId: string) => {
    updateReservationStatus(reservationId, 'cancelled');
  };

  // Inspection methods
  const saveInspection = (data: Omit<VehicleInspection, 'id' | 'timestamp'>): string => {
    const id = `insp-${Date.now()}`;
    const newInsp: VehicleInspection = {
      ...data,
      id,
      timestamp: new Date().toISOString(),
    };

    setInspections((prev) => [newInsp, ...prev]);

    // Link inspection to reservation
    setReservations((prev) =>
      prev.map((res) => {
        if (res.id === data.reservationId) {
          if (data.type === 'pickup') {
            return {
              ...res,
              status: 'active',
              pickupInspectionId: id,
            };
          } else {
            return {
              ...res,
              status: 'completed',
              returnInspectionId: id,
            };
          }
        }
        return res;
      })
    );

    // Update bike mileage & status
    updateBikeMileage(data.bikeId, data.odometerKm, data.fuelPercentage);
    if (data.type === 'pickup') {
      updateBikeStatus(data.bikeId, 'rented');
      showToast(`Pickup inspection saved! Digital waiver signed. Rental is now active.`, 'success');
    } else {
      updateBikeStatus(data.bikeId, 'cleaning');
      showToast(`Return inspection completed! Bike routed to turnaround bay.`, 'success');
    }

    return id;
  };

  const getInspectionForReservation = (reservationId: string, type?: 'pickup' | 'return') => {
    return inspections.find(
      (insp) => insp.reservationId === reservationId && (!type || insp.type === type)
    );
  };

  // Social media methods
  const addSocialPost = (postData: Omit<SocialPost, 'id'>) => {
    const id = `post-${Date.now()}`;
    const newPost: SocialPost = { ...postData, id };
    setSocialPosts((prev) => [newPost, ...prev]);
    showToast(`Post "${newPost.title}" saved to content studio!`);
  };

  const updatePostStatus = (postId: string, status: SocialPost['status']) => {
    setSocialPosts((prev) =>
      prev.map((post) => (post.id === postId ? { ...post, status } : post))
    );
    showToast(`Post status updated to ${status}`);
  };

  const deleteSocialPost = (postId: string) => {
    setSocialPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast(`Post deleted`, 'info');
  };

  // Business / Tenant Operations
  const updateBusinessProfile = (id: string, updates: Partial<RentalBusiness>) => {
    setBusinesses((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
    showToast('Shop profile & branding updated successfully!', 'success');
  };

  const updateBusinessCustomization = (id: string, customizationUpdates: Partial<BusinessCustomization>) => {
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updatedCustomization: BusinessCustomization = {
            ...b.customization,
            ...customizationUpdates,
            addOns: customizationUpdates.addOns || b.customization?.addOns || [],
          };
          return {
            ...b,
            customization: updatedCustomization,
          };
        }
        return b;
      })
    );
    showToast('Service pricing & add-on options updated!', 'success');
  };

  const markReturnReminderSent = (reservationId: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId
          ? { ...r, returnReminderSent: true, returnReminderSentAt: new Date().toISOString() }
          : r
      )
    );
    showToast('1-hour return reminder logged as sent to renter!', 'success');
  };

  const importBrandingFromFacebook = async (id: string, fbPageUrl: string): Promise<boolean> => {
    const cleanUrl = fbPageUrl.trim().toLowerCase();
    let importedName = '';
    let importedLogo = '';
    let importedCover = '';
    let category = 'Motorcycle Rental & Tours';
    let about = '';
    let followers = 6800;

    if (cleanUrl.includes('liwliwa')) {
      importedName = 'Liwliwa Surf & Moto Rentals';
      importedLogo = 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=200&auto=format&fit=crop&q=80';
      importedCover = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80';
      category = 'Surf Town Bike Rental';
      about = 'Beach cruiser scooters with surf racks in Liwliwa, San Felipe.';
      followers = 9200;
    } else if (cleanUrl.includes('elyu') || cleanUrl.includes('launion') || cleanUrl.includes('sanjuan')) {
      importedName = 'Elyu Wheels & Waves Moto';
      importedLogo = 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=200&auto=format&fit=crop&q=80';
      importedCover = 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1200&auto=format&fit=crop&q=80';
      category = 'Motorcycle Rental Shop';
      about = 'San Juan La Union premier motorbike rentals. Automatic scooters for beach hopping.';
      followers = 21400;
    } else if (cleanUrl.includes('siargao')) {
      importedName = 'Siargao Island Moto Rentals';
      importedLogo = 'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=200&auto=format&fit=crop&q=80';
      importedCover = 'https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=1200&auto=format&fit=crop&q=80';
      category = 'Island Scooter Hire';
      about = 'Daily and monthly automatic scooter rentals in General Luna, Siargao.';
      followers = 13500;
    } else {
      const pathPart = cleanUrl
        .replace(/https?:\/\/(www\.)?facebook\.com\/?/, '')
        .replace(/\/.*$/, '')
        .replace(/[-_.]/g, ' ');
      const words = pathPart
        ? pathPart.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
        : 'Island Moto Rentals';
      importedName = words || 'Partner Moto Rentals';
      importedLogo = 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=200&auto=format&fit=crop&q=80';
      importedCover = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80';
      about = `Official Facebook Page for ${importedName}. Verified rental operator.`;
      followers = Math.floor(3000 + Math.random() * 8000);
    }

    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          return {
            ...b,
            name: importedName,
            logoUrl: importedLogo,
            coverPhotoUrl: importedCover,
            facebookBranding: {
              pageUrl: fbPageUrl,
              pageName: importedName,
              pageCategory: category,
              followersCount: followers,
              aboutText: about,
              importedAt: new Date().toISOString(),
            },
          };
        }
        return b;
      })
    );

    showToast(`Branding successfully imported from Facebook: "${importedName}"!`, 'success');
    return true;
  };

  const activateBusiness = (id: string) => {
    const today = new Date();
    const nextBilling = new Date();
    nextBilling.setDate(today.getDate() + 30);

    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          return {
            ...b,
            subscription: {
              ...b.subscription,
              status: 'active',
              isActivated: true,
              activationCode: `ROZ-ACT-${Math.floor(1000 + Math.random() * 9000)}`,
              lastPaymentDate: today.toISOString().split('T')[0],
              nextBillingDate: nextBilling.toISOString().split('T')[0],
            },
          };
        }
        return b;
      })
    );
    showToast(`Partner business activated! Subscription set to ₱1,000/month.`, 'success');
  };

  const extendBusinessTrial = (id: string, days: number = 30) => {
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const currentEnd = new Date(b.subscription.trialEndDate || new Date());
          currentEnd.setDate(currentEnd.getDate() + days);
          return {
            ...b,
            subscription: {
              ...b.subscription,
              status: 'trial',
              trialEndDate: currentEnd.toISOString().split('T')[0],
              nextBillingDate: currentEnd.toISOString().split('T')[0],
            },
          };
        }
        return b;
      })
    );
    showToast(`Free trial extended by ${days} days!`, 'info');
  };

  const registerNewBusiness = (data: {
    name: string;
    tagline: string;
    ownerName: string;
    email: string;
    mobile: string;
    location: string;
    facebookPageUrl?: string;
    gcashAccountName: string;
    gcashAccountNumber: string;
  }): string => {
    const id = `biz-${Date.now()}`;
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const today = new Date();
    const trialEnd = new Date();
    trialEnd.setDate(today.getDate() + 30); // 30-day free trial

    const newBiz: RentalBusiness = {
      id,
      name: data.name,
      slug,
      tagline: data.tagline || 'Motorbike Rentals & Coastal Adventures',
      ownerName: data.ownerName,
      email: data.email,
      mobile: data.mobile,
      location: data.location,
      logoUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=200&auto=format&fit=crop&q=80',
      coverPhotoUrl: '/src/assets/images/hero_coastal_ride_1793338340532.jpg',
      primaryColor: '#f59e0b',
      isFlagship: false,
      facebookBranding: data.facebookPageUrl ? {
        pageUrl: data.facebookPageUrl,
        pageName: data.name,
        pageCategory: 'Motorcycle Rental',
        followersCount: 1500,
        aboutText: `${data.name} in ${data.location}.`,
        importedAt: today.toISOString(),
      } : undefined,
      gcashConfig: {
        accountName: data.gcashAccountName || data.name.toUpperCase(),
        accountNumber: data.gcashAccountNumber || data.mobile,
        qrCodeUrl: '',
        depositAmount: 1000,
        instructions: `Send ₱1,000 reservation deposit to ${data.gcashAccountName} via GCash.`,
      },
      subscription: {
        status: 'trial',
        trialStartDate: today.toISOString().split('T')[0],
        trialEndDate: trialEnd.toISOString().split('T')[0],
        monthlyFee: 1000,
        isActivated: true,
        activationCode: `ROZ-ACT-${Math.floor(1000 + Math.random() * 9000)}`,
        nextBillingDate: trialEnd.toISOString().split('T')[0],
      },
      customization: {
        depositPerMotorbike: 2000,
        fuelChargePerBar: 100,
        extensionFeePerHour: 150,
        fuelMaxBars: 8,
        addOns: [
          { id: `addon-${Date.now()}-1`, name: '2nd Passenger Helmet', price: 100, isActive: true, description: 'DOT certified clean passenger helmet' },
          { id: `addon-${Date.now()}-2`, name: 'Riding Raincoats (Pair)', price: 0, isActive: true, description: 'Free waterproof ponchos upon request' },
          { id: `addon-${Date.now()}-3`, name: 'Mobile Phone Mount & USB Charger', price: 100, isActive: true, description: 'GPS phone mount holder' },
        ],
      },
      createdAt: today.toISOString(),
    };

    setBusinesses((prev) => [...prev, newBiz]);
    setCurrentBusinessId(id);
    showToast(`Welcome ${newBiz.name}! 30-day free trial activated (₱1,000/mo thereafter).`, 'success');
    return id;
  };

  const addNominatedPickupLocation = (businessId: string, location: PickupLocation) => {
    setBusinesses((prev) =>
      prev.map((biz) => {
        if (biz.id === businessId) {
          const currentLocs = biz.customization.nominatedPickupLocations || INITIAL_NOMINATED_LOCATIONS;
          return {
            ...biz,
            customization: {
              ...biz.customization,
              nominatedPickupLocations: [...currentLocs, location],
            },
          };
        }
        return biz;
      })
    );
    showToast(`Added pickup location: ${location.name}`, 'success');
  };

  const updateNominatedPickupLocation = (businessId: string, location: PickupLocation) => {
    setBusinesses((prev) =>
      prev.map((biz) => {
        if (biz.id === businessId) {
          const currentLocs = biz.customization.nominatedPickupLocations || INITIAL_NOMINATED_LOCATIONS;
          return {
            ...biz,
            customization: {
              ...biz.customization,
              nominatedPickupLocations: currentLocs.map((l) => (l.id === location.id ? location : l)),
            },
          };
        }
        return biz;
      })
    );
    showToast(`Updated location: ${location.name}`, 'info');
  };

  const deleteNominatedPickupLocation = (businessId: string, locationId: string) => {
    setBusinesses((prev) =>
      prev.map((biz) => {
        if (biz.id === businessId) {
          const currentLocs = biz.customization.nominatedPickupLocations || INITIAL_NOMINATED_LOCATIONS;
          return {
            ...biz,
            customization: {
              ...biz.customization,
              nominatedPickupLocations: currentLocs.filter((l) => l.id !== locationId),
            },
          };
        }
        return biz;
      })
    );
    showToast('Pickup location removed', 'info');
  };

  const approveReturnInspection = (reservationId: string, adminName: string) => {
    setReservations((prev) =>
      prev.map((res) => {
        if (res.id === reservationId) {
          const updatedPhysical = res.physicalIdDeposit
            ? { ...res.physicalIdDeposit, isReturned: true, returnedAt: new Date().toISOString(), adminApprovedBy: adminName }
            : undefined;
          return {
            ...res,
            status: 'completed' as ReservationStatus,
            returnAdminApproved: true,
            returnAdminName: adminName,
            physicalIdDeposit: updatedPhysical,
          };
        }
        return res;
      })
    );
    showToast(`Return approved by ${adminName}! Deposited ID / security deposit released.`, 'success');
  };

  // Staff Users & RBAC State & Operations
  const [activeStaffId, setActiveStaffId] = useState<string>('staff-owner');

  const activeStaffUser: StaffUser =
    currentBusiness.staffUsers?.find((s) => s.id === activeStaffId) ||
    currentBusiness.staffUsers?.[0] || {
      id: 'staff-owner',
      businessId: currentBusiness.id,
      name: currentBusiness.ownerName,
      email: currentBusiness.email,
      mobile: currentBusiness.mobile,
      role: 'manager',
      title: 'Depot General Manager & Founder',
      isActive: true,
      permissions: {
        canInspectPickups: true,
        canApproveReturns: true,
        canManageFleet: true,
        canManageSettings: true,
        canViewFinancialReports: true,
        canAcceptCashHandover: true,
      },
      createdAt: '2026-01-01',
    };

  const switchActiveStaffUser = (staffId: string) => {
    setActiveStaffId(staffId);
    const target = currentBusiness.staffUsers?.find((s) => s.id === staffId);
    showToast(
      `Active operator: ${target?.name || 'Manager'} (${target?.role === 'manager' ? 'Full Access' : target?.title})`,
      'info'
    );
  };

  const addStaffUser = (businessId: string, staffData: Omit<StaffUser, 'id' | 'createdAt'>) => {
    const newStaff: StaffUser = {
      ...staffData,
      id: `staff-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id !== businessId) return b;
        const existing = b.staffUsers || [];
        if (existing.length >= 3) {
          showToast('Account limit: 1 Manager + maximum 2 Staff members', 'warning');
          return b;
        }
        return {
          ...b,
          staffUsers: [...existing, newStaff],
        };
      })
    );
    showToast(`Staff account created for ${newStaff.name}!`, 'success');
  };

  const updateStaffUser = (businessId: string, staffId: string, updates: Partial<StaffUser>) => {
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id !== businessId) return b;
        return {
          ...b,
          staffUsers: (b.staffUsers || []).map((s) =>
            s.id === staffId ? { ...s, ...updates } : s
          ),
        };
      })
    );
    showToast('Staff permissions updated', 'success');
  };

  const deleteStaffUser = (businessId: string, staffId: string) => {
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id !== businessId) return b;
        return {
          ...b,
          staffUsers: (b.staffUsers || []).filter((s) => s.id !== staffId),
        };
      })
    );
    showToast('Staff member removed', 'info');
  };

  // Trip Video Content Reward Program (Optional per business)
  const updateContentRewardConfig = (businessId: string, config: Partial<ContentRewardConfig>) => {
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id !== businessId) return b;
        const existingReward = b.customization?.contentRewardConfig || {
          isEnabled: false,
          rewardAmount: 200,
          rewardType: 'cashback_gcash' as const,
          rewardPlatform: 'GCash',
          releaseTiming: 'instant_on_verification' as const,
          validityDays: 90,
          minVideoClips: 3,
        };
        return {
          ...b,
          customization: {
            ...b.customization,
            contentRewardConfig: {
              ...existingReward,
              ...config,
            },
          },
        };
      })
    );
    showToast('Trip video reward terms updated for your shop!', 'success');
  };

  // Fuel Deficit Settlement
  const clearFuelDeficit = (reservationId: string, staffName: string) => {
    setReservations((prev) =>
      prev.map((r) =>
        r.id === reservationId
          ? {
              ...r,
              fuelDeficitCleared: true,
              notes: `${r.notes ? r.notes + ' | ' : ''}Fuel deficit cleared with depot staff ${staffName}.`,
            }
          : r
      )
    );
    showToast(`Fuel deficit cleared with depot by ${staffName}. Deposit is ready for release.`, 'success');
  };

  // Renter GPS Location Sharing & Proximity Social Notifications
  const updateRenterLocation = (reservationId: string, lat: number, lng: number) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id !== reservationId) return r;
        const existing = r.renterLocationSharing || { isSharing: true, alerts: [] };
        return {
          ...r,
          renterLocationSharing: {
            ...existing,
            isSharing: true,
            currentLat: lat,
            currentLng: lng,
            lastUpdated: new Date().toISOString(),
          },
        };
      })
    );
  };

  const triggerProximityAlert = (reservationId: string, alert: ProximityAlertEvent) => {
    setReservations((prev) =>
      prev.map((r) => {
        if (r.id !== reservationId) return r;
        const existing = r.renterLocationSharing || { isSharing: true, alerts: [] };
        if (existing.alerts.some((a) => a.destinationId === alert.destinationId)) {
          return r;
        }
        return {
          ...r,
          renterLocationSharing: {
            ...existing,
            alerts: [alert, ...existing.alerts],
          },
        };
      })
    );
    showToast(`📍 Proximity alert sent to customer's ${alert.platform.toUpperCase()}: ${alert.destinationName}!`, 'info');
  };

  const unreadChatCount = chatThreads.reduce((sum, t) => sum + (t.unreadCount || 0), 0);

  const markThreadRead = (threadId: string) => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          unreadCount: 0,
          messages: t.messages.map((m) => ({ ...m, isRead: true })),
        };
      })
    );
  };

  const updateThreadStatus = (threadId: string, status: SocialChatThread['status']) => {
    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        return { ...t, status };
      })
    );
    showToast(`Conversation marked as ${status.toUpperCase()}`, 'info');
  };

  const sendChatMessage = (
    threadId: string,
    text: string,
    sender: 'staff' | 'ai_assistant' = 'staff',
    staffName?: string,
    suggestedOffer?: {
      bikeModel: string;
      dailyRate: number;
      totalDays: number;
      smartDiscount: number;
      grandTotal: number;
    }
  ) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender,
      staffName: staffName || activeStaffUser?.name || 'Depot Staff',
      text,
      timestamp: timeStr,
      isRead: true,
      suggestedOffer,
    };

    setChatThreads((prev) =>
      prev.map((t) => {
        if (t.id !== threadId) return t;
        return {
          ...t,
          lastMessageText: text,
          lastMessageTimestamp: timeStr,
          unreadCount: 0,
          messages: [...t.messages, newMsg],
        };
      })
    );
  };

  const updateSmartPricingConfig = (businessId: string, config: Partial<SmartPricingConfig>) => {
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id !== businessId) return b;
        const existing = b.customization?.smartPricingConfig || DEFAULT_SMART_PRICING_CONFIG;
        return {
          ...b,
          customization: {
            ...b.customization,
            smartPricingConfig: {
              ...existing,
              ...config,
            },
          },
        };
      })
    );
    showToast('Smart Dynamic Pricing settings saved successfully!', 'success');
  };

  const updateTargetedNearbyTowns = (businessId: string, towns: string[], operatingTown?: string) => {
    setBusinesses((prev) =>
      prev.map((b) => {
        if (b.id !== businessId) return b;
        return {
          ...b,
          customization: {
            ...b.customization,
            targetedNearbyTowns: towns,
            ...(operatingTown ? { operatingTown } : {}),
          },
        };
      })
    );
    showToast(`Targeted marketing towns updated (${towns.length} towns selected)`, 'success');
  };

  const resetDemoData = () => {
    setBikes(INITIAL_BIKES);
    setReservations(INITIAL_RESERVATIONS);
    setInspections(INITIAL_INSPECTIONS);
    setPromoCodes(INITIAL_PROMO_CODES);
    setSocialPosts(INITIAL_SOCIAL_POSTS);
    setBusinesses(INITIAL_BUSINESSES);
    setCurrentBusinessId('biz-rideout');
    setChatThreads(INITIAL_CHAT_THREADS);
    localStorage.removeItem(STORAGE_KEYS.BIKES);
    localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
    localStorage.removeItem(STORAGE_KEYS.INSPECTIONS);
    localStorage.removeItem(STORAGE_KEYS.PROMOS);
    localStorage.removeItem(STORAGE_KEYS.SOCIAL_POSTS);
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem('rideout_businesses_v2');
    localStorage.removeItem('rideout_current_biz_id_v2');
    showToast('Reset to original sample data', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        bikes,
        reservations,
        inspections,
        socialPosts,
        reviews,
        promoCodes,
        toasts,
        showToast,
        removeToast,
        updateBikeStatus,
        addBike,
        updateBikeMileage,
        updateBikePhoto,
        activeStaffUser,
        switchActiveStaffUser,
        addStaffUser,
        updateStaffUser,
        deleteStaffUser,
        updateContentRewardConfig,
        clearFuelDeficit,
        updateRenterLocation,
        triggerProximityAlert,
        addReservation,
        updateReservationStatus,
        updateReservationPayment,
        cancelReservation,
        saveInspection,
        getInspectionForReservation,
        addPromoCode,
        updatePromoCode,
        togglePromoCode,
        deletePromoCode,
        validatePromoCode,
        addSocialPost,
        updatePostStatus,
        deleteSocialPost,
        selectedReservationForPickup,
        setSelectedReservationForPickup,
        businesses,
        currentBusiness,
        currentBusinessId,
        setCurrentBusinessId,
        updateBusinessProfile,
        updateBusinessCustomization,
        markReturnReminderSent,
        importBrandingFromFacebook,
        activateBusiness,
        extendBusinessTrial,
        registerNewBusiness,
        isPlatformAdmin,
        currency,
        setCurrency,
        language,
        setLanguage,
        isArchiveModalOpen,
        setIsArchiveModalOpen,
        addNominatedPickupLocation,
        updateNominatedPickupLocation,
        deleteNominatedPickupLocation,
        approveReturnInspection,
        chatThreads,
        selectedThreadId,
        setSelectedThreadId,
        sendChatMessage,
        markThreadRead,
        updateThreadStatus,
        unreadChatCount,
        updateSmartPricingConfig,
        updateTargetedNearbyTowns,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
