import React, { useState, useRef } from 'react';
import { 
  Youtube, 
  Upload, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  ArrowRight,
  FileVideo,
  ListPlus,
  RefreshCw
} from 'lucide-react';
import { VideoItem } from '../types';

interface AddVideoViewProps {
  onVideoAdded: (video: VideoItem) => void;
  openPlayer: (video: VideoItem) => void;
}

export const AddVideoView: React.FC<AddVideoViewProps> = ({
  onVideoAdded,
  openPlayer
}) => {
  const [activeMode, setActiveMode] = useState<'youtube' | 'upload'>('youtube');
  
  // YouTube State
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [titleHint, setTitleHint] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Upload State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sample quick presets
  const samplePresets = [
    {
      title: 'Next.js 15 Full Tutorial: Server Actions & Cache',
      url: 'https://www.youtube.com/watch?v=wm5gMKuwSYk',
      hint: 'Next.js 15 Server Actions, Streaming, and Caching architectures'
    },
    {
      title: 'Python for Beginners - Full Course 2026',
      url: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
      hint: 'Core programming constructs, functions, data structures, and best practices'
    },
    {
      title: 'System Design Interview: Rate Limiting & Queues',
      url: 'https://www.youtube.com/watch?v=FU4WnezGPYM',
      hint: 'Distributed rate limiting algorithms (Token bucket, leaky bucket) and redis'
    }
  ];

  const parseErrorMessage = (raw: any): string => {
    if (!raw) return 'An unexpected error occurred during video analysis.';
    const str = typeof raw === 'string' ? raw : raw.message || JSON.stringify(raw);
    try {
      const parsed = JSON.parse(str);
      if (parsed.error?.message) {
        if (parsed.error.code === 429 || str.includes('RESOURCE_EXHAUSTED')) {
          return 'Gemini API Rate Limit Exceeded (429). Your API key reached its quota limit.';
        }
        return parsed.error.message;
      }
    } catch {}
    if (str.includes('429') || str.includes('RESOURCE_EXHAUSTED') || str.includes('quota')) {
      return 'Gemini API Rate Limit Exceeded (429). Your API key reached its quota limit.';
    }
    return str;
  };

  const handleAnalyzeYoutube = async (e?: React.FormEvent, forceFallback = false) => {
    if (e) e.preventDefault();
    if (!youtubeUrl.trim()) return;

    setError(null);
    setIsAnalyzing(true);
    setAnalysisStep(forceFallback ? 'Synthesizing knowledge with backup engine...' : 'Connecting to Gemini server...');

    try {
      setAnalysisStep(forceFallback ? 'Synthesizing lessons, rules & timeline...' : 'Analyzing audio, visual cues & topic timeline with Gemini...');
      const response = await fetch('/api/analyze-youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: youtubeUrl.trim(),
          titleHint: titleHint.trim() || undefined,
          forceFallback
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to analyze video');
      }

      setAnalysisStep('Finalizing knowledge structure...');
      const analyzedVideo: VideoItem = await response.json();

      setAnalysisStep('Knowledge synthesized successfully!');
      onVideoAdded(analyzedVideo);
      setYoutubeUrl('');
      setTitleHint('');
      
      // Auto open video to show extracted knowledge
      setTimeout(() => {
        openPlayer(analyzedVideo);
      }, 500);

    } catch (err: any) {
      console.error(err);
      setError(parseErrorMessage(err));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUploadAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setError(null);
    setIsUploading(true);
    setUploadProgress(15);
    setAnalysisStep('Uploading video to server & Gemini Files API...');

    const formData = new FormData();
    formData.append('video_file', selectedFile);
    formData.append('title', uploadTitle || selectedFile.name);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/api/analyze-upload');

      xhr.upload.onprogress = (evt) => {
        if (evt.lengthComputable) {
          const percent = Math.round((evt.loaded / evt.total) * 60);
          setUploadProgress(Math.min(percent, 60));
        }
      };

      const resultPromise = new Promise<VideoItem>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (pErr) {
              reject(new Error('Invalid response from server'));
            }
          } else {
            try {
              const err = JSON.parse(xhr.responseText);
              reject(new Error(err.error || 'Upload analysis failed'));
            } catch {
              reject(new Error(`Upload failed with HTTP ${xhr.status}`));
            }
          }
        };
        xhr.onerror = () => reject(new Error('Network error during upload'));
      });

      setUploadProgress(70);
      setAnalysisStep('Processing frames & transcribing audio with Gemini...');
      xhr.send(formData);

      const analyzedVideo = await resultPromise;
      setUploadProgress(100);
      setAnalysisStep('Complete! Saved to your knowledge library.');
      
      onVideoAdded(analyzedVideo);
      setSelectedFile(null);
      setUploadTitle('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      setTimeout(() => {
        openPlayer(analyzedVideo);
      }, 500);

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while processing video file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multimodal Knowledge Extraction</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Add Video to Knowledge AI
        </h1>
        <p className="text-sm text-slate-400 max-w-lg mx-auto">
          Paste any public YouTube URL or upload your own video recordings. Gemini AI distills lessons, rules, code examples, and second-by-second timestamps.
        </p>
      </div>

      {/* Mode Selector Tabs (Big touch friendly buttons for Tablet) */}
      <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl max-w-md mx-auto">
        <button
          onClick={() => setActiveMode('youtube')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeMode === 'youtube'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <Youtube className="w-4 h-4 text-red-400" />
          <span>YouTube Link</span>
        </button>

        <button
          onClick={() => setActiveMode('upload')}
          className={`flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeMode === 'upload'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
          }`}
        >
          <FileVideo className="w-4 h-4 text-emerald-400" />
          <span>Upload Video File</span>
        </button>
      </div>

      {/* Error alert with fallback option */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex flex-col sm:flex-row items-start justify-between gap-3 shadow-lg">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-100">API Analysis Notice</p>
              <p className="mt-0.5 text-rose-200/90 leading-relaxed">{error}</p>
            </div>
          </div>
          {youtubeUrl.trim() && (
            <button
              type="button"
              onClick={() => handleAnalyzeYoutube(undefined, true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex-shrink-0 shadow-md shadow-indigo-600/30 cursor-pointer self-start sm:self-center"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Use Backup Knowledge Synthesizer</span>
            </button>
          )}
        </div>
      )}

      {/* Mode 1: YouTube Form */}
      {activeMode === 'youtube' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
          <form onSubmit={handleAnalyzeYoutube} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Public YouTube Video URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <Youtube className="w-5 h-5 text-slate-500 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Optional Topic or Focus Hint
              </label>
              <input
                type="text"
                placeholder="e.g. Focus on microservices and caching rules"
                value={titleHint}
                onChange={(e) => setTitleHint(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isAnalyzing || !youtubeUrl.trim()}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{analysisStep || 'Analyzing Video with Gemini...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Extract Knowledge</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Presets for Instant Testing */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Or Try One-Click Sample Educational Videos:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {samplePresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setYoutubeUrl(preset.url);
                    setTitleHint(preset.hint);
                  }}
                  className="text-left p-3 rounded-xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 transition-all text-xs group"
                >
                  <p className="font-semibold text-slate-200 group-hover:text-indigo-300 line-clamp-1">
                    {preset.title}
                  </p>
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">
                    {preset.hint}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Upload Video File Form */}
      {activeMode === 'upload' && (
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl space-y-6">
          <form onSubmit={handleUploadAnalyze} className="space-y-4">
            
            {/* File Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-2xl p-6 sm:p-8 text-center bg-slate-950/40 hover:bg-slate-950/80 transition-all cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <Upload className="w-10 h-10 text-indigo-400 mx-auto mb-3 opacity-90" />
              <p className="text-sm font-semibold text-white">
                {selectedFile ? selectedFile.name : 'Tap to select or drop video file'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports MP4, WebM, MOV, M4V (including long technical lectures, up to 500MB)
              </p>
              {selectedFile && (
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-xs font-mono border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB selected
                </div>
              )}
            </div>

            {/* Custom Video Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Knowledge Title / Lecture Name
              </label>
              <input
                type="text"
                placeholder="e.g. Distributed Database Architecture Lecture"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* Progress indicator */}
            {isUploading && (
              <div className="space-y-2 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>{analysisStep}</span>
                  <span className="font-mono">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              {isUploading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Processing Video...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload & Analyze with Gemini</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Feature Highlights Grid for Android Tablet */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <ListPlus className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-white">Structured Lessons</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Automatic chapterization with core takeaways and start/end time offsets.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-white">Exact Timestamps</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Every rule, takeaway, and code example links directly to the specific second.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-semibold text-white">Strict Citation Q&A</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Questions answered strictly with facts from your library. No hallucinations.
          </p>
        </div>
      </div>

    </div>
  );
};
