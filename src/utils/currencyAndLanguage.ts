import { SupportedCurrency, SupportedLanguage, CurrencyConfig } from '../types';

export const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso', rateFromPHP: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', rateFromPHP: 0.0175 },
  { code: 'THB', symbol: '฿', name: 'Thai Baht', rateFromPHP: 0.62 },
  { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah', rateFromPHP: 280 },
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong', rateFromPHP: 445 },
  { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', rateFromPHP: 0.076 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', rateFromPHP: 0.023 },
];

export const SUPPORTED_LANGUAGES: Array<{ code: SupportedLanguage; label: string; flag: string }> = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'fil', label: 'Filipino', flag: '🇵🇭' },
  { code: 'id', label: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'th', label: 'ไทย (Thai)', flag: '🇹🇭' },
  { code: 'vi', label: 'Tiếng Việt', flag: '🇻🇳' },
];

export function convertFromPHP(amountInPHP: number, currency: SupportedCurrency): number {
  const config = SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];
  const converted = amountInPHP * config.rateFromPHP;
  if (currency === 'IDR' || currency === 'VND') {
    return Math.round(converted / 1000) * 1000;
  }
  return Math.round(converted);
}

export function formatPrice(amountInPHP: number, currency: SupportedCurrency = 'PHP'): string {
  const config = SUPPORTED_CURRENCIES.find((c) => c.code === currency) || SUPPORTED_CURRENCIES[0];
  const converted = convertFromPHP(amountInPHP, currency);
  return `${config.symbol}${converted.toLocaleString()}`;
}

