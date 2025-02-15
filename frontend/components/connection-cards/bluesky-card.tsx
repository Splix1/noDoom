'use client';

import { Switch } from "@/components/ui/switch";
import { BlueskyConnectModal } from '@/components/bluesky-connect-modal';
import { useState } from 'react';

interface BlueskyCardProps {
  isConnected: boolean;
  handle: string | null;
}

export function BlueskyCard({ isConnected, handle }: BlueskyCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleConnect = async () => {
    if (isConnected) {
      // Call the disconnect server action
      // await fetch('/api/bluesky/disconnect', { method: 'POST' });
      // Refresh the page to update the connection state
      window.location.reload();
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-center p-4 bg-card rounded-lg border w-[600px]">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-2xl">🦋</div>
          <span className="text-sm text-muted-foreground">
            {isConnected ? `Connected (${handle})` : 'Not Connected'}
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

      <BlueskyConnectModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnect={async () => {
          // Refresh the page after successful connection
          window.location.reload();
        }}
      />
    </>
  );
} 