import { DriverLicenseInfo } from '../types';

export const SAMPLE_LICENSES: { label: string; name: string; licenseNo: string; codes: string[]; valid: boolean; imageUrl: string }[] = [
  {
    label: 'Valid Motorcycle License (Codes: A, A1, B)',
    name: 'JUAN MIGUEL DELA CRUZ',
    licenseNo: 'N02-18-091244',
    codes: ['A', 'A1', 'B'],
    valid: true,
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" rx="12" fill="%231e293b" stroke="%2338bdf8" stroke-width="3"/><rect x="20" y="20" width="360" height="35" rx="4" fill="%230284c7"/><text x="200" y="42" fill="white" font-size="13" font-family="sans-serif" font-weight="bold" text-anchor="middle">REPUBLIC OF THE PHILIPPINES · LTO DRIVER LICENSE</text><rect x="30" y="70" width="75" height="95" rx="4" fill="%23334155"/><circle cx="67" cy="105" r="22" fill="%2364748b"/><path d="M45,150 Q67,130 90,150" fill="%2364748b"/><text x="120" y="85" fill="%2394a3b8" font-size="9" font-family="monospace">NAME:</text><text x="120" y="103" fill="white" font-size="14" font-family="sans-serif" font-weight="bold">JUAN MIGUEL DELA CRUZ</text><text x="120" y="125" fill="%2394a3b8" font-size="9" font-family="monospace">LICENSE NO: N02-18-091244</text><rect x="120" y="145" width="250" height="40" rx="6" fill="%230f172a" stroke="%2310b981" stroke-width="1.5"/><text x="130" y="162" fill="%2310b981" font-size="10" font-family="monospace" font-weight="bold">DL CODES: A, A1, B (MOTORCYCLE OK)</text><text x="130" y="177" fill="%2394a3b8" font-size="9" font-family="sans-serif">CONDITIONS: NONE · EXPIRY: 2030-08-14</text></svg>'
  },
  {
    label: 'Valid Scooter License (Code: A1 Only)',
    name: 'MARIA CLARA DE GUZMAN',
    licenseNo: 'D01-20-883190',
    codes: ['A1'],
    valid: true,
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" rx="12" fill="%231e293b" stroke="%2338bdf8" stroke-width="3"/><rect x="20" y="20" width="360" height="35" rx="4" fill="%230284c7"/><text x="200" y="42" fill="white" font-size="13" font-family="sans-serif" font-weight="bold" text-anchor="middle">REPUBLIC OF THE PHILIPPINES · LTO DRIVER LICENSE</text><rect x="30" y="70" width="75" height="95" rx="4" fill="%23334155"/><circle cx="67" cy="105" r="22" fill="%2364748b"/><path d="M45,150 Q67,130 90,150" fill="%2364748b"/><text x="120" y="85" fill="%2394a3b8" font-size="9" font-family="monospace">NAME:</text><text x="120" y="103" fill="white" font-size="14" font-family="sans-serif" font-weight="bold">MARIA CLARA DE GUZMAN</text><text x="120" y="125" fill="%2394a3b8" font-size="9" font-family="monospace">LICENSE NO: D01-20-883190</text><rect x="120" y="145" width="250" height="40" rx="6" fill="%230f172a" stroke="%2310b981" stroke-width="1.5"/><text x="130" y="162" fill="%2310b981" font-size="10" font-family="monospace" font-weight="bold">DL CODES: A1 (LIGHT MOTO/TRIKE OK)</text><text x="130" y="177" fill="%2394a3b8" font-size="9" font-family="sans-serif">CONDITIONS: 1 · EXPIRY: 2029-11-20</text></svg>'
  },
  {
    label: 'Car Only License - No Motorcycle (Code B Only)',
    name: 'ROBERTO CARLOS ALVAREZ',
    licenseNo: 'N03-22-004412',
    codes: ['B', 'B1'],
    valid: false,
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="250" viewBox="0 0 400 250"><rect width="400" height="250" rx="12" fill="%231e293b" stroke="%23ef4444" stroke-width="3"/><rect x="20" y="20" width="360" height="35" rx="4" fill="%23991b1b"/><text x="200" y="42" fill="white" font-size="13" font-family="sans-serif" font-weight="bold" text-anchor="middle">REPUBLIC OF THE PHILIPPINES · LTO DRIVER LICENSE</text><rect x="30" y="70" width="75" height="95" rx="4" fill="%23334155"/><circle cx="67" cy="105" r="22" fill="%2364748b"/><path d="M45,150 Q67,130 90,150" fill="%2364748b"/><text x="120" y="85" fill="%2394a3b8" font-size="9" font-family="monospace">NAME:</text><text x="120" y="103" fill="white" font-size="14" font-family="sans-serif" font-weight="bold">ROBERTO CARLOS ALVAREZ</text><text x="120" y="125" fill="%2394a3b8" font-size="9" font-family="monospace">LICENSE NO: N03-22-004412</text><rect x="120" y="145" width="250" height="40" rx="6" fill="%230f172a" stroke="%23ef4444" stroke-width="1.5"/><text x="130" y="162" fill="%23ef4444" font-size="10" font-family="monospace" font-weight="bold">DL CODES: B, B1 (CAR ONLY - NO MOTORCYCLE)</text><text x="130" y="177" fill="%2394a3b8" font-size="9" font-family="sans-serif">NO CODE A OR A1 FOUND</text></svg>'
  }
];

export function validateLicenseCodes(codes: string[]): boolean {
  return codes.some(code => code.toUpperCase() === 'A' || code.toUpperCase() === 'A1');
}

export function validatePhilippineMobile(phone: string): { isValid: boolean; cleaned: string; error?: string } {
  // Remove non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length !== 11) {
    return {
      isValid: false,
      cleaned,
      error: `Must be exactly 11 digits (current: ${cleaned.length} digits). Example: 09171234567`
    };
  }
  if (!cleaned.startsWith('09')) {
    return {
      isValid: false,
      cleaned,
      error: `Philippine mobile number must start with "09". Example: 09171234567`
    };
  }
  return { isValid: true, cleaned };
}
