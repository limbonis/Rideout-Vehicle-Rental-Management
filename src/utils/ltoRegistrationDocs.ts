import { MotorbikeRegistrationDocs } from '../types';

export function generateLtoOrCrSvg(params: {
  plateNumber: string;
  modelName: string;
  engineNo: string;
  chassisNo: string;
  businessName: string;
  expiryYear: number;
}): { orUrl: string; crUrl: string } {
  // Official Receipt (OR)
  const orSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
    <rect width="600" height="800" fill="#fdfcf7" stroke="#334155" stroke-width="2"/>
    <rect x="20" y="20" width="560" height="760" fill="none" stroke="#64748b" stroke-width="1" stroke-dasharray="4,2"/>
    
    <!-- LTO Header -->
    <text x="300" y="55" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">REPUBLIC OF THE PHILIPPINES</text>
    <text x="300" y="72" font-family="Arial, sans-serif" font-size="11" fill="#475569" text-anchor="middle">DEPARTMENT OF TRANSPORTATION</text>
    <text x="300" y="92" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="#0284c7" text-anchor="middle">LAND TRANSPORTATION OFFICE</text>
    <text x="300" y="112" font-family="Arial, sans-serif" font-size="13" font-weight="bold" fill="#0f172a" text-anchor="middle">OFFICIAL RECEIPT (ELECTRONIC COPY)</text>
    
    <!-- Watermark Stamp -->
    <circle cx="300" cy="400" r="140" fill="#0284c7" opacity="0.04"/>
    <text x="300" y="410" font-family="Arial, sans-serif" font-size="28" font-weight="900" fill="#0284c7" opacity="0.12" text-anchor="middle" transform="rotate(-30 300 400)">LTO REGISTERED · VERIFIED</text>
    
    <!-- OR Details Grid -->
    <g transform="translate(45, 145)" font-family="monospace" font-size="12" fill="#1e293b">
      <rect x="0" y="0" width="510" height="35" fill="#f1f5f9" stroke="#cbd5e1"/>
      <text x="15" y="22" font-weight="bold">O.R. NUMBER: 984210-LTO-2026-ZB</text>
      <text x="340" y="22" fill="#047857">STATUS: VALID & PAID</text>

      <text x="0" y="65" font-sans="true" font-size="11" fill="#64748b">REGISTERED OWNER:</text>
      <text x="0" y="83" font-size="14" font-weight="bold" fill="#0f172a">${params.businessName.toUpperCase()}</text>
      <text x="0" y="99" font-size="11" fill="#475569">SAN FELIPE DEPOT, ZAMBALES, REGION 3</text>

      <line x1="0" y1="115" x2="510" y2="115" stroke="#cbd5e1"/>

      <text x="0" y="140" font-size="11" fill="#64748b">PLATE NUMBER:</text>
      <text x="0" y="160" font-size="18" font-weight="900" fill="#0284c7">${params.plateNumber}</text>

      <text x="260" y="140" font-size="11" fill="#64748b">MAKE / MODEL:</text>
      <text x="260" y="160" font-size="14" font-weight="bold" fill="#0f172a">${params.modelName}</text>

      <text x="0" y="195" font-size="11" fill="#64748b">ENGINE NUMBER:</text>
      <text x="0" y="215" font-size="13" font-weight="bold">${params.engineNo}</text>

      <text x="260" y="195" font-size="11" fill="#64748b">CHASSIS / VIN:</text>
      <text x="260" y="215" font-size="13" font-weight="bold">${params.chassisNo}</text>

      <line x1="0" y1="235" x2="510" y2="235" stroke="#cbd5e1"/>

      <text x="0" y="260" font-size="11" fill="#64748b">MV FILE NO:</text>
      <text x="0" y="278" font-size="13">1301-00000492811</text>

      <text x="260" y="260" font-size="11" fill="#64748b">VALID UNTIL:</text>
      <text x="260" y="278" font-size="14" font-weight="bold" fill="#059669">DECEMBER 31, ${params.expiryYear}</text>

      <rect x="0" y="310" width="510" height="90" fill="#f8fafc" stroke="#e2e8f0" rx="4"/>
      <text x="15" y="335" font-size="11" fill="#334155">MOTOR VEHICLE REGISTRATION FEE (MVRF): ₱450.00</text>
      <text x="15" y="355" font-size="11" fill="#334155">COMPULSORY THIRD PARTY LIABILITY (CTPL): ₱380.00</text>
      <text x="15" y="375" font-size="12" font-weight="bold" fill="#0f172a">TOTAL OFFICIAL AMOUNT PAID: ₱830.00 (VALIDATED)</text>

      <!-- Signature & QR -->
      <g transform="translate(0, 430)">
        <text x="0" y="35" font-size="10" fill="#64748b">DISTRICT OFFICER:</text>
        <text x="0" y="55" font-size="12" font-weight="bold">ATTY. CARLOS R. MENDOZA</text>
        <text x="0" y="70" font-size="10" fill="#94a3b8">LTO Region III - Iba District Office</text>
        
        <rect x="390" y="0" width="100" height="100" fill="#ffffff" stroke="#94a3b8"/>
        <text x="440" y="45" font-size="9" fill="#0f172a" text-anchor="middle">LTO PH</text>
        <text x="440" y="60" font-size="8" fill="#64748b" text-anchor="middle">AUTHENTIC</text>
        <text x="440" y="75" font-size="8" fill="#059669" text-anchor="middle">✓ VERIFIED</text>
      </g>
    </g>
    
    <!-- Legal Notice -->
    <text x="300" y="760" font-family="Arial, sans-serif" font-size="9" fill="#64748b" text-anchor="middle">
      Certified true digital copy of official LTO registration issued to ${params.businessName} authorized rental fleet.
    </text>
  </svg>`;

  // Certificate of Registration (CR)
  const crSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
    <rect width="600" height="800" fill="#f8fafc" stroke="#1e293b" stroke-width="2"/>
    <rect x="20" y="20" width="560" height="760" fill="none" stroke="#0284c7" stroke-width="1.5"/>
    
    <text x="300" y="55" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#0f172a" text-anchor="middle">REPUBLIC OF THE PHILIPPINES</text>
    <text x="300" y="72" font-family="Arial, sans-serif" font-size="11" fill="#475569" text-anchor="middle">LAND TRANSPORTATION OFFICE</text>
    <text x="300" y="95" font-family="Arial, sans-serif" font-size="18" font-weight="900" fill="#1e3a8a" text-anchor="middle">CERTIFICATE OF REGISTRATION</text>
    <text x="300" y="115" font-family="monospace" font-size="12" fill="#0369a1" text-anchor="middle">CR NO: CR-2026-ZB-0091823</text>
    
    <g transform="translate(45, 140)" font-family="monospace" font-size="12" fill="#1e293b">
      <rect x="0" y="0" width="510" height="40" fill="#e0f2fe" stroke="#7dd3fc" rx="4"/>
      <text x="15" y="25" font-weight="bold" fill="#0369a1">CLASSIFICATION: PRIVATE MOTORCYCLE (COMMERCIAL RENTAL PERMITTED)</text>

      <text x="0" y="70" font-sans="true" font-size="11" fill="#64748b">COMPLETE REGISTERED OWNER NAME:</text>
      <text x="0" y="90" font-size="15" font-weight="bold" fill="#0f172a">${params.businessName.toUpperCase()}</text>

      <text x="0" y="130" font-size="11" fill="#64748b">ASSIGNED PLATE NUMBER:</text>
      <text x="0" y="152" font-size="20" font-weight="900" fill="#0284c7">${params.plateNumber}</text>

      <text x="260" y="130" font-size="11" fill="#64748b">MAKE / MODEL / CC:</text>
      <text x="260" y="152" font-size="14" font-weight="bold">${params.modelName}</text>

      <text x="0" y="190" font-size="11" fill="#64748b">ENGINE SERIAL NO:</text>
      <text x="0" y="210" font-size="13" font-weight="bold">${params.engineNo}</text>

      <text x="260" y="190" font-size="11" fill="#64748b">CHASSIS / FRAME NO:</text>
      <text x="260" y="210" font-size="13" font-weight="bold">${params.chassisNo}</text>

      <line x1="0" y1="235" x2="510" y2="235" stroke="#cbd5e1"/>

      <text x="0" y="260" font-size="11" fill="#64748b">BODY TYPE: MOTORCYCLE W/O SIDECAR</text>
      <text x="260" y="260" font-size="11" fill="#64748b">FUEL TYPE: GASOLINE</text>

      <text x="0" y="285" font-size="11" fill="#64748b">COLOR: FACTORY MATTE BLACK / CYAN ACCENT</text>
      <text x="260" y="285" font-size="11" fill="#64748b">YEAR MODEL: 2024</text>

      <rect x="0" y="320" width="510" height="120" fill="#ffffff" stroke="#cbd5e1" rx="4"/>
      <text x="15" y="345" font-weight="bold" fill="#0f172a">REMARKS / ENDORSEMENTS:</text>
      <text x="15" y="365" font-size="11" fill="#475569">1. RENTAL COMMERCIAL OPERATION ACCREDITATION GRANTED.</text>
      <text x="15" y="385" font-size="11" fill="#475569">2. VALID HIGHWAY & PROVINCIAL PASS COVERING REGION 3.</text>
      <text x="15" y="405" font-size="11" fill="#475569">3. HELMET AND CODE A/A1 RESTRICTION STRICTLY ENFORCED.</text>
      <text x="15" y="425" font-size="11" font-weight="bold" fill="#059669">4. AUTHENTIC DIGITAL MOTORCYCLE REGISTRATION COPY ISSUED TO RENTER.</text>
    </g>

    <text x="300" y="755" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#0369a1" text-anchor="middle">
      KEEP THIS DIGITAL OR/CR ON YOUR MOBILE PHONE AT ALL TIMES WHILE RIDING.
    </text>
  </svg>`;

  return {
    orUrl: `data:image/svg+xml;utf8,${encodeURIComponent(orSvg)}`,
    crUrl: `data:image/svg+xml;utf8,${encodeURIComponent(crSvg)}`,
  };
}

export function generateLtoRegistrationDocs(
  plateNumber: string = 'ZB-9481',
  modelName: string = 'Honda ADV 160 ABS',
  customerName: string = 'Authorized Renter'
) {
  const engineNumber = `KF38E-${plateNumber.replace(/[^0-9]/g, '') || '9481'}02`;
  const chassisNumber = `MH2KF3812PK-${plateNumber.replace(/[^0-9]/g, '') || '9481'}8`;
  const expiryDate = 'December 31, 2026';

  const { orUrl, crUrl } = generateLtoOrCrSvg({
    plateNumber,
    modelName,
    engineNo: engineNumber,
    chassisNo: chassisNumber,
    businessName: 'RideOut Zambales Moto Rentals & Tours',
    expiryYear: 2026,
  });

  const orSvg = decodeURIComponent(orUrl.replace('data:image/svg+xml;utf8,', ''));
  const crSvg = decodeURIComponent(crUrl.replace('data:image/svg+xml;utf8,', ''));

  return {
    plateNumber,
    modelName,
    engineNumber,
    chassisNumber,
    expiryDate,
    customerName,
    orUrl,
    crUrl,
    orSvg,
    crSvg,
  };
}

