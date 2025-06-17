"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Plant } from "@/app/types/plant";
import { getStatusLabel } from "@/constant/plant";
import { Spinner } from "@/components/spinner";
import { BackButton } from "@/components/BackButton";
/*
interface Plant {
  id: number;
  name: string;
  scientificName: string;
  family: string;
  genus: string;
  otherNames: string;
  partsUsed: string;
  status: number;
  description: string;
  distribution: string;
  altitude: string;
  harvestSeason: string;
  botanicalCharacteristics: string;
  stem: string;
  leaves: string;
  flowers: string;
  fruits: string;
  roots: string;
  chemicalComposition: string;
  ecology: string;
  medicinalUses: string;
  indications: string;
  contraindications: string;
  dosage: string;
  folkRemedies: string;
  sideEffects: string;
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}
  */

export default function PlantDetailPage() {
  const router = useRouter();
  const params = useParams();
  const plantId = params.id;

  const [plant, setPlant] = useState<Plant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlantDetails = async () => {
      setIsLoading(true);
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
        setPlant(data.data);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Lỗi",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (plantId) {
      fetchPlantDetails();
    }
  }, [plantId]);

  const handleEdit = () => {
    router.push(`/admin/plants/edit/${plantId}`);
  };

  const handleDelete = async () => {
    toast({
      title: "Chức năng chưa hoàn thiện",
      description: "Chức năng xóa đang trong quá trình phát triển",
      variant: "info",
    });
  };

  // const getStatusLabel = (
  //   status: number
  // ): { label: string; variant: string } => {
  //   switch (status) {
  //     case 0:
  //       return { label: "Bản nháp", variant: "warning" };
  //     case 1:
  //       return { label: "Đã xuất bản", variant: "success" };
  //     case 2:
  //       return { label: "Chờ duyệt", variant: "secondary" };
  //     default:
  //       return { label: "Không xác định", variant: "default" };
  //   }
  // };

  if (isLoading) {
    return <Spinner></Spinner>;
  }

  if (error || !plant) {
    return (
      <div className="container mx-auto py-8">
        <BackButton href="/admin/plants"></BackButton>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-red-500">
                {error || "Không tìm thấy thông tin cây dược liệu"}
              </p>
              <Button
                onClick={() => router.push("/admin/plants")}
                className="mt-4"
              >
                Quay lại danh sách cây dược liệu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusLabel(plant.status);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <BackButton href="/admin/plants"></BackButton>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{plant.name}</h1>
            <p className="text-gray-500 mt-1 italic">{plant.scientificName}</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" /> Xóa
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="basic-info" className="max-w-4xl mx-auto">
        <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="basic-info">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="botanical">Đặc điểm thực vật</TabsTrigger>
          <TabsTrigger value="usage">Công dụng & Cách dùng</TabsTrigger>
          <TabsTrigger value="stats">Thống kê</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Thông tin chi tiết về cây dược liệu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">ID</h3>
                    <p className="mt-1 text-base">{plant.id}</p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Tên cây
                    </h3>
                    <p className="mt-1 text-base font-medium">{plant.name}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Tên khoa học
                    </h3>
                    <p className="mt-1 text-base italic">
                      {plant.scientificName}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Họ</h3>
                    <p className="mt-1 text-base">{plant.family}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Chi</h3>
                    <p className="mt-1 text-base">{plant.genus || "Chưa có"}</p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Tên khác
                    </h3>
                    <p className="mt-1 text-base">
                      {plant.otherNames || "Chưa có"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Bộ phận dùng
                    </h3>
                    <p className="mt-1 text-base">{plant.partsUsed}</p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Trạng thái
                    </h3>
                    <Badge variant={statusInfo.variant as any}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Vùng phân bố
                    </h3>
                    <p className="mt-1 text-base">
                      {plant.distribution || "Chưa có"}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Độ cao
                    </h3>
                    <p className="mt-1 text-base">
                      {plant.altitude || "Chưa có"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Mùa thu hoạch
                    </h3>
                    <p className="mt-1 text-base">
                      {plant.harvestSeason || "Chưa có"}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Mô tả</h3>
                    <p className="mt-1 text-base">
                      {plant.description || "Chưa có"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="botanical">
          <Card>
            <CardHeader>
              <CardTitle>Đặc điểm thực vật</CardTitle>
              <CardDescription>Mô tả đặc điểm thực vật học</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Đặc điểm thực vật
                  </h3>
                  <p className="mt-1 text-base">
                    {plant.botanicalCharacteristics || "Chưa có"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Thân</h3>
                  <p className="mt-1 text-base">{plant.stem || "Chưa có"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Lá</h3>
                  <p className="mt-1 text-base">{plant.leaves || "Chưa có"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Hoa</h3>
                  <p className="mt-1 text-base">{plant.flowers || "Chưa có"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Quả/Hạt</h3>
                  <p className="mt-1 text-base">{plant.fruits || "Chưa có"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Rễ</h3>
                  <p className="mt-1 text-base">{plant.roots || "Chưa có"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Thành phần hóa học
                  </h3>
                  <p className="mt-1 text-base">
                    {plant.chemicalComposition || "Chưa có"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Sinh thái học
                  </h3>
                  <p className="mt-1 text-base">{plant.ecology || "Chưa có"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Công dụng & Cách dùng</CardTitle>
              <CardDescription>
                Công dụng y học và hướng dẫn sử dụng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Công dụng y học
                  </h3>
                  <p className="mt-1 text-base">
                    {plant.medicinalUses || "Chưa có"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Chỉ định
                  </h3>
                  <p className="mt-1 text-base">
                    {plant.indications || "Chưa có"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Chống chỉ định
                  </h3>
                  <p className="mt-1 text-base">
                    {plant.contraindications || "Chưa có"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Liều dùng và cách dùng
                  </h3>
                  <p className="mt-1 text-base">{plant.dosage || "Chưa có"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Bài thuốc dân gian
                  </h3>
                  <p className="mt-1 text-base">
                    {plant.folkRemedies || "Chưa có"}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Tác dụng phụ
                  </h3>
                  <p className="mt-1 text-base">
                    {plant.sideEffects || "Chưa có"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
              <CardDescription>Thông tin bổ sung và số liệu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Ngày tạo
                    </h3>
                    <p className="mt-1 text-base">
                      {new Date(plant.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Cập nhật gần nhất
                    </h3>
                    <p className="mt-1 text-base">
                      {new Date(plant.updatedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Nổi bật
                    </h3>
                    <p className="mt-1 text-base">
                      {plant.featured ? "Có" : "Không"}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Lượt xem
                    </h3>
                    <p className="mt-1 text-base">{plant.views}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
