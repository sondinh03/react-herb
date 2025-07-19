"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { fetchApi } from "@/lib/api-client";
import { Research } from "@/app/types/research";
import ResearchForm from "@/components/research/ResearchForm";
import { BackButton } from "@/components/BackButton";
import { useAuth } from "@/hooks/useAuth";

export default function CreateResearchPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<Research | null>(null);
  const [loading, setLoading] = useState(false);
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

  // Initialize form data
  const initializeFormData = useCallback(() => {
    if (!checkAuth()) return;

    const initialResearch: Research = {
      id: 0,
      title: "",
      slug: "",
      abstract: "",
      content: "",
      authors: "",
      institution: "",
      publishedYear: undefined,
      journal: "",

      status: 1, // Bản nháp
      views: 0,
      mediaId: undefined,
      downloadPrice: undefined,
      previewPages: 2,
      mediaUrl: "",
      createdBy: "",
      createdAt: "",
      updatedBy: "",
      updatedAt: "",
    };

    setFormData(initialResearch);
  }, [checkAuth]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        initializeFormData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [initializeFormData]);

  // Handler tạo mới
  const handleSubmit = async (research: Research) => {
    setLoading(true);
    setError(null);

    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
      }

      // Tạo object data để gửi, loại bỏ các field không cần thiết
      const createData = {
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
        Object.entries(createData).filter(([_, value]) => value !== undefined && value !== null)
      );

      const response = await fetchApi("/api/admin/research/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filteredData),
      });

      if (response?.success && response.code === 200) {
        toast({
          title: "Thành công",
          description: response.message || "Nghiên cứu đã được tạo thành công",
        });
        router.push("/admin/research");
        return response;
      } else {
        throw new Error(response.message || "Không thể tạo nghiên cứu");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Có lỗi xảy ra khi tạo nghiên cứu mới";
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

  // Loading state (while initializing)
  if (!formData) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <BackButton href="/admin/research" />
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-8">
        <BackButton href="/admin/research" />
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <BackButton href="/admin/research" />
      <ResearchForm
        research={formData}
        isLoading={loading}
        onSubmit={handleSubmit}
        mode="create"
        onChange={setFormData}
      />
    </div>
  );
}