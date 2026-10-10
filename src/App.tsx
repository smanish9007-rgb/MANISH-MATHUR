import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LogoDesigner } from './components/LogoDesigner';
import { VideoAnimator } from './components/VideoAnimator';
import { MockupStudio } from './components/MockupStudio';
import { HistoryDrawer } from './components/HistoryDrawer';
import { ImageModal } from './components/ImageModal';
import { GeneratedLogo, AnimatedVideo } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'designer' | 'animator' | 'mockups' | 'history'>('designer');

  // Active items
  const [activeLogo, setActiveLogo] = useState<GeneratedLogo | null>(null);
  const [activeVideo, setActiveVideo] = useState<AnimatedVideo | null>(null);

  // Inspection modal
  const [inspectLogo, setInspectLogo] = useState<GeneratedLogo | null>(null);

  // History vaults
  const [logosHistory, setLogosHistory] = useState<GeneratedLogo[]>([]);
  const [videosHistory, setVideosHistory] = useState<AnimatedVideo[]>([]);

  // Load history from localStorage on initial mount
  useEffect(() => {
    try {
      const savedLogos = localStorage.getItem('logomotion_logos');
      if (savedLogos) {
        const parsed = JSON.parse(savedLogos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setLogosHistory(parsed);
          setActiveLogo(parsed[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load saved logos:', e);
    }

    try {
      const savedVideos = localStorage.getItem('logomotion_videos');
      if (savedVideos) {
        const parsed = JSON.parse(savedVideos);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setVideosHistory(parsed);
          setActiveVideo(parsed[0]);
        }
      }
    } catch (e) {
      console.warn('Failed to load saved videos:', e);
    }
  }, []);

  // Save logos history
  const handleLogoGenerated = (logo: GeneratedLogo) => {
    setActiveLogo(logo);
    setLogosHistory((prev) => {
      const updated = [logo, ...prev.filter((l) => l.id !== logo.id)];
      try {
        localStorage.setItem('logomotion_logos', JSON.stringify(updated.slice(0, 20)));
      } catch (err) {
        console.warn('Could not persist to localStorage:', err);
      }
      return updated;
    });
  };

  // Video generated
  const handleVideoCreated = (video: AnimatedVideo) => {
    setActiveVideo(video);
    setVideosHistory((prev) => {
      const updated = [video, ...prev.filter((v) => v.id !== video.id)];
      try {
        localStorage.setItem('logomotion_videos', JSON.stringify(updated.slice(0, 10)));
      } catch (err) {
        console.warn('Could not persist to localStorage:', err);
      }
      return updated;
    });
  };

  // Switch to animator with current logo
  const handleSendToAnimator = (logo: GeneratedLogo) => {
    setActiveLogo(logo);
    setActiveTab('animator');
  };

  // Switch to mockups
  const handleSendToMockupsLogo = (logo: GeneratedLogo) => {
    setActiveLogo(logo);
    setActiveTab('mockups');
  };

  const handleSendToMockupsVideo = (video: AnimatedVideo) => {
    setActiveVideo(video);
    setActiveTab('mockups');
  };

  // Reset to start a new project
  const handleResetNew = () => {
    setActiveLogo(null);
    setActiveVideo(null);
    setActiveTab('designer');
  };

  // Clear history
  const handleClearHistory = () => {
    setLogosHistory([]);
    setVideosHistory([]);
    try {
      localStorage.removeItem('logomotion_logos');
      localStorage.removeItem('logomotion_videos');
    } catch (e) {
      console.warn(e);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        historyCount={logosHistory.length + videosHistory.length}
        hasActiveLogo={Boolean(activeLogo)}
        hasActiveVideo={Boolean(activeVideo)}
        onResetNew={handleResetNew}
      />

      {/* Main Content Areas */}
      <main className="flex-1 pb-16">
        {activeTab === 'designer' && (
          <LogoDesigner
            onLogoGenerated={handleLogoGenerated}
            onSendToAnimator={handleSendToAnimator}
            onSendToMockups={handleSendToMockupsLogo}
            activeLogo={activeLogo}
            onInspectImage={(logo) => setInspectLogo(logo)}
          />
        )}

        {activeTab === 'animator' && (
          <VideoAnimator
            activeLogo={activeLogo}
            onVideoCreated={handleVideoCreated}
            onSendToMockups={handleSendToMockupsVideo}
            activeVideo={activeVideo}
          />
        )}

        {activeTab === 'mockups' && (
          <MockupStudio
            activeLogo={activeLogo}
            activeVideo={activeVideo}
            onGoToDesigner={() => setActiveTab('designer')}
            onGoToAnimator={() => setActiveTab('animator')}
          />
        )}

        {activeTab === 'history' && (
          <HistoryDrawer
            logos={logosHistory}
            videos={videosHistory}
            onSelectLogo={(logo) => {
              setActiveLogo(logo);
              setActiveTab('designer');
            }}
            onSelectVideo={(video) => {
              setActiveVideo(video);
              setActiveTab('animator');
            }}
            onClearHistory={handleClearHistory}
            onInspectImage={(logo) => setInspectLogo(logo)}
          />
        )}
      </main>

      {/* Modal Inspector */}
      {inspectLogo && (
        <ImageModal logo={inspectLogo} onClose={() => setInspectLogo(null)} />
      )}

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/90 py-6 px-4 text-center text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-400">LogoMotion AI</span>
            <span>—</span>
            <span>gemini-3-pro-image-preview (1K–4K) &amp; veo-3.1-fast-generate-preview</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-500">
            <span>Aspect Ratios: 1:1, 16:9, 9:16</span>
            <span>•</span>
            <span>Full-Stack Powered</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
