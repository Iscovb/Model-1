import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/90 text-slate-950 font-semibold text-xs shadow-xl backdrop-blur-md border border-amber-300 animate-bounce">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Cached video knowledge is accessible</span>
    </div>
  );
};
