import React from 'react';
import {
  History,
  Download,
  Film,
  Sparkles,
  Trash2,
  ExternalLink,
  Layers,
  Clock,
} from 'lucide-react';
import { GeneratedLogo, AnimatedVideo } from '../types';

interface HistoryDrawerProps {
  logos: GeneratedLogo[];
  videos: AnimatedVideo[];
  onSelectLogo: (logo: GeneratedLogo) => void;
  onSelectVideo: (video: AnimatedVideo) => void;
  onClearHistory: () => void;
  onInspectImage: (logo: GeneratedLogo) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  logos,
  videos,
  onSelectLogo,
  onSelectVideo,
  onClearHistory,
  onInspectImage,
}) => {
  const totalCount = logos.length + videos.length;

  const downloadLogo = (logo: GeneratedLogo) => {
    const link = document.createElement('a');
    link.href = logo.imageUrl;
    link.download = `${logo.companyName.toLowerCase().replace(/\s+/g, '-')}-logo-${logo.imageSize}.png`;
    link.click();
  };

  const downloadVideo = (video: AnimatedVideo) => {
    const link = document.createElement('a');
    link.href = video.videoUrl;
    link.download = `animated-logo-${video.aspectRatio.replace(':', 'x')}.mp4`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <History className="w-4 h-4" />
            <span>Session Asset Vault</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Generated Logos &amp; Animated Motion Videos
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Revisit, compare, and download all company logos (1K–4K) and Veo motion videos generated during your session.
          </p>
        </div>

        {totalCount > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-medium transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {totalCount === 0 ? (
        <div className="p-12 rounded-3xl bg-zinc-900/40 border border-zinc-800 text-center space-y-3 max-w-md mx-auto my-12">
          <History className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No Saved Generations Yet</h3>
          <p className="text-xs text-zinc-500">
            Design a logo in Step 1 or animate in Step 2; your master assets will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Animated Videos Section */}
          {videos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Film className="w-4 h-4 text-fuchsia-400" />
                <h2 className="text-base font-bold text-white">Veo Motion Videos ({videos.length})</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((vid) => (
                  <div
                    key={vid.id}
                    className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden flex flex-col justify-between group hover:border-zinc-700 transition"
                  >
                    <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
                      <video
                        src={vid.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-fuchsia-300">
                        {vid.aspectRatio} • {vid.resolution}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{vid.motionPresetTitle}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(vid.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 line-clamp-2 italic">"{vid.prompt}"</p>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                        <button
                          onClick={() => onSelectVideo(vid)}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
                        >
                          <span>Load in Animator</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => downloadVideo(vid)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                          title="Download MP4"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Generated Logos Section */}
          {logos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h2 className="text-base font-bold text-white">Generated Logos ({logos.length})</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {logos.map((logo) => (
                  <div
                    key={logo.id}
                    className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden flex flex-col justify-between group hover:border-zinc-700 transition"
                  >
                    <div
                      onClick={() => onInspectImage(logo)}
                      className="relative aspect-square bg-zinc-950 p-4 flex items-center justify-center cursor-pointer overflow-hidden"
                    >
                      <img
                        src={logo.imageUrl}
                        alt={logo.companyName}
                        className="w-full h-full object-contain transition-transform group-hover:scale-105"
                      />
                      <span className="absolute top-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-black/70 text-cyan-300">
                        {logo.imageSize}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{logo.companyName}</span>
                        <span className="text-[10px] text-zinc-500 capitalize">{logo.style}</span>
                      </div>

                      <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                        <button
                          onClick={() => onSelectLogo(logo)}
                          className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                        >
                          Open in Studio
                        </button>
                        <button
                          onClick={() => downloadLogo(logo)}
                          className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                          title="Download PNG"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
