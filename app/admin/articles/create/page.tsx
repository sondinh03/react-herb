"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Article } from "../[id]/page";
import ArticleForm from "@/components/article/article-form";
import { ArticleStatus } from "@/app/types/article";
import { BackButton } from "@/components/BackButton";

export default function CreateArticlePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialArticle: Article = {
    title: "",
    excerpt: "",
    content: "",
    tags: "",
    relatedPlants: "",
    status: ArticleStatus.PENDING,
    publishDate: "",
    author: "",
    featuredImage: "",
    allowComments: true,
    isFeatured: false,
    displayAuthor: true,
    displayDate: true,
    relatedArticles: "",
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    canonicalUrl: "",
    views: 0,
  };

  const handleSubmit = async (article: Article) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("Không tìm thấy token xác thực. Vui lòng đăng nhập lại.");
      }

      const response = await fetch("/api/admin/articles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(article),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Thành công",
          description: result.message || "Bài viết đã được tạo thành công",
        });
        router.push("/admin/articles");
      } else {
        throw new Error(result.message || "Không thể tạo bài viết");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi khi tạo bài viết mới");
      toast({
        title: "Lỗi",
        description: err.message || "Đã xảy ra lỗi khi tạo bài viết mới",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <BackButton href={`/admin/articles`}></BackButton>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 mx-4 sm:mx-6">
          {error}
        </div>
      )}

      <ArticleForm
        article={initialArticle}
        isLoading={loading}
        onSubmit={handleSubmit}
        mode="create"
      />
    </div>
  );
}