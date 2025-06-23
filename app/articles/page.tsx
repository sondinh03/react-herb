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
import { Search, Image as ImageIcon, X, Calendar, User } from "lucide-react";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "@/hooks/use-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "@/components/pagination";
import { MediaViewer } from "@/components/media/media-viewer";
import { fetchApi } from "@/lib/api-client";
import { GenericSelector } from "@/components/GenericSelector";
import { Page, SearchParams } from "@/types/api";
import { DiseasesResponse } from "../types/diseases";
import { Article } from "../admin/articles/[id]/page";

export default function ArticlesPage() {
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

  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");
  const [diseases, setDiseases] = useState<DiseasesResponse[]>([]);
  const [isLoadingDiseases, setIsLoadingDiseases] = useState(false);

  const fetchArticles = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryParams(searchState);

      const result = await fetchApi<Page<Article>>(
        `/api/articles/search?${queryParams}`
      );

      setArticles(result.data?.content || []);
      setTotalElements(result.data?.totalElements || 0);
      setTotalPages(result.data?.totalPages || 1);
      updateUrlWithSearchParams();
    } catch (error: any) {
      setError(error.message || "Đã xảy ra lỗi khi tải dữ liệu bài viết");
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi tải dữ liệu bài viết",
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
        diseaseId: value === "all" ? "all" : value,
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
      case "title-asc":
        sortField = "title";
        sortDirection = "asc";
        break;
      case "title-desc":
        sortField = "title";
        sortDirection = "desc";
        break;
      case "newest":
        sortField = "publishedAt";
        sortDirection = "desc";
        break;
      case "oldest":
        sortField = "publishedAt";
        sortDirection = "asc";
        break;
      case "popular":
        sortField = "views";
        sortDirection = "desc";
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
    if (sortField === "title") {
      return sortDirection === "asc" ? "title-asc" : "title-desc";
    } else if (sortField === "publishedAt") {
      return sortDirection === "asc" ? "oldest" : "newest";
    } else if (sortField === "views") {
      return "popular";
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
    router.push(`/articles?${params}`, { scroll: true });
  }, [searchState, router]);

  useEffect(() => {
    fetchDiseases();
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [
    searchState.pageIndex,
    searchState.pageSize,
    searchState.sortField,
    searchState.sortDirection,
    searchState.filters.diseaseId,
    searchState.filters.status,
  ]);

  useEffect(() => {
    if (searchState.pageIndex === 0) {
      setSearchState((prev) => ({
        ...prev,
        pageIndex: 1,
      }));
    }
  }, [articles]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bài viết</h1>
          <p className="mt-2 text-gray-600">
            Các bài viết về cây dược liệu và công dụng
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="col-span-1 md:col-span-7">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung..."
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
                <SelectItem value="title-asc">Tiêu đề A-Z</SelectItem>
                <SelectItem value="title-desc">Tiêu đề Z-A</SelectItem>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="popular">Phổ biến nhất</SelectItem>
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
              {articles.length > 0 ? (
                articles.map((article) => (
                  <Card key={article.id} className="overflow-hidden">
                    <div className="h-48 bg-green-50 relative overflow-hidden">
                      {article.featuredImage ? (
                        <img
                          src={article.featuredImage}
                          className="w-full h-full object-cover"
                          alt={article.title}
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
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                            article.isFeatured
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {article.isFeatured ? "Nổi bật" : "Công dụng"}
                        </span>
                        <div className="flex items-center text-gray-500 text-sm">
                          <Calendar className="h-4 w-4 mr-1" />
                          {article.publishedAt
                            ? new Date(article.publishedAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : "Chưa xuất bản"}
                        </div>
                      </div>
                      <CardTitle className="text-lg">{article.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {article.excerpt}
                      </p>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-500">
                          {article.createdBy}
                        </span>
                      </div>
                      <Link href={`/articles/${article.id}`}>
                        <Button variant="outline" size="sm">
                          Đọc tiếp
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Không tìm thấy bài viết nào phù hợp.
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
              {articles.length > 0 ? (
                articles.map((article) => (
                  <div
                    key={article.id}
                    className="bg-white rounded-lg shadow-sm overflow-hidden"
                  >
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 h-48 sm:h-auto bg-green-50 flex-shrink-0">
                        {article.featuredImage ? (
                          <img
                            src={article.featuredImage}
                            className="w-full h-full object-cover"
                            alt={article.title}
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
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                              article.isFeatured
                                ? "bg-green-100 text-green-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {article.isFeatured ? "Nổi bật" : "Công dụng"}
                          </span>
                          <div className="flex items-center text-gray-500 text-sm">
                            <Calendar className="h-4 w-4 mr-1" />
                            {article.publishedAt
                              ? new Date(article.publishedAt).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "Chưa xuất bản"}
                          </div>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {article.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {article.excerpt}
                        </p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                          <p className="text-sm text-gray-500">
                            Tác giả: {article.createdBy}
                          </p>
                          <p className="text-sm text-gray-500">
                            Lượt xem: {article.views}
                          </p>
                        </div>
                        <div className="flex justify-end">
                          <Link href={`/articles/${article.id}`}>
                            <Button variant="outline">Đọc tiếp</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Không tìm thấy bài viết nào phù hợp.
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