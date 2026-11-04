import { SocialPlatform } from '../types';

interface GeneratePostParams {
  platform: SocialPlatform;
  topic: string;
  tone: string;
  bikeModel?: string;
  keywords?: string;
  destinations?: string[];
  businessName?: string;
}

export interface GeneratedPostResponse {
  title: string;
  hook: string;
  caption: string;
  callToAction: string;
  hashtags: string[];
}

/**
 * Request server-side Gemini generation via /api/social/generate.
 * No Gemini SDK or API key is exposed in the browser.
 */
export async function generateSocialContent(params: GeneratePostParams): Promise<GeneratedPostResponse> {
  try {
    const res = await fetch('/api/social/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      const data = await res.json();
      if (!data.fallback && data.title && data.caption) {
        return {
          title: data.title,
          hook: data.hook || 'Ready for your next coastal escape on two wheels?',
          caption: data.caption,
          callToAction: data.callToAction || 'Book your bike today at RideOut Zambales!',
          hashtags: Array.isArray(data.hashtags) ? data.hashtags : ['#RideOutZambales', '#MotoRentalPH'],
        };
      }
    }
  } catch (err) {
    console.warn('Server Gemini call failed or offline, using high-converting curated template:', err);
  }

  // Fallback to built-in curated templates if server is offline or key not yet injected
  return generateCuratedTemplate(params);
}

/**
 * Stream social media content from server-side SSE endpoint
 */
export async function* streamSocialContent(params: GeneratePostParams): AsyncGenerator<string, void, unknown> {
  try {
    const response = await fetch('/api/social/generate-stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok || !response.body) {
      yield (generateCuratedTemplate(params)).caption;
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('data: ')) {
          const dataStr = trimmed.replace('data: ', '');
          if (dataStr === '[DONE]') return;
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.text) {
              yield parsed.text;
            }
          } catch {
            // ignore non-json chunk
          }
        }
      }
    }
  } catch (err) {
    console.warn('Streaming failed, returning full caption fallback', err);
    yield (generateCuratedTemplate(params)).caption;
  }
}

function generateCuratedTemplate(params: GeneratePostParams): GeneratedPostResponse {
  const { platform, topic, tone, bikeModel } = params;
  const bike = bikeModel || 'Yamaha NMAX 155 / Honda CRF';

  if (topic.includes('promo') || topic.includes('discount')) {
    return {
      title: 'Weekend Zambales Ride Special 🌊🏍️',
      hook: `Planning your coastal getaway this weekend? Use promo code RIDEOUT15 for 15% OFF your ${bike}!`,
      caption: `Beat the city heat and cruise the open roads of Zambales!\n\nWhether you're hitting the surf in Liwliwa, exploring the pine groves of San Narciso, or carving coastal curves towards Botolan, RideOut Zambales has your dream machine ready.\n\n✨ Included with every rental:\n- Sanitized DOT helmets\n- Pre-ride 360° inspection transparency\n- 24/7 Zambales highway roadside hotline\n\n⚡ Validated DL Code A/A1 required. Reserve in 2 minutes online!`,
      callToAction: `Tap the link in our bio or enter promo code RIDEOUT15 at checkout!`,
      hashtags: ['#RideOutZambales', '#ZambalesRoadTrip', '#LiwliwaSurf', '#MotoRentalPH', '#WeekendEscape', '#PhilippinesRiders', '#ScooterRental']
    };
  }

  if (topic.includes('scenic') || topic.includes('route')) {
    return {
      title: 'Zambales Coastal Highway: Route Guide 🌅',
      hook: '3 unforgettable stops to make on the Zambales coastal loop:',
      caption: `Save this for your next road trip!\n\n1. 🌴 San Felipe Seawall - perfect for morning sea breeze and fresh buko juice.\n2. 🏄 Liwliwa Beach Strip - cruise slow, grab artisan coffee, and catch sunset vibes.\n3. ⛰️ Botolan Mountain Lookout - where the lahar landscapes meet green mountain ranges.\n\nOur fleet of ${bike} bikes is meticulously serviced and road-ready for any adventure.`,
      callToAction: 'Book your ride directly at RideOut Zambales with instant Facebook login & 11-digit mobile verification!',
      hashtags: ['#ZambalesCoast', '#PhilippineTravel', '#MotorcycleTouring', '#RideOutZambales', '#ExploreZambales', '#MotovlogPH']
    };
  }

  if (topic.includes('safety') || topic.includes('tips')) {
    return {
      title: '5 Golden Rules for Coastal Motorcycle Touring 🛡️',
      hook: 'Safety is horsepower you can trust. Before you throttle out, remember:',
      caption: `1. Always buckle an ICC/DOT-certified helmet (mandatory under RA 10054).\n2. Mind afternoon coastal crosswinds when passing open bridges.\n3. Maintain safe following distance behind provincial buses and tricycles.\n4. Ensure you hold DL Code A or A1 for motorcycle authorization.\n5. Complete your 360° digital pickup inspection before departure!\n\nHave questions or need emergency assistance while on the road? Our mobile support team is one call away.`,
      callToAction: 'Ride safe, ride prepared. Book your rental with RideOut Zambales.',
      hashtags: ['#RiderSafety', '#MotoSafetyPH', '#RideOutZambales', '#ResponsibleRiding', '#RoadSafety']
    };
  }

  // Default: Fleet Spotlight
  return {
    title: `Fleet Spotlight: ${bike} 🔥`,
    hook: `Meet the ultimate explorer for your Zambales adventures: the ${bike}!`,
    caption: `Engineered for comfort, agility, and performance. Whether tackling beach town traffic or sweeping coastal turns, this bike delivers smooth acceleration and unmatched fuel economy.\n\n⚡ Highlights:\n- Modern reliable engine & electronic fuel injection\n- Large underseat storage for your beach essentials\n- Included shock-absorbing smartphone holder\n\nShowroom condition, freshly detailed, and ready for you at our San Felipe depot.`,
    callToAction: 'Check live calendar availability and reserve your dates now!',
    hashtags: ['#RideOutZambales', '#MotorbikeRental', '#FleetSpotlight', '#TwoWheelsOneLove', '#ZambalesAdventure']
  };
}
