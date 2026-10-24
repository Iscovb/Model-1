import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Play, 
  Copy, 
  Check, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  ExternalLink,
  Filter,
  FileText,
  Download
} from 'lucide-react';
import { VideoItem, Rule } from '../types';
import { downloadMarkdownFile } from '../utils/markdownExport';

interface SavedRulesViewProps {
  videos: VideoItem[];
  onOpenVideoAtTimestamp: (video: VideoItem, timestampSeconds: number) => void;
}

export const SavedRulesView: React.FC<SavedRulesViewProps> = ({
  videos,
  onOpenVideoAtTimestamp
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [exportedRules, setExportedRules] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<'all' | 'essential' | 'recommended' | 'avoid'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Aggregate all rules across all videos
  const allRules = useMemo(() => {
    const list: { rule: Rule; video: VideoItem }[] = [];
    videos.forEach(v => {
      (v.rules || []).forEach(r => {
        list.push({ rule: r, video: v });
      });
    });
    return list;
  }, [videos]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    allRules.forEach(item => {
      if (item.rule.category) set.add(item.rule.category);
    });
    return Array.from(set);
  }, [allRules]);

  // Filter rules
  const filteredRules = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return allRules.filter(({ rule, video }) => {
      const matchesSeverity = severityFilter === 'all' || rule.severity === severityFilter;
      const matchesCategory = !selectedCategory || rule.category === selectedCategory;
      if (!matchesSeverity || !matchesCategory) return false;

      if (!q) return true;
      return (
        rule.rule_statement.toLowerCase().includes(q) ||
        rule.rationale.toLowerCase().includes(q) ||
        video.title.toLowerCase().includes(q) ||
        (rule.category || '').toLowerCase().includes(q)
      );
    });
  }, [allRules, searchQuery, severityFilter, selectedCategory]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const essentialCount = allRules.filter(r => r.rule.severity === 'essential').length;
  const recommendedCount = allRules.filter(r => r.rule.severity === 'recommended').length;
  const avoidCount = allRules.filter(r => r.rule.severity === 'avoid').length;

  const handleExportAllRules = () => {
    if (allRules.length === 0) return;
    const nowStr = new Date().toISOString().split('T')[0];
    let md = `# 🛡️ Master Repository of Distilled Rules & Directives\n\n`;
    md += `> Generated on ${nowStr} across ${videos.length} analyzed videos in My Knowledge AI.\n`;
    md += `> Total Rules: ${allRules.length} (Essential: ${essentialCount}, Recommended: ${recommendedCount}, Avoid: ${avoidCount})\n\n`;
    md += `---\n\n`;

    filteredRules.forEach(({ rule, video }, idx) => {
      const severityLabel = rule.severity.toUpperCase();
      md += `### ${idx + 1}. [${severityLabel}] "${rule.rule_statement}"\n\n`;
      md += `- **Rationale**: ${rule.rationale}\n`;
      md += `- **Source Video**: ${video.title}\n`;
      md += `- **Timestamp**: \`${rule.timestamp_label}\` (${rule.timestamp_seconds}s)\n`;
      if (rule.category) {
        md += `- **Category**: \`${rule.category}\`\n`;
      }
      md += `\n`;
    });

    downloadMarkdownFile('Knowledge_AI_Extracted_Rules', md);
    setExportedRules(true);
    setTimeout(() => setExportedRules(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Distilled Directives & Invariants</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Saved Knowledge Rules ({allRules.length})
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Every heuristic and rule extracted across all analyzed videos, cross-referenced with exact video timestamps.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Severity Filter Badges */}
          <div className="flex items-center space-x-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
            <button
              onClick={() => setSeverityFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                severityFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({allRules.length})
            </button>
            <button
              onClick={() => setSeverityFilter('essential')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                severityFilter === 'essential'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              Essential ({essentialCount})
            </button>
            <button
              onClick={() => setSeverityFilter('recommended')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                severityFilter === 'recommended'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              Recommended ({recommendedCount})
            </button>
            <button
              onClick={() => setSeverityFilter('avoid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                severityFilter === 'avoid'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              Avoid ({avoidCount})
            </button>
          </div>

          {/* Export Rules as Markdown */}
          {allRules.length > 0 && (
            <button
              onClick={handleExportAllRules}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
              title="Export all rules as Markdown for external notes"
            >
              {exportedRules ? <Check className="w-4 h-4 text-emerald-400" /> : <Download className="w-4 h-4 text-indigo-400" />}
              <span>{exportedRules ? 'Rules Exported!' : 'Export Rules (.md)'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Search and Category Chips */}
      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search rules, rationale, or source videos..."
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

        {categories.length > 0 && (
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-400 font-medium flex items-center mr-1">
              <Filter className="w-3 h-3 mr-1" />
              Category:
            </span>
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                selectedCategory === null
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rules Grid (Tablet 2-col, Desktop 2-col or 3-col) */}
      {filteredRules.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRules.map(({ rule, video }) => (
            <div
              key={rule.id}
              className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3.5 group shadow-lg shadow-black/20"
            >
              {/* Header: Severity & Timestamp */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      rule.severity === 'essential'
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                        : rule.severity === 'avoid'
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                        : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                    }`}>
                      {rule.severity}
                    </span>

                    {rule.category && (
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md">
                        {rule.category}
                      </span>
                    )}
                  </div>

                  {/* Play at Timestamp Button */}
                  <button
                    onClick={() => onOpenVideoAtTimestamp(video, rule.timestamp_seconds)}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-mono transition-all cursor-pointer shadow-sm"
                    title={`Jump into video "${video.title}" at ${rule.timestamp_label}`}
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{rule.timestamp_label}</span>
                  </button>
                </div>

                {/* Rule Statement */}
                <h3 className="text-sm sm:text-base font-bold text-white leading-snug group-hover:text-indigo-200 transition-colors">
                  &ldquo;{rule.rule_statement}&rdquo;
                </h3>

                {/* Rationale */}
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-400">Why: </span>
                  {rule.rationale}
                </div>
              </div>

              {/* Source Video & Copy Action */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => onOpenVideoAtTimestamp(video, rule.timestamp_seconds)}
                  className="text-slate-400 hover:text-indigo-300 truncate max-w-[280px] sm:max-w-xs text-left font-medium transition-colors"
                >
                  From: <span className="underline decoration-slate-700">{video.title}</span>
                </button>

                <button
                  onClick={() => handleCopy(rule.id, `Rule: "${rule.rule_statement}"\nWhy: ${rule.rationale}\nSource: ${video.title} [${rule.timestamp_label}]`)}
                  className="flex items-center space-x-1 text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800 transition-colors"
                  title="Copy rule with citation"
                >
                  {copiedId === rule.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[11px] text-emerald-300">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px]">Copy</span>
                    </>
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-slate-900/30 border border-slate-800 rounded-3xl space-y-3 max-w-lg mx-auto">
          <ShieldCheck className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-base font-semibold text-white">No rules matched your criteria</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search terms or severity filter.
          </p>
        </div>
      )}

    </div>
  );
};
