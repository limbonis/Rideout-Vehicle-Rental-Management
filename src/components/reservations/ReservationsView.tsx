import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Reservation, ReservationStatus } from '../../types';
import { 
  Search, 
  Filter, 
  CalendarCheck, 
  KeyRound, 
  FileText, 
  Copy, 
  Check, 
  MessageSquare, 
  Plus, 
  ChevronRight,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Zap,
  Smartphone,
  FileSpreadsheet
} from 'lucide-react';
import { RentalContractModal } from './RentalContractModal';
import { EmailConfirmationModal } from './EmailConfirmationModal';
import { QuickChatModal } from './QuickChatModal';

interface ReservationsViewProps {
  onOpenNewBooking: () => void;
  onSelectForPickup: (res: Reservation) => void;
}

export const ReservationsView: React.FC<ReservationsViewProps> = ({
  onOpenNewBooking,
  onSelectForPickup,
}) => {
  const { 
    reservations, 
    bikes, 
    updateReservationStatus, 
    updateReservationPayment,
    setActiveTab,
    showToast 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContractRes, setSelectedContractRes] = useState<Reservation | null>(null);
  const [selectedEmailRes, setSelectedEmailRes] = useState<Reservation | null>(null);
  const [selectedQuickChatRes, setSelectedQuickChatRes] = useState<Reservation | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter reservations
  const filteredReservations = reservations.filter((res) => {
    const matchesStatus = statusFilter === 'all' || res.status === statusFilter;
    const matchesSearch = 
      res.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.bikeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.customerPhone.includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  const handleCopyWhatsApp = (res: Reservation) => {
    const text = `Hi ${res.customerName}! 🏍️ Greetings from RideOut Zambales Moto Rental.\n\nYour reservation ${res.bookingRef} for the ${res.bikeName} is ${res.status.toUpperCase()}.\n📅 Pickup: ${res.startDate} at ${res.startTime}\n📍 Location: ${res.pickupLocation}\n💰 Total: ₱${res.totalAmount.toLocaleString()} (Deposit: ₱${res.securityDeposit.toLocaleString()})\n\nPlease bring your driver's license and arrive 10 minutes prior for digital bike inspection and handover. See you in Zambales! 🌊`;
    navigator.clipboard.writeText(text);
    setCopiedId(res.id);
    showToast(`WhatsApp booking confirmation copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 3000);
  };

  const getStatusBadge = (status: ReservationStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="text-emerald-400 font-medium inline-flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Active (On Road)
          </span>
        );
      case 'confirmed':
        return (
          <span className="text-amber-400 font-medium inline-flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Confirmed
          </span>
        );
      case 'pending':
        return (
          <span className="text-blue-400 font-medium inline-flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Pending Deposit
          </span>
        );
      case 'completed':
        return (
          <span className="text-stone-400 font-medium inline-flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
            Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="text-red-400 font-medium inline-flex items-center gap-1.5 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
            Cancelled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-stone-100">
            Reservations & Bookings
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Manage upcoming arrivals, customer deposits, and on-road bike schedules
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('reports')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-800 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
            title="Generate custom summary report and export to Sheets, Excel, PDF, Word"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Summary Report</span>
          </button>

          <button
            onClick={onOpenNewBooking}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Reservation</span>
          </button>
        </div>
      </div>

      {/* Interactive Filter Segmented Control & Search Input */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-lg overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Bookings', count: reservations.length },
            { id: 'confirmed', label: 'Confirmed', count: reservations.filter(r => r.status === 'confirmed').length },
            { id: 'active', label: 'On Road', count: reservations.filter(r => r.status === 'active').length },
            { id: 'pending', label: 'Pending', count: reservations.filter(r => r.status === 'pending').length },
            { id: 'completed', label: 'Completed', count: reservations.filter(r => r.status === 'completed').length },
          ].map((tab) => {
            const isActive = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                    : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800/50'
                }`}
              >
                <span>{tab.label}</span>
                <span className="ml-1.5 text-[10px] opacity-80 font-mono">({tab.count})</span>
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full lg:w-72">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search renter, booking ref, bike..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400 text-xs"
          />
        </div>
      </div>

      {/* Reservations Table List */}
      <div className="rounded-xl border border-stone-800 bg-stone-900/40 overflow-hidden shadow-sm">
        {filteredReservations.length === 0 ? (
          <div className="py-16 text-center text-stone-500 text-xs space-y-2">
            <p>No reservations found matching your current filter.</p>
            <button
              onClick={() => { setStatusFilter('all'); setSearchQuery(''); }}
              className="text-amber-400 hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-950/80 border-b border-stone-800 text-stone-400 text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Ref & Customer</th>
                  <th className="py-3 px-4">Motorbike</th>
                  <th className="py-3 px-4">Rental Window</th>
                  <th className="py-3 px-4">Total & Deposit</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 font-sans">
                {filteredReservations.map((res) => {
                  const bike = bikes.find(b => b.id === res.bikeId);
                  return (
                    <tr 
                      key={res.id} 
                      className="hover:bg-stone-800/20 transition-colors group"
                    >
                      {/* Customer & Ref */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-stone-300 font-semibold">{res.bookingRef}</span>
                          {res.driverLicenseValidated && (
                            <span className="text-[10px] text-emerald-400 font-mono font-semibold">✓ Code A/A1</span>
                          )}
                        </div>
                        <div className="font-medium text-stone-100 text-sm mt-0.5">
                          {res.customerName}
                        </div>
                        <div className="text-[11px] text-stone-300 font-mono mt-0.5">
                          {res.customerPhone}
                        </div>
                        <div className="text-[10px] text-stone-400 truncate max-w-[200px] mt-0.5 flex items-center gap-1">
                          <span>{res.customerEmail}</span>
                          {res.facebookConnected && <span className="text-blue-400 font-bold">(FB)</span>}
                        </div>

                        {/* Preferred Chat Platform Tag */}
                        {res.preferredContactMode && (
                          <div className="mt-1 flex items-center gap-1">
                            <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded border inline-flex items-center gap-1 ${
                              res.preferredContactMode === 'whatsapp' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                              res.preferredContactMode === 'facebook' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                              res.preferredContactMode === 'instagram' ? 'bg-pink-500/10 text-pink-400 border-pink-500/30' :
                              'bg-amber-400/10 text-amber-300 border-amber-400/30'
                            }`}>
                              <span>{
                                res.preferredContactMode === 'whatsapp' ? '💬 WhatsApp' :
                                res.preferredContactMode === 'facebook' ? '🔵 Messenger' :
                                res.preferredContactMode === 'instagram' ? '📸 Instagram' : '📱 SMS'
                              }</span>
                              {res.preferredContactHandle && (
                                <span className="opacity-75">· {res.preferredContactHandle}</span>
                              )}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Motorbike */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-stone-200">
                          {res.bikeName}
                        </div>
                        <div className="text-[11px] text-amber-400 font-mono mt-0.5">
                          {bike?.plateNumber || 'TBA'} · ₱{res.dailyRate.toLocaleString()}/day
                        </div>
                        <div className="text-[10px] text-stone-400 mt-1 font-mono">
                          Lic: {res.customerLicenseNumber}
                        </div>
                      </td>

                      {/* Rental Window */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono text-stone-200">
                          {res.startDate} <span className="text-stone-500 text-[10px]">({res.startTime})</span>
                        </div>
                        <div className="font-mono text-stone-400 mt-0.5">
                          to {res.endDate} <span className="text-stone-500 text-[10px]">({res.endTime})</span>
                        </div>
                        <div className="text-[11px] text-stone-400 font-mono mt-1">
                          {res.totalDays} Day(s) · {res.pickupLocation.split('(')[0]}
                        </div>
                      </td>

                      {/* Financials & Promo */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-bold text-amber-400 tabular-nums">
                          ₱{res.totalAmount.toLocaleString()}
                        </div>
                        {res.discountAmount > 0 && (
                          <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                            Promo ({res.promoCode}): -₱{res.discountAmount.toLocaleString()}
                          </div>
                        )}
                        <div className="text-[11px] text-stone-400 font-mono mt-0.5">
                          Sec. Deposit: ₱{res.securityDeposit.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-stone-400 mt-1 flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-stone-300">{res.paymentStatus}</span>
                          <span className="text-stone-500 font-mono">({res.paymentMethod})</span>
                          {res.paymentProofUrl && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                              Slip Attached
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top">
                        {getStatusBadge(res.status)}
                        {res.notes && (
                          <div className="text-[10px] text-stone-500 mt-1.5 italic line-clamp-2 max-w-[180px]">
                            "{res.notes}"
                          </div>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1.5 flex-wrap">
                          {/* Breezy Quick Chat Button */}
                          <button
                            onClick={() => setSelectedQuickChatRes(res)}
                            className={`px-2.5 py-1 text-xs font-semibold rounded transition-colors whitespace-nowrap flex items-center gap-1 shadow-sm border ${
                              res.preferredContactMode === 'whatsapp' ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40' :
                              res.preferredContactMode === 'facebook' ? 'bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border-blue-500/40' :
                              res.preferredContactMode === 'instagram' ? 'bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border-pink-500/40' :
                              'bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border-amber-400/40'
                            }`}
                            title={`Breezy Quick Chat via ${res.preferredContactMode || 'SMS'}`}
                          >
                            <Zap className="w-3 h-3 text-amber-400 fill-current" />
                            <span>Quick Chat</span>
                            <span className="text-[10px] uppercase font-mono opacity-80">
                              ({res.preferredContactMode === 'whatsapp' ? 'WA' :
                                res.preferredContactMode === 'facebook' ? 'FB' :
                                res.preferredContactMode === 'instagram' ? 'IG' : 'SMS'})
                            </span>
                          </button>

                          {/* If confirmed or pending, prominent pickup button */}
                          {(res.status === 'confirmed' || res.status === 'pending') && (
                            <button
                              onClick={() => onSelectForPickup(res)}
                              className="px-2.5 py-1 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded transition-colors whitespace-nowrap flex items-center gap-1 shadow-sm"
                              title="Begin vehicle inspection & digital signature"
                            >
                              <KeyRound className="w-3 h-3" />
                              <span>Pickup</span>
                            </button>
                          )}

                          {/* Email confirmation preview with Pickup button */}
                          <button
                            onClick={() => setSelectedEmailRes(res)}
                            className="p-1.5 text-stone-400 hover:text-amber-400 bg-stone-800/80 hover:bg-stone-800 rounded transition-colors"
                            title="Preview customer confirmation email with 'Pickup' button"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {/* Print agreement */}
                          <button
                            onClick={() => setSelectedContractRes(res)}
                            className="p-1.5 text-stone-400 hover:text-white bg-stone-800/80 hover:bg-stone-800 rounded transition-colors"
                            title="Print Rental Contract & Invoice"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>

                          {/* Copy WhatsApp / SMS message */}
                          <button
                            onClick={() => handleCopyWhatsApp(res)}
                            className="p-1.5 text-stone-400 hover:text-amber-400 bg-stone-800/80 hover:bg-stone-800 rounded transition-colors"
                            title="Copy WhatsApp / SMS booking notification"
                          >
                            {copiedId === res.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <MessageSquare className="w-3.5 h-3.5" />
                            )}
                          </button>

                          {/* Status toggle dropdown */}
                          <select
                            value={res.status}
                            onChange={(e) => updateReservationStatus(res.id, e.target.value as ReservationStatus)}
                            className="text-[11px] bg-stone-950 border border-stone-800 text-stone-300 rounded px-1.5 py-1 focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="active">Active (On Road)</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Contract & Invoice Modal */}
      {selectedContractRes && (
        <RentalContractModal
          reservation={selectedContractRes}
          bike={bikes.find(b => b.id === selectedContractRes.bikeId)}
          onClose={() => setSelectedContractRes(null)}
        />
      )}

      {/* Customer Email Confirmation Modal with Pickup CTA */}
      {selectedEmailRes && (
        <EmailConfirmationModal
          reservation={selectedEmailRes}
          bike={bikes.find(b => b.id === selectedEmailRes.bikeId)}
          onClose={() => setSelectedEmailRes(null)}
          onStartPickup={(res) => {
            setSelectedEmailRes(null);
            onSelectForPickup(res);
          }}
        />
      )}

      {/* Quick Chat Modal with Renter's Preferred Mode */}
      {selectedQuickChatRes && (
        <QuickChatModal
          reservation={selectedQuickChatRes}
          bike={bikes.find(b => b.id === selectedQuickChatRes.bikeId)}
          isOpen={Boolean(selectedQuickChatRes)}
          onClose={() => setSelectedQuickChatRes(null)}
        />
      )}
    </div>
  );
};
