import { OmnichannelPlatform, SocialChatThread } from '../types/socialInbox';
import { calculateSmartPriceDiscount, SmartPricingConfig } from '../types/smartPricing';
import { Motorbike } from '../types';

export interface AiReplyRequestOptions {
  thread: SocialChatThread;
  bike?: Motorbike;
  smartPricingConfig?: SmartPricingConfig;
  intent: 'quote' | 'deposit_policy' | 'route_recommendation' | 'license_check' | 'custom';
  customInstructions?: string;
  tone?: 'Warm & Hospitable' | 'Quick & Informative' | 'Surf & Adventure Vibe' | 'Strict Policy Clarification';
}

export interface AiReplyResponse {
  replyText: string;
  keyHighlights: string[];
  suggestedFollowUp?: string;
  isAiGenerated: boolean;
}

/**
 * Generates an AI-assisted smart response for social chat threads
 */
export async function generateSocialReply(options: AiReplyRequestOptions): Promise<AiReplyResponse> {
  const { thread, bike, smartPricingConfig, intent, customInstructions, tone = 'Warm & Hospitable' } = options;
  const platform = thread.platform;
  const customerName = thread.customer.name.split(' ')[0] || thread.customer.name;
  const rentalDays = thread.inquiredDays || 3;
  const dailyRate = bike?.dailyRate || 900;
  const bikeName = bike?.name || thread.inquiredBikeName || 'Yamaha NMAX 155 ABS';

  // Compute live smart pricing
  const pricingResult = calculateSmartPriceDiscount(dailyRate, rentalDays, smartPricingConfig);
  let smartPricingDetails = '';
  if (pricingResult.isSmartPricingActive) {
    const parts: string[] = [];
    if (pricingResult.utilizationPromoApplied) {
      parts.push(`${pricingResult.utilizationDiscountPercent}% off Low Depot Occupancy Flash Promo (-₱${pricingResult.utilizationDiscountAmount})`);
    }
    if (pricingResult.durationDiscountApplied && pricingResult.durationTierApplied) {
      parts.push(`${pricingResult.durationDiscountPercent}% off ${pricingResult.durationTierApplied.tierName} (-₱${pricingResult.durationDiscountAmount})`);
    }
    smartPricingDetails = `${parts.join(' + ')} | Total Savings: ₱${pricingResult.totalSmartDiscountAmount} | Discounted Total: ₱${pricingResult.discountedRentalSubtotal}`;
  }

  // Attempt server API call with Gemini
  try {
    const response = await fetch('/api/inbox/ai-reply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        platform,
        customerName: thread.customer.name,
        inquiryTopic: thread.inquiryTopic,
        bikeModel: bikeName,
        dailyRate,
        rentalDays,
        smartPricingDetails,
        tone,
        intentPrompt: customInstructions || getIntentPrompt(intent, bikeName, rentalDays, pricingResult),
        conversationHistory: thread.messages,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.fallback && data.replyText) {
        return {
          replyText: data.replyText,
          keyHighlights: data.keyHighlights || ['Gemini 3.8 Flash Assisted Response'],
          suggestedFollowUp: data.suggestedFollowUp,
          isAiGenerated: true,
        };
      }
    }
  } catch (err) {
    console.warn('Backend Gemini AI response fallback used:', err);
  }

  // Curated High-Context Client-Side Generator
  return generateClientContextualReply(options, pricingResult);
}

function getIntentPrompt(
  intent: string, 
  bikeName: string, 
  days: number, 
  pricing: ReturnType<typeof calculateSmartPriceDiscount>
): string {
  switch (intent) {
    case 'quote':
      return `Provide an exact quote for ${days} days with ${bikeName}. Base rate is ₱${pricing.baseRentalSubtotal}. With smart pricing discount of ₱${pricing.totalSmartDiscountAmount}, total is ₱${pricing.discountedRentalSubtotal}.`;
    case 'deposit_policy':
      return `Explain our two deposit options clearly: either ₱2,000 cash/GCash or leaving a physical valid ID held by depot staff in a handover custody photo.`;
    case 'route_recommendation':
      return `Highlight best riding spots in Zambales: Liwliwa surf spot, San Felipe coastal loop, Crystal Beach, and Botolan river trails.`;
    case 'license_check':
      return `Explain license requirements: Philippine Driver's License Code A or A1, or valid foreign motorcycle license with 90-day tourist privilege.`;
    default:
      return 'Respond warmly and helpfully to the customer inquiry.';
  }
}

