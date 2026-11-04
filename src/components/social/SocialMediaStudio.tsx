import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { SocialPlatform, SocialPost, CustomerReview, TikTokTemplate } from '../../types';
import { generateSocialContent, GeneratedPostResponse } from '../../services/gemini';
import { playTikTokTravelBeat, stopTikTokTravelBeat } from '../../utils/audioSynthesizer';
import { shuffleFiveHashtags, getBestTimesToPost } from '../../utils/hashtagShuffler';
import { getNearbyTownsForLocation } from '../../utils/nearbyTownsHelper';
import { 
  VIRAL_TIKTOK_TEMPLATES, 
  TRENDING_TIKTOK_AUDIOS, 
  TrendingTikTokAudio 
} from '../../data/tiktokTemplates';
import { 
  Share2, 
  Sparkles, 
  Copy, 
  Check, 
  Calendar, 
  Instagram, 
  Facebook, 
  Video, 
  Image as ImageIcon, 
  Download, 
  Plus, 
  Trash2, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Clock, 
  MapPin, 
  Music,
  User,
  Bike,
  ExternalLink,
  Flame,
  Radio,
  Layers,
  Wand2,
  Play,
  Film,
  Compass
} from 'lucide-react';

export const SocialMediaStudio: React.FC = () => {
  const { 
    socialPosts, 
    addSocialPost, 
    updatePostStatus, 
    deleteSocialPost, 
    reviews, 
    bikes, 
    inspections, 
    currentBusiness,
    showToast 
  } = useApp();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'tiktok' | 'generator' | 'calendar' | 'reviews'>('tiktok');

  // Business Targeted Towns fallback
  const fallbackTowns = useMemo(() => {
    if (currentBusiness.customization?.targetedNearbyTowns && currentBusiness.customization.targetedNearbyTowns.length > 0) {
      return currentBusiness.customization.targetedNearbyTowns;
    }
    const detected = getNearbyTownsForLocation(currentBusiness.location);
    return detected.slice(0, 5).map(t => t.name);
  }, [currentBusiness]);

  // Selected towns for active social campaign
  const [selectedTowns, setSelectedTowns] = useState<string[]>(fallbackTowns);

  // TikTok Template Selection
  const [selectedTemplate, setSelectedTemplate] = useState<TikTokTemplate>(VIRAL_TIKTOK_TEMPLATES[0]);
  const [showStoryboardModal, setShowStoryboardModal] = useState<boolean>(false);

  // Recent Rider Selfies
  const recentRiderSelfies = useMemo(() => {
    return inspections
      .filter(i => i.riderSelfieUrl)
      .map(i => ({
        selfieUrl: i.riderSelfieUrl!,
        name: i.inspectorName || 'Happy Rider',
        reservationId: i.reservationId,
      }));
  }, [inspections]);

  const [tiktokImage, setTiktokImage] = useState<string>(
    recentRiderSelfies[0]?.selfieUrl || '/src/assets/images/hero_coastal_ride_1793338340532.jpg'
  );

  const [customLayover, setCustomLayover] = useState('');
  const activeLayoverText = customLayover.trim() || selectedTemplate.hookOverlay;

  // Music state
  const [selectedAudio, setSelectedAudio] = useState<TrendingTikTokAudio>(TRENDING_TIKTOK_AUDIOS[0]);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  // 5 Hashtags
  const [fiveHashtags, setFiveHashtags] = useState<string[]>(() => 
    shuffleFiveHashtags(fallbackTowns)
  );

  // Caption state
  const [tiktokCaption, setTiktokCaption] = useState(selectedTemplate.suggestedCaption);

  // Best Posting Times
  const bestTimesInfo = getBestTimesToPost();

  // Canvas preview ref (9:16 vertical smartphone)
  const tiktokCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // AI Generator State
  const [platform, setPlatform] = useState<SocialPlatform>('tiktok');
  const [topic, setTopic] = useState('scenic_route');
  const [selectedBike, setSelectedBike] = useState(bikes[0]?.name || 'Yamaha NMAX 155');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedPostResponse | null>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopTikTokTravelBeat();
    };
  }, []);

  // Update caption when template changes
  const handleSelectTemplate = (template: TikTokTemplate) => {
    setSelectedTemplate(template);
    setCustomLayover('');
    setTiktokCaption(template.suggestedCaption || template.captionTemplate || '');

    // Also match audio if found
    const soundSearch = (template.soundName || template.musicTrack || '').toLowerCase().slice(0, 10);
    const matchingAudio = TRENDING_TIKTOK_AUDIOS.find(a => a.title.toLowerCase().includes(soundSearch)) || TRENDING_TIKTOK_AUDIOS[0];
    setSelectedAudio(matchingAudio);

    showToast(`Loaded TikTok template: "${template.title}"`, 'info');
  };

  const toggleMusicPlayback = () => {
    if (isPlayingMusic) {
      stopTikTokTravelBeat();
      setIsPlayingMusic(false);
    } else {
      playTikTokTravelBeat(selectedAudio.synthesizerKey);
      setIsPlayingMusic(true);
      showToast(`Playing trending track: ${selectedAudio.title}`, 'info');
    }
  };

  const handleShuffleHashtags = () => {
    const newTags = shuffleFiveHashtags(selectedTowns);
    setFiveHashtags(newTags);
    showToast('Shuffled 5 destination hashtags for your targeted towns!', 'info');
  };

  const toggleTown = (town: string) => {
    const updated = selectedTowns.includes(town)
      ? selectedTowns.filter(t => t !== town)
      : [...selectedTowns, town];
    setSelectedTowns(updated);
    setFiveHashtags(shuffleFiveHashtags(updated));
  };

  // Render TikTok Live Preview Canvas (9:16 vertical ratio)
  useEffect(() => {
    const canvas = tiktokCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = tiktokImage;
    img.onload = () => {
      canvas.width = 540;
      canvas.height = 960; // 9:16 vertical video ratio
      ctx.drawImage(img, 0, 0, 540, 960);

      // Top and bottom cinematic gradients
      const topGrad = ctx.createLinearGradient(0, 0, 0, 220);
      topGrad.addColorStop(0, 'rgba(0,0,0,0.75)');
      topGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, 540, 220);

      const botGrad = ctx.createLinearGradient(0, 580, 0, 960);
      botGrad.addColorStop(0, 'rgba(0,0,0,0)');
      botGrad.addColorStop(1, 'rgba(0,0,0,0.88)');
      ctx.fillStyle = botGrad;
      ctx.fillRect(0, 580, 540, 380);

      // Top bar: TikTok Logo & Depot Brand
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(`TikTok @${currentBusiness.slug || 'rideoutzambales'}`, 25, 45);

      // Location Pill with Target Towns
      ctx.fillStyle = 'rgba(245, 158, 11, 0.95)';
      const townLabel = selectedTowns.length > 0 
        ? `📍 ${selectedTowns.slice(0, 3).join(' · ')}` 
        : `📍 ${currentBusiness.location}`;
      
      if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(25, 60, 290, 28, 6);
        ctx.fill();
      } else {
        ctx.fillRect(25, 60, 290, 28);
      }
      ctx.fillStyle = '#0c0a09';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(townLabel, 35, 78);

      // Center/Lower TikTok Bold Text Layover (with authentic TikTok background boxes)
      ctx.save();
      ctx.font = '900 24px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';

      const maxWidth = 460;
      const words = activeLayoverText.split(' ');
      let line = '';
      const lines: string[] = [];

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          lines.push(line);
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line);

      const startY = 460;
      lines.forEach((l, idx) => {
        const y = startY + idx * 36;
        const textMetrics = ctx.measureText(l);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.78)';
        if (ctx.roundRect) {
          ctx.beginPath();
          ctx.roundRect(270 - textMetrics.width / 2 - 12, y - 26, textMetrics.width + 24, 34, 6);
          ctx.fill();
        } else {
          ctx.fillRect(270 - textMetrics.width / 2 - 12, y - 26, textMetrics.width + 24, 34);
        }

        ctx.fillStyle = '#ffffff';
        ctx.fillText(l.trim(), 270, y);
      });
      ctx.restore();

      // Right-side authentic TikTok Action Icons (Likes, Comments, Bookmark, Share, Audio Disc)
      const rightX = 490;
      
      // Avatar
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(rightX, 600, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0c0a09';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🛵', rightX, 606);

      // Heart / Like
      ctx.fillStyle = '#ffffff';
      ctx.font = '18px sans-serif';
      ctx.fillText('❤️', rightX, 660);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('42.8K', rightX, 678);

      // Comment
      ctx.font = '18px sans-serif';
      ctx.fillText('💬', rightX, 720);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('1,204', rightX, 738);

      // Bookmark / Save
      ctx.font = '18px sans-serif';
      ctx.fillText('🔖', rightX, 780);
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('8,490', rightX, 798);

      // Audio Spinning Disc
      ctx.fillStyle = '#292524';
      ctx.beginPath();
      ctx.arc(rightX, 850, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px sans-serif';
      ctx.fillText('🎵', rightX, 854);

      // Bottom music ticker
      ctx.textAlign = 'left';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(`@${currentBusiness.slug || 'rideoutzambales'} · Original Audio`, 25, 870);

      ctx.fillStyle = '#d6d3d1';
      ctx.font = '11px sans-serif';
      ctx.fillText(`🎵 ${selectedAudio.title} (${selectedAudio.creator})`, 25, 895);
    };
  }, [tiktokImage, activeLayoverText, selectedTowns, selectedAudio, currentBusiness]);

  const handleDownloadTikTokCover = () => {
    const canvas = tiktokCanvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/jpeg', 0.95);
    const link = document.createElement('a');
    link.download = `tiktok_vertical_${selectedTemplate.id}_${Date.now()}.jpg`;
    link.href = url;
    link.click();
    showToast('Downloaded vertical 9:16 TikTok cover image!', 'success');
  };

  const handleCopyFullTikTokCopy = () => {
    const fullText = `${tiktokCaption}\n\n${fiveHashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    showToast('Copied full TikTok caption & 5 destination hashtags!', 'success');
  };

  const handleQueueTikTokPost = () => {
    const canvas = tiktokCanvasRef.current;
    const coverUrl = canvas ? canvas.toDataURL('image/jpeg', 0.8) : tiktokImage;

    addSocialPost({
      platform: 'tiktok',
      postType: 'story',
      topic: 'rider_story',
      title: `${selectedTemplate.title} (${selectedTowns.slice(0, 2).join(', ')})`,
      caption: tiktokCaption || '',
      textOverlay: activeLayoverText,
      hashtags: fiveHashtags,
      imageUrl: coverUrl,
      musicTrack: selectedAudio.title,
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'scheduled',
      likesCount: 0,
    });

    showToast('Queued viral TikTok campaign in Content Queue!', 'success');
    setActiveTab('calendar');
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await generateSocialContent({
        platform,
        topic,
        tone: 'Adventurous, Viral, & Coastal Friendly',
        bikeModel: selectedBike,
        destinations: selectedTowns,
        businessName: currentBusiness.name,
      });
      setGeneratedResult(res);
      showToast('Generated fresh viral social copy with Gemini!', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to generate copy. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Sub-Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5" />
              TikTok & CapCut Video Engine
            </span>
            <span className="text-xs text-stone-400">
              High-converting templates, trending audio, and town targeting
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-stone-100 flex items-center gap-2">
            <Share2 className="w-5 h-5 text-amber-400" />
            Social Media & TikTok Studio
          </h1>
        </div>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-1 p-1 bg-stone-900 border border-stone-800 rounded-lg overflow-x-auto self-start sm:self-auto">
          {[
            { id: 'tiktok', label: '🎬 TikTok Studio & Templates' },
            { id: 'generator', label: 'AI Post Generator' },
            { id: 'calendar', label: `Content Queue (${socialPosts.length})` },
            { id: 'reviews', label: 'Rider Reviews' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-amber-400 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: TikTok & Viral Template Studio */}
      {activeTab === 'tiktok' && (
        <div className="space-y-6">
          {/* Section A: Curated Viral TikTok & CapCut Templates Selector */}
          <div className="rounded-xl border border-stone-800 bg-stone-900/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="font-bold text-stone-200 uppercase tracking-wider text-xs">
                  Trending TikTok & CapCut Templates (Select a high-performing format)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowStoryboardModal(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
              >
                <span>View Full Video Storyboard</span>
                <Film className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {VIRAL_TIKTOK_TEMPLATES.map((tpl) => {
                const isSelected = selectedTemplate.id === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-400 ring-2 ring-amber-400/20 text-stone-100 shadow-md'
                        : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-900 text-amber-400 font-mono">
                          {tpl.category.replace(/_/g, ' ')}
                        </span>
                        {isSelected && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            Active Template
                          </span>
                        )}
                      </div>
                      <h4 className="font-bold text-xs text-stone-100 line-clamp-1">{tpl.title}</h4>
                      <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                        "{tpl.hookOverlay}"
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[10px] text-stone-400">
                      <span className="truncate max-w-[140px] text-emerald-400 font-mono">
                        🎵 {(tpl.soundName || tpl.musicTrack || 'Original Sound').split('-')[0]}
                      </span>
                      <span className="text-stone-500">{tpl.storyboard.length} Shots</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Main Editor (Left Controls 7 cols, Right Phone Preview 5 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Controls (7 cols) */}
            <div className="lg:col-span-7 space-y-5 text-xs">
              
              {/* 1. Target Towns for Social Marketing (From Business Setup) */}
              <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2 text-[11px]">
                    <MapPin className="w-4 h-4 text-amber-400" />
                    <span>1. Targeted Nearby Towns ({currentBusiness.location})</span>
                  </span>

                  <button
                    type="button"
                    onClick={handleShuffleHashtags}
                    className="px-2.5 py-1 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded flex items-center gap-1 shadow-sm"
                  >
                    <Shuffle className="w-3 h-3" />
                    <span>Shuffle 5 Tags</span>
                  </button>
                </div>

                <p className="text-[11px] text-stone-400">
                  Select which nearby towns to tag in this reel. Configured under <strong>Shop Branding &gt; Section 11</strong>.
                </p>

                {/* Town Chips */}
                <div className="flex flex-wrap gap-2">
                  {fallbackTowns.map((town) => {
                    const isChecked = selectedTowns.includes(town);
                    return (
                      <button
                        key={town}
                        type="button"
                        onClick={() => toggleTown(town)}
                        className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                          isChecked
                            ? 'bg-amber-400/10 border-amber-400 text-amber-300 font-semibold'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {isChecked ? '✓ ' : '+ '} {town}
                      </button>
                    );
                  })}
                </div>

                {/* Active 5 Hashtags */}
                <div className="p-3 rounded-lg bg-stone-950 border border-stone-800 space-y-1">
                  <div className="flex justify-between text-[11px] text-stone-400">
                    <span>Algorithm-Optimized 5 Hashtags (High Discoverability)</span>
                    <span className="font-mono text-amber-400">5 / 5 tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {fiveHashtags.map((tag, idx) => (
                      <span key={idx} className="font-mono text-xs font-bold text-amber-400 bg-stone-900 px-2 py-0.5 rounded border border-stone-800">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Visual Footage & Rider Selfie Selector */}
              <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-4 space-y-3">
                <span className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2 text-[11px]">
                  <User className="w-4 h-4 text-amber-400" />
                  <span>2. Footage & Rider Selfies</span>
                </span>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {recentRiderSelfies.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTiktokImage(s.selfieUrl)}
                      className={`rounded-lg overflow-hidden border text-left p-1 transition-all ${
                        tiktokImage === s.selfieUrl ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-stone-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={s.selfieUrl} alt="Selfie" className="w-full h-16 object-cover rounded" />
                      <div className="text-[10px] text-stone-300 font-semibold truncate mt-1">{s.name}</div>
                    </button>
                  ))}

                  {/* Preset Scenery Assets */}
                  {[
                    { label: 'Coastal Highway', path: '/src/assets/images/hero_coastal_ride_1793338340532.jpg' },
                    { label: 'NMAX Cruiser', path: '/src/assets/images/bike_touring_scooter_1793338342942.jpg' },
                    { label: 'CRF Mountain Trail', path: '/src/assets/images/bike_adventure_dual_1793338342581.jpg' },
                  ].map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setTiktokImage(item.path)}
                      className={`rounded-lg overflow-hidden border text-left p-1 transition-all ${
                        tiktokImage === item.path ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-stone-800 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={item.path} alt={item.label} className="w-full h-16 object-cover rounded" />
                      <div className="text-[10px] text-stone-300 truncate mt-1">{item.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Trending TikTok Audio & Synthesizer Player */}
              <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-stone-200 uppercase tracking-wider text-[11px]">
                      3. Trending TikTok Sounds ({selectedAudio.usageCount})
                    </span>
                  </div>

                  {/* Audio Playback Button with Waveform Visualizer */}
                  <button
                    type="button"
                    onClick={toggleMusicPlayback}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                      isPlayingMusic
                        ? 'bg-amber-400 text-stone-950 shadow-md ring-2 ring-amber-400/40'
                        : 'bg-stone-800 text-stone-200 hover:text-white'
                    }`}
                  >
                    {isPlayingMusic ? <Volume2 className="w-3.5 h-3.5 animate-bounce" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlayingMusic ? 'Pause Beat' : '▶ Preview Beat'}</span>
                    {isPlayingMusic && (
                      <span className="flex items-center gap-0.5">
                        <span className="w-1 h-3 bg-stone-950 animate-pulse"></span>
                        <span className="w-1 h-4 bg-stone-950 animate-pulse delay-75"></span>
                        <span className="w-1 h-2 bg-stone-950 animate-pulse delay-150"></span>
                      </span>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {TRENDING_TIKTOK_AUDIOS.map((audio) => {
                    const isSelected = selectedAudio.id === audio.id;
                    return (
                      <button
                        key={audio.id}
                        type="button"
                        onClick={() => {
                          setSelectedAudio(audio);
                          if (isPlayingMusic) {
                            playTikTokTravelBeat(audio.synthesizerKey);
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-left text-xs flex flex-col justify-between transition-colors ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-500/10 text-stone-100 font-semibold'
                            : 'border-stone-800 bg-stone-950 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-stone-100 truncate">{audio.title}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">{audio.bpm} BPM</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-stone-400 mt-1">
                          <span>{audio.creator}</span>
                          <span className="text-amber-400 font-mono font-medium">{audio.usageCount}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Direct Link to TikTok sound */}
                <div className="pt-2 flex items-center justify-between text-[11px] text-stone-400">
                  <span>Want to use this audio directly inside TikTok?</span>
                  <a
                    href={selectedTemplate.tiktokSoundUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Open Sound in TikTok</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* 4. Text Layover Hook */}
              <div className="rounded-xl border border-stone-800 bg-stone-900/40 p-4 space-y-3">
                <span className="font-bold text-stone-200 uppercase tracking-wider flex items-center gap-2 text-[11px]">
                  <Video className="w-4 h-4 text-pink-400" />
                  <span>4. Viral Text Hook (Overlayed on Video)</span>
                </span>

                <input
                  type="text"
                  value={customLayover}
                  onChange={(e) => setCustomLayover(e.target.value)}
                  placeholder={selectedTemplate.hookOverlay}
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                />

                <div className="flex items-center justify-between text-[11px] text-stone-400">
                  <span>Current Hook: <strong className="text-amber-300">"{activeLayoverText}"</strong></span>
                  {customLayover && (
                    <button
                      type="button"
                      onClick={() => setCustomLayover('')}
                      className="text-stone-500 hover:text-stone-300 underline"
                    >
                      Reset to template hook
                    </button>
                  )}
                </div>
              </div>

              {/* 5. Caption & Ready Actions */}
              <div className="rounded-xl border border-stone-800 bg-stone-950 p-4 space-y-3">
                <label className="block text-stone-300 font-semibold text-xs flex items-center justify-between">
                  <span>5. Full Ready-to-Post Caption & Optimal Timing:</span>
                  <span className="text-[10px] text-emerald-400 font-mono">
                    Best Time: {bestTimesInfo.currentDayBest}
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={tiktokCaption}
                  onChange={(e) => setTiktokCaption(e.target.value)}
                  className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-lg text-stone-100 text-xs leading-relaxed focus:outline-none focus:border-amber-400 font-mono"
                />

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyFullTikTokCopy}
                      className="px-3.5 py-2 text-xs font-semibold text-stone-200 hover:text-white bg-stone-800 rounded-lg flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Caption & Tags</span>
                    </button>

                    <a
                      href={selectedTemplate.capCutTemplateUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 text-xs font-semibold text-stone-950 bg-stone-100 hover:bg-white rounded-lg flex items-center gap-1.5 transition-colors"
                      title="Open ready-to-edit video project in CapCut"
                    >
                      <Film className="w-3.5 h-3.5 text-stone-900" />
                      <span>Edit in CapCut</span>
                      <ExternalLink className="w-3 h-3 text-stone-600" />
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadTikTokCover}
                      className="px-3 py-2 text-xs font-medium text-stone-300 hover:text-white bg-stone-800 rounded-lg flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Cover (9:16)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleQueueTikTokPost}
                      className="px-4 py-2 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Queue for Posting</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Phone Viewport Preview (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <div className="sticky top-6 flex flex-col items-center">
                <div className="w-[300px] sm:w-[320px] aspect-[9/16] rounded-3xl overflow-hidden border-4 border-stone-700 shadow-2xl bg-black relative">
                  <canvas
                    ref={tiktokCanvasRef}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-3 text-center space-y-1">
                  <p className="text-[11px] text-stone-400 font-medium">
                    Native 9:16 TikTok vertical phone preview
                  </p>
                  <p className="text-[10px] text-stone-500">
                    Template: <strong className="text-amber-400">{selectedTemplate.title}</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Storyboard Modal: Step-by-Step Shot Direction */}
          {showStoryboardModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-start justify-between border-b border-stone-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
                      CapCut & TikTok Step-by-Step Director
                    </span>
                    <h3 className="text-lg font-bold text-stone-100 mt-1">
                      {selectedTemplate.title}
                    </h3>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Target Audience: {selectedTemplate.targetAudience}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowStoryboardModal(false)}
                    className="text-stone-400 hover:text-white p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-stone-300 block">
                    Shot-by-Shot Filming Guide for Staff / Renters:
                  </span>
                  {selectedTemplate.storyboard.map((shot) => (
                    <div
                      key={shot.shotNumber}
                      className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 font-bold flex items-center justify-center text-[10px]">
                            {shot.shotNumber}
                          </span>
                          <span className="font-semibold text-stone-200">
                            {shot.cameraAngle}
                          </span>
                        </div>
                        <span className="font-mono text-amber-400 text-[11px]">
                          {shot.durationSec}s duration
                        </span>
                      </div>

                      <p className="text-stone-300 leading-relaxed">
                        {shot.actionDescription}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-900 text-[11px]">
                        <div>
                          <span className="text-stone-500 font-medium">Text Overlay:</span>{' '}
                          <span className="text-amber-300">"{shot.onScreenText}"</span>
                        </div>
                        <div>
                          <span className="text-stone-500 font-medium">Sound Cue:</span>{' '}
                          <span className="text-emerald-400">{shot.audioCue}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-800">
                  <a
                    href={selectedTemplate.capCutTemplateUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-stone-100 hover:bg-white text-stone-950 font-bold rounded-lg text-xs flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Film className="w-4 h-4" />
                    <span>Open Template in CapCut</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setShowStoryboardModal(false)}
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold rounded-lg text-xs w-full sm:w-auto"
                  >
                    Close Guide
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: AI Post Generator */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 rounded-xl border border-stone-800 bg-stone-900/40 p-5 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Campaign Generator</span>
              </span>
              <span className="text-[10px] text-amber-400 font-mono">Gemini Flash</span>
            </div>

            <div>
              <label className="block text-stone-400 mb-1 font-medium">Target Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {(['tiktok', 'instagram', 'facebook'] as SocialPlatform[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPlatform(p)}
                    className={`py-2 px-3 rounded-lg border text-xs font-semibold capitalize transition-colors ${
                      platform === p
                        ? 'border-amber-400 bg-amber-400/10 text-stone-100'
                        : 'border-stone-800 bg-stone-950 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-stone-400 mb-1 font-medium">Topic / Narrative</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs"
              >
                <option value="scenic_route">Scenic Coastal Road Trip ({selectedTowns.slice(0, 2).join(' & ')})</option>
                <option value="budget_math">Tricycle vs Motorbike Rental Cost Comparison</option>
                <option value="promo">Flash Weekend Promo Code Discount</option>
                <option value="fleet_spotlight">Fleet Spotlight: NMAX 155 & Honda ADV 160</option>
                <option value="safety_tips">Safety First: LTO Rules, Helmets, & Insurance</option>
              </select>
            </div>

            <div>
              <label className="block text-stone-400 mb-1 font-medium">Featured Motorbike</label>
              <select
                value={selectedBike}
                onChange={(e) => setSelectedBike(e.target.value)}
                className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-stone-100 text-xs"
              >
                {bikes.map((b) => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 text-xs font-semibold text-stone-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Generating Targeted Copy...' : 'Generate Viral Post & Hashtags'}</span>
            </button>
          </div>

          <div className="lg:col-span-7 rounded-xl border border-stone-800 bg-stone-900/40 p-5 flex flex-col justify-between">
            {generatedResult ? (
              <div className="space-y-4 text-xs">
                <h3 className="text-base font-bold text-stone-100">{generatedResult.title}</h3>
                <div className="p-4 rounded-lg bg-stone-950 border border-stone-800 text-stone-200 leading-relaxed whitespace-pre-line">
                  <div className="font-semibold text-amber-400 mb-2">{generatedResult.hook}</div>
                  {generatedResult.caption}
                  <div className="mt-2 text-amber-400">👉 {generatedResult.callToAction}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {generatedResult.hashtags.map((tag, idx) => (
                    <span key={idx} className="font-mono text-amber-400 text-xs">{tag}</span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-20 text-center text-stone-500 text-xs space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-stone-600" />
                <p>Click Generate to create custom captions for {currentBusiness.name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Content Calendar & Queue */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-200">
              Scheduled Social Campaign Queue
            </h2>
            <span className="text-xs text-stone-500 font-mono">
              {socialPosts.length} posts queued
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {socialPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-xl border border-stone-800 bg-stone-900/50 p-4 flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                      {post.platform} · {post.postType}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400">{post.scheduledDate}</span>
                  </div>

                  {post.imageUrl && (
                    <img src={post.imageUrl} alt={post.title} className="w-full h-32 object-cover rounded-lg mb-2" />
                  )}

                  <h3 className="font-bold text-sm text-stone-100">{post.title}</h3>
                  <p className="mt-1 text-xs text-stone-300 line-clamp-3 leading-relaxed">
                    {post.caption}
                  </p>

                  {post.musicTrack && (
                    <div className="mt-2 text-[10px] text-emerald-400 font-mono">
                      🎵 {post.musicTrack}
                    </div>
                  )}

                  <div className="mt-2 flex flex-wrap gap-1">
                    {post.hashtags.map((h, i) => (
                      <span key={i} className="text-[10px] text-amber-400 font-mono">{h}</span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                  <select
                    value={post.status}
                    onChange={(e) => updatePostStatus(post.id, e.target.value as any)}
                    className="text-[11px] bg-stone-950 border border-stone-800 rounded px-2 py-1 text-stone-300"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="published">Published</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`${post.caption}\n\n${post.hashtags.join(' ')}`);
                        showToast('Post copied!');
                      }}
                      className="p-1.5 text-stone-400 hover:text-amber-400"
                      title="Copy to clipboard"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSocialPost(post.id)}
                      className="p-1.5 text-stone-400 hover:text-red-400"
                      title="Delete post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: Rider Reviews */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-xl border border-stone-800 bg-stone-900/40 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-xs text-stone-200">{rev.customerName}</div>
                  <div className="text-amber-400 text-xs font-bold">★★★★★</div>
                </div>
                <p className="text-xs text-stone-300 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
              <div className="pt-3 border-t border-stone-800 mt-4 flex justify-between text-[11px] text-stone-500">
                <span className="text-amber-400">{rev.bikeRented}</span>
                <span>{rev.date}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
