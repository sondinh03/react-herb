"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ArticleForm from "@/components/article/article-form"; // Giả định component form riêng
import { Spinner } from "@/components/spinner"; // Giả định component Spinner
import { Article } from "../../[id]/page";
import { BackButton } from "@/components/BackButton";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id;

  const [formData, setFormData] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dữ liệu từ API khi component mount
  useEffect(() => {
    const fetchArticleDetails = async () => {
      setIsFetching(true);
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
        setFormData(data.data); // Giả định API trả về { data: Article }
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

    if (articleId) {
      fetchArticleDetails();
    }
  }, [articleId]);

  // Handler lưu thay đổi
  const handleSubmit = async (article: Article) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`/api/admin/articles/edit/${articleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(article),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật bài viết");
      }

      toast({
        title: "Thành công",
        description: "Đã cập nhật thông tin bài viết",
        variant: "success",
      });
      router.push(`/admin/articles/${articleId}`); // Quay lại chi tiết bài viết
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

  // Loading state
  if (isFetching) {
    return <Spinner />;
  }

  // Error state
  if (error || !formData) {
    return (
      <div className="container mx-auto py-8">
        <Link href="/admin/articles">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error || "Không tìm thấy thông tin bài viết"}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <BackButton href={`/admin/articles/${articleId}`}></BackButton>
      <ArticleForm
        article={formData}
        isLoading={loading}
        onSubmit={handleSubmit}
        mode="edit"
      />
    </div>
  );
}