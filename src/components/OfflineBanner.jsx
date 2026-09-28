import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="glass-header sticky top-16 z-30 bg-amber-500/15 border-b border-amber-500/30 px-4 py-2 text-center text-xs font-bold text-amber-800 dark:text-amber-200 backdrop-blur-md flex items-center justify-center gap-2 animate-in fade-in">
      <WifiOff className="w-4 h-4 text-amber-500 animate-pulse" />
      <span>You are currently offline. Showing cached campus listings. Changes will sync when reconnected.</span>
    </div>
  );
}
