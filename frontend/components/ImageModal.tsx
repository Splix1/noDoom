import { Dialog, DialogPortal, DialogOverlay } from '@/components/ui/dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
  onNext?: () => void;
  onPrevious?: () => void;
  totalImages?: number;
  currentIndex?: number;
}

export function ImageModal({ 
  isOpen, 
  onClose, 
  imageUrl, 
  alt,
  onNext,
  onPrevious,
  totalImages,
  currentIndex
}: ImageModalProps) {
  const fullSizeUrl = imageUrl.replace('feed_thumbnail', 'feed_fullsize');
  const showNavigation = totalImages && totalImages > 1;

  // Add keyboard event handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Escape')) {
        e.stopPropagation();
        e.preventDefault();
        
        if (e.key === 'ArrowRight' && onNext) {
          onNext();
        } else if (e.key === 'ArrowLeft' && onPrevious) {
          onPrevious();
        } else if (e.key === 'Escape') {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onNext, onPrevious, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="z-50 bg-background/80 backdrop-blur-sm" />
        <DialogPrimitive.Content 
          className="fixed left-[50%] top-[50%] z-50 flex flex-col items-end gap-4 w-full max-w-screen-lg translate-x-[-50%] translate-y-[-50%] p-0 bg-transparent border-0 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <div className="w-full flex justify-between items-center px-4">
            {showNavigation && (
              <span className="text-sm text-foreground/80">
                {currentIndex! + 1} of {totalImages}
              </span>
            )}
            <DialogPrimitive.Close className="rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background/50">
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>
          <div className="relative w-full">
            <DialogPrimitive.Title className="sr-only">
              Image Preview
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {alt}
            </DialogPrimitive.Description>
            <div className="relative w-full h-[80vh]">
              <Image
                src={fullSizeUrl}
                alt={alt}
                priority
                fill
                sizes="(max-width: 1280px) 100vw, 1024px"
                className="object-contain"
              />
              {showNavigation && (
                <>
                  <button
                    onClick={onPrevious}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full backdrop-blur-sm transition-colors hover:bg-background/50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={onNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 p-2 rounded-full backdrop-blur-sm transition-colors hover:bg-background/50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}