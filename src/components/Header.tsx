import React from 'react';
import { Film, Palette, Layers, History, Sparkles, Wand2 } from 'lucide-react';

interface HeaderProps {
  activeTab: 'designer' | 'animator' | 'mockups' | 'history';
  setActiveTab: (tab: 'designer' | 'animator' | 'mockups' | 'history') => void;
  historyCount: number;
  hasActiveLogo: boolean;
  hasActiveVideo: boolean;
  onResetNew: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
  hasActiveLogo,
  hasActiveVideo,
  onResetNew,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur-md px-4 lg:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center justify-between w-full md:w-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-[1.5px] shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">LogoMotion</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 border border-cyan-500/30 text-cyan-300">
                  AI Studio
                </span>
              </div>
              <p className="text-xs text-zinc-400">Gemini 3 Pro (1K–4K) &amp; Veo Video Motion</p>
            </div>
          </div>

          <button
            onClick={onResetNew}
            className="md:hidden text-xs text-zinc-400 hover:text-white px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900"
          >
            New Project
          </button>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center bg-zinc-900/90 border border-zinc-800 rounded-xl p-1 gap-1 overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('designer')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'designer'
                ? 'bg-zinc-800 text-white shadow-sm shadow-black/50 border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Palette className="w-4 h-4 text-cyan-400" />
            <span>1. Design Logo</span>
            {hasActiveLogo && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
          </button>

          <button
            onClick={() => setActiveTab('animator')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'animator'
                ? 'bg-zinc-800 text-white shadow-sm shadow-black/50 border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Film className="w-4 h-4 text-fuchsia-400" />
            <span>2. Animate with Veo</span>
            {hasActiveVideo && <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400 animate-pulse"></span>}
          </button>

          <button
            onClick={() => setActiveTab('mockups')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'mockups'
                ? 'bg-zinc-800 text-white shadow-sm shadow-black/50 border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>3. Brand Mockups</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-zinc-800 text-white shadow-sm shadow-black/50 border border-zinc-700/60'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
            }`}
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>Archive</span>
            {historyCount > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-zinc-700 text-zinc-300">
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right side actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={onResetNew}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 transition"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>New Brand</span>
          </button>
        </div>
      </div>
    </header>
  );
};
