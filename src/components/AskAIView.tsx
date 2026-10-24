import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  BookOpen, 
  History, 
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { VideoItem, QAResponse, Citation } from '../types';
import { KnowledgeStore } from '../services/knowledgeStore';

interface AskAIViewProps {
  videos: VideoItem[];
  onOpenVideoAtTimestamp: (video: VideoItem, timestampSeconds: number) => void;
  prefillQuery?: string;
}

export const AskAIView: React.FC<AskAIViewProps> = ({
  videos,
  onOpenVideoAtTimestamp,
  prefillQuery = ''
}) => {
  const [question, setQuestion] = useState(prefillQuery);
  const [selectedVideoFilter, setSelectedVideoFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [currentQA, setCurrentQA] = useState<QAResponse | null>(null);
  const [history, setHistory] = useState<QAResponse[]>(() => KnowledgeStore.getQAHistory());
  const [error, setError] = useState<string | null>(null);

  const suggestedPrompts = [
    'What are the core rules for clean architecture and domain boundaries?',
    'How do I prevent cache stampedes and cascading failures in distributed systems?',
    'What is the recommended focus routine and cognitive load framework?',
    'Does any video discuss GraphQL or Kubernetes?' // To demonstrate honest uncertainty!
  ];

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q || isLoading) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          videos,
          filterVideoId: selectedVideoFilter === 'all' ? undefined : selectedVideoFilter
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to synthesize answer');
      }

      const result: QAResponse = await response.json();
      setCurrentQA(result);
      const updatedHistory = KnowledgeStore.saveQA(result);
      setHistory(updatedHistory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error occurred while querying Knowledge AI');
    } finally {
      setIsLoading(false);
    }
  };

  const findVideoById = (videoId: string): VideoItem | undefined => {
    return videos.find(v => v.id === videoId);
  };

  const getConfidenceBadge = (confidence: string, score: number) => {
    if (score >= 80 || confidence === 'high') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
          High Confidence ({score}%) &bull; Grounded in Library
        </span>
      );
    }
    if (score >= 50 || confidence === 'medium') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-400" />
          Partial Evidence ({score}%) &bull; Gaps Exist
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
        <HelpCircle className="w-3.5 h-3.5 mr-1 text-rose-400" />
        Uncertain ({score}%) &bull; Sparse or Missing in Videos
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      
      {/* Page Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cross-Video Citation & Reasoning</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Ask My Knowledge AI
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Query your entire analyzed video library. Answers cite exact source videos and timestamps, and declare uncertainty whenever facts are missing.
        </p>
      </div>

      {/* Query Bar & Scope Selection */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3.5">
        
        {/* Scope selector */}
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Search Scope:</span>
          </div>

          <select
            value={selectedVideoFilter}
            onChange={(e) => setSelectedVideoFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Videos ({videos.length} videos)</option>
            {videos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.title.length > 40 ? v.title.substring(0, 40) + '...' : v.title}
              </option>
            ))}
          </select>
        </div>

        {/* Input & Submit */}
        <div className="relative">
          <textarea
            rows={3}
            placeholder="Ask anything about architecture, rules, algorithms, or concepts in your videos..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleAsk();
              }
            }}
            className="w-full p-3.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
          />

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Press Enter to ask &bull; Cites source videos & timestamps
            </span>
            <button
              onClick={() => handleAsk()}
              disabled={isLoading || !question.trim()}
              className="ml-auto flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Answer...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Ask Knowledge AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Suggested Prompts */}
        <div className="pt-2 border-t border-slate-800/80">
          <p className="text-[11px] font-semibold text-slate-400 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuestion(prompt);
                  handleAsk(prompt);
                }}
                className="text-left px-3 py-1.5 rounded-lg bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 text-slate-300 text-xs transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/40 text-rose-200 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-rose-100">Query Notice</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* CURRENT ANSWER CARD */}
      {currentQA && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-2xl space-y-5">
          
          {/* Question & Confidence Header */}
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Question Answered
              </span>
              {getConfidenceBadge(currentQA.confidence, currentQA.confidence_score)}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">
              {currentQA.question}
            </h2>
          </div>

          {/* Answer Body */}
          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap space-y-3">
            {currentQA.answer}
          </div>

          {/* Honest Uncertainty Alert (Rule 6: Show uncertainty instead of inventing facts) */}
          {currentQA.uncertainty_notice && (
            <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-100">
                  Integrity & Uncertainty Declaration:
                </p>
                <p className="leading-relaxed text-amber-200/90">
                  {currentQA.uncertainty_notice}
                </p>
              </div>
            </div>
          )}

          {/* Source Citations (Rule 5: Cite source video & timestamp) */}
          {currentQA.citations && currentQA.citations.length > 0 && (
            <div className="pt-4 border-t border-slate-800 space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Verified Source Citations ({currentQA.citations.length}):</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentQA.citations.map((cite: Citation, idx: number) => {
                  const matchedVideo = findVideoById(cite.video_id);
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-2 group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs font-bold text-white line-clamp-1">
                            {cite.video_title}
                          </p>

                          {/* Timestamp Play Button */}
                          <button
                            onClick={() => {
                              if (matchedVideo) {
                                onOpenVideoAtTimestamp(matchedVideo, cite.timestamp_seconds);
                              }
                            }}
                            className="flex-shrink-0 flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 text-xs font-mono font-semibold transition-all shadow-sm"
                            title="Open video at this timestamp"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>{cite.timestamp_label}</span>
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-300 italic mt-1.5 leading-snug">
                          &ldquo;{cite.quote_or_context}&rdquo;
                        </p>
                      </div>

                      <div className="pt-1 text-[10px] text-slate-500">
                        Second: #{cite.timestamp_seconds}s &bull; Click timestamp to seek
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}

      {/* QA History Drawer */}
      {history.length > 0 && (
        <div className="pt-4 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            <History className="w-3.5 h-3.5" />
            <span>Recent Questions ({history.length})</span>
          </div>

          <div className="space-y-2">
            {history.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setCurrentQA(item);
                  setQuestion(item.question);
                }}
                className="p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="space-y-0.5 truncate mr-3">
                  <p className="font-semibold text-slate-200 truncate">
                    {item.question}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {item.answer.substring(0, 90)}...
                  </p>
                </div>
                <div className="flex-shrink-0 flex items-center space-x-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.confidence === 'high' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'
                  }`}>
                    {item.confidence_score}%
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {item.citations.length} citations
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
