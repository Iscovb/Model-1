import React, { useState } from 'react';
import { 
  X, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  Key, 
  UploadCloud, 
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import { SystemStatus, VideoItem } from '../types';
import { SUPABASE_SQL_SCHEMA } from '../data/seedData';
import { KnowledgeStore } from '../services/knowledgeStore';

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  systemStatus: SystemStatus;
  refreshStatus: () => Promise<void>;
  videos: VideoItem[];
  onResetSeed: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({
  isOpen,
  onClose,
  systemStatus,
  refreshStatus,
  videos,
  onResetSeed
}) => {
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'supabase' | 'gemini' | 'data'>('supabase');

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleTestConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseKey.trim()) {
      setTestResult({ success: false, message: 'Please enter both Supabase URL and Anon Key.' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await KnowledgeStore.testSupabaseConnection(supabaseUrl, supabaseKey);
      if (res.success) {
        KnowledgeStore.saveSupabaseConfig({
          url: supabaseUrl.trim(),
          anonKey: supabaseKey.trim(),
          isConfigured: true,
          status: 'connected',
          tablesStatus: {
            videos: true,
            lessons: true,
            rules: true
          }
        });
        setTestResult({ success: true, message: res.message || 'Connected and verified!' });
        await refreshStatus();
      } else {
        setTestResult({ success: false, message: res.error || 'Connection failed' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err?.message || 'Network error during test' });
    } finally {
      setTesting(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await KnowledgeStore.syncToSupabase(videos);
      if (res.success) {
        setSyncResult(`Successfully synchronized ${res.count} videos, lessons, and rules to Supabase!`);
      } else {
        setSyncResult(`Sync failed: ${res.error || 'Unknown error'}`);
      }
    } catch (err: any) {
      setSyncResult(`Sync failed: ${err.message}`);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">System & Storage Setup</h2>
              <p className="text-xs text-slate-400">Configure Supabase persistence and verify Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Current Mode:</span>
            {systemStatus.supabase_connected && systemStatus.supabase_tables_ready ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                Live Supabase Database
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                <AlertCircle className="w-3.5 h-3.5 mr-1" />
                Working Prototype (Local + Server Cache)
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Gemini 3.8:</span>
            {systemStatus.gemini_connected ? (
              <span className="text-emerald-400 font-medium flex items-center">
                <Check className="w-3.5 h-3.5 mr-1" /> Ready
              </span>
            ) : (
              <span className="text-amber-400 font-medium flex items-center">
                <Info className="w-3.5 h-3.5 mr-1" /> Server Key Required
              </span>
            )}
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 px-6 pt-2 bg-slate-900/30">
          <button
            onClick={() => setActiveTab('supabase')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'supabase'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Supabase Setup Guide
          </button>
          <button
            onClick={() => setActiveTab('gemini')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'gemini'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Gemini API Status
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'data'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Data Management
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'supabase' && (
            <div className="space-y-6">
              {/* Step by step guide */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-sm">
                  <h3 className="font-semibold text-white mb-2 flex items-center">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-xs flex items-center justify-center mr-2 text-white">1</span>
                    Create or open your Supabase Project
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed mb-2">
                    Sign in to your free account at Supabase. It takes less than 30 seconds to create a project.
                  </p>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    Open Supabase Dashboard <ExternalLink className="w-3.5 h-3.5 ml-1" />
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-white flex items-center">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-xs flex items-center justify-center mr-2 text-white">2</span>
                      Execute 1-Click Database Schema
                    </h3>
                    <button
                      onClick={handleCopySql}
                      className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
                    </button>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    In your Supabase Dashboard, click <strong>SQL Editor</strong> &rarr; <strong>New Query</strong>, paste the schema, and click <strong>Run</strong>. This creates the <code className="text-indigo-300">videos</code>, <code className="text-indigo-300">lessons</code>, <code className="text-indigo-300">rules</code>, and <code className="text-indigo-300">examples</code> tables with security policies.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 text-sm">
                  <h3 className="font-semibold text-white mb-2 flex items-center">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-xs flex items-center justify-center mr-2 text-white">3</span>
                    Enter Credentials & Test Connection
                  </h3>
                  <p className="text-slate-300 text-xs leading-relaxed mb-3">
                    Find these in Supabase under <strong>Project Settings &rarr; API</strong>.
                  </p>

                  <form onSubmit={handleTestConnection} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Supabase Project URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://xyzcompany.supabase.co"
                        value={supabaseUrl}
                        onChange={(e) => setSupabaseUrl(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Supabase Anon / Public Key
                      </label>
                      <input
                        type="password"
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI..."
                        value={supabaseKey}
                        onChange={(e) => setSupabaseKey(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 font-mono text-xs"
                      />
                    </div>

                    <div className="flex items-center space-x-3 pt-2">
                      <button
                        type="submit"
                        disabled={testing}
                        className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
                      >
                        {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
                        <span>{testing ? 'Testing...' : 'Test & Save Connection'}</span>
                      </button>

                      {systemStatus.supabase_connected && (
                        <button
                          type="button"
                          onClick={handleSyncToSupabase}
                          disabled={syncing}
                          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-colors"
                        >
                          {syncing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <UploadCloud className="w-3.5 h-3.5" />}
                          <span>{syncing ? 'Syncing...' : 'Sync Local Library to Supabase'}</span>
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Feedback Message */}
                  {testResult && (
                    <div className={`mt-3 p-3 rounded-xl text-xs ${testResult.success ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-200' : 'bg-rose-950/60 border border-rose-500/30 text-rose-200'}`}>
                      {testResult.message}
                    </div>
                  )}

                  {syncResult && (
                    <div className="mt-3 p-3 rounded-xl text-xs bg-emerald-950/60 border border-emerald-500/30 text-emerald-200">
                      {syncResult}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'gemini' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-semibold text-white text-sm">Server-Side Gemini 3.8 Flash</h3>
                  </div>
                  <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${systemStatus.gemini_connected ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'}`}>
                    {systemStatus.gemini_connected ? 'Active & Ready' : 'Pending Key Injection'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Video processing and grounding operate exclusively through the secure Express backend using the official <code className="text-indigo-300">@google/genai</code> SDK.
                </p>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex items-center text-slate-300">
                    <Key className="w-3.5 h-3.5 text-indigo-400 mr-2" />
                    <span><strong>Security Standard:</strong> API keys are never exposed to browser or client code.</span>
                  </div>
                  <div className="flex items-center text-slate-300">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 mr-2" />
                    <span><strong>Model:</strong> Gemini 3.8 Flash with structured JSON schemas and search grounding.</span>
                  </div>
                </div>

                <div className="text-xs text-slate-400 pt-1">
                  In Google AI Studio, your <code className="text-slate-200">GEMINI_API_KEY</code> is automatically injected via the project secrets panel.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3">
                <h3 className="font-semibold text-white text-sm">Restore Sample Demonstration Data</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Reset the library to 3 pre-analyzed videos (Clean Architecture, Distributed Systems, Deep Work) with over 15 timestamped lessons, actionable rules, and code examples.
                </p>
                <button
                  onClick={() => {
                    onResetSeed();
                    alert('Sample videos restored!');
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Reload 3 Seed Knowledge Videos
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
