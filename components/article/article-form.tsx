"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Save,
  Upload,
  Bold,
  Italic,
  LinkIcon,
  List,
  ListOrdered,
  Image,
  Code,
} from "lucide-react";
import { Article } from "@/app/admin/articles/[id]/page";
import { Textarea } from "../ui/textarea";

interface ArticleFormProps {
  article: Article;
  isLoading: boolean;
  onSubmit: (article: Article) => void;
  mode: "edit" | "create";
}

export default function ArticleForm({
  article,
  isLoading,
  onSubmit,
  mode,
}: ArticleFormProps) {
  const [formData, setFormData] = useState<Article>(article);

  const handleInputChange = (field: keyof Article, value: string | boolean | number | null) => {
    setFormData((prev) => {
      if (prev) {
        return {
          ...prev,
          [field]: value,
        };
      }
      return prev;
    });
  };

  const handleBooleanChange = (field: keyof Article, value: string) => {
    handleInputChange(field, value === "yes");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {mode === "edit" ? "Nội dung bài viết" : "Tạo nội dung bài viết"}
                  </CardTitle>
                  <CardDescription>
                    {mode === "edit" ? "Cập nhật" : "Nhập"} tiêu đề và nội dung chi tiết của bài viết
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tiêu đề bài viết</Label>
                    <Input
                      id="title"
                      value={formData.title || ""}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      placeholder="Nhập tiêu đề bài viết"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Tóm tắt</Label>
                    <Textarea
                      id="excerpt"
                      value={formData.excerpt || ""}
                      onChange={(e) => handleInputChange("excerpt", e.target.value)}
                      placeholder="Nhập tóm tắt ngắn gọn về bài viết"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Nội dung</Label>
                    <div className="border rounded-md">
                      <div className="flex items-center gap-1 p-2 border-b">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                        <div className="h-6 w-px bg-gray-200 mx-1"></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <List className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                        <div className="h-6 w-px bg-gray-200 mx-1"></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Image className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Code className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        id="content"
                        value={formData.content || ""}
                        onChange={(e) => handleInputChange("content", e.target.value)}
                        placeholder="Nhập nội dung chi tiết của bài viết..."
                        rows={15}
                        className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ảnh bìa</CardTitle>
                    <CardDescription>Cập nhật ảnh bìa cho bài viết</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={formData.featuredImage || "/placeholder.svg?height=400&width=800&text=Ảnh+bìa"}
                          alt="Ảnh bìa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button
                        variant="outline"
                        className="w-full flex items-center gap-1"
                        onClick={() => {/* Logic tải ảnh, cập nhật featuredImage */}}
                      >
                        <Upload className="h-4 w-4" />
                        Tải lên ảnh bìa
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Xuất bản</CardTitle>
                    <CardDescription>Cập nhật trạng thái và thời gian xuất bản</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Trạng thái</Label>
                      <Select
                        value={formData.status.toString()} // Chuyển number sang string cho Select
                        onValueChange={(value) => handleInputChange("status", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Bản nháp</SelectItem>
                          <SelectItem value="2">Chờ duyệt</SelectItem>
                          <SelectItem value="3">Xuất bản</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="publishedAt">Ngày xuất bản</Label>
                      <Input
                        id="publishedAt"
                        type="date"
                        value={formData.publishedAt ? formData.publishedAt.split("T")[0] : ""}
                        onChange={(e) => handleInputChange("publishedAt", e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt bài viết</CardTitle>
              <CardDescription>Cập nhật các tùy chọn hiển thị và tương tác</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="allowComments">Cho phép bình luận</Label>
                  <Select
                    value={formData.allowComments ? "yes" : "no"}
                    onValueChange={(value) => handleBooleanChange("allowComments", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tùy chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Có</SelectItem>
                      <SelectItem value="no">Không</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="isFeatured">Bài viết nổi bật</Label>
                  <Select
                    value={formData.isFeatured ? "yes" : "no"}
                    onValueChange={(value) => handleBooleanChange("isFeatured", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tùy chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Có</SelectItem>
                      <SelectItem value="no">Không</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>Tối ưu hóa SEO</CardTitle>
              <CardDescription>Cập nhật thông tin SEO để tối ưu hiển thị trên công cụ tìm kiếm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seoTitle">Tiêu đề SEO</Label>
                <Input
                  id="seoTitle"
                  value={formData.title || ""} // Giả định dùng title làm seoTitle tạm thời
                  onChange={(e) => handleInputChange("title", e.target.value)} // Cập nhật title thay vì seoTitle
                  placeholder="Nhập tiêu đề SEO"
                />
                <p className="text-xs text-gray-500">Tiêu đề hiển thị trên kết quả tìm kiếm (tối đa 60 ký tự)</p>
              </div>
              {/* Thêm các trường SEO khác nếu cần */}
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {mode === "edit" ? "Lưu thay đổi" : "Tạo bài viết"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <div className="mt-6">
          <Button type="submit" disabled={isLoading}>
            {mode === "edit" ? "Lưu thay đổi" : "Tạo bài viết"}
          </Button>
        </div>
      </Tabs>
    </form>
  );
}