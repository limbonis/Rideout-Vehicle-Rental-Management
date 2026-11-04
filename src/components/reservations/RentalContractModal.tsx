import React from 'react';
import { Reservation, Motorbike, VehicleInspection } from '../../types';
import { X, Printer, Download, CheckCircle, Shield, Bike } from 'lucide-react';

interface RentalContractModalProps {
  reservation: Reservation;
  bike?: Motorbike;
  inspection?: VehicleInspection;
  onClose: () => void;
}

export const RentalContractModal: React.FC<RentalContractModalProps> = ({
  reservation,
  bike,
  inspection,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto no-print">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden my-8">
        {/* Header bar (no-print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950 no-print">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-stone-200">Official Rental Agreement & Invoice</span>
            <span className="text-xs font-mono text-amber-400">#{reservation.bookingRef}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Agreement</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-contract" className="p-8 bg-stone-900 text-stone-100 print:bg-white print:text-black space-y-6 text-xs leading-relaxed max-h-[80vh] overflow-y-auto print:max-h-none print:overflow-visible">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-stone-800 print:border-stone-300 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Bike className="w-5 h-5 text-amber-400 print:text-stone-900" />
                <h1 className="text-lg font-bold tracking-tight print:text-black">
                  RIDEOUT ZAMBALES MOTO RENTALS
                </h1>
              </div>
              <p className="text-stone-400 print:text-stone-600 mt-1">
                National Highway, San Felipe, Zambales, Philippines 2204
              </p>
              <p className="text-stone-400 print:text-stone-600">
                Email: rideoutzambales@gmail.com · Hotline: +63 917 832 9900
              </p>
            </div>
            <div className="text-right">
              <div className="text-base font-bold font-mono text-amber-400 print:text-black">
                {reservation.bookingRef}
              </div>
              <div className="text-stone-400 print:text-stone-600">
                Issued: {new Date(reservation.createdAt).toLocaleDateString()}
              </div>
              <div className="text-stone-300 print:text-stone-800 font-semibold mt-1">
                Status: {reservation.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Renter & Vehicle 2-Column Info */}
          <div className="grid grid-cols-2 gap-6 p-4 rounded-lg bg-stone-950/60 print:bg-stone-50 border border-stone-800 print:border-stone-200">
            <div>
              <h2 className="font-bold text-stone-200 print:text-stone-900 mb-2 uppercase tracking-wider text-[11px]">
                Renter Information
              </h2>
              <div className="space-y-1 text-stone-300 print:text-stone-800">
                <div><span className="text-stone-500">Name:</span> {reservation.customerName}</div>
                <div><span className="text-stone-500">Driver License:</span> <span className="font-mono">{reservation.customerLicenseNumber} ({reservation.driverLicenseCodes?.length ? `Codes: ${reservation.driverLicenseCodes.join(', ')}` : 'Code A Verified'})</span></div>
                <div><span className="text-stone-500">Contact:</span> <span className="font-mono">{reservation.customerPhone}</span></div>
                <div><span className="text-stone-500">Email:</span> {reservation.customerEmail} {reservation.facebookConnected && <span className="text-[10px] text-blue-400 font-sans font-medium">(Verified via Facebook)</span>}</div>
                <div><span className="text-stone-500">Emergency Contact:</span> {reservation.emergencyContact}</div>
              </div>
            </div>

            <div>
              <h2 className="font-bold text-stone-200 print:text-stone-900 mb-2 uppercase tracking-wider text-[11px]">
                Vehicle & Schedule
              </h2>
              <div className="space-y-1 text-stone-300 print:text-stone-800">
                <div><span className="text-stone-500">Motorbike:</span> <span className="font-semibold">{reservation.bikeName}</span></div>
                <div><span className="text-stone-500">Plate Number:</span> <span className="font-mono">{bike?.plateNumber || 'Verified in Depot'}</span></div>
                <div><span className="text-stone-500">Period:</span> {reservation.startDate} ({reservation.startTime}) to {reservation.endDate} ({reservation.endTime})</div>
                <div><span className="text-stone-500">Total Duration:</span> {reservation.totalDays} Day(s)</div>
                <div><span className="text-stone-500">Pickup Depot:</span> {reservation.pickupLocation}</div>
              </div>
            </div>
          </div>

          {/* Rate & Financial Ledger */}
          <div>
            <h2 className="font-bold text-stone-200 print:text-stone-900 mb-2 uppercase tracking-wider text-[11px]">
              Itemized Invoice & Deposit
            </h2>
            <div className="border border-stone-800 print:border-stone-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-stone-950 print:bg-stone-100 text-stone-400 print:text-stone-700 text-[11px]">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Qty/Days</th>
                    <th className="py-2 px-3 text-right">Rate</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-800 print:divide-stone-200 font-mono text-[11px]">
                  <tr>
                    <td className="py-2 px-3 font-sans text-stone-200 print:text-stone-900">
                      Motorbike Rental: {reservation.bikeName}
                    </td>
                    <td className="py-2 px-3 text-right text-stone-400 print:text-stone-600">{reservation.totalDays} day(s)</td>
                    <td className="py-2 px-3 text-right text-stone-400 print:text-stone-600">₱{reservation.dailyRate.toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-stone-200 print:text-stone-900">₱{(reservation.dailyRate * reservation.totalDays).toLocaleString()}</td>
                  </tr>
                  {reservation.discountAmount > 0 && (
                    <tr className="text-emerald-400 print:text-emerald-700">
                      <td className="py-2 px-3 font-sans">
                        Promo Discount ({reservation.promoCode || 'Campaign Code'})
                      </td>
                      <td className="py-2 px-3 text-right">Discount</td>
                      <td className="py-2 px-3 text-right">—</td>
                      <td className="py-2 px-3 text-right">-₱{reservation.discountAmount.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr className="bg-stone-950/40 print:bg-stone-50 font-semibold font-sans">
                    <td colSpan={3} className="py-2 px-3 text-right text-stone-300 print:text-stone-800">Rental Subtotal:</td>
                    <td className="py-2 px-3 text-right font-mono text-stone-100 print:text-stone-900">₱{reservation.subtotal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td colSpan={3} className="py-2 px-3 text-right text-stone-400 print:text-stone-600 font-sans">
                      Refundable Security Deposit (Held during rental):
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-amber-400 print:text-stone-900">₱{reservation.securityDeposit.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-stone-950 print:bg-stone-100 font-bold font-sans text-xs">
                    <td colSpan={3} className="py-2 px-3 text-right text-stone-100 print:text-stone-900">Grand Total Due:</td>
                    <td className="py-2 px-3 text-right font-mono text-amber-400 print:text-stone-900">₱{reservation.totalAmount.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-2 flex justify-between text-stone-400 print:text-stone-600 text-[11px]">
              <div>Payment Status: <span className="font-semibold text-stone-200 print:text-stone-900">{reservation.paymentStatus}</span> ({reservation.paymentMethod})</div>
              <div>Deposit Paid: <span className="font-mono text-stone-200 print:text-stone-900">₱{reservation.depositPaid.toLocaleString()}</span></div>
            </div>
          </div>

          {/* Rental Terms & Conditions */}
          <div className="border-t border-stone-800 print:border-stone-300 pt-4 space-y-2 text-[10px] text-stone-400 print:text-stone-600">
            <h3 className="font-bold text-stone-300 print:text-stone-900 uppercase">Terms & Waiver Summary</h3>
            <ol className="list-decimal pl-4 space-y-1">
              <li>The Renter acknowledges possession of a valid driver's license authorized for motorcycle operation in the Philippines.</li>
              <li>Protective helmets (DOT/ICC approved) must be worn at all times by rider and passenger as mandated by Republic Act No. 10054.</li>
              <li>Off-road racing, illegal stunts, and driving under the influence of alcohol or narcotics are strictly prohibited and immediately void coverage.</li>
              <li>The vehicle must be returned with the same fuel level as recorded at pickup. Fuel deficit will be deducted from the security deposit.</li>
              <li>The Renter is solely responsible for any traffic violations or penalties incurred during the rental tenure.</li>
            </ol>
          </div>

          {/* Signatures Block */}
          <div className="border-t border-stone-800 print:border-stone-300 pt-6 grid grid-cols-2 gap-8">
            <div>
              <div className="text-[11px] text-stone-400 print:text-stone-600 mb-2">Renter Signature / Electronic Acceptance:</div>
              <div className="h-16 border border-dashed border-stone-700 print:border-stone-400 rounded flex items-center justify-center bg-stone-950/40 print:bg-stone-50">
                {inspection?.customerSignatureUrl ? (
                  <img src={inspection.customerSignatureUrl} alt="Signature" className="max-h-12 object-contain" />
                ) : (
                  <span className="font-mono text-[10px] text-stone-500 italic">Digitally verified upon pickup handover</span>
                )}
              </div>
              <div className="text-[10px] text-stone-400 print:text-stone-600 mt-1">
                {reservation.customerName} · {inspection?.waiverSignedAt ? new Date(inspection.waiverSignedAt).toLocaleString() : 'Pending Handover'}
              </div>
            </div>

            <div>
              <div className="text-[11px] text-stone-400 print:text-stone-600 mb-2">Authorized Dispatcher (RideOut Zambales):</div>
              <div className="h-16 border border-dashed border-stone-700 print:border-stone-400 rounded flex items-center justify-center bg-stone-950/40 print:bg-stone-50">
                <span className="font-semibold text-xs text-stone-300 print:text-stone-800">JOMAR DELA CRUZ · FLEET LEAD</span>
              </div>
              <div className="text-[10px] text-stone-400 print:text-stone-600 mt-1">
                San Felipe Depot Dispatch Station
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
