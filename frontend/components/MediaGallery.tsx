import { useState } from 'react';
import Image from 'next/image';
import { ImageModal } from '@/components/ImageModal';
import { cn } from '@/lib/utils';

interface MediaContent {
  type: 'image' | 'link' | 'video';
  url: string;
  thumbnailUrl?: string;
  title?: string;
  description?: string;
}

interface MediaGalleryProps {
  media: MediaContent[];
  alt: string;
  onModalChange: (isOpen: boolean) => void;
}

export function MediaGallery({ media, alt, onModalChange }: MediaGalleryProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);

  const getGridClassName = (total: number, index: number) => {
    if (total === 1) return 'col-span-2 row-span-2';
    if (total === 2) return 'col-span-1 row-span-2';
    if (total === 3 && index === 0) return 'col-span-2 row-span-1';
    if (total === 4) return 'col-span-1 row-span-1';
    return '';
  };

  return (
    <>
      <div className="mt-6 grid grid-cols-2 grid-rows-2 gap-1 aspect-square max-h-[400px] rounded-xl overflow-hidden">
        {media.slice(0, 4).map((item, index) => (
          <div
            key={index}
            className={cn(
              "relative overflow-hidden bg-accent/10",
              getGridClassName(Math.min(media.length, 4), index)
            )}
          >
            {item.type === 'image' ? (
              <div 
                onClick={() => setSelectedImageIndex(index)}
                className="cursor-pointer w-full h-full"
              >
                <Image
                  src={item.url}
                  alt={alt}
                  fill
                  className="object-contain transition-transform duration-200 hover:scale-105"
                  sizes="(max-width: 1280px) 100vw, 1024px"
                />
                {media.length > 4 && index === 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                    <span className="text-white text-xl font-medium">+{media.length - 4}</span>
                  </div>
                )}
              </div>
            ) : (
              <video
                src={item.url}
                controls
                className="w-full h-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {selectedImageIndex !== null && (
        <ImageModal
          isOpen={selectedImageIndex !== null}
          onClose={() => {
            setSelectedImageIndex(null);
            onModalChange(false);
          }}
          imageUrl={media[selectedImageIndex].url}
          alt={alt}
          onNext={() => setSelectedImageIndex((prev) => (prev === media.length - 1 ? 0 : prev! + 1))}
          onPrevious={() => setSelectedImageIndex((prev) => (prev === 0 ? media.length - 1 : prev! - 1))}
          totalImages={media.length}
          currentIndex={selectedImageIndex}
        />
      )}
    </>
  );
} 