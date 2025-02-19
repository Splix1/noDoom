'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { FaReddit } from "react-icons/fa";
import { SiBluesky } from "react-icons/si";
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
    <div className="flex-1 w-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Daily Feed</h1>
      </div>
      
      <Swiper
        modules={[Navigation, Pagination, Keyboard]}
        spaceBetween={30}
        slidesPerView={1}
        navigation
        keyboard={{
          enabled: true,
          onlyInViewport: true,
        }}
        pagination={{ clickable: true }}
        className="w-full h-[600px] [&_.swiper-pagination-bullet]:bg-foreground/50 [&_.swiper-pagination-bullet-active]:bg-foreground"
        onSlideChange={(swiper) => setCurrentSlide(swiper.activeIndex + 1)}
      >
        {posts.map((post) => (
          <SwiperSlide key={post.id}>
            <div className="flex flex-col h-full bg-card rounded-lg border p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={post.platform} />
                  <h2 className="text-xl font-medium">{post.authorName}</h2>
                </div>
                <span className="text-sm text-muted-foreground">{post.createdAt}</span>
              </div>
              
              <div className="flex-1">
                <p className="text-foreground/80">{post.content}</p>
              </div>
              
              {post.media && (
                <div className="mb-4 relative w-full h-[300px] rounded-lg overflow-hidden">
                  {post.media.type === 'image' ? (
                    <Image
                      src={post.media?.url}
                      alt={post.content}
                      fill
                      className="object-contain"
                      sizes="(max-width: 1280px) 100vw, 1024px"
                    />
                  ) : (
                    <video
                      src={post.media?.url}
                      controls
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              )}
              
              
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {post.authorAvatar ? (
                    <Image
                      src={post.authorAvatar}
                      alt={`${post.authorName}'s profile`}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10" />
                  )}
                  <span className="text-sm font-medium">{post.authorName}</span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}