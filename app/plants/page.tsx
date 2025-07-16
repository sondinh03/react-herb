"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Image as ImageIcon, X, Loader2, AlertCircle } from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/pagination";
import { MediaViewer } from "@/components/media/media-viewer";
import { fetchApi } from "@/lib/api-client";
import { GenericSelector } from "@/components/GenericSelector";
import { Page, SearchParams } from "@/types/api";
import { Plant, PlantStatus } from "../types/plant";
import { DiseasesResponse } from "../types/diseases";
import { PAGINATION } from "@/constants/pagination";
import { ViewType } from "@/types/common";
import { ActiveCompoundResponse } from "../types/activeCompound";

// ============================================================================
// TYPE DEFINITIONS - Định nghĩa các interface và types
// ============================================================================

// Định nghĩa các interface
interface Tag {
  id: number;
  name: string;
  slug: string;
}

interface Media {
  id: number;
  fileName: string;
  filePath: string;
  fileType: number;
  fileSize: number;
  altText?: string;
  isFeatured?: boolean;
  url?: string;
}

/** Response interface khi set featured media */
interface MediaFeaturedResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    mediaId: number;
  };
}

// ============================================================================
// MAIN COMPONENT - Component chính
// ============================================================================

export default function PlantsPage() {
  // Thiết lập hooks và router
  const router = useRouter();
  const searchParams = useSearchParams();

  // STATE MANAGEMENT - Quản lý state
  /** State chính cho tham số tìm kiếm và phân trang */
  const [searchState, setSearchState] = useState<SearchParams>({
    pageIndex: Number.parseInt(
      searchParams.get("page") || PAGINATION.DEFAULT_PAGE_INDEX.toString(),
      10
    ),
    pageSize: Number.parseInt(
      searchParams.get("size") || PAGINATION.DEFAULT_PAGE_SIZE.toString(),
      10
    ),
    keyword: searchParams.get("keyword") || "",
    sortField: searchParams.get("sortField") || "",
    sortDirection: searchParams.get("sortDirection") || "asc",
    filters: {
      diseaseId: searchParams.get("diseaseId") || "all",
      activeCompoundId: searchParams.get("activeCompoundId") || "all",
      status: searchParams.get("status") || "all",
      createdBy: searchParams.get("createdBy") || "all",
    },
  });

  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [diseases, setDiseases] = useState<DiseasesResponse[]>([]);
  const [activeCompounds, setActiveCompounds] = useState<
    ActiveCompoundResponse[]
  >([]);
  const [isLoadingDiseases, setIsLoadingDiseases] = useState(false);
  const [isLoadingActiveCompounds, setIsLoadingActiveCompounds] =
    useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const buildQueryParams = useCallback((state: SearchParams) => {
    const params = new URLSearchParams();

    params.set("pageIndex", Math.max(1, state.pageIndex).toString());
    params.set("pageSize", Math.max(1, state.pageSize).toString());

    if (state.keyword?.trim()) {
      params.set("keyword", state.keyword.trim());
    }

    if (state.sortField) {
      params.set("sortField", state.sortField);
      params.set("sortDirection", state.sortDirection);
    }

    Object.entries(state.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "all" && value !== null) {
        params.set(`filters[${key}]`, value.toString());
      }
    });

    return params.toString();
  }, []);

  const updateUrlWithSearchParams = useCallback(() => {
    const params = buildQueryParams(searchState);
    const newUrl = `/plants${params ? `?${params}` : ""}`;
    router.push(newUrl, { scroll: false });
  }, [searchState, router, buildQueryParams]);

  const fetchPlants = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryParams(searchState);

      const result = await fetchApi<Page<Plant>>(
        `/api/plants/search?${queryParams}`
      );

      if (result.success && result.data) {
        setPlants(result.data.content || []);
        setTotalElements(result.data.totalElements || 0);
        setTotalPages(result.data.totalPages || 1);
      } else {
        throw new Error(result.message || "Không thể tải dữ liệu");
      }
    } catch (error: any) {
      const errorMessage = error.message || "Đã xảy ra lỗi khi tải dữ liệu";
      setError(errorMessage);
      setPlants([]);
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

  const fetchDiseases = useCallback(async (pageSize: number = 50) => {
    setIsLoading(true);
    try {
      const result = await fetchApi<Page<DiseasesResponse>>(
        `/api/diseases/search?pageSize=${pageSize}`
      );
      if (result.success && result.data) {
        setDiseases(result.data.content || []);
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách bệnh",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDiseases(false);
    }
  }, []);

  const fetchActiveCompounds = useCallback(async (pageSize: number = 50) => {
    setIsLoadingActiveCompounds(true);
    try {
      const result = await fetchApi<Page<ActiveCompoundResponse>>(
        `/api/active-compounds/search?pageSize=${pageSize}`
      );

      if (result.success && result.data) {
        setActiveCompounds(result.data.content || []);
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách hoạt chất",
        variant: "destructive",
      });
    } finally {
      setIsLoadingActiveCompounds(false);
    }
  }, []);

  const handleKeywordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newKeyword = e.target.value;
      setSearchState((prev) => ({
        ...prev,
        keyword: newKeyword,
      }));

      // Debounce search
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }

      const timeout = setTimeout(() => {
        setSearchState((prev) => ({
          ...prev,
          pageIndex: 1,
        }));
      }, 500);

      setSearchTimeout(timeout);
    },
    [searchTimeout]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (searchTimeout) {
          clearTimeout(searchTimeout);
        }
        setSearchState((prev) => ({
          ...prev,
          pageIndex: 1,
        }));
      }
    },
    [searchTimeout]
  );

  const handleSearch = useCallback(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchState((prev) => ({
      ...prev,
      pageIndex: 1,
    }));
  }, [searchTimeout]);

  const handleClearKeyword = useCallback(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchState((prev) => ({
      ...prev,
      keyword: "",
      pageIndex: 1,
    }));
  }, [searchTimeout]);

  const handleDiseaseChange = useCallback((value: string | number) => {
    setSearchState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        diseaseId: value === "all" ? "all" : value,
      },
      pageIndex: 1,
    }));
  }, []);

  const handleActiveCompoundChange = useCallback((value: string | number) => {
    setSearchState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        activeCompoundId: value === "all" ? "all" : value,
      },
      pageIndex: 1,
    }));
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setSearchState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        status: value === "all" ? "all" : value,
      },
      pageIndex: 1,
    }));
  }, []);

  const handleSortChange = useCallback((value: string) => {
    let sortField = "";
    let sortDirection = "asc";

    switch (value) {
      case "name-asc":
        sortField = "name";
        sortDirection = "asc";
        break;
      case "name-desc":
        sortField = "name";
        sortDirection = "desc";
        break;
      case "newest":
        sortField = "createdAt";
        sortDirection = "desc";
        break;
      case "oldest":
        sortField = "createdAt";
        sortDirection = "asc";
        break;
      default:
        sortField = "";
        sortDirection = "asc";
    }

    setSearchState((prev) => ({
      ...prev,
      sortField,
      sortDirection,
      pageIndex: 1,
    }));
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      const validPage = Math.max(1, Math.min(page, totalPages));
      setSearchState((prev) => ({
        ...prev,
        pageIndex: validPage,
      }));
    },
    [totalPages]
  );

  const handlePageSizeChange = useCallback((size: number) => {
    const validSize = Math.max(1, size);
    setSearchState((prev) => ({
      ...prev,
      pageSize: validSize,
      pageIndex: 1,
    }));
  }, []);

  const handleClearAllFilters = useCallback(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    setSearchState({
      pageIndex: 1,
      pageSize: PAGINATION.DEFAULT_PAGE_SIZE,
      keyword: "",
      sortField: "",
      sortDirection: "asc",
      filters: {
        diseaseId: "all",
        activeCompoundId: "all",
        status: "all",
        createdBy: "all",
      },
    });
  }, [searchTimeout]);

  // Giá trị được tính toán

  const getSortByValue = useMemo(() => {
    const { sortField, sortDirection } = searchState;
    if (sortField === "name") {
      return sortDirection === "asc" ? "name-asc" : "name-desc";
    } else if (sortField === "createdAt") {
      return sortDirection === "asc" ? "oldest" : "newest";
    }
    return "";
  }, [searchState.sortField, searchState.sortDirection]);

  const hasActiveFilters = useMemo(() => {
    return (
      searchState.keyword?.trim() ||
      searchState.filters.diseaseId !== "all" ||
      searchState.filters.activeCompoundId !== "all" ||
      searchState.filters.status !== "all" ||
      searchState.sortField
    );
  }, [searchState]);

  useEffect(() => {
    fetchDiseases();
    fetchActiveCompounds();
  }, [fetchDiseases, fetchActiveCompounds]);

  // Effect để fetch plants khi searchState thay đổi
  useEffect(() => {
    fetchPlants();
  }, [
    searchState.pageIndex,
    searchState.pageSize,
    searchState.keyword,
    searchState.sortField,
    searchState.sortDirection,
    searchState.filters.diseaseId,
    searchState.filters.activeCompoundId,
    searchState.filters.status,
    searchState.filters.createdBy,
  ]);

  // Effect để cập nhật URL khi searchState thay đổi (nhưng tách riêng khỏi fetch)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateUrlWithSearchParams();
    }, 100); 

    return () => clearTimeout(timeoutId);
  }, [
    searchState.pageIndex,
    searchState.pageSize,
    searchState.keyword,
    searchState.sortField,
    searchState.sortDirection,
    searchState.filters.diseaseId,
    searchState.filters.activeCompoundId,
    searchState.filters.status,
    searchState.filters.createdBy,
  ]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const renderLoadingGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: searchState.pageSize }).map((_, index) => (
        <Card key={index} className="overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <CardHeader className="pb-2">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </CardContent>
          <CardFooter>
            <div className="h-9 bg-gray-200 rounded w-full"></div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  const renderErrorState = () => (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Đã xảy ra lỗi
      </h3>
      <p className="text-gray-600 mb-4">{error}</p>
      <Button onClick={fetchPlants} variant="outline">
        <Loader2 className="h-4 w-4 mr-2" />
        Thử lại
      </Button>
    </div>
  );

  const renderEmptyState = () => (
    <div className="col-span-full text-center py-12">
      <div className="mb-4">
        <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Không tìm thấy cây dược liệu nào
        </h3>
        <p className="text-gray-600">
          {hasActiveFilters
            ? "Thử thay đổi bộ lọc để tìm thấy kết quả phù hợp."
            : "Hiện tại chưa có dữ liệu cây dược liệu nào."}
        </p>
      </div>
      {hasActiveFilters && (
        <Button
          variant="outline"
          onClick={handleClearAllFilters}
          className="mt-4"
        >
          Xóa tất cả bộ lọc
        </Button>
      )}
    </div>
  );

  const renderPlantsGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {plants.map((plant) => (
        <Card
          key={plant.id}
          className="overflow-hidden hover:shadow-lg transition-shadow duration-200"
        >
          <div className="h-48 bg-green-50 relative overflow-hidden">
            {plant.featuredMediaId && plant.featuredMediaId > 0 ? (
              <MediaViewer
                mediaId={plant.featuredMediaId}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                width="100%"
                height="100%"
                alt={plant.name}
                showLoader={true}
                priority={false}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                <ImageIcon className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-500">
                  Không có hình ảnh
                </span>
              </div>
            )}
          </div>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg line-clamp-2" title={plant.name}>
              {plant.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <p className="text-sm text-gray-500 line-clamp-1">
              Họ: {plant.family || "Không có thông tin"}
            </p>
            <p
              className="text-sm text-gray-500 line-clamp-1"
              title={plant.scientificName}
            >
              Tên khoa học: {plant.scientificName || "Không có thông tin"}
            </p>
          </CardContent>
          <CardFooter>
            <Link href={`/plants/${plant.id}`} className="w-full">
              <Button variant="outline" className="w-full hover:bg-green-50">
                Xem chi tiết
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cây dược liệu</h1>
          <p className="mt-2 text-gray-600">
            Danh sách các loại cây dược liệu Việt Nam
            {totalElements > 0 && (
              <span className="ml-2 text-sm font-medium">
                ({totalElements.toLocaleString()} kết quả)
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Search Input */}
          <div className="col-span-1 md:col-span-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm cây dược liệu theo tên, hoạt chất chính, công dụng..."
                className="pr-16"
                value={searchState.keyword}
                onChange={handleKeywordChange}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                onClick={handleSearch}
                disabled={isLoading}
                aria-label="Tìm kiếm"
              >
                <Search className="h-4 w-4" />
              </button>
              {searchState.keyword && (
                <button
                  type="button"
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={handleClearKeyword}
                  aria-label="Xóa từ khóa"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Disease Filter */}
          <div className="col-span-1 md:col-span-2">
            {isLoadingDiseases ? (
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <GenericSelector
                value={searchState.filters.diseaseId || "all"}
                onValueChange={handleDiseaseChange}
                items={diseases}
                isLoading={isLoadingDiseases}
                placeholder="Chọn công dụng"
                // isSearching={false}
                searchPlaceholder="Tìm kiếm công dụng..."
                allOption={{ value: "all", label: "Tất cả công dụng" }}
                noResultsText="Không tìm thấy công dụng"
              />
            )}
          </div>

          {/* ActiveCompound Filter */}
          <div className="col-span-1 md:col-span-2">
            {isLoadingActiveCompounds ? (
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <GenericSelector
                value={searchState.filters.activeCompoundId || "all"}
                onValueChange={handleActiveCompoundChange}
                items={activeCompounds}
                isLoading={isLoadingActiveCompounds}
                isSearching={false}
                searchPlaceholder="Tìm kiếm hoạt chất..."
                allOption={{ value: "all", label: "Tất cả hoạt chất" }}
                noResultsText="Không tìm thấy hoạt chất"
                noDataText="Chưa có dữ liệu hoạt chất"
                loadingText="Đang tải danh sách hoạt chất..."
              />
            )}
          </div>

          <div className="col-span-1 md:col-span-2">
            <Select value={getSortByValue} onValueChange={handleSortChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Tên A-Z</SelectItem>
                <SelectItem value="name-desc">Tên Z-A</SelectItem>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {hasActiveFilters && (
          <div className="mt-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">Đang áp dụng bộ lọc</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAllFilters}
              className="h-6 px-2 text-xs"
            >
              Xóa tất cả
            </Button>
          </div>
        )}
      </div>

      <Tabs
        value={viewType}
        onValueChange={(value) => setViewType(value as "grid" | "list")}
        className="mb-8"
      >
        <TabsContent value="grid" className="mt-6">
          {error
            ? renderErrorState()
            : isLoading
            ? renderLoadingGrid()
            : plants.length > 0
            ? renderPlantsGrid()
            : renderEmptyState()}
        </TabsContent>
      </Tabs>
      {!isLoading && !error && totalPages > 1 && (
        <Pagination
          currentPage={searchState.pageIndex}
          totalPages={totalPages}
          totalItems={totalElements}
          showPageSizeSelector={true}
          onPageSizeChange={handlePageSizeChange}
          pageSize={searchState.pageSize}
          pageSizeOptions={[12, 24, 48]}
          onPageChange={handlePageChange}
          className="mt-12"
        />
      )}
    </div>
  );
}
