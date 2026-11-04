import { PickupLocation } from '../types';

export const INITIAL_NOMINATED_LOCATIONS: PickupLocation[] = [
  {
    id: 'loc-san-felipe-hq',
    name: 'San Felipe HQ & Depot',
    address: 'National Highway, Brgy. West Dirita, San Felipe, Zambales',
    landmark: 'Beside San Felipe Public Market & Petron',
    coordinates: { lat: 15.0601, lng: 120.0635 },
    deliveryFee: 0,
    operatingHours: '07:00 AM - 08:00 PM',
    isDepotHQ: true,
    googleMapsUrl: 'https://maps.google.com/?q=15.0601,120.0635',
    photos: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=800&auto=format&fit=crop&q=80',
    ],
    contactStaff: {
      name: 'Mark Ramos',
      mobile: '0917 832 9900',
      role: 'Depot Shift Supervisor',
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    },
    timingsSchedule: 'Monday to Sunday: 7:00 AM – 8:00 PM (Cut-off for new departures: 6:30 PM)',
  },
  {
    id: 'loc-liwliwa-beach',
    name: 'Liwliwa Beach Dropoff Hub',
    address: 'Liwliwa Coastal Access Road, San Felipe, Zambales',
    landmark: 'Between The Circle Hostel & Kapitan Liwa',
    coordinates: { lat: 15.0450, lng: 120.0520 },
    deliveryFee: 150,
    operatingHours: '08:00 AM - 06:00 PM',
    isDepotHQ: false,
    googleMapsUrl: 'https://maps.google.com/?q=15.0450,120.0520',
    photos: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    ],
    contactStaff: {
      name: 'Kenji David',
      mobile: '0918 554 2190',
      role: 'Liwliwa Beach Dispatcher',
    },
    timingsSchedule: 'Daily: 8:00 AM – 6:00 PM. Meetup point at beachfront turnaround.',
  },
  {
    id: 'loc-crystal-beach',
    name: 'Crystal Beach Resort Front Gate',
    address: 'Brgy. La Paz, San Narciso, Zambales',
    landmark: 'Main Guardhouse & Parking Area',
    coordinates: { lat: 15.0080, lng: 120.0600 },
    deliveryFee: 200,
    operatingHours: '08:00 AM - 06:00 PM',
    isDepotHQ: false,
    googleMapsUrl: 'https://maps.google.com/?q=15.0080,120.0600',
    photos: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    ],
    contactStaff: {
      name: 'Sarah Gomez',
      mobile: '0920 119 4432',
      role: 'San Narciso Dispatch Coordinator',
    },
    timingsSchedule: 'Daily: 8:00 AM – 6:00 PM. Resort visitor parking pickup bay.',
  },
  {
    id: 'loc-san-narciso-town',
    name: 'San Narciso Town Plaza Hub',
    address: 'Town Plaza, San Narciso, Zambales',
    landmark: 'In front of San Narciso Municipal Hall',
    coordinates: { lat: 15.0135, lng: 120.0760 },
    deliveryFee: 200,
    operatingHours: '08:00 AM - 07:00 PM',
    isDepotHQ: false,
    googleMapsUrl: 'https://maps.google.com/?q=15.0135,120.0760',
    timingsSchedule: 'Open 8:00 AM – 7:00 PM. Municipal plaza waiting lounge.',
  },
  {
    id: 'loc-san-antonio-pundaquit',
    name: 'San Antonio Pundaquit Gateway',
    address: 'Pundaquit Beach Road, San Antonio, Zambales',
    landmark: 'Boat Jump-Off to Anawangin & Nagsasa Cove',
    coordinates: { lat: 14.9450, lng: 120.0620 },
    deliveryFee: 350,
    operatingHours: '07:30 AM - 05:30 PM',
    isDepotHQ: false,
    googleMapsUrl: 'https://maps.google.com/?q=14.9450,120.0620',
    timingsSchedule: '7:30 AM – 5:30 PM. Harbor drop bay for island hoppers.',
  },
  {
    id: 'loc-cabangan-hub',
    name: 'Cabangan Coastal Hub',
    address: 'National Highway, Cabangan, Zambales',
    landmark: 'Cabangan Bridge Viewdeck',
    coordinates: { lat: 15.1580, lng: 120.0450 },
    deliveryFee: 300,
    operatingHours: '08:00 AM - 05:00 PM',
    isDepotHQ: false,
    googleMapsUrl: 'https://maps.google.com/?q=15.1580,120.0450',
    timingsSchedule: '8:00 AM – 5:00 PM. Scenic viewpoint parking slot.',
  },
];

export function getGoogleMapsEmbedUrl(lat: number, lng: number, zoom = 14): string {
  return `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`;
}

export function getGoogleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

// Haversine formula to compute distance between two GPS coordinates in meters
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
