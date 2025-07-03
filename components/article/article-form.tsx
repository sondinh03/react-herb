"use client";

import { useCallback, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Upload,
  Bold,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Image,
  Code,
  X,
  Loader2,
} from "lucide-react";
import { Article } from "@/app/admin/articles/[id]/page";
import { Textarea } from "../ui/textarea";
import { PLANT_STATUS_OPTIONS } from "@/constants/plant";
import { toast } from "@/components/ui/use-toast"; // Giả định có toast component
import { uploadMedia } from "@/services/media-service";
import MediaViewer from "../media/media-viewer";

interface ArticleFormProps {
  article: Article;
  isLoading: boolean;
  onSubmit: (article: Article) => void;
  mode: "edit" | "create";
  onImageUpload?: (file: File) => Promise<string>; // Callback để xử lý upload ảnh
}

export default function ArticleForm({
  article,
  isLoading = false,
  onSubmit,
  mode,
  onImageUpload,
}: ArticleFormProps) {
  const [formData, setFormData] = useState<Article>(article);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    article.featuredImage || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    field: keyof Article,
    value: string | boolean | number | null
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenFileDialog = useCallback(() => {
    if (fileInputRef.current && !isUploadingImage) {
      fileInputRef.current.click();
    }
  }, [isUploadingImage]);

  const handleFileChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Lỗi",
          description: "Chỉ hỗ trợ file ảnh định dạng JPG, PNG, WEBP",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast({
          title: "Lỗi",
          description: "Kích thước file không được vượt quá 5MB",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsUploadingImage(true);

        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        const formDataToSend = new FormData();
        formDataToSend.append("file", file);
        formDataToSend.append(
          "altText",
          `Hình ảnh cho bài viết ${formData.id || "mới"}`
        );
        if (formData.id) {
          formDataToSend.append("articleId", formData.id);
        }
        if (formData.isFeatured != null) {
          formDataToSend.append("isFeatured", true);
        }

        const response = await fetch("/api/media/upload", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          body: formDataToSend,
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Không thể tải lên hình ảnh");
        }

        handleInputChange("featuredImage", data.data.id); // Save media ID
        setImagePreview(data.data.url || data.data.id); // Use URL if provided, otherwise fallback to ID

        toast({
          title: "Thành công",
          description: "Đã tải ảnh lên thành công",
        });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Lỗi",
          description: "Có lỗi xảy ra khi tải ảnh lên",
          variant: "destructive",
        });
        // Reset preview on error
        setImagePreview(formData.featuredImage || null);
      } finally {
        setIsUploadingImage(false);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [formData.id, formData.featuredImage]
  );

  const handleRemoveImage = useCallback(() => {
    setImagePreview(null);
    handleInputChange("featuredImage", null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSelectChange = (field: string, value: string) => {
    if (field === "status") {
      setFormData({ ...formData, [field]: Number.parseInt(value) });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleBooleanChange = (field: keyof Article, value: string) => {
    handleInputChange(field, value === "yes");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {mode === "edit"
                      ? "Nội dung bài viết"
                      : "Tạo nội dung bài viết"}
                  </CardTitle>
                  <CardDescription>
                    {mode === "edit" ? "Cập nhật" : "Nhập"} tiêu đề và nội dung
                    chi tiết của bài viết
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tiêu đề bài viết</Label>
                    <Input
                      id="title"
                      value={formData.title || ""}
                      onChange={(e) =>
                        handleInputChange("title", e.target.value)
                      }
                      placeholder="Nhập tiêu đề bài viết"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Tóm tắt</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt || ""}
                      onChange={(e) =>
                        handleInputChange("excerpt", e.target.value)
                      }
                      placeholder="Nhập tóm tắt ngắn gọn về bài viết"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Nội dung</Label>
                    <div className="border rounded-md">
                      <div className="flex items-center gap-1 p-2 border-b">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                        <div className="h-6 w-px bg-gray-200 mx-1"></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <List className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                        <div className="h-6 w-px bg-gray-200 mx-1"></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Image className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Code className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        id="content"
                        value={formData.content || ""}
                        onChange={(e) =>
                          handleInputChange("content", e.target.value)
                        }
                        placeholder="Nhập nội dung chi tiết của bài viết..."
                        rows={15}
                        className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ảnh bìa</CardTitle>
                    <CardDescription>
                      Cập nhật ảnh bìa cho bài viết
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-md overflow-hidden relative group">
                        {formData.featuredImage ? (
                          <>
                            <MediaViewer
                              mediaId={formData.featuredImage}
                              className="w-full h-full object-cover"
                              width="100%"
                              height="100%"
                              alt="Ảnh bìa"
                              showLoader={true}
                              priority={false}
                            />
                            {!isUploadingImage && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="icon"
                                  onClick={handleRemoveImage}
                                  className="h-8 w-8"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                            {isUploadingImage && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-white" />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <div className="text-center">
                              <Image className="h-12 w-12 mx-auto mb-2" />
                              <p className="text-sm">Chưa có ảnh bìa</p>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full flex items-center gap-2"
                        onClick={handleOpenFileDialog}
                        disabled={isLoading || isUploadingImage}
                      >
                        {isUploadingImage ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Đang tải lên...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            {imagePreview
                              ? "Thay đổi ảnh bìa"
                              : "Tải lên ảnh bìa"}
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-gray-500">
                        Hỗ trợ JPG, PNG, WEBP. Tối đa 5MB.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Xuất bản</CardTitle>
                    <CardDescription>
                      Cập nhật trạng thái và thời gian xuất bản
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt bài viết</CardTitle>
              <CardDescription>
                Cập nhật các tùy chọn hiển thị và tương tác
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="allowComments">Cho phép bình luận</Label>
                  <Select
                    value={formData.allowComments ? "yes" : "no"}
                    onValueChange={(value) =>
                      handleBooleanChange("allowComments", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tùy chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Có</SelectItem>
                      <SelectItem value="no">Không</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isFeatured">Bài viết nổi bật</Label>
                  <Select
                    value={formData.isFeatured ? "yes" : "no"}
                    onValueChange={(value) =>
                      handleBooleanChange("isFeatured", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tùy chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Có</SelectItem>
                      <SelectItem value="no">Không</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>Tối ưu hóa SEO</CardTitle>
              <CardDescription>
                Cập nhật thông tin SEO để tối ưu hiển thị trên công cụ tìm kiếm
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Tiêu đề SEO</Label>
                <Input
                  id="seoTitle"
                  value={formData.title || ""}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Nhập tiêu đề SEO"
                />
                <p className="text-xs text-gray-500">
                  Tiêu đề hiển thị trên kết quả tìm kiếm (tối đa 60 ký tự)
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {mode === "edit" ? "Lưu thay đổi" : "Tạo bài viết"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <div className="mt-6">
          <Button type="submit" disabled={isLoading}>
            {mode === "edit" ? "Lưu thay đổi" : "Tạo bài viết"}
          </Button>
        </div>
      </Tabs>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
      />
    </form>
  );
}
