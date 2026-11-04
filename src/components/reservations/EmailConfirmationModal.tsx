import React from 'react';
import { Reservation, Motorbike } from '../../types';
import { Mail, KeyRound, X, CheckCircle, Calendar, MapPin, Bike, Copy } from 'lucide-react';

interface EmailConfirmationModalProps {
  reservation: Reservation;
  bike?: Motorbike;
  onClose: () => void;
  onStartPickup: (reservation: Reservation) => void;
}

export const EmailConfirmationModal: React.FC<EmailConfirmationModalProps> = ({
  reservation,
  bike,
  onClose,
  onStartPickup,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden my-8 text-xs">
        {/* Top Window Bar */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-stone-200">Customer Email Confirmation Preview</span>
            <span className="font-mono text-[11px] text-amber-400">#{reservation.bookingRef}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Header Metadata */}
        <div className="p-4 bg-stone-950/80 border-b border-stone-800 space-y-1 text-stone-400 font-mono text-[11px]">
          <div><span className="text-stone-500 font-sans">From: </span>RideOut Zambales Moto Rental &lt;rideoutzambales@gmail.com&gt;</div>
          <div><span className="text-stone-500 font-sans">To: </span>{reservation.customerName} &lt;{reservation.customerEmail}&gt;</div>
          <div><span className="text-stone-500 font-sans">Subject: </span><strong className="text-stone-200 font-sans">Confirmed: Your Motorbike Rental is Ready! [Ref: {reservation.bookingRef}]</strong></div>
        </div>

        {/* Email Body Content */}
        <div className="p-6 md:p-8 space-y-6 bg-stone-900 text-stone-200 leading-relaxed max-h-[75vh] overflow-y-auto">
          {/* Brand Banner */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Bike className="w-4 h-4" />
              </div>
              <span className="font-bold text-base text-stone-100">RideOut Zambales</span>
            </div>
            <span className="text-[11px] text-stone-500">San Felipe · Liwliwa · Subic Loop</span>
          </div>

          <div>
            <h2 className="text-lg font-bold text-stone-100">
              Hi {reservation.customerName}, your ride is locked in! 🛵🌊
            </h2>
            <p className="mt-2 text-stone-300">
              Thank you for booking with RideOut Zambales! Your reservation has been confirmed. Below are your vehicle and arrival details.
            </p>
          </div>

          {/* Prominent Call to Action Button ("Pickup" button requested by user) */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-400/30 text-center space-y-3">
            <div className="text-stone-200 font-medium">
              Ready to collect your motorbike at our depot?
            </div>
            <button
              onClick={() => {
                onStartPickup(reservation);
                onClose();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-lg hover:shadow-amber-400/20 transition-all scale-100 hover:scale-[1.02]"
            >
              <KeyRound className="w-4 h-4" />
              <span>Start Pickup & Vehicle Inspection</span>
            </button>
            <p className="text-[11px] text-stone-400">
              Tap above to view the pickup sequence, complete agreements, snap bike photos, and take your rider selfie!
            </p>
          </div>

          {/* Reserved Motorbike Card */}
          <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 flex flex-col sm:flex-row items-center gap-4">
            {bike && (
              <img
                src={bike.imageUrl}
                alt={bike.name}
                className="w-32 h-24 object-cover rounded-lg bg-stone-800 shrink-0"
              />
            )}
            <div className="space-y-1 text-left w-full">
              <div className="font-bold text-sm text-stone-100">{reservation.bikeName}</div>
              <div className="text-amber-400 font-mono text-[11px]">Plate: {bike?.plateNumber || 'ZA-9842'} · {bike?.transmission}</div>
              <div className="text-stone-400 text-[11px]">
                Schedule: <span className="text-stone-200">{reservation.startDate} ({reservation.startTime})</span> to <span className="text-stone-200">{reservation.endDate} ({reservation.endTime})</span>
              </div>
              <div className="text-stone-400 text-[11px]">
                Pickup Location: <span className="text-stone-200">{reservation.pickupLocation}</span>
              </div>
              {reservation.selectedAddOns && reservation.selectedAddOns.length > 0 && (
                <div className="pt-1.5 border-t border-stone-800 text-[11px] text-stone-400">
                  <span className="text-stone-500">Selected Add-ons: </span>
                  <span className="text-stone-300 font-medium">
                    {reservation.selectedAddOns.map(a => `${a.name} (${a.price === 0 ? 'Free' : `+₱${a.price}`})`).join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Summary */}
          <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 font-mono text-[11px] space-y-1.5">
            <div className="flex justify-between text-stone-400 font-sans font-bold uppercase text-[10px] pb-1 border-b border-stone-800">
              <span>Financial Overview</span>
              <span>Amount (PHP)</span>
            </div>
            <div className="flex justify-between text-stone-300">
              <span>Rental ({reservation.totalDays} days × ₱{reservation.dailyRate.toLocaleString()}):</span>
              <span>₱{(reservation.dailyRate * reservation.totalDays).toLocaleString()}</span>
            </div>
            {reservation.addOnsTotal ? (
              <div className="flex justify-between text-stone-300">
                <span>Add-on Accessories ({reservation.selectedAddOns?.length}):</span>
                <span>+₱{reservation.addOnsTotal.toLocaleString()}</span>
              </div>
            ) : null}
            {reservation.discountAmount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Promo Discount ({reservation.promoCode}):</span>
                <span>-₱{reservation.discountAmount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-300">
              <span>Refundable Security Deposit:</span>
              <span className="text-amber-400">₱{reservation.securityDeposit.toLocaleString()}</span>
            </div>
            <div className="pt-2 border-t border-stone-800 flex justify-between font-bold text-xs text-stone-100">
              <span>Grand Total:</span>
              <span className="text-amber-400">₱{reservation.totalAmount.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment & Transfer Confirmation Summary */}
          {reservation.paymentProofUrl && (
            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>💳 Payment Transfer Confirmation Attached</span>
                </span>
                <span className="text-[10px] text-emerald-300 font-mono">
                  Ref: {reservation.gcashReferenceNumber || 'Verified'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={reservation.paymentProofUrl}
                  alt="Payment Confirmation Slip"
                  className="w-16 h-20 object-contain rounded border border-emerald-500/40 bg-stone-950 shrink-0"
                />
                <div className="text-[11px] text-stone-300 space-y-0.5">
                  <div className="text-stone-100 font-semibold">Deposit: ₱{reservation.depositPaid.toLocaleString()} Received</div>
                  {reservation.payerAccountName && (
                    <div className="text-stone-400 font-mono text-[10px]">Payer/Bank: {reservation.payerAccountName}</div>
                  )}
                  <div className="text-emerald-400 text-[10px]">
                    ✓ Transfer slip verified by depot team
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Facebook Page Like & Booking Alerts Confirmation */}
          <div className="p-3.5 rounded-xl border border-blue-500/30 bg-blue-950/20 text-xs space-y-1.5">
            <div className="font-bold text-blue-400 flex items-center gap-1.5">
              <span>👍 Facebook Page Followed & Multi-Channel Alerts Active</span>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              You permitted Facebook alerts! Copies of your reservation, payment receipts, and direct pickup links have been linked to your Facebook profile. You will also receive an automated return reminder 1 hour before scheduled check-in.
            </p>
            <div className="pt-1">
              <a
                href={`https://m.me/rideoutzambales?text=${encodeURIComponent(`Hi RideOut Zambales! I booked ${reservation.bikeName} (${reservation.bookingRef}). Connecting my Messenger for 1-hour return alerts and pickup links.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded text-[11px] font-semibold transition-colors"
              >
                <span>Open Messenger & Send Handshake →</span>
              </a>
            </div>
          </div>

          {/* Reminder */}
          <div className="text-[11px] text-stone-400 border-t border-stone-800 pt-4 space-y-1">
            <p><strong>Reminders for Pickup:</strong></p>
            <p>1. Present your verified physical or digital driver's license with Code A or A1.</p>
            <p>2. We will inspect the vehicle together, record odometer and fuel bars, and take your rider selfie.</p>
            <p>3. Questions or late arrival? Contact our hotline at <strong>+63 917 832 9900</strong> or reply to this email.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
