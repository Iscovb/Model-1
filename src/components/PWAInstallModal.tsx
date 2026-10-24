import React from 'react';
import { 
  Download, 
  Smartphone, 
  Tablet, 
  X, 
  CheckCircle2, 
  Share2, 
  PlusSquare, 
  Sparkles,
  Zap,
  WifiOff,
  Maximize2
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-5 sm:p-6 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Icon & Badge */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/25 flex-shrink-0 flex items-center justify-center">
            <img 
              src="/icon.svg" 
              alt="My Knowledge AI" 
              className="w-12 h-12 rounded-xl"
              onError={(e) => {
                // fallback if svg fails
                e.currentTarget.style.display = 'none';
              }} 
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-lg text-white">My Knowledge AI</h3>
            </div>
            <p className="text-xs text-indigo-300 font-medium flex items-center gap-1">
              <Tablet className="w-3.5 h-3.5" />
              <span>Android Tablet & Mobile App</span>
            </p>
          </div>
        </div>

        {/* Status notice */}
        {isInstalled ? (
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-center space-x-3 mb-5">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
            <div className="text-xs">
              <p className="font-semibold text-emerald-200">Mobile Application Installed!</p>
              <p className="text-emerald-400/90">Running in standalone native window mode.</p>
            </div>
          </div>
        ) : (
          <p className="text-xs sm:text-sm text-slate-300 mb-5 leading-relaxed">
            Install <strong className="text-white">My Knowledge AI</strong> on your Android tablet or phone to run as a full-screen mobile app with no browser URL bar or distractions.
          </p>
        )}

        {/* App Benefits List */}
        <div className="space-y-2.5 mb-6 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center space-x-2.5 text-xs text-slate-300">
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
            <span><strong>Full-Screen Standalone:</strong> Hides browser navigation bar</span>
          </div>
          <div className="flex items-center space-x-2.5 text-xs text-slate-300">
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <span><strong>Touch-Optimized:</strong> Custom bottom dock and tablet 2-pane view</span>
          </div>
          <div className="flex items-center space-x-2.5 text-xs text-slate-300">
            <div className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400">
              <WifiOff className="w-3.5 h-3.5" />
            </div>
            <span><strong>Offline Caching:</strong> Fast loading with local knowledge persistence</span>
          </div>
        </div>

        {/* Installation Actions */}
        {!isInstalled && (
          <div className="space-y-3">
            {isInstallable ? (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                <span>Install Mobile App (1-Click)</span>
              </button>
            ) : isIOS ? (
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
                <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-400" />
                  Install on iPad / iPhone:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                  <li>
                    Tap the <strong className="text-white">Share</strong> button <Share2 className="w-3 h-3 inline text-indigo-300 mx-0.5" /> in Safari
                  </li>
                  <li>
                    Scroll down and tap <strong className="text-white">Add to Home Screen</strong> <PlusSquare className="w-3 h-3 inline text-indigo-300 mx-0.5" />
                  </li>
                </ol>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs space-y-2">
                <p className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Tablet className="w-4 h-4 text-indigo-400" />
                  Install on Android Tablet (Chrome / Edge):
                </p>
                <p className="text-slate-300">
                  Tap your browser menu (<strong className="text-white">⋮ 3 dots</strong> top right) &rarr; select <strong className="text-indigo-300">"Install app"</strong> or <strong className="text-indigo-300">"Add to Home Screen"</strong>.
                </p>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
        >
          {isInstalled ? 'Done' : 'Continue Using in Browser'}
        </button>

      </div>
    </div>
  );
};
