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
import {
  Search,
  Filter,
  MapPin,
  GraduationCap,
  BookOpen,
  Award,
  X,
  User,
  Mail,
  MessageCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ExpertResponseDto } from "../types/expert";
import { SearchDto } from "@/lib/api-utils";
import { useRouter, useSearchParams } from "next/navigation";
import { Page, SearchParams } from "@/types/api";
import { fetchApi } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaViewer from "@/components/media/media-viewer";
import { Pagination } from "@/components/pagination";
import { PAGINATION } from "@/constants/pagination";

export default function ExpertsPage() {
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
    sortDirection: searchParams.get("sortDirection") || "asc",
    filters: {
      specialization: searchParams.get("specialization") || "all",
      status: searchParams.get("status") || "all",
      institution: searchParams.get("institution") || "all",
    },
  });

  const [experts, setExperts] = useState<ExpertResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  const fetchExperts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = buildQueryParams(searchState);

      const result = await fetchApi<Page<ExpertResponseDto>>(
        `/api/expert/search?${queryParams}`
      );

      setExperts(result.data?.content || []);
      setTotalElements(result.data?.totalElements || 0);
      setTotalPages(result.data?.totalPages || 1);
      updateUrlWithSearchParams();
    } catch (error: any) {
      setError(error.message || "Đã xảy ra lỗi khi tải dữ liệu chuyên gia");
      toast({
        title: "Lỗi",
        description:
          error.message || "Đã xảy ra lỗi khi tải dữ liệu chuyên gia",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      pageIndex: 1,
    }));
  }, []);

  const handleClearKeyword = useCallback(() => {
    setSearchState((prev) => ({
      ...prev,
      keyword: "",
      pageIndex: 1,
    }));
  }, []);

  const handleSpecializationChange = useCallback((value: string) => {
    setSearchState((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        specialization: value === "all" ? "all" : value,
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
      case "specialization":
        sortField = "specialization";
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
    } else if (sortField === "specialization") {
      return "specialization";
    }
    return "";
  }, [searchState.sortField, searchState.sortDirection]);

  const buildQueryParams = (state: SearchParams) => {
    const params = new URLSearchParams();
    params.set("page", (state.pageIndex - 1).toString()); // API sử dụng 0-based index
    params.set("size", state.pageSize.toString());

    if (state.keyword) {
      params.set("keyword", state.keyword);
    }

    if (state.sortField) {
      params.set("sort", `${state.sortField},${state.sortDirection}`);
    }

    Object.entries(state.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "all") {
        params.set(key, value.toString());
      }
    });

    return params.toString();
  };

  const updateUrlWithSearchParams = useCallback(() => {
    const params = new URLSearchParams();
    params.set("page", searchState.pageIndex.toString());
    params.set("size", searchState.pageSize.toString());

    if (searchState.keyword) {
      params.set("keyword", searchState.keyword);
    }

    if (searchState.sortField) {
      params.set("sortField", searchState.sortField);
      params.set("sortDirection", searchState.sortDirection);
    }

    Object.entries(searchState.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "all") {
        params.set(key, value.toString());
      }
    });

    router.push(`/experts?${params.toString()}`, { scroll: false });
  }, [searchState, router]);

  useEffect(() => {
    fetchExperts();
  }, [
    searchState.pageIndex,
    searchState.pageSize,
    searchState.sortField,
    searchState.sortDirection,
    searchState.filters.specialization,
    searchState.filters.status,
  ]);

  useEffect(() => {
    if (searchState.pageIndex === 0) {
      setSearchState((prev) => ({
        ...prev,
        pageIndex: 1,
      }));
    }
  }, [searchState.pageIndex]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Chuyên gia dược liệu
            </h1>
            <p className="mt-2 text-gray-600">
              Danh sách các chuyên gia trong lĩnh vực dược liệu
            </p>
          </div>
          {/* <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Lọc
            </Button>
          </div> */}
        </div>

        {/* Search and Filter */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="col-span-1 md:col-span-9">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Tìm kiếm chuyên gia theo tên, chuyên ngành..."
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
              <Select value={getSortByValue} onValueChange={handleSortChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Tên A-Z</SelectItem>
                  <SelectItem value="name-desc">Tên Z-A</SelectItem>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="oldest">Cũ nhất</SelectItem>
                  <SelectItem value="specialization">
                    Theo chuyên ngành
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabs for View Type */}
        <Tabs
          value={viewType}
          onValueChange={(value) => setViewType(value as "grid" | "list")}
          className="mb-8"
        >
          {/* Grid View */}
          <TabsContent value="grid" className="mt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: searchState.pageSize }).map(
                  (_, index) => (
                    <Card key={index} className="overflow-hidden animate-pulse">
                      <div className="flex justify-center pt-6">
                        <div className="w-32 h-32 rounded-full bg-gray-200"></div>
                      </div>
                      <CardHeader className="text-center pb-2">
                        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mt-2"></div>
                      </CardHeader>
                      <CardContent className="pb-2 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <div className="h-9 bg-gray-200 rounded flex-1"></div>
                        <div className="h-9 bg-gray-200 rounded flex-1"></div>
                      </CardFooter>
                    </Card>
                  )
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {experts.length > 0 ? (
                  experts.map((expert) => (
                    <Card
                      key={expert.id}
                      className="overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-center pt-6">
                        <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
                          {expert.avatarId && expert.avatarId > 0 ? (
                            <MediaViewer
                              mediaId={expert.avatarId}
                              className="w-full h-full object-cover"
                              width="128"
                              height="128"
                              alt={expert.name}
                              showLoader={true}
                              priority={false}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <User className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </div>
                      <CardHeader className="text-center pb-2">
                        <CardTitle className="text-lg">
                          {expert.title} {expert.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500">
                          {expert.specialization}
                        </p>
                      </CardHeader>
                      <CardContent className="pb-2 space-y-3">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{expert.institution}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <GraduationCap className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                          <span className="truncate">{expert.education}</span>
                        </div>
                        {expert.achievements && (
                          <div className="flex items-center text-sm">
                            <Award className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="truncate">
                              {expert.achievements}
                            </span>
                          </div>
                        )}
                        {expert.contactEmail && (
                          <div className="flex items-center text-sm">
                            <Mail className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                            <span className="truncate">
                              {expert.contactEmail}
                            </span>
                          </div>
                        )}
                        {expert.bio && (
                          <div className="text-sm text-gray-600">
                            <p className="line-clamp-2">{expert.bio}</p>
                          </div>
                        )}
                      </CardContent>
                      {/* <CardFooter className="flex gap-2">
                        <Link href={`/experts/${expert.slug || expert.id}`} className="flex-1">
                          <Button variant="outline" className="w-full">
                            Xem chi tiết
                          </Button>
                        </Link>
                        {expert.zaloPhone && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() => window.open(`https://zalo.me/${expert.zaloPhone}`, '_blank')}
                          >
                            <MessageCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </CardFooter> */}
                      <CardFooter className="flex gap-2">
                        {expert.zaloPhone && (
                          <Button
                            variant="outline"
                            className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                            onClick={() =>
                              window.open(
                                `https://zalo.me/${expert.zaloPhone}`,
                                "_blank"
                              )
                            }
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Liên hệ Zalo
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">
                      Không tìm thấy chuyên gia nào phù hợp.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() =>
                        setSearchState({
                          pageIndex: 1,
                          pageSize: 9,
                          keyword: "",
                          sortField: "",
                          sortDirection: "asc",
                          filters: {
                            specialization: "all",
                            status: "all",
                            institution: "all",
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

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={searchState.pageIndex}
            totalPages={totalPages}
            totalItems={totalElements}
            pageSize={searchState.pageSize}
            onPageChange={handlePageChange}
            className="mt-12"
            pageSizeOptions={[9, 18, 27]}
            showPageSizeSelector={true}
            onPageSizeChange={handlePageSizeChange}
          />
        )}
      </div>
    </div>
  );
}
