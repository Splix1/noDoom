'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import Image from 'next/image';
import { useState } from 'react';
import { FaReddit } from "react-icons/fa";
import { SiBluesky } from "react-icons/si";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Platform = 'reddit' | 'bluesky';

// TODO: Change medias to an array

interface Post {
  id: number;
  title: string;
  content: string;
  author: string;
  timestamp: string;
  profilePicture: string;
  platform: Platform;
  media?: {
    type: 'image' | 'video';
    url: string;
  };
}

const mockPosts: Post[] = [
  {
    id: 1,
    title: "First Post",
    content: "This is the first post with an image :)",
    author: "Jane Smith",
    timestamp: "2 hours ago",
    profilePicture: "https://cdn.frankerfacez.com/emoticon/462459/4",
    platform: 'reddit',
    media: {
      type: 'image',
      url: 'https://cdn.frankerfacez.com/emoticon/462459/4'
    }
  },
  {
    id: 2,
    title: "Second Post",
    content: "This is the second post with a video :(",
    author: "Billy Bob",
    timestamp: "4 hours ago",
    profilePicture: "https://cdn.frankerfacez.com/emoticon/462459/4",
    platform: 'bluesky',
    media: {
      type: 'video',
      url: 'https://video.twimg.com/ext_tw_video/1889645803570077701/pu/vid/avc1/1280x720/jbS3HsDlqKOxXuys.mp4?'
    }
  },
  {
    id: 3,
    title: "Second Post",
    content: "This is the second post :(",
    author: "Billy Bob",
    timestamp: "4 hours ago",
    profilePicture: "https://cdn.frankerfacez.com/emoticon/462459/4",
    platform: 'bluesky'
  },
  {
    id: 4,
    title: "Second Post",
    content: "This is the second post :(",
    author: "Billy Bob",
    timestamp: "4 hours ago",
    profilePicture: "https://cdn.frankerfacez.com/emoticon/462459/4",
    platform: 'bluesky'
  },
  {
    id: 5,
    title: "Second Post",
    content: "This is the second post :(",
    author: "Billy Bob",
    timestamp: "4 hours ago",
    profilePicture: "https://cdn.frankerfacez.com/emoticon/462459/4",
    platform: 'bluesky'
  },
  {
    id: 6,
    title: "Second Post",
    content: "This is the second post :(",
    author: "Billy Bob",
    timestamp: "4 hours ago",
    profilePicture: "https://cdn.frankerfacez.com/emoticon/462459/4",
    platform: 'bluesky'
  },
  {
    id: 7,
    title: "Second Post",
    content: "This is the second post :(",
    author: "Billy Bob",
    timestamp: "4 hours ago",
    profilePicture: "https://cdn.frankerfacez.com/emoticon/462459/4",
    platform: 'bluesky'
  },
  {
    id: 8,
    title: "Second Post",
    content: "This is the second post :(",
    author: "Billy Bob",
    timestamp: "4 hours ago",
    profilePicture: "https://cdn.frankerfacez.com/emoticon/462459/4",
    platform: 'bluesky'
  },
  {
    id: 9,
    title: "Second Post",
    content: "This is the second post :(",
    author: "Billy Bob",
    timestamp: "4 hours ago",
    profilePicture: "https://cdn.frankerfacez.com/emoticon/462459/4",
    platform: 'bluesky'
  },
  {
    id: 10,
    title: "Second Post",
    content: "This is the second post :(",
    author: "Billy Bob",
    timestamp: "4 hours ago",
    profilePicture: "https://cdn.frankerfacez.com/emoticon/462459/4",
    platform: 'bluesky'
  },
  {
    id: 11,
    title: "Second Post",
    content: "This is the second post :(",
    author: "Billy Bob",
    timestamp: "4 hours ago",
    profilePicture: "https://cdn.frankerfacez.com/emoticon/462459/4",
    platform: 'bluesky'
  },
  {
    id: 12,
    title: "Second Post",
    content: "This is the second post :(",
    author: "Billy Bob",
    timestamp: "4 hours ago",
    profilePicture: "https://cdn.frankerfacez.com/emoticon/462459/4",
    platform: 'bluesky'
  },
  {
    id: 13,
    title: "Second Post",
    content: "This is the second post :(",
    author: "Billy Bob",
    timestamp: "4 hours ago",
    profilePicture: "https://cdn.frankerfacez.com/emoticon/462459/4",
    platform: 'bluesky'
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

export default function FeedPage() {
  const [currentSlide, setCurrentSlide] = useState(1);
  
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
        {mockPosts.map((post) => (
          <SwiperSlide key={post.id}>
            <div className="flex flex-col h-full bg-card rounded-lg border p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={post.platform} />
                  <h2 className="text-xl font-medium">{post.title}</h2>
                </div>
                <span className="text-sm text-muted-foreground">{post.timestamp}</span>
              </div>
              
              <div className="flex-1">
                <p className="text-foreground/80">{post.content}</p>
              </div>
              
              {post.media && (
                <div className="mb-4 relative w-full h-[300px] rounded-lg overflow-hidden">
                  {post.media.type === 'image' ? (
                    <Image
                      src={post.media.url}
                      alt={post.title}
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
              
              
              <div className="mt-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {post.profilePicture ? (
                    <Image
                      src={post.profilePicture}
                      alt={`${post.author}'s profile`}
                      width={32}
                      height={32}
                      className="rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10" />
                  )}
                  <span className="text-sm font-medium">{post.author}</span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}