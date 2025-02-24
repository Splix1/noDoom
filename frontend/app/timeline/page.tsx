'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FaReddit } from "react-icons/fa";
import { SiBluesky } from "react-icons/si";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { ImageModal } from '@/components/ImageModal';
import { MediaGallery } from '@/components/MediaGallery';
import { QuotedPost } from '@/components/QuotedPost';
import { PlatformIcon } from '@/components/PlatformIcon';
import { cn } from '@/lib/utils';

type Platform = 'reddit' | 'bluesky';

interface MediaContent {
  type: 'image' | 'link' | 'video';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

interface Post {
  id: string;
  platform: 'bluesky' | 'reddit';
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  media?: MediaContent[];
  likeCount: number;
  quotedPost?: Post;
}

const mockPosts: Post[] = [
  {
    id: "1",
    platform: "bluesky",
    authorName: "Test User",
    authorHandle: "test.bsky.social",
    authorAvatar: "https://cdn.bsky.app/img/avatar/plain/did:plc:test/test@jpeg",
    content: "Check out this interesting post!",
    createdAt: new Date().toISOString(),
    likeCount: 42,
    quotedPost: {
      id: "2",
      platform: "bluesky",
      authorName: "Quoted User",
      authorHandle: "quoted.bsky.social",
      authorAvatar: "https://cdn.bsky.app/img/avatar/plain/did:plc:quoted/quoted@jpeg",
      content: "This is the quoted post content with some interesting information.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      likeCount: 100,
      media: [
        {
          type: "image",
          url: "https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:test/image@jpeg",
          thumbnailUrl: "https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:test/image@jpeg",
          description: "A sample image in the quoted post"
        }
      ]
    }
  },
  {
    id: "2",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the second post with a video :(",
    createdAt: "4 hours ago",
    media: [{
      type: 'image',
      url: 'https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:m453r6fotgsoegzxtxj7snwa/bafkreidyrst7tgmgwpydqko6v2q2iy5ixoz4uwumr7glxevwageokau5ja@jpeg'
    }, {
      type: 'image',
      url: 'https://cdn.bsky.app/img/feed_fullsize/plain/did:plc:qejaj4rg4bq2bpvknj63f36m/bafkreihfbcgbmeblmnjcyqfd2erv3jxtdw6zicxrwtsgvhx6luipas7lte@jpeg'
    }],
    likeCount: 0,
    quotedPost: {
      id: "2",
      platform: "bluesky",
      authorName: "Quoted User",
      authorHandle: "quoted.bsky.social",
      authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
      content: "This is the quoted post content with some interesting information.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      likeCount: 100,
      media: [
        {
          type: "image",
          url: "https://cdn.frankerfacez.com/emoticon/462459/4",
          thumbnailUrl: "https://cdn.frankerfacez.com/emoticon/462459/4",
          description: "A sample image in the quoted post"
        }
      ]
    }
  },
  {
    id: "3",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the second post :(",
    createdAt: "4 hours ago",
    likeCount: 0,
    quotedPost: {
      id: "2",
      platform: "bluesky",
      authorName: "Quoted User",
      authorHandle: "quoted.bsky.social",
      authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
      content: "This is the quoted post content with some interesting information.",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      likeCount: 100,
      media: [
        {
          type: "image",
          url: "https://cdn.frankerfacez.com/emoticon/462459/4",
          thumbnailUrl: "https://cdn.frankerfacez.com/emoticon/462459/4",
          description: "A sample image in the quoted post"
        }
      ]
    }
  },
  {
    id: "4",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the second post :(",
    createdAt: "4 hours ago",
    likeCount: 0
  },
  {
    id: "5",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the second post :(",
    createdAt: "4 hours ago",
    likeCount: 0
  },
  {
    id: "6",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the second post :(",
    createdAt: "4 hours ago",
    likeCount: 0
  },
  {
    id: "7",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the second post :(",
    createdAt: "4 hours ago",
    likeCount: 0
  },
  {
    id: "8",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the second post :(",
    createdAt: "4 hours ago",
    likeCount: 0
  },
  {
    id: "9",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the second post :(",
    createdAt: "4 hours ago",
    likeCount: 0
  },
  {
    id: "10",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the second post :(",
    createdAt: "4 hours ago",
    likeCount: 0
  },
  {
    id: "11",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the second post :(",
    createdAt: "4 hours ago",
    likeCount: 0
  },
  {
    id: "12",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the second post :(",
    createdAt: "4 hours ago",
    likeCount: 0
  },
  {
    id: "13",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the second post :(",
    createdAt: "4 hours ago",
    likeCount: 0
  }
];

const formatTimeAgo = (dateString: string) => {
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

export default function TimelinePage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [swiper, setSwiper] = useState<any>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());
  const [selectedImage, setSelectedImage] = useState<{url: string; alt: string} | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const supabase = createClient();
  

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setError(null);
        const { data: { session } } = await supabase.auth.getSession();

        const response = await fetch('http://localhost:5115/api/timeline', {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
          },
          credentials: 'include'
        });
      
        const result = await response.json();
        console.log(result);
        if (result.success) {
          console.log(result.data);
          setPosts(result.data);
          // setPosts(mockPosts);
        } else {
          setError(result.error);
          if (result.error.includes("Please reconnect your account")) {
            // Redirect to connections page or show reconnect modal
            console.error('Bluesky session expired, need to reconnect');
          }
        }
      } catch (error) {
        setError('Failed to fetch timeline');
        console.error('Error fetching timeline:', error);
      }
    };
    fetchTimeline();
  }, []);
  
  const togglePostExpansion = (postId: string) => {
    const newExpanded = new Set(expandedPosts);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedPosts(newExpanded);
  };

  return (
    <div className="container py-4">
      <Swiper
        modules={[Navigation, Pagination, Keyboard]}
        spaceBetween={40}
        slidesPerView={1}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        onSwiper={setSwiper}
        className="w-full relative [&_.swiper-button-next]:!hidden [&_.swiper-button-prev]:!hidden"
        onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex + 1)}
      >
        {posts.map((post) => (
          <SwiperSlide key={post.id} className="flex items-center justify-center py-20">
            <div className="relative flex flex-col bg-card rounded-xl border shadow-sm w-full max-w-3xl mx-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Image
                      src={post.authorAvatar}
                      alt={post.authorName}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                    <div>
                      <div className="font-medium">{post.authorName}</div>
                      <div className="text-sm text-muted-foreground">@{post.authorHandle}</div>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {posts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => swiper?.slideTo(index)}
                        className={cn(
                          "w-2 h-2 rounded-full transition-colors",
                          currentSlide - 1 === index 
                            ? "bg-primary" 
                            : "bg-muted-foreground/50"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col space-y-4">
                  <div className={`
                    ${!post.media ? 'max-w-2xl w-full bg-accent/10 shadow-lg backdrop-blur-sm p-8 rounded-xl border border-accent/20' : ''}
                    transition-all duration-200 ease-in-out
                  `}>
                    <div className={`
                      text-lg leading-relaxed
                      ${!expandedPosts.has(post.id) ? 'line-clamp-4' : ''}
                      ${!post.media ? 'text-center font-medium' : ''}
                    `}>
                      {post.content}
                    </div>
                  </div>

                  {post.media && post.media.length > 0 && (
                    <div className="flex justify-center">
                      <div className="w-full max-w-3xl">
                        <MediaGallery 
                          media={post.media} 
                          alt={post.content} 
                          onModalChange={setIsModalOpen} 
                        />
                      </div>
                    </div>
                  )}

                  {post.quotedPost && (
                    <QuotedPost post={post.quotedPost} />
                  )}
                </div>
              </div>
              <button 
                onClick={() => swiper?.slidePrev()}
                className="absolute left-0 top-8 -translate-x-16 z-10 p-2 rounded-full bg-foreground/20 backdrop-blur-sm text-white"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button 
                onClick={() => swiper?.slideNext()}
                className="absolute right-0 top-8 translate-x-16 z-10 p-2 rounded-full bg-foreground/20 backdrop-blur-sm text-white"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}