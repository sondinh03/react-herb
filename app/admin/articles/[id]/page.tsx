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
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/spinner";
import { BackButton } from "@/components/BackButton";

export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: number;
  isFeatured: boolean;
  allowComments: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  publishedAt: string | null;
  authorId: number;
  diseaseId: number | null;
  featuredImage: number | null;
}

const ARTICLE_STATUS_OPTIONS = [
  { value: 1, label: "Bản nháp", variant: "warning" },
  { value: 2, label: "Chờ duyệt", variant: "secondary" },
  { value: 3, label: "Đã xuất bản", variant: "success" },
  { value: 4, label: "Lưu trữ", variant: "secondary" },
  { value: 5, label: "Từ chối", variant: "destructive" },
];

const getStatusLabel = (status: number) => {
  const statusInfo = ARTICLE_STATUS_OPTIONS.find((s) => s.value === status);
  return statusInfo || { label: "Không xác định", variant: "default" };
};

export default function ArticleDetailPage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id;

  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticleDetails = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");

        const response = await fetch(`/api/articles/${articleId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Không thể lấy thông tin bài viết");
        }
        const data = await response.json();
        setArticle(data.data);
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

    if (articleId) {
      fetchArticleDetails();
    }
  }, [articleId]);

  const handleEdit = () => {
    router.push(`/admin/articles/edit/${articleId}`);
  };

  const handleDelete = async () => {
    toast({
      title: "Chức năng chưa hoàn thiện",
      description: "Chức năng xóa đang trong quá trình phát triển",
      variant: "info",
    });
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error || !article) {
    return (
      <div className="container mx-auto py-8">
        <Link href="/admin/articles">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
        <BackButton href="/admin/articles" />
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-red-500">
                {error || "Không tìm thấy thông tin bài viết"}
              </p>
              <Button
                onClick={() => router.push("/admin/articles")}
                className="mt-4"
              >
                Quay lại danh sách bài viết
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusLabel(article.status);

  return (
     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <BackButton href="/admin/articles"></BackButton>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{article.title}</h1>
            <p className="text-gray-500 mt-1">{article.excerpt}</p>
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
        <TabsList className="mb-6 grid grid-cols-2 md:grid-cols-3">
          <TabsTrigger value="basic-info">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="stats">Thống kê</TabsTrigger>
        </TabsList>

        <TabsContent value="basic-info">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>
                Thông tin chi tiết về bài viết
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">ID</h3>
                    <p className="mt-1 text-base">{article.id}</p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Tiêu đề</h3>
                    <p className="mt-1 text-base font-medium">{article.title}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Slug</h3>
                    <p className="mt-1 text-base">{article.slug}</p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Tác giả</h3>
                    <p className="mt-1 text-base">{article.createdBy}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Trạng thái</h3>
                    <Badge variant={statusInfo.variant as any}>
                      {statusInfo.label}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Tóm tắt</h3>
                    <p className="mt-1 text-base">{article.excerpt}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Nổi bật</h3>
                    <p className="mt-1 text-base">{article.isFeatured ? "Có" : "Không"}</p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Cho phép bình luận</h3>
                    <p className="mt-1 text-base">{article.allowComments ? "Có" : "Không"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung bài viết</CardTitle>
              <CardDescription>Nội dung chi tiết của bài viết</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Nội dung</h3>
                  <div className="mt-1 text-base prose max-w-none">
                    {article.content}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Hình ảnh nổi bật</h3>
                  <p className="mt-1 text-base">
                    {article.featuredImage ? (
                      <img
                        src={article.featuredImage}
                        alt="Hình ảnh nổi bật"
                        className="max-w-xs rounded-md"
                      />
                    ) : (
                      "Chưa có"
                    )}
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
                    <h3 className="text-sm font-medium text-gray-500">Ngày tạo</h3>
                    <p className="mt-1 text-base">
                      {new Date(article.createdAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Cập nhật gần nhất</h3>
                    <p className="mt-1 text-base">
                      {new Date(article.updatedAt).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Ngày xuất bản</h3>
                    <p className="mt-1 text-base">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString("vi-VN")
                        : "Chưa xuất bản"}
                    </p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Lượt xem</h3>
                    <p className="mt-1 text-base">{article.views}</p>
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