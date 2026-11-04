/**
 * Payment confirmation helpers for GCash, Bank Transfer (InstaPay/PESONet),
 * and Third-Party GCash payments.
 */

export interface SamplePaymentSlip {
  id: string;
  type: 'gcash-screenshot' | 'bank-transfer' | 'third-party-gcash';
  title: string;
  senderLabel: string;
  sourceType: string;
  refNumber: string;
  imageUrl: string;
  amount: number;
}

export function generatePaymentSlipSvg(params: {
  type: 'gcash-screenshot' | 'bank-transfer' | 'third-party-gcash';
  senderName: string;
  senderPhoneOrBank: string;
  recipientName: string;
  recipientPhone: string;
  amount: number;
  refNumber: string;
  dateStr?: string;
}): string {
  const dateStr = params.dateStr || new Date().toLocaleString('en-PH', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const isBank = params.type === 'bank-transfer';
  const is3rdParty = params.type === 'third-party-gcash';

  const headerColor = isBank ? '#8A1538' : '#005CE6'; // BPI Red or GCash Blue
  const appTitle = isBank ? 'BPI to GCash (InstaPay)' : (is3rdParty ? 'GCash (Partner Transfer)' : 'GCash Express Send');
  const badgeText = isBank ? 'InstaPay Transfer Success' : 'Payment Sent Successfully';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 520" width="100%" height="100%">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#18181b" />
        <stop offset="100%" stop-color="#09090b" />
      </linearGradient>
      <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${headerColor}" />
        <stop offset="100%" stop-color="${isBank ? '#5B0C23' : '#003E99'}" />
      </linearGradient>
    </defs>
    
    <!-- Background Card -->
    <rect width="400" height="520" rx="20" fill="url(#bgGrad)" stroke="#27272a" stroke-width="2"/>
    
    <!-- Top App Banner -->
    <path d="M 0 20 Q 0 0 20 0 L 380 0 Q 400 0 400 20 L 400 90 L 0 90 Z" fill="url(#headerGrad)"/>
    <circle cx="45" cy="45" r="20" fill="#ffffff" opacity="0.2"/>
    <text x="45" y="52" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="20" font-weight="900" fill="#ffffff" text-anchor="middle">${isBank ? '🏦' : 'G'}</text>
    <text x="80" y="42" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">${appTitle}</text>
    <text x="80" y="60" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#e0e7ff">${badgeText}</text>
    
    <!-- Checkmark Circle -->
    <circle cx="200" cy="130" r="32" fill="#10b981" opacity="0.15"/>
    <circle cx="200" cy="130" r="24" fill="#10b981"/>
    <path d="M192 130 L198 136 L209 123" stroke="#ffffff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    
    <!-- Amount Sent -->
    <text x="200" y="185" font-family="-apple-system, BlinkMacSystemFont, monospace" font-size="28" font-weight="800" fill="#ffffff" text-anchor="middle">₱${params.amount.toLocaleString()}.00</text>
    <text x="200" y="206" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#a1a1aa" text-anchor="middle">Deposit Transfer Confirmed</text>
    
    <!-- Dividing Receipt Line -->
    <line x1="30" y1="225" x2="370" y2="225" stroke="#3f3f46" stroke-dasharray="6,6" stroke-width="1.5"/>
    
    <!-- Details List -->
    <g transform="translate(36, 250)">
      <!-- Sent To -->
      <text x="0" y="0" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#71717a">RECIPIENT (DEPOT)</text>
      <text x="0" y="18" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="bold" fill="#f4f4f5">${params.recipientName}</text>
      <text x="0" y="34" font-family="-apple-system, BlinkMacSystemFont, monospace" font-size="11" fill="#fbbf24">${params.recipientPhone}</text>
      
      <!-- Sender Source -->
      <text x="0" y="65" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#71717a">PAID VIA / SENDER</text>
      <text x="0" y="83" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="13" font-weight="bold" fill="#60a5fa">${params.senderName}</text>
      <text x="0" y="99" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#a1a1aa">${params.senderPhoneOrBank}</text>
      
      <!-- Ref Number -->
      <text x="0" y="130" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#71717a">CONFIRMATION REF / TRACE NO.</text>
      <text x="0" y="148" font-family="-apple-system, BlinkMacSystemFont, monospace" font-size="13" font-weight="bold" fill="#34d399">${params.refNumber}</text>
      
      <!-- Date -->
      <text x="0" y="178" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" fill="#71717a">TIMESTAMP</text>
      <text x="0" y="196" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="12" fill="#d4d4d8">${dateStr}</text>
    </g>
    
    <!-- Bottom Verified Bar -->
    <rect x="30" y="468" width="340" height="36" rx="8" fill="#18181b" stroke="#27272a"/>
    <text x="200" y="490" font-family="-apple-system, BlinkMacSystemFont, sans-serif" font-size="11" font-weight="bold" fill="#10b981" text-anchor="middle">✓ Valid Transfer Confirmation Attached</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SAMPLE_PAYMENT_CONFIRMATIONS: SamplePaymentSlip[] = [
  {
    id: 'slip-gcash-own',
    type: 'gcash-screenshot',
    title: 'Personal GCash Screenshot',
    senderLabel: 'Juan Dela Cruz (0917 882 9911)',
    sourceType: 'GCash Personal Account',
    refNumber: '9021 8492 1029',
    amount: 1000,
    imageUrl: generatePaymentSlipSvg({
      type: 'gcash-screenshot',
      senderName: 'Juan Dela Cruz',
      senderPhoneOrBank: 'GCash No: 0917 882 9911',
      recipientName: 'RIDE OUT MOTORBIKE RENTALS',
      recipientPhone: 'GCash: 0917 832 9912',
      amount: 1000,
      refNumber: '9021 8492 1029',
    }),
  },
  {
    id: 'slip-bank-transfer',
    type: 'bank-transfer',
    title: 'BPI to GCash (InstaPay)',
    senderLabel: 'BPI InstaPay / Juan Dela Cruz (Acct **4812)',
    sourceType: 'BPI Online Banking InstaPay',
    refNumber: 'BPI-IP-994182910',
    amount: 1000,
    imageUrl: generatePaymentSlipSvg({
      type: 'bank-transfer',
      senderName: 'BPI Online InstaPay Transfer',
      senderPhoneOrBank: 'Account: Juan Dela Cruz (•••• 4812)',
      recipientName: 'RIDE OUT MOTORBIKE RENTALS',
      recipientPhone: 'GCash: 0917 832 9912',
      amount: 1000,
      refNumber: 'BPI-IP-994182910',
    }),
  },
  {
    id: 'slip-partner-gcash',
    type: 'third-party-gcash',
    title: "Partner's GCash Transfer",
    senderLabel: 'Maria Dela Cruz (Partner / 0998 123 4567)',
    sourceType: "Third-Party GCash (Friend/Family)",
    refNumber: '8019 3321 0041',
    amount: 1000,
    imageUrl: generatePaymentSlipSvg({
      type: 'third-party-gcash',
      senderName: 'Maria Dela Cruz (Partner/Friend)',
      senderPhoneOrBank: 'GCash No: 0998 123 4567',
      recipientName: 'RIDE OUT MOTORBIKE RENTALS',
      recipientPhone: 'GCash: 0917 832 9912',
      amount: 1000,
      refNumber: '8019 3321 0041',
    }),
  },
];
