import Image from 'next/image';
import { MediaGallery } from './MediaGallery';
import { useState } from 'react';
import { cn } from '../lib/utils';

interface MediaContent {
  type: 'image' | 'link' | 'video';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

interface QuotedPostProps {
  post: {
    authorName: string;
    authorHandle: string;
    authorAvatar?: string;
    content: string;
    platform: 'bluesky' | 'reddit';
    media?: MediaContent[];
  };
}

export function QuotedPost({ post }: QuotedPostProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className="relative mt-2 rounded-lg border bg-accent/5 hover:bg-accent/10 transition-colors cursor-pointer"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-lg" />
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          <Image
            src={post.authorAvatar || '/default-avatar.png'}
            alt={`${post.authorName}'s avatar`}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="font-medium">{post.authorName}</span>
          <span className="text-muted-foreground">@{post.authorHandle}</span>
        </div>
        
        <div className={cn(
          "text-sm",
          !isExpanded && "line-clamp-2"
        )}>
          {post.content}
        </div>

        {post.media && post.media.length > 0 && (
          <div className={cn(
            "mt-2 relative rounded-md overflow-hidden",
            !isExpanded && "h-32",
            isExpanded && "h-auto"
          )}>
            <MediaGallery 
              media={post.media} 
              alt={post.content}
              isQuoted={!isExpanded}
              onModalChange={() => {}}
            />
          </div>
        )}
        
        {!isExpanded && (
          <div className="mt-2 text-xs text-muted-foreground">
            Click to expand
          </div>
        )}
      </div>
    </div>
  );
} 