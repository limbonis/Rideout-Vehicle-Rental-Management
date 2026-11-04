import React, { useState } from 'react';
import { Motorbike } from '../../types';
import { 
  Sparkles, 
  X, 
  Check, 
  Sliders, 
  Sun, 
  Camera, 
  Wand2, 
  Image as ImageIcon, 
  Layers, 
  Eye, 
  RotateCcw,
  Upload,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface AiPhotoEnhancerModalProps {
  bike: Motorbike;
  isOpen: boolean;
  onClose: () => void;
  onApply: (newImageUrl: string) => void;
}

interface EnhancementPreset {
  id: string;
  name: string;
  description: string;
  badge: string;
  iconName: string;
  filterStyle: {
    brightness: number; // percentage e.g. 110
    contrast: number;   // percentage e.g. 125
    saturate: number;   // percentage e.g. 130
    sepia: number;      // percentage e.g. 10
    hueRotate: number;  // degrees e.g. 0
    blur: number;       // px e.g. 0
  };
  sampleShowcaseUrl?: string;
}

const AI_PRESETS: EnhancementPreset[] = [
  {
    id: 'showroom_studio',
    name: 'Dealership Showroom Studio',
    description: 'Crisp studio spotlights, deep gloss reflections, and professional automotive contrast.',
    badge: 'Flagship Studio',
    iconName: 'Wand2',
    filterStyle: {
      brightness: 108,
      contrast: 124,
      saturate: 115,
      sepia: 0,
      hueRotate: 0,
      blur: 0
    },
    sampleShowcaseUrl: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'golden_coast',
    name: 'Sunset Golden Coast',
    description: 'Zambales beach golden hour warmth, ocean breeze lens glow, and rich amber highlights.',
    badge: 'Coastal Warmth',
    iconName: 'Sun',
    filterStyle: {
      brightness: 112,
      contrast: 118,
      saturate: 135,
      sepia: 18,
      hueRotate: -5,
      blur: 0
    },
    sampleShowcaseUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'clean_catalog',
    name: 'Clean White Catalog',
    description: 'Bright high-key daylight lighting and edge sharpness for rental e-commerce presentation.',
    badge: 'Clean E-Commerce',
    iconName: 'Layers',
    filterStyle: {
      brightness: 116,
      contrast: 112,
      saturate: 105,
      sepia: 0,
      hueRotate: 0,
      blur: 0
    },
    sampleShowcaseUrl: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'hdr_adventure',
    name: 'HDR Adventure Trail',
    description: 'High dynamic range, rugged terrain clarity, saturated mountain foliage, and off-road pop.',
    badge: 'Vivid Off-Road',
    iconName: 'Zap',
    filterStyle: {
      brightness: 106,
      contrast: 132,
      saturate: 140,
      sepia: 4,
      hueRotate: 2,
      blur: 0
    },
    sampleShowcaseUrl: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=900&auto=format&fit=crop&q=80',
  },
  {
    id: 'cyber_neon',
    name: 'Neon Twilight Rider',
    description: 'Deep dusk mood, vibrant cyan & amber ambient accents for stylish coastal night riding.',
    badge: 'Dusk Glow',
    iconName: 'Sparkles',
    filterStyle: {
      brightness: 98,
      contrast: 138,
      saturate: 145,
      sepia: 0,
      hueRotate: -15,
      blur: 0
    },
    sampleShowcaseUrl: 'https://images.unsplash.com/photo-1511994298241-608e28f14fde?w=900&auto=format&fit=crop&q=80',
  }
];

export const AiPhotoEnhancerModal: React.FC<AiPhotoEnhancerModalProps> = ({
  bike,
  isOpen,
  onClose,
  onApply,
}) => {
  if (!isOpen) return null;

  const [activeImageSource, setActiveImageSource] = useState<string>(bike.imageUrl);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('showroom_studio');
  
  // Interactive adjustment sliders
  const [brightness, setBrightness] = useState<number>(108);
  const [contrast, setContrast] = useState<number>(124);
  const [saturate, setSaturate] = useState<number>(115);
  const [warmth, setWarmth] = useState<number>(0);
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  const [isProcessingAi, setIsProcessingAi] = useState<boolean>(false);
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);

  const handleSelectPreset = (preset: EnhancementPreset) => {
    setSelectedPresetId(preset.id);
    setBrightness(preset.filterStyle.brightness);
    setContrast(preset.filterStyle.contrast);
    setSaturate(preset.filterStyle.saturate);
    setWarmth(preset.filterStyle.sepia);
  };

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setSaturate(100);
    setWarmth(0);
    setSelectedPresetId('');
  };

  const handleSimulateAiTouchup = () => {
    setIsProcessingAi(true);
    setAiSuccessMessage(null);
    setTimeout(() => {
      setIsProcessingAi(false);
      // Auto-tune to optimal automotive catalog values
      setBrightness(112);
      setContrast(128);
      setSaturate(122);
      setWarmth(6);
      setSelectedPresetId('showroom_studio');
      setAiSuccessMessage('AI Auto-Balance Applied: Studio lighting calibrated, reflections smoothed & contrast maximized.');
    }, 800);
  };

  const handleApply = () => {
    // Save updated image presentation (in a production environment this would be the processed canvas render)
    onApply(activeImageSource);
    onClose();
  };

  const filterString = showOriginal
    ? 'none'
    : `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) sepia(${warmth}%)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl overflow-hidden my-6 text-xs flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 bg-stone-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-400 border border-amber-400/40 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-stone-100 text-sm sm:text-base">
                  AI Motorbike Photo Enhancer & Presentation Studio
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  Fleet Presentation
                </span>
              </div>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Optimize lighting, background contrast, and paint gloss for <strong>{bike.name}</strong> ({bike.plateNumber}).
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Main Visual Display & Before/After */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Viewport Canvas (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden border-2 border-stone-800 bg-stone-950 flex items-center justify-center shadow-inner group">
                <img
                  src={activeImageSource}
                  alt={bike.name}
                  style={{ filter: filterString }}
                  className="w-full h-full object-cover transition-all duration-300"
                />

                {/* Live Filter Indicator Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold backdrop-blur-md shadow-md border ${
                    showOriginal 
                      ? 'bg-stone-900/80 text-stone-300 border-stone-700' 
                      : 'bg-amber-400/90 text-stone-950 border-amber-300'
                  }`}>
                    {showOriginal ? 'Original Image' : 'AI Enhanced Preview'}
                  </span>

                  {selectedPresetId && !showOriginal && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-black/60 text-stone-200 border border-white/10 backdrop-blur-md hidden sm:inline">
                      {AI_PRESETS.find(p => p.id === selectedPresetId)?.name}
                    </span>
                  )}
                </div>

                {/* Hold to Compare Button */}
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <button
                    type="button"
                    onMouseDown={() => setShowOriginal(true)}
                    onMouseUp={() => setShowOriginal(false)}
                    onTouchStart={() => setShowOriginal(true)}
                    onTouchEnd={() => setShowOriginal(false)}
                    className="px-3 py-1.5 rounded-lg bg-stone-950/80 hover:bg-stone-950 text-stone-200 border border-stone-700 backdrop-blur-md text-[11px] font-semibold flex items-center gap-1.5 shadow-lg select-none"
                    title="Press and hold to see un-enhanced photo"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>Hold to Compare (Original)</span>
                  </button>
                </div>
              </div>

              {/* Upload alternative or choose sample vehicle shot */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <label className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            if (typeof reader.result === 'string') {
                              setActiveImageSource(reader.result);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setActiveImageSource(bike.imageUrl)}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 rounded-lg text-xs flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Image</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleSimulateAiTouchup}
                  disabled={isProcessingAi}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isProcessingAi ? 'animate-spin' : ''}`} />
                  <span>{isProcessingAi ? 'Analyzing & Retouching...' : '1-Click AI Auto-Enhance'}</span>
                </button>
              </div>

              {aiSuccessMessage && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{aiSuccessMessage}</span>
                </div>
              )}
            </div>

            {/* Presets & Fine-Tuning Controls (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {/* Presets List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>AI Presentation Presets</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[11px] text-stone-400 hover:text-amber-400 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Defaults</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {AI_PRESETS.map((preset) => {
                    const isSelected = selectedPresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                          isSelected
                            ? 'bg-amber-400/10 border-amber-400 text-stone-100 shadow-sm'
                            : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                        }`}
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-stone-200">{preset.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-stone-800 text-amber-400 border border-stone-700">
                              {preset.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-400 leading-tight">
                            {preset.description}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fine-Tuning Sliders */}
              <div className="p-4 rounded-xl border border-stone-800 bg-stone-950 space-y-3">
                <span className="font-bold text-stone-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-stone-400" />
                  <span>Manual Color & Studio Balance</span>
                </span>

                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                      <span>Brightness & Spotlight</span>
                      <span className="font-mono text-stone-200">{brightness}%</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="140"
                      value={brightness}
                      onChange={(e) => {
                        setBrightness(Number(e.target.value));
                        setSelectedPresetId('');
                      }}
                      className="w-full accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                      <span>Contrast & Depth</span>
                      <span className="font-mono text-stone-200">{contrast}%</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="150"
                      value={contrast}
                      onChange={(e) => {
                        setContrast(Number(e.target.value));
                        setSelectedPresetId('');
                      }}
                      className="w-full accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                      <span>Color Saturation</span>
                      <span className="font-mono text-stone-200">{saturate}%</span>
                    </div>
                    <input
                      type="range"
                      min="80"
                      max="160"
                      value={saturate}
                      onChange={(e) => {
                        setSaturate(Number(e.target.value));
                        setSelectedPresetId('');
                      }}
                      className="w-full accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-stone-400 mb-1">
                      <span>Coastal Warmth (Sunset Sepia)</span>
                      <span className="font-mono text-stone-200">{warmth}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      value={warmth}
                      onChange={(e) => {
                        setWarmth(Number(e.target.value));
                        setSelectedPresetId('');
                      }}
                      className="w-full accent-amber-400 h-1.5 bg-stone-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-stone-800 bg-stone-950">
          <div className="text-stone-400 text-[11px]">
            Preview reflects high-definition catalog touchup applied to {bike.name}.
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-stone-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold flex items-center gap-1.5 shadow-md transition-colors"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Apply Enhanced Photo to Motorbike</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
