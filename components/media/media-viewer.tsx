"use client";

import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { getMediaById } from "@/services/media-service";
import { FileType, type MediaResponse } from "@/app/types/media";
import {
  Loader2,
  FileText,
  Video,
  RefreshCw,
  AlertCircle,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { Spinner } from "../spinner";

// ==================== CONSTANTS & TYPES ====================

const MEDIA_CONFIG = {
  MAX_CACHE_SIZE: 100,
  CACHE_TTL: 5 * 60 * 1000, // 5 phút
  FETCH_TIMEOUT: 10000, // 10 giây
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 giây
} as const;

// Cache entry với timestamp để kiểm tra expiration
interface MediaCacheEntry {
  data: MediaResponse;
  timestamp: number;
  expiresAt: number;
}

// Enhanced cache với TTL support
class MediaCache {
  private cache = new Map<number, MediaCacheEntry>();

  set(key: number, data: MediaResponse): void {
    // Xóa entry cũ nhất nếu cache đầy
    if (this.cache.size >= MEDIA_CONFIG.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + MEDIA_CONFIG.CACHE_TTL,
    });
  }

  get(key: number): MediaResponse | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Kiểm tra expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  has(key: number): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Kiểm tra expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  // Cleanup expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton cache instance
const mediaCache = new MediaCache();

// Cleanup expired cache entries every 5 minutes
// if (typeof window !== "undefined") {
//   setInterval(() => {
//     mediaCache.cleanup();
//   }, 5 * 60 * 1000);
// }

// Loading states enum for better state management
enum LoadingState {
  IDLE = "idle",
  LOADING = "loading",
  SUCCESS = "success",
  ERROR = "error",
  RETRYING = "retrying",
}

// ==================== INTERFACES ====================

interface MediaViewerProps {
  mediaId: number;
  className?: string;
  width?: number | string;
  height?: number | string;
  alt?: string;
  showLoader?: boolean;
  showRetry?: boolean;
  onLoad?: (media: MediaResponse) => void;
  onError?: (error: Error) => void;
  priority?: boolean;
  placeholder?: string;
  errorFallback?: React.ReactNode;
}

// ==================== UTILITY FUNCTIONS ====================

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchWithRetry = async (
  fetchFn: () => Promise<any>,
  attempts: number = MEDIA_CONFIG.RETRY_ATTEMPTS,
  delay: number = MEDIA_CONFIG.RETRY_DELAY
): Promise<any> => {
  try {
    return await fetchFn();
  } catch (error) {
    if (attempts <= 1) throw error;

    await sleep(delay);
    return fetchWithRetry(fetchFn, attempts - 1, delay * 2); // Exponential backoff
  }
};

// ==================== ERROR COMPONENTS ====================

interface ErrorFallbackProps {
  error: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
  width?: number | string;
  height?: number | string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  onRetry,
  showRetry = true,
  className,
  width,
  height,
}) => (
  <div
    className={cn(
      "flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-md p-4",
      className
    )}
    style={{ width, height }}
  >
    <AlertCircle className="h-8 w-8 text-red-400 mb-2" />
    <p className="text-sm text-gray-600 text-center mb-3 max-w-48">{error}</p>
    {showRetry && onRetry && (
      <Button
        variant="outline"
        size="sm"
        onClick={onRetry}
        className="flex items-center gap-1"
      >
        <RefreshCw className="h-3 w-3" />
        Thử lại
      </Button>
    )}
  </div>
);

// Loading skeleton component
const LoadingSkeleton: React.FC<{
  className?: string;
  width?: number | string;
  height?: number | string;
}> = ({ className, width, height }) => (
  <div
    className={cn(
      "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-[shimmer_1.5s_ease-in-out_infinite] rounded-md",
      className
    )}
    style={{ width, height }}
  >
    <div className="flex items-center justify-center h-full">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
    </div>
  </div>
);

// ==================== MAIN COMPONENT ====================

