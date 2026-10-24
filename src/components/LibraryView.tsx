import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Play, 
  BookOpen, 
  ShieldCheck, 
  Code2, 
  Clock, 
  Trash2, 
  Tag, 
  Youtube, 
  FileVideo, 
  Plus,
  Sparkles,
  ExternalLink,
  FileText,
  Download,
  Check,
  Tablet
} from 'lucide-react';
import { VideoItem } from '../types';
import { ExportMarkdownModal } from './ExportMarkdownModal';
import { PWAInstallModal } from './PWAInstallModal';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { generateLibraryMarkdown, downloadMarkdownFile } from '../utils/markdownExport';

interface LibraryViewProps {
  videos: VideoItem[];
  onOpenVideo: (video: VideoItem, initialTimestampSeconds?: number) => void;
  onDeleteVideo: (id: string) => void;
  onNavigateToAdd: () => void;
  onNavigateToAsk: (videoTitleFilter?: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  videos,
  onOpenVideo,
  onDeleteVideo,
  onNavigateToAdd,
  onNavigateToAsk
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [exportingVideo, setExportingVideo] = useState<VideoItem | null>(null);
  const [exportedAll, setExportedAll] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const { isInstalled } = usePWAInstall();

  const handleExportAll = () => {
    if (videos.length === 0) return;
    const fullVault = generateLibraryMarkdown(videos);
    downloadMarkdownFile('My_Knowledge_AI_Full_Vault', fullVault);
    setExportedAll(true);
    setTimeout(() => setExportedAll(false), 2500);
  };

  // Extract all unique tags
  const allTags = useMemo(() => {
    const set = new Set<string>();
    videos.forEach(v => (v.tags || []).forEach(t => set.add(t)));
    return Array.from(set);
  }, [videos]);

  // Filtered videos based on search & tag
  const filteredVideos = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return videos.filter(video => {
      const matchesTag = !selectedTag || (video.tags || []).includes(selectedTag);
      if (!matchesTag) return false;
      if (!q) return true;

      // Deep match across title, summary, channel, lessons, rules
      const matchesMeta = 
        video.title.toLowerCase().includes(q) ||
        (video.channel_or_author || '').toLowerCase().includes(q) ||
        video.summary.toLowerCase().includes(q) ||
        (video.tags || []).some(t => t.toLowerCase().includes(q));

      const matchesLessons = (video.lessons || []).some(l => 
        l.title.toLowerCase().includes(q) ||
        l.summary.toLowerCase().includes(q) ||
        (l.key_takeaways || []).some(k => k.toLowerCase().includes(q))
      );

      const matchesRules = (video.rules || []).some(r =>
        r.rule_statement.toLowerCase().includes(q) ||
        r.rationale.toLowerCase().includes(q)
      );

      return matchesMeta || matchesLessons || matchesRules;
    });
  }, [videos, searchQuery, selectedTag]);

  // Aggregate stats
  const totalLessons = useMemo(() => videos.reduce((acc, v) => acc + (v.lessons?.length || 0), 0), [videos]);
  const totalRules = useMemo(() => videos.reduce((acc, v) => acc + (v.rules?.length || 0), 0), [videos]);
  const totalExamples = useMemo(() => videos.reduce((acc, v) => acc + (v.examples?.length || 0), 0), [videos]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
      
      {/* Mobile Application Promo & Quick Install */}
      {!isInstalled && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-purple-950/40 to-slate-900 border border-indigo-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0">
              <Tablet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <span>Switch to Full Mobile Application</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300">
                  Tablet Ready
                </span>
              </h4>
              <p className="text-xs text-slate-300">
                Install directly on your Android tablet or phone for fullscreen video learning and offline knowledge access.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInstallModal(true)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center justify-center space-x-1.5 transition-all cursor-pointer flex-shrink-0 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Install App</span>
          </button>
        </div>
      )}

      {/* Top Banner & Quick Metrics for Android Tablet */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Play className="w-5 h-5 fill-current" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{videos.length}</p>
            <p className="text-xs text-slate-400">Analyzed Videos</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{totalLessons}</p>
            <p className="text-xs text-slate-400">Timestamped Lessons</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{totalRules}</p>
            <p className="text-xs text-slate-400">Distilled Rules</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xl font-bold text-white">{totalExamples}</p>
            <p className="text-xs text-slate-400">Concrete Examples</p>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search lessons, rules, keywords, authors, or topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex items-center space-x-2 flex-shrink-0">
          {videos.length > 0 && (
            <button
              onClick={handleExportAll}
              className="flex items-center justify-center space-x-1.5 px-3.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Download all analyzed videos as a combined Markdown study vault"
            >
              {exportedAll ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-indigo-400" />}
              <span>{exportedAll ? 'Vault Exported!' : 'Export Vault (.md)'}</span>
            </button>
          )}

          <button
            onClick={onNavigateToAdd}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex-shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Video</span>
          </button>
        </div>
      </div>

      {/* Tag Filter Chips */}
      {allTags.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
              selectedTag === null
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All Topics
          </button>
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors flex-shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Video Cards Grid (Tablet 2-col, Desktop 3-col) */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <div
              key={video.id}
              className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 group"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-medium ${
                    video.source_type === 'youtube'
                      ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                  }`}>
                    {video.source_type === 'youtube' ? (
                      <Youtube className="w-3 h-3 mr-1 text-red-400" />
                    ) : (
                      <FileVideo className="w-3 h-3 mr-1 text-emerald-400" />
                    )}
                    {video.source_type === 'youtube' ? 'YouTube' : 'Upload'}
                  </span>

                  <span className="flex items-center text-slate-400 font-mono text-[11px]">
                    <Clock className="w-3 h-3 mr-1" />
                    {video.duration_label}
                  </span>
                </div>

                <h3 
                  onClick={() => onOpenVideo(video)}
                  className="font-bold text-sm sm:text-base text-white hover:text-indigo-300 transition-colors cursor-pointer line-clamp-2 leading-snug"
                >
                  {video.title}
                </h3>

                <p className="text-xs text-slate-400 font-medium">
                  {video.channel_or_author || 'Author'}
                </p>

                <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                  {video.summary}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 pt-1">
                  {(video.tags || []).slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-400 text-[10px]"
                    >
                      #{tag}
                    </span>
                  ))}
                  {(video.tags || []).length > 3 && (
                    <span className="text-[10px] text-slate-500 px-1 py-0.5">
                      +{video.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer: Metrics & Actions */}
              <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-3">
                {/* Knowledge counts */}
                <div className="grid grid-cols-3 gap-1 text-center py-1.5 bg-slate-950/40 rounded-xl border border-slate-800/50 text-[11px]">
                  <div>
                    <span className="block font-bold text-indigo-300">
                      {video.lessons?.length || 0}
                    </span>
                    <span className="text-slate-400 text-[10px]">Lessons</span>
                  </div>
                  <div className="border-x border-slate-800">
                    <span className="block font-bold text-emerald-300">
                      {video.rules?.length || 0}
                    </span>
                    <span className="text-slate-400 text-[10px]">Rules</span>
                  </div>
                  <div>
                    <span className="block font-bold text-amber-300">
                      {video.examples?.length || 0}
                    </span>
                    <span className="text-slate-400 text-[10px]">Demos</span>
                  </div>
                </div>

                {/* Primary Action Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenVideo(video)}
                    className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-semibold border border-indigo-500/30 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Open Hub & Player</span>
                  </button>

                  <button
                    onClick={() => setExportingVideo(video)}
                    className="p-2 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-xl border border-slate-800 transition-colors cursor-pointer"
                    title="Export lessons and rules as Markdown note"
                  >
                    <FileText className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDeleteVideo(video.id)}
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer"
                    title="Remove from library"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-slate-900/30 border border-slate-800 rounded-3xl space-y-3 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No videos found</h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {searchQuery 
              ? `No lessons or rules matched "${searchQuery}". Try a different keyword.`
              : 'Your knowledge library is empty. Add a YouTube video or file to get started.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-indigo-400 hover:underline pt-2"
            >
              Clear search filter
            </button>
          ) : (
            <button
              onClick={onNavigateToAdd}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl hover:bg-indigo-500 transition-colors mt-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Video</span>
            </button>
          )}
        </div>
      )}

      {/* Video-level Markdown Export Modal */}
      <ExportMarkdownModal
        video={exportingVideo}
        isOpen={!!exportingVideo}
        onClose={() => setExportingVideo(null)}
      />

      {/* PWA Mobile App Install Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

    </div>
  );
};
