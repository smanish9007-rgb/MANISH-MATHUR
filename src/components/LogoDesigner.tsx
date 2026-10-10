import React, { useState } from 'react';
import {
  Sparkles,
  Wand2,
  Download,
  Film,
  Layers,
  ZoomIn,
  RefreshCw,
  Check,
  AlertCircle,
  Lightbulb,
  Palette,
  Sliders,
  ChevronRight,
  Info,
} from 'lucide-react';
import { GeneratedLogo, ImageSize, LogoAspectRatio, BrainstormResult, LogoConcept } from '../types';
import { LOGO_STYLES, INDUSTRIES, COLOR_PALETTES } from '../data/presets';

interface LogoDesignerProps {
  onLogoGenerated: (logo: GeneratedLogo) => void;
  onSendToAnimator: (logo: GeneratedLogo) => void;
  onSendToMockups: (logo: GeneratedLogo) => void;
  activeLogo: GeneratedLogo | null;
  onInspectImage: (logo: GeneratedLogo) => void;
}

export const LogoDesigner: React.FC<LogoDesignerProps> = ({
  onLogoGenerated,
  onSendToAnimator,
  onSendToMockups,
  activeLogo,
  onInspectImage,
}) => {
  // Brand form state
  const [companyName, setCompanyName] = useState('Nexus Dynamics');
  const [tagline, setTagline] = useState('Intelligent Autonomous Systems');
  const [industry, setIndustry] = useState('Artificial Intelligence & Tech');
  const [selectedStyleId, setSelectedStyleId] = useState('minimalist');
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [backgroundType, setBackgroundType] = useState<'clean-white' | 'dark-slate' | 'neutral-studio'>('dark-slate');

  // Key requirement: Affordance for 1K, 2K, 4K image size
  const [imageSize, setImageSize] = useState<ImageSize>('2K');
  const [aspectRatio, setAspectRatio] = useState<LogoAspectRatio>('1:1');

  // Prompt state
  const [customDescription, setCustomDescription] = useState(
    'A sleek geometric origami falcon composed of interlocking faceted polygonal planes, symbolizing visionary speed and precision. Crisp minimal lines, balanced negative space.'
  );

  // Brainstorm state
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [brainstormResult, setBrainstormResult] = useState<BrainstormResult | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStepMessage, setGenStepMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Brainstorm concepts handler
  const handleBrainstorm = async () => {
    setIsBrainstorming(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/suggest-concepts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName,
          industry,
          description: customDescription,
          vibe: LOGO_STYLES.find((s) => s.id === selectedStyleId)?.name || 'Modern',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to suggest concepts');
      }

      const data: BrainstormResult = await res.json();
      setBrainstormResult(data);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to brainstorm concepts. Check API key.');
    } finally {
      setIsBrainstorming(false);
    }
  };

  const applyConcept = (concept: LogoConcept) => {
    setCustomDescription(concept.imagePrompt);
    const matchedStyle = LOGO_STYLES.find(
      (s) => s.name.toLowerCase().includes(concept.style.toLowerCase()) || concept.style.toLowerCase().includes(s.id)
    );
    if (matchedStyle) {
      setSelectedStyleId(matchedStyle.id);
    }
  };

  // Main logo generation handler
  const handleGenerateLogo = async (overridePrompt?: string) => {
    if (!companyName.trim()) {
      setErrorMessage('Please enter a company name.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setGenStepMessage('Synthesizing visual direction with Gemini 3 Pro...');

    const timer1 = setTimeout(() => {
      setGenStepMessage(`Rendering high-fidelity ${imageSize} vector emblem...`);
    }, 2500);

    const timer2 = setTimeout(() => {
      setGenStepMessage('Polishing geometry, lighting and edge clarity...');
    }, 5500);

    try {
      const styleObj = LOGO_STYLES.find((s) => s.id === selectedStyleId);
      const palette = COLOR_PALETTES[selectedPaletteIndex];

      const bgInstruction =
        backgroundType === 'clean-white'
          ? 'on pure solid white background'
          : backgroundType === 'dark-slate'
          ? 'on deep dark obsidian slate background (#0a0a0c)'
          : 'on neutral minimal light gray studio background';

      const basePrompt = overridePrompt || customDescription;
      const fullPrompt = `Logo design for "${companyName}" (${industry}). ${tagline ? `Tagline: "${tagline}".` : ''} Visual Symbol: ${basePrompt}. Style: ${styleObj?.promptSuffix || 'modern vector logo'}. Color scheme: ${palette.colors.join(', ')} (${palette.name}). Background: ${bgInstruction}. Centered composition, balanced negative space, high contrast, crisp graphic emblem.`;

      const res = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPrompt,
          aspectRatio,
          imageSize, // Affordance for 1K, 2K, 4K
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate logo image');
      }

      const data = await res.json();

      const newLogo: GeneratedLogo = {
        id: `logo-${Date.now()}`,
        timestamp: Date.now(),
        companyName,
        tagline,
        imageUrl: data.imageUrl,
        rawBase64: data.rawBase64,
        mimeType: data.mimeType || 'image/png',
        imageSize,
        aspectRatio,
        style: styleObj?.name || 'Modern',
        prompt: fullPrompt,
        suggestedAnimationPrompt: `Cinematic 3D animation of the ${companyName} logo emblem: the geometric elements smoothly rotate and lock into place with glowing neon edges, subtle ambient particles, and dramatic studio light sweep.`,
      };

      onLogoGenerated(newLogo);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Error generating logo. Please verify your GEMINI_API_KEY.');
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
      setIsGenerating(false);
      setGenStepMessage('');
    }
  };

  const handleDownload = (logo: GeneratedLogo) => {
    const link = document.createElement('a');
    link.href = logo.imageUrl;
    link.download = `${logo.companyName.toLowerCase().replace(/\s+/g, '-')}-logo-${logo.imageSize}.png`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Intro hero banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Step 1 of 2 • Logo Conception &amp; Rendering</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Design Your Company Brand Logo
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Input your company details, select visual styles, and generate master logos in{' '}
            <strong className="text-zinc-200">1K, 2K, or 4K</strong> resolution with{' '}
            <strong className="text-cyan-400">Gemini 3 Pro</strong>.
          </p>
        </div>

        <button
          onClick={handleBrainstorm}
          disabled={isBrainstorming}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600/30 to-cyan-600/30 hover:from-indigo-600/50 hover:to-cyan-600/50 border border-indigo-500/40 text-cyan-200 text-xs font-medium transition shadow-lg shadow-indigo-950/40 disabled:opacity-50"
        >
          {isBrainstorming ? (
            <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
          ) : (
            <Lightbulb className="w-4 h-4 text-amber-300" />
          )}
          <span>{isBrainstorming ? 'Brainstorming Ideas...' : 'Brainstorm 4 AI Concepts'}</span>
        </button>
      </div>

      {/* Error notification banner if any */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Action Required</p>
            <p className="text-xs text-red-300/90 mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-red-400 hover:text-red-200 underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Brainstorm result tray if loaded */}
      {brainstormResult && (
        <div className="p-5 rounded-2xl bg-zinc-900/90 border border-indigo-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">AI Creative Director Directions</h3>
              <span className="text-xs text-zinc-400">
                — {brainstormResult.brandSummary}
              </span>
            </div>
            <button
              onClick={() => setBrainstormResult(null)}
              className="text-xs text-zinc-400 hover:text-zinc-200"
            >
              Hide
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {brainstormResult.concepts.map((concept) => (
              <div
                key={concept.id}
                onClick={() => applyConcept(concept)}
                className="group p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-800 hover:border-cyan-500/50 hover:bg-zinc-850/90 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                      {concept.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                      {concept.style}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed">
                    {concept.iconDescription}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {concept.colorPalette.slice(0, 3).map((col, idx) => (
                      <span
                        key={idx}
                        className="w-3 h-3 rounded-full border border-black/40"
                        style={{ backgroundColor: col }}
                        title={col}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-cyan-400 flex items-center gap-1">
                    Use Direction <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Configuration Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Brand Identity Essentials */}
          <div className="p-5 md:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Company Information</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Company / Brand Name <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. SolarPulse, Velvet & Vine"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/70 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Tagline / Motto <span className="text-zinc-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Beyond Frontiers"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/70 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">Industry &amp; Market</label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-cyan-500/70 transition"
              >
                {INDUSTRIES.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Card: Quality & Resolution (Affordance for 1K, 2K, 4K) */}
          <div className="p-5 md:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Image Resolution Quality (Affordance: 1K, 2K, 4K)</span>
              </h2>
              <span className="text-[11px] text-zinc-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-zinc-500" /> Powered by gemini-3-pro-image-preview
              </span>
            </div>

            {/* 1K / 2K / 4K Affordance selector */}
            <div className="grid grid-cols-3 gap-3">
              {(['1K', '2K', '4K'] as ImageSize[]).map((size) => {
                const isSelected = imageSize === size;
                const details =
                  size === '1K'
                    ? { desc: 'Standard 1024×1024', tag: 'Fast Preview', badge: '1K HD' }
                    : size === '2K'
                    ? { desc: 'Retina 2048×2048', tag: 'Recommended', badge: '2K QHD' }
                    : { desc: 'Master 4096×4096', tag: 'Ultra Print', badge: '4K UHD' };

                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setImageSize(size)}
                    className={`relative p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-md shadow-cyan-950/50'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-cyan-400"></span>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-base font-extrabold text-white">{size}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                            isSelected ? 'bg-cyan-500/20 text-cyan-300' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {details.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 font-mono">{details.desc}</p>
                    </div>
                    <span
                      className={`text-[10px] mt-2 font-medium ${
                        isSelected ? 'text-cyan-400' : 'text-zinc-500'
                      }`}
                    >
                      {details.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Aspect Ratio Selector */}
            <div className="pt-2 border-t border-zinc-800/80">
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Emblem Aspect Ratio
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: '1:1', label: '1:1 Square Badge', sub: 'Standard App & Icon' },
                  { id: '16:9', label: '16:9 Landscape', sub: 'Header & Banner' },
                  { id: '4:3', label: '4:3 Classic', sub: 'Editorial Crest' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectRatio(item.id as LogoAspectRatio)}
                    className={`p-2.5 rounded-lg border text-left text-xs transition ${
                      aspectRatio === item.id
                        ? 'bg-zinc-800 border-zinc-600 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">{item.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Design Archetype & Style */}
          <div className="p-5 md:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Palette className="w-4 h-4 text-cyan-400" />
              <span>Design Style Archetype</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {LOGO_STYLES.map((style) => {
                const isSelected = selectedStyleId === style.id;
                return (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyleId(style.id)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-zinc-800/90 border-cyan-500/70 text-white shadow-sm'
                        : 'bg-zinc-950 border-zinc-800/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                        isSelected ? 'bg-cyan-500/20 text-cyan-400' : 'bg-zinc-900 text-zinc-500'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        {style.name}
                        {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-tight mt-0.5 line-clamp-2">
                        {style.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Color Palette row */}
            <div className="pt-2 border-t border-zinc-800/80">
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Brand Palette &amp; Colors
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {COLOR_PALETTES.map((pal, idx) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() => setSelectedPaletteIndex(idx)}
                    className={`p-2 rounded-lg border text-left text-xs transition ${
                      selectedPaletteIndex === idx
                        ? 'bg-zinc-800 border-zinc-600 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-1 mb-1">
                      {pal.colors.map((c, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full border border-black/40"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div className="text-[10px] font-medium truncate">{pal.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Background Canvas Mode */}
            <div className="pt-2 border-t border-zinc-800/80">
              <label className="block text-xs font-medium text-zinc-300 mb-2">
                Emblem Backdrop
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'dark-slate', label: 'Dark Obsidian', sub: 'Tech & Modern' },
                  { id: 'clean-white', label: 'Clean White', sub: 'Print & Corporate' },
                  { id: 'neutral-studio', label: 'Studio Gray', sub: 'Minimalist Neutral' },
                ].map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setBackgroundType(bg.id as any)}
                    className={`p-2 rounded-lg border text-left text-xs transition ${
                      backgroundType === bg.id
                        ? 'bg-zinc-800 border-zinc-600 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold">{bg.label}</div>
                    <div className="text-[10px] text-zinc-500">{bg.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card: Prompt Details */}
          <div className="p-5 md:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-zinc-200 uppercase tracking-wider">
                Visual Symbol Description &amp; Directives
              </label>
              <span className="text-[11px] text-zinc-400">Describe visual elements</span>
            </div>

            <textarea
              rows={3}
              value={customDescription}
              onChange={(e) => setCustomDescription(e.target.value)}
              placeholder="e.g. A stylized geometric origami fox composed of crystalline facets..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500/70 focus:ring-1 focus:ring-cyan-500/70 transition"
            />

            {/* Quick Inspiration chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] text-zinc-500">Inspire me:</span>
              {[
                'Interlocking Monogram Initial',
                'Origami Kinetic Animal',
                'Hyper-Minimalist Neural Knot',
                'Cosmic Solar Eclipse Ring',
                'Cybernetic Quantum Core',
                'Fluid Ribbon Mobius Strip',
              ].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => setCustomDescription((prev) => `${chip}. ${prev}`)}
                  className="text-[11px] px-2 py-0.5 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700/60 transition"
                >
                  + {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Main Action Button */}
          <button
            type="button"
            onClick={() => handleGenerateLogo()}
            disabled={isGenerating}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:from-cyan-400 hover:via-indigo-500 hover:to-fuchsia-500 text-white font-bold text-base shadow-xl shadow-cyan-950/40 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <span>{genStepMessage || 'Generating High-Quality Logo...'}</span>
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 text-cyan-200 group-hover:scale-110 transition-transform" />
                <span>Generate High-Quality Logo ({imageSize})</span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Active Output Preview & Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-20 p-5 md:p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Logo Canvas Result</span>
                {activeLogo && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    {activeLogo.imageSize} UHD
                  </span>
                )}
              </div>
              {activeLogo && (
                <button
                  onClick={() => onInspectImage(activeLogo)}
                  className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 transition"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>
              )}
            </div>

            {/* Display Viewport */}
            <div className="relative mt-4 aspect-square rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden flex items-center justify-center group">
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping"></div>
                    <div className="w-16 h-16 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></div>
                    <Sparkles className="w-6 h-6 text-cyan-400 absolute inset-0 m-auto" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Rendering with Gemini 3 Pro</h4>
                    <p className="text-xs text-cyan-400 mt-1 font-mono">{genStepMessage}</p>
                    <p className="text-[11px] text-zinc-500 mt-2">
                      Generating full {imageSize} resolution asset...
                    </p>
                  </div>
                </div>
              ) : activeLogo ? (
                <>
                  <img
                    src={activeLogo.imageUrl}
                    alt={`${activeLogo.companyName} Logo`}
                    className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Hover overlay for quick action */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
                    <button
                      onClick={() => onInspectImage(activeLogo)}
                      className="px-3 py-1.5 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-white text-xs font-medium flex items-center gap-1.5 shadow"
                    >
                      <ZoomIn className="w-3.5 h-3.5" /> Zoom
                    </button>
                    <button
                      onClick={() => handleDownload(activeLogo)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 shadow"
                    >
                      <Download className="w-3.5 h-3.5" /> PNG
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-400">Ready to Design</p>
                    <p className="text-xs text-zinc-500 max-w-xs mt-1">
                      Configure your company parameters on the left and click "Generate" to craft your
                      bespoke logo.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Result details and Next Steps CTA buttons */}
            {activeLogo && (
              <div className="mt-5 space-y-4">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{activeLogo.companyName}</span>
                    <span className="text-[11px] text-zinc-400">{activeLogo.style}</span>
                  </div>
                  {activeLogo.tagline && (
                    <p className="text-zinc-400 italic">"{activeLogo.tagline}"</p>
                  )}
                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-900 text-[11px] text-zinc-500 font-mono">
                    <span>Model: gemini-3-pro-image-preview</span>
                    <span>•</span>
                    <span className="text-cyan-400">{activeLogo.imageSize}</span>
                  </div>
                </div>

                {/* Primary Next Action: Animate with Veo */}
                <div className="space-y-2">
                  <button
                    onClick={() => onSendToAnimator(activeLogo)}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white text-sm font-bold shadow-lg shadow-fuchsia-950/40 flex items-center justify-center gap-2 transition group cursor-pointer"
                  >
                    <Film className="w-4 h-4 text-fuchsia-200 group-hover:scale-110 transition-transform" />
                    <span>Proceed to Step 2: Animate with Veo 🎬</span>
                  </button>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => onSendToMockups(activeLogo)}
                      className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                    >
                      <Layers className="w-3.5 h-3.5 text-amber-400" />
                      <span>Test in Mockups</span>
                    </button>

                    <button
                      onClick={() => handleDownload(activeLogo)}
                      className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Download {activeLogo.imageSize}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
