export interface SmartPricingDurationTier {
  id: string;
  minDays: number;
  discountPercent: number;
  tierName: string;
}

export interface SmartPricingConfig {
  isEnabled: boolean; // Master switch for smart dynamic pricing
  
  // 1. Utilization-Based Pricing (Occupancy on the day)
  utilizationDiscountEnabled: boolean;
  utilizationThresholdPercent: number; // e.g. 50 (if depot booked units <= 50%, trigger promo)
  utilizationDiscountPercent: number; // e.g. 15 (15% off daily rate)
  simulatedOccupancyPercent: number; // Manager simulation or live computed depot occupancy (default: 25%)

  // 2. Duration-Based Pricing (Rental length in days)
  durationDiscountEnabled: boolean;
  durationTiers: SmartPricingDurationTier[];

  // Discount stacking policy
  stackDiscounts: boolean; // if true, duration discount + utilization discount stack; if false, highest applies
}

export interface SmartPricingCalculationResult {
  isSmartPricingActive: boolean;
  baseRatePerDay: number;
  totalDays: number;
  baseRentalSubtotal: number;
  
  // Utilization calculation
  utilizationPromoApplied: boolean;
  utilizationOccupancyPercent: number;
  utilizationDiscountPercent: number;
  utilizationDiscountAmount: number;
  
  // Duration calculation
  durationDiscountApplied: boolean;
  durationTierApplied?: SmartPricingDurationTier;
  durationDiscountPercent: number;
  durationDiscountAmount: number;
  
  // Combined Totals
  totalSmartDiscountAmount: number;
  effectiveDailyRate: number;
  discountedRentalSubtotal: number;
  
  // Visual breakdown badges for UI
  explanationBadges: Array<{
    type: 'utilization' | 'duration';
    title: string;
    subtitle: string;
    savings: number;
  }>;
}

export const DEFAULT_SMART_PRICING_CONFIG: SmartPricingConfig = {
  isEnabled: true,
  utilizationDiscountEnabled: true,
  utilizationThresholdPercent: 40, // Trigger if depot utilization is 40% or lower
  utilizationDiscountPercent: 15, // 15% discount for low-occupancy days
  simulatedOccupancyPercent: 25, // Current simulated depot fleet utilization today
  durationDiscountEnabled: true,
  durationTiers: [
    { id: 'tier-3days', minDays: 3, discountPercent: 10, tierName: 'Weekend Getaway (3+ Days)' },
    { id: 'tier-7days', minDays: 7, discountPercent: 20, tierName: 'Zambales Explorer (7+ Days / Weekly)' },
    { id: 'tier-14days', minDays: 14, discountPercent: 25, tierName: 'Extended Coastal Stay (14+ Days)' },
  ],
  stackDiscounts: true,
};

/**
 * Calculates dynamic smart pricing discounts given rental duration, base rate, and business configuration
 */
