import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Reservation, RecommendedDestination } from '../../types';
import { ZAMBALES_RECOMMENDED_DESTINATIONS } from '../../utils/recommendedDestinations';
import { 
  MapPin, 
  Navigation, 
  Compass, 
  Bell, 
  Send, 
  Share2, 
  Facebook, 
  Instagram, 
  Radio, 
  X, 
  Check, 
  AlertCircle, 
  ExternalLink,
  Sparkles,
  Camera,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';

interface RenterLocationCompanionModalProps {
  reservation?: Reservation | null;
  isOpen: boolean;
  onClose: () => void;
}

interface ProximityNotification {
  id: string;
  destinationName: string;
  distanceKm: number;
  timestamp: string;
  message: string;
  tip: string;
  sentToPlatform: 'facebook' | 'instagram' | 'sms';
  platformTarget: string;
}

// Key Zambales Highway Waypoints along the coastal route
const SIMULATED_ROUTE_POINTS = [
  { name: 'San Antonio (Pundaquit Junction)', lat: 14.9450, lng: 120.0620 },
  { name: 'San Narciso (Crystal Beach Approach)', lat: 15.0080, lng: 120.0600 },
  { name: 'San Felipe Town Center', lat: 15.0601, lng: 120.0635 },
  { name: 'Liwliwa Beach Surf Avenue', lat: 15.0450, lng: 120.0520 },
  { name: 'Cabangan Coastal Highway', lat: 15.1580, lng: 120.0450 },
  { name: 'Botolan Eco-Park & Estuary', lat: 15.2850, lng: 120.0260 }
];

export const RenterLocationCompanionModal: React.FC<RenterLocationCompanionModalProps> = ({
  reservation,
  isOpen,
  onClose,
}) => {
  const { currentBusiness, showToast } = useApp();

  const [isSharingLocation, setIsSharingLocation] = useState<boolean>(true);
  const [currentLat, setCurrentLat] = useState<number>(15.0480); // Liwliwa / San Felipe
  const [currentLng, setCurrentLng] = useState<number>(120.0540);
  const [speedKmh, setSpeedKmh] = useState<number>(38);
  const [heading, setHeading] = useState<string>('Northbound (Liwliwa Coast)');
  const [isSimulatingRide, setIsSimulatingRide] = useState<boolean>(false);
  const [routeIndex, setRouteIndex] = useState<number>(2);

  // Social Destination Notifications Log
  const [sentAlerts, setSentAlerts] = useState<ProximityNotification[]>([
    {
      id: 'alert-1',
      destinationName: 'Liwliwa Surf Beach & Pine Trees',
      distanceKm: 0.8,
      timestamp: 'Just now',
      message: 'Spot Alert: You are entering Liwliwa! Golden hour sunset viewpoint is 800m to your left.',
      tip: 'Snap a 10s video here for your RideOut Trip Video Cashback reward.',
      sentToPlatform: 'facebook',
      platformTarget: reservation?.facebookName || 'Facebook Messenger',
    }
  ]);

  // Preferred social platform for push notifications
  const preferredPlatform = reservation?.socialPlatformChoice || 'facebook';
  const socialHandle = reservation?.socialHandleOrUrl || reservation?.facebookName || '@renter';

  // Calculate distance between two coordinates in km (Haversine Formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Nearby destinations sorted by distance
  const nearbySpots = ZAMBALES_RECOMMENDED_DESTINATIONS.map((dest) => {
    const dist = calculateDistance(currentLat, currentLng, dest.coordinates.lat, dest.coordinates.lng);
    return { ...dest, distanceKm: dist };
  }).sort((a, b) => a.distanceKm - b.distanceKm);

  // Handle GPS simulation tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isSimulatingRide && isSharingLocation) {
      interval = setInterval(() => {
        setRouteIndex((prev) => {
          const nextIdx = (prev + 1) % SIMULATED_ROUTE_POINTS.length;
          const nextPoint = SIMULATED_ROUTE_POINTS[nextIdx];
          setCurrentLat(nextPoint.lat + (Math.random() - 0.5) * 0.005);
          setCurrentLng(nextPoint.lng + (Math.random() - 0.5) * 0.005);
          setSpeedKmh(Math.floor(35 + Math.random() * 20));
          setHeading(`En Route to ${nextPoint.name}`);

          // Check if close to a destination (< 2.5 km) and not yet notified recently
          const closest = ZAMBALES_RECOMMENDED_DESTINATIONS.find(d => {
            const dist = calculateDistance(nextPoint.lat, nextPoint.lng, d.coordinates.lat, d.coordinates.lng);
            return dist <= 2.5;
          });

          if (closest) {
            const dist = calculateDistance(nextPoint.lat, nextPoint.lng, closest.coordinates.lat, closest.coordinates.lng);
            const newAlert: ProximityNotification = {
              id: `alert-${Date.now()}`,
              destinationName: closest.name,
              distanceKm: dist,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              message: `Approaching ${closest.name} (${dist} km away). ${closest.description}`,
              tip: `Best visited: ${closest.bestTimeToVisit}. Don't forget to take clip for video reward!`,
              sentToPlatform: preferredPlatform === 'instagram' ? 'instagram' : 'facebook',
              platformTarget: socialHandle,
            };

            setSentAlerts((prevAlerts) => [newAlert, ...prevAlerts.slice(0, 9)]);
            showToast(`Proximity Alert sent to your ${preferredPlatform.toUpperCase()}: Near ${closest.name}!`, 'info');
          }

          return nextIdx;
        });
      }, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulatingRide, isSharingLocation, preferredPlatform, socialHandle]);

  if (!isOpen) return null;

  const handleFetchDeviceGps = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCurrentLat(pos.coords.latitude);
          setCurrentLng(pos.coords.longitude);
          setSpeedKmh(pos.coords.speed ? Math.round(pos.coords.speed * 3.6) : 40);
          showToast('Updated with real live GPS device coordinates!', 'success');
        },
        () => {
          showToast('Could not retrieve browser GPS; continuing with Zambales Coastal telemetry.', 'warning');
        }
      );
    }
  };

  const handleSendManualAlert = (dest: RecommendedDestination & { distanceKm: number }) => {
    const newAlert: ProximityNotification = {
      id: `alert-${Date.now()}`,
      destinationName: dest.name,
      distanceKm: dest.distanceKm,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: `Riding near ${dest.name} (${dest.distanceKm} km). Recommended: ${dest.description}`,
      tip: `Photo / Video prompt dispatched to ${socialHandle}. Best timing: ${dest.bestTimeToVisit}`,
      sentToPlatform: preferredPlatform === 'instagram' ? 'instagram' : 'facebook',
      platformTarget: socialHandle,
    };
    setSentAlerts(prev => [newAlert, ...prev]);
    showToast(`Smart recommendation sent to ${socialHandle} via ${preferredPlatform.toUpperCase()}!`, 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-6 text-xs flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-bold">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-100 text-sm sm:text-base">
                  Renter Live GPS Companion & Smart Social Alerts
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-ping" />
                  <span>Geofence Active</span>
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Share location during your Zambales ride. When you pass by tagged spots, recommendations & photo tips are sent to your social media.
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Location Sharing Switch & Telemetry Ribbon */}
          <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="shareGpsToggle"
                checked={isSharingLocation}
                onChange={(e) => setIsSharingLocation(e.target.checked)}
                className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
              />
              <div>
                <label htmlFor="shareGpsToggle" className="font-bold text-stone-100 text-sm cursor-pointer block">
                  Share Live Location with {currentBusiness.name}
                </label>
                <span className="text-[11px] text-stone-400">
                  Enables proximity alerts for San Antonio, San Narciso, San Felipe, and Cabangan.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleFetchDeviceGps}
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>My Live GPS</span>
              </button>

              <button
                type="button"
                onClick={() => setIsSimulatingRide(!isSimulatingRide)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  isSimulatingRide
                    ? 'bg-amber-400 text-stone-950'
                    : 'bg-stone-900 border border-stone-800 text-stone-300 hover:border-amber-400'
                }`}
              >
                {isSimulatingRide ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Coastal Sim</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 text-amber-400" />
                    <span>Simulate Coastal Ride</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Current Position & Connected Social Dispatch Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-950 space-y-1">
              <span className="text-stone-500 text-[10px] uppercase font-mono block">Current Coordinates</span>
              <div className="font-mono text-stone-200 font-bold text-xs truncate">
                {currentLat.toFixed(4)}° N, {currentLng.toFixed(4)}° E
              </div>
              <span className="text-[11px] text-amber-400 block font-medium truncate">{heading}</span>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-950 space-y-1">
              <span className="text-stone-500 text-[10px] uppercase font-mono block">Cruising Speed</span>
              <div className="font-mono text-stone-100 font-bold text-lg tabular-nums">
                {speedKmh} <span className="text-xs text-stone-400 font-normal">km/h</span>
              </div>
              <span className="text-[11px] text-emerald-400 block">Safe Riding Pace</span>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-800 bg-stone-950 space-y-1">
              <span className="text-stone-500 text-[10px] uppercase font-mono block">Connected Social Destination</span>
              <div className="flex items-center gap-1.5 font-bold text-stone-200">
                {preferredPlatform === 'instagram' ? (
                  <Instagram className="w-3.5 h-3.5 text-pink-400" />
                ) : (
                  <Facebook className="w-3.5 h-3.5 text-blue-400" />
                )}
                <span className="capitalize">{preferredPlatform} Alerts</span>
              </div>
              <span className="text-[11px] text-stone-400 font-mono truncate block">{socialHandle}</span>
            </div>
          </div>

          {/* Nearby Tagged Destinations with Proximity Push */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>Tagged Zambales Destinations (Nearest to You)</span>
              </span>
              <span className="text-stone-400 text-[11px]">Auto-triggers within 3 km</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {nearbySpots.slice(0, 6).map((spot) => {
                const isWithinRange = spot.distanceKm <= 3.0;
                return (
                  <div
                    key={spot.id}
                    className={`p-3 rounded-xl border transition-colors flex items-start justify-between gap-3 ${
                      isWithinRange
                        ? 'bg-amber-400/10 border-amber-400/40 text-stone-200'
                        : 'bg-stone-950 border-stone-800 text-stone-400'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-200 text-xs">{spot.name}</span>
                        {isWithinRange && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-amber-400 text-stone-950 font-bold">
                            In Range
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-400 leading-tight line-clamp-2">
                        {spot.description}
                      </p>
                      <div className="text-[10px] font-mono text-stone-500 pt-0.5">
                        {spot.location} · {spot.bestTimeToVisit}
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-1.5">
                      <span className={`font-mono font-bold text-sm block ${isWithinRange ? 'text-amber-400' : 'text-stone-400'}`}>
                        {spot.distanceKm} km
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSendManualAlert(spot)}
                        className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[10px] font-semibold flex items-center gap-1"
                        title="Simulate sending alert to connected social media"
                      >
                        <Send className="w-2.5 h-2.5 text-amber-400" />
                        <span>Push Tip</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Notification Feed Delivered to Social Media */}
          <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-blue-400" />
                <span>Delivered Social Media Alerts & Photo Spot Prompts</span>
              </span>
              <span className="text-[10px] font-mono text-stone-500">
                Connected via {preferredPlatform}
              </span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto">
              {sentAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-lg bg-stone-900/80 border border-stone-800/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>{alert.destinationName} ({alert.distanceKm} km)</span>
                    </span>
                    <span className="text-[10px] font-mono text-stone-500">{alert.timestamp}</span>
                  </div>
                  <p className="text-stone-300 text-[11px]">{alert.message}</p>
                  <div className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 pt-0.5">
                    <Camera className="w-3 h-3 text-emerald-400" />
                    <span>{alert.tip}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800 bg-stone-950">
          <div className="text-stone-400 text-[11px] flex items-center gap-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Location shared securely with {currentBusiness.name}. Never distributed to 3rd parties.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold"
          >
            Close Companion
          </button>
        </div>

      </div>
    </div>
  );
};
