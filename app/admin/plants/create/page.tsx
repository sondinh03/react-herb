"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import PlantForm from "@/components/plant/plant-form";
import { Plant, PlantStatus } from "@/app/types/plant";
import { toast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/api-client";
import { HerbResponse } from "@/types/api";

export default function CreatePlantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { getAuthToken } = useAuth();

  const initialPlant: Plant = {
    name: "",
    scientificName: "",
    familyId: 0,
    generaId: 0,
    otherNames: "",
    partsUsed: "",
    description: "",
    distribution: "",
    altitude: "",
    harvestSeason: "",
    status: PlantStatus.DRAFT,
    botanicalCharacteristics: "",
    stemDescription: "",
    leafDescription: "",
    flowerDescription: "",
    fruitDescription: "",
    rootDescription: "",
    ecology: "",
    medicinalUses: "",
    indications: "",
    contraindications: "",
    dosage: "",
    folkRemedies: "",
    sideEffects: "",
    featured: false,
    views: 0,
    images: [],
  };

  const handleSubmit = async (
    plant: Plant,
    publish = false
  ): Promise<HerbResponse> => {
    setLoading(true);
    try {
      if (publish) {
        plant.status = PlantStatus.PUBLISHED;
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
      }

      // Send API request to create plant
      const response = await fetchApi("/api/admin/plants/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(plant),
      });

      // Handle the response based on success/failure
      if (response.success) {
        toast({
          title: "Thành công",
          description: response.message,
        });
        router.push("/admin/plants");

        return {
          code: 200,
          message: response.message || "Đã tạo cây dược liệu mới thành công",
          data: response.data,
          success: true,
        };
      } else {
        throw new Error(response.message || "Không thể thêm cây dược liệu");
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description:
          error.message || "Đã xảy ra lỗi khi thêm cây dược liệu mới",
        variant: "destructive",
      });

      return {
      code: 500,
      message: error.message || "Đã xảy ra lỗi khi thêm cây dược liệu mới",
      success: false
    };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <BackButton href="/admin/plants" />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <PlantForm
        plant={initialPlant}
        isLoading={loading}
        onSubmit={handleSubmit}
        mode="create"
      />
    </div>
  );
}
