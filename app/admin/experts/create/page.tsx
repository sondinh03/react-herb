"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/api-client";
import { ExpertResponseDto } from "@/app/types/expert";
import ExpertForm from "@/components/expert/ExpertForm";

export default function CreateExpertPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { getAuthToken } = useAuth();

  const initialExpert: Partial<ExpertResponseDto> = {
    name: "",
    title: "",
    specialization: "",
    institution: "",
    education: "",
    bio: "",
    achievements: "",
    contactEmail: "",
    zaloPhone: "",
    status: 1,
    avatarId: null,
  };

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

      const response = await fetchApi("/api/expert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expert),
      });

      if (response.success) {
        toast({
          title: "Thành công",
          description: response.message || "Đã tạo chuyên gia mới thành công",
        });
        router.push("/experts");
        return {
          code: 200,
          message: response.message || "Đã tạo chuyên gia mới thành công",
          data: response.data,
          success: true,
        };
      } else {
        throw new Error(response.message || "Không thể thêm chuyên gia");
      }
    } catch (error: any) {
      setError(error.message || "Đã xảy ra lỗi khi thêm chuyên gia mới");
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi thêm chuyên gia mới",
        variant: "destructive",
      });
      return {
        code: 500,
        message: error.message || "Đã xảy ra lỗi khi thêm chuyên gia mới",
        success: false,
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <BackButton href="/admin/experts" />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <ExpertForm
        mode="add"
        isLoading={loading}
        onSubmit={handleSubmit}
        expert={initialExpert}
      />
    </div>
  );
}