import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  Play, 
  Pause,
  Clock, 
  BookOpen, 
  ShieldCheck, 
  Code2, 
  ExternalLink, 
  Check, 
  Copy, 
  Tag, 
  AlertTriangle, 
  Lightbulb, 
  FileText, 
  Download,
  Radio,
  ChevronsDown,
  RotateCcw,
  Gauge
} from 'lucide-react';
import { VideoItem, Lesson, Rule, ExampleItem } from '../types';
import { ExportMarkdownModal } from './ExportMarkdownModal';

interface VideoPlayerModalProps {
  video: VideoItem | null;
  initialTimestampSeconds?: number;
  isOpen: boolean;
  onClose: () => void;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  video,
  initialTimestampSeconds = 0,
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'lessons' | 'rules' | 'examples'>('lessons');
  const [currentTime, setCurrentTime] = useState<number>(initialTimestampSeconds);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [userHasScrolledAway, setUserHasScrolledAway] = useState<boolean>(false);
  const [copiedRuleId, setCopiedRuleId] = useState<string | null>(null);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const drawerContainerRef = useRef<HTMLDivElement>(null);
  const lessonItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const ruleItemRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'setPlaybackRate',
          args: [speed]
        }),
        '*'
      );
    }
  };

  const handleTogglePlay = () => {
    const next = !isPlaying;
    setIsPlaying(next);
    if (videoRef.current) {
      if (next) videoRef.current.play().catch(() => {});
      else videoRef.current.pause();
    }
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: next ? 'playVideo' : 'pauseVideo',
          args: []
        }),
        '*'
      );
    }
  };

  // Reset timestamp when opening with a new initial timestamp
  useEffect(() => {
    setCurrentTime(initialTimestampSeconds);
    if (videoRef.current && initialTimestampSeconds >= 0) {
      videoRef.current.currentTime = initialTimestampSeconds;
      videoRef.current.play().catch(() => {});
    }
  }, [initialTimestampSeconds, isOpen]);

  // YouTube postMessage listener to capture real-time playback updates
  useEffect(() => {
    if (!isOpen || !video || video.source_type !== 'youtube') return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (data && data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            setCurrentTime(data.info.currentTime);
          }
          if (data.info.playerState === 1) setIsPlaying(true);
          if (data.info.playerState === 2) setIsPlaying(false);
        }
      } catch {}
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpen, video]);

  // Playback timer simulation for continuous progress tracking
  useEffect(() => {
    if (!isOpen || !isPlaying) return;

    const interval = setInterval(() => {
      setCurrentTime((prev) => {
        const max = video?.duration_seconds || 3600;
        if (prev >= max) {
          setIsPlaying(false);
          return max;
        }
        return Math.min(max, prev + playbackSpeed);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, video, playbackSpeed]);

  // Identify currently active lesson based on playback time
  const activeLesson = useMemo(() => {
    if (!video || !video.lessons || video.lessons.length === 0) return null;
    
    // Exact match in chapter range
    const exact = video.lessons.find(
      (l) => currentTime >= l.timestamp_start && currentTime <= l.timestamp_end
    );
    if (exact) return exact;

    // Nearest preceding lesson
    const preceding = [...video.lessons]
      .filter((l) => l.timestamp_start <= currentTime)
      .sort((a, b) => b.timestamp_start - a.timestamp_start)[0];

    return preceding || video.lessons[0];
  }, [video, currentTime]);

  // Identify currently active rule based on playback time
  const activeRule = useMemo(() => {
    if (!video || !video.rules || video.rules.length === 0) return null;
    const preceding = [...video.rules]
      .filter((r) => r.timestamp_seconds <= currentTime)
      .sort((a, b) => b.timestamp_seconds - a.timestamp_seconds)[0];
    return preceding || null;
  }, [video, currentTime]);

  // Smooth Auto-scroll to active element whenever activeLesson/activeRule updates
  const scrollToActiveElement = (behavior: ScrollBehavior = 'smooth') => {
    if (activeTab === 'lessons' && activeLesson) {
      const el = lessonItemRefs.current[activeLesson.id];
      if (el) {
        el.scrollIntoView({
          behavior,
          block: 'nearest'
        });
        setUserHasScrolledAway(false);
      }
    } else if (activeTab === 'rules' && activeRule) {
      const el = ruleItemRefs.current[activeRule.id];
      if (el) {
        el.scrollIntoView({
          behavior,
          block: 'nearest'
        });
        setUserHasScrolledAway(false);
      }
    }
  };

  useEffect(() => {
    if (autoScrollEnabled) {
      scrollToActiveElement('smooth');
    }
  }, [activeLesson?.id, activeRule?.id, activeTab, autoScrollEnabled]);

  if (!isOpen || !video) return null;

  const handleSeek = (seconds: number) => {
    setCurrentTime(seconds);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    }
    if (autoScrollEnabled) {
      setTimeout(() => scrollToActiveElement('smooth'), 100);
    }
  };

  const handleScrubberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    handleSeek(val);
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRuleId(id);
    setTimeout(() => setCopiedRuleId(null), 2000);
  };

  const handleContainerScroll = () => {
    // If user manually scrolls away, detect it
    if (!autoScrollEnabled) return;
    const container = drawerContainerRef.current;
    if (!container) return;
    const activeEl = activeTab === 'lessons' 
      ? (activeLesson ? lessonItemRefs.current[activeLesson.id] : null)
      : (activeRule ? ruleItemRefs.current[activeRule.id] : null);

    if (activeEl) {
      const cRect = container.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      const isVisible = elRect.top >= cRect.top - 50 && elRect.bottom <= cRect.bottom + 50;
      setUserHasScrolledAway(!isVisible);
    }
  };

  const youtubeEmbedUrl = video.youtube_id 
    ? `https://www.youtube-nocookie.com/embed/${video.youtube_id}?autoplay=1&enablejsapi=1&start=${Math.floor(currentTime)}`
    : null;

  const totalDuration = video.duration_seconds || 1800;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[94vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3 overflow-hidden">
            <span className="px-2 py-0.5 text-xs font-semibold uppercase tracking-wider rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex-shrink-0">
              {video.source_type === 'youtube' ? 'YouTube' : 'Video Upload'}
            </span>
            <h2 className="text-sm sm:text-base font-semibold text-white truncate max-w-md sm:max-w-xl">
              {video.title}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2 flex-shrink-0">
            <button
              onClick={() => setIsExportOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-all cursor-pointer shadow-sm"
              title="Export lessons and rules as Markdown note"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export .md</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content: Tablet 2-Column or Stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-y-auto">
          
          {/* Left Column: Player, Scrubber & Meta (7 cols on lg/tablet) */}
          <div className="lg:col-span-7 p-4 sm:p-5 flex flex-col space-y-4 border-b lg:border-b-0 lg:border-r border-slate-800 bg-slate-950/40">
            
            {/* Video Player Box */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black shadow-lg border border-slate-800">
              {video.source_type === 'youtube' && youtubeEmbedUrl ? (
                <iframe
                  ref={iframeRef}
                  key={`${video.youtube_id}`}
                  src={youtubeEmbedUrl}
                  title={video.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : video.source_type === 'upload' && video.source_url && !video.source_url.startsWith('local://') ? (
                <video
                  ref={videoRef}
                  src={video.source_url}
                  controls
                  onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900 to-slate-950">
                  <Play className="w-12 h-12 text-indigo-400 mb-2 opacity-80" />
                  <p className="text-sm font-medium text-white mb-1">
                    {video.file_name || video.title}
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Uploaded video knowledge is extracted and timestamped.
                  </p>
                </div>
              )}
            </div>

            {/* Interactive Timeline Scrubber & Sync Bar */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-indigo-300">
                    {formatTime(currentTime)}
                  </span>
                  <span className="text-slate-500">/</span>
                  <span className="font-mono text-slate-400">
                    {video.duration_label || formatTime(totalDuration)}
                  </span>
                </div>

                {activeLesson && (
                  <span className="text-[11px] font-semibold text-indigo-300 truncate max-w-xs sm:max-w-sm flex items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1.5" />
                    Chapter: {activeLesson.title}
                  </span>
                )}
              </div>

              {/* Range slider for scrubbing */}
              <input
                type="range"
                min={0}
                max={totalDuration}
                value={Math.min(currentTime, totalDuration)}
                onChange={handleScrubberChange}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />

              {/* Playback Controls & Speed Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleTogglePlay}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white flex items-center space-x-1.5 text-xs font-medium cursor-pointer transition-colors active:scale-95"
                    title={isPlaying ? "Pause playback" : "Play video"}
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5 text-indigo-400" /> : <Play className="w-3.5 h-3.5 text-indigo-400" />}
                    <span>{isPlaying ? 'Pause' : 'Play'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs cursor-pointer transition-colors active:scale-95"
                    title="Rewind 10 seconds"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Playback speed selector: 0.5x, 1x, 1.5x, 2x */}
                <div className="flex items-center space-x-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800/80 shadow-inner">
                  <div className="flex items-center px-1.5 py-0.5 text-[11px] text-slate-400 font-medium">
                    <Gauge className="w-3 h-3 mr-1 text-indigo-400" />
                    <span className="hidden sm:inline">Speed:</span>
                  </div>
                  {[0.5, 1, 1.5, 2].map((speed) => {
                    const isActive = playbackSpeed === speed;
                    return (
                      <button
                        key={speed}
                        type="button"
                        onClick={() => handleSpeedChange(speed)}
                        className={`px-2 py-0.5 text-xs rounded-md font-medium transition-all cursor-pointer ${
                          isActive
                            ? 'bg-indigo-600 text-white font-semibold shadow-xs ring-1 ring-indigo-400/50'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80'
                        }`}
                        title={`Set playback speed to ${speed}x`}
                      >
                        {speed}x
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Video Meta Info */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-slate-300">{video.channel_or_author}</span>
                  <span className="flex items-center text-slate-400">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    {video.duration_label}
                  </span>
                </div>
                {video.source_type === 'youtube' && (
                  <a
                    href={video.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center text-indigo-400 hover:text-indigo-300"
                  >
                    Open on YouTube <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                )}
              </div>

              {/* Summary */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                <p className="font-semibold text-slate-200 mb-1">Executive Summary:</p>
                {video.summary}
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5">
                {video.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]"
                  >
                    <Tag className="w-2.5 h-2.5 mr-1 text-indigo-400" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Lessons, Rules, Examples with Auto-Scroll Tracking (5 cols) */}
          <div className="lg:col-span-5 flex flex-col bg-slate-900/60 h-full overflow-hidden">
            
            {/* Drawer Tabs & Auto-Scroll Toggle */}
            <div className="flex items-center justify-between border-b border-slate-800 px-4 pt-3 bg-slate-900/80 gap-2 flex-wrap">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveTab('lessons')}
                  className={`flex items-center space-x-1.5 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'lessons'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Lessons ({video.lessons.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('rules')}
                  className={`flex items-center space-x-1.5 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'rules'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Rules ({video.rules.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('examples')}
                  className={`flex items-center space-x-1.5 pb-2.5 px-2 text-xs font-semibold border-b-2 transition-colors ${
                    activeTab === 'examples'
                      ? 'border-indigo-500 text-indigo-400'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Examples ({video.examples.length})</span>
                </button>
              </div>

              {/* Auto-Scroll Toggle Control */}
              <button
                onClick={() => setAutoScrollEnabled(!autoScrollEnabled)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 mb-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  autoScrollEnabled
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700'
                }`}
                title="Automatically scroll the lesson list as playback progresses"
              >
                <span className={`w-2 h-2 rounded-full ${autoScrollEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>Auto-Scroll: {autoScrollEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Tab Body with Scroll Tracking */}
            <div
              ref={drawerContainerRef}
              onScroll={handleContainerScroll}
              className="p-4 overflow-y-auto space-y-3 flex-1 relative max-h-[500px] lg:max-h-[640px] scroll-smooth"
            >
              
              {/* Floating "Jump to Playing Lesson" pill when user scrolled away */}
              {autoScrollEnabled && userHasScrolledAway && (
                <div className="sticky top-2 z-20 flex justify-center">
                  <button
                    onClick={() => scrollToActiveElement('smooth')}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600/90 hover:bg-indigo-600 text-white rounded-full text-[11px] font-semibold shadow-lg shadow-indigo-600/30 border border-indigo-400/30 backdrop-blur-md transition-all cursor-pointer animate-bounce"
                  >
                    <ChevronsDown className="w-3.5 h-3.5" />
                    <span>Jump to Active ({formatTime(currentTime)})</span>
                  </button>
                </div>
              )}

              {/* LESSONS TAB */}
              {activeTab === 'lessons' && (
                <>
                  {video.lessons.map((lesson: Lesson) => {
                    const isActive = activeLesson?.id === lesson.id;
                    const isPassed = currentTime > lesson.timestamp_end;
                    const durationInChapter = Math.max(1, lesson.timestamp_end - lesson.timestamp_start);
                    const chapterProgress = isActive
                      ? Math.min(100, Math.max(0, ((currentTime - lesson.timestamp_start) / durationInChapter) * 100))
                      : isPassed ? 100 : 0;

                    return (
                      <div
                        key={lesson.id}
                        ref={(el) => { lessonItemRefs.current[lesson.id] = el; }}
                        className={`p-3.5 rounded-2xl transition-all space-y-2 border ${
                          isActive
                            ? 'bg-indigo-950/70 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            {isActive && (
                              <span className="flex items-center px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-1" />
                                Active
                              </span>
                            )}
                            <h4 className={`text-xs font-bold leading-snug ${isActive ? 'text-indigo-200' : 'text-white'}`}>
                              {lesson.title}
                            </h4>
                          </div>

                          <button
                            onClick={() => handleSeek(lesson.timestamp_start)}
                            className={`flex-shrink-0 flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-mono transition-colors ${
                              isActive
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30'
                            }`}
                            title="Seek player to this lesson"
                          >
                            <Play className="w-2.5 h-2.5 fill-current" />
                            <span>{lesson.timestamp_label}</span>
                          </button>
                        </div>

                        {/* Chapter Progress Bar for Active Lesson */}
                        {isActive && (
                          <div className="w-full bg-slate-800/80 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
                              style={{ width: `${chapterProgress}%` }}
                            />
                          </div>
                        )}

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {lesson.summary}
                        </p>

                        {lesson.key_takeaways && lesson.key_takeaways.length > 0 && (
                          <div className="pt-1 space-y-1">
                            <p className="text-[10px] uppercase font-semibold text-slate-400">Key Takeaways:</p>
                            <ul className="space-y-1 text-xs text-slate-300">
                              {lesson.key_takeaways.map((takeaway, idx) => (
                                <li key={idx} className="flex items-start space-x-1.5">
                                  <span className="text-indigo-400 mt-0.5">&bull;</span>
                                  <span>{takeaway}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </>
              )}

              {/* RULES TAB */}
              {activeTab === 'rules' && (
                <>
                  {video.rules.map((rule: Rule) => {
                    const isActive = activeRule?.id === rule.id;

                    return (
                      <div
                        key={rule.id}
                        ref={(el) => { ruleItemRefs.current[rule.id] = el; }}
                        className={`p-3.5 rounded-2xl transition-all space-y-2.5 border ${
                          isActive
                            ? 'bg-indigo-950/70 border-indigo-500 shadow-xl shadow-indigo-500/10 ring-1 ring-indigo-500/40'
                            : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              rule.severity === 'essential'
                                ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                                : rule.severity === 'avoid'
                                ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                            }`}>
                              {rule.severity}
                            </span>

                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 uppercase tracking-wider">
                                Current
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => handleSeek(rule.timestamp_seconds)}
                              className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                                isActive
                                  ? 'bg-indigo-600 text-white'
                                  : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30'
                              }`}
                              title="Seek player to rule"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                              <span>{rule.timestamp_label}</span>
                            </button>

                            <button
                              onClick={() => handleCopyText(rule.id, `Rule: ${rule.rule_statement}\nRationale: ${rule.rationale}`)}
                              className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800"
                              title="Copy rule text"
                            >
                              {copiedRuleId === rule.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        <p className={`text-xs font-semibold leading-snug ${isActive ? 'text-indigo-200' : 'text-white'}`}>
                          &ldquo;{rule.rule_statement}&rdquo;
                        </p>

                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300">
                          <strong className="text-slate-400">Why: </strong>
                          {rule.rationale}
                        </div>
                      </div>
                    );
                  })}
                </>
              )}

              {/* EXAMPLES TAB */}
              {activeTab === 'examples' && (
                <>
                  {video.examples.map((ex: ExampleItem) => (
                    <div
                      key={ex.id}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-200">{ex.context}</span>
                        <button
                          onClick={() => handleSeek(ex.timestamp_seconds)}
                          className="flex items-center space-x-1 px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white border border-indigo-500/30 text-[11px] font-mono transition-colors"
                        >
                          <Play className="w-2.5 h-2.5 fill-current" />
                          <span>{ex.timestamp_label}</span>
                        </button>
                      </div>

                      <pre className="p-2.5 rounded-lg bg-slate-950 text-indigo-300 font-mono text-xs overflow-x-auto border border-slate-800 whitespace-pre-wrap">
                        {ex.code_or_demonstration}
                      </pre>
                    </div>
                  ))}
                </>
              )}

            </div>
          </div>

        </div>

      </div>

      {/* Export Markdown Modal */}
      <ExportMarkdownModal
        video={video}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />
    </div>
  );
};
