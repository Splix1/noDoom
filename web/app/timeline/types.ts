export type Platform = 'reddit' | 'bluesky';

export interface MediaContent {
  type: 'image' | 'link' | 'video';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

export interface Post {
  id: string;
  platform: Platform;
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  media?: MediaContent[];
  likeCount: number;
} 

export interface TimelinePostProps {
    post: Post;
  }