export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    browseFleet: 'Browse Fleet & Reserve Online',
    myPass: 'My Reservation / Pickup Pass',
    reserveNow: 'Reserve Online Now',
    pickupLocation: 'Pickup Location',
    pickupDate: 'Pickup Date',
    returnDate: 'Return Date',
    totalDays: 'Days',
    dailyRate: '/ day',
    codeA1Notice: 'Requires DL Code A or A1',
    deposit: 'Security Deposit',
    cashOption: 'Cash at Counter',
    pickupLockedNotice: 'Pickup will be active on the reservation date',
    feedbackPlaceholder: 'Share your 200-character feedback for Facebook & Google Business reviews...',
    passengerPrompt: 'Will you have a passenger on this rental?',
    selfieDlPrompt: 'Upload Selfie holding Driver\'s License',
    passengerSelfiePrompt: 'Upload Passenger Selfie holding Valid ID',
    emergencyContact: 'Emergency Contact',
    orCrReady: 'Motorbike Official LTO OR/CR Document Ready',
    tripVideoCashback: 'Upload 3-4 Trip Videos for ₱200 Cashback',
  },
  fil: {
    browseFleet: 'Pumili ng Motorsiklo at Mag-reserve',
    myPass: 'Aking Reserbasyon at Pickup Pass',
    reserveNow: 'Mag-book Ngayon',
    pickupLocation: 'Lugar ng Pickup',
    pickupDate: 'Araw ng Pickup',
    returnDate: 'Araw ng Pagsasauli',
    totalDays: 'Araw',
    dailyRate: '/ araw',
    codeA1Notice: 'Kailangan ng Lisensya na may Code A o A1',
    deposit: 'Pansamantalang Deposito',
    cashOption: 'Cash sa Depot',
    pickupLockedNotice: 'Magiging aktibo lamang ang pickup sa araw ng reserbasyon',
    feedbackPlaceholder: 'Ibahagi ang iyong feedback (hanggang 200 letra) para sa Facebook at Google reviews...',
    passengerPrompt: 'Mayroon ka bang kasamang angkas sa biyahe?',
    selfieDlPrompt: 'Mag-upload ng Selfie hawak ang Driver\'s License',
    passengerSelfiePrompt: 'Mag-upload ng Selfie ng Angkas hawak ang Valid ID',
    emergencyContact: 'Numero Kung May Emergency',
    orCrReady: 'Opisyal na LTO OR/CR ng Motorsiklo Handa Na',
    tripVideoCashback: 'Mag-upload ng 3-4 Trip Videos para sa ₱200 Cashback',
  },
  id: {
    browseFleet: 'Pilih Motor & Reservasi Online',
    myPass: 'Tiket & Status Sewa Saya',
    reserveNow: 'Pesan Sekarang',
    pickupLocation: 'Lokasi Pengambilan',
    pickupDate: 'Tanggal Ambil',
    returnDate: 'Tanggal Kembali',
    totalDays: 'Hari',
    dailyRate: '/ hari',
    codeA1Notice: 'Wajib SIM C / Motor (Kode A/A1)',
    deposit: 'Uang Jaminan (Deposit)',
    cashOption: 'Bayar Tunai di Tempat',
    pickupLockedNotice: 'Pengambilan motor aktif pada tanggal pemesanan',
    feedbackPlaceholder: 'Tulis ulasan Anda (maks 200 karakter) untuk Facebook & Google...',
    passengerPrompt: 'Apakah Anda membawa penumpang?',
    selfieDlPrompt: 'Unggah Selfie memegang SIM Motor',
    passengerSelfiePrompt: 'Unggah Selfie Penumpang memegang KTP/ID',
    emergencyContact: 'Kontak Darurat',
    orCrReady: 'Dokumen STNK / Registrasi Resmi Motor Siap',
    tripVideoCashback: 'Unggah 3-4 Video Perjalanan untuk Cashback Rp50.000',
  },
  th: {
    browseFleet: 'เลือกรถมอเตอร์ไซค์และจองออนไลน์',
    myPass: 'ข้อมูลการจองและบัตรรับรถของฉัน',
    reserveNow: 'จองตอนนี้',
    pickupLocation: 'สถานที่รับรถ',
    pickupDate: 'วันที่รับรถ',
    returnDate: 'วันที่คืนรถ',
    totalDays: 'วัน',
    dailyRate: '/ วัน',
    codeA1Notice: 'ต้องมีใบขับขี่จักรยานยนต์ (รหัส A/A1)',
    deposit: 'เงินมัดจำความปลอดภัย',
    cashOption: 'ชำระเงินสดที่ศูนย์บริการ',
    pickupLockedNotice: 'ระบบจะเปิดให้รับรถในวันที่ระบุในใบจอง',
    feedbackPlaceholder: 'แบ่งปันความคิดเห็นสั้นๆ ไม่เกิน 200 ตัวอักษรสำหรับรีวิว Facebook & Google...',
    passengerPrompt: 'คุณมีผู้โดยสารซ้อนท้ายหรือไม่?',
    selfieDlPrompt: 'อัปโหลดภาพเซลฟี่ถือใบขับขี่',
    passengerSelfiePrompt: 'อัปโหลดภาพเซลฟี่ผู้โดยสารถือบัตรรหัสประจำตัว',
    emergencyContact: 'เบอร์ติดต่อฉุกเฉิน',
    orCrReady: 'เอกสารคู่มือจดทะเบียนรถทางการพร้อมส่งมอบ',
    tripVideoCashback: 'อัปโหลด 3-4 วิดีโอทริป รับเงินคืน 120 บาท',
  },
  vi: {
    browseFleet: 'Chọn Xe Máy & Đặt Chỗ Trực Tuyến',
    myPass: 'Vé Đặt Xe & Thẻ Nhận Xe',
    reserveNow: 'Đặt Xe Ngay',
    pickupLocation: 'Điểm Nhận Xe',
    pickupDate: 'Ngày Nhận Xe',
    returnDate: 'Ngày Trả Xe',
    totalDays: 'Ngày',
    dailyRate: '/ ngày',
    codeA1Notice: 'Yêu cầu bằng lái xe máy hạng A/A1',
    deposit: 'Tiền Đặt Cọc Bảo Đảm',
    cashOption: 'Thanh toán tiền mặt tại quầy',
    pickupLockedNotice: 'Chức năng nhận xe sẽ mở vào đúng ngày đặt xe',
    feedbackPlaceholder: 'Chia sẻ đánh giá ngắn gọn (dưới 200 ký tự) lên Facebook & Google...',
    passengerPrompt: 'Bạn có chở theo người ngồi sau không?',
    selfieDlPrompt: 'Tải ảnh selfie chụp cùng bằng lái xe máy',
    passengerSelfiePrompt: 'Tải ảnh selfie của người đi cùng chụp cùng CCCD/Hộ chiếu',
    emergencyContact: 'Liên Hệ Khẩn Cấp',
    orCrReady: 'Giấy Đăng Ký Xe / Cà Vẹt Xe Chính Thức Đã Sẵn Sàng',
    tripVideoCashback: 'Gửi 3-4 video chuyến đi để nhận hoàn tiền 90.000₫',
  },
};
