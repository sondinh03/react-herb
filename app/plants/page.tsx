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
import { Search, Filter, Image as ImageIcon } from "lucide-react";

// Import MediaViewer component

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import { Pagination } from "@/components/pagination";
import { MediaViewer } from "@/components/media/media-viewer";
import { DiseaseSelector } from "@/components/diseases/diseases-selector";
import { DiseasesResponse } from "../types/diseases";

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

// Định nghĩa interface cho Media Featured Response
interface MediaFeaturedResponse {
  code: number;
  success: boolean;
  message: string;
  data: {
    mediaId: number;
  };
}

// Định nghĩa interface cho Page
export interface Page<T> {
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
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  code?: number;
}

// Định nghĩa interface cho SearchParams
export interface SearchParams {
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
  const [selectedDisease, setSelectedDisease] = useState("all");
  const [diseases, setDiseases] = useState<DiseasesResponse[]>([]);

  // State để lưu các mediaId đã fetch được
  const [plantMediaMap, setPlantMediaMap] = useState<Record<number, number>>(
    {}
  );

  // State cho loading media
  const [loadingMedia, setLoadingMedia] = useState<Record<number, boolean>>({});

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

  // Fetch media featured cho 1 plant
  const fetchMediaFeatured = async (plantId: number) => {
    // Đánh dấu đang loading media cho plant này
    setLoadingMedia((prev) => ({
      ...prev,
      [plantId]: true,
    }));

    try {
      const response = await fetch(`/api/plants/${plantId}/media-featured`);
      const result = await response.json();

      if (result.success && result.data && typeof result.data === "number") {
        // Lưu mediaId vào state map
        setPlantMediaMap((prev) => ({
          ...prev,
          [plantId]: result.data,
        }));
      }
    } catch (error) {
      console.error(
        `Error fetching featured media for plant ${plantId}:`,
        error
      );
    } finally {
      // Kết thúc loading
      setLoadingMedia((prev) => ({
        ...prev,
        [plantId]: false,
      }));
    }
  };

