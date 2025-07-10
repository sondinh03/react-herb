"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Share2,
  Printer,
  BookOpen,
  Leaf,
  FlaskRoundIcon as Flask,
  Map,
  ImageIcon,
  BookIcon,
} from "lucide-react";
import { use, useCallback, useEffect, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { MediaViewer } from "@/components/media/media-viewer";
import { Plant } from "@/app/types/plant";
import { MediaCarousel, MediaItem } from "@/components/media/media-carousel";
import { fetchApi } from "@/lib/api-client";
import { HerbResponse } from "@/types/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/spinner";
import { BackButton } from "@/components/BackButton";
import { handleWait } from "@/components/header";
import React from "react";
import { fetchExternalImage } from "next/dist/server/image-optimizer";
import { create } from "lodash";

export default function PlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const plantId = resolvedParams.id;

  const [plant, setPlant] = useState<Plant | null>(null);
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [isPlantLoading, setIsPlantLoading] = useState(true);
  const [isMediaLoading, setIsMediaLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedPlants, setRelatedPlants] = useState<Plant[]>([]);
  const [isRelatedPlantsLoading, setIsRelatedPlantsLoading] = useState(true);
  const [relatedPlantsError, setRelatedPlantsError] = useState<string | null>(
    null
  );

  const isMountedRef = useRef(true);
  const abortControllersRef = useRef<Set<AbortController>>(new Set());

  const createAbortController = useCallback(() => {
    const controller = new AbortController();
    abortControllersRef.current.add(controller);
    return controller;
  }, []);

  const cleanupAbortController = useCallback((controller: AbortController) => {
    abortControllersRef.current.delete(controller);
  }, []);

  const safeSetState = useCallback((stateSetter: () => void) => {
    if (isMountedRef.current) {
      stateSetter();
    }
  }, []);

  // Fetch plant details
  const fetchPlantDetails = async () => {
    const controller = createAbortController();

    setIsPlantLoading(true);
    setError(null);

    try {
      safeSetState(() => {
        setIsPlantLoading(true);
        setError(null);
      });

      const result = await fetchApi<Plant>(`/api/plants/${plantId}`, {
        signal: controller.signal,
      });

      if (!isMountedRef.current) return;

      if (result.success && result.data) {
        // safeSetState(() => setPlant(result.data));
        setPlant(result.data || []);
      } else {
        throw new Error(
          result.message || "Không thể lấy thông tin cây dược liệu"
        );
      }
    } catch (err: any) {
      if (!isMountedRef.current) return;

      if (err.name === "AbortError") {
        console.log("Plant fetch aborted");
        return;
      }

      const errorMessage =
        err.message || "Không thể lấy thông tin cây dược liệu";

      safeSetState(() => setError(errorMessage));

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      cleanupAbortController(controller);
      safeSetState(() => setIsPlantLoading(false));
    }
  };

  const fetchMediaIds = useCallback(async () => {
    if (!plantId) {
      safeSetState(() => {
        setMediaItems([]);
        setIsMediaLoading(false);
      });
      return;
    }

    const controller = createAbortController();
    let timeoutId: NodeJS.Timeout;

    try {
      safeSetState(() => setIsMediaLoading(true));

      timeoutId = setTimeout(() => {
        controller.abort();
      }, 5000);

      const result = await fetchApi<{ data: string[] }>(
        `/api/plants/${plantId}/media-ids`,
        {
          signal: controller.signal,
        }
      );

      clearTimeout(timeoutId);

      if (!isMountedRef.current) return;

      if (result.code === 200 && result.data) {
        const mediaIds = Array.isArray(result.data) ? result.data : [];
        const items: MediaItem[] = mediaIds.map(
          (id: string, index: number) => ({
            id,
            url: `/api/media/${id}`,
            alt: `Hình ảnh ${plant?.name || "cây dược liệu"} ${index + 1}`,
          })
        );

        if (items.length === 0 && plant?.images?.length) {
          createFallbackMediaItems();
        } else {
          safeSetState(() => setMediaItems(items));
        }
      } else {
        throw new Error(result.message || "Không thể tải danh sách hình ảnh");
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;

      if (timeoutId) clearTimeout(timeoutId);

      if (error.name === "AbortError") {
        console.log("Media fetch aborted");
        return;
      }

      console.error("fetchMediaIds error:", error);

      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải danh sách hình ảnh",
        variant: "destructive",
      });

      // Fallback to plant.images on error if available
      createFallbackMediaItems();
    } finally {
      cleanupAbortController(controller);
      safeSetState(() => setIsMediaLoading(false));
    }
  }, [
    plantId,
    plant,
    createAbortController,
    cleanupAbortController,
    safeSetState,
  ]);

  // Helper function to create fallback media items
  const createFallbackMediaItems = () => {
    if (plant?.images?.length) {
      const fallbackItems: MediaItem[] = plant.images.map((url, index) => ({
        id: `fallback-${index}`,
        url,
        alt: `Hình ảnh ${plant?.name || "cây dược liệu"} ${index + 1}`,
      }));
      setMediaItems(fallbackItems);
    }
  };

  // Fetch related plants
  const fetchRelatedPlants = async () => {
    if (!plant?.familyId) {
      safeSetState(() => {
        setRelatedPlants([]);
        setIsRelatedPlantsLoading(false);
      });
      return;
    }

    const controller = createAbortController();

    safeSetState(() => {
      setIsRelatedPlantsLoading(true);
      setRelatedPlantsError(null);
    });

    try {
      const queryParams = new URLSearchParams({
        pageIndex: "1",
        pageSize: "4",
        // [`filters[familyId]`]: plant.familyId.toString(),
        "filters[familyId]": plant.familyId.toString(),
        excludeId: plant.id.toString(),
        // sortField: "views",
        // sortDirection: "desc",
      });

      console.log("Generated URL: ", queryParams.toString());

      const response = await fetchApi<HerbResponse<Plant[]>>(
        `/api/plants/search?${queryParams}`,
        { signal: controller.signal }
      );

      if (!isMountedRef.current) return; // Kiểm tra component còn mounted không

      if (response.code == 200 || response.success) {
        safeSetState(() => setRelatedPlants(response.data?.content));
        console.log(relatedPlants)
      } else {
        throw new Error(response.message || "Không thể tải cây liên quan");
      }
    } catch (error: any) {
      if (!isMountedRef.current) return;

      if (error.name === "AbortError") {
        console.log("Related plants fetch aborted");
        return;
      }

      const errorMessage = error.message || "Không thể tải cây liên quan";

      safeSetState(() => setRelatedPlantsError(errorMessage));

      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      cleanupAbortController(controller);
      safeSetState(() => setIsRelatedPlantsLoading(false));
    }
  };

  const handleDeletePlant = async () => {
    if (!confirm("Bạn có chắc chắn muốn xóa cây dược liệu này?")) {
      return;
    }

    try {
      const result = await fetchApi(`/api/plants/${plantId}`, {
        method: "DELETE",
      });

      if (result.code == 200) {
        toast({
          title: "Thành công",
          description: "Đã xóa cây dược liệu thành công!",
        });
        // Redirect to plants page
        window.location.href = "/plants";
      } else {
        throw new Error(result.message || "Không thể xóa cây dược liệu");
      }
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Không thể xóa cây dược liệu",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchPlantDetails();
  }, [plantId]);

  useEffect(() => {
    if (plant) {
      fetchMediaIds();
      fetchRelatedPlants();
    }
  }, [plant, plantId]);

  if (isPlantLoading) {
    return <Spinner></Spinner>;
  }

  // Error state
  if (error || !plant) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex justify-center">
        <div className="text-center py-12 text-red-600">
          {error || "Không thể tải thông tin cây dược liệu"}
          <div className="mt-4">
            <Link href="/plants">
              <Button variant="outline">Quay lại danh sách</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <BackButton href="/plants"></BackButton>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{plant.name}</h1>
              <p className="mt-2 text-gray-600">{plant.scientificName}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={handleWait}>
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Chia sẻ</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handleWait}>
                <Printer className="h-4 w-4" />
                <span className="sr-only">In</span>
              </Button>
              <Button variant="outline" size="icon" onClick={handleWait}>
                <Download className="h-4 w-4" />
                <span className="sr-only">Tải xuống</span>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-1">
              {isMediaLoading ? (
                <div className="h-full w-full animate-pulse bg-gray-200 rounded-lg"></div>
              ) : mediaItems.length > 0 ? (
                <MediaCarousel mediaItems={mediaItems} />
              ) : (
                <div className="h-full flex items-center justify-center text-gray-500">
                  Không có hình ảnh nào.
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                    Thông tin chung
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <p>
                      <span className="font-medium">Tên Tiếng Việt:</span>{" "}
                      {plant.name}
                    </p>
                    <p>
                      <span className="font-medium">Tên khoa học:</span>{" "}
                      {plant.scientificName}
                    </p>
                    <p>
                      <span className="font-medium">Họ:</span> {plant.family}
                    </p>
                    {plant.genus && (
                      <p>
                        <span className="font-medium">Chi:</span> {plant.genus}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Tên khác:</span>{" "}
                      {plant.otherNames}
                    </p>
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Leaf className="h-5 w-5 mr-2 text-green-600" />
                    Đặc điểm thực vật
                  </h2>
                  <p className="text-gray-700">
                    {plant.botanicalCharacteristics}
                  </p>
                  {plant.stemDescription && (
                    <p className="text-gray-700">
                      <strong>Thân:</strong> {plant.stemDescription}
                    </p>
                  )}
                  {plant.leafDescription && (
                    <p className="text-gray-700">
                      <strong>Lá:</strong> {plant.leafDescription}
                    </p>
                  )}
                  {plant.flowerDescription && (
                    <p className="text-gray-700">
                      <strong>Hoa:</strong> {plant.flowerDescription}
                    </p>
                  )}
                  {plant.fruitDescription && (
                    <p className="text-gray-700">
                      <strong>Quả:</strong> {plant.fruitDescription}
                    </p>
                  )}
                  {plant.rootDescription && (
                    <p className="text-gray-700">
                      <strong>Rễ:</strong> {plant.rootDescription}
                    </p>
                  )}
                  <p className="text-gray-700">
                    <strong>Bộ phận dùng:</strong> {plant.partsUsed}
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Flask className="h-5 w-5 mr-2 text-green-600" />
                    Hoạt chất chính
                  </h2>
                  <p className="text-gray-700">{plant.activeCompound}</p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Map className="h-5 w-5 mr-2 text-green-600" />
                    Phân bố và sinh thái
                  </h2>
                  <p className="text-gray-700">{plant.ecology}</p>
                  <p>
                    <span className="font-medium">Vùng phân bố:</span>{" "}
                    {plant.distribution}
                  </p>
                  <p>
                    <span className="font-medium">Độ cao:</span>{" "}
                    {plant.altitude}
                  </p>
                  <p>
                    <span className="font-medium">Mùa thu hoạch:</span>{" "}
                    {plant.harvestSeason}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="cong-dung" className="mt-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
              <TabsTrigger value="cong-dung">Công dụng</TabsTrigger>
              <TabsTrigger value="cach-dung">Cách dùng</TabsTrigger>
              <TabsTrigger value="nghien-cuu">Nghiên cứu</TabsTrigger>
              <TabsTrigger value="bai-viet">Bài viết liên quan</TabsTrigger>
              <TabsTrigger value="nguon">Nguồn tham khảo</TabsTrigger>
            </TabsList>

            <TabsContent value="cong-dung" className="space-y-4">
              <h3 className="text-lg font-semibold">Công dụng y học</h3>
              <p className="text-gray-700">{plant.medicinalUses}</p>

              <h3 className="text-lg font-semibold mt-6">Chỉ định</h3>
              <p className="text-gray-700">{plant.indications}</p>

              <h3 className="text-lg font-semibold mt-6">Chống chỉ định</h3>
              <p className="text-gray-700">{plant.contraindications}</p>

              <h3 className="text-lg font-semibold mt-6">Tác dụng phụ</h3>
              <p className="text-gray-700">{plant.sideEffects}</p>
            </TabsContent>

            <TabsContent value="cach-dung" className="space-y-4">
              <h3 className="text-lg font-semibold">Liều dùng và cách dùng</h3>
              <p className="text-gray-700">{plant.dosage}</p>

              <h3 className="text-lg font-semibold mt-6">Bài thuốc dân gian</h3>
              <p className="text-gray-700">{plant.folkRemedies}</p>
            </TabsContent>

            <TabsContent value="nghien-cuu" className="space-y-4">
              <h3 className="text-lg font-semibold">Các nghiên cứu khoa học</h3>
              <p className="text-gray-700">
                Hiện chưa có nghiên cứu khoa học cụ thể được cung cấp trong dữ
                liệu. Vui lòng kiểm tra lại hoặc liên hệ quản trị viên.
              </p>
              <div className="mt-6 text-center">
                <Link href={`/research?plant=${plantId}`}>
                  <Button variant="outline">Xem thêm nghiên cứu</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="bai-viet" className="space-y-4">
              <h3 className="text-lg font-semibold">Bài viết liên quan</h3>
              <p className="text-gray-700">
                Hiện chưa có bài viết liên quan được cung cấp trong dữ liệu. Vui
                lòng kiểm tra lại hoặc liên hệ quản trị viên.
              </p>
              <div className="mt-6 text-center">
                <Link href={`/articles?plant=${plantId}`}>
                  <Button variant="outline">Xem thêm bài viết</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="nguon" className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center">
                <BookIcon className="h-5 w-5 mr-2 text-green-600" />
                Nguồn thông tin tham khảo
              </h3>
              {plant.dataSourceId ? (
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="border-l-4 border-green-500 pl-4">
                    <p className="text-gray-700 leading-relaxed">
                      <span className="font-medium">{plant.sourceAuthor}</span>{" "}
                      ({plant.sourcePublicationYear}).{" "}
                      <em>{plant.sourceName}</em>. {plant.sourcePublisher}.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <BookIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Chưa có nguồn thông tin tham khảo được cung cấp.
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    Vui lòng liên hệ quản trị viên để bổ sung thông tin.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <div className="relative flex items-center justify-center my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-px bg-gradient-to-r from-transparent via-green-500 to-transparent"></div>
            </div>
            <div className="relative bg-white px-4">
              <div className="flex items-center justify-center w-8 h-8 bg-green-500 rounded-full">
                <Leaf className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              Một số cây dược liệu cùng họ
            </h2>
            {isRelatedPlantsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
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
            ) : relatedPlantsError ? (
              <div className="text-center py-12 text-red-600">
                {relatedPlantsError}
              </div>
            ) : relatedPlants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedPlants.map((relatedPlant) => (
                  <Card key={relatedPlant.id} className="overflow-hidden">
                    <div className="h-48 bg-green-50 relative overflow-hidden">
                      {relatedPlant.featuredMediaId &&
                      relatedPlant.featuredMediaId > 0 ? (
                        <MediaViewer
                          mediaId={relatedPlant.featuredMediaId}
                          className="w-full h-full object-cover"
                          width="100%"
                          height="100%"
                          alt={relatedPlant.name}
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
                      <CardTitle className="text-lg">
                        {relatedPlant.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-gray-500">
                        Họ: {relatedPlant.family || "Không có thông tin"}
                      </p>
                      <p className="text-sm text-gray-500">
                        Bộ phận dùng:{" "}
                        {relatedPlant.partsUsed || "Không có thông tin"}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link
                        href={`/plants/${relatedPlant.id}`}
                        className="w-full"
                      >
                        <Button variant="outline" className="w-full">
                          Xem chi tiết
                        </Button>
                      </Link>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                Không tìm thấy cây dược liệu nào cùng họ.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
