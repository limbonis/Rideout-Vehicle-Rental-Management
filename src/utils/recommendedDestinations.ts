import { RecommendedDestination } from '../types';

export const RECOMMENDED_DESTINATIONS: RecommendedDestination[] = [
  {
    id: 'dest-liwliwa',
    name: 'Liwliwa Surf Break & Sunset Strip',
    category: 'surf',
    location: 'San Felipe, Zambales',
    coordinates: { lat: 15.0450, lng: 120.0520 },
    description: 'Premier surfing spot with bohemian beach cafes, acoustic beach bars, and vibrant rider sunset viewpoints.',
    googleMapsPlaceUrl: 'https://maps.google.com/?q=Liwliwa+Beach+San+Felipe+Zambales',
    bestTimeToVisit: '04:30 PM - 06:30 PM (Golden Hour)',
  },
  {
    id: 'dest-crystal-beach',
    name: 'Crystal Beach Pine Trees & Surfing',
    category: 'beach',
    location: 'San Narciso, Zambales',
    coordinates: { lat: 15.0080, lng: 120.0600 },
    description: 'Iconic pine tree lined coastline, calm camping grounds, and smooth coastal cruising pavement.',
    googleMapsPlaceUrl: 'https://maps.google.com/?q=Crystal+Beach+Resort+San+Narciso',
    bestTimeToVisit: '07:00 AM - 10:00 AM (Quiet Morning Waves)',
  },
  {
    id: 'dest-anawangin-jumpoff',
    name: 'Pundaquit Anawangin & Nagsasa Gateway',
    category: 'beach',
    location: 'San Antonio, Zambales',
    coordinates: { lat: 14.9450, lng: 120.0620 },
    description: 'The scenic launch pad to Capones Island Lighthouse and secluded volcanic ash coves.',
    googleMapsPlaceUrl: 'https://maps.google.com/?q=Pundaquit+San+Antonio+Zambales',
    bestTimeToVisit: '06:30 AM - 09:00 AM',
  },
  {
    id: 'dest-botolan-pass',
    name: 'Botolan Mountain Scenic Loop & Falls',
    category: 'scenic_loop',
    location: 'Botolan, Zambales',
    coordinates: { lat: 15.2890, lng: 120.0250 },
    description: 'Paved winding mountain pass leading to Maraunot Falls and views of Mt. Pinatubo lahar canyon.',
    googleMapsPlaceUrl: 'https://maps.google.com/?q=Botolan+Zambales+Scenic+Highway',
    bestTimeToVisit: '08:00 AM - 02:00 PM',
  },
  {
    id: 'dest-cabangan-coast',
    name: 'Cabangan Secluded Beach Loop',
    category: 'beach',
    location: 'Cabangan, Zambales',
    coordinates: { lat: 15.1580, lng: 120.0450 },
    description: 'Uncrowded stretch of gray sand beach with panoramic mountain-meets-ocean backdrop.',
    googleMapsPlaceUrl: 'https://maps.google.com/?q=Cabangan+Beach+Zambales',
    bestTimeToVisit: '03:00 PM - 06:00 PM',
  },
];

export const ZAMBALES_RECOMMENDED_DESTINATIONS = RECOMMENDED_DESTINATIONS;
