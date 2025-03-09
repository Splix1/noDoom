'use client';

import { use, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimelinePost } from './TimelinePost';
import { Post } from './types';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface TimelineContentProps {
  timelinePromise: Promise<Post[]>;
}

export function TimelineContent({ timelinePromise }: TimelineContentProps) {
  const [currentSlide, setCurrentSlide] = useState(1);
  const [swiper, setSwiper] = useState<any>(null);
  
  // Use the hook to consume the promise
  const posts = use(timelinePromise);

  // If no posts, show a message
  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-card rounded-xl border shadow-sm">
        <h2 className="text-xl font-semibold mb-2">No posts found</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Your timeline is empty. Try connecting more accounts in your settings or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="relative px-20">
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
        {posts.map((post, index) => (
          <SwiperSlide key={post.id} className="flex items-center justify-center py-10">
            <div className="relative">
              <TimelinePost post={post} />
              
              {/* Navigation dots */}
              <div className="absolute top-8 right-8 flex gap-1 z-10">
                {posts.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => swiper?.slideTo(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      currentSlide - 1 === idx 
                        ? "bg-primary" 
                        : "bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Navigation buttons */}
      {posts.length > 1 && (
        <>
          {currentSlide > 1 && (
            <button 
              onClick={() => swiper?.slidePrev()}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-foreground/20 backdrop-blur-sm text-white hover:bg-foreground/30 transition-colors"
              aria-label="Previous post"
            >
              <ChevronLeft className="h-6 w-6 rotate-0" />
            </button>
          )}
          {currentSlide < posts.length && (
            <button 
              onClick={() => swiper?.slideNext()}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-foreground/20 backdrop-blur-sm text-white hover:bg-foreground/30 transition-colors"
              aria-label="Next post"
            >
              <ChevronRight className="h-6 w-6 rotate-0" />
            </button>
          )}
        </>
      )}
    </div>
  );
} 