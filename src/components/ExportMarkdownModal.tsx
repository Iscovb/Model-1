import React, { useState, useMemo } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  FileCode, 
  ShieldCheck, 
  BookOpen, 
  Code2, 
  Sliders, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { VideoItem } from '../types';
import { 
  generateVideoMarkdown, 
  downloadMarkdownFile, 
  copyMarkdownToClipboard 
} from '../utils/markdownExport';

interface ExportMarkdownModalProps {
  video: VideoItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportMarkdownModal: React.FC<ExportMarkdownModalProps> = ({
  video,
  isOpen,
  onClose
}) => {
  const [includeRules, setIncludeRules] = useState(true);
  const [includeLessons, setIncludeLessons] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'raw'>('preview');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  // Generate markdown on the fly based on user toggles
  const markdownContent = useMemo(() => {
    if (!video) return '';
    return generateVideoMarkdown(video, {
      includeRules,
      includeLessons,
      includeExamples,
      includeMetadata
    });
  }, [video, includeRules, includeLessons, includeExamples, includeMetadata]);

  if (!isOpen || !video) return null;

  const handleDownload = () => {
    downloadMarkdownFile(`${video.title}_Knowledge`, markdownContent);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleCopy = async () => {
    const success = await copyMarkdownToClipboard(markdownContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-md">
                  Export Markdown Note
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Obsidian & Notion Ready
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-lg mt-0.5">
                {video.title}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Customization Options Bar */}
        <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 font-medium flex items-center">
              <Sliders className="w-3.5 h-3.5 mr-1 text-slate-500" />
              Include:
            </span>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={includeRules}
                onChange={(e) => setIncludeRules(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
              />
              <span>Rules ({video.rules?.length || 0})</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={includeLessons}
                onChange={(e) => setIncludeLessons(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
              />
              <span>Lessons ({video.lessons?.length || 0})</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={includeExamples}
                onChange={(e) => setIncludeExamples(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
              />
              <span>Examples ({video.examples?.length || 0})</span>
            </label>

            <label className="flex items-center space-x-1.5 cursor-pointer text-slate-300 hover:text-white">
              <input
                type="checkbox"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-0"
              />
              <span>YAML Frontmatter</span>
            </label>
          </div>

          {/* Tab selector */}
          <div className="flex items-center space-x-1 p-0.5 bg-slate-900 border border-slate-800 rounded-lg">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Formatted
            </button>
            <button
              onClick={() => setActiveTab('raw')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'raw'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw .md
            </button>
          </div>
        </div>

        {/* Content Viewer */}
        <div className="flex-1 p-5 overflow-y-auto max-h-[55vh] bg-slate-950/40">
          {activeTab === 'raw' ? (
            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-indigo-200 whitespace-pre-wrap select-all overflow-x-auto leading-relaxed">
              {markdownContent}
            </pre>
          ) : (
            <div className="space-y-5 text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto leading-relaxed">
              
              {/* YAML meta card */}
              {includeMetadata && (
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-[11px] text-slate-400 space-y-1">
                  <p className="text-slate-500 font-bold">--- YAML Frontmatter ---</p>
                  <p><span className="text-indigo-400">title:</span> "{video.title}"</p>
                  <p><span className="text-indigo-400">author:</span> "{video.channel_or_author}"</p>
                  <p><span className="text-indigo-400">duration:</span> "{video.duration_label}"</p>
                  <p><span className="text-indigo-400">tags:</span> [{video.tags.map(t => `"${t}"`).join(', ')}]</p>
                </div>
              )}

              {/* Title & meta */}
              <div className="space-y-1 pb-3 border-b border-slate-800">
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  {video.title}
                </h1>
                <p className="text-xs text-slate-400">
                  {video.channel_or_author} &bull; {video.duration_label} &bull; {video.source_type}
                </p>
              </div>

              {/* Summary */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
                <h4 className="font-semibold text-slate-200 mb-1">📌 Executive Summary</h4>
                <p className="text-slate-300 leading-relaxed text-xs">
                  {video.summary}
                </p>
              </div>

              {/* Rules preview */}
              {includeRules && video.rules?.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="font-bold text-white text-sm flex items-center">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 mr-1.5" />
                    Distilled Rules ({video.rules.length})
                  </h3>
                  <div className="space-y-2">
                    {video.rules.map((rule, idx) => (
                      <div key={rule.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">
                            {idx + 1}. &ldquo;{rule.rule_statement}&rdquo;
                          </span>
                          <span className="text-[11px] font-mono text-indigo-400">
                            {rule.timestamp_label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          <strong>Why: </strong>{rule.rationale}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lessons preview */}
              {includeLessons && video.lessons?.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <h3 className="font-bold text-white text-sm flex items-center">
                    <BookOpen className="w-4 h-4 text-indigo-400 mr-1.5" />
                    Chapterized Lessons ({video.lessons.length})
                  </h3>
                  <div className="space-y-2">
                    {video.lessons.map((lesson, idx) => (
                      <div key={lesson.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">
                            {idx + 1}. {lesson.title}
                          </span>
                          <span className="text-[11px] font-mono text-indigo-400">
                            {lesson.timestamp_label}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300">
                          {lesson.summary}
                        </p>
                        {lesson.key_takeaways?.length > 0 && (
                          <ul className="text-[11px] text-slate-400 space-y-0.5 pl-3 list-disc">
                            {lesson.key_takeaways.map((k, kIdx) => (
                              <li key={kIdx}>{k}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Examples preview */}
              {includeExamples && video.examples?.length > 0 && (
                <div className="space-y-2.5 pt-2">
                  <h3 className="font-bold text-white text-sm flex items-center">
                    <Code2 className="w-4 h-4 text-amber-400 mr-1.5" />
                    Concrete Examples ({video.examples.length})
                  </h3>
                  <div className="space-y-2">
                    {video.examples.map((ex) => (
                      <div key={ex.id} className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 space-y-1">
                        <p className="font-semibold text-xs text-white">{ex.context}</p>
                        <pre className="p-2 rounded bg-slate-950 text-indigo-300 font-mono text-[11px] overflow-x-auto">
                          {ex.code_or_demonstration}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

        {/* Footer Actions: Big Touch Friendly Buttons for Tablet */}
        <div className="px-5 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400 hidden sm:flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Compatible with Obsidian, Notion, Logseq, Bear, Apple Notes & GitHub</span>
          </div>

          <div className="flex items-center space-x-2.5 ml-auto">
            <button
              onClick={handleCopy}
              className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-all cursor-pointer shadow-sm"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              {downloaded ? <Check className="w-4 h-4 text-emerald-300" /> : <Download className="w-4 h-4" />}
              <span>{downloaded ? 'Downloaded .md File!' : 'Download .md File'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
