import { Research } from "@/app/types/research";
import { RedoIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAbortableFetch } from "../useAbortableFetch";
import { fetchApi } from "@/lib/api-client";
import { toast } from "../use-toast";
import { HerbResponse } from "@/types/api";

interface UseResearchDetailOptions {
  enableAutoFetch?: boolean;
  enableRelatedResearch?: boolean;
  relatedResearchLimit?: number;
  onSuccess?: (research: Research) => void;
  onError?: (error: string) => void;
}

interface UseResearchDetailReturn {
  research: Research | null;
  relatedResearch: Research[];
  isLoading: boolean;
  isRelatedLoading: boolean;
  error: string | null;
  relatedError: string | null;
  fetchResearch: () => Promise<void>;
  fetchRelatedResearch: () => Promise<void>;
  refetch: () => Promise<void>;
  deleteResearch: () => Promise<boolean>;
  downloadMedia: () => Promise<void>;
  incrementViews: () => Promise<void>;
}

export const useResearchDetail = (
  researchId: string | number,
  options: UseResearchDetailOptions = {}
): UseResearchDetailReturn => {
  const {
    enableAutoFetch = true,
    enableRelatedResearch = true,
    relatedResearchLimit = 4,
    onSuccess,
    onError,
  } = options;

  // State
  const [research, setResearch] = useState<Research | null>(null);
  const [relatedResearch, setRelatedResearch] = useState<Research[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRelatedLoading, setIsRelatedLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedError, setRelatedError] = useState<string | null>(null);

  // Refs
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const relatedAbortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function
  // const cleanup = useCallback(() => {
  //   isMountedRef.current = false;
  //   abortControllerRef.current?.abort();
  //   relatedAbortControllerRef.current?.abort();
  // }, []);

  const { createAbortController, cleanupAbortController, safeSetState, isMounted } =
    useAbortableFetch();

  // Fetch research detail
  const fetchResearch = useCallback(async () => {
    if (!researchId) return;

    // Sử dụng createAbortController từ hook
    const controller = createAbortController();

    safeSetState(() => {
      setIsLoading(true);
      setError(null);
    });

    try {
      const result = await fetchApi<Research>(`/api/research/${researchId}`, {
        signal: controller.signal,
      });

      if (!isMounted()) return;

      if (result.success && result.data) {
        safeSetState(() => {
          setResearch(result.data || null);
        });
        onSuccess?.(result.data);
      } else {
        throw new Error(result.message || "Không thể tải thông tin nghiên cứu");
      }
    } catch (err: any) {
      if (!isMounted()) return;

      if (err.name === "AbortError") {
        console.log("Research fetch aborted");
        return;
      }

      const errorMessage = err.message || "Không thể tải thông tin nghiên cứu";

      safeSetState(() => {
        setError(errorMessage);
        setResearch(null);
      });

      onError?.(errorMessage);

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      cleanupAbortController(controller);
      safeSetState(() => setIsLoading(false));
    }
  }, [
    researchId,
    createAbortController,
    cleanupAbortController,
    safeSetState,
    isMounted,
    onSuccess,
    onError,
  ]);

  const fetchRelatedResearch = useCallback(async () => {
    if (!research?.field || !enableRelatedResearch) {
      safeSetState(() => {
        setRelatedResearch([]);
        setIsRelatedLoading(false);
      });
      return;
    }

    // Abort previous request
    relatedAbortControllerRef.current?.abort();
    relatedAbortControllerRef.current = new AbortController();

    safeSetState(() => {
      setIsRelatedLoading(true);
      setRelatedError(null);
    });

    try {
      const queryParams = new URLSearchParams({
        pageIndex: "1",
        pageSize: relatedResearchLimit.toString(),
        "filters[field]": research.field,
        "filters[status]": "3", // Published only
        excludeId: research.id.toString(),
        sortField: "views",
        sortDirection: "desc",
      });

      const result = await fetchApi<HerbResponse<Research[]>>(
        `/api/research/search?${queryParams}`,
        {
          signal: relatedAbortControllerRef.current.signal,
        }
      );

      if (!isMountedRef.current) return;

      if (result.success && result.data) {
        safeSetState(() => {
          setRelatedResearch(result.data?.content || []);
        });
      } else {
        throw new Error(result.message || "Không thể tải nghiên cứu liên quan");
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;

      if (err.name === "AbortError") {
        console.log("Related research fetch aborted");
        return;
      }

      const errorMessage = err.message || "Không thể tải nghiên cứu liên quan";

      safeSetState(() => {
        setRelatedError(errorMessage);
        setRelatedResearch([]);
      });

      // Don't show toast for related research errors (less critical)
      console.error("Related research error:", errorMessage);
    } finally {
      safeSetState(() => setIsRelatedLoading(false));
    }
  }, [research, enableRelatedResearch, relatedResearchLimit, safeSetState]);

  // Refetch both research and related research
  const refetch = useCallback(async () => {
    await fetchResearch();
    if (enableRelatedResearch) {
      await fetchRelatedResearch();
    }
  }, [fetchResearch, fetchRelatedResearch, enableRelatedResearch]);

  // Delete research
  const deleteResearch = useCallback(async (): Promise<boolean> => {
    if (!research?.id) return false;

    if (!confirm("Bạn có chắc chắn muốn xóa nghiên cứu này?")) {
      return false;
    }

    try {
      const result = await fetchApi(`/api/research/${research.id}`, {
        method: "DELETE",
      });

      if (result.success || result.code === 200) {
        toast({
          title: "Thành công",
          description: "Đã xóa nghiên cứu thành công!",
        });
        return true;
      } else {
        throw new Error(result.message || "Không thể xóa nghiên cứu");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Không thể xóa nghiên cứu";

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  }, [research]);

  const downloadMedia = useCallback(async () => {
    if (!research?.mediaId) {
      toast({
        title: "Lỗi",
        description: "Không có tệp để tải xuống",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await fetch(`/api/media/${research.mediaId}/download`);

      if (!response.ok) {
        throw new Error("Không thể tải xuống tệp");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = `${research.title}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Thành công",
        description: "Tệp đã được tải xuống",
      });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể tải xuống tệp",
        variant: "destructive",
      });
    }
  }, [research]);

  const incrementViews = useCallback(async () => {
    if (!research?.id) return;

    try {
      await fetchApi(`/api/research/${research.id}/views`, {
        method: "POST",
      });

      // Optionally update local state
      safeSetState(() => {
        if (research) {
          setResearch({
            ...research,
            views: (research.views || 0) + 1,
          });
        }
      });
    } catch (err) {
      // Silently fail for view increment
      console.error("Failed to increment views:", err);
    }
  }, [research, safeSetState]);

  // Effects
  // useEffect(() => {
  //   isMountedRef.current = true;
  //   return cleanup;
  // }, [cleanup]);

  useEffect(() => {
    if (enableAutoFetch && researchId) {
      fetchResearch();
    }
  }, [enableAutoFetch, researchId, fetchResearch]);

  useEffect(() => {
    if (research && enableRelatedResearch) {
      fetchRelatedResearch();
    }
  }, [research, enableRelatedResearch, fetchRelatedResearch]);

  return {
    research,
    relatedResearch,
    isLoading,
    isRelatedLoading,
    error,
    relatedError,
    fetchResearch,
    fetchRelatedResearch,
    refetch,
    deleteResearch,
    downloadMedia,
    incrementViews,
  };
};
