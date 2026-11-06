import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Bike, 
  KeyRound, 
  CalendarCheck, 
  Share2, 
  Compass, 
  Sun, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Reservation } from '../../types';

interface OverviewStatsProps {
  onOpenNewBooking: () => void;
  onSelectReservationForPickup: (res: Reservation) => void;
}

export const OverviewStats: React.FC<OverviewStatsProps> = ({
  onOpenNewBooking,
  onSelectReservationForPickup,
}) => {
  const { 
    bikes, 
    businessBikes,
    reservations, 
    businessReservations,
    currentBusiness,
    socialPosts, 
    setActiveTab 
  } = useApp();

  const activeResList = businessReservations || reservations.filter(r => r.businessId === currentBusiness.id);
  const activeBikesList = businessBikes || bikes.filter(b => b.businessId === currentBusiness.id);

  const activeRentals = activeResList.filter(r => r.status === 'active');
  const pendingPickups = activeResList.filter(r => r.status === 'confirmed');
  const availableBikes = activeBikesList.filter(b => b.status === 'available');
  const totalBikes = activeBikesList.length;
  const utilizationRate = totalBikes > 0 
    ? Math.round(((totalBikes - availableBikes.length) / totalBikes) * 100) 
    : 0;

  // Calculate total monthly revenue from all confirmed/active/completed reservations
  const totalRevenue = activeResList
    .filter(r => r.status !== 'cancelled')
    .reduce((sum, r) => sum + r.subtotal, 0);

  const mainDepotName = currentBusiness.depots?.[0]?.name || currentBusiness.name;
  const operatingTown = currentBusiness.customization?.operatingTown || currentBusiness.location || 'Depot Hub';

  return (
    <div className="space-y-8">
      {/* Hero Welcome & Dispatch Bar */}
      <div className="relative overflow-hidden rounded-xl border border-stone-800 bg-stone-900/60 p-6 md:p-8">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-stone-400 mb-2">
              <span className="font-semibold text-stone-300">{mainDepotName}</span>
              <span aria-hidden="true">·</span>
              <span>{operatingTown}</span>
              <span aria-hidden="true">·</span>
              <span className="text-amber-400">Road Conditions Optimal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-stone-100 text-balance">
              Motorbike Fleet & Rental Operations
            </h1>
            <p className="mt-2 text-sm text-stone-400 leading-relaxed">
              Real-time dispatch board for reservations, digital 360° road-readiness inspections, waiver signatures, and automated Zambales coastal social media campaigns.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('reports')}
              className="px-4 py-2 text-xs font-semibold text-stone-200 bg-stone-900 hover:bg-stone-800 border border-stone-700/80 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
              title="View Depot Summary Report with date range and fleet filters"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Summary Report</span>
            </button>
            <button
              onClick={() => setActiveTab('pickups')}
              className="px-4 py-2 text-xs font-semibold text-stone-200 bg-stone-800 hover:bg-stone-700 border border-stone-700 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Pickup Counter ({pendingPickups.length})</span>
            </button>
            <button
              onClick={onOpenNewBooking}
              className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 shadow-sm"
            >
              <CalendarCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Reservation</span>
            </button>
          </div>
        </div>

        {/* Zambales Coastal Live Weather & Tide Strip */}
        <div className="mt-6 pt-5 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-400">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-amber-400">
              <Sun className="w-4 h-4" />
              <span className="font-medium text-stone-200">31°C Zambales Coast</span>
            </div>
            <span aria-hidden="true">·</span>
            <span>Dry Pavement</span>
            <span aria-hidden="true">·</span>
            <span>Sunset at 5:44 PM (Golden Hour)</span>
            <span aria-hidden="true">·</span>
            <span>Gentle NW Wind 8 kt</span>
          </div>

          <div className="flex items-center gap-2">
            <span>High Surf Advisory:</span>
            <span className="text-stone-300 font-medium">Liwliwa Beach 3-4 ft clean swells</span>
          </div>
        </div>
      </div>

      {/* KPI 4-Column Metric Grid with strict tabular numerals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Active On Road</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bike className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold font-mono tracking-tight text-stone-100 tabular-nums">
              {activeRentals.length}
            </div>
            <div className="mt-1 text-xs text-stone-500 flex items-center gap-1.5">
              <span>{availableBikes.length} bikes ready for instant booking</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Today's Pickups Due</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold font-mono tracking-tight text-stone-100 tabular-nums">
              {pendingPickups.length}
            </div>
            <div className="mt-1 text-xs text-stone-500 flex items-center gap-1.5">
              <span>Awaiting pre-ride inspection & waiver</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Fleet Utilization</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Compass className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold font-mono tracking-tight text-stone-100 tabular-nums">
              {utilizationRate}%
            </div>
            <div className="mt-1 text-xs text-stone-500 flex items-center gap-1.5">
              <span>{totalBikes - availableBikes.length} of {totalBikes} vehicles deployed or reserved</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-stone-800 bg-stone-900/50 p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-stone-400">Bookings Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold font-mono tracking-tight text-amber-400 tabular-nums">
              ₱{totalRevenue.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-stone-500 flex items-center gap-1.5">
              <span>Excludes refundable security deposits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Active Operations & Social Media Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Today's Pickups & Active Road Rentals */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Pickups Queue */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold text-stone-200">
                  Ready for Pickup Handover
                </h2>
                <span className="text-xs text-stone-500 font-mono">({pendingPickups.length})</span>
              </div>
              <button
                onClick={() => setActiveTab('pickups')}
                className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <span>View inspection desk</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {pendingPickups.length === 0 ? (
              <div className="py-8 text-center text-stone-500 text-xs">
                No pending pickups scheduled for today. All active bikes are on the road!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingPickups.map((res) => (
                  <div
                    key={res.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-lg border border-stone-800 bg-stone-900/80 hover:border-stone-700 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-stone-400">
                        <span className="font-mono text-stone-300 font-semibold">{res.bookingRef}</span>
                        <span aria-hidden="true">·</span>
                        <span>{res.startDate} ({res.startTime})</span>
                        <span aria-hidden="true">·</span>
                        <span>{res.pickupLocation}</span>
                      </div>
                      <div className="mt-1 font-semibold text-sm text-stone-100">
                        {res.customerName}
                      </div>
                      <div className="text-xs text-amber-400/90 flex items-center gap-2 mt-0.5">
                        <span>{res.bikeName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{res.totalDays} days</span>
                        <span aria-hidden="true">·</span>
                        <span>Deposit: {res.paymentStatus}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          onSelectReservationForPickup(res);
                          setActiveTab('pickups');
                        }}
                        className="px-3 py-1.5 text-xs font-medium text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-md transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Start Inspection</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Rentals On The Road */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-stone-200">
                  Active Rentals on the Road
                </h2>
                <span className="text-xs text-stone-500 font-mono">({activeRentals.length})</span>
              </div>
              <button
                onClick={() => setActiveTab('reservations')}
                className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <span>All reservations</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {activeRentals.length === 0 ? (
              <div className="py-6 text-center text-stone-500 text-xs">
                No motorbikes currently out on rental.
              </div>
            ) : (
              <div className="divide-y divide-stone-800/80">
                {activeRentals.map((res) => (
                  <div key={res.id} className="py-3 flex items-center justify-between gap-4">
                    <div>
                      <div className="font-medium text-xs text-stone-200">
                        {res.customerName}
                      </div>
                      <div className="text-xs text-stone-400 flex items-center gap-2 mt-0.5">
                        <span className="text-amber-400">{res.bikeName}</span>
                        <span aria-hidden="true">·</span>
                        <span>Return: {res.endDate} at {res.endTime}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        On Road
                      </span>
                      <div className="text-xs text-stone-500 font-mono mt-0.5">
                        {res.customerPhone}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Social Media Studio Queue & Fleet Health */}
        <div className="space-y-6">
          {/* Social Media Content Spotlight */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Share2 className="w-4 h-4 text-purple-400" />
                <h2 className="text-sm font-semibold text-stone-200">
                  Social Studio
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('social')}
                className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1 transition-colors"
              >
                <span>Studio</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {socialPosts.slice(0, 2).map((post) => (
                <div key={post.id} className="p-3 rounded-lg border border-stone-800 bg-stone-900/60">
                  <div className="flex items-center justify-between text-xs text-stone-400 mb-1">
                    <span className="capitalize font-medium text-amber-400">{post.platform} {post.postType}</span>
                    <span className="text-stone-500">{post.scheduledDate}</span>
                  </div>
                  <div className="text-xs font-semibold text-stone-200 line-clamp-1">
                    {post.title}
                  </div>
                  <p className="mt-1 text-xs text-stone-400 line-clamp-2 leading-relaxed">
                    {post.caption}
                  </p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveTab('social')}
              className="mt-4 w-full py-2 px-3 text-xs font-medium text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-800 border border-stone-700/60 rounded-lg transition-colors text-center"
            >
              Generate AI Viral Post / Story Watermark
            </button>
          </div>

          {/* Quick Fleet Readiness Summary */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bike className="w-4 h-4 text-stone-400" />
                <h2 className="text-sm font-semibold text-stone-200">
                  Fleet Readiness
                </h2>
              </div>
              <button
                onClick={() => setActiveTab('fleet')}
                className="text-xs text-stone-400 hover:text-amber-400 transition-colors"
              >
                Manage
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-stone-800/60">
                <span className="text-stone-400">Available Ready to Ride</span>
                <span className="font-mono text-emerald-400 font-semibold">{availableBikes.length}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-stone-800/60">
                <span className="text-stone-400">Currently Rented</span>
                <span className="font-mono text-amber-400 font-semibold">{bikes.filter(b => b.status === 'rented').length}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-stone-800/60">
                <span className="text-stone-400">Scheduled Service / Oil</span>
                <span className="font-mono text-purple-400 font-semibold">{bikes.filter(b => b.status === 'maintenance').length}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-stone-400">Cleaning / Detail Bay</span>
                <span className="font-mono text-stone-300 font-semibold">{bikes.filter(b => b.status === 'cleaning').length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