function generateClientContextualReply(
  options: AiReplyRequestOptions,
  pricing: ReturnType<typeof calculateSmartPriceDiscount>
): AiReplyResponse {
  const { thread, bike, intent, customInstructions, tone } = options;
  const platform = thread.platform;
  const customerFirst = thread.customer.name.split(' ')[0] || thread.customer.name;
  const bikeName = bike?.name || thread.inquiredBikeName || 'Yamaha NMAX 155 ABS';
  const rentalDays = thread.inquiredDays || 3;

  if (customInstructions && customInstructions.trim()) {
    return {
      replyText: `Hi ${customerFirst}! 👋 ${customInstructions.trim()}\n\nLet us know if you would like us to reserve the ${bikeName} for you today! — RideOut Zambales Depot Team`,
      keyHighlights: ['Custom Staff Prompt Applied', 'Direct Dispatch'],
      suggestedFollowUp: 'Send reservation link if they confirm.',
      isAiGenerated: true,
    };
  }

  if (intent === 'quote') {
    if (platform === 'whatsapp') {
      return {
        replyText: `Hello *${customerFirst}*! 🛵 Here is your customized RideOut Zambales rental quotation:\n\n` +
          `🏍️ *Vehicle:* ${bikeName}\n` +
          `📅 *Duration:* ${rentalDays} Days (${pricing.totalDays * 24} Hours)\n` +
          `💵 *Standard Daily Rate:* ₱${pricing.baseRatePerDay}/day (Subtotal: ₱${pricing.baseRentalSubtotal})\n` +
          (pricing.isSmartPricingActive 
            ? `⚡ *Smart Dynamic Savings:* -₱${pricing.totalSmartDiscountAmount} (${pricing.explanationBadges.map(b => b.title).join(' + ')})\n` +
              `✅ *Discounted Rental Subtotal:* ₱${pricing.discountedRentalSubtotal}\n`
            : `✅ *Rental Subtotal:* ₱${pricing.discountedRentalSubtotal}\n`) +
          `🛡️ *Deposit:* ₱2,000 refundable OR valid physical ID held by depot staff in custody photo\n` +
          `🎁 *Bonus:* ₱200 Instant Cashback Reward available if you submit 3 short riding video clips!\n\n` +
          `Would you like me to hold this unit at our San Felipe HQ depot for your dates?`,
        keyHighlights: ['Full Smart Price Breakdown', 'WhatsApp Formatted', 'ID Deposit Option Included'],
        suggestedFollowUp: 'Provide GCash reservation QR if customer agrees',
        isAiGenerated: true,
      };
    }

    if (platform === 'messenger') {
      return {
        replyText: `Hi ${customerFirst}! 😊 Good day from RideOut Zambales!\n\n` +
          `For the ${bikeName} over ${rentalDays} days, here is your breakdown:\n` +
          `• Daily Rate: ₱${pricing.baseRatePerDay}/day\n` +
          (pricing.isSmartPricingActive
            ? `• Smart Pricing Applied: -₱${pricing.totalSmartDiscountAmount} savings (${pricing.explanationBadges[0]?.title || 'Promo discount'})\n` +
              `• Special Subtotal: ₱${pricing.discountedRentalSubtotal} (Saved ₱${pricing.totalSmartDiscountAmount}!)\n`
            : `• Subtotal: ₱${pricing.discountedRentalSubtotal}\n`) +
          `• Inclusions: 2 sanitized DOT helmets, phone mount & USB charger, free raincoats\n` +
          `• Deposit: Either ₱2,000 refundable cash/GCash OR physical government ID held by depot staff.\n\n` +
          `Pickup is at our San Felipe HQ (Near Public Market). Should we confirm this slot for you? 🌊`,
        keyHighlights: ['Messenger Layout', 'Inclusions Highlighted', 'Smart Savings Displayed'],
        suggestedFollowUp: 'Offer surfboard carrier if going to Liwliwa',
        isAiGenerated: true,
      };
    }

    // Instagram / TikTok
    return {
      replyText: `Hey @${customerFirst}! 🌊 Yes, the ${bikeName} is ready for you for ${rentalDays} days! With our active Smart Dynamic Pricing, you get it for only ₱${pricing.discountedRentalSubtotal} (saved ₱${pricing.totalSmartDiscountAmount})! Includes 2 clean helmets + phone mount. Tap our link in bio or DM us your pickup time to lock it in! 🛵⚡`,
      keyHighlights: ['Punchy Social DM', 'Savings Highlighted', 'Call to Action'],
      suggestedFollowUp: 'Ask for pickup time and helmet size',
      isAiGenerated: true,
    };
  }

  if (intent === 'deposit_policy') {
    return {
      replyText: `Hi ${customerFirst}! Regarding security deposits, RideOut Zambales offers two very convenient options:\n\n` +
        `1️⃣ *Physical ID Custody Option (No Cash Out):* Leave 1 government-issued ID (Driver's License, Passport, UMID, National ID). Our depot staff will take a transparent photo holding your ID alongside you for digital custody verification.\n\n` +
        `2️⃣ *Standard Refundable Deposit:* ₱2,000 via GCash or Counter Cash, returned immediately upon bike return and fuel gauge check (matching pickup bars).\n\n` +
        `Both options are fast and safe! Which one would you prefer for your booking?`,
      keyHighlights: ['Physical ID Deposit Explained', 'Transparent Staff Holding Photo', 'Fuel Check Note'],
      suggestedFollowUp: 'Confirm ID type the customer will bring',
      isAiGenerated: true,
    };
  }

  if (intent === 'license_check') {
    return {
      replyText: `Hello ${customerFirst}! 🛵 To rent a motorbike in the Philippines, here is what is required:\n\n` +
        `🇵🇭 *Philippine Drivers:* Must have a valid LTO Driver's License with Restriction Code A or A1 (motorcycle).\n` +
        `🌏 *Foreign Tourists:* You can legally drive using your valid foreign motorcycle license for up to 90 days from arrival in the Philippines!\n\n` +
        `Simply upload or show your license during pickup inspection at our San Felipe depot!`,
      keyHighlights: ['LTO Code A/A1 Clarified', 'Foreign 90-Day Rule Stated'],
      suggestedFollowUp: 'Ask customer if their license has restriction code A or A1',
      isAiGenerated: true,
    };
  }

  // route_recommendation
  return {
    replyText: `Hey ${customerFirst}! 🌴 Here are our favorite scenic routes around San Felipe & Zambales:\n\n` +
      `🏄 *Liwliwa Surf Strip (5 mins from HQ):* Beach cafes, sunset acoustic bars, and surf breaks.\n` +
      `🌲 *San Felipe Pine Grove & Crystal Beach (8 mins):* Coastal roads shaded by agoho pine trees.\n` +
      `⛰️ *Botolan Mountain River Crossing (25 mins):* Scenic bridges and mountain backdrops.\n` +
      `🌊 *Capones Island Jump-off in San Antonio (25 mins south):* Scenic coastal loop with sea views!\n\n` +
      `Our bikes also sync with our app GPS Radar so you will get proximity highlights whenever you ride near these spots!`,
    keyHighlights: ['Top Zambales Destinations', 'GPS Proximity Tag Synergy'],
    suggestedFollowUp: 'Suggest surf rack add-on if heading to Liwliwa',
    isAiGenerated: true,
  };
}

/**
 * Generates direct external chat URLs
 */
export function getWhatsAppDirectUrl(phone: string, text: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

export function getMessengerDirectUrl(handle: string): string {
  const clean = handle.replace(/^m\.me\//, '').replace(/^https?:\/\/m\.me\//, '');
  return `https://m.me/${clean}`;
}

export function getInstagramDirectUrl(handle: string): string {
  const clean = handle.replace(/^@/, '').replace(/^https?:\/\/instagram\.com\//, '');
  return `https://instagram.com/${clean}`;
}

export function getTikTokDirectUrl(handle: string): string {
  const clean = handle.replace(/^@/, '').replace(/^https?:\/\/tiktok\.com\/@?/, '');
  return `https://www.tiktok.com/@${clean}`;
}
