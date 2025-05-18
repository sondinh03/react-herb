"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
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
import { PlantMediaTab } from "./plant-media-tab";
import { linkMediaToPlant } from "@/services/plant-media-service";
import { toast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { PlantMediaContainer } from "./plant-media-container";
import { DiseasesResponse } from "@/app/types/diseases";
import { fetchApi } from "@/lib/api-client";
import { Page } from "@/types/api";
import { DiseaseSelector } from "../diseases/diseases-selector";

interface PlantFormProps {
  plant: Plant;
  isLoading: boolean;
  onSubmit: (plant: Plant, publish?: boolean) => Promise<void>;
  mode: "create" | "edit";
}

export default function PlantForm({
  plant,
  isLoading,
  onSubmit,
  mode,
}: PlantFormProps) {
  const [formData, setFormData] = useState<Plant>(plant);
  const [diseases, setDiseases] = useState<DiseasesResponse[]>([]);
  const [isLoadingDiseases, setIsLoadingDiseases] = useState(false);
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

    fetchDiseases();
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
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleMediaChange = (mediaIds: number[]) => {
    setFormData({ ...formData, images: mediaIds.map((id) => id.toString()) });
  };

  const handleSaveDraft = async () => {
    await onSubmit({ ...formData, status: PlantStatus.DRAFT }, false);
  };

  const handleSaveAndPublish = async () => {
    const result = await onSubmit(
      { ...formData, status: PlantStatus.PUBLISHED },
      true
    );

    if (result.success && result.data && result.data.id) {
      // Nếu có mediaIds và plant đã được tạo thành công, liên kết media với plant
      if (formData.images && formData.images.length > 0) {
        try {
          await linkMediaToPlant(result.data.id, formData.images.map(Number));
        } catch (error) {
          console.error("Error linking media to plant:", error);
          // Không cần hiển thị lỗi này cho người dùng vì plant đã được tạo thành công
        }
      }

      // Tiếp tục xử lý sau khi lưu thành công
      toast({
        title: "Thành công",
        description: result.message,
      });
      router.push("/admin/plants");
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
          <p className="mt-1 text-sm text-gray-500">{pageDescription}</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isLoading}
          >
            {isLoading ? "Đang lưu..." : "Lưu nháp"}
          </Button>
          <Button
            className="flex items-center gap-1"
            onClick={handleSaveAndPublish}
            disabled={isLoading}
          >
            <Save className="h-4 w-4" />
            {isLoading ? "Đang lưu..." : "Lưu và xuất bản"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basic-info" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
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
                      <Input
                        id="family"
                        placeholder="Nhập họ thực vật"
                        value={formData.family}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="genus">Chi</Label>
                      <Input
                        id="genus"
                        placeholder="Nhập chi thực vật"
                        value={formData.genus}
                        onChange={handleInputChange}
                      />
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
                    <Label htmlFor="diseaseId">Loại bệnh</Label>
                    {isLoadingDiseases ? (
                      <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
                    ) : (
                      <DiseaseSelector
                        // value={formData.diseaseId?.toString() || "all"}
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
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select
                      value={formData.status.toString()}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={PlantStatus.PUBLISHED.toString()}>
                          Xuất bản
                        </SelectItem>
                        <SelectItem value={PlantStatus.DRAFT.toString()}>
                          Bản nháp
                        </SelectItem>
                        <SelectItem value={PlantStatus.PENDING.toString()}>
                          Chờ duyệt
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="distribution">Vùng phân bố</Label>
                    <Input
                      id="distribution"
                      placeholder="Nhập vùng phân bố"
                      value={formData.distribution}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="altitude">Độ cao</Label>
                    <Input
                      id="altitude"
                      placeholder="Nhập độ cao (m)"
                      value={formData.altitude}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="harvestSeason">Mùa thu hoạch</Label>
                    <Input
                      id="harvestSeason"
                      placeholder="Nhập mùa thu hoạch"
                      value={formData.harvestSeason}
                      onChange={handleInputChange}
                    />
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
                  <Label htmlFor="stem">Thân</Label>
                  <Textarea
                    id="stem"
                    placeholder="Mô tả về thân cây"
                    rows={3}
                    value={formData.stem}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaves">Lá</Label>
                  <Textarea
                    id="leaves"
                    placeholder="Mô tả về lá cây"
                    rows={3}
                    value={formData.leaves}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="flowers">Hoa</Label>
                  <Textarea
                    id="flowers"
                    placeholder="Mô tả về hoa"
                    rows={3}
                    value={formData.flowers}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fruits">Quả/Hạt</Label>
                  <Textarea
                    id="fruits"
                    placeholder="Mô tả về quả/hạt"
                    rows={3}
                    value={formData.fruits}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roots">Rễ</Label>
                  <Textarea
                    id="roots"
                    placeholder="Mô tả về rễ cây"
                    rows={3}
                    value={formData.roots}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chemicalComposition">
                    Thành phần hóa học
                  </Label>
                  <Textarea
                    id="chemicalComposition"
                    placeholder="Mô tả về thành phần hóa học"
                    rows={3}
                    value={formData.chemicalComposition}
                    onChange={handleInputChange}
                  />
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
          {/* 
          <PlantMediaTab
            mediaIds={formData.images?.map((id) => Number.parseInt(id)) || []}
            onMediaChange={handleMediaChange}
            plantId={mode === "edit" ? Number.parseInt(formData.id as string) : undefined}
            isLoading={isLoading}
          />
*/}
          <PlantMediaContainer plantId={formData.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
