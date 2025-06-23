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

export default function EditPlantPage() {
  const router = useRouter();
  const params = useParams();
  const plantId = params.id;

  const [formData, setFormData] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlantDetails = async () => {
      setIsFetching(true);
      try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`/api/plants/${plantId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Không thể lấy thông tin cây dược liệu");
        }
        const data = await response.json();
        setFormData(data.data);
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

  const handleSubmit = async (plant: Plant) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`/api/admin/plants/edit/${plantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(plant),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật cây dược liệu");
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin cây dược liệu",
        variant: "success",
      });
      router.push(`/admin/plants/${plantId}`);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Lỗi",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      // <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
      //   <div className="text-center">
      //     <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent"></div>
      //     <p className="mt-4">Đang tải thông tin cây dược liệu...</p>
      //   </div>
      // </div>
      <Spinner></Spinner>
    );
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
      <BackButton href={`/admin/plants/${plantId}`} text="Quay lại chi tiết"></BackButton>

      <PlantForm 
        plant={formData}
        isLoading={loading}
        onSubmit={handleSubmit}
        mode="edit"
      />
    </div>
  );
}