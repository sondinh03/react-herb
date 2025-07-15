"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { fetchApi } from "@/lib/api-client";
import { Research } from "@/app/types/research";
import ResearchForm from "@/components/research/ResearchForm";
import { Spinner } from "@/components/spinner";
import { BackButton } from "@/components/BackButton";
import { useAuth } from "@/hooks/useAuth";

export default function EditResearchPage() {
  const router = useRouter();
  const params = useParams();
  const researchId = params.id;
  const [formData, setFormData] = useState<Research | null>(null);
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

  // Fetch dữ liệu từ API khi component mount
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
        setFormData(response.data);
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

  // Handler lưu thay đổi
  const handleSubmit = async (research: Research) => {
    setLoading(true);
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
      }

      // Tạo object data để gửi, loại bỏ các field không cần thiết
      const updateData = {
        title: research.title,
        slug: research.slug,
        content: research.content,
        abstract: research.abstract,
        authors: research.authors,
        institution: research.institution,
        publishedYear: research.publishedYear,
        journal: research.journal,
        status: research.status,
        downloadPrice: research.downloadPrice,
        previewPages: research.previewPages,
        mediaId: research.mediaId,
        mediaUrl: research.mediaUrl,
      };

      // Loại bỏ các field undefined hoặc null
      const filteredData = Object.fromEntries(
        Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== null)
      );

      const response = await fetchApi(`/api/admin/research/edit/${researchId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredData),
      });

      if (response?.success && response.code === 200) {
        toast({
          title: "Thành công",
          description: response.message || "Đã cập nhật thông tin nghiên cứu",
        });
        router.push(`/admin/research/${researchId}`);
        return response;
      } else {
        throw new Error(response.message || "Không thể cập nhật nghiên cứu");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Có lỗi xảy ra khi cập nhật nghiên cứu";
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (isFetching) {
    return <Spinner />;
  }

  // Error state
  if (error || !formData) {
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
      <BackButton href={`/admin/research/${researchId}`} />
      <ResearchForm
        research={formData}
        isLoading={loading}
        onSubmit={handleSubmit}
        mode="edit"
        onChange={setFormData}
      />
    </div>
  );
}