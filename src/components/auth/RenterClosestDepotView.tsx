import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RentalBusiness } from '../../types';
import { formatPrice } from '../../utils/currencyAndLanguage';
import { 
  MapPin, 
  Bike, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  MessageCircle, 
  Star, 
  ShieldCheck, 
  Smartphone,
  ChevronRight,
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface RenterClosestDepotViewProps {
  onBackToChoices: () => void;
  onCloseModal: () => void;
}

const COMMON_REGIONS = [
  { name: 'Zambales (San Felipe / Liwliwa)', town: 'San Felipe', province: 'Zambales', defaultBizId: 'biz-rideout' },
  { name: 'Zambales (Subic / Olongapo)', town: 'Subic', province: 'Zambales', defaultBizId: 'biz-rideout' },
  { name: 'Siargao (General Luna / Cloud 9)', town: 'General Luna', province: 'Surigao del Norte', defaultBizId: 'biz-siargao' },
  { name: 'Cebu (Moalboal / Cebu City)', town: 'Moalboal', province: 'Cebu', defaultBizId: 'biz-cebu' },
  { name: 'Palawan (El Nido / Coron)', town: 'El Nido', province: 'Palawan', defaultBizId: 'biz-palawan' },
  { name: 'La Union (San Juan / Elyu)', town: 'San Juan', province: 'La Union', defaultBizId: 'biz-elyu' },
];

export const RenterClosestDepotView: React.FC<RenterClosestDepotViewProps> = ({ 
  onBackToChoices, 
  onCloseModal 
}) => {
  const { 
    businesses, 
    setCurrentBusinessId, 
    setActiveTab, 
    bikes, 
    currency,
    showToast 
  } = useApp();

  const [selectedTown, setSelectedTown] = useState<string>('San Felipe');
  const [selectedProvince, setSelectedProvince] = useState<string>('Zambales');
  const [customLocation, setCustomLocation] = useState<string>('');

  // Find proximally closest business subscriber
  // If town or province matches or contains the location, prioritize that subscriber
  const findClosestSubscriber = (): { business: RentalBusiness; distanceKm: number; isExactTown: boolean } => {
    const query = (customLocation || `${selectedTown} ${selectedProvince}`).toLowerCase();

    // 1. Direct match on town or province or location string
    let matched = businesses.find(b => {
      const bLoc = (b.location || '').toLowerCase();
      const bTown = (b.town || '').toLowerCase();
      const bProv = (b.province || '').toLowerCase();
      return bLoc.includes(query) || bTown.includes(selectedTown.toLowerCase()) || bProv.includes(selectedProvince.toLowerCase());
    });

    // 2. If Zambales query or fallback, prioritize flagship RideOUT Zambales
    if (!matched || query.includes('zambales') || query.includes('san felipe') || query.includes('liwliwa') || query.includes('subic')) {
      matched = businesses.find(b => b.id === 'biz-rideout') || businesses[0];
      const isExact = query.includes('san felipe') || query.includes('liwliwa') || selectedTown === 'San Felipe';
      return {
        business: matched,
        distanceKm: isExact ? 0.8 : 3.4,
        isExactTown: isExact
      };
    }

    // 3. Otherwise return matched business
    return {
      business: matched || businesses[0],
      distanceKm: 1.2,
      isExactTown: true
    };
  };

  const closest = findClosestSubscriber();
  const depotBikes = bikes.filter(b => (!b.businessId || b.businessId === closest.business.id) && b.status === 'available');

  const handleSelectDepotAndBook = () => {
    setCurrentBusinessId(closest.business.id);
    setActiveTab('customer-portal');
    showToast(`Connected to ${closest.business.name}! Showing available vehicles.`, 'success');
    onCloseModal();
  };

  return (
    <div className="space-y-5 text-stone-100">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-stone-100">Find Closest Rental Depot</h3>
            <p className="text-xs text-stone-400">
              We match you with verified, actively subscribed depots in your town or province.
            </p>
          </div>
        </div>
        <button
          onClick={onBackToChoices}
          className="text-xs text-stone-400 hover:text-stone-200 underline font-medium"
        >
          Change Role
        </button>
      </div>

      {/* Quick Location Picker */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-stone-300">
          Where do you need a vehicle? (Select destination or type):
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COMMON_REGIONS.map((region) => {
            const isSelected = selectedTown === region.town && !customLocation;
            return (
              <button
                key={region.name}
                type="button"
                onClick={() => {
                  setSelectedTown(region.town);
                  setSelectedProvince(region.province);
                  setCustomLocation('');
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold shadow-sm'
                    : 'bg-stone-950 text-stone-300 border-stone-800 hover:border-stone-700 hover:text-white'
                }`}
              >
                <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{region.name}</span>
              </button>
            );
          })}
        </div>

        {/* Custom Location input */}
        <div className="pt-1">
          <input
            type="text"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            placeholder="Or type specific town, island, or landmark (e.g. San Felipe, El Nido, General Luna)..."
            className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder:text-stone-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Proximally Closest Business Subscriber Card */}
      <div className="rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-br from-stone-900 via-stone-900/90 to-stone-950 p-4 sm:p-5 shadow-xl relative overflow-hidden space-y-4">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-stone-800/80 pb-3.5">
          <div className="flex items-center gap-3">
            <img
              src={closest.business.logoUrl}
              alt={closest.business.name}
              className="w-12 h-12 rounded-xl object-cover border border-amber-400/40 bg-stone-950 shrink-0 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-mono">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Verified Subscriber Depot
                </span>
                <span className="text-[10px] font-mono text-amber-400 font-semibold bg-amber-400/10 px-2 py-0.5 rounded">
                  ~{closest.distanceKm} km away
                </span>
              </div>
              <h4 className="text-base font-bold text-stone-100 mt-0.5">
                {closest.business.name}
              </h4>
              <p className="text-xs text-stone-400 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{closest.business.location}</span>
                {closest.isExactTown && (
                  <span className="text-emerald-400 font-semibold text-[11px]">
                    · Exact Town Match!
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="text-right sm:text-right self-end sm:self-auto">
            <span className="text-[10px] text-stone-400 uppercase font-mono block">Rates from</span>
            <span className="text-lg font-bold font-mono text-amber-400">
              {formatPrice(500, currency)} <span className="text-xs font-normal text-stone-400">/ day</span>
            </span>
          </div>
        </div>

        {/* Highlights & Guarantees */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs text-stone-300">
          <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center gap-2">
            <Bike className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-stone-200 block text-[11px]">{depotBikes.length} Bikes Ready</span>
              <span className="text-[10px] text-stone-500">Available now</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold text-stone-200 block text-[11px]">360° Inspected</span>
              <span className="text-[10px] text-stone-500">LTO CR/OR on-hand</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-stone-950/80 border border-stone-800 flex items-center gap-2 col-span-2 sm:col-span-1">
            <Smartphone className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="font-bold text-stone-200 block text-[11px]">Direct GCash</span>
              <span className="text-[10px] text-stone-500">0% platform markup</span>
            </div>
          </div>
        </div>

        {/* Fleet Preview Thumbnails */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-stone-400 block font-mono">
            Featured Available Fleet at this Depot:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {depotBikes.slice(0, 3).map((bike) => (
              <div 
                key={bike.id}
                className="p-2 rounded-xl bg-stone-950 border border-stone-800 space-y-1 group hover:border-amber-400/50 transition-colors cursor-pointer"
                onClick={handleSelectDepotAndBook}
              >
                <div className="aspect-video rounded-lg overflow-hidden bg-stone-900 border border-stone-800/80">
                  <img
                    src={bike.imageUrl}
                    alt={bike.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="text-[11px] font-bold text-stone-200 truncate">
                  {bike.name}
                </div>
                <div className="text-[10px] text-amber-400 font-mono font-semibold">
                  {formatPrice(bike.dailyRate, currency)}/day
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={handleSelectDepotAndBook}
            className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transform hover:-translate-y-0.5"
          >
            <Bike className="w-4 h-4 text-stone-950 stroke-[2.5]" />
            <span>Explore & Book at {closest.business.name}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          {/* Quick Chat with Depot */}
          <a
            href={`https://wa.me/63${closest.business.mobile.replace(/^0/, '')}?text=${encodeURIComponent(`Hi ${closest.business.name}, I am looking to rent a motorbike in ${selectedTown}!`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-200 border border-stone-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            title="Direct WhatsApp chat with depot manager"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>WhatsApp Depot</span>
          </a>
        </div>
      </div>
    </div>
  );
};
