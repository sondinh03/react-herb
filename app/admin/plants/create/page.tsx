"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PlantForm from "@/components/plant/plant-form";
import { Plant, PlantStatus } from "@/app/types/plant";
import { toast } from "@/hooks/use-toast";
import { BackButton } from "@/components/BackButton";

export default function CreatePlantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialPlant: Plant = {
    name: "",
    scientificName: "",
    family: "",
    genus: "",
    otherNames: "",
    partsUsed: "",
    description: "",
    distribution: "",
    altitude: "",
    harvestSeason: "",
    status: PlantStatus.DRAFT,
    botanicalCharacteristics: "",
    stem: "",
    leaves: "",
    flowers: "",
    fruits: "",
    roots: "",
    chemicalComposition: "",
    ecology: "",
    medicinalUses: "",
    indications: "",
    contraindications: "",
    dosage: "",
    folkRemedies: "",
    sideEffects: "",
    featured: false,
    views: 0,
    images: [
      "/placeholder.svg?height=200&width=200&text=Ảnh+1",
      "/placeholder.svg?height=200&width=200&text=Ảnh+2",
    ],
  };

  const handleSubmit = async (plant: Plant, publish = false) => {
    try {
      // Set plant status based on publish parameter
      if (publish) {
        plant.status = PlantStatus.PUBLISHED;
      }

      // Get authentication token from local storage
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error(
          "Không tìm thấy token xác thực. Vui lòng đăng nhập lại."
        );
      }

      // Send API request to create plant
      const response = await fetch("/api/admin/plants/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(plant),
      });

      // Parse the response
      const result = await response.json();

      // Handle the response based on success/failure
      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message,
        });
        router.push("/admin/plants");
      } else {
        toast({
          title: "Thất bại",
          description: result.message || "Không thể thêm cây dược liệu",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      // Handle any exceptions
      toast({
        title: "Lỗi",
        description:
          error.message || "Đã xảy ra lỗi khi thêm cây dược liệu mới",
        variant: "destructive",
      });
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
