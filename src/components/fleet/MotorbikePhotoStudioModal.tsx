import React, { useState, useRef, useEffect } from 'react';
import { Motorbike } from '../../types';
import { 
  Sparkles, 
  X, 
  Upload, 
  Save, 
  Download, 
  RotateCcw, 
  Sliders, 
  Check, 
  Image as ImageIcon, 
  Sun, 
  Contrast, 
  Palette, 
  ShieldCheck, 
  Layers, 
  Eye, 
  RefreshCw 
} from 'lucide-react';

interface MotorbikePhotoStudioModalProps {
  bike: Motorbike;
  onSavePhoto: (bikeId: string, enhancedImageUrl: string) => void;
  onClose: () => void;
}

type StudioBackground = 'showroom' | 'liwliwa_sunset' | 'highway_pass' | 'dark_luxury' | 'studio_white' | 'original';
type StudioFilter = 'balanced' | 'crisp_hdr' | 'gloss_polish' | 'warm_golden' | 'cyber_neon';

export const MotorbikePhotoStudioModal: React.FC<MotorbikePhotoStudioModalProps> = ({
  bike,
  onSavePhoto,
  onClose,
}) => {
  const [sourceImage, setSourceImage] = useState<string>(bike.imageUrl);
  const [selectedBg, setSelectedBg] = useState<StudioBackground>('showroom');
  const [selectedFilter, setSelectedFilter] = useState<StudioFilter>('crisp_hdr');
  const [brightness, setBrightness] = useState<number>(105);
  const [contrast, setContrast] = useState<number>(115);
  const [saturation, setSaturation] = useState<number>(120);
  const [badgeOverlay, setBadgeOverlay] = useState<'verified' | 'clean' | 'none'>('verified');
  const [showOriginalComparison, setShowOriginalComparison] = useState<boolean>(false);
  const [isProcessingAi, setIsProcessingAi] = useState<boolean>(false);
  const [generatedPreviewUrl, setGeneratedPreviewUrl] = useState<string>(bike.imageUrl);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background presets descriptions and gradients
  const bgPresets: Record<StudioBackground, { name: string; desc: string; gradient: string }> = {
    showroom: {
      name: 'Polished Showroom',
      desc: 'Clean architectural concrete floor with subtle overhead spot reflection',
      gradient: 'linear-gradient(180deg, #18181b 0%, #27272a 45%, #3f3f46 70%, #18181b 100%)',
    },
    liwliwa_sunset: {
      name: 'Liwliwa Beach Sunset',
      desc: 'Golden hour coastal warm atmosphere with beach glow',
      gradient: 'linear-gradient(180deg, #451a03 0%, #78350f 35%, #b45309 65%, #1c1917 100%)',
    },
    highway_pass: {
      name: 'Zambales Coastal Highway',
      desc: 'Smooth highway pass aesthetic with mountain horizon tone',
      gradient: 'linear-gradient(180deg, #0c4a6e 0%, #0369a1 40%, #334155 70%, #0f172a 100%)',
    },
    dark_luxury: {
      name: 'Dark Studio Spotlight',
      desc: 'Moody vignette with edge lighting emphasizing motorbike silhouettes',
      gradient: 'radial-gradient(circle at center, #27272a 10%, #09090b 80%)',
    },
    studio_white: {
      name: 'Studio Soft Light',
      desc: 'Bright clean presentation for high-conversion website listings',
      gradient: 'linear-gradient(180deg, #e4e4e7 0%, #f4f4f5 50%, #d4d4d8 100%)',
    },
    original: {
      name: 'Preserve Original Background',
      desc: 'Retain original photo backdrop with AI color & lighting enhancement only',
      gradient: '#09090b',
    },
  };

  // Re-render composite canvas whenever adjustments change
  useEffect(() => {
    renderEnhancedComposite();
  }, [sourceImage, selectedBg, selectedFilter, brightness, contrast, saturation, badgeOverlay]);

  const renderEnhancedComposite = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = sourceImage;

    img.onload = () => {
      canvas.width = 1200;
      canvas.height = 800;

      // 1. Draw Background
      if (selectedBg === 'original') {
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      } else {
        // Draw artistic background backdrop
        const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
        if (selectedBg === 'showroom') {
          grad.addColorStop(0, '#09090b');
          grad.addColorStop(0.5, '#18181b');
          grad.addColorStop(0.75, '#27272a');
          grad.addColorStop(1, '#09090b');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Studio spotlight beam
          const spotlight = ctx.createRadialGradient(600, 350, 50, 600, 350, 500);
          spotlight.addColorStop(0, 'rgba(251, 191, 36, 0.15)');
          spotlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = spotlight;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Floor reflection plane
          const floorGrad = ctx.createLinearGradient(0, 580, 0, canvas.height);
          floorGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
          floorGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
          ctx.fillStyle = floorGrad;
          ctx.fillRect(0, 580, canvas.width, canvas.height - 580);
        } else if (selectedBg === 'liwliwa_sunset') {
          grad.addColorStop(0, '#431407');
          grad.addColorStop(0.4, '#9a3412');
          grad.addColorStop(0.7, '#ea580c');
          grad.addColorStop(1, '#1c1917');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Golden sun circle
          ctx.beginPath();
          ctx.arc(850, 280, 180, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
          ctx.fill();
        } else if (selectedBg === 'highway_pass') {
          grad.addColorStop(0, '#082f49');
          grad.addColorStop(0.5, '#0284c7');
          grad.addColorStop(0.75, '#38bdf8');
          grad.addColorStop(1, '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (selectedBg === 'dark_luxury') {
          const darkGrad = ctx.createRadialGradient(600, 400, 100, 600, 400, 600);
          darkGrad.addColorStop(0, '#27272a');
          darkGrad.addColorStop(1, '#09090b');
          ctx.fillStyle = darkGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (selectedBg === 'studio_white') {
          const lightGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
          lightGrad.addColorStop(0, '#f4f4f5');
          lightGrad.addColorStop(0.7, '#e4e4e7');
          lightGrad.addColorStop(1, '#d4d4d8');
          ctx.fillStyle = lightGrad;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw bike subject with soft shadow
        ctx.save();
        // Drop shadow for realism
        ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
        ctx.shadowBlur = 35;
        ctx.shadowOffsetY = 25;

        // Apply visual grading filter
        let filterStr = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        if (selectedFilter === 'crisp_hdr') {
          filterStr += ' contrast(125%)';
        } else if (selectedFilter === 'warm_golden') {
          filterStr += ' sepia(18%) hue-rotate(-10deg)';
        } else if (selectedFilter === 'cyber_neon') {
          filterStr += ' hue-rotate(15deg) saturate(135%)';
        }
        ctx.filter = filterStr;

        // Scale and center bike in presentation box
        const scale = Math.min((canvas.width * 0.92) / img.width, (canvas.height * 0.92) / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const drawX = (canvas.width - drawW) / 2;
        const drawY = (canvas.height - drawH) / 2 + 20;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();
      }

      // 3. Draw Watermark & Fleet Certification Badge
      if (badgeOverlay === 'verified') {
        // Gold Metallic Badge in corner
        ctx.save();
        ctx.translate(60, 60);

        // Badge Pill
        ctx.fillStyle = 'rgba(9, 9, 11, 0.85)';
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(0, 0, 320, 56, 12);
        ctx.fill();
        ctx.stroke();

        // Amber Dot
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(28, 28, 8, 0, Math.PI * 2);
        ctx.fill();

        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('RIDEOUT CERTIFIED FLEET', 50, 26);

        ctx.fillStyle = '#f59e0b';
        ctx.font = '600 13px monospace';
        ctx.fillText(`${bike.plateNumber} · ${bike.engineCc}cc`, 50, 46);

        ctx.restore();
      }

      // Generate preview URL
      try {
        const url = canvas.toDataURL('image/jpeg', 0.92);
        setGeneratedPreviewUrl(url);
      } catch (err) {
        console.warn('Canvas toDataURL security notice:', err);
      }
    };
  };

  const handleApplyPreset = (preset: StudioFilter) => {
    setSelectedFilter(preset);
    setIsProcessingAi(true);
    setTimeout(() => {
      if (preset === 'crisp_hdr') {
        setBrightness(105);
        setContrast(125);
        setSaturation(125);
      } else if (preset === 'gloss_polish') {
        setBrightness(110);
        setContrast(120);
        setSaturation(115);
      } else if (preset === 'warm_golden') {
        setBrightness(108);
        setContrast(115);
        setSaturation(135);
      } else if (preset === 'cyber_neon') {
        setBrightness(100);
        setContrast(130);
        setSaturation(145);
      } else {
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
      }
      setIsProcessingAi(false);
    }, 350);
  };

  const handleCustomFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setSourceImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadHd = () => {
    const link = document.createElement('a');
    link.download = `${bike.name.toLowerCase().replace(/\s+/g, '-')}-studio-presentation.jpg`;
    link.href = generatedPreviewUrl;
    link.click();
  };

  const handleSaveToFleet = () => {
    onSavePhoto(bike.id, generatedPreviewUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-stone-100">
                  AI Motorbike Photo Studio & Presentation Enhancer
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 font-bold">
                  {bike.name} ({bike.plateNumber})
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                Elevate fleet photos for customer bookings and social media reels with studio lighting, background enhancement, and gloss polishing.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Studio Body Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          {/* Left Column: Visual Canvas Preview (7 cols) */}
          <div className="lg:col-span-7 p-5 bg-stone-950 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-stone-800 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-amber-400" />
                  <span>Real-Time Studio Render</span>
                  {isProcessingAi && (
                    <span className="flex items-center gap-1 text-amber-400 font-mono text-[11px] animate-pulse">
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Applying AI Lighting...</span>
                    </span>
                  )}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowOriginalComparison(!showOriginalComparison)}
                    className={`px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors ${
                      showOriginalComparison
                        ? 'bg-amber-400 text-stone-950 border-amber-400'
                        : 'bg-stone-900 text-stone-300 border-stone-800 hover:text-white'
                    }`}
                  >
                    {showOriginalComparison ? 'Showing: Original Photo' : 'Hold to View Original'}
                  </button>
                </div>
              </div>

              {/* Viewport Frame */}
              <div className="relative aspect-16/10 rounded-xl overflow-hidden border border-stone-800 bg-stone-900 shadow-inner flex items-center justify-center">
                {showOriginalComparison ? (
                  <img
                    src={sourceImage}
                    alt="Original Motorbike"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={generatedPreviewUrl}
                    alt="Enhanced Motorbike Presentation"
                    className="w-full h-full object-contain transition-all duration-300"
                  />
                )}

                {/* Badge watermark */}
                <div className="absolute bottom-3 right-3 text-[10px] font-mono px-2 py-1 rounded bg-black/75 text-stone-400 border border-stone-800 backdrop-blur-sm pointer-events-none">
                  AI Enhanced · 1200x800 Studio Output
                </div>
              </div>
            </div>

            {/* Hidden Canvas for generation */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Image Source Selection */}
            <div className="pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <label className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 rounded-lg font-medium cursor-pointer flex items-center gap-1.5 transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Upload Fresh Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomFileUpload}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setSourceImage(bike.imageUrl)}
                  className="px-2.5 py-1.5 text-stone-400 hover:text-stone-200 text-[11px]"
                >
                  Reset to Current
                </button>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={handleDownloadHd}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors"
                  title="Download enhanced high-resolution image"
                >
                  <Download className="w-3.5 h-3.5 text-amber-400" />
                  <span>Download HD</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: AI Controls & Presets (5 cols) */}
          <div className="lg:col-span-5 p-5 space-y-5 text-xs overflow-y-auto">
            {/* 1. Background Environment Transformation */}
            <div className="space-y-2">
              <span className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span>1. Background Environment</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(bgPresets) as StudioBackground[]).map((bgKey) => {
                  const preset = bgPresets[bgKey];
                  const isSelected = selectedBg === bgKey;
                  return (
                    <button
                      key={bgKey}
                      type="button"
                      onClick={() => setSelectedBg(bgKey)}
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-amber-400 bg-amber-400/10 text-stone-100 shadow-sm'
                          : 'border-stone-800 bg-stone-950/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                      }`}
                    >
                      <div className="font-semibold text-xs flex items-center justify-between">
                        <span>{preset.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                      </div>
                      <p className="text-[10px] text-stone-500 mt-1 line-clamp-1">
                        {preset.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. AI Visual Tuning Presets */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <span className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>2. AI Color & Lighting Grading</span>
              </span>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'crisp_hdr', label: 'Crisp HDR Pro', desc: 'Sharpened fairings & tires' },
                  { id: 'gloss_polish', label: 'High-Gloss Shine', desc: 'Reflective body paint' },
                  { id: 'warm_golden', label: 'Sunset Glow', desc: 'Zambales golden hour' },
                  { id: 'cyber_neon', label: 'Cyber Contrast', desc: 'Bold saturated pop' },
                  { id: 'balanced', label: 'Natural Neutral', desc: 'Realistic true-to-life' },
                ].map((flt) => (
                  <button
                    key={flt.id}
                    type="button"
                    onClick={() => handleApplyPreset(flt.id as StudioFilter)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      selectedFilter === flt.id
                        ? 'border-amber-400 bg-amber-400/10 text-stone-100 font-semibold'
                        : 'border-stone-800 bg-stone-950/40 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div className="text-[11px] truncate">{flt.label}</div>
                    <div className="text-[9px] text-stone-500 truncate">{flt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Manual Sliders */}
            <div className="space-y-3 pt-2 border-t border-stone-800">
              <span className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                <span>3. Manual Studio Tuning</span>
              </span>

              <div className="space-y-2.5 bg-stone-950 p-3 rounded-xl border border-stone-800">
                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                    <span className="flex items-center gap-1"><Sun className="w-3 h-3 text-amber-400" /> Brightness</span>
                    <span className="font-mono">{brightness}%</span>
                  </div>
                  <input
                    type="range"
                    min={70}
                    max={140}
                    value={brightness}
                    onChange={(e) => setBrightness(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                    <span className="flex items-center gap-1"><Contrast className="w-3 h-3 text-amber-400" /> Contrast</span>
                    <span className="font-mono">{contrast}%</span>
                  </div>
                  <input
                    type="range"
                    min={80}
                    max={150}
                    value={contrast}
                    onChange={(e) => setContrast(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                    <span className="flex items-center gap-1"><Palette className="w-3 h-3 text-amber-400" /> Color Saturation</span>
                    <span className="font-mono">{saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min={80}
                    max={160}
                    value={saturation}
                    onChange={(e) => setSaturation(Number(e.target.value))}
                    className="w-full accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* 4. Fleet Watermark Badge */}
            <div className="space-y-2 pt-2 border-t border-stone-800">
              <span className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>4. Fleet Trust Badge Overlay</span>
              </span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBadgeOverlay('verified')}
                  className={`p-2 rounded-lg border text-left text-xs ${
                    badgeOverlay === 'verified'
                      ? 'border-amber-400 bg-amber-400/10 text-stone-100 font-semibold'
                      : 'border-stone-800 bg-stone-950 text-stone-400'
                  }`}
                >
                  ROZ Certified Fleet Stamp
                </button>
                <button
                  type="button"
                  onClick={() => setBadgeOverlay('none')}
                  className={`p-2 rounded-lg border text-left text-xs ${
                    badgeOverlay === 'none'
                      ? 'border-amber-400 bg-amber-400/10 text-stone-100 font-semibold'
                      : 'border-stone-800 bg-stone-950 text-stone-400'
                  }`}
                >
                  Clean (No Badge)
                </button>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-stone-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-stone-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveToFleet}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl shadow-lg flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Save className="w-4 h-4 stroke-[2.5]" />
                <span>Apply & Save to Motorbike</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
