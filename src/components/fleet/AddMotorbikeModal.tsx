import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  FileText, 
  Camera, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  ArrowLeft, 
  Bike, 
  Sliders, 
  Sun, 
  Contrast, 
  Palette, 
  ShieldCheck, 
  Layers, 
  RefreshCw,
  Image as ImageIcon,
  Eye,
  Award
} from 'lucide-react';
import { Motorbike, BikeCategory, MotorbikeRegistrationDocs } from '../../types';
import { generateLtoOrCrSvg } from '../../utils/ltoRegistrationDocs';
import { useApp } from '../../context/AppContext';

interface AddMotorbikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (bike: Motorbike) => void;
}

type Step = 'upload_cr' | 'specs_rates' | 'four_photos' | 'ai_studio';

interface SampleCrPreset {
  brand: string;
  model: string;
  category: BikeCategory;
  engineCc: number;
  plateNumber: string;
  engineNo: string;
  chassisNo: string;
  dailyRate: number;
  yearModel: number;
  transmission: 'Automatic (CVT)' | 'Manual (Clutch)' | 'Semi-Automatic';
  fourPhotos: [string, string, string, string]; // Front, Left, Right, Rear
}

const SAMPLE_CR_PRESETS: SampleCrPreset[] = [
  {
    brand: 'Honda',
    model: 'Honda ADV 160 ABS',
    category: 'adventure',
    engineCc: 160,
    plateNumber: 'ZA-4821',
    engineNo: 'KF18E-9214018',
    chassisNo: 'MH2KF1814PK081923',
    dailyRate: 950,
    yearModel: 2026,
    transmission: 'Automatic (CVT)',
    fourPhotos: [
      '/assets/images/bike_adventure_dual_1793338342581.jpg',
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=900&auto=format&fit=crop&q=80'
    ]
  },
  {
    brand: 'Yamaha',
    model: 'Yamaha NMAX 155 ABS',
    category: 'maxi-scooter',
    engineCc: 155,
    plateNumber: 'ZB-8194',
    engineNo: 'G3E9-0091823',
    chassisNo: 'MH3G3E917PK049211',
    dailyRate: 850,
    yearModel: 2026,
    transmission: 'Automatic (CVT)',
    fourPhotos: [
      '/assets/images/bike_touring_scooter_1793338342942.jpg',
      'https://images.unsplash.com/photo-1558980664-3a031cf67ea8?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=900&auto=format&fit=crop&q=80'
    ]
  },
  {
    brand: 'Vespa',
    model: 'Vespa Primavera 150 I-Get',
    category: 'classic',
    engineCc: 150,
    plateNumber: 'ZC-3209',
    engineNo: 'M812M-1029411',
    chassisNo: 'ZAPM812000004912',
    dailyRate: 1100,
    yearModel: 2025,
    transmission: 'Automatic (CVT)',
    fourPhotos: [
      '/assets/images/bike_urban_scooter_1793338342006.jpg',
      'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=900&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&auto=format&fit=crop&q=80'
    ]
  }
];

type StudioBackground = 'showroom' | 'liwliwa_sunset' | 'siargao_palms' | 'mountain_twisties' | 'studio_white' | 'cyber_neon';

const STUDIO_BACKGROUNDS: Record<StudioBackground, { name: string; tag: string; description: string; gradient: string }> = {
  showroom: {
    name: 'Showroom Studio',
    tag: 'Flagship Dealership',
    description: 'Crisp architectural concrete, glossy ground reflections, soft overhead light.',
    gradient: 'linear-gradient(180deg, #18181b 0%, #27272a 40%, #3f3f46 65%, #09090b 100%)'
  },
  liwliwa_sunset: {
    name: 'Liwliwa Beach Sunset',
    tag: 'Zambales Coastal Vibe',
    description: 'Warm golden hour sands, glowing orange sky, and ocean horizon tone.',
    gradient: 'linear-gradient(180deg, #451a03 0%, #78350f 35%, #b45309 65%, #1c1917 100%)'
  },
  siargao_palms: {
    name: 'Siargao Tropical Palms',
    tag: 'Island Adventure',
    description: 'Vibrant tropical green palms, sunlit road, and island holiday aesthetic.',
    gradient: 'linear-gradient(180deg, #064e3b 0%, #047857 40%, #065f46 70%, #022c22 100%)'
  },
  mountain_twisties: {
    name: 'Zambales Mountain Curves',
    tag: 'Scenic Twisties',
    description: 'Smooth mountain pass asphalt, cool mountain ridge breeze, adventure feel.',
    gradient: 'linear-gradient(180deg, #0c4a6e 0%, #0369a1 40%, #334155 70%, #0f172a 100%)'
  },
  studio_white: {
    name: 'Clean White E-Commerce',
    tag: 'Catalog High-Key',
    description: 'Pure seamless studio lighting with soft floor contact drop shadow.',
    gradient: 'linear-gradient(180deg, #e4e4e7 0%, #f4f4f5 50%, #d4d4d8 100%)'
  },
  cyber_neon: {
    name: 'Cyber Neon Night',
    tag: 'Aesthetic Street',
    description: 'Moody dark asphalt with vibrant cyan and violet street lamp highlights.',
    gradient: 'linear-gradient(180deg, #1e1b4b 0%, #312e81 40%, #1e1b4b 80%, #020617 100%)'
  }
};

