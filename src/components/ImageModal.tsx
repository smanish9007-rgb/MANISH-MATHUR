import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, Check, Sun, Moon } from 'lucide-react';
import { GeneratedLogo } from '../types';

interface ImageModalProps {
  logo: GeneratedLogo | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ logo, onClose }) => {
  const [scale, setScale] = useState(1);
  const [bgMode, setBgMode] = useState<'dark' | 'light' | 'checkered'>('dark');
  const [copied, setCopied] = useState(false);

  if (!logo) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = logo.imageUrl;
    link.download = `${logo.companyName.toLowerCase().replace(/\s+/g, '-')}-logo-${logo.imageSize}.png`;
    link.click();
  };

  const handleCopy = async () => {
    try {
      const res = await fetch(logo.imageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: copy data url string
      await navigator.clipboard.writeText(logo.imageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">{logo.companyName} Logo Inspection</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  {logo.imageSize} Resolution
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                  {logo.aspectRatio} Aspect
                </span>
                <span className="text-[11px] text-zinc-400 capitalize">{logo.style}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Background switcher */}
            <div className="flex items-center bg-zinc-850 border border-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => setBgMode('dark')}
                title="Dark backdrop"
                className={`p-1.5 rounded ${bgMode === 'dark' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setBgMode('light')}
                title="Light backdrop"
                className={`p-1.5 rounded ${bgMode === 'light' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setBgMode('checkered')}
                title="Checkerboard transparency"
                className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${bgMode === 'checkered' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Grid
              </button>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center bg-zinc-850 border border-zinc-800 rounded-lg p-0.5">
              <button
                onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}
                className="p-1.5 text-zinc-400 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs px-1 text-zinc-300 font-mono">{Math.round(scale * 100)}%</span>
              <button
                onClick={() => setScale((s) => Math.min(3, s + 0.25))}
                className="p-1.5 text-zinc-400 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1.5 font-medium transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Preview Canvas */}
        <div
          className={`relative flex-1 overflow-auto p-8 flex items-center justify-center min-h-[350px] transition-colors ${
            bgMode === 'dark'
              ? 'bg-zinc-950'
              : bgMode === 'light'
              ? 'bg-zinc-100'
              : 'bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] bg-zinc-900'
          }`}
        >
          <img
            src={logo.imageUrl}
            alt={`${logo.companyName} Logo Preview`}
            style={{ transform: `scale(${scale})` }}
            className="max-h-[60vh] max-w-full object-contain drop-shadow-2xl rounded-lg transition-transform duration-150 origin-center select-none"
          />
        </div>

        {/* Bottom Details Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-zinc-950/70 text-xs text-zinc-400 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div className="truncate max-w-2xl">
            <span className="font-medium text-zinc-300">Prompt:</span> {logo.prompt}
          </div>
          <div className="text-[11px] text-zinc-500 whitespace-nowrap">
            Generated via Gemini 3 Pro Image ({logo.imageSize})
          </div>
        </div>
      </div>
    </div>
  );
};
