/**
 * Nearby Towns and Tourist Hubs Mapping Helper for Philippine Motorcycle Rental Depots
 */

export interface NearbyTown {
  id: string;
  name: string;
  province: string;
  distanceKm: number;
  travelTimeMins: number;
  highlight: string;
  scenicType: 'beach' | 'surf' | 'waterfall' | 'mountain' | 'town_center' | 'viewpoint';
  popularHashtags: string[];
}

export const REGIONAL_TOWNS_DATABASE: Record<string, NearbyTown[]> = {
  // Zambales (San Felipe, Liwliwa, Botolan, etc.)
  zambales: [
    {
      id: 'liwliwa',
      name: 'Liwliwa Beach (San Felipe)',
      province: 'Zambales',
      distanceKm: 4,
      travelTimeMins: 8,
      highlight: 'Famous surf breaks, boho beachfront cafes, surf racks',
      scenicType: 'surf',
      popularHashtags: ['#Liwliwa', '#LiwliwaSurf', '#SanFelipeZambales', '#ZambalesSurfing'],
    },
    {
      id: 'san_narciso',
      name: 'San Narciso',
      province: 'Zambales',
      distanceKm: 7,
      travelTimeMins: 12,
      highlight: 'Pine tree beach stretch, Crystal Beach, heritage farm trails',
      scenicType: 'beach',
      popularHashtags: ['#SanNarciso', '#CrystalBeachZambales', '#PineTreeBeach'],
    },
    {
      id: 'san_antonio',
      name: 'San Antonio & Pundaquit',
      province: 'Zambales',
      distanceKm: 14,
      travelTimeMins: 20,
      highlight: 'Pundaquit coastal cove, jump-off for Anawangin & Nagsasa',
      scenicType: 'viewpoint',
      popularHashtags: ['#Pundaquit', '#SanAntonioZambales', '#AnawanginCove'],
    },
    {
      id: 'cabangan',
      name: 'Cabangan Seawall & Coast',
      province: 'Zambales',
      distanceKm: 16,
      travelTimeMins: 22,
      highlight: 'Clean golden hour seawall loop, uncrowded white sand coast',
      scenicType: 'beach',
      popularHashtags: ['#Cabangan', '#CabanganBeach', '#ZambalesSunsetRide'],
    },
    {
      id: 'botolan',
      name: 'Botolan & Lahar Trails',
      province: 'Zambales',
      distanceKm: 28,
      travelTimeMins: 35,
      highlight: 'Botolan wide riverbed, Maraunot Falls pass, dual-sport lahar trails',
      scenicType: 'mountain',
      popularHashtags: ['#Botolan', '#PinatuboTrails', '#DualSportZambales'],
    },
    {
      id: 'iba',
      name: 'Iba (Capital)',
      province: 'Zambales',
      distanceKm: 38,
      travelTimeMins: 45,
      highlight: 'Provincial capital, seaside runway strip, mango capital loops',
      scenicType: 'town_center',
      popularHashtags: ['#IbaZambales', '#ZambalesRoadtrip', '#ExploreZambales'],
    },
    {
      id: 'subic_bay',
      name: 'Subic Bay & Castillejos',
      province: 'Zambales',
      distanceKm: 42,
      travelTimeMins: 50,
      highlight: 'Winding coastal pass, duty-free zone, rainforest highways',
      scenicType: 'viewpoint',
      popularHashtags: ['#SubicBay', '#Castillejos', '#SubicRideout'],
    },
  ],

  // La Union (San Juan, Bacnotan, Urbiztondo, etc.)
  'la union': [
    {
      id: 'urbiztondo',
      name: 'Urbiztondo Beach (San Juan)',
      province: 'La Union',
      distanceKm: 2,
      travelTimeMins: 5,
      highlight: 'Surfing capital, beachfront dining strip, vibrant nightlife',
      scenicType: 'surf',
      popularHashtags: ['#Urbiztondo', '#ElyuSurf', '#SanJuanLaUnion'],
    },
    {
      id: 'bacnotan',
      name: 'Bacnotan & Quirino Bridge',
      province: 'La Union',
      distanceKm: 12,
      travelTimeMins: 16,
      highlight: 'Scenic bridge crossing, quiet surf spots, black pebble coast',
      scenicType: 'beach',
      popularHashtags: ['#Bacnotan', '#NorthElyu', '#SurfingBacnotan'],
    },
    {
      id: 'san_fernando',
      name: 'San Fernando City & Cliffs',
      province: 'La Union',
      distanceKm: 8,
      travelTimeMins: 14,
      highlight: 'Poro Point Lighthouse, cliffside coastal views, food hub',
      scenicType: 'viewpoint',
      popularHashtags: ['#PoroPoint', '#SanFernandoLaUnion', '#ElyuCoast'],
    },
    {
      id: 'tangadan',
      name: 'Tangadan Falls (San Gabriel)',
      province: 'La Union',
      distanceKm: 18,
      travelTimeMins: 28,
      highlight: 'Two-tier waterfall, refreshing river dip, mountain twisties',
      scenicType: 'waterfall',
      popularHashtags: ['#TangadanFalls', '#SanGabrielElyu', '#WaterfallLoop'],
    },
    {
      id: 'luna',
      name: 'Luna & Baluarte Watchtower',
      province: 'La Union',
      distanceKm: 25,
      travelTimeMins: 34,
      highlight: 'Historical Spanish stone tower, multicolored pebble beach',
      scenicType: 'viewpoint',
      popularHashtags: ['#BaluarteLuna', '#PebbleBeach', '#LunaLaUnion'],
    },
    {
      id: 'bauang',
      name: 'Bauang Grape Farms & Seawall',
      province: 'La Union',
      distanceKm: 19,
      travelTimeMins: 26,
      highlight: 'Grape picking farms, calm sunset beach roads',
      scenicType: 'beach',
      popularHashtags: ['#BauangGrapeFarm', '#BauangCoast', '#ElyuTour'],
    },
  ],

  // Siargao Island (General Luna, Cloud 9, Dapa, Pilar, etc.)
  siargao: [
    {
      id: 'cloud_9',
      name: 'Cloud 9 Boardwalk',
      province: 'Surigao del Norte',
      distanceKm: 3,
      travelTimeMins: 6,
      highlight: 'World-renowned surfing boardwalk, sunset view deck',
      scenicType: 'surf',
      popularHashtags: ['#Cloud9', '#SiargaoSurfing', '#Cloud9Boardwalk'],
    },
    {
      id: 'catangnan',
      name: 'Catangnan Bridge & Sunset Strip',
      province: 'Surigao del Norte',
      distanceKm: 4,
      travelTimeMins: 8,
      highlight: 'Iconic sunset bridge hangout, roadside BBQ, acoustic vibes',
      scenicType: 'viewpoint',
      popularHashtags: ['#CatangnanBridge', '#SiargaoSunset', '#AfamBridge'],
    },
    {
      id: 'coconut_road',
      name: 'Coconut Tree Viewpoint & Road',
      province: 'Surigao del Norte',
      distanceKm: 14,
      travelTimeMins: 18,
      highlight: 'Vast ocean of palm trees, bent palm tree river swing',
      scenicType: 'mountain',
      popularHashtags: ['#CoconutRoad', '#SiargaoPalms', '#MaasinRiver'],
    },
    {
      id: 'magpupungko',
      name: 'Magpupungko Rock Pools (Pilar)',
      province: 'Surigao del Norte',
      distanceKm: 35,
      travelTimeMins: 45,
      highlight: 'Natural tidal infinity rock pools, crystal clear turquoise water',
      scenicType: 'beach',
      popularHashtags: ['#Magpupungko', '#PilarSiargao', '#TidalPools'],
    },
    {
      id: 'pacifico',
      name: 'Pacifico Beach & Lighthouse',
      province: 'Surigao del Norte',
      distanceKm: 48,
      travelTimeMins: 55,
      highlight: 'Laid-back northern surf break, secluded beaches, lighthouse loop',
      scenicType: 'surf',
      popularHashtags: ['#PacificoBeach', '#NorthSiargao', '#SanIsidro'],
    },
    {
      id: 'dapa',
      name: 'Dapa Commercial Port',
      province: 'Surigao del Norte',
      distanceKm: 16,
      travelTimeMins: 22,
      highlight: 'Island commercial capital, ferry port, local market strip',
      scenicType: 'town_center',
      popularHashtags: ['#DapaSiargao', '#IslandPort', '#SiargaoLife'],
    },
  ],

  // Boracay / Aklan
  boracay: [
    {
      id: 'puka_beach',
      name: 'Puka Shell Beach',
      province: 'Aklan',
      distanceKm: 6,
      travelTimeMins: 14,
      highlight: 'Crushed puka shells, uncommercialized north coast, deep blue water',
      scenicType: 'beach',
      popularHashtags: ['#PukaBeach', '#BoracayLoop', '#NorthBoracay'],
    },
    {
      id: 'bulabog',
      name: 'Bulabog Beach',
      province: 'Aklan',
      distanceKm: 3,
      travelTimeMins: 7,
      highlight: 'Kitesurfing and windsurfing east coast, morning sunrise spot',
      scenicType: 'surf',
      popularHashtags: ['#BulabogBeach', '#BoracayKite', '#EastCoastBoracay'],
    },
    {
      id: 'ilig_iligan',
      name: 'Ilig-Iligan & Keyhole Rock',
      province: 'Aklan',
      distanceKm: 7,
      travelTimeMins: 16,
      highlight: 'Newcoast keyhole natural stone arch, tranquil coves',
      scenicType: 'viewpoint',
      popularHashtags: ['#BoracayKeyhole', '#IligIligan', '#BoracayNewcoast'],
    },
    {
      id: 'caticlan',
      name: 'Caticlan & Mainland Coast',
      province: 'Aklan',
      distanceKm: 5,
      travelTimeMins: 18,
      highlight: 'Mainland gateway, jetty port highway, airport coastal road',
      scenicType: 'town_center',
      popularHashtags: ['#Caticlan', '#MainlandAklan', '#BoracayTravel'],
    },
  ],

  // Pampanga (Porac, Angeles, Clark Freeport, San Fernando, etc.)
  pampanga: [
    {
      id: 'porac_lahar',
      name: 'Porac Sand Dunes & Lahar Trails',
      province: 'Pampanga',
      distanceKm: 5,
      travelTimeMins: 10,
      highlight: 'Pinatubo lahar canyon, off-road dual-sport motorcycle passes, scenic rivers',
      scenicType: 'mountain',
      popularHashtags: ['#PoracPampanga', '#PoracLahar', '#PinatuboOffroad', '#ExplorePampanga'],
    },
    {
      id: 'alviera_porac',
      name: 'Alviera Eco-Hub (Porac)',
      province: 'Pampanga',
      distanceKm: 8,
      travelTimeMins: 12,
      highlight: 'Scenic mountain backdrop, SandBox adventure park, wide open highways',
      scenicType: 'viewpoint',
      popularHashtags: ['#AlvieraPorac', '#SandBoxPampanga', '#PoracRoadtrip'],
    },
    {
      id: 'clark_freeport',
      name: 'Clark Freeport & Parade Grounds',
      province: 'Pampanga',
      distanceKm: 15,
      travelTimeMins: 20,
      highlight: 'Tree-lined wide boulevards, duty-free shopping, bike lanes & cafe strips',
      scenicType: 'town_center',
      popularHashtags: ['#ClarkFreeport', '#ClarkPampanga', '#ClarkBikers'],
    },
    {
      id: 'angeles_heritage',
      name: 'Angeles City Culinary & Heritage Strip',
      province: 'Pampanga',
      distanceKm: 18,
      travelTimeMins: 25,
      highlight: 'Culinary capital of the Philippines, authentic sisig hubs, heritage church',
      scenicType: 'town_center',
      popularHashtags: ['#AngelesCity', '#PampangaFoodTrip', '#SisigCapital'],
    },
    {
      id: 'san_fernando_capitol',
      name: 'City of San Fernando (Capital)',
      province: 'Pampanga',
      distanceKm: 24,
      travelTimeMins: 32,
      highlight: 'Giant lantern capital, colonial heritage mansions, commercial center',
      scenicType: 'town_center',
      popularHashtags: ['#SanFernandoPampanga', '#GiantLanternCity'],
    },
    {
      id: 'arayat_national_park',
      name: 'Mount Arayat National Park',
      province: 'Pampanga',
      distanceKm: 34,
      travelTimeMins: 45,
      highlight: 'Iconic mountain twisties, natural spring pools, breathtaking Central Luzon views',
      scenicType: 'mountain',
      popularHashtags: ['#MtArayat', '#ArayatNationalPark', '#PampangaTwisties'],
    },
    {
      id: 'floridablanca',
      name: 'Floridablanca & Nabuclod Views',
      province: 'Pampanga',
      distanceKm: 22,
      travelTimeMins: 30,
      highlight: 'Aeta mountain community viewpoints, Pinatubo ridges, scenic winding loops',
      scenicType: 'viewpoint',
      popularHashtags: ['#Floridablanca', '#NabuclodViewdeck'],
    },
  ],

  // Bataan (Morong, Bagac, Mariveles, Balanga)
  bataan: [
    {
      id: 'morong_beach',
      name: 'Morong Coastal Strip & Pawikan Sanctuary',
      province: 'Bataan',
      distanceKm: 8,
      travelTimeMins: 15,
      highlight: 'Tranquil sea turtle marine sanctuary, golden sand sunset ride',
      scenicType: 'beach',
      popularHashtags: ['#MorongBataan', '#PawikanSanctuary', '#BataanCoast'],
    },
    {
      id: 'las_casas_bagac',
      name: 'Bagac & Las Casas Heritage Area',
      province: 'Bataan',
      distanceKm: 18,
      travelTimeMins: 25,
      highlight: 'Colonial Spanish stone houses, cobblestone seaside promenade',
      scenicType: 'viewpoint',
      popularHashtags: ['#LasCasasFilipinas', '#BagacBataan', '#HeritageRide'],
    },
    {
      id: 'mariveles_cove',
      name: 'Mariveles Five Fingers Coves',
      province: 'Bataan',
      distanceKm: 45,
      travelTimeMins: 55,
      highlight: 'Dramatic sea cliffs, rugged coastal twisties, panoramic viewpoints',
      scenicType: 'viewpoint',
      popularHashtags: ['#FiveFingersMariveles', '#MarivelesBataan'],
    },
  ],

  // Cebu (Cebu City, Moalboal, Oslob, Bantayan)
  cebu: [
    {
      id: 'transcentral_highway',
      name: 'Transcentral Highway (TCH Cebu)',
      province: 'Cebu',
      distanceKm: 12,
      travelTimeMins: 20,
      highlight: 'Premier motorcycle twisties, mountain cool breeze, cliffside cafe loops',
      scenicType: 'mountain',
      popularHashtags: ['#TCHCebu', '#TranscentralHighway', '#CebuRiders'],
    },
    {
      id: 'moalboal_panagsama',
      name: 'Moalboal Panagsama & Sardine Run',
      province: 'Cebu',
      distanceKm: 42,
      travelTimeMins: 50,
      highlight: 'World-famous sardine storm snorkel dive, beachfront cafes & chill bars',
      scenicType: 'beach',
      popularHashtags: ['#Moalboal', '#SardineRunCebu', '#MoalboalCoast'],
    },
    {
      id: 'oslob_coastal',
      name: 'Oslob Coastal Road & Whaleshark Coves',
      province: 'Cebu',
      distanceKm: 65,
      travelTimeMins: 75,
      highlight: 'Scenic southern coastal highway, turquoise waters and heritage church ruins',
      scenicType: 'viewpoint',
      popularHashtags: ['#OslobCebu', '#SouthCebuLoop'],
    },
  ],
};

