import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { LibraryView } from './components/LibraryView';
import { SavedRulesView } from './components/SavedRulesView';
import { AskAIView } from './components/AskAIView';
import { AddVideoView } from './components/AddVideoView';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { SetupModal } from './components/SetupModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { KnowledgeStore } from './services/knowledgeStore';
import { VideoItem, SystemStatus } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'add' | 'library' | 'rules' | 'ask'>('library');
  const [videos, setVideos] = useState<VideoItem[]>(() => KnowledgeStore.getLocalVideos());
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    gemini_connected: false,
    gemini_model: 'gemini-3.8-flash',
    supabase_connected: false,
    supabase_tables_ready: false,
    mode: 'prototype'
  });

  // Player modal state
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [seekTimestamp, setSeekTimestamp] = useState<number>(0);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);

  // Setup modal state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isInstallOpen, setIsInstallOpen] = useState(false);

  // Question prefill
  const [prefillQuestion, setPrefillQuestion] = useState('');

  // Initial health check
  const refreshStatus = async () => {
    const status = await KnowledgeStore.checkSystemStatus();
    setSystemStatus(status);
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  // Total rules count
  const rulesCount = useMemo(() => {
    return videos.reduce((acc, v) => acc + (v.rules?.length || 0), 0);
  }, [videos]);

  // Handlers
  const handleVideoAdded = (newVideo: VideoItem) => {
    const updated = KnowledgeStore.addVideo(newVideo);
    setVideos(updated);
  };

  const handleDeleteVideo = (id: string) => {
    if (confirm('Are you sure you want to delete this video and its extracted knowledge?')) {
      const updated = KnowledgeStore.deleteVideo(id);
      setVideos(updated);
    }
  };

  const handleResetSeed = () => {
    const reset = KnowledgeStore.resetToSeed();
    setVideos(reset);
  };

  const handleOpenVideo = (video: VideoItem, initialTimestampSeconds: number = 0) => {
    setSelectedVideo(video);
    setSeekTimestamp(initialTimestampSeconds);
    setIsPlayerOpen(true);
  };

  const handleNavigateToAsk = (prompt?: string) => {
    if (prompt) setPrefillQuestion(prompt);
    setActiveTab('ask');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-24 md:pb-8">
      
      {/* Offline Mode Banner */}
      <OfflineIndicator />

      {/* Mobile & Tablet App Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        systemStatus={systemStatus}
        openSetupModal={() => setIsSetupOpen(true)}
        openInstallModal={() => setIsInstallOpen(true)}
        videoCount={videos.length}
        rulesCount={rulesCount}
      />

      {/* Main View Container */}
      <main className="flex-1 w-full">
        {activeTab === 'library' && (
          <LibraryView
            videos={videos}
            onOpenVideo={handleOpenVideo}
            onDeleteVideo={handleDeleteVideo}
            onNavigateToAdd={() => setActiveTab('add')}
            onNavigateToAsk={handleNavigateToAsk}
          />
        )}

        {activeTab === 'rules' && (
          <SavedRulesView
            videos={videos}
            onOpenVideoAtTimestamp={handleOpenVideo}
          />
        )}

        {activeTab === 'ask' && (
          <AskAIView
            videos={videos}
            onOpenVideoAtTimestamp={handleOpenVideo}
            prefillQuery={prefillQuestion}
          />
        )}

        {activeTab === 'add' && (
          <AddVideoView
            onVideoAdded={handleVideoAdded}
            openPlayer={handleOpenVideo}
          />
        )}
      </main>

      {/* Interactive Video Player & Timestamp Hub Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        initialTimestampSeconds={seekTimestamp}
        isOpen={isPlayerOpen}
        onClose={() => {
          setIsPlayerOpen(false);
          setSelectedVideo(null);
        }}
      />

      {/* Supabase & Gemini Setup Guide Modal */}
      <SetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        systemStatus={systemStatus}
        refreshStatus={refreshStatus}
        videos={videos}
        onResetSeed={handleResetSeed}
      />

      {/* PWA Mobile Application Install Modal */}
      <PWAInstallModal
        isOpen={isInstallOpen}
        onClose={() => setIsInstallOpen(false)}
      />

    </div>
  );
}
