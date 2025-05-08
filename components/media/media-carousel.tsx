"use client";

import { useState } from "react";
import { MediaViewer } from "@/components/media/media-viewer";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";

export interface MediaItem {
  id: number;
  url: string;
  alt: string;
}

interface MediaCarouselProps {
  mediaItems: MediaItem[];
}

export function MediaCarousel({ mediaItems }: MediaCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  const prev = () =>
    setCurrentIndex(
      (prev) => (prev - 1 + mediaItems.length) % mediaItems.length
    );

  if (mediaItems.length === 0) return null;

  return (
    <div className="relative">
      <div className="h-64 bg-green-50 relative overflow-hidden rounded-lg">
        {mediaItems && mediaItems.length > 0 ? (
          <MediaViewer
            mediaId={Number(mediaItems[currentIndex].id)}
            className="w-full h-full object-cover"
            width="100%"
            height="100%"
            alt={mediaItems[currentIndex].alt}
            showLoader={true}
            priority={currentIndex === 0}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded-lg">
            <ImageIcon className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-500">
              Không có hình ảnh
            </span>
          </div>
        )}
      </div>
  
      {mediaItems.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 p-2 rounded-full text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 p-2 rounded-full text-white"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
      
      {mediaItems.length > 1 && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
          {mediaItems.map((_, index) => (
            <button
              key={index}
              className={`h-2 w-2 rounded-full ${
                index === currentIndex ? "bg-white" : "bg-gray-400"
              }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
