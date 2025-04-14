import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, X, Plus, Trash2, Upload } from "lucide-react";
import { Plant, PlantStatus } from "@/app/types/plant";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import loading from "@/app/loading";

interface PlantFormProps {
  plant: Plant;
  isLoading: boolean;
  onSubmit: (plant: Plant, publish?: boolean) => void;
  onCancel?: () => void;
  mode: "create" | "edit";
}

export default function PlantForm({
  plant,
  isLoading,
  onSubmit,
  onCancel,
  mode,
}: PlantFormProps) {
  const [formData, setFormData] = useState<Plant>(plant);
  const [images, setImages] = useState<string[]>(plant.images || []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSelectChange = (
    field: string,
    value: string | number | boolean
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddImage = () => {
    const newImages = [
      ...images,
      `/placeholder.svg?height=200&width=200&text=Ảnh+${images.length + 1}`,
    ];
    setImages(newImages);
    setFormData({ ...formData, images: newImages });
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    setFormData({ ...formData, images: newImages });
  };

  const handleSaveDraft = () => {
    onSubmit({ ...formData, status: PlantStatus.DRAFT });
  };

  const handleSaveAndPublish = () => {
    onSubmit({ ...formData, status: PlantStatus.PUBLISHED }, true);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "create"
              ? "Thêm cây dược liệu mới"
              : `Chỉnh sửa: ${formData.name}`}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {mode === "create"
              ? "Nhập thông tin chi tiết về cây dược liệu"
              : "Cập nhật thông tin cây dược liệu"}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          {mode === "create" && (
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isLoading}
            >
              {isLoading ? "Đang lưu..." : "Lưu nháp"}
            </Button>
          )}
          <Button
            className="flex items-center gap-1"
            onClick={handleSaveAndPublish}
            disabled={isLoading}
          >
            <Save className="h-4 w-4" />
            {isLoading
              ? "Đang lưu..."
              : mode === "create"
              ? "Lưu và xuất bản"
              : "Lưu thay đổi"}
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

        {/* Basic Information */}
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
                  {/* Form fields for basic info */}
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
                  {/* ... */}
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
                  {/* Classification and status fields */}
                  <div className="space-y-2">
                    <Label htmlFor="category">Danh mục</Label>
                    <Select onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn danh mục" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="thao-duoc">Thảo dược</SelectItem>
                        <SelectItem value="cay-thuoc">Cây thuốc</SelectItem>
                        <SelectItem value="nam">Nấm dược liệu</SelectItem>
                        <SelectItem value="hoa">Hoa dược liệu</SelectItem>
                        <SelectItem value="re">Rễ dược liệu</SelectItem>
                        <SelectItem value="qua">Quả dược liệu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select onValueChange={(value) => handleSelectChange("status", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="published">Xuất bản</SelectItem>
                        <SelectItem value="draft">Bản nháp</SelectItem>
                        <SelectItem value="pending">Chờ duyệt</SelectItem>
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
                  {/* ... */}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Other tabs */}
        <TabsContent value="botanical-info">
          <Card>
            <CardHeader>
              <CardTitle>Đặc điểm thực vật</CardTitle>
              <CardDescription>Mô tả chi tiết về đặc điểm thực vật học của cây dược liệu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="botanicalCharacteristics">Đặc điểm thực vật</Label>
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
                  <Label htmlFor="chemicalComposition">Thành phần hóa học</Label>
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
              <CardDescription>Thông tin về công dụng y học và cách sử dụng</CardDescription>
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
          <Card>
            <CardHeader>
              <CardTitle>Hình ảnh & Tài liệu</CardTitle>
              <CardDescription>Thêm hình ảnh và tài liệu liên quan đến cây dược liệu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Hình ảnh cây dược liệu</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={handleAddImage}
                  >
                    <Plus className="h-4 w-4" />
                    Thêm ảnh
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <div className="aspect-square bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Ảnh ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  ))}

                  <div
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={handleAddImage}
                  >
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500 text-center">Tải lên hình ảnh</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Tài liệu đính kèm</Label>

                <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-700">Kéo thả tài liệu vào đây</p>
                  <p className="text-xs text-gray-500 mt-1">Hoặc</p>
                  <Button type="button" variant="outline" size="sm" className="mt-2">
                    Chọn tài liệu
                  </Button>
                  <p className="text-xs text-gray-500 mt-2">PDF, DOC, DOCX, XLS, XLSX (Tối đa 10MB)</p>
                </div>

                <div className="space-y-2 mt-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 text-blue-600"
                        >
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Tài liệu nghiên cứu.pdf</p>
                        <p className="text-xs text-gray-500">1.2 MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Hủy</Button>
              <Button onClick={handleSaveAndPublish} disabled={isLoading}>
                {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        {/* ... */}
      </Tabs>
    </div>
  );
}
