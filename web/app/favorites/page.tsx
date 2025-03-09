'use client';

import { Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useRouter } from 'next/navigation';
import { TimelineContent } from '../timeline/TimelineContent';
import { fetchFavoritesData } from './favoritesApi';
import { createClient } from '@/utils/supabase/client';
import { FeedNavigation } from '@/components/FeedNavigation';
import { Post } from '../timeline/types';

// Loading Component
function FavoritesLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}

// Error Fallback Component
function FavoritesErrorFallback({ error }: { error: Error }) {
  return (
    <div className="p-4 text-center">
      <h2 className="text-lg font-semibold mb-2">Something went wrong! Try again later.</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
    </div>
  );
}

// Main Page Component
export default function FavoritesPage() {
  const router = useRouter();
  const [canShowFavorites, setCanShowFavorites] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    async function checkSession() {
      const supabase = createClient();
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace('/login');
          return;
        }

        // If we get here, we have a session
        setCanShowFavorites(true);
        const favoritedPosts = await fetchFavoritesData();
        setPosts(favoritedPosts);
      } catch (error) {
        console.error('Session check failed:', error);
        router.replace('/login');
      }
    }

    checkSession();
  }, [router]);

  const handlePostUpdate = (updatedPost: Post) => {
    if (!updatedPost.isFavorite) {
      // Remove the unfavorited post from the list
      setPosts(currentPosts => currentPosts.filter(post => post.id !== updatedPost.id));
    }
  };

  if (!canShowFavorites) {
    return <FavoritesLoading />;
  }

  return (
    <div className="container py-4">
      <FeedNavigation />
      <ErrorBoundary FallbackComponent={FavoritesErrorFallback}>
        <Suspense fallback={<FavoritesLoading />}>
          <TimelineContent timelinePromise={Promise.resolve(posts)} onPostUpdate={handlePostUpdate} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
} 