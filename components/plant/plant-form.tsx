"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";
import { type Plant, PlantStatus } from "@/app/types/plant";
import { linkMediaToPlant } from "@/services/plant-media-service";
import { useRouter } from "next/navigation";
import { PlantMediaContainer } from "./plant-media-container";
import { DiseasesResponse } from "@/app/types/diseases";
import { fetchApi } from "@/lib/api-client";
import { HerbResponse, Page } from "@/types/api";
import { DiseaseSelector } from "../diseases/diseases-selector";
import { PLANT_STATUS_OPTIONS } from "@/constants/plant";
import { toast } from "@/hooks/use-toast";
import { CustomActionButton } from "../CustomActionButton";
import { Family } from "@/app/types/families";
import { Genera } from "@/app/types/genera";
import { GenericSelector } from "../GenericSelector";
import { ActiveCompoundResponse } from "@/app/types/activeCompound";

interface PlantFormProps {
  plant: Plant;
  isLoading: boolean;
  onSubmit: (plant: Plant, publish?: boolean) => Promise<HerbResponse>;
  mode: "create" | "edit";
  onChange?: (formData: Plant) => void;
}

export default function PlantForm({
  plant,
  isLoading,
  onSubmit,
  mode,
  onChange,
}: PlantFormProps) {
  const [formData, setFormData] = useState<Plant>(plant);
  const [diseases, setDiseases] = useState<DiseasesResponse[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [genera, setGenera] = useState<Genera[]>([]);
  const [activeCompounds, setActiveCompounds] = useState<
    ActiveCompoundResponse[]
  >([]);
  const [isLoadingDiseases, setIsLoadingDiseases] = useState(false);
  const [isLoadingFamilies, setIsLoadingFamilies] = useState(false);
  const [isLoadingGenera, setIsLoadingGenera] = useState(false);
  const [isLoadingActiveCompounds, setIsLoadingActiveCompounds] =
    useState(false);
  const router = useRouter();

  useEffect(() => {
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

    const fetchFamilies = async () => {
      setIsLoadingFamilies(true);
      try {
        const result = await fetchApi<Page<Family>>(
          "/api/families/search?sortField=name&sortDirection=asc"
        );
        setFamilies(result.data?.content || []);
      } catch (error: any) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải danh sách họ thực vật",
          variant: "destructive",
        });
      } finally {
        setIsLoadingFamilies(false);
      }
    };

    const fetchGenera = async () => {
      setIsLoadingGenera(true);
      try {
        const result = await fetchApi<Page<Genera>>(
          "/api/genera/search?sortField=name&sortDirection=asc"
        );
        setGenera(result.data?.content || []);
      } catch (error: any) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải danh sách chi thực vật",
          variant: "destructive",
        });
      } finally {
        setIsLoadingGenera(false);
      }
    };

    const fetchActiveCompounds = async () => {
      setIsLoadingActiveCompounds(true);
      try {
        const result = await fetchApi<Page<ActiveCompoundResponse>>(
          "/api/active-compound/search?sortField=name&sortDirection=asc"
        );
        setActiveCompounds(result.data?.content || []);
      } catch (error: any) {
        toast({
          title: "Lỗi",
          description: error.message || "Không thể tải danh sách hoạt chất",
          variant: "destructive",
        });
      } finally {
        setIsLoadingActiveCompounds(false);
      }
    };

    fetchDiseases();
    fetchFamilies();
    fetchGenera();
    fetchActiveCompounds();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSelectChange = (field: string, value: string) => {
    if (field === "status") {
      setFormData({ ...formData, [field]: Number.parseInt(value) });
    } else if (field === "featured") {
      setFormData({ ...formData, [field]: value === "true" });
    } else if (field === "diseaseId") {
      setFormData({
        ...formData,
        [field]: value === "all" || !value ? undefined : Number.parseInt(value),
      });
    } else if (field === "familyId") {
      setFormData({
        ...formData,
        [field]: value === "all" || !value ? undefined : Number.parseInt(value),
      });
    } else if (field === "generaId") {
      setFormData({
        ...formData,
        [field]: value === "all" || !value ? undefined : Number.parseInt(value),
      });
    } else if (field === "activeCompoundId") {
      setFormData({
        ...formData,
        [field]: value === "all" || !value ? undefined : Number.parseInt(value),
      });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleMediaChange = (mediaIds: number[]) => {
    setFormData({ ...formData, images: mediaIds.map((id) => id.toString()) });
  };

  const handleSave = async () => {
    const result = await onSubmit(
      { ...formData, status: PlantStatus.PUBLISHED },
      true
    );

    if (result.success && result.code === 200) {
      // Nếu có mediaIds và plant đã được tạo thành công, liên kết media với plant
      if (formData.images && formData.images.length > 0 && result.data?.id) {
        try {
          await linkMediaToPlant(result.data.id, formData.images.map(Number));
        } catch (error) {
          console.error("Error linking media to plant:", error);
          toast({
          title: "Cảnh báo",
          description: "Cây dược liệu đã được lưu nhưng có lỗi khi liên kết hình ảnh",
          variant: "destructive",
        });
        return;
        }
      }

      toast({
        title: "Thành công",
        description: result.message || "Thêm thành công",
      });
      router.push("/admin/plants");
    } else {
      toast({
        title: "Lỗi",
        description:
          result?.message ||
          "Lưu không thành công, vui lòng thử lại",
        variant: "destructive",
      });
    }
  };

  const pageTitle =
    mode === "create" ? "Thêm cây dược liệu mới" : `Chỉnh sửa: ${plant.name}`;
  const pageDescription =
    mode === "create"
      ? "Nhập thông tin chi tiết về cây dược liệu"
      : "Cập nhật thông tin cây dược liệu";

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 px-4 sm:px-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="mt-1 text-sm text-gray-500">{pageDescription}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <CustomActionButton
            onClick={handleSave}
            text={isLoading ? "Đang lưu..." : "Lưu"}
            icon={<Save className="h-4 w-4" />}
            variant="add"
          />
        </div>
      </div>

      <Tabs defaultValue="basic-info" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="basic-info">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="botanical-info">Đặc điểm thực vật</TabsTrigger>
          <TabsTrigger value="usage-info">Công dụng & Cách dùng</TabsTrigger>
          <TabsTrigger value="media">Hình ảnh & Tài liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                  <CardDescription>
                    Nhập các thông tin cơ bản về cây dược liệu
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tên cây dược liệu</Label>
                      <Input
                        id="name"
                        placeholder="Nhập tên cây dược liệu"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="scientificName">Tên khoa học</Label>
                      <Input
                        id="scientificName"
                        placeholder="Nhập tên khoa học"
                        value={formData.scientificName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="family">Họ</Label>
                      {isLoadingFamilies ? (
                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <GenericSelector
                          value={formData.familyId?.toString() || "all"}
                          onValueChange={(value) =>
                            handleSelectChange("familyId", value)
                          }
                          items={families}
                          isLoading={isLoadingFamilies}
                          isSearching={false}
                          searchPlaceholder="Tìm kiếm họ thực vật..."
                          allOption={{
                            value: "all",
                            label: "Tất cả họ thực vật",
                          }}
                          noResultsText="Không tìm thấy họ thực vật"
                          noDataText="Chưa có dữ liệu họ thực vật"
                          loadingText="Đang tải danh sách họ thực vật..."
                        />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="genus">Chi</Label>
                      {isLoadingGenera ? (
                        <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                      ) : (
                        <GenericSelector
                          value={formData.generaId?.toString() || "all"}
                          onValueChange={(value) =>
                            handleSelectChange("generaId", value)
                          }
                          items={genera}
                          isLoading={isLoadingGenera}
                          isSearching={false}
                          searchPlaceholder="Tìm kiếm chi thực vật..."
                          allOption={{
                            value: "all",
                            label: "Tất cả chi thực vật",
                          }}
                          noResultsText="Không tìm thấy chi thực vật"
                          noDataText="Chưa có dữ liệu chi thực vật"
                          loadingText="Đang tải danh sách chi thực vật..."
                        />
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="otherNames">Tên khác</Label>
                      <Input
                        id="otherNames"
                        placeholder="Các tên gọi khác (cách nhau bởi dấu phẩy)"
                        value={formData.otherNames}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="partsUsed">Bộ phận dùng</Label>
                      <Input
                        id="partsUsed"
                        placeholder="Các bộ phận dùng (cách nhau bởi dấu phẩy)"
                        value={formData.partsUsed}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả chung</Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả chung về cây dược liệu"
                      rows={4}
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Phân loại & Trạng thái</CardTitle>
                  <CardDescription>
                    Thiết lập phân loại và trạng thái xuất bản
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="diseaseId">Công dụng chữa bệnh</Label>
                    {isLoadingDiseases ? (
                      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <DiseaseSelector
                        value={formData.diseaseId || "all"}
                        onValueChange={(value) =>
                          handleSelectChange("diseaseId", value)
                        }
                        diseases={diseases}
                        isLoading={isLoadingDiseases}
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="status"
                      className="text-sm font-semibold text-gray-700"
                    >
                      Trạng thái
                    </Label>
                    <Select
                      value={formData.status.toString()}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                    >
                      <SelectTrigger className="border-green-500 focus:ring-2 focus:ring-green-500">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-green-500">
                        {PLANT_STATUS_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value.toString()}
                            className="hover:bg-green-50 focus:bg-green-50"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="botanical-info">
          <Card>
            <CardHeader>
              <CardTitle>Đặc điểm thực vật</CardTitle>
              <CardDescription>
                Mô tả chi tiết về đặc điểm thực vật học của cây dược liệu
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="botanicalCharacteristics">
                  Đặc điểm thực vật
                </Label>
                <Textarea
                  id="botanicalCharacteristics"
                  placeholder="Mô tả chi tiết về đặc điểm thực vật học"
                  rows={6}
                  value={formData.botanicalCharacteristics}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stemDescription">Thân</Label>
                  <Textarea
                    id="stemDescription"
                    placeholder="Mô tả về thân cây"
                    rows={3}
                    value={formData.stemDescription}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leafDescription">Lá</Label>
                  <Textarea
                    id="leafDescription"
                    placeholder="Mô tả về lá cây"
                    rows={3}
                    value={formData.leafDescription}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flowerDescription">Hoa</Label>
                  <Textarea
                    id="flowerDescription"
                    placeholder="Mô tả về hoa"
                    rows={3}
                    value={formData.flowerDescription}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fruitDescription">Quả/Hạt</Label>
                  <Textarea
                    id="fruitDescription"
                    placeholder="Mô tả về quả/hạt"
                    rows={3}
                    value={formData.fruitDescription}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="rootDescription">Rễ</Label>
                  <Textarea
                    id="rootDescription"
                    placeholder="Mô tả về rễ cây"
                    rows={3}
                    value={formData.rootDescription}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="activeCompoundId">Hoạt chất chính</Label>
                  {isLoadingActiveCompounds ? (
                    <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                  ) : (
                    <GenericSelector
                      value={formData.activeCompoundId?.toString() || "all"}
                      onValueChange={(value) =>
                        handleSelectChange("activeCompoundId", value)
                      }
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="ecology">Sinh thái học</Label>
                <Textarea
                  id="ecology"
                  placeholder="Mô tả về đặc điểm sinh thái và môi trường sống"
                  rows={4}
                  value={formData.ecology}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage-info">
          <Card>
            <CardHeader>
              <CardTitle>Công dụng & Cách dùng</CardTitle>
              <CardDescription>
                Thông tin về công dụng y học và cách sử dụng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="medicinalUses">Công dụng y học</Label>
                <Textarea
                  id="medicinalUses"
                  placeholder="Mô tả chi tiết về công dụng y học"
                  rows={6}
                  value={formData.medicinalUses}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="indications">Chỉ định</Label>
                <Textarea
                  id="indications"
                  placeholder="Các trường hợp được chỉ định sử dụng"
                  rows={4}
                  value={formData.indications}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contraindications">Chống chỉ định</Label>
                <Textarea
                  id="contraindications"
                  placeholder="Các trường hợp chống chỉ định"
                  rows={4}
                  value={formData.contraindications}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dosage">Liều dùng và cách dùng</Label>
                <Textarea
                  id="dosage"
                  placeholder="Hướng dẫn về liều dùng và cách sử dụng"
                  rows={4}
                  value={formData.dosage}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="folkRemedies">Bài thuốc dân gian</Label>
                <Textarea
                  id="folkRemedies"
                  placeholder="Các bài thuốc dân gian sử dụng cây này"
                  rows={6}
                  value={formData.folkRemedies}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sideEffects">Tác dụng phụ</Label>
                <Textarea
                  id="sideEffects"
                  placeholder="Các tác dụng phụ có thể gặp phải"
                  rows={4}
                  value={formData.sideEffects}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <PlantMediaContainer plantId={formData.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
