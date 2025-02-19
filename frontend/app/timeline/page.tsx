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

type Platform = 'reddit' | 'bluesky';

interface Post {
  id: string;
  platform: 'bluesky' | 'reddit';
  authorName: string;
  authorHandle: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  media?: {
    type: 'image' | 'link' | 'video';
    url: string;
    thumbnailUrl?: string;
    title?: string;
    description?: string;
  };
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
    media: {
      type: 'image',
      url: 'https://cdn.frankerfacez.com/emoticon/462459/4'
    },
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
    media: {
      type: 'video',
      url: 'https://video.twimg.com/ext_tw_video/1889645803570077701/pu/vid/avc1/1280x720/jbS3HsDlqKOxXuys.mp4?'
    },
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

export default function TimelinePage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string | null>(null);
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
  
  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Daily Feed</h1>
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

              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {post.authorAvatar && (
                      <Image
                        src={post.authorAvatar}
                        alt={`${post.authorName}'s profile`}
                        width={48}
                        height={48}
                        className="rounded-full object-cover"
                      />
                    )}
                    <div className="absolute -bottom-2 -right-2">
                      <PlatformIcon platform={post.platform} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-xl font-semibold">{post.authorName}</h2>
                    <span className="text-sm text-muted-foreground">@{post.authorHandle}</span>
                  </div>
                </div>
                <span className="text-sm text-muted-foreground">{post.createdAt}</span>
              </div>
              
              <div className="flex-1 mb-6">
                <p className="text-lg leading-relaxed">{post.content}</p>
              </div>
              
              {post.media && (
                <div className="mb-6 relative w-full h-[400px] rounded-xl overflow-hidden bg-muted">
                  {post.media.type === 'image' ? (
                    <Image
                      src={post.media.url}
                      alt={post.content}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1280px) 100vw, 1024px"
                    />
                  ) : (
                    <video
                      src={post.media.url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}