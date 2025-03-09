'use client';

import { createClient } from '@/utils/supabase/client';
import { Post } from './types';

// Format time ago helper function
export const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y`;
  if (months > 0) return `${months}mo`;
  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
};

// Mock data for development/testing (commented out)
/*
const mockPosts: Post[] = [
  {
    id: "1",
    platform: "bluesky",
    authorName: "Test User",
    authorHandle: "test.bsky.social",
    authorAvatar: "https://picsum.photos/200",
    content: "Check out these amazing landscapes! 🏞️",
    createdAt: new Date(Date.now() - 45 * 1000).toISOString(), // 45 seconds ago
    likeCount: 42,
    media: [
      {
        type: "image",
        url: "https://picsum.photos/800/600?random=1",
        thumbnailUrl: "https://picsum.photos/400/300?random=1",
        description: "Mountain landscape"
      },
      {
        type: "image",
        url: "https://picsum.photos/800/600?random=2",
        thumbnailUrl: "https://picsum.photos/400/300?random=2",
        description: "Ocean view"
      },
      {
        type: "image",
        url: "https://picsum.photos/800/600?random=3",
        thumbnailUrl: "https://picsum.photos/400/300?random=3",
        description: "Forest scene"
      },
      {
        type: "image",
        url: "https://picsum.photos/800/600?random=4",
        thumbnailUrl: "https://picsum.photos/400/300?random=4",
        description: "Desert vista"
      }
    ]
  },
  {
    id: "2",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://picsum.photos/202",
    content: "This is from a few minutes ago",
    createdAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(), // 7 minutes ago
    media: [{
      type: 'image',
      url: 'https://picsum.photos/800/601',
      thumbnailUrl: 'https://picsum.photos/400/301'
    }],
    likeCount: 0
  },
  {
    id: "3",
    platform: 'reddit',
    authorName: "Time Traveler",
    authorHandle: "timely",
    authorAvatar: "https://picsum.photos/203",
    content: "Testing different time formats",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    likeCount: 15
  },
  {
    id: "4",
    platform: 'bluesky',
    authorName: "Old Timer",
    authorHandle: "vintage",
    authorAvatar: "https://picsum.photos/204",
    content: "This is an older post",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    likeCount: 100
  },
  {
    id: "5",
    platform: 'bluesky',
    authorName: "Ancient One",
    authorHandle: "ancient",
    authorAvatar: "https://picsum.photos/205",
    content: "From the distant past",
    createdAt: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString(), // 3 months ago
    likeCount: 500
  }
];
*/

// Create a Promise factory for fetching timeline data
export function fetchTimelineData(): Promise<Post[]> {
  const supabase = createClient();
  
  return new Promise(async (resolve, reject) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        reject("No session found");
        return;
      }

      const response = await fetch('http://localhost:5115/api/timeline', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
        },
        credentials: 'include'
      });
    
      if (!response.ok) {
        const errorText = await response.text();
        if (errorText.includes("No connections found")) {
          reject("No connections found");
          return;
        }
        reject(`API error: ${response.status} ${errorText}`);
        return;
      }

      const result = await response.json();
      
      if (result.success) {
        resolve(result.data);
      } else {
        if (result.error === "No connections found") {
          reject("No connections found");
          return;
        }
        reject(result.error);
      }
    } catch (error) {
      reject(error);
    }
  });
} 