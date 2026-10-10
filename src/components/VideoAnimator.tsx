import React, { useState, useEffect, useRef } from 'react';
import {
  Film,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Download,
  Layers,
  Sparkles,
  Zap,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileVideo,
  Split,
  ChevronRight,
  Maximize2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { GeneratedLogo, VideoAspectRatio, VideoResolution, AnimatedVideo } from '../types';
import { MOTION_PRESETS, MotionPreset } from '../data/presets';

interface VideoAnimatorProps {
  activeLogo: GeneratedLogo | null;
  onVideoCreated: (video: AnimatedVideo) => void;
  onSendToMockups: (video: AnimatedVideo) => void;
  activeVideo: AnimatedVideo | null;
}

export const VideoAnimator: React.FC<VideoAnimatorProps> = ({
  activeLogo,
  onVideoCreated,
  onSendToMockups,
  activeVideo,
}) => {
  // Source Image state (Logo from Step 1 OR Uploaded Photo)
  const [sourceType, setSourceType] = useState<'logo' | 'upload'>(
    activeLogo ? 'logo' : 'upload'
  );
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // The active image being animated
  const currentSourceImage =
    sourceType === 'logo' && activeLogo
      ? activeLogo.imageUrl
      : uploadedImage || (activeLogo ? activeLogo.imageUrl : null);

  // Video configuration
  // Requirement: model veo-3.1-fast-generate-preview, aspect ratio 16:9 or 9:16
  const [aspectRatio, setAspectRatio] = useState<VideoAspectRatio>('16:9');
  const [resolution, setResolution] = useState<VideoResolution>('720p');

  // Motion Style
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MOTION_PRESETS[0].id);
  const [customMotionPrompt, setCustomMotionPrompt] = useState<string>(MOTION_PRESETS[0].prompt);

  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [generationPhase, setGenerationPhase] = useState<string>('Initializing Veo engine...');
  const [pollCount, setPollCount] = useState<number>(0);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Comparison view toggle
  const [showComparison, setShowComparison] = useState<boolean>(false);

  // Video Player Controls
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(true);

  // Reassuring status messages for Veo generation
  const reassuringMessages = [
    'Initializing Veo 3.1 Fast video synthesis model...',
    'Analyzing logo geometry and optical contours...',
    'Synthesizing continuous 3D camera trajectory...',
    'Generating fluid particle dynamics & light sweeps...',
    'Rendering temporal motion coherence and physics passes...',
    'Finalizing video frames and H.264 stream encoding...',
    'Packaging high-definition video output...',
  ];

  // Preset selection handler
  const handleSelectPreset = (preset: MotionPreset) => {
    setSelectedPresetId(preset.id);
    setCustomMotionPrompt(preset.prompt);
  };

  // Upload handler for photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setUploadedImage(event.target.result);
        setSourceType('upload');
        setErrorMessage(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Drag-and-drop support
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setUploadedImage(event.target.result);
          setSourceType('upload');
          setErrorMessage(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Elapsed timer during generation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Rotate reassuring message
  useEffect(() => {
    if (isGenerating) {
      const msgIndex = Math.min(
        Math.floor(elapsedSeconds / 6),
        reassuringMessages.length - 1
      );
      setGenerationPhase(reassuringMessages[msgIndex]);
    }
  }, [elapsedSeconds, isGenerating]);

  // Main video generation kick-off
  const handleStartGeneration = async () => {
    if (!currentSourceImage) {
      setErrorMessage('Please select or upload a logo image to animate.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setOperationName(null);
    setPollCount(0);
    setElapsedSeconds(0);

    try {
      // 1. Kick off Veo generation
      const res = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: currentSourceImage,
          prompt: customMotionPrompt,
          aspectRatio, // 16:9 or 9:16
          resolution, // 720p or 1080p
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to start video generation');
      }

      const data = await res.json();
      const opName = data.operationName;
      setOperationName(opName);

      // 2. Poll until complete
      pollVideoOperation(opName);
    } catch (err: any) {
      console.error(err);
      setIsGenerating(false);
      setErrorMessage(
        err.message || 'Failed to initiate video generation with Veo. Please check API key.'
      );
    }
  };

  // Polling loop
  const pollVideoOperation = (opName: string) => {
    const pollInterval = setInterval(async () => {
      try {
        setPollCount((c) => c + 1);
        const statusRes = await fetch('/api/video-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operationName: opName }),
        });

        if (!statusRes.ok) {
          const errData = await statusRes.json().catch(() => ({}));
          throw new Error(errData.error || 'Failed to check video status');
        }

        const statusData = await statusRes.json();

        if (statusData.error) {
          clearInterval(pollInterval);
          setIsGenerating(false);
          setErrorMessage(statusData.error.message || 'Veo video generation reported an error.');
          return;
        }

        if (statusData.done) {
          clearInterval(pollInterval);
          setGenerationPhase('Downloading generated video stream...');
          downloadAndFinalizeVideo(opName);
        }
      } catch (err: any) {
        console.error('Polling error:', err);
        // continue polling up to limit unless fatal
      }
    }, 4000);
  };

  // Download video stream once complete
  const downloadAndFinalizeVideo = async (opName: string) => {
    try {
      const dlRes = await fetch('/api/video-download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ operationName: opName }),
      });

      if (!dlRes.ok) {
        const errData = await dlRes.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to retrieve video file');
      }

      const blob = await dlRes.blob();
      const videoObjectUrl = URL.createObjectURL(blob);

      const activePreset = MOTION_PRESETS.find((p) => p.id === selectedPresetId);

      const newVideo: AnimatedVideo = {
        id: `video-${Date.now()}`,
        timestamp: Date.now(),
        sourceLogoId: activeLogo?.id,
        sourceImageUrl: currentSourceImage!,
        videoUrl: videoObjectUrl,
        aspectRatio,
        resolution,
        prompt: customMotionPrompt,
        motionPresetTitle: activePreset?.name || 'Custom Motion',
      };

      onVideoCreated(newVideo);
      setIsGenerating(false);
    } catch (err: any) {
      console.error(err);
      setIsGenerating(false);
      setErrorMessage(err.message || 'Failed to download animated video.');
    }
  };

  // Player controls
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play();
    setIsPlaying(true);
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleDownloadMp4 = () => {
    if (!activeVideo) return;
    const link = document.createElement('a');
    link.href = activeVideo.videoUrl;
    link.download = `animated-logo-${activeVideo.aspectRatio.replace(':', 'x')}.mp4`;
    link.click();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Step Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-fuchsia-400 text-xs font-semibold tracking-wider uppercase mb-1">
            <Film className="w-4 h-4" />
            <span>Step 2 of 2 • Veo Video Motion Animation</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Bring Your Logo to Life with Cinematic Motion
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
            Transform any static logo or uploaded photo into high-definition motion video using{' '}
            <strong className="text-fuchsia-400">veo-3.1-fast-generate-preview</strong> in{' '}
            <strong className="text-zinc-200">16:9 Landscape</strong> or{' '}
            <strong className="text-zinc-200">9:16 Portrait</strong>.
          </p>
        </div>

        {activeVideo && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSendToMockups(activeVideo)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs text-white font-medium transition"
            >
              <Layers className="w-4 h-4 text-amber-400" />
              <span>Preview in Brand Mockups</span>
            </button>
            <button
              onClick={handleDownloadMp4}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 text-xs text-white font-bold transition shadow-lg shadow-fuchsia-950/40"
            >
              <Download className="w-4 h-4" />
              <span>Download MP4</span>
            </button>
          </div>
        )}
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-red-200">Video Generation Notice</p>
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

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Animator Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Image Source Selection (Use Generated Logo OR Upload Photo) */}
          <div className="p-5 md:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileVideo className="w-4 h-4 text-fuchsia-400" />
                <span>1. Select Starting Image (Logo or Upload)</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-normal">
                Veo starting frame
              </span>
            </h2>

            {/* Source switch pills */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-zinc-950 border border-zinc-800">
              <button
                type="button"
                onClick={() => setSourceType('logo')}
                disabled={!activeLogo}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 ${
                  sourceType === 'logo'
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200 disabled:opacity-40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Current Designed Logo</span>
                {activeLogo && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
              </button>

              <button
                type="button"
                onClick={() => setSourceType('upload')}
                className={`py-2 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-2 ${
                  sourceType === 'upload'
                    ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-fuchsia-400" />
                <span>Upload Photo / Logo</span>
                {uploadedImage && <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>}
              </button>
            </div>

            {/* Source Display / Upload Box */}
            {sourceType === 'logo' && activeLogo ? (
              <div className="flex items-center gap-4 p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-zinc-800 p-1 shrink-0 overflow-hidden">
                  <img
                    src={activeLogo.imageUrl}
                    alt={activeLogo.companyName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white truncate">{activeLogo.companyName}</h4>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      {activeLogo.imageSize}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 truncate mt-0.5">{activeLogo.style} style</p>
                  <p className="text-[11px] text-zinc-500 font-mono mt-1">Ready for motion synthesis</p>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              </div>
            ) : sourceType === 'upload' ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition ${
                  uploadedImage
                    ? 'border-fuchsia-500/50 bg-fuchsia-950/10'
                    : 'border-zinc-700 hover:border-zinc-500 bg-zinc-950/60'
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                />

                {uploadedImage ? (
                  <div className="flex items-center gap-4 text-left">
                    <div className="w-16 h-16 rounded-lg bg-zinc-900 border border-zinc-800 p-1 shrink-0 overflow-hidden">
                      <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {uploadedFileName || 'Uploaded Photo Logo'}
                      </p>
                      <p className="text-[11px] text-fuchsia-400 mt-0.5">Click to choose a different photo</p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
                      Replace
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2 py-2">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 text-fuchsia-400 mx-auto flex items-center justify-center">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-200">
                        Drop your company photo/logo here, or <span className="text-fuchsia-400">browse</span>
                      </p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">
                        Supports PNG, JPG, WEBP. Transparent or solid backdrops work great.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-center text-xs text-zinc-400">
                No logo created yet. Either switch to the{' '}
                <button
                  onClick={() => setSourceType('upload')}
                  className="text-fuchsia-400 underline font-medium"
                >
                  Upload Photo
                </button>{' '}
                option, or generate one in Step 1.
              </div>
            )}
          </div>

          {/* Section 2: Aspect Ratio & Resolution (CRITICAL REQUIREMENT: 16:9 and 9:16) */}
          <div className="p-5 md:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-fuchsia-400" />
                <span>2. Video Aspect Ratio &amp; Format</span>
              </h2>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                model: veo-3.1-fast-generate-preview
              </span>
            </div>

            {/* Requirement: 16:9 (landscape) or 9:16 (portrait) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 16:9 Landscape Card */}
              <button
                type="button"
                onClick={() => setAspectRatio('16:9')}
                className={`p-4 rounded-xl border text-left transition flex items-start gap-3 relative ${
                  aspectRatio === '16:9'
                    ? 'bg-fuchsia-950/30 border-fuchsia-500 text-white shadow-md shadow-fuchsia-950/40'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {aspectRatio === '16:9' && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-fuchsia-400"></span>
                )}
                <div className="w-12 h-8 rounded-md bg-zinc-800 border border-zinc-700 shrink-0 flex items-center justify-center text-[10px] font-mono text-zinc-300">
                  16:9
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    16:9 Widescreen (Landscape)
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Ideal for YouTube, Website Hero Banners, Presentations, Video intros
                  </p>
                </div>
              </button>

              {/* 9:16 Portrait Card */}
              <button
                type="button"
                onClick={() => setAspectRatio('9:16')}
                className={`p-4 rounded-xl border text-left transition flex items-start gap-3 relative ${
                  aspectRatio === '9:16'
                    ? 'bg-fuchsia-950/30 border-fuchsia-500 text-white shadow-md shadow-fuchsia-950/40'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {aspectRatio === '9:16' && (
                  <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-fuchsia-400"></span>
                )}
                <div className="w-8 h-12 rounded-md bg-zinc-800 border border-zinc-700 shrink-0 flex items-center justify-center text-[10px] font-mono text-zinc-300">
                  9:16
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    9:16 Vertical (Portrait)
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    Ideal for TikTok, Instagram Reels, YouTube Shorts, Mobile Splash
                  </p>
                </div>
              </button>
            </div>

            {/* Resolution selector */}
            <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-300">Resolution:</span>
              <div className="flex items-center gap-2">
                {(['720p', '1080p'] as VideoResolution[]).map((res) => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResolution(res)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium font-mono transition ${
                      resolution === res
                        ? 'bg-zinc-800 text-white border border-zinc-600'
                        : 'bg-zinc-950 text-zinc-500 border border-zinc-800 hover:text-zinc-300'
                    }`}
                  >
                    {res} {res === '720p' ? '(Fast)' : '(Full HD)'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Motion Styles & Physics Presets */}
          <div className="p-5 md:p-6 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
              <Zap className="w-4 h-4 text-fuchsia-400" />
              <span>3. Motion Aesthetics &amp; Dynamics</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {MOTION_PRESETS.map((preset) => {
                const isSelected = selectedPresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-zinc-800/90 border-fuchsia-500/70 text-white shadow-sm'
                        : 'bg-zinc-950 border-zinc-800/90 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5 ${
                        isSelected ? 'bg-fuchsia-500/20 text-fuchsia-400' : 'bg-zinc-900 text-zinc-500'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white flex items-center justify-between">
                        <span>{preset.name}</span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-tight mt-0.5 line-clamp-2">
                        {preset.tagline}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Motion Prompt Textarea */}
            <div className="pt-2 border-t border-zinc-800/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-zinc-300">
                  Motion Prompt for Veo (Fully Customizable)
                </label>
                <span className="text-[11px] text-zinc-500">Camera, lights, physics</span>
              </div>
              <textarea
                rows={3}
                value={customMotionPrompt}
                onChange={(e) => setCustomMotionPrompt(e.target.value)}
                placeholder="Describe exact camera orbit, lighting flares, particle assembly..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-fuchsia-500/70 focus:ring-1 focus:ring-fuchsia-500/70 transition"
              />
            </div>
          </div>

          {/* Generate Video Action Button */}
          <button
            type="button"
            onClick={handleStartGeneration}
            disabled={isGenerating || !currentSourceImage}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-fuchsia-600 via-purple-600 to-indigo-600 hover:from-fuchsia-500 hover:via-purple-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-fuchsia-950/40 flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed group cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Generating Animated Video with Veo ({elapsedSeconds}s)...</span>
              </>
            ) : (
              <>
                <Film className="w-5 h-5 text-fuchsia-200 group-hover:scale-110 transition-transform" />
                <span>
                  Generate Animated Logo Video ({aspectRatio} • {resolution})
                </span>
              </>
            )}
          </button>
        </div>

        {/* Right Column: Live Video Player & Loading Status (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-20 p-5 md:p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between pb-3.5 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">Animated Motion Output</span>
                {activeVideo && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">
                    {activeVideo.aspectRatio}
                  </span>
                )}
              </div>

              {activeVideo && (
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition ${
                    showComparison
                      ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:text-white'
                  }`}
                >
                  <Split className="w-3.5 h-3.5" />
                  <span>{showComparison ? 'Video Only' : 'Compare Static'}</span>
                </button>
              )}
            </div>

            {/* Viewport: Generating State, Video Player, or Empty State */}
            <div
              className={`relative mt-4 rounded-xl bg-zinc-950 border border-zinc-800/80 overflow-hidden flex items-center justify-center ${
                aspectRatio === '9:16' ? 'aspect-[9/16] max-h-[550px]' : 'aspect-video'
              }`}
            >
              {isGenerating ? (
                /* Reassuring Loading Screen */
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-5 max-w-sm">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-2 border-fuchsia-500/20 animate-ping"></div>
                    <div className="w-20 h-20 rounded-full border-2 border-fuchsia-400 border-t-transparent animate-spin"></div>
                    <Film className="w-8 h-8 text-fuchsia-400 absolute inset-0 m-auto animate-pulse" />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-center gap-2 text-xs font-bold text-fuchsia-300">
                      <Clock className="w-3.5 h-3.5 text-fuchsia-400 animate-spin" />
                      <span>Veo Synthesis in Progress • {elapsedSeconds}s</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white px-2 leading-snug">
                      {generationPhase}
                    </h4>
                    <p className="text-[11px] text-zinc-500">
                      Neural video generation computes fluid frame-by-frame coherence. This takes ~30–60
                      seconds.
                    </p>
                  </div>

                  {/* Visual Progress pulse bar */}
                  <div className="w-full bg-zinc-850 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(95, Math.max(15, (elapsedSeconds / 45) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              ) : activeVideo ? (
                /* Active Video Output */
                showComparison ? (
                  /* Side-by-side / split comparison */
                  <div className="w-full h-full grid grid-cols-2 gap-1 bg-zinc-950 p-1">
                    <div className="relative rounded-lg bg-zinc-900 overflow-hidden flex flex-col items-center justify-center p-2">
                      <span className="absolute top-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/70 text-zinc-300 z-10">
                        Original Static
                      </span>
                      <img
                        src={activeVideo.sourceImageUrl}
                        alt="Original"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="relative rounded-lg bg-zinc-900 overflow-hidden flex flex-col items-center justify-center">
                      <span className="absolute top-2 left-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-fuchsia-500/80 text-white z-10">
                        Veo Motion
                      </span>
                      <video
                        src={activeVideo.videoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  /* Full Video Player */
                  <div className="relative w-full h-full flex items-center justify-center bg-black group">
                    <video
                      ref={videoRef}
                      src={activeVideo.videoUrl}
                      autoPlay
                      loop={isLooping}
                      muted={isMuted}
                      playsInline
                      onPlay={() => setIsPlaying(true)}
                      onPause={() => setIsPlaying(false)}
                      className="w-full h-full object-contain"
                    />

                    {/* Overlay Player Controls */}
                    <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={togglePlay}
                          className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-white"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={handleRestart}
                          className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-white"
                          title="Restart"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setIsLooping(!isLooping)}
                          className={`px-2 py-1 rounded text-[11px] font-mono ${
                            isLooping ? 'bg-fuchsia-600 text-white' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          Loop
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Speed toggles */}
                        <div className="flex items-center bg-zinc-850 rounded p-0.5 text-[10px]">
                          {[0.5, 1, 1.5].map((s) => (
                            <button
                              key={s}
                              onClick={() => handleSpeedChange(s)}
                              className={`px-1.5 py-0.5 rounded ${
                                playbackSpeed === s ? 'bg-zinc-700 text-white font-bold' : 'text-zinc-400'
                              }`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={() => setIsMuted(!isMuted)}
                          className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-white"
                        >
                          {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                /* Empty Ready State */
                <div className="flex flex-col items-center justify-center p-8 text-center text-zinc-500 space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                    <Film className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-zinc-400">Ready to Animate</p>
                    <p className="text-xs text-zinc-500 max-w-xs mt-1">
                      Choose motion style on the left and click "Generate Animated Logo Video".
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Video Details Card & CTAs */}
            {activeVideo && (
              <div className="mt-5 space-y-4">
                <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{activeVideo.motionPresetTitle}</span>
                    <span className="text-[11px] text-fuchsia-400 font-mono">
                      {activeVideo.aspectRatio} • {activeVideo.resolution}
                    </span>
                  </div>
                  <p className="text-zinc-400 line-clamp-2 italic">"{activeVideo.prompt}"</p>
                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-900 text-[11px] text-zinc-500 font-mono">
                    <span>Generated via veo-3.1-fast-generate-preview</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSendToMockups(activeVideo)}
                    className="py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <Layers className="w-4 h-4 text-amber-400" />
                    <span>See Brand Mockups</span>
                  </button>

                  <button
                    onClick={handleDownloadMp4}
                    className="py-3 px-3 rounded-xl bg-gradient-to-r from-fuchsia-600 to-indigo-600 hover:from-fuchsia-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition shadow"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download MP4</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
