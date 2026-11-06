import React, { useState } from 'react';
import { PickupLocation } from '../../types';
import { getGoogleMapsEmbedUrl, getGoogleMapsDirectionsUrl } from '../../utils/googleMapsHelper';
import { MapPin, X, Plus, ExternalLink, Save, Check, Navigation, AlertCircle } from 'lucide-react';

interface LocationPinningModalProps {
  location?: PickupLocation | null;
  onSave: (location: Omit<PickupLocation, 'id'> & { id?: string }) => void;
  onClose: () => void;
}

export const LocationPinningModal: React.FC<LocationPinningModalProps> = ({
  location,
  onSave,
  onClose,
}) => {
  const [name, setName] = useState(location?.name || '');
  const [address, setAddress] = useState(location?.address || 'Zambales, Philippines');
  const [landmark, setLandmark] = useState(location?.landmark || '');
  const [lat, setLat] = useState<number>(location?.coordinates?.lat || 15.0601);
  const [lng, setLng] = useState<number>(location?.coordinates?.lng || 120.0635);
  const [deliveryFee, setDeliveryFee] = useState<number>(location?.deliveryFee || 0);
  const [operatingHours, setOperatingHours] = useState(location?.operatingHours || '08:00 AM - 06:00 PM');
  const [isDepotHQ, setIsDepotHQ] = useState<boolean>(location?.isDepotHQ || false);
  const [photos, setPhotos] = useState<string[]>(location?.photos || [
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
  ]);
  const [staffName, setStaffName] = useState(location?.contactStaff?.name || '');
  const [staffMobile, setStaffMobile] = useState(location?.contactStaff?.mobile || '');
  const [staffRole, setStaffRole] = useState(location?.contactStaff?.role || 'Depot Supervisor');
  const [timingsSchedule, setTimingsSchedule] = useState(
    location?.timingsSchedule || 'Open Daily 7:00 AM – 7:00 PM. Sunset dispatch cut-off at 6:30 PM.'
  );

  const embedUrl = getGoogleMapsEmbedUrl(lat, lng, 15);
  const directionsUrl = getGoogleMapsDirectionsUrl(lat, lng);

  const handlePresetSelect = (presetLat: number, presetLng: number, presetName: string, presetAddress: string, presetLandmark: string) => {
    setLat(presetLat);
    setLng(presetLng);
    if (!name) setName(presetName);
    if (!landmark) setLandmark(presetLandmark);
    setAddress(presetAddress);
  };

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPhotos((prev) => [...prev, reader.result as string]);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSave({
      id: location?.id,
      name,
      address,
      landmark,
      coordinates: { lat, lng },
      deliveryFee,
      operatingHours,
      isDepotHQ,
      googleMapsUrl: directionsUrl,
      photos,
      contactStaff: {
        name: staffName,
        mobile: staffMobile,
        role: staffRole,
      },
      timingsSchedule,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-8 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-stone-100 text-sm">
                {location ? 'Edit Nominated Pickup Location' : 'Nominate & Pin New Pickup Location'}
              </h3>
              <p className="text-[11px] text-stone-400">
                Pin your depot or designated drop-off spot on Google Maps for renters to select.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Quick presets for Zambales hubs */}
          <div className="space-y-1.5">
            <label className="text-stone-400 text-[11px]">Quick Pin to Popular Zambales Hubs:</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { name: 'San Felipe HQ', lat: 15.0601, lng: 120.0635, address: 'West Dirita, San Felipe', landmark: 'Beside Public Market' },
                { name: 'Liwliwa Beach', lat: 15.0450, lng: 120.0520, address: 'Liwliwa Surf Coast', landmark: 'Near The Circle Hostel' },
                { name: 'Crystal Beach', lat: 15.0080, lng: 120.0600, address: 'La Paz, San Narciso', landmark: 'Resort Guardhouse' },
                { name: 'San Narciso Plaza', lat: 15.0135, lng: 120.0760, address: 'Town Plaza, San Narciso', landmark: 'Municipal Hall' },
                { name: 'Pundaquit Cove', lat: 14.9450, lng: 120.0620, address: 'Pundaquit, San Antonio', landmark: 'Boat Station' },
                { name: 'Cabangan Hub', lat: 15.1580, lng: 120.0450, address: 'National Hwy, Cabangan', landmark: 'Bridge Viewdeck' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handlePresetSelect(p.lat, p.lng, p.name, p.address, p.landmark)}
                  className="p-1.5 text-left rounded border border-stone-800 bg-stone-950 hover:border-amber-400 text-[11px] truncate"
                >
                  <div className="font-semibold text-stone-200 truncate">{p.name}</div>
                  <div className="text-[10px] text-stone-500 font-mono">{p.lat}, {p.lng}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-stone-400 mb-1">Location Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Liwliwa Beach Dropoff Hub"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg text-stone-100"
              />
            </div>

            <div>
              <label className="block text-stone-400 mb-1">Landmark / Specific Spot</label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Beside The Circle Hostel entrance"
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg text-stone-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-400 mb-1">Full Road Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Liwliwa Coastal Access Road, San Felipe, Zambales"
              className="w-full px-3 py-2 bg-stone-950 border border-stone-800 focus:border-amber-400 rounded-lg text-stone-100"
            />
          </div>

          {/* Latitude & Longitude Pin Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-stone-400 mb-1">Latitude (Pin)</label>
              <input
                type="number"
                step="0.0001"
                value={lat}
                onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded font-mono text-amber-400"
              />
            </div>

            <div>
              <label className="block text-stone-400 mb-1">Longitude (Pin)</label>
              <input
                type="number"
                step="0.0001"
                value={lng}
                onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded font-mono text-amber-400"
              />
            </div>

            <div>
              <label className="block text-stone-400 mb-1">Delivery Fee (₱)</label>
              <input
                type="number"
                min="0"
                value={deliveryFee}
                onChange={(e) => setDeliveryFee(parseInt(e.target.value, 10) || 0)}
                placeholder="0 = Free"
                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded font-mono text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-stone-400 mb-1">Operating Hours</label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="e.g. 08:00 AM - 06:00 PM"
                className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-200"
              />
            </div>
          </div>

          {/* Detailed Timings & Openings */}
          <div>
            <label className="block text-stone-400 mb-1">Detailed Openings & Schedule Details</label>
            <input
              type="text"
              value={timingsSchedule}
              onChange={(e) => setTimingsSchedule(e.target.value)}
              placeholder="e.g. Open daily 7:00 AM – 7:00 PM. Cut-off for new departures: 6:30 PM."
              className="w-full px-2.5 py-1.5 bg-stone-950 border border-stone-800 rounded text-stone-200"
            />
          </div>

          {/* Designated Contact Staff for this Pickup Location */}
          <div className="p-3 rounded-xl border border-stone-800 bg-stone-950/70 space-y-2">
            <span className="font-semibold text-stone-200 block text-xs">
              Designated Contact Staff on this Location
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] text-stone-400 mb-0.5">Staff Name</label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Juan dela Cruz"
                  className="w-full px-2 py-1 bg-stone-900 border border-stone-800 rounded text-stone-200 text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 mb-0.5">Mobile Phone</label>
                <input
                  type="text"
                  value={staffMobile}
                  onChange={(e) => setStaffMobile(e.target.value)}
                  placeholder="0917 832 9900"
                  className="w-full px-2 py-1 bg-stone-900 border border-stone-800 rounded text-stone-200 font-mono text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] text-stone-400 mb-0.5">Role / Position</label>
                <input
                  type="text"
                  value={staffRole}
                  onChange={(e) => setStaffRole(e.target.value)}
                  placeholder="e.g. Depot Supervisor"
                  className="w-full px-2 py-1 bg-stone-900 border border-stone-800 rounded text-stone-200 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Depot & Location Photos */}
          <div className="p-3 rounded-xl border border-stone-800 bg-stone-950/70 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-stone-200 block text-xs">
                Depot & Parking Photos ({photos.length} uploaded)
              </span>
              <label className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[11px] font-semibold cursor-pointer flex items-center gap-1">
                <Plus className="w-3 h-3 text-amber-400" />
                <span>Upload Depot Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAddPhoto}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              {photos.map((p, idx) => (
                <div key={idx} className="relative w-16 h-12 rounded-lg overflow-hidden border border-stone-800 group">
                  <img src={p} alt={`Depot ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    className="absolute inset-0 bg-red-600/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* HQ Toggle */}
          <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 flex items-center justify-between">
            <div>
              <span className="font-semibold text-stone-200 block">Main Depot HQ Location</span>
              <span className="text-[11px] text-stone-400">Is this your primary garage where fleet units are housed?</span>
            </div>
            <input
              type="checkbox"
              checked={isDepotHQ}
              onChange={(e) => setIsDepotHQ(e.target.checked)}
              className="w-4 h-4 accent-amber-400 rounded"
            />
          </div>

          {/* Live Google Maps Interactive Embed Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-stone-300 font-semibold flex items-center gap-1.5">
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                <span>Live Google Maps Pin Preview</span>
              </label>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Open in Google Maps App</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="h-48 w-full rounded-xl overflow-hidden border border-stone-800 bg-stone-950">
              <iframe
                title="Google Maps Location Pin"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src={embedUrl}
                className="filter contrast-[1.05]"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold flex items-center gap-1.5 shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Nominated Location</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
