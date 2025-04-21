"use client";

import { useState, useEffect, useMemo } from "react";
import { getMediaById } from "@/services/media-service";
import { FileType, type MediaResponse } from "@/app/types/media";
import { Loader2, FileText, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// Cache cho media đã tải
const mediaCache = new Map<number, MediaResponse>();

interface MediaViewerProps {
  mediaId: number;
  className?: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
  showLoader?: boolean;
  onLoad?: (media: MediaResponse) => void;
  onError?: (error: Error) => void;
  priority?: boolean; // Ưu tiên tải hình ảnh (cho LCP)
}

export function MediaViewer({
  mediaId,
  className,
  width = "auto",
  height = "auto",
  alt = "Media",
  showLoader = true,
  onLoad,
  onError,
  priority = false,
}: MediaViewerProps) {
  const [media, setMedia] = useState<MediaResponse | null>(
    mediaCache.get(mediaId) || null
  );
  const [loading, setLoading] = useState(!mediaCache.has(mediaId));
  const [error, setError] = useState<string | null>(null);

  // Lấy base URL từ biến môi trường
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";

  // Tạo URL hoàn chỉnh bằng cách nối baseUrl với urlFile
  const mediaUrl = useMemo(() => {
    if (!media || !media.urlFile) return null;
    return `${baseUrl}${media.urlFile}`;
  }, [media, baseUrl]);

  useEffect(() => {
    // Nếu đã có trong cache, không cần fetch lại
    if (mediaCache.has(mediaId)) {
      const cachedMedia = mediaCache.get(mediaId);
      console.log("cache media" + cachedMedia);
      setMedia(cachedMedia || null);
      setLoading(false);
      if (cachedMedia && onLoad) onLoad(cachedMedia);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();

    const fetchMedia = async () => {
      try {
        setLoading(true);
        const response = await getMediaById(mediaId, controller.signal);

        if (!isMounted) return;

        if (response.code === 200 && response.data) {
          // Lưu vào cache
          mediaCache.set(mediaId, response.data);
          setMedia(response.data);
          if (onLoad) {
            onLoad(response.data);
          }
        } else {
          throw new Error(response.message || "Không thể tải media");
        }
      } catch (err: any) {
        if (!isMounted) return;

        // Kiểm tra nếu request bị hủy
        if (err.name === "AbortError") return;

        console.error("Error loading media:", err);
        setError(err.message || "Đã xảy ra lỗi khi tải media");
        if (onError) {
          onError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (mediaId) {
      fetchMedia();
    }

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [mediaId, onLoad, onError]);

  if (loading && showLoader) {
    return (
      <div
        className={cn("flex items-center justify-center", className)}
        style={{ width, height }}
      >
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !media || !mediaUrl) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 rounded-md",
          className
        )}
        style={{ width, height }}
      >
        <p className="text-sm text-gray-500">
          {error || "Không thể tải media"}
        </p>
      </div>
    );
  }

  if (media.fileType === FileType.IMAGE) {
    return (
      <div
        className={cn("relative rounded-md overflow-hidden", className)}
        style={{ width, height }}
      >
        {/** 
        <Image
          src={mediaUrl || "/placeholder.svg"}
          alt={alt || media.altText || media.fileName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
        />
        */}

        <img
          src={mediaUrl || "/placeholder.svg"}
          alt={alt || media.altText || media.fileName}
          className="rounded-md object-contain"
          style={{ width, height }}
        />
      </div>
    );
  } else if (media.fileType === FileType.VIDEO) {
    return (
      <div
        className={cn("relative rounded-md overflow-hidden", className)}
        style={{ width, height }}
      >
        <video
          src={mediaUrl}
          controls
          className="w-full h-full object-cover"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <Video className="h-12 w-12 text-white opacity-70" />
        </div>
      </div>
    );
  } else {
    // For documents and other file types
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center p-4 bg-gray-100 rounded-md",
          className
        )}
        style={{ width, height }}
      >
        <FileText className="h-8 w-8 text-gray-500 mb-2" />
        <p className="text-sm font-medium text-center">{media.fileName}</p>
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-sm mt-2"
          onClick={(e) => e.stopPropagation()}
        >
          Tải xuống
        </a>
      </div>
    );
  }
}
