'use client';
import { useState, useEffect } from 'react';
import { BlueskyCard } from '@/components/connection-cards/bluesky-card';
import { RedditCard } from '@/components/connection-cards/reddit-card';
import { createClient } from '@/utils/supabase/client';
import { API_URL } from '@/utils/config';

interface Connection {
  platform: string;
  handle?: string | null;
}

export function ConnectionsSection({ initialConnections }: { initialConnections: Connection[] }) {
  const [connections, setConnections] = useState(initialConnections);
  const supabase = createClient();
  
  // Create connection map
  const connectionMap = Object.fromEntries(
    connections.map(conn => [conn.platform, conn.handle || true])
  );
  
  const blueskyIsConnected = 'bluesky' in connectionMap;
  const redditIsConnected = 'reddit' in connectionMap;
  const hasAnyConnection = blueskyIsConnected || redditIsConnected;

  // Function to refresh connections
  const refreshConnections = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    const response = await fetch(`${API_URL}/api/connections`, {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    
    if (response.ok) {
      const newConnections = await response.json() as Connection[];
      setConnections(newConnections);
    }
  };

  return (
    <>
      {/* Info message about connections - only show if no connections */}
      {!hasAnyConnection && (
        <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-2 text-sm">
          <p>You need to connect a Bluesky or Reddit account to view your timeline.</p>
        </div>
      )}
      
      {/* Connections Section */}
      <div className="flex flex-col gap-4">
        <BlueskyCard 
          isConnected={blueskyIsConnected} 
          handle={typeof connectionMap.bluesky === 'string' ? connectionMap.bluesky : null}
          onStatusChange={refreshConnections}
        />
        <RedditCard 
          isConnected={redditIsConnected} 
          onStatusChange={refreshConnections}
        />
      </div>
    </>
  );
} 