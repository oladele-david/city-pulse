import { useCallback, useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface MediaItem {
  type: "image" | "video";
  url: string;
}

interface MediaLightboxProps {
  items: MediaItem[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
}

export const MediaLightbox = ({
  items,
  initialIndex = 0,
  isOpen,
  onClose,
}: MediaLightboxProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i + 1) % items.length);
  }, [items.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose, goNext, goPrev]);

  if (!isOpen || items.length === 0) return null;

  const current = items[currentIndex];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition-opacity hover:bg-black/70"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="h-5 w-5" />
      </button>

      {/* Media container */}
      <div
        className="relative z-10 mx-4 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image or video */}
        <div className="overflow-hidden rounded-2xl">
          {current.type === "image" ? (
            <img
              src={current.url}
              alt={`Evidence ${currentIndex + 1}`}
              className="w-full max-h-[70vh] object-contain bg-black rounded-2xl"
            />
          ) : (
            <video
              src={current.url}
              controls
              autoPlay
              className="w-full max-h-[70vh] bg-black rounded-2xl"
            />
          )}
        </div>

        {/* Navigation arrows + indicator */}
        {items.length > 1 && (
          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              onClick={goPrev}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-all hover:bg-white/25 active:scale-90"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-1.5">
              {items.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === currentIndex
                      ? "w-4 bg-white"
                      : "w-1.5 bg-white/40",
                  )}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white transition-all hover:bg-white/25 active:scale-90"
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
