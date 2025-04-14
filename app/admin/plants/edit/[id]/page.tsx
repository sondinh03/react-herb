/*
"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";

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
}

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [id]: value } : null));
  };

  const handleSelectChange = (field: string, value: string) => {
    setFormData((prev) =>
      prev
        ? {
            ...prev,
            [field]: field === "featured" ? value === "true" : parseInt(value),
          }
        : null
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/plants/${plantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
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
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4">Đang tải thông tin cây dược liệu...</p>
        </div>
      </div>
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
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-red-500">
                {error || "Không tìm thấy thông tin cây dược liệu"}
              </p>
              <Button onClick={() => router.push("/admin/plants")} className="mt-4">
                Quay lại danh sách cây dược liệu
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/admin/plants/${plantId}`}>
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại chi tiết
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Chỉnh sửa: {formData.name}</h1>
            <p className="text-gray-500 mt-1">Cập nhật thông tin cây dược liệu</p>
          </div>
          <Button onClick={handleSubmit} disabled={loading}>
            <Save className="h-4 w-4 mr-2" /> {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
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
              <CardDescription>Chỉnh sửa thông tin cơ bản của cây dược liệu</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên cây dược liệu</Label>
                  <Input id="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scientificName">Tên khoa học</Label>
                  <Input id="scientificName" value={formData.scientificName} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="family">Họ</Label>
                  <Input id="family" value={formData.family} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genus">Chi</Label>
                  <Input id="genus" value={formData.genus} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="otherNames">Tên khác</Label>
                  <Input id="otherNames" value={formData.otherNames} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="partsUsed">Bộ phận dùng</Label>
                  <Input id="partsUsed" value={formData.partsUsed} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Trạng thái</Label>
                  <Select value={formData.status.toString()} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Bản nháp</SelectItem>
                      <SelectItem value="1">Đã xuất bản</SelectItem>
                      <SelectItem value="2">Chờ duyệt</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="distribution">Vùng phân bố</Label>
                  <Input id="distribution" value={formData.distribution} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="altitude">Độ cao</Label>
                  <Input id="altitude" value={formData.altitude} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="harvestSeason">Mùa thu hoạch</Label>
                  <Input id="harvestSeason" value={formData.harvestSeason} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <Textarea id="description" value={formData.description} onChange={handleInputChange} rows={4} />
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="botanical">
          <Card>
            <CardHeader>
              <CardTitle>Đặc điểm thực vật</CardTitle>
              <CardDescription>Chỉnh sửa thông tin thực vật học</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="botanicalCharacteristics">Đặc điểm thực vật</Label>
                  <Textarea id="botanicalCharacteristics" value={formData.botanicalCharacteristics} onChange={handleInputChange} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stem">Thân</Label>
                  <Textarea id="stem" value={formData.stem} onChange={handleInputChange} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="leaves">Lá</Label>
                  <Textarea id="leaves" value={formData.leaves} onChange={handleInputChange} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flowers">Hoa</Label>
                  <Textarea id="flowers" value={formData.flowers} onChange={handleInputChange} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fruits">Quả/Hạt</Label>
                  <Textarea id="fruits" value={formData.fruits} onChange={handleInputChange} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="roots">Rễ</Label>
                  <Textarea id="roots" value={formData.roots} onChange={handleInputChange} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chemicalComposition">Thành phần hóa học</Label>
                  <Textarea id="chemicalComposition" value={formData.chemicalComposition} onChange={handleInputChange} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ecology">Sinh thái học</Label>
                  <Textarea id="ecology" value={formData.ecology} onChange={handleInputChange} rows={4} />
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage">
          <Card>
            <CardHeader>
              <CardTitle>Công dụng & Cách dùng</CardTitle>
              <CardDescription>Chỉnh sửa thông tin công dụng y học</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="medicinalUses">Công dụng y học</Label>
                  <Textarea id="medicinalUses" value={formData.medicinalUses} onChange={handleInputChange} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="indications">Chỉ định</Label>
                  <Textarea id="indications" value={formData.indications} onChange={handleInputChange} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contraindications">Chống chỉ định</Label>
                  <Textarea id="contraindications" value={formData.contraindications} onChange={handleInputChange} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dosage">Liều dùng và cách dùng</Label>
                  <Textarea id="dosage" value={formData.dosage} onChange={handleInputChange} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="folkRemedies">Bài thuốc dân gian</Label>
                  <Textarea id="folkRemedies" value={formData.folkRemedies} onChange={handleInputChange} rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sideEffects">Tác dụng phụ</Label>
                  <Textarea id="sideEffects" value={formData.sideEffects} onChange={handleInputChange} rows={4} />
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
              <CardDescription>Chỉnh sửa thông tin bổ sung</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="featured">Nổi bật</Label>
                  <Select value={formData.featured.toString()} onValueChange={(value) => handleSelectChange("featured", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Có</SelectItem>
                      <SelectItem value="false">Không</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="views">Lượt xem</Label>
                  <Input id="views" type="number" value={formData.views} onChange={handleInputChange} />
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
  */

// app/(admin)/admin/plants/[id]/edit/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PlantForm from "@/components/plant/PlantForm";
import { Plant } from "@/app/types/plant";

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
      const response = await fetch(`/api/plants/${plantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
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
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4">Đang tải thông tin cây dược liệu...</p>
        </div>
      </div>
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
    <div className="container mx-auto">
      <div className="mb-6">
        <Link href={`/admin/plants/${plantId}`}>
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại chi tiết
          </Button>
        </Link>
      </div>

      <PlantForm 
        plant={formData}
        isLoading={loading}
        onSubmit={handleSubmit}
        mode="edit"
      />
    </div>
  );
}