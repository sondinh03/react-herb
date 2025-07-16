"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { fetchApi } from "@/lib/api-client";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { ExpertResponseDto } from "@/app/types/expert";

interface ExpertFormProps {
  mode: "add" | "edit";
}

export default function ExpertForm({ mode }: ExpertFormProps) {
  const router = useRouter();
  const { id } = useParams();
  
  const [formData, setFormData] = useState<Partial<ExpertResponseDto>>({
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
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(mode === "edit");

  useEffect(() => {
    if (mode === "edit" && id) {
      const fetchExpert = async () => {
        setIsFetching(true);
        try {
          const response = await fetchApi<ExpertResponseDto>(`/api/expert/${id}`);
          setFormData(response.data);
        } catch (error: any) {
          toast({
            title: "Lỗi",
            description: error.message || "Không thể tải thông tin chuyên gia",
            variant: "destructive",
          });
        } finally {
          setIsFetching(false);
        }
      };
      fetchExpert();
    }
  }, [id, mode]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value: string) => {
    setFormData((prev) => ({ ...prev, status: parseInt(value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = mode === "edit" ? `/api/expert/${id}` : "/api/expert";
      const method = mode === "edit" ? "PUT" : "POST";
      
      await fetchApi(endpoint, {
        method,
        body: JSON.stringify(formData),
      });

      toast({
        title: "Thành công",
        description: `Chuyên gia đã được ${mode === "edit" ? "cập nhật" : "thêm"} thành công`,
      });
      
      router.push("/experts");
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || `Không thể ${mode === "edit" ? "cập nhật" : "thêm"} chuyên gia`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {mode === "edit" ? "Chỉnh sửa chuyên gia" : "Thêm chuyên gia mới"}
              </CardTitle>
              <Button
                variant="ghost"
                onClick={() => router.push("/experts")}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Quay lại
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập họ và tên"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Danh xưng</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="VD: GS.TS, PGS.TS, TS, ThS..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">Chuyên ngành</Label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập chuyên ngành"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="institution">Cơ quan công tác</Label>
                <Input
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập cơ quan công tác"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="education">Học vấn</Label>
                <Input
                  id="education"
                  name="education"
                  value={formData.education}
                  onChange={handleInputChange}
                  placeholder="Nhập học vấn"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Tiểu sử</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Nhập tiểu sử"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="achievements">Thành tựu</Label>
                <Textarea
                  id="achievements"
                  name="achievements"
                  value={formData.achievements}
                  onChange={handleInputChange}
                  placeholder="Nhập thành tựu"
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email liên hệ</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={handleInputChange}
                  placeholder="Nhập email liên hệ"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zaloPhone">Số điện thoại Zalo</Label>
                <Input
                  id="zaloPhone"
                  name="zaloPhone"
                  value={formData.zaloPhone}
                  onChange={handleInputChange}
                  placeholder="Nhập số điện thoại Zalo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Trạng thái</Label>
                <Select
                  value={formData.status?.toString()}
                  onValueChange={handleStatusChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Hoạt động</SelectItem>
                    <SelectItem value="0">Không hoạt động</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/experts")}
                >
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Lưu
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}