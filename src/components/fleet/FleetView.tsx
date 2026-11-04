import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Motorbike, BikeStatus, BikeCategory } from '../../types';
import { 
  Bike, 
  Plus, 
  Wrench, 
  Fuel, 
  Gauge, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Search
} from 'lucide-react';
import { MotorbikePhotoStudioModal } from './MotorbikePhotoStudioModal';

interface FleetViewProps {
  onOpenNewBookingWithBike: (bikeId: string) => void;
}

export const FleetView: React.FC<FleetViewProps> = ({ onOpenNewBookingWithBike }) => {
  const { bikes, updateBikeStatus, addBike, updateBikePhoto, showToast } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [studioBike, setStudioBike] = useState<Motorbike | null>(null);

  // New bike form state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Yamaha');
  const [model, setModel] = useState('');
  const [category, setCategory] = useState<BikeCategory>('scooter');
  const [engineCc, setEngineCc] = useState(155);
  const [plateNumber, setPlateNumber] = useState('');
  const [dailyRate, setDailyRate] = useState(850);
  const [currentMileage, setCurrentMileage] = useState(1200);
  const [transmission, setTransmission] = useState<'Automatic (CVT)' | 'Manual (Clutch)' | 'Semi-Automatic'>('Automatic (CVT)');

  const filteredBikes = bikes.filter((b) => {
    const matchesCategory = categoryFilter === 'all' || b.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    const matchesSearch = 
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.brand.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesStatus && matchesSearch;
  });

  const handleAddBike = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !plateNumber.trim()) {
      alert('Please fill in bike model name and plate number');
      return;
    }

    addBike({
      name,
      brand,
      model: model || name,
      category,
      engineCc,
      plateNumber,
      dailyRate,
      weeklyRate: Math.round(dailyRate * 6),
      currentMileage,
      nextServiceMileage: currentMileage + 1500,
      fuelLevel: 100,
      status: 'available',
      imageUrl: category === 'adventure' 
        ? '/src/assets/images/bike_adventure_dual_1793338342581.jpg' 
        : (category === 'maxi-scooter' 
          ? '/src/assets/images/bike_touring_scooter_1793338342942.jpg' 
          : '/src/assets/images/bike_urban_scooter_1793338342006.jpg'),
      features: ['Underseat Helmet Space', 'Dual Rear Shocks', 'Fuel Efficient Engine'],
      helmetCapacity: 1,
      transmission,
    });

    setIsAddModalOpen(false);
    setName('');
    setPlateNumber('');
  };

  const getStatusColor = (status: BikeStatus) => {
    switch (status) {
      case 'available':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'rented':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'maintenance':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
      case 'cleaning':
        return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
            <Bike className="w-6 h-6 text-amber-400" />
            <span>Fleet Inventory & Maintenance</span>
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Track odometer wear, scheduled oil changes, and real-time bike readiness
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Motorbike</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category filters */}
        <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-lg overflow-x-auto scrollbar-none">
          {[
            { id: 'all', label: 'All Fleet' },
            { id: 'scooter', label: 'Scooters' },
            { id: 'maxi-scooter', label: 'Maxi-Scooters' },
            { id: 'adventure', label: 'Adventure / Dual' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === cat.id
                  ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bike name, plate..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400 text-xs"
          />
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBikes.map((bike) => {
          const kmToService = bike.nextServiceMileage - bike.currentMileage;
          const isNearService = kmToService <= 300;

          return (
            <div
              key={bike.id}
              className="rounded-xl border border-stone-800 bg-stone-900/50 overflow-hidden flex flex-col justify-between hover:border-stone-700 transition-colors"
            >
              {/* Bike Image Banner */}
              <div className="relative h-48 bg-stone-950 overflow-hidden">
                <img
                  src={bike.imageUrl}
                  alt={bike.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-transparent to-transparent"></div>
                
                {/* Plate and transmission pill */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-950/90 text-stone-200 border border-stone-700 backdrop-blur-sm">
                    {bike.plateNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-stone-950/80 text-amber-400 border border-stone-800">
                    {bike.engineCc}cc
                  </span>
                </div>

                {/* Status tag */}
                <div className="absolute top-3 right-3">
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase tracking-wider border backdrop-blur-sm ${getStatusColor(bike.status)}`}>
                    {bike.status}
                  </span>
                </div>

                {/* Daily rate tag */}
                <div className="absolute bottom-3 left-3">
                  <div className="text-xl font-bold font-mono text-amber-400 tabular-nums">
                    ₱{bike.dailyRate.toLocaleString()}
                    <span className="text-xs text-stone-400 font-normal"> / day</span>
                  </div>
                </div>

                {/* AI Photo Studio Button */}
                <button
                  type="button"
                  onClick={() => setStudioBike(bike)}
                  className="absolute bottom-3 right-3 px-2.5 py-1 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-[11px] shadow-lg flex items-center gap-1.5 transition-all hover:scale-105"
                  title="Enhance presentation of motorbike photo with AI Studio"
                >
                  <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>AI Photo Studio</span>
                </button>
              </div>

              {/* Card Details Body */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-stone-100">{bike.name}</h3>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {bike.transmission} · {bike.category.replace('-', ' ')}
                  </div>

                  {/* Highlights */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {bike.features.slice(0, 3).map((feat, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-300"
                      >
                        {feat}
                      </span>
                    ))}
                  </div>

                  {/* Mileage & Service Tracker */}
                  <div className="mt-4 pt-3 border-t border-stone-800 grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <div className="text-[10px] text-stone-500 flex items-center gap-1">
                        <Gauge className="w-3 h-3 text-stone-400" />
                        <span>Current Mileage</span>
                      </div>
                      <div className="font-mono font-semibold text-stone-200 text-sm mt-0.5 tabular-nums">
                        {bike.currentMileage.toLocaleString()} km
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] text-stone-500 flex items-center gap-1">
                        <Fuel className="w-3 h-3 text-stone-400" />
                        <span>Fuel Level</span>
                      </div>
                      <div className="font-mono font-semibold text-amber-400 text-sm mt-0.5 tabular-nums">
                        {bike.fuelLevel}%
                      </div>
                    </div>
                  </div>

                  {/* Service countdown notification */}
                  <div className={`mt-3 p-2 rounded text-[11px] flex items-center gap-2 ${
                    isNearService 
                      ? 'bg-purple-950/40 border border-purple-500/30 text-purple-300' 
                      : 'bg-stone-950 border border-stone-800/80 text-stone-400'
                  }`}>
                    <Wrench className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                    <span>
                      Oil service due in <strong className="font-mono">{kmToService} km</strong>
                    </span>
                  </div>
                </div>

                {/* Quick Status Action Bar */}
                <div className="pt-4 border-t border-stone-800 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>Quick Status Update:</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['available', 'rented', 'maintenance', 'cleaning'] as BikeStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => updateBikeStatus(bike.id, st)}
                        className={`py-1 rounded text-[10px] font-semibold uppercase tracking-wider border transition-colors ${
                          bike.status === st
                            ? 'bg-stone-100 text-stone-950 border-stone-100'
                            : 'bg-stone-950 text-stone-400 border-stone-800 hover:text-stone-200 hover:border-stone-700'
                        }`}
                      >
                        {st === 'maintenance' ? 'Service' : st}
                      </button>
                    ))}
                  </div>

                  {bike.status === 'available' && (
                    <button
                      onClick={() => onOpenNewBookingWithBike(bike.id)}
                      className="w-full mt-2 py-1.5 px-3 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg transition-colors text-center"
                    >
                      Book This Bike
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Motorbike Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-stone-900 border border-stone-800 rounded-xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
              <h2 className="text-base font-bold text-stone-100">Add Motorbike to Fleet</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-white rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBike} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-stone-400 mb-1">Make & Model *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Yamaha NMAX 155 ABS"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BikeCategory)}
                    className="w-full px-2.5 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs"
                  >
                    <option value="scooter">Scooter (125-155cc)</option>
                    <option value="maxi-scooter">Maxi-Scooter (Touring)</option>
                    <option value="adventure">Adventure / Dual-Sport</option>
                    <option value="classic">Classic / Cafe Racer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Engine CC</label>
                  <input
                    type="number"
                    value={engineCc}
                    onChange={(e) => setEngineCc(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Plate Number *</label>
                  <input
                    type="text"
                    required
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                    placeholder="ZA-1234"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Daily Rental Rate (₱)</label>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-400 mb-1">Current Mileage (km)</label>
                  <input
                    type="number"
                    value={currentMileage}
                    onChange={(e) => setCurrentMileage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1">Transmission</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs"
                  >
                    <option value="Automatic (CVT)">Automatic (CVT)</option>
                    <option value="Manual (Clutch)">Manual (Clutch)</option>
                    <option value="Semi-Automatic">Semi-Automatic</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-stone-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm"
                >
                  Save Motorbike
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Motorbike Photo Studio Modal */}
      {studioBike && (
        <MotorbikePhotoStudioModal
          bike={studioBike}
          onSavePhoto={(bikeId, enhancedImageUrl) => {
            updateBikePhoto(bikeId, enhancedImageUrl);
            setStudioBike(null);
          }}
          onClose={() => setStudioBike(null)}
        />
      )}
    </div>
  );
};
