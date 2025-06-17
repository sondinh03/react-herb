"use client";

import type React from "react";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  Plus,
  Loader2,
  FileText,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MediaViewer } from "@/components/media/media-viewer";
import { cn } from "@/lib/utils";
import { uploadMedia, deleteMedia } from "@/services/media-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface PlantMediaTabProps {
  mediaIds: number[];
  onMediaChange: (mediaIds: number[]) => void;
  plantId?: number;
  isLoading?: boolean;
}

export function PlantMediaTab({
  mediaIds = [],
  onMediaChange,
  plantId,
  isLoading = false,
}: PlantMediaTabProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<{
    id: number;
    index: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<
    { name: string; size: string; id?: number }[]
  >([]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Lấy danh sách file từ e.target.file
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);

      // Giả lập tiến trình upload
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Upload từng file một
      const newMediaIds = [...mediaIds];
      const successCount = { count: 0 };
      const errorCount = { count: 0 };

      // Sử dụng Promise.all để upload song song
      await Promise.all(
        Array.from(files).map(async (file) => {
          try {
            // Truyền plantId vào hàm uploadMedia
            const response = await uploadMedia(
              file,
              `Hình ảnh cây dược liệu ${plantId || "mới"}`,
              plantId // Truyền plantId vào đây
            );

            if (response.code == 200 && response.data) {
              newMediaIds.push(response.data.id);
              successCount.count++;
            } else {
              errorCount.count++;
              console.error(
                `Failed to upload ${file.name}: ${response.message}`
              );
            }
          } catch (error) {
            errorCount.count++;
            console.error(`Error uploading ${file.name}:`, error);
          }
        })
      );

      clearInterval(interval);
      setUploadProgress(100);

      console.log("Đã bắt đầu gọi onMediaChange")
      alert("Đã bắt đầu gọi onMediaChange");
      
      // Cập nhật danh sách media IDs
      onMediaChange(newMediaIds);
      console.log("Đã gọi onMediaChange")

      // Reset input sau khi upload thành công
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Hiển thị thông báo kết quả
      if (successCount.count > 0) {
        toast({
          title: "Tải lên thành công",
          description: `Đã tải lên ${successCount.count} hình ảnh thành công${
            errorCount.count > 0 ? `, ${errorCount.count} lỗi` : ""
          }`,
          variant: errorCount.count > 0 ? "default" : "success",
        });
      } else if (errorCount.count > 0) {
        toast({
          title: "Upload thất bại",
          description: `Không thể tải lên ${errorCount.count} hình ảnh`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Lỗi upload",
        description: error.message || "Không thể tải lên hình ảnh",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleDocumentChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      setUploadingImage(true);

      // Upload từng file một
      const newDocuments = [...documents];
      const successCount = { count: 0 };
      const errorCount = { count: 0 };

      // Sử dụng Promise.all để upload song song
      await Promise.all(
        Array.from(files).map(async (file) => {
          try {
            // Truyền plantId vào hàm uploadMedia
            const response = await uploadMedia(
              file,
              `Tài liệu cây dược liệu ${plantId || "mới"}`,
              plantId // Truyền plantId vào đây
            );

            if (response.success && response.data) {
              newDocuments.push({
                name: file.name,
                size: formatFileSize(file.size),
                id: response.data.id,
              });
              successCount.count++;
            } else {
              errorCount.count++;
              console.error(
                `Failed to upload ${file.name}: ${response.message}`
              );
            }
          } catch (error) {
            errorCount.count++;
            console.error(`Error uploading ${file.name}:`, error);
          }
        })
      );

      // Cập nhật danh sách tài liệu
      setDocuments(newDocuments);

      // Reset input sau khi upload thành công
      if (documentInputRef.current) {
        documentInputRef.current.value = "";
      }

      // Hiển thị thông báo kết quả
      if (successCount.count > 0) {
        toast({
          title: "Upload thành công",
          description: `Đã tải lên ${successCount.count} tài liệu thành công${
            errorCount.count > 0 ? `, ${errorCount.count} lỗi` : ""
          }`,
          variant: errorCount.count > 0 ? "default" : "success",
        });
      } else if (errorCount.count > 0) {
        toast({
          title: "Upload thất bại",
          description: `Không thể tải lên ${errorCount.count} tài liệu`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Lỗi upload",
        description: error.message || "Không thể tải lên tài liệu",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  // Các hàm khác giữ nguyên
  const handleOpenFileDialog = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);

  const handleOpenDocumentDialog = useCallback(() => {
    if (documentInputRef.current) {
      documentInputRef.current.click();
    }
  }, []);

  const handleRemoveMedia = useCallback(
    (indexToRemove: number) => {
      setMediaToDelete(null);
      const newMediaIds = mediaIds.filter(
        (_, index) => index !== indexToRemove
      );
      onMediaChange(newMediaIds);
    },
    [mediaIds, onMediaChange]
  );

  const handleDeleteMedia = useCallback(async () => {
    if (!mediaToDelete) return;

    try {
      const { id, index } = mediaToDelete;
      const response = await deleteMedia(id);

      if (response.success || response.code == 200) {
        handleRemoveMedia(index);
        toast({
          title: "Xóa thành công",
          description: "Đã xóa hình ảnh thành công",
        });
      } else {
        throw new Error(response.message || "Không thể xóa hình ảnh");
      }
    } catch (error: any) {
      console.error("Error deleting media:", error);
      toast({
        title: "Lỗi xóa",
        description: error.message || "Không thể xóa media",
        variant: "destructive",
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setMediaToDelete(null);
    }
  }, [mediaToDelete, handleRemoveMedia]);

  const handleConfirmDelete = useCallback((mediaId: number, index: number) => {
    setMediaToDelete({ id: mediaId, index });
    setIsDeleteDialogOpen(true);
  }, []);

  const handleRemoveDocument = useCallback(
    (indexToRemove: number) => {
      setDocuments(documents.filter((_, index) => index !== indexToRemove));
    },
    [documents]
  );

  const handlePreviewMedia = useCallback((mediaId: number) => {
    setSelectedMediaId(mediaId);
    setIsPreviewOpen(true);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Hình ảnh & Tài liệu</CardTitle>
          <CardDescription>
            Thêm hình ảnh và tài liệu liên quan đến cây dược liệu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Phần hình ảnh */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Hình ảnh cây dược liệu</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleOpenFileDialog}
                disabled={uploadingImage || isLoading}
              >
                {uploadingImage ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Thêm ảnh
                  </>
                )}
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>

            {uploadingImage && (
              <div className="w-full">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 ease-in-out"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  {uploadProgress}% hoàn thành
                </p>
              </div>
            )}

            {mediaIds.length === 0 && !uploadingImage && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Chưa có hình ảnh</AlertTitle>
                <AlertDescription>
                  Vui lòng tải lên hình ảnh cho cây dược liệu này.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {mediaIds.map((mediaId, index) => (
                <div key={index} className="relative group">
                  <div
                    className="aspect-square bg-gray-100 rounded-md overflow-hidden cursor-pointer"
                    onClick={() => handlePreviewMedia(mediaId)}
                  >
                    <MediaViewer
                      mediaId={mediaId}
                      className="w-full h-full object-cover"
                      alt={`Ảnh ${index + 1}`}
                      width="100%"
                      height="100%"
                      showLoader={true}
                      priority={false}
                    />
                  </div>
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleConfirmDelete(mediaId, index)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              ))}

              <div
                className={cn(
                  "aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-4 hover:bg-gray-50",
                  !isLoading && "cursor-pointer"
                )}
                onClick={isLoading ? undefined : handleOpenFileDialog}
              >
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 text-center">
                  Tải lên hình ảnh
                </p>
              </div>
            </div>
          </div>

          {/* Phần tài liệu */}
          <div className="space-y-4">
            <Label>Tài liệu đính kèm</Label>

            <div
              className={cn(
                "border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center",
                !isLoading && "cursor-pointer"
              )}
              onClick={isLoading ? undefined : handleOpenDocumentDialog}
            >
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Kéo thả tài liệu vào đây
              </p>
              <p className="text-xs text-gray-500 mt-1">Hoặc</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenDocumentDialog();
                }}
                disabled={isLoading}
              >
                Chọn tài liệu
              </Button>
              <p className="text-xs text-gray-500 mt-2">
                PDF, DOC, DOCX, XLS, XLSX (Tối đa 10MB)
              </p>
              <input
                type="file"
                ref={documentInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                multiple
                onChange={handleDocumentChange}
                disabled={isLoading}
              />
            </div>

            {documents.length > 0 && (
              <div className="space-y-2 mt-4">
                {documents.map((doc, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded mr-3">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.size}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleRemoveDocument(index)}
                      disabled={isLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Bạn có chắc chắn muốn xóa media này không?</p>
            <p className="text-sm text-gray-500 mt-2">
              Hành động này không thể hoàn tác.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteMedia}>
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog xem trước hình ảnh */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Xem hình ảnh</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex justify-center">
            {selectedMediaId && (
              <MediaViewer
                mediaId={selectedMediaId}
                className="max-h-[70vh] w-auto"
                showLoader={true}
                priority={true}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