export const AddMotorbikeModal: React.FC<AddMotorbikeModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { addBike, currentBusiness, showToast } = useApp();

  // Current Step
  const [currentStep, setCurrentStep] = useState<Step>('upload_cr');

  // Step 1: CR Document & OCR Extraction
  const [crImageUrl, setCrImageUrl] = useState<string | null>(null);
  const [isScanningCr, setIsScanningCr] = useState<boolean>(false);
  const [isCrExtracted, setIsCrExtracted] = useState<boolean>(false);

  // Step 2: Extracted & Editable Vehicle Information
  const [brand, setBrand] = useState('Honda');
  const [model, setModel] = useState('Honda ADV 160 ABS');
  const [category, setCategory] = useState<BikeCategory>('adventure');
  const [engineCc, setEngineCc] = useState(160);
  const [plateNumber, setPlateNumber] = useState('ZA-4821');
  const [engineNo, setEngineNo] = useState('KF18E-9214018');
  const [chassisNo, setChassisNo] = useState('MH2KF1814PK081923');
  const [dailyRate, setDailyRate] = useState(950);
  const [currentMileage, setCurrentMileage] = useState(1200);
  const [transmission, setTransmission] = useState<'Automatic (CVT)' | 'Manual (Clutch)' | 'Semi-Automatic'>('Automatic (CVT)');
  const [helmetCapacity, setHelmetCapacity] = useState(2);
  const [yearModel, setYearModel] = useState(2026);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'ABS Braking System',
    'Keyless Smart Key',
    'USB Phone Charger',
    'Twin Subtank Shocks'
  ]);

  // Step 3: Required 4-Angle Photos (Front, Left, Right, Rear)
  const [photoFront, setPhotoFront] = useState<string>('');
  const [photoLeft, setPhotoLeft] = useState<string>('');
  const [photoRight, setPhotoRight] = useState<string>('');
  const [photoRear, setPhotoRear] = useState<string>('');

  // Step 4: AI Photo Studio & Background Editor
  const [selectedBg, setSelectedBg] = useState<StudioBackground>('showroom');
  const [brightness, setBrightness] = useState<number>(108);
  const [contrast, setContrast] = useState<number>(118);
  const [saturation, setSaturation] = useState<number>(115);
  const [isAiProcessing, setIsAiProcessing] = useState<boolean>(false);
  const [enhancedHeroUrl, setEnhancedHeroUrl] = useState<string>('');
  const [showOriginal, setShowOriginal] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Reset or initialize state
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('upload_cr');
      // Default to first sample preset for ease
      const preset = SAMPLE_CR_PRESETS[0];
      setBrand(preset.brand);
      setModel(preset.model);
      setCategory(preset.category);
      setEngineCc(preset.engineCc);
      setPlateNumber(preset.plateNumber);
      setEngineNo(preset.engineNo);
      setChassisNo(preset.chassisNo);
      setDailyRate(preset.dailyRate);
      setYearModel(preset.yearModel);
      setTransmission(preset.transmission);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle CR File Upload (User custom image)
  const handleUploadCrFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCrImageUrl(dataUrl);
      simulateCrOcrScan(brand, model, plateNumber, engineNo, chassisNo);
    };
    reader.readAsDataURL(file);
  };

  // Simulate OCR scan
  const simulateCrOcrScan = (
    scannedBrand: string, 
    scannedModel: string, 
    scannedPlate: string,
    scannedEng: string,
    scannedChassis: string
  ) => {
    setIsScanningCr(true);
    setIsCrExtracted(false);

    setTimeout(() => {
      setIsScanningCr(false);
      setIsCrExtracted(true);
      showToast('LTO Certificate of Registration scanned & verified! Motorbike details extracted.', 'success');
    }, 700);
  };

  // Load a sample LTO CR preset
  const handleSelectCrPreset = (preset: SampleCrPreset) => {
    const { crUrl } = generateLtoOrCrSvg({
      plateNumber: preset.plateNumber,
      modelName: preset.model,
      engineNo: preset.engineNo,
      chassisNo: preset.chassisNo,
      businessName: currentBusiness.name || 'RideOUT Zambales',
      expiryYear: preset.yearModel,
    });

    setCrImageUrl(crUrl);
    setBrand(preset.brand);
    setModel(preset.model);
    setCategory(preset.category);
    setEngineCc(preset.engineCc);
    setPlateNumber(preset.plateNumber);
    setEngineNo(preset.engineNo);
    setChassisNo(preset.chassisNo);
    setDailyRate(preset.dailyRate);
    setYearModel(preset.yearModel);
    setTransmission(preset.transmission);

    simulateCrOcrScan(preset.brand, preset.model, preset.plateNumber, preset.engineNo, preset.chassisNo);
  };

  // Load 4-photo pack
  const handleLoadSamplePhotos = () => {
    const matchingPreset = SAMPLE_CR_PRESETS.find(p => p.brand.toLowerCase() === brand.toLowerCase()) || SAMPLE_CR_PRESETS[0];
    setPhotoFront(matchingPreset.fourPhotos[0]);
    setPhotoLeft(matchingPreset.fourPhotos[1]);
    setPhotoRight(matchingPreset.fourPhotos[2]);
    setPhotoRear(matchingPreset.fourPhotos[3]);
    setEnhancedHeroUrl(matchingPreset.fourPhotos[0]);
    showToast('Loaded 4 required vehicle photos (Front, Left, Right, Rear)!', 'success');
  };

  const handleIndividualPhotoUpload = (slot: 1 | 2 | 3 | 4, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (slot === 1) {
        setPhotoFront(dataUrl);
        setEnhancedHeroUrl(dataUrl);
      } else if (slot === 2) {
        setPhotoLeft(dataUrl);
      } else if (slot === 3) {
        setPhotoRight(dataUrl);
      } else if (slot === 4) {
        setPhotoRear(dataUrl);
      }
      showToast(`Slot ${slot} photo attached!`, 'success');
    };
    reader.readAsDataURL(file);
  };

  const countUploadedPhotos = [photoFront, photoLeft, photoRight, photoRear].filter(Boolean).length;
  const isAllFourPhotosUploaded = countUploadedPhotos >= 4;

  // Render composite canvas for AI studio
  useEffect(() => {
    if (currentStep === 'ai_studio' && (enhancedHeroUrl || photoFront)) {
      renderAiCanvas();
    }
  }, [currentStep, selectedBg, brightness, contrast, saturation, photoFront]);

  const renderAiCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = photoFront || '/assets/images/bike_adventure_dual_1793338342581.jpg';

    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 800;

      // Draw background environment
      const bgConfig = STUDIO_BACKGROUNDS[selectedBg];
      if (selectedBg === 'showroom') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 800);
        bgGrad.addColorStop(0, '#111827');
        bgGrad.addColorStop(0.4, '#1f2937');
        bgGrad.addColorStop(0.65, '#374151');
        bgGrad.addColorStop(1, '#030712');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 800);

        // Ground spotlight floor reflection
        const spotGrad = ctx.createRadialGradient(600, 550, 50, 600, 550, 450);
        spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
        spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = spotGrad;
        ctx.fillRect(0, 300, 1200, 500);
      } else if (selectedBg === 'liwliwa_sunset') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 800);
        bgGrad.addColorStop(0, '#451a03');
        bgGrad.addColorStop(0.35, '#9a3412');
        bgGrad.addColorStop(0.65, '#ea580c');
        bgGrad.addColorStop(1, '#1c1917');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 800);
      } else if (selectedBg === 'siargao_palms') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 800);
        bgGrad.addColorStop(0, '#022c22');
        bgGrad.addColorStop(0.4, '#047857');
        bgGrad.addColorStop(0.7, '#065f46');
        bgGrad.addColorStop(1, '#022c22');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 800);
      } else if (selectedBg === 'mountain_twisties') {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 800);
        bgGrad.addColorStop(0, '#0c4a6e');
        bgGrad.addColorStop(0.4, '#0369a1');
        bgGrad.addColorStop(0.7, '#1e293b');
        bgGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 800);
      } else if (selectedBg === 'studio_white') {
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, 1200, 800);
        // Soft drop shadow ellipse
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        ctx.beginPath();
        ctx.ellipse(600, 680, 420, 40, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, 0, 800);
        bgGrad.addColorStop(0, '#1e1b4b');
        bgGrad.addColorStop(0.45, '#312e81');
        bgGrad.addColorStop(0.8, '#0f172a');
        bgGrad.addColorStop(1, '#020617');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 1200, 800);
      }

      // Draw Bike with filter styles
      ctx.save();
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      // Maintain aspect ratio centered
      const hRatio = 1200 / img.width;
      const vRatio = 800 / img.height;
      const ratio = Math.min(hRatio, vRatio) * 0.88;
      const centerShiftX = (1200 - img.width * ratio) / 2;
      const centerShiftY = (800 - img.height * ratio) / 2 + 30;

      ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);
      ctx.restore();

      // Official Depot Verified Badge in Top Right
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(900, 40, 260, 60, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('RIDEOUT FLEET VERIFIED', 925, 75);

      setEnhancedHeroUrl(canvas.toDataURL('image/jpeg', 0.92));
    };
  };

  // Save the complete motorbike to fleet
  const handleFinalSubmit = () => {
    if (!isAllFourPhotosUploaded) {
      showToast('Please upload all 4 required photos before saving.', 'error');
      setCurrentStep('four_photos');
      return;
    }

    const registrationDocs: MotorbikeRegistrationDocs = {
      plateNumber,
      modelName: model,
      engineNumber: engineNo,
      chassisNumber: chassisNo,
      expiryDate: `December 31, ${yearModel}`,
      customerName: currentBusiness.name || 'RideOUT Fleet Operations',
      officialReceiptUrl: crImageUrl || '',
      certificateOfRegistrationUrl: crImageUrl || '',
      orUrl: crImageUrl || '',
      crUrl: crImageUrl || '',
    };

    const finalHero = enhancedHeroUrl || photoFront;

    const newBike: Omit<Motorbike, 'id'> = {
      name: model,
      brand,
      model,
      category,
      engineCc,
      plateNumber,
      dailyRate,
      weeklyRate: Math.round(dailyRate * 6),
      currentMileage,
      nextServiceMileage: currentMileage + 1500,
      fuelLevel: 100,
      status: 'available',
      imageUrl: finalHero,
      photos: [photoFront, photoLeft, photoRight, photoRear],
      features: selectedFeatures,
      helmetCapacity,
      transmission,
      businessId: currentBusiness.id,
      registrationDocs,
    };

    addBike(newBike);
    showToast(`Successfully registered ${model} (${plateNumber}) with verified LTO CR & 4-angle studio photos!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-hidden animate-fade-in">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-stone-900 border border-stone-700/80 rounded-3xl w-full max-w-3xl shadow-2xl flex flex-col text-stone-100 relative max-h-[92vh] overflow-hidden"
      >
        
        {/* Modal Top Header */}
        <div className="shrink-0 p-5 pb-4 border-b border-stone-800 bg-stone-900/90 backdrop-blur-sm flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-500/20 shrink-0">
              <Bike className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold bg-amber-400/10 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded">
                  Fleet Registration
                </span>
                <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  LTO CR Verified
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-stone-100 mt-0.5">
                Add Motorbike to Depot Fleet
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-xl hover:bg-stone-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4-Step Progress Bar Indicator */}
        <div className="shrink-0 bg-stone-950 px-5 py-2.5 border-b border-stone-850 flex items-center justify-between text-xs overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-2 sm:gap-4 mx-auto">
            
            {/* Step 1 */}
            <div 
              onClick={() => setCurrentStep('upload_cr')}
              className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
                currentStep === 'upload_cr' ? 'text-amber-400 font-bold' : isCrExtracted ? 'text-emerald-400' : 'text-stone-500'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 'upload_cr' ? 'bg-amber-400 text-stone-950' : isCrExtracted ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}>
                {isCrExtracted ? '✓' : '1'}
              </div>
              <span className="whitespace-nowrap">1. LTO CR Upload</span>
            </div>

            <span className="text-stone-700">➔</span>

            {/* Step 2 */}
            <div 
              onClick={() => isCrExtracted && setCurrentStep('specs_rates')}
              className={`flex items-center gap-1.5 transition-colors ${
                !isCrExtracted ? 'opacity-40 cursor-not-allowed text-stone-600' : currentStep === 'specs_rates' ? 'text-amber-400 font-bold cursor-pointer' : 'text-stone-400 cursor-pointer'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 'specs_rates' ? 'bg-amber-400 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}>
                2
              </div>
              <span className="whitespace-nowrap">2. Specs & Rates</span>
            </div>

            <span className="text-stone-700">➔</span>

            {/* Step 3 */}
            <div 
              onClick={() => isCrExtracted && setCurrentStep('four_photos')}
              className={`flex items-center gap-1.5 transition-colors ${
                !isCrExtracted ? 'opacity-40 cursor-not-allowed text-stone-600' : currentStep === 'four_photos' ? 'text-amber-400 font-bold cursor-pointer' : isAllFourPhotosUploaded ? 'text-emerald-400 cursor-pointer' : 'text-stone-400 cursor-pointer'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 'four_photos' ? 'bg-amber-400 text-stone-950' : isAllFourPhotosUploaded ? 'bg-emerald-500 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}>
                {isAllFourPhotosUploaded ? '✓' : '3'}
              </div>
              <span className="whitespace-nowrap">3. 4 Required Photos</span>
            </div>

            <span className="text-stone-700">➔</span>

            {/* Step 4 */}
            <div 
              onClick={() => isAllFourPhotosUploaded && setCurrentStep('ai_studio')}
              className={`flex items-center gap-1.5 transition-colors ${
                !isAllFourPhotosUploaded ? 'opacity-40 cursor-not-allowed text-stone-600' : currentStep === 'ai_studio' ? 'text-amber-400 font-bold cursor-pointer' : 'text-stone-400 cursor-pointer'
              }`}
            >
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 'ai_studio' ? 'bg-amber-400 text-stone-950' : 'bg-stone-800 text-stone-400'
              }`}>
                4
              </div>
              <span className="whitespace-nowrap">4. AI Photo Studio</span>
            </div>

          </div>
        </div>

        {/* Scrollable Step Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* STEP 1: UPLOAD CERTIFICATE OF REGISTRATION (CR) */}
          {currentStep === 'upload_cr' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-400/5 border border-amber-400/20 text-xs text-amber-200/90 flex items-start gap-3">
                <FileText className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <strong className="block text-amber-300 font-bold">
                    Step 1: Upload LTO Certificate of Registration (CR)
                  </strong>
                  <p className="text-[11px] leading-relaxed text-amber-200/80">
                    Upload an image or scan of your motorcycle's official <strong>LTO Certificate of Registration (CR)</strong> or Official Receipt (OR). Our system automatically extracts Make, Model, Plate Number, Engine No, Chassis No, and Displacement so you don't have to type them manually!
                  </p>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                
                {/* Left: File Uploader Card */}
                <div className="sm:col-span-6 space-y-3">
                  <label className="border-2 border-dashed border-stone-700 hover:border-amber-400 rounded-2xl p-6 bg-stone-950/80 flex flex-col items-center justify-center text-center cursor-pointer transition-colors group min-h-[220px]">
                    <Upload className="w-8 h-8 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-stone-100 block">
                      Click or Drag LTO CR Photo Here
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-1">
                      Supports JPG, PNG, or scanned PDF
                    </span>
                    <span className="mt-3 px-3 py-1.5 rounded-lg bg-amber-400/10 text-amber-400 font-bold text-[10px] border border-amber-400/30">
                      Auto-Extracts Vehicle Information
                    </span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleUploadCrFile}
                      className="hidden"
                    />
                  </label>

                  {/* Sample Philippine LTO Presets for Quick Demo */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block font-mono">
                      Or select sample Philippine LTO certificate:
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {SAMPLE_CR_PRESETS.map((preset) => (
                        <button
                          key={preset.plateNumber}
                          type="button"
                          onClick={() => handleSelectCrPreset(preset)}
                          className="p-2.5 rounded-xl bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-400 text-left transition-colors flex items-center justify-between text-xs group"
                        >
                          <div>
                            <div className="font-bold text-stone-200 group-hover:text-amber-400 transition-colors">
                              {preset.model}
                            </div>
                            <div className="text-[10px] text-stone-400 font-mono">
                              Plate: {preset.plateNumber} · {preset.engineCc}cc · {preset.engineNo}
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-stone-900 text-stone-300 font-mono border border-stone-700">
                            Use Sample CR
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Scanned / Extracted Preview Card */}
                <div className="sm:col-span-6 space-y-3">
                  <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 min-h-[300px] flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-3 border-b border-stone-850">
                        <span className="text-xs font-bold text-stone-300">
                          Extracted Registration Data
                        </span>
                        {isScanningCr ? (
                          <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 animate-pulse">
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            Scanning with AI Vision...
                          </span>
                        ) : isCrExtracted ? (
                          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                            <CheckCircle2 className="w-3 h-3" />
                            LTO Validated
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-500 font-mono">Awaiting Upload</span>
                        )}
                      </div>

                      {/* Extracted Fields Grid */}
                      <div className="space-y-2.5 pt-3 text-xs">
                        <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-850">
                          <span className="text-stone-400 text-[11px]">Plate Number:</span>
                          <span className="font-bold text-amber-400 font-mono text-sm tracking-wider">
                            {plateNumber || '—'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-850">
                          <span className="text-stone-400 text-[11px]">Make & Model:</span>
                          <span className="font-bold text-stone-100 font-mono">
                            {model || '—'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-850">
                          <span className="text-stone-400 text-[11px]">Engine Displacement:</span>
                          <span className="font-bold text-stone-200 font-mono">
                            {engineCc ? `${engineCc} cc` : '—'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-850">
                          <span className="text-stone-400 text-[11px]">Engine Number:</span>
                          <span className="font-mono text-stone-300 text-[11px]">
                            {engineNo || '—'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-850">
                          <span className="text-stone-400 text-[11px]">Chassis / VIN:</span>
                          <span className="font-mono text-stone-300 text-[11px]">
                            {chassisNo || '—'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between p-2 rounded-lg bg-stone-900 border border-stone-850">
                          <span className="text-stone-400 text-[11px]">Year Model:</span>
                          <span className="font-mono text-stone-300 text-[11px]">
                            {yearModel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Proceed Button */}
                    <button
                      type="button"
                      disabled={!isCrExtracted}
                      onClick={() => setCurrentStep('specs_rates')}
                      className="w-full mt-4 py-2.5 px-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-stone-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow transition-all"
                    >
                      <span>Confirm & Proceed to Vehicle Rates</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 2: SPECS & RENTAL RATES */}
          {currentStep === 'specs_rates' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="font-bold text-stone-200 text-sm">
                  Step 2: Fleet Specs & Pricing
                </span>
                <span className="text-stone-400 font-mono text-[11px]">
                  Extracted from LTO CR: {plateNumber}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Make & Model *</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BikeCategory)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-100"
                  >
                    <option value="scooter">Urban Scooter (125cc-155cc)</option>
                    <option value="maxi-scooter">Maxi-Scooter (Touring)</option>
                    <option value="adventure">Adventure / Dual-Sport</option>
                    <option value="classic">Classic / Retro Cafe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Daily Rental Rate (₱ PHP) *</label>
                  <input
                    type="number"
                    value={dailyRate}
                    onChange={(e) => setDailyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 font-mono text-sm font-bold text-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Estimated Weekly Rate (₱ PHP)</label>
                  <input
                    type="number"
                    value={Math.round(dailyRate * 6)}
                    readOnly
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 rounded-xl text-stone-300 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Starting Odometer Mileage (km)</label>
                  <input
                    type="number"
                    value={currentMileage}
                    onChange={(e) => setCurrentMileage(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-stone-400 mb-1 font-semibold">Transmission</label>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as any)}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-700 rounded-xl text-stone-100"
                  >
                    <option value="Automatic (CVT)">Automatic (CVT)</option>
                    <option value="Manual (Clutch)">Manual (Clutch)</option>
                    <option value="Semi-Automatic">Semi-Automatic</option>
                  </select>
                </div>
              </div>

              {/* Key Features Checkboxes */}
              <div className="pt-2 space-y-2">
                <span className="text-stone-400 font-semibold block text-xs">Included Features:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'ABS Braking System',
                    'Keyless Smart Key',
                    'USB Phone Charger',
                    'Twin Subtank Shocks',
                    'Digital LCD Cockpit',
                    'All-Terrain Dual Tires',
                    'Spacious Underseat Compartment',
                    'Surfboard Rack Ready'
                  ].map((feat) => {
                    const isChecked = selectedFeatures.includes(feat);
                    return (
                      <label 
                        key={feat}
                        className={`p-2 rounded-xl border cursor-pointer flex items-center gap-2 transition-colors ${
                          isChecked ? 'bg-amber-400/10 border-amber-400 text-stone-100' : 'bg-stone-950 border-stone-800 text-stone-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFeatures([...selectedFeatures, feat]);
                            } else {
                              setSelectedFeatures(selectedFeatures.filter(f => f !== feat));
                            }
                          }}
                          className="rounded text-amber-400 focus:ring-amber-400"
                        />
                        <span className="text-[11px] truncate">{feat}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep('upload_cr')}
                  className="px-4 py-2 text-stone-400 hover:text-white font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to LTO CR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep('four_photos')}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl flex items-center gap-1.5 shadow"
                >
                  <span>Continue to 4-Angle Photos</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: UPLOAD MINIMUM 4 PHOTOS (ENFORCED) */}
          {currentStep === 'four_photos' && (
            <div className="space-y-4 animate-fade-in text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-100 text-sm">
                      Step 3: Upload Minimum 4 Vehicle Photos
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                      isAllFourPhotosUploaded ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                    }`}>
                      {countUploadedPhotos} of 4 Photos Uploaded
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    For renter transparency and 360° digital inspections, all 4 angles are strictly required.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLoadSamplePhotos}
                  className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] rounded-lg border border-stone-700 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Load Sample 4-Photo Pack</span>
                </button>
              </div>

              {/* 4 Photo Slots Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                
                {/* Slot 1: Front / Hero Angle */}
                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-stone-200">1. Front / Hero</span>
                      {photoFront ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold">*Required</span>
                      )}
                    </div>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center relative group">
                      {photoFront ? (
                        <img src={photoFront} alt="Front View" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-stone-600" />
                      )}
                    </div>
                  </div>
                  <label className="w-full py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-stone-300 text-[11px] rounded-lg border border-stone-700 flex items-center justify-center gap-1 cursor-pointer transition-colors text-center">
                    <Upload className="w-3 h-3 text-amber-400" />
                    <span>{photoFront ? 'Change Front' : 'Upload Front'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleIndividualPhotoUpload(1, e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Slot 2: Left Side */}
                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-stone-200">2. Left Side</span>
                      {photoLeft ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold">*Required</span>
                      )}
                    </div>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center relative group">
                      {photoLeft ? (
                        <img src={photoLeft} alt="Left Side" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-stone-600" />
                      )}
                    </div>
                  </div>
                  <label className="w-full py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-stone-300 text-[11px] rounded-lg border border-stone-700 flex items-center justify-center gap-1 cursor-pointer transition-colors text-center">
                    <Upload className="w-3 h-3 text-amber-400" />
                    <span>{photoLeft ? 'Change Left' : 'Upload Left'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleIndividualPhotoUpload(2, e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Slot 3: Right Side */}
                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-stone-200">3. Right Side</span>
                      {photoRight ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold">*Required</span>
                      )}
                    </div>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center relative group">
                      {photoRight ? (
                        <img src={photoRight} alt="Right Side" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-stone-600" />
                      )}
                    </div>
                  </div>
                  <label className="w-full py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-stone-300 text-[11px] rounded-lg border border-stone-700 flex items-center justify-center gap-1 cursor-pointer transition-colors text-center">
                    <Upload className="w-3 h-3 text-amber-400" />
                    <span>{photoRight ? 'Change Right' : 'Upload Right'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleIndividualPhotoUpload(3, e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Slot 4: Rear & Dashboard */}
                <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-stone-200">4. Rear / Cockpit</span>
                      {photoRear ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <span className="text-[10px] text-red-400 font-bold">*Required</span>
                      )}
                    </div>
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-stone-900 border border-stone-800 flex items-center justify-center relative group">
                      {photoRear ? (
                        <img src={photoRear} alt="Rear View" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-stone-600" />
                      )}
                    </div>
                  </div>
                  <label className="w-full py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-stone-300 text-[11px] rounded-lg border border-stone-700 flex items-center justify-center gap-1 cursor-pointer transition-colors text-center">
                    <Upload className="w-3 h-3 text-amber-400" />
                    <span>{photoRear ? 'Change Rear' : 'Upload Rear'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleIndividualPhotoUpload(4, e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>

              </div>

              {!isAllFourPhotosUploaded && (
                <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    Minimum 4 photos required before continuing to AI Background Studio. Click <strong>"Load Sample 4-Photo Pack"</strong> above if testing.
                  </span>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep('specs_rates')}
                  className="px-4 py-2 text-stone-400 hover:text-white font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Specs</span>
                </button>

                <button
                  type="button"
                  disabled={!isAllFourPhotosUploaded}
                  onClick={() => setCurrentStep('ai_studio')}
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-stone-950 font-bold rounded-xl flex items-center gap-1.5 shadow"
                >
                  <span>Proceed to AI Photo Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AI PHOTO EDITING & BACKGROUND STUDIO */}
          {currentStep === 'ai_studio' && (
            <div className="space-y-5 animate-fade-in text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-100 text-sm">
                      Step 4: AI Photo Editing & Background Replacement
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/30 font-bold">
                      Commercial Studio
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 mt-0.5">
                    Select an AI studio backdrop to transform your vehicle's hero listing photo into a high-conversion commercial showcase.
                  </p>
                </div>
              </div>

              {/* Main Studio Workspace Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
                
                {/* Left: Background Preset Selector & Tuning Controls */}
                <div className="sm:col-span-5 space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-stone-300 uppercase tracking-wider block">
                      Choose AI Background Environment:
                    </span>
                    <div className="grid grid-cols-1 gap-2">
                      {(Object.keys(STUDIO_BACKGROUNDS) as StudioBackground[]).map((bgKey) => {
                        const bg = STUDIO_BACKGROUNDS[bgKey];
                        const isSelected = selectedBg === bgKey;
                        return (
                          <div
                            key={bgKey}
                            onClick={() => setSelectedBg(bgKey)}
                            className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                              isSelected 
                                ? 'bg-amber-400/10 border-amber-400 text-white shadow-md' 
                                : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                            }`}
                          >
                            <div>
                              <div className="font-bold text-xs flex items-center gap-1.5">
                                <span>{bg.name}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-stone-900 text-amber-400 border border-amber-400/30">
                                  {bg.tag}
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-400 block line-clamp-1 mt-0.5">
                                {bg.description}
                              </span>
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-amber-400 border-amber-300 text-stone-950' : 'border-stone-700'
                            }`}>
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Lighting & Color Sliders */}
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                    <span className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-amber-400" />
                      Fine-Tune Lighting & Contrast
                    </span>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-stone-400">
                        <span>Brightness</span>
                        <span className="font-mono">{brightness}%</span>
                      </div>
                      <input
                        type="range"
                        min="90"
                        max="140"
                        value={brightness}
                        onChange={(e) => setBrightness(Number(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-stone-400">
                        <span>Contrast</span>
                        <span className="font-mono">{contrast}%</span>
                      </div>
                      <input
                        type="range"
                        min="90"
                        max="140"
                        value={contrast}
                        onChange={(e) => setContrast(Number(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-stone-400">
                        <span>Color Saturation</span>
                        <span className="font-mono">{saturation}%</span>
                      </div>
                      <input
                        type="range"
                        min="90"
                        max="140"
                        value={saturation}
                        onChange={(e) => setSaturation(Number(e.target.value))}
                        className="w-full accent-amber-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Real-time Live Canvas & Before/After Preview */}
                <div className="sm:col-span-7 space-y-3">
                  <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-stone-300 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        AI Enhanced Hero Photo Listing
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowOriginal(!showOriginal)}
                        className="text-[10px] px-2 py-0.5 rounded bg-stone-900 border border-stone-700 text-stone-300 hover:text-white"
                      >
                        {showOriginal ? 'Show AI Enhanced' : 'Compare Original'}
                      </button>
                    </div>

                    {/* Canvas Display */}
                    <div className="relative aspect-[12/8] w-full rounded-xl overflow-hidden border border-stone-800 shadow-xl bg-black">
                      {showOriginal ? (
                        <img 
                          src={photoFront} 
                          alt="Original" 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <canvas
                          ref={canvasRef}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                      <span>✓ High-Resolution 1200x800 Commercial Output</span>
                      <span>✓ Official Depot Stamp Overlay</span>
                    </div>
                  </div>

                  {/* Vehicle Summary Card */}
                  <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-stone-100">{model}</div>
                      <div className="text-[11px] text-stone-400 font-mono">
                        Plate: {plateNumber} · {engineCc}cc · Daily: ₱{dailyRate.toLocaleString()}
                      </div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                      Ready to Register
                    </span>
                  </div>
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="pt-4 flex items-center justify-between border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep('four_photos')}
                  className="px-4 py-2 text-stone-400 hover:text-white font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Photos</span>
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  className="px-6 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 text-xs transition-all transform hover:-translate-y-0.5"
                >
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  <span>Register Motorbike to Fleet</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
