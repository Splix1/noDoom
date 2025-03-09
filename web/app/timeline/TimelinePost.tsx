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

export function TimelinePost({ post }: TimelinePostProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(post.isFavorite || false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleFavoriteClick = async () => {
    setIsUpdating(true);
    const newIsFavorite = await toggleFavorite(post, isFavorite);
    setIsFavorite(newIsFavorite);
    setIsUpdating(false);
  };

  const hasMedia = post.media && post.media.length > 0;

  return (
    <article className="bg-card rounded-lg overflow-hidden">
      {/* Header with author info */}
      <div className="p-4">
        <div className="flex items-center space-x-2">
          {post.authorAvatar && (
            <Image
              src={post.authorAvatar}
              alt={post.authorName}
              width={40}
              height={40}
              className="rounded-full"
            />
          )}
          <div className="flex-1">
            <div className="font-semibold">{post.authorName}</div>
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
        {/* Favorite button - positioned at the top */}
        <div className="absolute right-4 top-1 z-10">
          <button
            onClick={handleFavoriteClick}
            disabled={isUpdating}
            className={cn(
              "p-2 rounded-full transition-colors bg-background/80 backdrop-blur-sm",
              "hover:bg-primary/10",
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
          {hasMedia ? (
            <MediaGallery 
              media={post.media!}
              alt={post.content || ''}
              onModalChange={setIsModalOpen}
            />
          ) : (
            <div className="h-full flex items-center justify-center p-6">
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