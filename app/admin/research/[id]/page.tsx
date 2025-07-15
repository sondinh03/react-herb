"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { fetchApi } from "@/lib/api-client";
import { Research, ResearchStatus } from "@/app/types/research";
import { Spinner } from "@/components/spinner";
import { BackButton } from "@/components/BackButton";
import { CustomActionButton } from "@/components/CustomActionButton";
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Edit,
  Download,
  Eye,
  Calendar,
  User,
  Building,
  BookOpen,
  DollarSign,
  Hash,
  Clock,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { Separator } from "@radix-ui/react-select";


export default function ResearchDetailPage() {
  const router = useRouter();
  const params = useParams();
  const researchId = params.id;
  const [research, setResearch] = useState<Research | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAuthToken } = useAuth();

  // Check authentication
  const checkAuth = useCallback(() => {
    const token = getAuthToken();
    if (!token) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng đăng nhập để tiếp tục",
        variant: "destructive",
      });
      router.push("/login");
      return false;
    }
    return true;
  }, [getAuthToken, router]);

  // Fetch research details
  const fetchResearchDetails = useCallback(async () => {
    if (!researchId || !checkAuth()) return;

    setIsFetching(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetchApi<Research>(`/api/research/${researchId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data) {
        setResearch(response.data);
      } else {
        throw new Error("Không tìm thấy thông tin nghiên cứu");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Có lỗi xảy ra khi tải nghiên cứu";
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  }, [researchId, checkAuth, getAuthToken]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchResearchDetails();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchResearchDetails]);

  // Delete research
  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Bạn có chắc chắn muốn xóa nghiên cứu "${research?.title}"? Hành động này không thể hoàn tác.`
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
      }

      const response = await fetchApi(`/api/admin/research/delete/${researchId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.success && response.code === 200) {
        toast({
          title: "Thành công",
          description: response.message || "Đã xóa nghiên cứu thành công",
        });
        router.push("/admin/research");
      } else {
        throw new Error(response.message || "Không thể xóa nghiên cứu");
      }
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message || "Có lỗi xảy ra khi xóa nghiên cứu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status: ResearchStatus) => {
    switch (status) {
      case ResearchStatus.PUBLISHED:
        return <Badge variant="default" className="bg-green-100 text-green-800">Đã xuất bản</Badge>;
      case ResearchStatus.DRAFT:
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Nháp</Badge>;
      case ResearchStatus.ARCHIVED:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Lưu trữ</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  // Loading state
  if (isFetching) {
    return <Spinner />;
  }

  // Error state
  if (error || !research) {
    return (
      <div className="container mx-auto py-8">
        <BackButton href="/admin/research" />
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error || "Không tìm thấy thông tin nghiên cứu"}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <BackButton href="/admin/research" />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{research.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{research.views || 0} lượt xem</span>
            </div>
            <div className="flex items-center gap-1">
              <Hash className="h-4 w-4" />
              <span>{research.slug}</span>
            </div>
            {getStatusBadge(research.status)}
          </div>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <CustomActionButton
            onClick={() => router.push(`/admin/research/edit/${researchId}`)}
            text="Chỉnh sửa"
            icon={<Edit className="h-4 w-4" />}
            variant="add"
          />
          <CustomActionButton
            onClick={handleDelete}
            text={loading ? "Đang xóa..." : "Xóa"}
            icon={<Trash2 className="h-4 w-4" />}
            variant="ghost"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Thông tin cơ bản
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Tác giả</h4>
                  <p className="text-gray-600">{research.authors || "Chưa có thông tin"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Cơ quan</h4>
                  <p className="text-gray-600">{research.institution || "Chưa có thông tin"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Năm xuất bản</h4>
                  <p className="text-gray-600">{research.publishedYear || "Chưa có thông tin"}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1">Tạp chí</h4>
                  <p className="text-gray-600">{research.journal || "Chưa có thông tin"}</p>
                </div>
              </div>
              
              {research.abstract && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-2">Tóm tắt</h4>
                    <p className="text-gray-600 leading-relaxed">{research.abstract}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Nội dung
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose max-w-none text-gray-600 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: research.content }}
              />
            </CardContent>
          </Card>

          {/* Media/Document */}
          {research.mediaUrl && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Tài liệu
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium text-green-800">File PDF</p>
                      <p className="text-sm text-green-600">
                        {research.mediaUrl.split("/").pop()}
                      </p>
                    </div>
                  </div>
                  <CustomActionButton
                    onClick={() => window.open(research.mediaUrl, "_blank")}
                    text="Xem PDF"
                    icon={<ExternalLink className="h-4 w-4" />}
                    variant="add"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Thống kê
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Lượt xem</span>
                <span className="font-semibold">{research.views || 0}</span>
              </div>
              {research.downloadPrice && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Phí tải xuống</span>
                  <span className="font-semibold flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {research.downloadPrice}
                  </span>
                </div>
              )}
              {research.previewPages && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Trang xem trước</span>
                  <span className="font-semibold">{research.previewPages}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Thông tin hệ thống
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {research.createdBy && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Người tạo
                  </h4>
                  <p className="text-gray-600">{research.createdBy}</p>
                </div>
              )}
              
              {research.createdAt && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ngày tạo
                  </h4>
                  <p className="text-gray-600">{formatDate(research.createdAt)}</p>
                </div>
              )}

              {research.updatedBy && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Người cập nhật
                  </h4>
                  <p className="text-gray-600">{research.updatedBy}</p>
                </div>
              )}
              
              {research.updatedAt && (
                <div>
                  <h4 className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Ngày cập nhật
                  </h4>
                  <p className="text-gray-600">{formatDate(research.updatedAt)}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}