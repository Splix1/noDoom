'use client';

import { Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useRouter } from 'next/navigation';
import { TimelineContent } from './TimelineContent';
import { fetchTimelineData } from './timelineApi';
import { createClient } from '@/utils/supabase/client';

// Loading Component
function TimelineLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// Error Fallback Component
function TimelineErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 text-center">
      <h2 className="text-lg font-semibold mb-2">Something went wrong!</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
      >
        Try again
      </button>
    </div>
  );
}

// Main Page Component
export default function TimelinePage() {
  const router = useRouter();
  const [canShowTimeline, setCanShowTimeline] = useState(false);

  useEffect(() => {
    async function checkSessionAndConnections() {
      const supabase = createClient();
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
          return;
        }

        // Try to fetch timeline to check for connections
        const response = await fetch('http://localhost:5115/api/timeline', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
          credentials: 'include'
        });

        const text = await response.text();
        if (text.includes('No connections found')) {
          router.replace('/settings');
          return;
        }

        // If we get here, we have both session and connections
        setCanShowTimeline(true);
      } catch (error) {
        console.error('Session check failed:', error);
        router.replace('/login');
      }
    }

    checkSessionAndConnections();
  }, [router]);

  if (!canShowTimeline) {
    return <TimelineLoading />;
  }

  return (
    <div className="container py-4">
      <ErrorBoundary FallbackComponent={TimelineErrorFallback}>
        <Suspense fallback={<TimelineLoading />}>
          <TimelineContent timelinePromise={fetchTimelineData()} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}