export const MediaViewer: React.FC<MediaViewerProps> = ({
  mediaId,
  className,
  width = "auto",
  height = "auto",
  alt = "Media",
  showLoader = true,
  showRetry = true,
  onLoad,
  onError,
  priority = false,
  placeholder = "/duoclieu/placeholder.svg",
  errorFallback,
}) => {
  // ==================== STATE MANAGEMENT ====================

  const [media, setMedia] = useState<MediaResponse | null>(
    mediaCache.get(mediaId) || null
  );
  const [loadingState, setLoadingState] = useState<LoadingState>(
    mediaCache.has(mediaId) ? LoadingState.SUCCESS : LoadingState.IDLE
  );
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // ==================== COMPUTED VALUES ====================

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const mediaUrl = useMemo(() => {
    if (!media?.urlFile) return null;
    return `${baseUrl}${media.urlFile}`;
  }, [media?.urlFile, baseUrl]);

  // ==================== FETCH LOGIC ====================
  const fetchMedia = useCallback(
    async (isRetry = false) => {
      if (!mediaId) return;

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        setLoadingState(isRetry ? LoadingState.RETRYING : LoadingState.LOADING);
        setError(null);

        const fetchFn = async () => {
          const timeoutId = setTimeout(
            () => controller.abort(),
            MEDIA_CONFIG.FETCH_TIMEOUT
          );

          try {
            const response = await getMediaById(mediaId, controller.signal);
            clearTimeout(timeoutId);

            if (!isMountedRef.current) return null;

            return response.data;
          } catch (err) {
            clearTimeout(timeoutId);
            throw err;
          }
        };

        const mediaData = await fetchWithRetry(fetchFn);

        if (!isMountedRef.current || !mediaData) return;

        // Cache the result
        mediaCache.set(mediaId, mediaData);
        setMedia(mediaData);
        setLoadingState(LoadingState.SUCCESS);
        setRetryCount(0);

        // Call onLoad callback
        if (onLoad) onLoad(mediaData);
      } catch (err: any) {
        if (!isMountedRef.current) return;
        if (err.name === "AbortError") return;

        console.error("Error loading media:", err);

        const errorMessage = err.message || "Đã xảy ra lỗi khi tải media";
        setError(errorMessage);
        setLoadingState(LoadingState.ERROR);

        // Call onError callback
        if (onError) onError(err);
      }
    },
    [mediaId, onLoad, onError]
  );

  // Retry handler
  const handleRetry = useCallback(() => {
    if (retryCount < MEDIA_CONFIG.RETRY_ATTEMPTS) {
      setRetryCount((prev) => prev + 1);
      fetchMedia(true);
    }
  }, [fetchMedia, retryCount]);

  const onLoadRef = useRef(onLoad);
  useEffect(() => {
    onLoadRef.current = onLoad;
  });

  // ==================== EFFECTS ====================
  useEffect(() => {
    const intervalId = setInterval(() => {
      mediaCache.cleanup();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Check cache first
    if (mediaCache.has(mediaId)) {
      const cachedMedia = mediaCache.get(mediaId);
      if (cachedMedia) {
        setMedia(cachedMedia);
        setLoadingState(LoadingState.SUCCESS);
        return;
      }
    }

    // Fetch if not in cache
    if (mediaId) {
      fetchMedia();
    }

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [mediaId, fetchMedia]);

  // ==================== RENDER LOGIC ====================
  if (loadingState === LoadingState.LOADING && showLoader) {
    return (
      <LoadingSkeleton className={className} width={width} height={height} />
    );
  }

  if (loadingState === LoadingState.RETRYING) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 rounded-md",
          className
        )}
        style={{ width, height }}
      >
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <p className="text-xs text-gray-500">
            Đang thử lại... ({retryCount}/{MEDIA_CONFIG.RETRY_ATTEMPTS})
          </p>
        </div>
      </div>
    );
  }

  if (loadingState === LoadingState.ERROR || !media || !mediaUrl) {
    if (errorFallback) {
      return <>{errorFallback}</>;
    }

    return (
      <ErrorFallback
        error={error || "Không thể tải media"}
        onRetry={handleRetry}
        showRetry={showRetry && retryCount < MEDIA_CONFIG.RETRY_ATTEMPTS}
        className={className}
        width={width}
        height={height}
      />
    );
  }

  // ==================== RENDER MEDIA BY TYPE ====================

  if (media.fileType === FileType.IMAGE) {
    return (
      <div
        className={cn("relative rounded-md overflow-hidden", className)}
        style={{ width, height }}
      >
        <Image
          src={mediaUrl}
          alt={alt || media.altText || media.fileName}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover"
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL={placeholder}
          onLoadingComplete={() => setLoadingState(LoadingState.SUCCESS)}
          onError={() => {
            setError("Không thể tải hình ảnh");
            setLoadingState(LoadingState.ERROR);
          }}
        />
      </div>
    );
  }

  if (media.fileType === FileType.VIDEO) {
    return (
      <div
        className={cn(
          "relative rounded-md overflow-hidden bg-black",
          className
        )}
        style={{ width, height }}
      >
        <video
          src={mediaUrl}
          controls
          className="w-full h-full object-contain"
          preload="metadata"
          onError={() => {
            setError("Không thể phát video");
            setLoadingState(LoadingState.ERROR);
          }}
        >
          Trình duyệt không hỗ trợ video.
        </video>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-black bg-opacity-50 rounded-full p-3">
            <Video className="h-8 w-8 text-white" />
          </div>
        </div>
      </div>
    );
  }

  // Document/Other file types
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-md border border-gray-200 hover:shadow-md transition-shadow",
        className
      )}
      style={{ width, height }}
    >
      <div className="bg-blue-100 p-3 rounded-full mb-3">
        <FileText className="h-8 w-8 text-blue-600" />
      </div>
      <p className="text-sm font-medium text-center text-gray-800 mb-1 line-clamp-2">
        {media.fileName}
      </p>
      <p className="text-xs text-gray-500 mb-3">
        {media.fileSize
          ? `${(media.fileSize / 1024 / 1024).toFixed(2)} MB`
          : "N/A"}
      </p>
      <Button
        variant="outline"
        size="sm"
        asChild
        className="flex items-center gap-2"
      >
        <a
          href={mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          <Download className="h-3 w-3" />
          Tải xuống
        </a>
      </Button>
    </div>
  );
};

// ==================== MEMOIZED EXPORT ====================

export default MediaViewer;

// Export optimized memoized version
export const MemoizedMediaViewer = React.memo(MediaViewer);

// ==================== ADDITIONAL UTILITIES ====================

// Utility to preload media
export const preloadMedia = (
  mediaId: number
): Promise<MediaResponse | null> => {
  return new Promise((resolve) => {
    if (mediaCache.has(mediaId)) {
      resolve(mediaCache.get(mediaId));
      return;
    }

    getMediaById(mediaId)
      .then((response) => {
        if (response.code === 200 && response.data) {
          mediaCache.set(mediaId, response.data);
          resolve(response.data);
        } else {
          resolve(null);
        }
      })
      .catch(() => resolve(null));
  });
};

// Utility to clear cache (useful for testing or memory management)
export const clearMediaCache = () => {
  mediaCache.clear();
};

// Hook for accessing cache stats (useful for debugging)
export const useMediaCacheStats = () => {
  return {
    size: mediaCache["cache"].size,
    clear: clearMediaCache,
  };
};
