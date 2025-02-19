import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogPortal, DialogOverlay, DialogClose } from "@/components/ui/dialog";
import Image from "next/image";
import { X } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  alt: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, alt }: ImageModalProps) {
  const fullSizeUrl = imageUrl.replace('feed_thumbnail', 'feed_fullsize');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="z-50" />
        <DialogPrimitive.Content 
          className="fixed left-[50%] top-[50%] z-50 flex flex-col items-end gap-4 w-full max-w-screen-lg translate-x-[-50%] translate-y-[-50%] p-0 bg-transparent border-0 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
        >
          <DialogPrimitive.Close className="rounded-full bg-background/80 p-2 backdrop-blur-sm transition-colors hover:bg-background/50">
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
          <div className="w-full">
            <DialogPrimitive.Title className="sr-only">
              Image Preview
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              {alt}
            </DialogPrimitive.Description>
            <div className="relative w-full h-[80vh]" style={{ position: 'relative' }}>
              <Image
                src={fullSizeUrl}
                alt={alt}
                priority
                fill
                sizes="(max-width: 1280px) 100vw, 1024px"
                className="object-contain"
                style={{ position: 'absolute', height: '100%', width: '100%' }}
              />
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}