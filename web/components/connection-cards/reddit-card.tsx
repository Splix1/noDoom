'use client';

import { Switch } from "@/components/ui/switch";
import { API_URL } from '@/utils/config';

interface RedditCardProps {
  isConnected: boolean;
  onDisconnect?: () => void;
  onStatusChange?: () => void;
}

export function RedditCard({ isConnected, onStatusChange }: RedditCardProps) {
  const handleConnect = async () => {
    if (isConnected) {
      await fetch(`${API_URL}/api/reddit/disconnect`, { method: 'POST' });
      if (onStatusChange) onStatusChange();
    } else {
      // Implement Reddit OAuth flow
      window.location.href = `${API_URL}/api/reddit/connect`;
    }
  };

  return (
    <div className="flex items-center p-4 bg-card rounded-lg border w-[600px]">
      <div className="flex items-center gap-3 flex-1">
        <div className="text-2xl">🤖</div>
        <span className="text-sm text-muted-foreground">
          {isConnected ? 'Connected' : 'Not Connected'}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={handleConnect}
          className={`px-3 py-1 rounded-md text-sm ${
            isConnected 
              ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {isConnected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  );
} 