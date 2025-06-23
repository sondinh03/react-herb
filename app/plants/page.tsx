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
import { Search, Filter, Image as ImageIcon, X } from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/pagination";
import { MediaViewer } from "@/components/media/media-viewer";
import { fetchApi } from "@/lib/api-client";
import { GenericSelector } from "@/components/GenericSelector";
import { Page, SearchParams } from "@/types/api";
import { Plant } from "../types/plant";
import { DiseasesResponse } from "../types/diseases";

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

interface MediaFeaturedResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    mediaId: number;
  };
}

export default function PlantsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchState, setSearchState] = useState<SearchParams>({
    pageIndex: Number.parseInt(searchParams.get("page") || "1", 10),
    pageSize: Number.parseInt(searchParams.get("size") || "12", 10),
    keyword: searchParams.get("keyword") || "",
    sortField: searchParams.get("sortField") || "",
    sortDirection: searchParams.get("sortDirection") || "asc",
    filters: {
      diseaseId: searchParams.get("diseaseId") || "all",
      status: searchParams.get("status") || "all",
      createdBy: searchParams.get("createdBy") || "all",
    },
  });

  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [diseases, setDiseases] = useState<DiseasesResponse[]>([]);
  const [isLoadingDiseases, setIsLoadingDiseases] = useState(false);

  const fetchPlants = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryParams(searchState);

      const result = await fetchApi<Page<Plant>>(
        `/api/plants/search?${queryParams}`
      );

      setPlants(result.data?.content || []);
      setTotalElements(result.data?.totalElements || 0);
      setTotalPages(result.data?.totalPages || 1);
      updateUrlWithSearchParams();
    } catch (error: any) {
      setError(error.message || "Đã xảy ra lỗi khi tải dữ liệu");
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi tải dữ liệu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDiseases = async () => {
    setIsLoadingDiseases(true);
    try {
      const result = await fetchApi<Page<DiseasesResponse>>(
        "/api/diseases/search"
      );
      setDiseases(result.data?.content || []);
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách bệnh",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDiseases(false);
    }
  };

  const handleKeywordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchState((prev) => ({
        ...prev,
        keyword: e.target.value,
      }));
    },
    []
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    []
  );

  const handleSearch = useCallback(() => {
    setSearchState((prev) => ({
      ...prev,
      pageIndex: 0,
    }));
  }, []);

  const handleClearKeyword = useCallback(() => {
    setSearchState((prev) => ({
      ...prev,
      keyword: "",
      pageIndex: 1,
    }));
  }, []);

  const handleDiseaseChange = useCallback((value: string | number) => {
    setSearchState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        diseaseId: value === "all" ? "all" : value, // Giữ nguyên kiểu dữ liệu của value
      },
      pageIndex: 1,
    }));
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setSearchState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        status: value === "all" ? undefined : value,
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
    }

    setSearchState((prev) => ({
      ...prev,
      sortField,
      sortDirection,
      pageIndex: 1,
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setSearchState((prev) => ({
      ...prev,
      pageIndex: page,
    }));
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setSearchState((prev) => ({
      ...prev,
      pageSize: size,
      pageIndex: 1,
    }));
  }, []);

  const getSortByValue = useMemo(() => {
    const { sortField, sortDirection } = searchState;
    if (sortField === "name") {
      return sortDirection === "asc" ? "name-asc" : "name-desc";
    } else if (sortField === "createdAt") {
      return sortDirection === "asc" ? "oldest" : "newest";
    }
    return "";
  }, [searchState.sortField, searchState.sortDirection]);

  const buildQueryParams = (state: SearchParams) => {
    const params = new URLSearchParams();
    params.set("pageIndex", searchState.pageIndex.toString());
    params.set("pageSize", searchState.pageSize.toString());

    if (searchState.keyword) {
      params.set("keyword", searchState.keyword);
    }

    if (searchState.sortField) {
      params.set("sortField", searchState.sortField);
      params.set("sortDirection", searchState.sortDirection);
    }

    Object.entries(searchState.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "all") {
        params.set(`filters[${key}]`, value.toString());
      }
    });
    return params.toString();
  };

  const updateUrlWithSearchParams = useCallback(() => {
    const params = buildQueryParams(searchState);
    router.push(`/plants?${params}`, { scroll: true });
  }, [searchState, router]);

  useEffect(() => {
    fetchDiseases();
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [
    searchState.pageIndex,
    searchState.pageSize,
    searchState.sortField,
    searchState.sortDirection,
    searchState.filters.diseaseId,
  ]);

  useEffect(() => {
    if (searchState.pageIndex === 0) {
      setSearchState((prev) => ({
        ...prev,
        pageIndex: 1, // Đảm bảo UI hiển thị đúng
      }));
    }
  }, [plants]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cây dược liệu</h1>
          <p className="mt-2 text-gray-600">
            Danh sách các loại cây dược liệu Việt Nam
          </p>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-1 md:col-span-7">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm cây dược liệu theo tên, hoạt chất, công dụng..."
                className="pr-16"
                value={searchState.keyword}
                onChange={handleKeywordChange}
                onKeyDown={handleKeyDown}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                onClick={handleSearch}
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
          <div className="col-span-1 md:col-span-3">
            {isLoadingDiseases ? (
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <GenericSelector
                value={searchState.filters.diseaseId || "all"}
                onValueChange={handleDiseaseChange}
                items={diseases}
                isLoading={isLoadingDiseases}
                isSearching={false}
                searchPlaceholder="Tìm kiếm công dụng..."
                allOption={{ value: "all", label: "Tất cả công dụng" }}
                noResultsText="Không tìm thấy công dụng"
                noDataText="Chưa có dữ liệu công dụng bệnh"
                loadingText="Đang tải danh sách công dụng..."
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
      </div>
      <Tabs
        value={viewType}
        onValueChange={(value) => setViewType(value as "grid" | "list")}
        className="mb-8"
      >
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="grid">Lưới</TabsTrigger>
            <TabsTrigger value="list">Danh sách</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="grid" className="mt-6">
          {isLoading ? (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {plants.length > 0 ? (
                plants.map((plant) => (
                  <Card key={plant.id} className="overflow-hidden">
                    <div className="h-48 bg-green-50 relative overflow-hidden">
                      {plant.featuredMediaId && plant.featuredMediaId > 0 ? (
                        <MediaViewer
                          mediaId={plant.featuredMediaId}
                          className="w-full h-full object-cover"
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
                      <CardTitle className="text-lg">{plant.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-gray-500">
                        Họ: {plant.family || "Không có thông tin"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Tên khoa học:{" "}
                        {plant.scientificName || "Không có thông tin"}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/plants/${plant.id}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          Xem chi tiết
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Không tìm thấy cây dược liệu nào phù hợp.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setSearchState({
                        pageIndex: 1,
                        pageSize: 12,
                        keyword: "",
                        sortField: "",
                        sortDirection: "asc",
                        filters: {
                          diseaseId: undefined,
                          status: undefined,
                          createdBy: undefined,
                        },
                      })
                    }
                    className="mt-4"
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
        <TabsContent value="list" className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: searchState.pageSize }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-sm overflow-hidden animate-pulse"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-48 sm:h-auto bg-gray-200 flex-shrink-0"></div>
                    <div className="p-6 flex-1">
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                      <div className="flex justify-end">
                        <div className="h-9 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {plants.length > 0 ? (
                plants.map((plant) => (
                  <div
                    key={plant.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 h-48 sm:h-auto bg-green-50 flex-shrink-0">
                        {plant.featuredMediaId && plant.featuredMediaId > 0 ? (
                          <MediaViewer
                            mediaId={plant.featuredMediaId}
                            className="w-full h-full object-cover"
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
                      <div className="p-6 flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {plant.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Tên khoa học:{" "}
                          {plant.scientificName || "Không có thông tin"}
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                          <p className="text-sm text-gray-500">
                            Họ: {plant.family || "Không có thông tin"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Chi: {plant.genus || "Không có thông tin"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Bộ phận dùng:{" "}
                            {plant.partsUsed || "Không có thông tin"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Vùng phân bố:{" "}
                            {plant.distribution || "Không có thông tin"}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <Link href={`/plants/${plant.id}`}>
                            <Button variant="outline">Xem chi tiết</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Không tìm thấy cây dược liệu nào phù hợp.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setSearchState({
                        pageIndex: 1,
                        pageSize: 12,
                        keyword: "",
                        sortField: "",
                        sortDirection: "asc",
                        filters: {
                          diseaseId: undefined,
                          status: undefined,
                          createdBy: undefined,
                        },
                      })
                    }
                    className="mt-4"
                  >
                    Xóa bộ lọc
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
      {totalPages > 1 && (
        <Pagination
          currentPage={searchState.pageIndex}
          totalPages={totalPages}
          totalItems={totalElements}
          pageSize={searchState.pageSize}
          onPageChange={handlePageChange}
          className="mt-12"
        />
      )}
    </div>
  );
}


