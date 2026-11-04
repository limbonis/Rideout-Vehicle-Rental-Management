import React from 'react';
import { Reservation, VehicleInspection, Motorbike, RentalBusiness } from '../../types';
import { 
  Mail, 
  KeyRound, 
  X, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Bike, 
  Gauge, 
  Fuel, 
  ShieldCheck, 
  Phone, 
  Printer, 
  ArrowRight,
  Sparkles,
  RotateCcw,
  Copy,
  ExternalLink
} from 'lucide-react';

interface PickupEmailModalProps {
  reservation: Reservation;
  inspection: VehicleInspection;
  bike?: Motorbike;
  business: RentalBusiness;
  onClose: () => void;
  onStartDropoff: (reservation: Reservation) => void;
}

export const PickupEmailModal: React.FC<PickupEmailModalProps> = ({
  reservation,
  inspection,
  bike,
  business,
  onClose,
  onStartDropoff,
}) => {
  const maxBars = business.customization?.fuelMaxBars || 8;
  const recordedBars = inspection.fuelBars || maxBars;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    alert('Rental return pass link copied to clipboard!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-6 text-xs text-stone-200">
        
        {/* Top Window Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-400/20 text-amber-400 flex items-center justify-center">
              <Mail className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-stone-100 text-xs">Post-Pickup Official Receipt & Return Pass</span>
              <span className="ml-2 font-mono text-[11px] text-amber-400">#{reservation.bookingRef}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Header Simulation */}
        <div className="px-5 py-3 bg-stone-950/70 border-b border-stone-800/80 space-y-1 font-mono text-[11px] text-stone-400">
          <div><span className="text-stone-500 font-sans">From: </span>{business.name} &lt;{business.email}&gt;</div>
          <div><span className="text-stone-500 font-sans">To: </span>{reservation.customerName} &lt;{reservation.customerEmail}&gt;</div>
          <div><span className="text-stone-500 font-sans">Subject: </span><strong className="text-stone-200 font-sans">Vehicle Dispatched: Official Pickup Telemetry & Return Drop-Off Pass [{reservation.bookingRef}]</strong></div>
        </div>

        {/* Scrollable Email Body */}
        <div className="p-5 md:p-7 space-y-6 max-h-[72vh] overflow-y-auto">
          
          {/* Header Brand */}
          <div className="flex items-center justify-between border-b border-stone-800 pb-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-stone-950 font-bold overflow-hidden"
                style={{ backgroundColor: business.primaryColor || '#f59e0b' }}
              >
                {business.logoUrl ? (
                  <img src={business.logoUrl} alt={business.name} className="w-full h-full object-cover" />
                ) : (
                  <Bike className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-stone-100 text-sm">{business.name}</h3>
                <p className="text-[11px] text-stone-400">{business.location}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
              Active Rental
            </span>
          </div>

          {/* Greeting */}
          <div>
            <h2 className="text-base font-bold text-stone-100">
              Hi {reservation.customerName}, you're all set to ride! 🛵💨
            </h2>
            <p className="text-xs text-stone-300 mt-1 leading-relaxed">
              Your pickup inspection has been recorded and verified by our depot fleet lead. Below is your official copy containing your departure odometer reading, fuel level, and condition photos.
            </p>
          </div>

          {/* PROMINENT BUTTON: Initiate Drop-off / Return */}
          <div className="p-5 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-400/10 to-transparent border-2 border-amber-400/40 text-center space-y-3 shadow-lg">
            <div className="text-stone-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Ready to Return Your Motorbike?</span>
            </div>
            <p className="text-[11px] text-stone-300 max-w-md mx-auto">
              When bringing the bike back to our depot, tap the button below to upload return photos and finalize your fuel reconciliation.
            </p>
            <button
              onClick={() => {
                onStartDropoff(reservation);
                onClose();
              }}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-lg hover:shadow-amber-400/20 transition-all scale-100 hover:scale-[1.02]"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>Initiate Drop-Off / Return Vehicle</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-[10px] text-stone-400 font-mono">
              Return Deadline: {reservation.endDate} at {reservation.endTime} ({reservation.dropoffLocation})
            </div>
          </div>

          {/* ODOMETER & FUEL TELEMETRY (Explicitly requested by user) */}
          <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5" />
              <span>Logged Departure Telemetry at Pickup</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              {/* Odometer Reading */}
              <div className="p-3.5 rounded-lg border border-stone-800 bg-stone-900/60 space-y-1.5">
                <div className="text-stone-400 text-[11px] flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" />
                  <span>Logged Odometer Reading:</span>
                </div>
                <div className="text-2xl font-black font-mono text-stone-100 tracking-tight">
                  {inspection.odometerKm.toLocaleString()} <span className="text-xs text-stone-400 font-sans font-normal">KM</span>
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Odometer verified against vehicle dashboard</span>
                </div>
              </div>

              {/* Fuel Level In Bars */}
              <div className="p-3.5 rounded-lg border border-stone-800 bg-stone-900/60 space-y-1.5">
                <div className="text-stone-400 text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Fuel className="w-3.5 h-3.5 text-amber-400" />
                    <span>Logged Fuel Gauge:</span>
                  </span>
                  <span className="font-mono font-bold text-amber-400">{recordedBars} / {maxBars} Bars</span>
                </div>

                {/* Visual Bars representation */}
                <div className="flex gap-1 py-1">
                  {Array.from({ length: maxBars }).map((_, idx) => (
                    <div 
                      key={idx}
                      className={`h-4 flex-1 rounded-xs transition-colors ${
                        idx < recordedBars
                          ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                          : 'bg-stone-800'
                      }`}
                    />
                  ))}
                </div>

                <div className="text-[10px] text-stone-400">
                  Policy: Return with {recordedBars} bars. Discrepancy is ₱{business.customization?.fuelChargePerBar || 100}/bar.
                </div>
              </div>
            </div>
          </div>

          {/* VEHICLE & RENTAL SUMMARY */}
          <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
            <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bike className="w-3.5 h-3.5 text-amber-400" />
              <span>Assigned Motorbike & Rental Schedule</span>
            </span>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {bike?.imageUrl && (
                <img
                  src={bike.imageUrl}
                  alt={bike.name}
                  className="w-28 h-20 object-cover rounded-lg bg-stone-800 shrink-0"
                />
              )}
              <div className="space-y-1 w-full text-xs">
                <div className="font-bold text-sm text-stone-100">{reservation.bikeName}</div>
                <div className="text-amber-400 font-mono text-[11px]">
                  Plate: {bike?.plateNumber || 'ZA-9842'} · {bike?.transmission} · {bike?.engineCc}cc
                </div>
                <div className="text-stone-400 text-[11px] flex flex-wrap gap-x-4 gap-y-1 pt-1">
                  <div>Pickup: <span className="text-stone-200">{reservation.startDate} ({reservation.startTime})</span></div>
                  <div>Scheduled Return: <span className="text-stone-200 font-semibold">{reservation.endDate} ({reservation.endTime})</span></div>
                  <div>Location: <span className="text-stone-200">{reservation.pickupLocation}</span></div>
                </div>
              </div>
            </div>

            {/* Selected Add-ons */}
            {reservation.selectedAddOns && reservation.selectedAddOns.length > 0 && (
              <div className="pt-2 border-t border-stone-800/80">
                <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold">Included Accessories & Add-ons:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {reservation.selectedAddOns.map((addon) => (
                    <span key={addon.id} className="px-2 py-0.5 rounded bg-stone-900 border border-stone-800 text-[11px] text-stone-300">
                      {addon.name} {addon.price === 0 ? '(Free)' : `(+₱${addon.price})`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* INSPECTION PHOTOS AT PICKUP */}
          {inspection.bikePhotos && (
            <div className="space-y-2.5">
              <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider">
                Motorbike 360° Condition Photos at Pickup
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: 'Front Angle', url: inspection.bikePhotos.front },
                  { label: 'Left Fairing', url: inspection.bikePhotos.left },
                  { label: 'Right Fairing', url: inspection.bikePhotos.right },
                  { label: 'Rear & Plate', url: inspection.bikePhotos.rear },
                ].map((item, i) => (
                  <div key={i} className="rounded-lg border border-stone-800 bg-stone-950 p-1.5 space-y-1">
                    <div className="aspect-video bg-stone-900 rounded overflow-hidden">
                      {item.url ? (
                        <img src={item.url} alt={item.label} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-600 text-[10px]">Photo saved</div>
                      )}
                    </div>
                    <div className="text-[10px] text-stone-400 text-center font-medium truncate">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SIGNATURE & SAFETY VERIFICATION */}
          <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="text-stone-300 font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Digital Waiver & Terms Verified</span>
              </div>
              <p className="text-[11px] text-stone-400">
                Helmets Issued: {inspection.helmetSerialsIssued?.join(', ') || 'ROZ-DOT-08, ROZ-DOT-14'}
              </p>
              <p className="text-[11px] text-stone-400">
                Inspector: {inspection.inspectorName}
              </p>
            </div>

            {inspection.customerSignatureUrl && (
              <div className="border border-stone-800 rounded-lg p-2 bg-stone-900/60 text-center shrink-0">
                <div className="text-[9px] text-stone-500 font-mono mb-1">Renter Digital Signature</div>
                <img src={inspection.customerSignatureUrl} alt="Signature" className="h-9 w-28 object-contain filter invert" />
              </div>
            )}
          </div>

          {/* Emergency Contact */}
          <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-950 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-stone-300">
              <Phone className="w-4 h-4 text-amber-400" />
              <span>24/7 Roadside Assistance:</span>
              <strong className="text-stone-100 font-mono">{business.mobile}</strong>
            </div>
            <span className="text-[11px] text-stone-500">Ride Safe & Enjoy Zambales!</span>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-stone-800 bg-stone-950 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-lg border border-stone-800 hover:bg-stone-800 text-stone-300 text-xs font-medium flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-lg border border-stone-800 hover:bg-stone-800 text-stone-300 text-xs font-medium flex items-center gap-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Pass Link</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-stone-400 hover:text-white text-xs font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                onStartDropoff(reservation);
                onClose();
              }}
              className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Go to Drop-Off Check-In</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
