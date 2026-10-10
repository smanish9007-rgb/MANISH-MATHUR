export type ImageSize = '1K' | '2K' | '4K';
export type LogoAspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
export type VideoAspectRatio = '16:9' | '9:16';
export type VideoResolution = '720p' | '1080p';

export interface LogoConcept {
  id: string;
  title: string;
  style: string;
  colorPalette: string[];
  iconDescription: string;
  imagePrompt: string;
  animationPrompt: string;
}

export interface BrainstormResult {
  brandSummary: string;
  taglineSuggestions: string[];
  concepts: LogoConcept[];
}

export interface GeneratedLogo {
  id: string;
  timestamp: number;
  companyName: string;
  tagline?: string;
  imageUrl: string;
  rawBase64?: string;
  mimeType: string;
  imageSize: ImageSize;
  aspectRatio: LogoAspectRatio;
  style: string;
  prompt: string;
  suggestedAnimationPrompt?: string;
}

export interface AnimatedVideo {
  id: string;
  timestamp: number;
  sourceLogoId?: string;
  sourceImageUrl: string;
  videoUrl: string; // Blob URL or base64
  aspectRatio: VideoAspectRatio;
  resolution: VideoResolution;
  prompt: string;
  motionPresetTitle: string;
}

export interface AnimationJob {
  operationName: string;
  status: 'pending' | 'processing' | 'downloading' | 'completed' | 'failed';
  progress: number;
  aspectRatio: VideoAspectRatio;
  resolution: VideoResolution;
  prompt: string;
  sourceImageUrl: string;
  error?: string;
}
