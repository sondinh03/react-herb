import { Research } from "@/app/types/research";
import { PAGINATION } from "@/constants/pagination";
import { fetchApi } from "@/lib/api-client";
import { HerbResponse, Page, SearchParams } from "@/types/api";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "../use-toast";

export const useSearchReseaches = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchState, setSearchState] = useState<SearchParams>({
    pageIndex: Number.parseInt(searchParams.get("page") || "1", 10),
    pageSize: Number.parseInt(
      searchParams.get("size") || PAGINATION.DEFAULT_PAGE_SIZE.toString(),
      10
    ),
    keyword: searchParams.get("keyword") || "",
    sortField: searchParams.get("sortField") || "",
    sortDirection:
      (searchParams.get("sortDirection") as "asc" | "desc") || "asc",
    filters: {
      publishedYear: searchParams.get("publishedYear") || "all",
    },
  });

  const [researches, setResearches] = useState<Research[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const buildQueryParams = useCallback((state: SearchParams) => {
    const params = new URLSearchParams();

    params.set("page", state.pageIndex.toString());
    params.set("size", state.pageSize.toString());

    if (state.keyword.trim()) {
      params.set("keyword", state.keyword.trim());
    }

    if (state.sortField) {
      params.set("sortField", state.sortField);
      params.set("sortDirection", state.sortDirection);
    }

    Object.entries(state.filters).forEach(([key, value]) => {
      if (value && value !== "all") {
        params.set(`filters[${key}]`, value.toString());
      }
    });

    return params.toString();
  }, []);

  const updateUrlWithSearchParams = useCallback(() => {
    const queryString = buildQueryParams(searchState);
    const newUrl = queryString ? `?${queryString}` : "";
    router.push(newUrl, { scroll: false });
  }, [searchState, buildQueryParams, router]);

  const fetchResearches = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryParams(searchState);
      const result = await fetchApi<Page<Research>>(
        `api/research/search?${queryParams}`
      );

      if (result.success && result.data) {
        setResearches(result.data.content || []);
        setTotalElements(result.data.totalElements || 0);
        setTotalPages(result.data.totalPages || 1);
      } else {
        throw new Error(result.message || "Không thể tải dữ liệu");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Đã xảy ra lỗi khi tải dữ liệu";
      setError(errorMessage);

      // Reset data on error
      setResearches([]);
      setTotalElements(0);
      setTotalPages(1);

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [searchState, buildQueryParams]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchResearches();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [fetchResearches]);

  useEffect(() => {
    updateUrlWithSearchParams();
  }, [updateUrlWithSearchParams]);

  const updateSearchState = useCallback((updates: Partial<SearchParams>) => {
    setSearchState((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetSearch = useCallback(() => {
    setSearchState({
      pageIndex: 1,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      keyword: "",
      sortField: "",
      sortDirection: "asc",
      filters: {
        publishedYear: "all",
      },
    });
  }, []);

  return {
    searchState,
    researches,
    isLoading,
    error,
    totalElements,
    totalPages,
    updateSearchState,
    resetSearch,
    refetch: fetchResearches,
  };
};
