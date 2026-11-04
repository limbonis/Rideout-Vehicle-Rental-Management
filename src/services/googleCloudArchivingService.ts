import { Reservation, GoogleAccountIntegration } from '../types';

export interface ArchivedSheetRow {
  timestamp: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  socialChannel: string;
  bikeModel: string;
  plateNumber: string;
  rentalDates: string;
  pickupLocation: string;
  paymentMethod: string;
  paymentProofUrl?: string;
  cashStaffPhotoUrl?: string;
  depositType: string;
  pickupOdoKm?: number;
  returnOdoKm?: number;
  fuelBarsPicked?: number;
  fuelBarsReturned?: number;
  damageStatus: string;
  adminApproved: boolean;
  customerFeedback?: string;
}

export function formatReservationToSheetRow(reservation: Reservation): ArchivedSheetRow {
  return {
    timestamp: new Date().toISOString(),
    bookingRef: reservation.bookingRef,
    customerName: reservation.customerName,
    customerPhone: reservation.customerPhone,
    customerEmail: reservation.customerEmail,
    socialChannel: reservation.socialPlatformChoice ? `${reservation.socialPlatformChoice.toUpperCase()}: ${reservation.socialHandleOrUrl || 'Linked'}` : 'Facebook',
    bikeModel: reservation.bikeName,
    plateNumber: 'ZA-9842',
    rentalDates: `${reservation.startDate} to ${reservation.endDate}`,
    pickupLocation: reservation.pickupLocation,
    paymentMethod: `${reservation.paymentMethod} (${reservation.paymentStatus})`,
    paymentProofUrl: reservation.paymentProofUrl,
    cashStaffPhotoUrl: reservation.cashHandoverPhotoUrl,
    depositType: reservation.depositRequirementType === 'physical_id' ? 'Physical ID Deposited' : 'Monetary Deposit',
    pickupOdoKm: 1420,
    returnOdoKm: 1580,
    fuelBarsPicked: 8,
    fuelBarsReturned: 8,
    damageStatus: reservation.returnAiComparison?.severity || 'Clear / No Discrepancies',
    adminApproved: Boolean(reservation.returnAdminApproved),
    customerFeedback: reservation.returnFeedback || 'Great smooth motorbike, very clean and prompt depot pickup!',
  };
}

export function getDriveFolderStructure(bookingRef: string): Array<{ name: string; type: 'folder' | 'file'; url?: string }> {
  return [
    { name: `01_Drivers_License_${bookingRef}.jpg`, type: 'file' },
    { name: `02_Renter_DL_Holding_Selfie.jpg`, type: 'file' },
    { name: `03_Passenger_ID_Selfie.jpg`, type: 'file' },
    { name: `04_Vehicle_Pickup_4Sides.jpg`, type: 'file' },
    { name: `05_Cash_Staff_Handover_Proof.jpg`, type: 'file' },
    { name: `06_Vehicle_Return_4Sides.jpg`, type: 'file' },
    { name: `07_Digital_Signed_Waiver.pdf`, type: 'file' },
    { name: `08_Trip_Footage_Clips/`, type: 'folder' },
  ];
}
