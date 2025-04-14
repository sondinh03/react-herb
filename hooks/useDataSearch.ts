import { useEffect, useState } from "react";

interface SearchParams {
  pageIndex: number;
  pageSize: number;
  keyword: string;
  sortField?: string;
  sortDirection?: string;
  filters?: Record<string, string>;
}

interface SearchHookOptions {
  apiEndpoint: string;
  initialParams?: Partial<SearchParams>;
  requireAuth?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useDataSearch<T>({
  apiEndpoint,
  initialParams = {},
  requireAuth = false,
  onSuccess,
  onError,
}: SearchHookOptions) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    currentPage: initialParams.pageIndex || 1,
    totalPages: 0,
    totalElements: 0,
    pageSize: initialParams.pageSize || 10,
  });

  const [searchParams, setSearchParams] = useState<SearchParams>({
    pageIndex: initialParams.pageIndex || 1,
    pageSize: initialParams.pageSize || 10,
    keyword: initialParams.keyword || "",
    sortField: initialParams.sortField || "",
    sortDirection: initialParams.sortDirection || "asc",
    filters: initialParams.filters || {},
  });

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      // Add basic params
      queryParams.append("pageIndex", searchParams.pageIndex.toString());
      queryParams.append("pageSize", searchParams.pageSize.toString());

      if (searchParams.keyword) {
        queryParams.append("keyword", searchParams.keyword);
      }

      if (searchParams.sortField) {
        queryParams.append("sortField", searchParams.sortField);
        queryParams.append(
          "sortDirection",
          searchParams.sortDirection || "asc"
        );
      }

      // Add filters
      if (searchParams.filters) {
        Object.entries(searchParams.filters).forEach(([key, value]) => {
          if (value) queryParams.append(`filters[${key}]`, value);
        });
      }

      // Call API
      const headers: HeadersInit = {};
      if (requireAuth) {
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          headers.Authorization = `Bearer ${accessToken}`;
        }
      }

      const response = await fetch(`${apiEndpoint}?${queryParams.toString()}`, {
        headers,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to fetch data");
      }

      if (result.success) {
        setData(result.data.content);
        setPagination({
          currentPage: result.data.number,
          totalPages: result.data.totalPages,
          totalElements: result.data.totalElements,
          pageSize: result.data.size,
        });

        // Update URL params
        updateUrlWithSearchParams();

        if (onSuccess) onSuccess(result.data);
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setError(err.message || "An error occurred");
      if (onError) onError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUrlWithSearchParams = () => {
    const params = new URLSearchParams();

    params.set("page", searchParams.pageIndex.toString());
    params.set("size", searchParams.pageSize.toString());

    if (searchParams.keyword) {
      params.set("keyword", searchParams.keyword);
    }

    if (searchParams.sortField) {
      params.set("sortField", searchParams.sortField);
      params.set("sortDirection", searchParams.sortDirection || "asc");
    }

    // Add filters to URL
    if (searchParams.filters) {
      Object.entries(searchParams.filters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
    }

    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  };

  // Search handler
  const handleSearch = () => {
    setSearchParams((prev) => ({
      ...prev,
      pageIndex: 1, // Reset to first page on search
    }));
  };

  // Keyword change
  const handleKeywordChange = (value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      keyword: value,
    }));
  };

  // Page change
  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageIndex: page,
    }));
  };

  // Page size change
  const handlePageSizeChange = (size: number) => {
    setSearchParams((prev) => ({
      ...prev,
      pageSize: size,
      pageIndex: 1, // Reset to first page
    }));
  };

  // Filter change
  const handleFilterChange = (key: string, value: string) => {
    setSearchParams((prev) => ({
      ...prev,
      pageIndex: 1, // Reset to first page
      filters: { ...prev.filters, [key]: value },
    }));
  };

  // Sort change
  const handleSortChange = (field: string, direction?: string) => {
    setSearchParams((prev) => ({
      ...prev,
      pageIndex: 1, // Reset to first page
      sortField: field,
      sortDirection: direction || "asc",
    }));
  };

  // Fetch data when search params change
  useEffect(() => {
    fetchData();
  }, [searchParams]);

  return {
    data,
    isLoading,
    error,
    pagination,
    searchParams,
    handleSearch,
    handleKeywordChange,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
    handleSortChange,
    fetchData,
  };
}
