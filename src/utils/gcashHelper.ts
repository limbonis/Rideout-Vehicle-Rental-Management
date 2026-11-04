/**
 * GCash Payment Helper & Deep Linking Utilities
 * Provides deep linking to the GCash mobile app, custom QR rendering, and account details.
 */

import { GCashPaymentConfig } from '../types';

export const DEFAULT_RIDEOUT_GCASH: GCashPaymentConfig = {
  accountName: 'RIDEOUT ZAMBALES / MARK R.',
  accountNumber: '0917 832 9900',
  qrCodeUrl: '', // Will fallback to dynamic SVG QR
  depositAmount: 1000,
  instructions: 'Scan via GCash or send to our verified mobile number. Include your Booking Ref in the message note.'
};

/**
 * Generate a crisp, realistic GCash Merchant QR Code SVG data URI.
 * Renders the familiar GCash blue header, Instapay/QRPh badge, scanning frame, and account info.
 */
export function generateGCashQRSvg(config: {
  accountName: string;
  accountNumber: string;
  amount?: number;
}): string {
  const { accountName, accountNumber, amount } = config;
  const formattedAmount = amount ? `₱${amount.toLocaleString()}` : 'ENTER AMOUNT';

  // SVG representation of a clean QR Code with GCash branding
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 340 460" width="340" height="460">
    <defs>
      <linearGradient id="gcashGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#005CE6" />
        <stop offset="100%" stop-color="#003D99" />
      </linearGradient>
      <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.3"/>
      </filter>
    </defs>
    
    <!-- Outer Card Background -->
    <rect width="340" height="460" rx="20" fill="#ffffff" filter="url(#cardShadow)"/>
    
    <!-- Top GCash Header -->
    <path d="M0,20 Q0,0 20,0 L320,0 Q340,0 340,20 L340,82 L0,82 Z" fill="url(#gcashGrad)" />
    
    <!-- GCash Logo Mock -->
    <circle cx="42" cy="41" r="22" fill="#ffffff"/>
    <text x="42" y="49" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="900" fill="#005CE6" text-anchor="middle">G</text>
    <text x="76" y="47" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="22" font-weight="800" fill="#ffffff" letter-spacing="-0.5">GCash</text>
    <text x="76" y="62" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="600" fill="#99C2FF" letter-spacing="1">SCAN TO PAY · QRPH</text>

    <!-- Merchant Tag -->
    <rect x="225" y="25" width="95" height="32" rx="16" fill="#002966" />
    <text x="272" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" font-weight="700" fill="#00E676" text-anchor="middle">VERIFIED</text>

    <!-- QR Container Box -->
    <rect x="30" y="100" width="280" height="280" rx="14" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2"/>

    <!-- Corner Scanning Target Brackets -->
    <path d="M46,134 L46,116 L64,116" fill="none" stroke="#005CE6" stroke-width="4" stroke-linecap="round"/>
    <path d="M294,134 L294,116 L276,116" fill="none" stroke="#005CE6" stroke-width="4" stroke-linecap="round"/>
    <path d="M46,346 L46,364 L64,364" fill="none" stroke="#005CE6" stroke-width="4" stroke-linecap="round"/>
    <path d="M294,346 L294,364 L276,364" fill="none" stroke="#005CE6" stroke-width="4" stroke-linecap="round"/>

    <!-- Simulated High-Density QR Code Patterns -->
    <!-- Top-Left Position Detection -->
    <rect x="60" y="130" width="56" height="56" rx="6" fill="#0f172a"/>
    <rect x="68" y="138" width="40" height="40" rx="3" fill="#ffffff"/>
    <rect x="76" y="146" width="24" height="24" rx="2" fill="#005CE6"/>

    <!-- Top-Right Position Detection -->
    <rect x="224" y="130" width="56" height="56" rx="6" fill="#0f172a"/>
    <rect x="232" y="138" width="40" height="40" rx="3" fill="#ffffff"/>
    <rect x="240" y="146" width="24" height="24" rx="2" fill="#005CE6"/>

    <!-- Bottom-Left Position Detection -->
    <rect x="60" y="294" width="56" height="56" rx="6" fill="#0f172a"/>
    <rect x="68" y="302" width="40" height="40" rx="3" fill="#ffffff"/>
    <rect x="76" y="310" width="24" height="24" rx="2" fill="#005CE6"/>

    <!-- QR Data Matrix Elements -->
    <g fill="#1e293b">
      <!-- Top rows -->
      <rect x="130" y="130" width="14" height="14" rx="2"/>
      <rect x="150" y="130" width="14" height="14" rx="2"/>
      <rect x="175" y="130" width="28" height="14" rx="2"/>
      <rect x="130" y="150" width="28" height="14" rx="2"/>
      <rect x="170" y="150" width="14" height="14" rx="2"/>
      <rect x="195" y="150" width="14" height="14" rx="2"/>
      <rect x="130" y="172" width="14" height="14" rx="2"/>
      <rect x="160" y="172" width="24" height="14" rx="2"/>
      <rect x="190" y="172" width="18" height="14" rx="2"/>

      <!-- Center cluster -->
      <rect x="60" y="200" width="28" height="14" rx="2"/>
      <rect x="100" y="200" width="14" height="14" rx="2"/>
      <rect x="125" y="200" width="14" height="14" rx="2"/>
      <rect x="150" y="195" width="20" height="20" rx="3" fill="#005CE6"/>
      <rect x="180" y="200" width="20" height="14" rx="2"/>
      <rect x="210" y="200" width="30" height="14" rx="2"/>
      <rect x="250" y="200" width="30" height="14" rx="2"/>

      <!-- Center Logo Box -->
      <rect x="140" y="224" width="60" height="32" rx="8" fill="#005CE6"/>
      <text x="170" y="244" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#ffffff" text-anchor="middle">GCash</text>

      <rect x="60" y="230" width="14" height="28" rx="2"/>
      <rect x="85" y="230" width="35" height="14" rx="2"/>
      <rect x="85" y="250" width="18" height="14" rx="2"/>
      <rect x="110" y="250" width="20" height="14" rx="2"/>
      <rect x="210" y="230" width="20" height="14" rx="2"/>
      <rect x="240" y="230" width="40" height="14" rx="2"/>
      <rect x="210" y="250" width="35" height="14" rx="2"/>
      <rect x="255" y="250" width="25" height="14" rx="2"/>

      <!-- Lower rows -->
      <rect x="60" y="270" width="56" height="14" rx="2"/>
      <rect x="130" y="270" width="14" height="14" rx="2"/>
      <rect x="155" y="270" width="30" height="14" rx="2"/>
      <rect x="195" y="270" width="25" height="14" rx="2"/>
      <rect x="230" y="270" width="50" height="14" rx="2"/>

      <rect x="130" y="295" width="25" height="14" rx="2"/>
      <rect x="165" y="295" width="14" height="25" rx="2"/>
      <rect x="190" y="295" width="30" height="14" rx="2"/>
      <rect x="230" y="295" width="20" height="20" rx="2"/>
      <rect x="260" y="295" width="20" height="35" rx="2"/>

      <rect x="130" y="325" width="25" height="25" rx="2"/>
      <rect x="185" y="325" width="35" height="14" rx="2"/>
      <rect x="230" y="330" width="20" height="20" rx="2"/>
      <rect x="185" y="345" width="20" height="15" rx="2"/>
    </g>

    <!-- Merchant Name Footer -->
    <text x="170" y="405" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#0f172a" text-anchor="middle">${accountName.toUpperCase()}</text>
    <text x="170" y="423" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="600" fill="#005CE6" text-anchor="middle">${accountNumber}</text>
    <text x="170" y="443" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#059669" text-anchor="middle">Amount: ${formattedAmount}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Attempts to launch the GCash mobile app via deep linking, with user-friendly web fallback.
 */
export function openGCashMobileApp(options?: {
  accountNumber?: string;
  amount?: number;
  onNotice?: (msg: string) => void;
}): void {
  const gcashDeeplink = 'gcash://';
  const gcashPlayStore = 'https://play.google.com/store/apps/details?id=com.globe.gcash.android';
  const gcashAppStore = 'https://apps.apple.com/ph/app/gcash/id520358122';
  const gcashWeb = 'https://m.gcash.com/';

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  if (isMobile) {
    // Attempt deep link trigger
    const start = Date.now();
    window.location.href = gcashDeeplink;

    // If app didn't open within 1.5 seconds, redirect to app store or web
    setTimeout(() => {
      if (Date.now() - start < 2000) {
        if (isAndroid) {
          window.location.href = gcashPlayStore;
        } else if (isIOS) {
          window.location.href = gcashAppStore;
        } else {
          window.location.href = gcashWeb;
        }
      }
    }, 1500);

    options?.onNotice?.('Launching GCash app on your mobile device...');
  } else {
    // Desktop browser notice
    options?.onNotice?.('Please scan the GCash QR code using your phone or open the GCash app to send money.');
    // Offer quick copy or web link
    window.open(gcashWeb, '_blank', 'noopener,noreferrer');
  }
}
