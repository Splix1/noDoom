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
}

const mockPosts: Post[] = [
  {
    id: "1",
    platform: 'reddit',
    authorName: "Jane Smith",
    authorHandle: "janesmith",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the first post with an image :)",
    createdAt: "2 hours ago",
    media: [{
      type: 'video',
      url: 'https://video.twimg.com/ext_tw_video/1889645803570077701/pu/vid/avc1/1280x720/jbS3HsDlqKOxXuys.mp4?'
    }, {
      type: 'video',
      url: 'https://video.twimg.com/ext_tw_video/1889645803570077701/pu/vid/avc1/1280x720/jbS3HsDlqKOxXuys.mp4?'
    }],
    likeCount: 0
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
    likeCount: 0
  },
  {
    id: "3",
    platform: 'bluesky',
    authorName: "Billy Bob",
    authorHandle: "billybob",
    authorAvatar: "https://cdn.frankerfacez.com/emoticon/462459/4",
    content: "This is the second post :(",
    createdAt: "4 hours ago",
    likeCount: 0
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

const PlatformIcon = ({ platform }: { platform: Platform }) => {
  switch (platform) {
    case 'reddit':
      return <FaReddit className="w-5 h-5 text-[#FF4500]" />;
    case 'bluesky':
      return <SiBluesky className="w-5 h-5 text-[#0560FF]" />;
    default:
      return null;
  }
};

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
          setPosts(result.data);
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
    <div className="flex-1 w-full max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Timeline</h1>
        <span className="text-muted-foreground">
          {currentSlide} of {posts.length}
        </span>
      </div>
      
      <Swiper
        modules={[Navigation, Pagination, Keyboard]}
        spaceBetween={40}
        slidesPerView={1}
        navigation={true}
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        pagination={{ 
          clickable: true,
          bulletActiveClass: 'swiper-pagination-bullet-active',
          bulletClass: 'swiper-pagination-bullet'
        }}
        className="w-full h-[calc(100vh-12rem)] relative"
        onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex + 1)}
      >
        {posts.map((post) => (
          <SwiperSlide key={post.id}>
            <div className="flex flex-col h-full bg-card rounded-xl border shadow-sm p-8">
              <div className="swiper-button-prev absolute top-1/2 -left-16 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card border shadow-md cursor-pointer after:hidden">
                <ChevronLeft className="h-6 w-6" />
              </div>
              <div className="swiper-button-next absolute top-1/2 -right-16 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-card border shadow-md cursor-pointer after:hidden">
                <ChevronRight className="h-6 w-6" />
              </div>

              <div className="flex flex-col h-full">
                <div className="flex items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {post.authorAvatar && (
                        <div className="relative group">
                          <Image
                            src={post.authorAvatar}
                            alt={`${post.authorName}'s profile`}
                            width={48}
                            height={48}
                            className="rounded-full object-cover ring-2 ring-background shadow-md transition-transform duration-200 group-hover:scale-105"
                          />
                          <div className="absolute -bottom-2 -right-2 transition-transform duration-200 group-hover:scale-105">
                            <PlatformIcon platform={post.platform} />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col">
                      <h2 className="text-xl font-semibold hover:text-primary/80 transition-colors cursor-pointer">
                        {post.authorName}
                      </h2>
                      <span className="text-sm text-muted-foreground hover:text-muted-foreground/80 transition-colors cursor-pointer">
                        @{post.authorHandle}
                      </span>
                      <span className="text-sm text-muted-foreground mt-0.5">
                        {formatTimeAgo(post.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`flex-1 flex flex-col ${!post.media ? 'justify-center items-center' : ''}`}>
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
                    {post.content.split(' ').length > 50 && (
                      <button
                        onClick={() => togglePostExpansion(post.id)}
                        className="mt-4 text-sm text-primary hover:text-primary/80 transition-colors font-medium hover:underline"
                      >
                        {expandedPosts.has(post.id) ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>

                  {post.media && post.media.length > 0 && (
                    <MediaGallery 
                      media={post.media} 
                      alt={post.content} 
                      onModalChange={setIsModalOpen} 
                    />
                  )}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}