'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MediaGallery } from '@/components/MediaGallery';
import { Post } from './types';
import { formatTimeAgo } from './timelineApi';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { toggleFavorite } from './favoriteApi';

interface TimelinePostProps {
  post: Post;
  onUpdate?: (post: Post) => void;
}

// Platform icons component
function PlatformIcon({ platform }: { platform: string }) {
  const iconPath = platform.toLowerCase() === 'bluesky' 
    ? '/bluesky-icon.svg'
    : platform.toLowerCase() === 'reddit'
      ? '/reddit-icon.svg'
      : null;

  if (!iconPath) return null;

  return (
    <div className="relative w-5 h-5">
      <Image
        src={iconPath}
        alt={`${platform} icon`}
        width={20}
        height={20}
        className="object-contain"
      />
    </div>
  );
}

export function TimelinePost({ post, onUpdate }: TimelinePostProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(post.isFavorite || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFavoriteClick = async () => {
    setIsUpdating(true);
    const newIsFavorite = await toggleFavorite(post, isFavorite);
    setIsFavorite(newIsFavorite);
    setIsUpdating(false);
    
    // Notify parent of the update
    onUpdate?.({ ...post, isFavorite: newIsFavorite });
  };

  const hasMedia = post.media && post.media.length > 0;

  return (
    <article className="bg-card rounded-lg overflow-hidden border border-border/40 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header with author info */}
      <div className="p-4 border-b border-border/20">
        <div className="flex items-center space-x-2">
          {post.authorAvatar && (
            <Image
              src={post.authorAvatar}
              alt={post.authorName}
              width={40}
              height={40}
              className="rounded-full ring-2 ring-background/80"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="font-semibold">{post.authorName}</span>
              <PlatformIcon platform={post.platform} />
            </div>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <span>@{post.authorHandle}</span>
              <span>·</span>
              <span>{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content area with navigation dots and favorite button */}
      <div className="relative">
        {/* Favorite button - positioned in the center and higher */}
        <div className="absolute left-1/2 top-0 z-10 transform -translate-x-1/2 -translate-y-full">
          <button
            onClick={handleFavoriteClick}
            disabled={isUpdating}
            className={cn(
              "p-2 rounded-full transition-colors bg-background/80 backdrop-blur-sm shadow-sm",
              "hover:bg-primary/10 hover:shadow-md",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              isUpdating && "opacity-50 cursor-not-allowed"
            )}
          >
            <Heart
              className={cn(
                "w-6 h-6 transition-colors",
                isFavorite ? "fill-primary stroke-primary" : "stroke-foreground"
              )}
            />
          </button>
        </div>

        <div className="h-[500px]">
          {/* Display text content above media if both exist */}
          {post.content && hasMedia && (
            <div className="p-5 pb-2">
              <div className="text-base leading-relaxed">
                {post.content}
              </div>
            </div>
          )}
          
          {hasMedia ? (
            <MediaGallery 
              media={post.media!}
              alt={post.content || ''}
              onModalChange={setIsModalOpen}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-6 bg-background">
              <div className="max-w-2xl text-center space-y-6">
                {post.content}
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
} 