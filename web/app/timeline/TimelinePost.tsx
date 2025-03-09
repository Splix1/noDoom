'use client';

import Image from 'next/image';
import { useState } from 'react';
import { MediaGallery } from '@/components/MediaGallery';
import { Post, TimelinePostProps } from './types';
import { formatTimeAgo } from './timelineApi';
import { cn } from '@/lib/utils';

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
  const [isExpanded, setIsExpanded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use post media directly since quotes are filtered at the backend
  const hasMedia = post.media && post.media.length > 0;

  return (
    <div className="relative flex flex-col bg-card rounded-xl border shadow-sm w-full max-w-3xl mx-auto">
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Image
                src={post.authorAvatar}
                alt={post.authorName}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                <PlatformIcon platform={post.platform} />
              </div>
            </div>
            <div>
              <div className="font-medium">{post.authorName}</div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>@{post.authorHandle}</span>
                <span>·</span>
                <span>{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="h-[500px] rounded-xl overflow-hidden">
          {hasMedia ? (
            <div className="h-full">
              {post.content && (
                <div className="px-2 pb-4">
                  <div className={cn(
                    "text-base leading-relaxed",
                    !isExpanded && "line-clamp-2"
                  )}>
                    {post.content}
                  </div>
                  {post.content.length > 280 && (
                    <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-sm text-primary hover:underline mt-1"
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              )}
              <div className="h-full">
                <MediaGallery 
                  media={post.media!} 
                  alt={post.content || ''}
                  onModalChange={setIsModalOpen}
                />
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-accent/10 backdrop-blur-sm p-8">
              <div className="max-w-2xl">
                <div className={cn(
                  "text-xl leading-relaxed text-center",
                  !isExpanded && "line-clamp-6"
                )}>
                  {post.content}
                </div>
                {post.content.length > 280 && (
                  <div className="text-center mt-4">
                    <button 
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-sm text-primary hover:underline"
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 