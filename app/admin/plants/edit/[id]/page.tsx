"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PlantForm from "@/components/plant/plant-form";
import { Plant } from "@/app/types/plant";
import { Spinner } from "@/components/spinner";
import { BackButton } from "@/components/BackButton";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/api-client";
import { HerbResponse } from "@/types/api";

export default function EditPlantPage() {
  const router = useRouter();
  const params = useParams();
  const plantId = params.id;

  const [formData, setFormData] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAuthToken } = useAuth();

  useEffect(() => {
    const fetchPlantDetails = async () => {
      setIsFetching(true);
      try {
        const token = getAuthToken();

        const response = await fetchApi<Plant>(`/api/plants/${plantId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response?.data) {
          setFormData(response.data);
        }
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Lỗi",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsFetching(false);
      }
    };

    if (plantId) {
      fetchPlantDetails();
    }
  }, [plantId]);

  const handleSubmit = async (
    plant: Plant,
    publish = false
  ): Promise<HerbResponse> => {
    setLoading(true);
    try {
      const token = getAuthToken();

      const response = await fetchApi(`/api/admin/plants/edit/${plantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(plant),
      });
      if (response.success) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật thông tin cây dược liệu",
          variant: "success",
        });
        router.push(`/admin/plants/${plantId}`);

        return {
          code: 200,
          message: "Đã cập nhật thông tin cây dược liệu",
          data: response.data,
          success: true,
        };
      } else {
        throw new Error(response.message || "Không thể cập nhật cây dược liệu");
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Lỗi",
        description: err.message,
        variant: "destructive",
      });

      return {
        code: 500,
        message: err.message || "Không thể cập nhật cây dược liệu",
        success: false,
      };
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return <Spinner></Spinner>;
  }

  if (error || !formData) {
    return (
      <div className="container mx-auto py-8">
        <Link href="/admin/plants">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error || "Không tìm thấy thông tin cây dược liệu"}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <BackButton
        href={`/admin/plants/${plantId}`}
        text="Quay lại chi tiết"
      ></BackButton>

      <PlantForm
        plant={formData}
        isLoading={loading}
        onSubmit={handleSubmit}
        mode="edit"
      />
    </div>
  );
}
