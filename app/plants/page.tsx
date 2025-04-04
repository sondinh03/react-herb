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
import { Search, Filter } from "lucide-react";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { PaginationSelect } from "@/components/pagination-select";
import { Pagination } from "@/components/pagination";

// Định nghĩa interface cho Plant
interface Plant {
  id: number;
  name: string;
  scientificName: string;
  slug: string;
  family: string;
  genus: string;
  otherNames?: string;
  partsUsed?: string;
  description?: string;
  distribution?: string;
  imageUrl?: string;
  categories: Category[];
  tags: Tag[];
  media: Media[];
  status: number;
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

// Định nghĩa interface cho Category
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

// Định nghĩa interface cho Tag
interface Tag {
  id: number;
  name: string;
  slug: string;
}

// Định nghĩa interface cho Media
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

// Định nghĩa interface cho Page
interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// Định nghĩa interface cho API Response
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code?: number;
}

// Định nghĩa interface cho SearchParams
interface SearchParams {
  pageIndex: number;
  pageSize: number;
  keyword: string;
  category?: string;
  sortField: string;
  sortDirection: string;
}

export default function PlantsPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // State cho dữ liệu và loading
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State cho phân trang
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // State cho view type
  const [viewType, setViewType] = useState<"grid" | "list">("grid");

  // State cho categories
  const [categories, setCategories] = useState<Category[]>([]);

  // State cho tham số tìm kiếm
  const [searchState, setSearchState] = useState<SearchParams>({
    pageIndex: Number.parseInt(searchParams.get("page") || "1", 10),
    pageSize: Number.parseInt(searchParams.get("size") || "8", 10),
    keyword: searchParams.get("keyword") || "",
    category: searchParams.get("category") || "",
    sortField: searchParams.get("sortField") || "",
    sortDirection: searchParams.get("sortDirection") || "asc",
  });

  // Xử lý tìm kiếm
  const handleSearch = () => {
    setSearchState((prev) => ({
      ...prev,
      pageIndex: 1, // Reset về trang 1 khi tìm kiếm
    }));
    fetchPlants();
  };

  // Xử lý thay đổi từ khóa
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchState((prev) => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  // Xử lý thay đổi danh mục
  const handleCategoryChange = (value: string) => {
    setSearchState((prev) => ({
      ...prev,
      category: value === "all" ? "" : value,
      pageIndex: 1, // Reset về trang 1 khi thay đổi filter
    }));
    fetchPlants();
  };

  // Xử lý thay đổi sắp xếp
  const handleSortChange = (value: string) => {
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
      pageIndex: 1, // Reset về trang 1 khi thay đổi sắp xếp
    }));
    fetchPlants();
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setSearchState((prev) => ({
      ...prev,
      pageIndex: page,
    }));
    fetchPlants();
  };

  // Xử lý thay đổi kích thước trang
  const handlePageSizeChange = (size: number) => {
    setSearchState((prev) => ({
      ...prev,
      pageSize: size,
      pageIndex: 1, // Reset về trang 1 khi thay đổi kích thước trang
    }));
    fetchPlants();
  };

  // Lấy giá trị sortBy từ sortField và sortDirection
  const getSortByValue = () => {
    const { sortField, sortDirection } = searchState;

    if (sortField === "name") {
      return sortDirection === "asc" ? "name-asc" : "name-desc";
    } else if (sortField === "createdAt") {
      return sortDirection === "asc" ? "oldest" : "newest";
    }

    return "";
  };

  // Fetch dữ liệu plants
  const fetchPlants = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Xây dựng query string
      const queryParams = new URLSearchParams();

      // Thêm các tham số cơ bản
      queryParams.append("pageIndex", searchState.pageIndex.toString());
      queryParams.append("pageSize", searchState.pageSize.toString());

      if (searchState.keyword) {
        queryParams.append("keyword", searchState.keyword);
      }

      if (searchState.sortField) {
        queryParams.append("sortField", searchState.sortField);
        queryParams.append("sortDirection", searchState.sortDirection);
      }

      // Thêm filter category nếu có
      if (searchState.category) {
        queryParams.append("filters[category]", searchState.category);
      }

      // Gọi API
      const response = await fetch(
        `/api/plants/search?${queryParams.toString()}`
      );
      const result: ApiResponse<Page<Plant>> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể tải dữ liệu");
      }

      if (result.success) {
        setPlants(result.data.content);
        setTotalElements(result.data.totalElements);
        setTotalPages(result.data.totalPages);

        // Cập nhật URL với tham số tìm kiếm
        updateUrlWithSearchParams();
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error fetching plants:", error);
      setError(error.message || "Đã xảy ra lỗi khi tải dữ liệu");

      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải dữ liệu",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Cập nhật URL với tham số tìm kiếm
  const updateUrlWithSearchParams = () => {
    const params = new URLSearchParams();

    params.set("page", searchState.pageIndex.toString());
    params.set("size", searchState.pageSize.toString());

    if (searchState.keyword) {
      params.set("keyword", searchState.keyword);
    }

    if (searchState.category) {
      params.set("category", searchState.category);
    }

    if (searchState.sortField) {
      params.set("sortField", searchState.sortField);
      params.set("sortDirection", searchState.sortDirection);
    }

    // Cập nhật URL mà không reload trang
    window.history.pushState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  };

  // Fetch danh sách danh mục
  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchPlants();
  }, [searchState]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cây dược liệu</h1>
          <p className="mt-2 text-gray-600">
            Danh sách các loại cây dược liệu Việt Nam
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Lọc
          </Button>
          <Link href="/admin/plants/create">
            <Button>Thêm cây dược liệu</Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Tìm kiếm cây dược liệu..."
                className="pl-10"
                value={searchState.keyword}
                onChange={handleKeywordChange}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              value={searchState.category || "all"}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category.id} value={category.slug}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <>
                    <SelectItem value="thao-duoc">Thảo dược</SelectItem>
                    <SelectItem value="cay-thuoc">Cây thuốc</SelectItem>
                    <SelectItem value="nam">Nấm dược liệu</SelectItem>
                    <SelectItem value="hoa">Hoa dược liệu</SelectItem>
                    <SelectItem value="re">Rễ dược liệu</SelectItem>
                    <SelectItem value="qua">Quả dược liệu</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
            <Select value={getSortByValue()} onValueChange={handleSortChange}>
              <SelectTrigger>
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

      {/* Tabs */}
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
          {/*
          <div className="flex items-center gap-4">
            <PaginationSelect
              value={searchState.pageSize}
              onChange={handlePageSizeChange}
              options={[12, 24, 36, 48]}
              className="hidden sm:flex"
            />
            <div className="text-sm text-gray-500">
              {isLoading
                ? "Đang tải..."
                : `Hiển thị ${
                    plants.length > 0
                      ? (searchState.pageIndex - 1) * searchState.pageSize + 1
                      : 0
                  }-${Math.min(
                    searchState.pageIndex * searchState.pageSize,
                    totalElements
                  )} của ${totalElements} kết quả`}
            </div>
          </div>
          */}
        </div>

        {/* Grid View */}
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
                    <div className="h-48 bg-green-50">
                      <img
                        src={
                          plant.imageUrl ||
                          (plant.media &&
                            plant.media.length > 0 &&
                            plant.media[0].filePath) ||
                          `/placeholder.svg?height=192&width=384&text=${encodeURIComponent(
                            plant.name
                          )}`
                        }
                        alt={plant.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{plant.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-gray-500">
                        Họ: {plant.family}
                      </p>
                      <p className="text-sm text-gray-500">
                        Bộ phận dùng: {plant.partsUsed}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href={`/plants/${plant.slug}`} className="w-full">
                        <Button variant="outline" className="w-full">
                          Xem chi tiết
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500">
                    Không tìm thấy cây dược liệu nào
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* List View */}
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
                        <img
                          src={
                            plant.imageUrl ||
                            (plant.media &&
                              plant.media.length > 0 &&
                              plant.media[0].filePath) ||
                            `/placeholder.svg?height=192&width=192&text=${encodeURIComponent(
                              plant.name
                            )}`
                          }
                          alt={plant.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          {plant.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4">
                          <p className="text-sm text-gray-500">
                            Họ: {plant.family}
                          </p>
                          <p className="text-sm text-gray-500">
                            Chi: {plant.genus}
                          </p>
                          <p className="text-sm text-gray-500">
                            Bộ phận dùng: {plant.partsUsed}
                          </p>
                          <p className="text-sm text-gray-500">
                            Vùng phân bố: {plant.distribution}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">
                          {plant.scientificName}
                        </p>
                        <div className="flex justify-end">
                          <Link href={`/plants/${plant.slug}`}>
                            <Button variant="outline">Xem chi tiết</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    Không tìm thấy cây dược liệu nào
                  </p>
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
        />
      )}
    </div>
  );
}
