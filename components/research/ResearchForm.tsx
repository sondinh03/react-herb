"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { Research, ResearchStatus } from "@/app/types/research";
import { FileText, Loader2, Save, Upload, Eye, X, Trash2 } from "lucide-react";
import { fetchApi } from "@/lib/api-client";
import { HerbResponse } from "@/types/api";
import { CustomActionButton } from "../CustomActionButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import dynamic from "next/dynamic";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { handleWait } from "../header";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const PDFViewer = dynamic(() => import("@/components/media/PDFViewer"), {
  ssr: false, // Tắt SSR để tránh lỗi DOMMatrix
});

interface ResearchFormProps {
  research: Research;
  isLoading: boolean;
  onSubmit: (research: Research) => Promise<HerbResponse>;
  mode: "create" | "edit";
  onChange?: (formData: Research) => void;
}

const RESEARCH_STATUS_OPTIONS = [
  { value: ResearchStatus.DRAFT, label: "Nháp" },
  { value: ResearchStatus.PUBLISHED, label: "Đã xuất bản" },
  { value: ResearchStatus.ARCHIVED, label: "Lưu trữ" },
];

export default function ResearchForm({
  research,
  isLoading,
  onSubmit,
  mode,
  onChange,
}: ResearchFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Research>(research);
  const [file, setFile] = useState<File | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingMedia, setIsDeletingMedia] = useState(false);

  useEffect(() => {
    onChange?.(formData);
  }, [formData, onChange]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value ? parseFloat(value) : undefined,
    });
  };

  const handleSelectChange = (field: string, value: string) => {
    if (field === "status") {
      setFormData({ ...formData, [field]: Number.parseInt(value) });
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
    } else {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn một tệp PDF hợp lệ",
        variant: "destructive",
      });
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file PDF trước khi tải lên",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingFile(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const token = localStorage.getItem("accessToken");

      const response = await fetchApi<{ mediaId: number; mediaUrl: string }>(
        "/api/media/upload",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: uploadFormData,
        }
      );

      if (response.code === 200 && response.data) {
        setFormData({
          ...formData,
          mediaId: response.data.id,
          mediaUrl: response.data.urlFile,
        });

        toast({
          title: "Thành công",
          description: "Tải lên file PDF thành công",
        });
      } else {
        throw new Error(response.message || "Tải lên file thất bại");
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải lên file PDF",
        variant: "destructive",
      });
    } finally {
      setIsUploadingFile(false);
    }
  };

  const handleShowPDFPreview = () => {
    setShowPDFPreview(true);
  };

  const handleClosePDFPreview = () => {
    setShowPDFPreview(false);
  };

  const handleDeleteMedia = async () => {
    if (!formData.mediaId) return;

    setIsDeletingMedia(true);
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetchApi<any>(`/api/media/${formData.mediaId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.success || response.code === 200) {
        setFormData({
          ...formData,
          mediaId: undefined,
          mediaUrl: "",
        });

        toast({
          title: "Xóa thành công",
          description: "Đã xóa file PDF thành công",
        });
      } else {
        throw new Error(response.message || "Không thể xóa file PDF");
      }
    } catch (error: any) {
      console.error("Error deleting media:", error);
      toast({
        title: "Lỗi xóa",
        description: error.message || "Không thể xóa file PDF",
        variant: "destructive",
      });
    } finally {
      setIsDeletingMedia(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleShowDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.title || !formData.content) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ các trường bắt buộc",
        variant: "destructive",
      });
      return;
    }

    // Validate slug format
    // if (!/^[a-z0-9-]+$/.test(formData.slug)) {
    //   toast({
    //     title: "Lỗi",
    //     description: "Slug chỉ được chứa chữ thường, số và dấu gạch ngang",
    //     variant: "destructive",
    //   });
    //   return;
    // }

    // Check if PDF is required for new research
    if (mode === "create" && !formData.mediaId) {
      toast({
        title: "Lỗi",
        description: "Vui lòng tải lên file PDF trước khi lưu",
        variant: "destructive",
      });
      return;
    }

    const result = await onSubmit({
      ...formData,
      status: ResearchStatus.PUBLISHED,
    });

    if (result.success && result.code === 200) {
      toast({
        title: "Thành công",
        description:
          result.message ||
          `${mode === "create" ? "Thêm" : "Cập nhật"} nghiên cứu thành công`,
      });
      router.push("/admin/research");
    } else {
      toast({
        title: "Lỗi",
        description:
          result?.message ||
          `${
            mode === "create" ? "Thêm" : "Cập nhật"
          } nghiên cứu không thành công`,
        variant: "destructive",
      });
    }
  };

  const pageTitle =
    mode === "create" ? "Thêm nghiên cứu mới" : `Chỉnh sửa: ${research.title}`;
  const pageDescription =
    mode === "create"
      ? "Nhập thông tin chi tiết về nghiên cứu khoa học"
      : "Cập nhật thông tin nghiên cứu khoa học";

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

      {/* PDF Preview Section */}
      {showPDFPreview && formData.mediaUrl && (
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Xem trước PDF</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClosePDFPreview}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <PDFViewer
              pdfUrl={`${baseUrl}${formData.mediaUrl}`}
              // maxPreviewPages={undefined} // Show all pages for editing mode
              isPaid={true} // Always show full content in edit mode
              className="mb-8"
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="basic-info" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="basic-info">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="media">Tài liệu</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                  <CardDescription>
                    Nhập các thông tin cơ bản về nghiên cứu khoa học
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="space-y-4">
                      <Label htmlFor="title">Tiêu đề</Label>
                      <Input
                        id="title"
                        placeholder="Nhập tiêu đề nghiên cứu"
                        value={formData.title}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {/* <div className="space-y-2">
                      <Label htmlFor="slug">Slug</Label>
                      <Input
                        id="slug"
                        placeholder="Nhập slug (VD: nghien-cuu-ve-cay-duoc-lieu)"
                        value={formData.slug}
                        onChange={handleInputChange}
                        required
                      />
                    </div> */}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="authors">Tác giả</Label>
                      <Input
                        id="authors"
                        placeholder="Nhập tên tác giả"
                        value={formData.authors}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institution">Cơ quan</Label>
                      <Input
                        id="institution"
                        placeholder="Nhập tên cơ quan"
                        value={formData.institution}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="publishedYear">Năm xuất bản</Label>
                      <Input
                        id="publishedYear"
                        placeholder="Nhập năm xuất bản (VD: 2023)"
                        value={formData.publishedYear || ""}
                        onChange={handleNumberInputChange}
                        type="number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="journal">Tạp chí</Label>
                      <Input
                        id="journal"
                        placeholder="Nhập tên tạp chí"
                        value={formData.journal}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="abstract">Tóm tắt</Label>
                    <Textarea
                      id="abstract"
                      placeholder="Nhập tóm tắt nghiên cứu"
                      rows={4}
                      value={formData.abstract}
                      onChange={handleInputChange}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Trạng thái & Thông tin bổ sung</CardTitle>
                  <CardDescription>
                    Thiết lập trạng thái và các thông tin bổ sung
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Trạng thái</Label>
                    <Select
                      value={formData.status?.toString()}
                      onValueChange={(value) =>
                        handleSelectChange("status", value)
                      }
                    >
                      <SelectTrigger className="border-green-500 focus:ring-2 focus:ring-green-500">
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-green-500">
                        {RESEARCH_STATUS_OPTIONS.map((option) => (
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

                  <div className="space-y-2">
                    <Label htmlFor="downloadPrice">Phí tải xuống (VND)</Label>
                    <Input
                      id="downloadPrice"
                      placeholder="Nhập phí tải xuống (VD: 1000)"
                      value={formData.downloadPrice || ""}
                      onChange={handleNumberInputChange}
                      type="number"
                      step="1000"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="previewPages">Số trang xem trước</Label>
                    <Input
                      id="previewPages"
                      placeholder="Nhập số trang xem trước"
                      value={formData.previewPages || ""}
                      onChange={handleNumberInputChange}
                      type="number"
                      min="1"
                    />
                  </div>

                  {mode === "edit" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="views">Lượt xem</Label>
                        <Input
                          id="views"
                          value={formData.views || 0}
                          disabled
                          placeholder="Lượt xem"
                        />
                      </div>

                      {formData.createdBy && (
                        <div className="space-y-2">
                          <Label htmlFor="createdBy">Người tạo</Label>
                          <Input
                            id="createdBy"
                            value={formData.createdBy}
                            disabled
                            placeholder="Người tạo"
                          />
                        </div>
                      )}

                      {formData.createdAt && (
                        <div className="space-y-2">
                          <Label htmlFor="createdAt">Ngày tạo</Label>
                          <Input
                            id="createdAt"
                            value={new Date(formData.createdAt).toLocaleString(
                              "vi-VN"
                            )}
                            disabled
                            placeholder="Ngày tạo"
                          />
                        </div>
                      )}

                      {formData.updatedBy && (
                        <div className="space-y-2">
                          <Label htmlFor="updatedBy">Người cập nhật</Label>
                          <Input
                            id="updatedBy"
                            value={formData.updatedBy}
                            disabled
                            placeholder="Người cập nhật"
                          />
                        </div>
                      )}

                      {formData.updatedAt && (
                        <div className="space-y-2">
                          <Label htmlFor="updatedAt">Ngày cập nhật</Label>
                          <Input
                            id="updatedAt"
                            value={new Date(formData.updatedAt).toLocaleString(
                              "vi-VN"
                            )}
                            disabled
                            placeholder="Ngày cập nhật"
                          />
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung</CardTitle>
              <CardDescription>
                Mô tả chi tiết về nghiên cứu khoa học
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="content">Nội dung</Label>
                <Textarea
                  id="content"
                  placeholder="Nhập nội dung nghiên cứu (HTML hoặc văn bản)"
                  rows={10}
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media">
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu</CardTitle>
              <CardDescription>Tải lên tệp PDF của nghiên cứu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Tệp PDF</Label>
                <div className="flex gap-2">
                  <Input
                    id="file"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="flex-1"
                  />
                  <CustomActionButton
                    onClick={handleFileUpload}
                    text={isUploadingFile ? "Đang tải..." : "Tải lên"}
                    icon={
                      isUploadingFile ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )
                    }
                    variant="add"
                  />
                </div>

                {formData.mediaUrl && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            File đã tải lên thành công
                          </p>
                          <p className="text-xs text-green-600">
                            {formData.mediaUrl.split("/").pop()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <CustomActionButton
                          onClick={handleShowPDFPreview}
                          text="Xem trước"
                          icon={<Eye className="h-4 w-4" />}
                          variant="add"
                        />
                        <CustomActionButton
                          onClick={() =>
                            window.open(
                              `${basePath}${formData.mediaUrl}`,
                              "_blank"
                            )
                          }
                          text="Tải xuống"
                          icon={<FileText className="h-4 w-4" />}
                          variant="add"
                        />
                        <CustomActionButton
                          onClick={handleShowDeleteDialog}
                          text="Xóa"
                          icon={<Trash2 className="h-4 w-4" />}
                          variant="ghost"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {mode === "create" && !formData.mediaId && (
                  <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      <strong>Lưu ý:</strong> Bạn cần phải tải lên file PDF
                      trước khi có thể lưu nghiên cứu.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      {/* <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa file</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa file PDF này không? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingMedia}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteMedia}
              disabled={isDeletingMedia}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeletingMedia ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
}
