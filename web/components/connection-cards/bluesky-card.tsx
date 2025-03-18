'use client';
import { BlueskyConnectModal } from '@/components/bluesky-connect-modal';
import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { API_URL } from '@/utils/config';

interface BlueskyCardProps {
  isConnected: boolean;
  handle: string | null;
  onStatusChange?: () => void;
}

export function BlueskyCard({ isConnected: initialIsConnected, handle: initialHandle, onStatusChange }: BlueskyCardProps) {
  const [isConnected, setIsConnected] = useState(initialIsConnected);
  const [handle, setHandle] = useState(initialHandle);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();

  const handleConnect = async () => {
    if (isConnected) {
      try {
        // Get the session data
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          throw new Error('Not authenticated');
        }

        const response = await fetch(`${API_URL}/api/bluesky/disconnect`, { 
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (response.ok) {
          setIsConnected(false);
          setHandle(null);
          if (onStatusChange) onStatusChange();
        } else {
          console.error('Failed to disconnect from Bluesky');
        }
      } catch (error) {
        console.error('Failed to disconnect from Bluesky:', error);
      }
    } else {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex items-center p-4 bg-card rounded-lg border w-[600px]">
        <div className="flex flex-col flex-1">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🦋</div>
            <span className="text-sm text-muted-foreground">
              {isConnected ? `Connected (${handle})` : 'Not Connected'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isConnected 
              ? "You can revoke access anytime by disconnecting here or deleting the App Password on Bluesky."
              : "App Passwords provide limited API access for specific applications. The password you create will only be used by noDoom to fetch your feed."}
          </p>
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
        onConnect={async (newHandle: string) => {
          setIsConnected(true);
          setHandle(newHandle);
          setIsModalOpen(false);
          if (onStatusChange) onStatusChange();
        }}
      />
    </>
  );
} 