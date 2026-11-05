export type OmnichannelPlatform = 'messenger' | 'whatsapp' | 'instagram' | 'tiktok' | 'viber' | 'telegram';

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'staff' | 'ai_assistant';
  staffName?: string;
  text: string;
  timestamp: string; // e.g. "10:24 AM" or ISO string
  isRead: boolean;
  suggestedOffer?: {
    bikeModel: string;
    dailyRate: number;
    totalDays: number;
    smartDiscount: number;
    grandTotal: number;
  };
}

export interface CustomerSocialProfile {
  id: string;
  name: string;
  handle: string; // e.g. "m.me/maria.santos" or "+63 917 832 9912" or "@surfer_kyle"
  avatarUrl: string;
  phone?: string;
  city?: string;
  isVerified?: boolean;
}

export interface SocialChatThread {
  id: string;
  platform: OmnichannelPlatform;
  customer: CustomerSocialProfile;
  inquiryTopic: string;
  inquiredBikeId?: string;
  inquiredBikeName?: string;
  inquiredDays?: number;
  status: 'open' | 'quoted' | 'reserved' | 'closed';
  lastMessageText: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  tags: string[];
  messages: ChatMessage[];
}

export interface AiPromptTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  actionType: 'quote' | 'deposit_policy' | 'route_recommendation' | 'license_check' | 'custom';
}
