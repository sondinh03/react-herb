"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/api-client";
import { Loader2 } from "lucide-react";
import { ExpertResponseDto } from "@/app/types/expert";
import ExpertForm from "@/components/expert/ExpertForm";

export default function EditExpertPage() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [expert, setExpert] = useState<Partial<ExpertResponseDto> | null>(null);
  const { getAuthToken } = useAuth();

  useEffect(() => {
    const fetchExpert = async () => {
      setFetching(true);
      try {
        const token = getAuthToken();
        if (!token) {
          throw new Error(
            "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
          );
        }

        const response = await fetchApi<ExpertResponseDto>(`/api/expert/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.success) {
          setExpert(response.data);
        } else {
          throw new Error(response.message || "Không thể tải thông tin chuyên gia");
        }
      } catch (error: any) {
        setError(error.message || "Đã xảy ra lỗi khi tải thông tin chuyên gia");
        toast({
          title: "Lỗi",
          description: error.message || "Đã xảy ra lỗi khi tải thông tin chuyên gia",
          variant: "destructive",
        });
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchExpert();
    }
  }, [id, getAuthToken]);

  const handleSubmit = async (expert: Partial<ExpertResponseDto>) => {
    setLoading(true);
    setError("");
    try {
      const token = getAuthToken();
      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
      }

      const response = await fetchApi(`/api/expert/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expert),
      });

      if (response.success) {
        toast({
          title: "Thành công",
          description: response.message || "Đã cập nhật chuyên gia thành công",
        });
        router.push("/experts");
        return {
          code: 200,
          message: response.message || "Đã cập nhật chuyên gia thành công",
          data: response.data,
          success: true,
        };
      } else {
        throw new Error(response.message || "Không thể cập nhật chuyên gia");
      }
    } catch (error: any) {
      setError(error.message || "Đã xảy ra lỗi khi cập nhật chuyên gia");
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi cập nhật chuyên gia",
        variant: "destructive",
      });
      return {
        code: 500,
        message: error.message || "Đã xảy ra lỗi khi cập nhật chuyên gia",
        success: false,
      };
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!expert) {
    return (
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <BackButton href="/experts" />
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          Không tìm thấy thông tin chuyên gia
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <BackButton href="/admin/experts" />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <ExpertForm
        mode="edit"
        isLoading={loading}
        onSubmit={handleSubmit}
        expert={expert}
      />
    </div>
  );
}