export function calculateSmartPriceDiscount(
  baseDailyRate: number,
  totalDays: number,
  config?: SmartPricingConfig,
  currentOccupancyOverride?: number
): SmartPricingCalculationResult {
  const activeConfig = config || DEFAULT_SMART_PRICING_CONFIG;
  const baseRentalSubtotal = Math.max(0, baseDailyRate * Math.max(1, totalDays));

  if (!activeConfig.isEnabled) {
    return {
      isSmartPricingActive: false,
      baseRatePerDay: baseDailyRate,
      totalDays,
      baseRentalSubtotal,
      utilizationPromoApplied: false,
      utilizationOccupancyPercent: 0,
      utilizationDiscountPercent: 0,
      utilizationDiscountAmount: 0,
      durationDiscountApplied: false,
      durationDiscountPercent: 0,
      durationDiscountAmount: 0,
      totalSmartDiscountAmount: 0,
      effectiveDailyRate: baseDailyRate,
      discountedRentalSubtotal: baseRentalSubtotal,
      explanationBadges: []
    };
  }

  const occupancy = currentOccupancyOverride !== undefined 
    ? currentOccupancyOverride 
    : (activeConfig.simulatedOccupancyPercent ?? 25);

  let utilizationPromoApplied = false;
  let utilizationDiscountPercent = 0;
  let utilizationDiscountAmount = 0;

  if (activeConfig.utilizationDiscountEnabled && occupancy <= activeConfig.utilizationThresholdPercent) {
    utilizationPromoApplied = true;
    utilizationDiscountPercent = activeConfig.utilizationDiscountPercent;
    utilizationDiscountAmount = Math.round((baseRentalSubtotal * utilizationDiscountPercent) / 100);
  }

  let durationDiscountApplied = false;
  let durationTierApplied: SmartPricingDurationTier | undefined = undefined;
  let durationDiscountPercent = 0;
  let durationDiscountAmount = 0;

  if (activeConfig.durationDiscountEnabled && activeConfig.durationTiers?.length > 0) {
    // Sort tiers descending by minDays to find highest eligible tier
    const sortedTiers = [...activeConfig.durationTiers].sort((a, b) => b.minDays - a.minDays);
    const matched = sortedTiers.find(tier => totalDays >= tier.minDays);
    if (matched) {
      durationDiscountApplied = true;
      durationTierApplied = matched;
      durationDiscountPercent = matched.discountPercent;
      durationDiscountAmount = Math.round((baseRentalSubtotal * durationDiscountPercent) / 100);
    }
  }

  let totalSmartDiscountAmount = 0;
  if (activeConfig.stackDiscounts) {
    totalSmartDiscountAmount = Math.min(baseRentalSubtotal, utilizationDiscountAmount + durationDiscountAmount);
  } else {
    // Highest single discount
    if (utilizationDiscountAmount >= durationDiscountAmount) {
      totalSmartDiscountAmount = utilizationDiscountAmount;
      durationDiscountApplied = false;
      durationDiscountPercent = 0;
      durationDiscountAmount = 0;
    } else {
      totalSmartDiscountAmount = durationDiscountAmount;
      utilizationPromoApplied = false;
      utilizationDiscountPercent = 0;
      utilizationDiscountAmount = 0;
    }
  }

  const discountedRentalSubtotal = Math.max(0, baseRentalSubtotal - totalSmartDiscountAmount);
  const effectiveDailyRate = totalDays > 0 ? Math.round(discountedRentalSubtotal / totalDays) : baseDailyRate;

  const explanationBadges: Array<{
    type: 'utilization' | 'duration';
    title: string;
    subtitle: string;
    savings: number;
  }> = [];

  if (utilizationPromoApplied && utilizationDiscountAmount > 0) {
    explanationBadges.push({
      type: 'utilization',
      title: `⚡ Low Depot Utilization Flash Promo (-${utilizationDiscountPercent}%)`,
      subtitle: `Depot fleet is ${occupancy}% booked today (threshold ≤${activeConfig.utilizationThresholdPercent}%). Extra savings automatically triggered!`,
      savings: utilizationDiscountAmount,
    });
  }

  if (durationDiscountApplied && durationDiscountAmount > 0 && durationTierApplied) {
    explanationBadges.push({
      type: 'duration',
      title: `🌟 ${durationTierApplied.tierName} (-${durationDiscountPercent}%)`,
      subtitle: `Eligible for booking ${totalDays} days (min requirement: ${durationTierApplied.minDays} days).`,
      savings: durationDiscountAmount,
    });
  }

  return {
    isSmartPricingActive: (utilizationPromoApplied || durationDiscountApplied),
    baseRatePerDay: baseDailyRate,
    totalDays,
    baseRentalSubtotal,
    utilizationPromoApplied,
    utilizationOccupancyPercent: occupancy,
    utilizationDiscountPercent,
    utilizationDiscountAmount,
    durationDiscountApplied,
    durationTierApplied,
    durationDiscountPercent,
    durationDiscountAmount,
    totalSmartDiscountAmount,
    effectiveDailyRate,
    discountedRentalSubtotal,
    explanationBadges
  };
}