  // Fetch featured media cho tất cả plants trong danh sách
  const fetchAllMediaFeatured = async (plantList: Plant[]) => {
    const fetchPromises = plantList.map((plant) =>
      fetchMediaFeatured(plant.id)
    );
    await Promise.all(fetchPromises);
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
        const plantsData = result.data.content;
        setPlants(plantsData);
        setTotalElements(result.data.totalElements);
        setTotalPages(result.data.totalPages);

        // Cập nhật URL với tham số tìm kiếm
        updateUrlWithSearchParams();

        // Fetch featured media cho tất cả plants
        fetchAllMediaFeatured(plantsData);
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

  const fetchDiseases = async () => {
    setIsLoadingDiseases(true);
    try {
      const response = await fetch("/api/diseases/search");
      const result = await response.json();

      if (result.success) {
        setDiseases(result.data);
      } else {
        console.error("Error fetching diseases:", result.message);
      }
    } catch (error) {
      console.error("Error fetching diseases:", error);
    } finally {
      setIsLoadingDiseases(false);
    }
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchDiseases();
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

Search and Filter
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
            <DiseaseSelector
                value={selectedDisease}
                onValueChange={setSelectedDisease}
              />
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

      Tabs
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

         Grid View
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
                plants.map((plant) => {
                  const mediaId = plantMediaMap[plant.id];
                  const isMediaLoading = loadingMedia[plant.id];
                  // alert("mediaId: " + mediaId)
                  console.log("mediaId: ", mediaId);

                  return (
                    <Card key={plant.id} className="overflow-hidden">
                      <div className="h-48 bg-green-50 relative overflow-hidden">
                        {mediaId ? (
                          <MediaViewer
                            mediaId={mediaId}
                            className="w-full h-full object-cover max-w-full max-h-full"
                            showLoader={true}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                            {isMediaLoading ? (
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                            ) : (
                              <>
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                                <span className="mt-2 text-sm text-gray-500">
                                  {plant.name}
                                </span>
                              </>
                            )}
                          </div>
                        )}
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
                        <Link href={`/plants/${plant.id}`} className="w-full">
                          <Button variant="outline" className="w-full">
                            Xem chi tiết
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })
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

       List View
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
                plants.map((plant) => {
                  const mediaId = plantMediaMap[plant.id];
                  const isMediaLoading = loadingMedia[plant.id];

                  return (
                    <div
                      key={plant.id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-48 h-48 sm:h-auto bg-green-50 flex-shrink-0">
                          {mediaId ? (
                            <MediaViewer
                              mediaId={mediaId}
                              className="w-full h-full object-cover"
                              showLoader={true}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                              {isMediaLoading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                              ) : (
                                <>
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                  <span className="mt-2 text-sm text-gray-500">
                                    {plant.name}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
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
                            <Link href={`/plants/${plant.id}`}>
                              <Button variant="outline">Xem chi tiết</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
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

     Pagination 
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

/*
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

  // State cho diseases
  const [selectedDisease, setSelectedDisease] = useState("all");

  // State để lưu các mediaId đã fetch được
  const [plantMediaMap, setPlantMediaMap] = useState<Record<number, number>>({});

  // State cho loading media
  const [loadingMedia, setLoadingMedia] = useState<Record<number, boolean>>({});

  // State cho tham số tìm kiếm
  const [searchState, setSearchState] = useState<SearchParams>({
    pageIndex: Number.parseInt(searchParams.get("page") || "1", 10),
    pageSize: Number.parseInt(searchParams.get("size") || "8", 10),
    keyword: searchParams.get("keyword") || "",
    // disease: searchParams.get("disease") || "",
    sortField: searchParams.get("sortField") || "",
    sortDirection: searchParams.get("sortDirection") || "asc",
  });

  // Xử lý tìm kiếm
  const handleSearch = () => {
    setSearchState((prev) => ({
      ...prev,
      pageIndex: 1, // Reset về trang 1 khi tìm kiếm
    }));
  };

  // Xử lý thay đổi từ khóa
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchState((prev) => ({
      ...prev,
      keyword: e.target.value,
    }));
  };

  // Xử lý thay đổi bệnh
  const handleDiseaseChange = (value: string) => {
    setSelectedDisease(value);
    setSearchState((prev) => ({
      ...prev,
      disease: value === "all" ? "" : value,
      pageIndex: 1, // Reset về trang 1 khi thay đổi filter
    }));
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
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page: number) => {
    setSearchState((prev) => ({
      ...prev,
      pageIndex: page,
    }));
  };

  // Xử lý thay đổi kích thước trang
  const handlePageSizeChange = (size: number) => {
    setSearchState((prev) => ({
      ...prev,
      pageSize: size,
      pageIndex: 1, // Reset về trang 1 khi thay đổi kích thước trang
    }));
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

  // Fetch media featured cho 1 plant
  const fetchMediaFeatured = async (plantId: number) => {
    setLoadingMedia((prev) => ({
      ...prev,
      [plantId]: true,
    }));

    try {
      const response = await fetch(`/api/plants/${plantId}/media-featured`);
      const result: MediaFeaturedResponse = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể tải media");
      }

      if (result.success && result.data?.mediaId) {
        setPlantMediaMap((prev) => ({
          ...prev,
          [plantId]: result.data.mediaId,
        }));
      }
    } catch (error) {
      console.error(`Error fetching featured media for plant ${plantId}:`, error);
    } finally {
      setLoadingMedia((prev) => ({
        ...prev,
        [plantId]: false,
      }));
    }
  };

  // Fetch featured media cho tất cả plants trong danh sách
  const fetchAllMediaFeatured = async (plantList: Plant[]) => {
    const fetchPromises = plantList.map((plant) =>
      fetchMediaFeatured(plant.id)
    );
    await Promise.all(fetchPromises);
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

      // Thêm filter disease nếu có
      // if (searchState.disease) {
      //   queryParams.append("filters[disease]", searchState.disease);
      // }

      // Gọi API
      const response = await fetch(
        `/api/plants/search?${queryParams.toString()}`
      );
      const result: ApiResponse<Page<Plant>> = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể tải dữ liệu");
      }

      if (result.success) {
        const plantsData = result.data.content;
        setPlants(plantsData);
        setTotalElements(result.data.totalElements);
        setTotalPages(result.data.totalPages);

        // Cập nhật URL với tham số tìm kiếm
        updateUrlWithSearchParams();

        // Fetch featured media cho tất cả plants
        await fetchAllMediaFeatured(plantsData);
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

    // if (searchState.disease) {
    //   params.set("disease", searchState.disease);
    // }

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

  // Fetch dữ liệu khi searchState thay đổi
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
            <DiseaseSelector
              value={selectedDisease}
              onValueChange={handleDiseaseChange}
            />
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
                plants.map((plant) => {
                  const mediaId = plantMediaMap[plant.id];
                  const isMediaLoading = loadingMedia[plant.id];

                  return (
                    <Card key={plant.id} className="overflow-hidden">
                      <div className="h-48 bg-green-50 relative overflow-hidden">
                        {mediaId ? (
                          <MediaViewer
                            mediaId={mediaId}
                            className="w-full h-full object-cover max-w-full max-h-full"
                            showLoader={true}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                            {isMediaLoading ? (
                              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                            ) : (
                              <>
                                <ImageIcon className="h-8 w-8 text-gray-400" />
                                <span className="mt-2 text-sm text-gray-500">
                                  {plant.name}
                                </span>
                              </>
                            )}
                          </div>
                        )}
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
                       {plant.diseases && plant.diseases.length > 0 && (
                          <p className="text-sm text-gray-500">
                            Bệnh: {plant.diseases.map((d) => d.name).join(", ")}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter>
                        <Link href={`/plants/${plant.id}`} className="w-full">
                          <Button variant="outline" className="w-full">
                            Xem chi tiết
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })
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
                plants.map((plant) => {
                  const mediaId = plantMediaMap[plant.id];
                  const isMediaLoading = loadingMedia[plant.id];

                  return (
                    <div
                      key={plant.id}
                      className="bg-white rounded-lg shadow-sm overflow-hidden"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-48 h-48 sm:h-auto bg-green-50 flex-shrink-0">
                          {mediaId ? (
                            <MediaViewer
                              mediaId={mediaId}
                              className="w-full h-full object-cover"
                              showLoader={true}
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100">
                              {isMediaLoading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
                              ) : (
                                <>
                                  <ImageIcon className="h-8 w-8 text-gray-400" />
                                  <span className="mt-2 text-sm text-gray-500">
                                    {plant.name}
                                  </span>
                                </>
                              )}
                            </div>
                          )}
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
                       {plant.diseases && plant.diseases.length > 0 && (
                            <p className="text-sm text-gray-600 mb-4">
                              Bệnh: {plant.diseases.map((d) => d.name).join(", ")}
                            </p>
                          )} 
                          <p className="text-sm text-gray-600 mb-4">
                            {plant.scientificName}
                          </p>
                          <div className="flex justify-end">
                            <Link href={`/plants/${plant.id}`}>
                              <Button variant="outline">Xem chi tiết</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
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

      {totalPages > 1 && (
        <Pagination
          currentPage={searchState.pageIndex}
          totalPages={totalPages}
          totalItems={totalElements}
          pageSize={searchState.pageSize}
          onPageChange={handlePageChange}
          // onPageSizeChange={handlePageSizeChange}
          className="mt-12"
        />
      )}
    </div>
  );
}
*/