/**
 * Detect nearby towns based on business location string (e.g. "San Felipe, Zambales" or "Porac, Pampanga")
 */
export function getNearbyTownsForLocation(locationStr: string): NearbyTown[] {
  const locLower = (locationStr || '').toLowerCase();

  if (locLower.includes('porac') || locLower.includes('pampanga') || locLower.includes('angeles') || locLower.includes('clark') || locLower.includes('fernando') || locLower.includes('arayat')) {
    return REGIONAL_TOWNS_DATABASE.pampanga;
  }
  if (locLower.includes('zambales') || locLower.includes('felipe') || locLower.includes('liwliwa') || locLower.includes('subic') || locLower.includes('iba') || locLower.includes('botolan')) {
    return REGIONAL_TOWNS_DATABASE.zambales;
  }
  if (locLower.includes('union') || locLower.includes('elyu') || locLower.includes('juan') || locLower.includes('bacnotan')) {
    return REGIONAL_TOWNS_DATABASE['la union'];
  }
  if (locLower.includes('siargao') || locLower.includes('general luna') || locLower.includes('surigao') || locLower.includes('cloud 9')) {
    return REGIONAL_TOWNS_DATABASE.siargao;
  }
  if (locLower.includes('boracay') || locLower.includes('aklan') || locLower.includes('malay') || locLower.includes('caticlan')) {
    return REGIONAL_TOWNS_DATABASE.boracay;
  }
  if (locLower.includes('bataan') || locLower.includes('morong') || locLower.includes('bagac') || locLower.includes('mariveles')) {
    return REGIONAL_TOWNS_DATABASE.bataan;
  }
  if (locLower.includes('cebu') || locLower.includes('moalboal') || locLower.includes('mactan') || locLower.includes('oslob')) {
    return REGIONAL_TOWNS_DATABASE.cebu;
  }

  // Dynamic generator for any user custom town / province entered:
  const parts = locationStr.split(',').map(s => s.trim());
  const townName = parts[0] || 'Base Depot';
  const provinceName = parts[1] || 'Philippines';

  return [
    {
      id: 'local_center',
      name: `${townName} Town Center & Public Market`,
      province: provinceName,
      distanceKm: 2,
      travelTimeMins: 5,
      highlight: `Commercial heart of ${townName}, local food spots, and gas stations`,
      scenicType: 'town_center',
      popularHashtags: [`#${townName.replace(/\s+/g, '')}`, `#${provinceName.replace(/\s+/g, '')}Rentals`, '#RideoutLocal'],
    },
    {
      id: 'scenic_coastal',
      name: `${townName} Coastal Highway / Viewpoint`,
      province: provinceName,
      distanceKm: 7,
      travelTimeMins: 12,
      highlight: `Scenic open riding stretch with golden hour sunset views and seaside breeze`,
      scenicType: 'viewpoint',
      popularHashtags: [`#${townName.replace(/\s+/g, '')}Sunset`, '#MotorcycleTourPH'],
    },
    {
      id: 'mountain_pass',
      name: `${provinceName} Mountain Pass & Eco-Trail`,
      province: provinceName,
      distanceKm: 14,
      travelTimeMins: 22,
      highlight: `Elevated winding road overlooking panoramic countryside and lush valleys`,
      scenicType: 'mountain',
      popularHashtags: [`#Explore${provinceName.replace(/\s+/g, '')}`, '#DualSportPH'],
    },
    {
      id: 'waterfall_river',
      name: `${townName} River Park & Falls Jump-Off`,
      province: provinceName,
      distanceKm: 19,
      travelTimeMins: 28,
      highlight: `Refreshing swimming stop and picnic retreat popular among roadtrippers`,
      scenicType: 'waterfall',
      popularHashtags: [`#${townName.replace(/\s+/g, '')}Falls`, '#WeekendRideout'],
    },
    {
      id: 'heritage_square',
      name: `${provinceName} Heritage Landmark & Plaza`,
      province: provinceName,
      distanceKm: 25,
      travelTimeMins: 35,
      highlight: `Historical church, municipal plaza, and landmark photography stop`,
      scenicType: 'viewpoint',
      popularHashtags: [`#Visit${provinceName.replace(/\s+/g, '')}`, '#MotoTravelPH'],
    },
  ];
}
