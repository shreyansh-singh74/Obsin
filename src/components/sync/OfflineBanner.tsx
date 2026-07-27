import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    function handleOnline() {
      setIsOffline(false);
    }
    function handleOffline() {
      setIsOffline(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Request persistent storage
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist().then((persistent) => {
        if (persistent) {
          console.log('IndexedDB storage persistence granted by browser.');
        }
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="bg-[var(--warning-bg)] border-b border-[var(--warning-text)]/30 px-4 py-1.5 text-xs text-[var(--warning-text)] flex items-center justify-center gap-2 font-mono shadow-inner">
      <WifiOff className="w-3.5 h-3.5 text-[var(--warning-text)] shrink-0" />
      <span>Offline Mode — Reading notes locally from IndexedDB</span>
    </div>
  );
};
