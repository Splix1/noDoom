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
  isQuoted?: boolean;
}

export function MediaGallery({ media, alt, onModalChange, isQuoted = false }: MediaGalleryProps) {
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
      <div className={cn(
        "grid grid-cols-2 gap-2 w-full rounded-xl overflow-hidden",
        isQuoted ? "max-h-[150px]" : "h-[500px]"
      )}>
        {media.slice(0, 4).map((item, index) => (
          <div
            key={index}
            className={cn(
              "relative overflow-hidden bg-background",
              getGridClassName(Math.min(media.length, 4), index),
              media.length === 2 ? (isQuoted ? "h-[75px]" : "h-full") : "",
              isQuoted && media.length === 1 ? "h-[150px]" : "",
              !isQuoted && media.length === 1 && "h-full"
            )}
          >
            {item.type === 'image' ? (
              <div className="relative w-full h-full flex items-center justify-center">
                {item.url && item.url.startsWith('http') ? (
                  <Image
                    src={item.url}
                    alt={alt}
                    fill
                    className={cn(
                      "cursor-pointer",
                      media.length === 1 ? "object-contain" : "object-cover"
                    )}
                    sizes="(max-width: 1280px) 100vw, 1024px"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      onModalChange(true);
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-background">
                    <span className="text-sm text-muted-foreground">Invalid image URL</span>
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

      {!isQuoted && selectedImageIndex !== null && (
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