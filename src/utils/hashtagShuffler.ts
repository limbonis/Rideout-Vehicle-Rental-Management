/**
 * Destination hashtag pools and 5-tag shuffler adhering to platform limits
 * Specifically targets San Antonio, San Narciso, San Felipe, and Cabangan travellers.
 */

export const DESTINATION_HASHTAG_BANKS: Record<string, string[]> = {
  'San Antonio': [
    '#SanAntonioZambales',
    '#PundaquitBeach',
    '#AnawanginCove',
    '#NagsasaCove',
    '#CamaraIsland',
    '#SanAntonioAdventures',
  ],
  'San Narciso': [
    '#SanNarcisoZambales',
    '#CrystalBeachResort',
    '#PineTreesBeach',
    '#SanNarcisoSurf',
    '#CrystalBeachZambales',
  ],
  'San Felipe': [
    '#SanFelipeZambales',
    '#Liwliwa',
    '#LiwliwaBeach',
    '#LiwliwaSurf',
    '#RideOutZambales',
    '#SanFelipeSunset',
  ],
  'Cabangan': [
    '#CabanganZambales',
    '#CabanganBeach',
    '#CabatuanRiver',
    '#CabanganHiddenGem',
    '#CabanganCoast',
  ],
  'General Moto Travel': [
    '#ZambalesRoadTrip',
    '#MotoRentalPH',
    '#ScooterLifePH',
    '#ExploreZambales',
    '#WeekendRideEscape',
    '#RideOutPH',
  ],
};

/**
 * Shuffles and picks exactly 5 hashtags tailored to the chosen destinations
 * (Platforms limit effective reach to 5 hashtags at a time).
 */
export function shuffleFiveHashtags(selectedTowns: string[] = ['San Antonio', 'San Narciso', 'San Felipe', 'Cabangan']): string[] {
  const towns = selectedTowns.length > 0 ? selectedTowns : Object.keys(DESTINATION_HASHTAG_BANKS);
  
  // Collect candidate tags from selected towns
  let pool: string[] = [];
  towns.forEach((town) => {
    if (DESTINATION_HASHTAG_BANKS[town]) {
      pool.push(...DESTINATION_HASHTAG_BANKS[town]);
    }
  });

  // Always include general Zambales travel tags
  pool.push(...DESTINATION_HASHTAG_BANKS['General Moto Travel']);

  // Remove duplicates
  pool = Array.from(new Set(pool));

  // Fisher-Yates shuffle
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Ensure '#RideOutZambales' is included if present, and pick exactly 5 tags
  const primaryBrand = '#RideOutZambales';
  const remaining = shuffled.filter(t => t !== primaryBrand);
  const picked = [primaryBrand, ...remaining.slice(0, 4)];

  return picked.slice(0, 5);
}

/**
 * Philippine Travel Social Media optimal posting windows
 */
export function getBestTimesToPost(): { currentDayBest: string; slots: { day: string; time: string; reason: string }[] } {
  const slots = [
    { day: 'Thursday', time: '7:00 PM – 9:00 PM', reason: 'Metro Manila weekend beach trip planning peak' },
    { day: 'Friday', time: '6:30 PM – 9:30 PM', reason: 'High Friday night road trip search volume' },
    { day: 'Saturday', time: '9:30 AM – 11:30 AM', reason: 'Active weekend riders checking feeds during stopovers' },
    { day: 'Sunday', time: '5:30 PM – 8:00 PM', reason: 'Golden hour sunset recaps & weekend photo dumps' },
    { day: 'Wednesday', time: '12:00 PM – 1:30 PM', reason: 'Mid-week vacation dreaming & early reservations' },
  ];

  const now = new Date();
  const dayName = now.toLocaleDateString('en-US', { weekday: 'long' });
  const matching = slots.find(s => s.day === dayName);

  return {
    currentDayBest: matching 
      ? `Today (${matching.day}) at ${matching.time} · ${matching.reason}` 
      : 'Thursday or Friday at 7:00 PM (Highest weekend road trip traffic)',
    slots,
  };
}
