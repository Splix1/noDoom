import Image from 'next/image';
import { MediaGallery } from './MediaGallery';

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
  return (
    <div className="mt-4 rounded-lg border bg-muted/30 p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3">
        {post.authorAvatar && (
          <div className="relative h-5 w-5">
            <Image
              src={post.authorAvatar}
              alt={`${post.authorName}'s avatar`}
              className="rounded-full object-cover"
              fill
              sizes="20px"
            />
          </div>
        )}
        <div className="flex items-center gap-1">
          <span className="font-medium">{post.authorName}</span>
          <span className="text-muted-foreground">@{post.authorHandle}</span>
        </div>
      </div>
      
      <p className="mt-2 text-sm">{post.content}</p>
      
      {post.media && post.media.length > 0 && (
        <div className="mt-2">
          <MediaGallery 
            media={post.media}
            alt={post.content}
            onModalChange={() => {}}
            isQuoted
          />
        </div>
      )}
    </div>
  );
} 