import React, { useState } from 'react';
import {
  Layers,
  Smartphone,
  Laptop,
  CreditCard,
  Shirt,
  Share2,
  Play,
  Image as ImageIcon,
  Sparkles,
  Download,
} from 'lucide-react';
import { GeneratedLogo, AnimatedVideo } from '../types';

interface MockupStudioProps {
  activeLogo: GeneratedLogo | null;
  activeVideo: AnimatedVideo | null;
  onGoToDesigner: () => void;
  onGoToAnimator: () => void;
}

export const MockupStudio: React.FC<MockupStudioProps> = ({
  activeLogo,
  activeVideo,
  onGoToDesigner,
  onGoToAnimator,
}) => {
  const [activeAssetType, setActiveAssetType] = useState<'video' | 'static'>(
    activeVideo ? 'video' : 'static'
  );
  const [selectedMockup, setSelectedMockup] = useState<'app' | 'web' | 'card' | 'merch' | 'social'>('web');

  const companyName = activeLogo?.companyName || 'Your Brand';
  const tagline = activeLogo?.tagline || 'Modern Intelligent Systems';

  const hasAnyAsset = Boolean(activeLogo || activeVideo);

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Layers className="w-4 h-4" />
            <span>Interactive Brand Kit</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Real-World Brand Collateral Mockups
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Preview how your static logo and Veo animated logo look embedded in high-end mobile apps,
            SaaS hero headers, foil business cards, and merchandise.
          </p>
        </div>

        {/* Toggle Static vs Animated Asset */}
        {hasAnyAsset && (
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-zinc-800">
            <button
              onClick={() => setActiveAssetType('static')}
              disabled={!activeLogo}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeAssetType === 'static'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 disabled:opacity-40'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Static Logo</span>
            </button>
            <button
              onClick={() => setActiveAssetType('video')}
              disabled={!activeVideo}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                activeAssetType === 'video'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 disabled:opacity-40'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-fuchsia-400" />
              <span>Animated Video</span>
              {activeVideo && <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse"></span>}
            </button>
          </div>
        )}
      </div>

      {!hasAnyAsset ? (
        <div className="p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-4 max-w-xl mx-auto my-12">
          <div className="w-16 h-16 rounded-2xl bg-zinc-850 border border-zinc-700/60 flex items-center justify-center text-zinc-500 mx-auto">
            <Layers className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Assets to Preview Yet</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              Start by designing your logo in Step 1 or uploading your brand image in Step 2 to view
              realistic product mockups.
            </p>
          </div>
          <button
            onClick={onGoToDesigner}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium text-xs transition"
          >
            Go to Logo Designer →
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Mockup Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[
              { id: 'web', label: 'SaaS Website Header', icon: Laptop },
              { id: 'app', label: 'Mobile App & Splash', icon: Smartphone },
              { id: 'card', label: 'Luxury Business Card', icon: CreditCard },
              { id: 'merch', label: 'Apparel & T-Shirt', icon: Shirt },
              { id: 'social', label: 'Social Media Kit', icon: Share2 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = selectedMockup === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedMockup(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 shadow-md shadow-amber-950/20'
                      : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Mockup Stage */}
          <div className="p-6 md:p-10 rounded-3xl bg-zinc-950 border border-zinc-800 min-h-[480px] flex items-center justify-center">
            {/* 1. SaaS Website Header Mockup */}
            {selectedMockup === 'web' && (
              <div className="w-full max-w-4xl rounded-2xl bg-zinc-900 border border-zinc-750 shadow-2xl overflow-hidden animate-fade-in">
                {/* Browser top chrome */}
                <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <div className="px-6 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-400">
                    https://{companyName.toLowerCase().replace(/\s+/g, '')}.io
                  </div>
                  <div className="w-12"></div>
                </div>

                {/* Navbar */}
                <div className="px-8 py-4 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-900/60">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-zinc-950 border border-zinc-800">
                      {activeAssetType === 'video' && activeVideo ? (
                        <video
                          src={activeVideo.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      ) : activeLogo ? (
                        <img
                          src={activeLogo.imageUrl}
                          alt="Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : null}
                    </div>
                    <span className="font-bold text-white text-base tracking-tight">{companyName}</span>
                  </div>

                  <div className="hidden sm:flex items-center gap-6 text-xs text-zinc-400">
                    <span>Platform</span>
                    <span>Solutions</span>
                    <span>Developers</span>
                    <span>Pricing</span>
                  </div>

                  <button className="px-3.5 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-semibold shadow">
                    Launch App
                  </button>
                </div>

                {/* Hero Section */}
                <div className="p-12 text-center space-y-6 bg-gradient-to-b from-zinc-900 via-zinc-900/90 to-zinc-950">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-medium">
                    <Sparkles className="w-3.5 h-3.5" /> Next-Generation Architecture
                  </div>

                  <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight">
                    Powering the Future with {companyName}
                  </h2>

                  <p className="text-sm text-zinc-400 max-w-xl mx-auto">
                    {tagline}. Engineered for enterprise scale, effortless motion, and world-class
                    creative intelligence.
                  </p>

                  {/* Interactive Hero Emblem Banner */}
                  <div className="pt-4 flex justify-center">
                    <div className="w-64 h-40 md:w-80 md:h-52 rounded-2xl bg-zinc-950/80 border border-zinc-800 shadow-2xl p-3 flex items-center justify-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-radial from-indigo-500/10 via-transparent to-transparent"></div>
                      {activeAssetType === 'video' && activeVideo ? (
                        <video
                          src={activeVideo.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-contain relative z-10"
                        />
                      ) : activeLogo ? (
                        <img
                          src={activeLogo.imageUrl}
                          alt="Logo Hero"
                          className="w-full h-full object-contain relative z-10"
                        />
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Mobile App Mockup */}
            {selectedMockup === 'app' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 animate-fade-in">
                {/* Phone 1: App Icon on Home Screen */}
                <div className="w-64 h-[440px] rounded-[42px] bg-zinc-900 border-4 border-zinc-700 shadow-2xl p-4 flex flex-col justify-between relative overflow-hidden bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px]">
                  {/* Dynamic Island */}
                  <div className="w-24 h-4 bg-black rounded-full mx-auto"></div>

                  {/* App Grid */}
                  <div className="grid grid-cols-4 gap-3 my-auto pt-6">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-11 h-11 rounded-xl bg-zinc-950 border border-cyan-500/40 p-1 shadow-lg flex items-center justify-center overflow-hidden">
                        {activeAssetType === 'video' && activeVideo ? (
                          <video
                            src={activeVideo.videoUrl}
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="w-full h-full object-contain"
                          />
                        ) : activeLogo ? (
                          <img
                            src={activeLogo.imageUrl}
                            alt="App Icon"
                            className="w-full h-full object-contain"
                          />
                        ) : null}
                      </div>
                      <span className="text-[10px] text-white font-medium truncate max-w-[50px]">
                        {companyName}
                      </span>
                    </div>

                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div key={i} className="flex flex-col items-center gap-1 opacity-40">
                        <div className="w-11 h-11 rounded-xl bg-zinc-800"></div>
                        <span className="text-[9px] text-zinc-500">App</span>
                      </div>
                    ))}
                  </div>

                  {/* Dock */}
                  <div className="p-2.5 rounded-2xl bg-zinc-800/60 backdrop-blur border border-zinc-700/50 flex justify-around">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-9 h-9 rounded-xl bg-zinc-700/60"></div>
                    ))}
                  </div>
                </div>

                {/* Phone 2: Splash Launch Screen with Motion Logo */}
                <div className="w-64 h-[440px] rounded-[42px] bg-zinc-950 border-4 border-zinc-700 shadow-2xl p-5 flex flex-col items-center justify-between relative overflow-hidden text-center">
                  <div className="w-24 h-4 bg-black rounded-full mx-auto"></div>

                  <div className="space-y-4 my-auto">
                    <div className="w-28 h-28 mx-auto rounded-3xl bg-zinc-900 border border-zinc-800 p-2 shadow-2xl flex items-center justify-center overflow-hidden">
                      {activeAssetType === 'video' && activeVideo ? (
                        <video
                          src={activeVideo.videoUrl}
                          autoPlay
                          loop
                          muted
                          playsInline
                          className="w-full h-full object-contain"
                        />
                      ) : activeLogo ? (
                        <img
                          src={activeLogo.imageUrl}
                          alt="Splash Logo"
                          className="w-full h-full object-contain"
                        />
                      ) : null}
                    </div>
                    <div>
                      <h4 className="text-base font-extrabold text-white">{companyName}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{tagline}</p>
                    </div>
                  </div>

                  <div className="w-28 h-1 bg-zinc-800 rounded-full mx-auto"></div>
                </div>
              </div>
            )}

            {/* 3. Luxury Business Card Mockup */}
            {selectedMockup === 'card' && (
              <div className="w-full max-w-xl aspect-[1.75/1] rounded-2xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl p-8 md:p-10 flex flex-col justify-between relative overflow-hidden animate-fade-in group">
                <div className="absolute top-0 right-0 w-72 h-72 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none"></div>

                <div className="flex items-start justify-between">
                  <div className="w-16 h-16 rounded-xl bg-zinc-950/80 border border-zinc-800 p-2 shadow-lg flex items-center justify-center overflow-hidden">
                    {activeAssetType === 'video' && activeVideo ? (
                      <video
                        src={activeVideo.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : activeLogo ? (
                      <img
                        src={activeLogo.imageUrl}
                        alt="Card Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : null}
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest text-zinc-500 font-mono">Founders Edition</p>
                    <p className="text-xs font-mono text-amber-400/80 mt-1">№ 0029-2026</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">{companyName}</h3>
                  <p className="text-xs text-zinc-400 mt-1">{tagline}</p>
                  <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                    <span>contact@{companyName.toLowerCase().replace(/\s+/g, '')}.io</span>
                    <span>San Francisco • Tokyo</span>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Apparel / Merchandise Mockup */}
            {selectedMockup === 'merch' && (
              <div className="flex flex-col md:flex-row items-center justify-center gap-8 animate-fade-in">
                {/* Dark Cotton T-Shirt */}
                <div className="w-72 h-80 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl flex flex-col items-center justify-center relative p-6">
                  <span className="absolute top-3 left-3 text-[10px] font-mono text-zinc-500 uppercase">
                    Heavyweight Noir Tee
                  </span>
                  {/* T-Shirt Neck outline visual */}
                  <div className="w-20 h-6 border-b-2 border-zinc-700/60 rounded-full mb-6"></div>

                  {/* Chest Logo Stamp */}
                  <div className="w-24 h-24 rounded-xl bg-black/40 border border-zinc-800/60 p-2 shadow-inner flex items-center justify-center overflow-hidden">
                    {activeAssetType === 'video' && activeVideo ? (
                      <video
                        src={activeVideo.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : activeLogo ? (
                      <img
                        src={activeLogo.imageUrl}
                        alt="Merch Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : null}
                  </div>
                  <p className="text-xs font-bold text-zinc-400 mt-4 tracking-wider uppercase">
                    {companyName}
                  </p>
                </div>

                {/* Light Ivory Studio Tee */}
                <div className="w-72 h-80 rounded-2xl bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-xl flex flex-col items-center justify-center relative p-6">
                  <span className="absolute top-3 left-3 text-[10px] font-mono text-zinc-500 uppercase">
                    Organic Ivory Edition
                  </span>
                  <div className="w-20 h-6 border-b-2 border-zinc-300 rounded-full mb-6"></div>

                  <div className="w-24 h-24 rounded-xl bg-white border border-zinc-200 p-2 shadow-sm flex items-center justify-center overflow-hidden">
                    {activeAssetType === 'video' && activeVideo ? (
                      <video
                        src={activeVideo.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : activeLogo ? (
                      <img
                        src={activeLogo.imageUrl}
                        alt="Merch Logo Light"
                        className="w-full h-full object-contain"
                      />
                    ) : null}
                  </div>
                  <p className="text-xs font-bold text-zinc-800 mt-4 tracking-wider uppercase">
                    {companyName}
                  </p>
                </div>
              </div>
            )}

            {/* 5. Social Media Kit */}
            {selectedMockup === 'social' && (
              <div className="w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl animate-fade-in">
                {/* Banner */}
                <div className="h-32 bg-gradient-to-r from-indigo-900 via-fuchsia-950 to-zinc-950 relative flex items-center justify-end px-6">
                  <span className="text-xs font-mono text-zinc-400/80">Official Profile</span>
                </div>

                {/* Avatar overlapping */}
                <div className="px-6 pb-6 pt-0 relative">
                  <div className="-mt-12 w-24 h-24 rounded-2xl bg-zinc-950 border-4 border-zinc-900 shadow-xl p-1.5 flex items-center justify-center overflow-hidden">
                    {activeAssetType === 'video' && activeVideo ? (
                      <video
                        src={activeVideo.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    ) : activeLogo ? (
                      <img
                        src={activeLogo.imageUrl}
                        alt="Avatar Logo"
                        className="w-full h-full object-contain"
                      />
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-start justify-between">
                    <div>
                      <h4 className="text-lg font-bold text-white">{companyName}</h4>
                      <p className="text-xs text-zinc-400">@{companyName.toLowerCase().replace(/\s+/g, '')}</p>
                      <p className="text-xs text-zinc-300 mt-2">{tagline}</p>
                    </div>
                    <button className="px-4 py-1.5 rounded-full bg-white text-zinc-950 font-bold text-xs">
                      Follow
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
