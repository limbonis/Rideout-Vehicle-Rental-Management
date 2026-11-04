import { SocialChatThread } from '../types/socialInbox';

export const INITIAL_CHAT_THREADS: SocialChatThread[] = [
  {
    id: 'thread-msg-01',
    platform: 'messenger',
    customer: {
      id: 'cust-maria',
      name: 'Maria Santos',
      handle: 'm.me/maria.santos24',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      phone: '0917 832 9912',
      city: 'Quezon City, Metro Manila',
      isVerified: true,
    },
    inquiryTopic: 'Honda ADV 160 booking for 4-day Liwliwa weekend trip',
    inquiredBikeId: 'bike-adv-05',
    inquiredBikeName: 'Honda ADV 160 Urban Explorer',
    inquiredDays: 4,
    status: 'open',
    unreadCount: 1,
    tags: ['Liwliwa Trip', '4-Day Stay', 'Surfboard Rack'],
    lastMessageText: 'Hi RideOut Zambales! Do we qualify for the 10% duration discount if we rent for 4 days starting this Friday?',
    lastMessageTimestamp: '10:42 AM',
    messages: [
      {
        id: 'msg-1',
        sender: 'customer',
        text: 'Magandang araw po! We are a group of 3 coming to Liwliwa this Friday morning. Looking to rent the Honda ADV 160 for 4 days (Friday to Monday).',
        timestamp: '10:39 AM',
        isRead: true,
      },
      {
        id: 'msg-2',
        sender: 'customer',
        text: 'Do we qualify for the 10% duration discount if we rent for 4 days starting this Friday? Also can we add a surfboard carrier rack?',
        timestamp: '10:42 AM',
        isRead: false,
      }
    ]
  },
  {
    id: 'thread-wa-02',
    platform: 'whatsapp',
    customer: {
      id: 'cust-liam',
      name: 'Liam O’Connor',
      handle: 'wa.me/61412893211',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      phone: '+61 412 893 211',
      city: 'Sydney, Australia (Tourist in Zambales)',
      isVerified: true,
    },
    inquiryTopic: 'Yamaha NMAX 7-Day Coastal Explorer Tour & License Requirements',
    inquiredBikeId: 'bike-nmax-01',
    inquiredBikeName: 'Yamaha NMAX 155 ABS',
    inquiredDays: 7,
    status: 'quoted',
    unreadCount: 0,
    tags: ['Weekly Rental', 'Foreign DL', 'Coastal Loop'],
    lastMessageText: 'Awesome, thanks for the 20% weekly discount quote! Will book through the site now.',
    lastMessageTimestamp: 'Yesterday',
    messages: [
      {
        id: 'wa-1',
        sender: 'customer',
        text: 'G’day mate! Planning a 7-day coastal road trip around Zambales and Subic. Is an Australian motorcycle driver’s license accepted?',
        timestamp: 'Yesterday 3:15 PM',
        isRead: true,
      },
      {
        id: 'wa-2',
        sender: 'staff',
        staffName: 'Mark Ramos (Manager)',
        text: 'Hello Liam! Yes, foreign licenses with motorcycle endorsement are 100% valid in the Philippines for up to 90 days from arrival! For 7 days, our Weekly Smart Pricing tier gives you a full 20% discount on the NMAX 155 ABS.',
        timestamp: 'Yesterday 3:28 PM',
        isRead: true,
        suggestedOffer: {
          bikeModel: 'Yamaha NMAX 155 ABS',
          dailyRate: 900,
          totalDays: 7,
          smartDiscount: 1260,
          grandTotal: 5040
        }
      },
      {
        id: 'wa-3',
        sender: 'customer',
        text: 'Awesome, thanks for the 20% weekly discount quote! Will book through the site now.',
        timestamp: 'Yesterday 3:35 PM',
        isRead: true,
      }
    ]
  },
  {
    id: 'thread-ig-03',
    platform: 'instagram',
    customer: {
      id: 'cust-lea',
      name: 'Lea Danielle (@lea_wanders)',
      handle: 'instagram.com/lea_wanders',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      city: 'Makati City',
      isVerified: true,
    },
    inquiryTopic: 'Yamaha Aerox rental for Crystal Beach sunset content shoot',
    inquiredBikeId: 'bike-aerox-03',
    inquiredBikeName: 'Yamaha Aerox 155 VVA',
    inquiredDays: 3,
    status: 'open',
    unreadCount: 1,
    tags: ['Content Creator', 'Deposit Policy', 'Crystal Beach'],
    lastMessageText: 'Can I do the ID custody deposit with staff photo instead of cash? Also is today’s low occupancy promo active?',
    lastMessageTimestamp: '11:15 AM',
    messages: [
      {
        id: 'ig-1',
        sender: 'customer',
        text: 'Hey RideOut team! 🛵 Planning a sunset photoshoot along Crystal Beach and San Felipe coastal pines.',
        timestamp: '11:10 AM',
        isRead: true,
      },
      {
        id: 'ig-2',
        sender: 'customer',
        text: 'Can I do the ID custody deposit with staff photo instead of cash? Also is today’s low occupancy promo active?',
        timestamp: '11:15 AM',
        isRead: false,
      }
    ]
  },
  {
    id: 'thread-tt-04',
    platform: 'tiktok',
    customer: {
      id: 'cust-jake',
      name: 'Jake MotoVlogs (@zambales_riderz)',
      handle: 'tiktok.com/@zambales_riderz',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      city: 'Iba, Zambales',
      isVerified: false,
    },
    inquiryTopic: 'Honda CRF 300L Dual-Sport for Botolan Mountain Trail Vlogging',
    inquiredBikeId: 'bike-crf-02',
    inquiredBikeName: 'Honda CRF 300L Rally',
    inquiredDays: 2,
    status: 'reserved',
    unreadCount: 0,
    tags: ['TikTok Creator', 'Dual-Sport', 'Video Cashback'],
    lastMessageText: 'Copy that! I reserved on the portal. Excited for the Botolan river crossing ride!',
    lastMessageTimestamp: 'Oct 28',
    messages: [
      {
        id: 'tt-1',
        sender: 'customer',
        text: 'Bro, is the CRF 300L dual-sport available this Saturday? Planning to do a 4K TikTok reel of the Botolan trail.',
        timestamp: 'Oct 28 9:00 AM',
        isRead: true,
      },
      {
        id: 'tt-2',
        sender: 'staff',
        staffName: 'Arnel Bautista (Mechanic / Yard Handover)',
        text: 'Yes bro, fresh knobby tires and Showa suspension dialed in! Don’t forget we have the ₱200 Instant Cashback Reward for uploading your trip riding clips too!',
        timestamp: 'Oct 28 9:15 AM',
        isRead: true,
      },
      {
        id: 'tt-3',
        sender: 'customer',
        text: 'Copy that! I reserved on the portal. Excited for the Botolan river crossing ride!',
        timestamp: 'Oct 28 9:22 AM',
        isRead: true,
      }
    ]
  },
  {
    id: 'thread-wa-05',
    platform: 'whatsapp',
    customer: {
      id: 'cust-dave',
      name: 'Dave & Chloe',
      handle: 'wa.me/639175541120',
      avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      phone: '0917 554 1120',
      city: 'Clark Freeport Zone, Pampanga',
      isVerified: false,
    },
    inquiryTopic: 'Honda Click 125i budget friendly rental for 3 days',
    inquiredBikeId: 'bike-click-04',
    inquiredBikeName: 'Honda Click 125i Commuter',
    inquiredDays: 3,
    status: 'open',
    unreadCount: 1,
    tags: ['Weekend Couple', 'Budget Scooter', 'San Felipe HQ'],
    lastMessageText: 'Hi! Are helmets and phone mount included? Can we pickup at San Felipe HQ at 7:30 AM?',
    lastMessageTimestamp: '11:45 AM',
    messages: [
      {
        id: 'wa-501',
        sender: 'customer',
        text: 'Hi RideOut! We are driving from Clark to San Felipe this weekend. Looking to rent the Honda Click 125i for 3 days.',
        timestamp: '11:40 AM',
        isRead: true,
      },
      {
        id: 'wa-502',
        sender: 'customer',
        text: 'Are helmets and phone mount included? Can we pickup at San Felipe HQ at 7:30 AM?',
        timestamp: '11:45 AM',
        isRead: false,
      }
    ]
  },
  {
    id: 'thread-msg-06',
    platform: 'messenger',
    customer: {
      id: 'cust-kenneth',
      name: 'Kenneth Villanueva',
      handle: 'm.me/kenneth.v22',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      phone: '0928 991 3341',
      city: 'Baguio City',
      isVerified: false,
    },
    inquiryTopic: 'Fuel verification policy & deposit return question',
    inquiredBikeId: 'bike-nmax-01',
    inquiredBikeName: 'Yamaha NMAX 155 ABS',
    inquiredDays: 5,
    status: 'closed',
    unreadCount: 0,
    tags: ['Fuel Level Policy', 'Deposit Cleared', 'Completed'],
    lastMessageText: 'Deposit returned smoothly upon fuel check match! Salamat!',
    lastMessageTimestamp: 'Oct 27',
    messages: [
      {
        id: 'msg-601',
        sender: 'customer',
        text: 'Sir, for the fuel check during return, what if the station was closed?',
        timestamp: 'Oct 27 2:00 PM',
        isRead: true,
      },
      {
        id: 'msg-602',
        sender: 'staff',
        staffName: 'Kristine Joy (Front Desk)',
        text: 'Hi Kenneth! If there is a missing fuel bar compared to pickup, it calculates at exactly ₱100/bar right on the inspection screen and gets deducted from the deposit, or you can fill it up at the Shell station 200m down the road!',
        timestamp: 'Oct 27 2:05 PM',
        isRead: true,
      },
      {
        id: 'msg-603',
        sender: 'customer',
        text: 'Deposit returned smoothly upon fuel check match! Salamat!',
        timestamp: 'Oct 27 6:30 PM',
        isRead: true,
      }
    ]
  }
];
