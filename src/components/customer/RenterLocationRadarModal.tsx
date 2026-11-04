import React, { useState, useEffect } from 'react';
import { Reservation } from '../../types';
import { useApp } from '../../context/AppContext';
import { RECOMMENDED_DESTINATIONS } from '../../utils/recommendedDestinations';
import { calculateDistanceMeters } from '../../utils/googleMapsHelper';
import { 
  Navigation, 
  MapPin, 
  Radio, 
  Send, 
  CheckCircle2, 
  X, 
  Facebook, 
  Instagram, 
  Share2, 
  Compass, 
  ShieldCheck, 
  BellRing,
  ExternalLink,
  Sparkles
} from 'lucide-react';

interface RenterLocationRadarModalProps {
  reservation: Reservation;
  onClose: () => void;
}

export const RenterLocationRadarModal: React.FC<RenterLocationRadarModalProps> = ({
  reservation,
  onClose,
}) => {
  const { currentBusiness, showToast, updateRenterLocation, triggerProximityAlert } = useApp();

  // Location sharing active toggle
  const [isSharing, setIsSharing] = useState<boolean>(true);
  // Default coordinates in San Felipe, Zambales
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 15.0505,
    lng: 120.0570,
  });
  const [isWatchingGps, setIsWatchingGps] = useState<boolean>(false);
  const [activePlatform, setActivePlatform] = useState<'facebook' | 'instagram' | 'tiktok'>(
    reservation.socialPlatformChoice || 'facebook'
  );
  const [radarPulse, setRadarPulse] = useState<number>(0);

  // Proximity alerts history
  const [alertEvents, setAlertEvents] = useState<Array<{
    id: string;
    destinationName: string;
    distanceMeters: number;
    platform: string;
    timestamp: string;
    message: string;
  }>>([
    {
      id: 'alert-init',
      destinationName: 'Liwliwa Surf Break & Sunset Strip',
      distanceMeters: 620,
      platform: reservation.socialPlatformChoice || 'facebook',
      timestamp: 'Just now',
      message: `Hey ${reservation.customerName.split(' ')[0]}! You are approaching Liwliwa Beach (620m). Check out the golden hour sunset and acoustic cafes! 🏄‍♂️✨`,
    },
  ]);

  // Radar animation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setRadarPulse((prev) => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Compute distances to all destinations
  const destinationsWithDistance = RECOMMENDED_DESTINATIONS.map((dest) => {
    const distanceMeters = calculateDistanceMeters(
      currentCoords.lat,
      currentCoords.lng,
      dest.coordinates.lat,
      dest.coordinates.lng
    );
    const isNearby = distanceMeters <= 1800; // within 1.8km
    return {
      ...dest,
      distanceMeters,
      isNearby,
    };
  }).sort((a, b) => a.distanceMeters - b.distanceMeters);

  // Trigger Proximity Social Notification when close to a place
  const sendProximityNotification = (destName: string, distance: number) => {
    const msg = `📍 ${currentBusiness.name} Alert: Hey ${reservation.customerName.split(' ')[0]}! You are ${distance}m away from ${destName}. Enjoy coastal rider discounts with partner cafes! Tag us on ${activePlatform.toUpperCase()} to feature on our reels.`;

    const newAlert = {
      id: `alert-${Date.now()}`,
      destinationId: destName.toLowerCase().replace(/\s+/g, '-'),
      destinationName: destName,
      distanceMeters: distance,
      triggeredAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      platform: activePlatform,
      message: msg,
      sentStatus: 'sent' as const,
    };

    setAlertEvents((prev) => [
      {
        id: newAlert.id,
        destinationName: destName,
        distanceMeters: distance,
        platform: activePlatform,
        timestamp: newAlert.triggeredAt,
        message: msg,
      },
      ...prev,
    ]);

    triggerProximityAlert(reservation.id, newAlert);
    showToast(`Proximity Alert dispatched to ${reservation.customerName}'s ${activePlatform.toUpperCase()}!`, 'success');
  };

  // Simulate moving to a destination
  const handleSimulateMove = (lat: number, lng: number, placeName: string) => {
    setCurrentCoords({ lat, lng });
    updateRenterLocation(reservation.id, lat, lng);
    const dist = calculateDistanceMeters(lat, lng, lat, lng);
    sendProximityNotification(placeName, 250);
  };

  // Try activating real HTML5 Geolocation API
  const handleStartRealGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by this browser.', 'error');
      return;
    }
    setIsWatchingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCurrentCoords({ lat: latitude, lng: longitude });
        updateRenterLocation(reservation.id, latitude, longitude);
        showToast('Live device GPS lock acquired!', 'success');
      },
      (err) => {
        console.warn('GPS notice:', err);
        showToast('Using Zambales simulation coordinates (Depot mode).', 'info');
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-100">
                  Renter Live Location Radar & Proximity Social Alerts
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold">
                  {reservation.bookingRef}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                When you ride near curated Zambales spots (surf breaks, pine forests, falls), an instant guide alert is sent to your connected social channels.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left Column: Visual Radar & Place List (7 cols) */}
          <div className="lg:col-span-7 p-5 bg-stone-950 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-stone-800 space-y-4">
            
            {/* Status & Toggle Bar */}
            <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className={`w-3 h-3 rounded-full ${isSharing ? 'bg-emerald-400 animate-ping' : 'bg-stone-600'}`} />
                <div>
                  <span className="text-xs font-bold text-stone-200 block">
                    {isSharing ? 'Live Location Radar: Active' : 'Location Sharing: Paused'}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    GPS Coordinates: {currentCoords.lat.toFixed(4)}° N, {currentCoords.lng.toFixed(4)}° E
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleStartRealGps}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[11px] font-semibold transition-colors flex items-center gap-1"
                >
                  <Navigation className="w-3 h-3 text-amber-400" />
                  <span>Sync Device GPS</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSharing(!isSharing)}
                  className={`px-3 py-1 rounded text-[11px] font-bold border transition-colors ${
                    isSharing
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-stone-800 text-stone-400 border-stone-700'
                  }`}
                >
                  {isSharing ? 'Enabled' : 'Disabled'}
                </button>
              </div>
            </div>

            {/* Radar Visual Display */}
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden border border-stone-800 bg-gradient-to-b from-stone-900 via-stone-950 to-stone-950 flex items-center justify-center p-4">
              {/* Concentric radar rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                <div className="w-72 h-72 rounded-full border border-blue-400" />
                <div className="w-52 h-52 rounded-full border border-blue-400" />
                <div className="w-32 h-32 rounded-full border border-blue-400" />
                <div className="w-12 h-12 rounded-full border border-blue-400" />
              </div>

              {/* Renter Current Location Pin */}
              <div className="z-10 flex flex-col items-center">
                <div className="relative flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full bg-blue-500/30 animate-ping absolute" />
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white flex items-center justify-center shadow-lg text-white">
                    <Navigation className="w-4 h-4" />
                  </div>
                </div>
                <span className="mt-1.5 px-2 py-0.5 rounded bg-black/80 text-[10px] font-bold text-stone-100 font-mono border border-stone-800">
                  {reservation.customerName.split(' ')[0]} (Riding)
                </span>
              </div>

              {/* Nearby Tagged Places overlay */}
              <div className="absolute top-3 left-3 space-y-1 text-[10px] font-mono">
                <span className="text-amber-400 font-bold block">CLOSEST TAGGED DESTINATIONS:</span>
                {destinationsWithDistance.slice(0, 3).map((d) => (
                  <div key={d.id} className="flex items-center gap-1.5 text-stone-300">
                    <span className={`w-1.5 h-1.5 rounded-full ${d.isNearby ? 'bg-emerald-400' : 'bg-stone-500'}`} />
                    <span className="truncate">{d.name}:</span>
                    <strong className={d.isNearby ? 'text-emerald-400' : 'text-stone-400'}>
                      {d.distanceMeters > 1000 ? `${(d.distanceMeters / 1000).toFixed(1)} km` : `${d.distanceMeters} m`}
                    </strong>
                  </div>
                ))}
              </div>

              {/* Simulation Quick Chips */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 flex-wrap justify-end">
                <span className="text-[10px] text-stone-400 font-mono mr-1">Simulate Move:</span>
                <button
                  type="button"
                  onClick={() => handleSimulateMove(15.0450, 120.0520, 'Liwliwa Surf Break')}
                  className="px-2 py-1 rounded bg-blue-600/80 hover:bg-blue-600 text-white text-[10px] font-semibold transition-colors"
                >
                  Ride to Liwliwa
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateMove(15.0080, 120.0600, 'Crystal Beach Resort')}
                  className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-semibold transition-colors"
                >
                  Ride to Crystal Beach
                </button>
              </div>
            </div>

            {/* List of Destinations & Distance */}
            <div className="space-y-2">
              <span className="text-stone-400 uppercase font-mono text-[10px] font-bold block">
                Zambales Circuit Landmarks (Proximity Radius: 1.8 KM)
              </span>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {destinationsWithDistance.map((dest) => (
                  <div
                    key={dest.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                      dest.isNearby
                        ? 'border-emerald-500/40 bg-emerald-500/10'
                        : 'border-stone-800 bg-stone-900/60'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-stone-100 flex items-center gap-1.5">
                        <MapPin className={`w-3.5 h-3.5 ${dest.isNearby ? 'text-emerald-400' : 'text-stone-500'}`} />
                        <span>{dest.name}</span>
                        {dest.isNearby && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300">
                            IN RANGE
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-stone-400">{dest.location} · {dest.bestTimeToVisit}</div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-right font-mono">
                        <span className={`font-bold block ${dest.isNearby ? 'text-emerald-400' : 'text-stone-400'}`}>
                          {dest.distanceMeters > 1000 ? `${(dest.distanceMeters / 1000).toFixed(1)} km` : `${dest.distanceMeters} m`}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => sendProximityNotification(dest.name, dest.distanceMeters)}
                        className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[10px] font-semibold flex items-center gap-1 transition-colors"
                        title="Simulate sending social alert for this spot"
                      >
                        <Send className="w-2.5 h-2.5 text-blue-400" />
                        <span>Notify</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Social Alerts Feed & Preferences (5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-4 text-xs overflow-y-auto">
            {/* Social Channel Channel Switcher */}
            <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-950 space-y-2">
              <span className="font-bold text-stone-200 text-xs block">
                Deliver Alerts to Social Media:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'facebook', label: 'Facebook', icon: Facebook, color: 'text-blue-400' },
                  { id: 'instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-400' },
                  { id: 'tiktok', label: 'TikTok', icon: Share2, color: 'text-emerald-400' },
                ].map((p) => {
                  const Icon = p.icon;
                  const isSelected = activePlatform === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setActivePlatform(p.id as any)}
                      className={`p-2 rounded-lg border flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
                        isSelected
                          ? 'border-blue-400 bg-blue-500/10 text-stone-100'
                          : 'border-stone-800 bg-stone-900 text-stone-400'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${p.color}`} />
                      <span>{p.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-stone-400">
                Connected account: <strong>{reservation.customerEmail}</strong> · Direct messages enabled.
              </p>
            </div>

            {/* Live Social Alert Messages Feed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-200 flex items-center gap-1.5 text-xs">
                  <BellRing className="w-3.5 h-3.5 text-amber-400" />
                  <span>Dispatched Proximity Notifications ({alertEvents.length})</span>
                </span>
                <span className="text-[10px] text-stone-400 font-mono">Live Webhook Log</span>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {alertEvents.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-3 rounded-xl border border-stone-800 bg-stone-950 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-blue-400 font-bold uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>SENT VIA {alert.platform.toUpperCase()}</span>
                      </span>
                      <span className="text-stone-500 font-mono">{alert.timestamp}</span>
                    </div>

                    <p className="text-stone-200 text-[11px] leading-relaxed bg-stone-900/80 p-2 rounded-lg border border-stone-800/80">
                      {alert.message}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-0.5">
                      <span>Proximity: <strong>{alert.distanceMeters}m</strong></span>
                      <span className="text-emerald-400 font-mono">✓ Delivered to Mobile</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy & Safety Note */}
            <div className="p-3 rounded-xl border border-stone-800 bg-stone-950/60 text-[11px] text-stone-400 space-y-1">
              <span className="font-semibold text-stone-300 block flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Privacy & Battery Optimization</span>
              </span>
              <p className="leading-relaxed">
                Location updates are lightweight and only trigger when approaching registered Zambales tourist waypoints. You can pause tracking anytime.
              </p>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-lg text-xs transition-colors"
              >
                Close Location Radar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
