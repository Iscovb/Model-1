import React from 'react';
import { 
  BookOpen, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  SlidersHorizontal,
  Database,
  CheckCircle2,
  AlertCircle,
  Download,
  Smartphone,
  Tablet
} from 'lucide-react';
import { SystemStatus } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface NavbarProps {
  activeTab: 'add' | 'library' | 'rules' | 'ask';
  setActiveTab: (tab: 'add' | 'library' | 'rules' | 'ask') => void;
  systemStatus: SystemStatus;
  openSetupModal: () => void;
  openInstallModal: () => void;
  videoCount: number;
  rulesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  systemStatus,
  openSetupModal,
  openInstallModal,
  videoCount,
  rulesCount
}) => {
  const { isInstalled, isInstallable } = usePWAInstall();

  return (
    <>
      {/* Top Mobile / Tablet Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 pt-[env(safe-area-inset-top,0px)]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo & Mobile Brand */}
          <div 
            className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer select-none" 
            onClick={() => setActiveTab('library')}
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-500/20 flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white font-sans">
                  My Knowledge <span className="text-indigo-400">AI</span>
                </span>
                {isInstalled ? (
                  <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    App Mode
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 flex items-center gap-1">
                    <Tablet className="w-3 h-3" />
                    Tablet App
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Video Knowledge Extractor & Citation Engine
              </p>
            </div>
          </div>

          {/* Tablet & Desktop Nav links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('library')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Library</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'library' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {videoCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rules')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Saved Rules</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'rules' ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {rulesCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ask')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'ask'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask My AI</span>
            </button>

            <button
              onClick={() => setActiveTab('add')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ml-2 cursor-pointer ${
                activeTab === 'add'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'text-emerald-400 hover:bg-emerald-500/10 border border-emerald-500/30'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Video</span>
            </button>
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center space-x-2">
            
            {/* Install Mobile App Button (visible when not yet installed in standalone mode) */}
            {!isInstalled && (
              <button
                onClick={openInstallModal}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
                title="Install as full-screen Android tablet or mobile app"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Install App</span>
              </button>
            )}

            {/* Database / Backend Status */}
            <button
              onClick={openSetupModal}
              className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                systemStatus.supabase_connected && systemStatus.supabase_tables_ready
                  ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-900/30'
              }`}
              title="Configure Supabase and Gemini API settings"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {systemStatus.supabase_connected && systemStatus.supabase_tables_ready
                  ? 'Supabase: Active'
                  : 'Prototype Mode'}
              </span>
              {systemStatus.supabase_connected && systemStatus.supabase_tables_ready ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              )}
            </button>

            {/* Settings Button */}
            <button
              onClick={openSetupModal}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              aria-label="Settings"
              title="Settings & Setup"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Native Mobile & Android Tablet Bottom Navigation Dock */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl px-2 pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
      >
        <div className="grid grid-cols-4 items-center max-w-lg mx-auto">
          
          {/* Tab 1: Library */}
          <button
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === 'library'
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'library' && (
              <span className="absolute -top-1 w-8 h-1 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500" />
            )}
            <div className="relative">
              <BookOpen className="w-5 h-5 mb-0.5" />
              {videoCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-bold rounded-full bg-indigo-600 text-white leading-none">
                  {videoCount}
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-tight">Library</span>
          </button>

          {/* Tab 2: Rules */}
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === 'rules'
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'rules' && (
              <span className="absolute -top-1 w-8 h-1 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500" />
            )}
            <div className="relative">
              <ShieldCheck className="w-5 h-5 mb-0.5" />
              {rulesCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 flex items-center justify-center text-[10px] font-bold rounded-full bg-indigo-600 text-white leading-none">
                  {rulesCount}
                </span>
              )}
            </div>
            <span className="text-[11px] tracking-tight">Rules</span>
          </button>

          {/* Tab 3: Ask AI */}
          <button
            onClick={() => setActiveTab('ask')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === 'ask'
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {activeTab === 'ask' && (
              <span className="absolute -top-1 w-8 h-1 rounded-full bg-indigo-500 shadow-sm shadow-indigo-500" />
            )}
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span className="text-[11px] tracking-tight">Ask AI</span>
          </button>

          {/* Tab 4: Add Video (Elevated Action Button) */}
          <button
            onClick={() => setActiveTab('add')}
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all cursor-pointer relative ${
              activeTab === 'add'
                ? 'text-emerald-400 font-semibold'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            {activeTab === 'add' && (
              <span className="absolute -top-1 w-8 h-1 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500" />
            )}
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center mb-0.5 ${
              activeTab === 'add' 
                ? 'bg-emerald-500 text-slate-950 font-bold' 
                : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <Plus className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[11px] tracking-tight">Add Video</span>
          </button>

        </div>
      </nav>
    </>
  );
};
