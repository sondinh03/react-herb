"use client";

import React, { useCallback, useEffect, useState } from "react";
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
import { fetchApi } from "@/lib/api-client";
import { useAuth } from "@/hooks/useAuth";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id;

  const [formData, setFormData] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {getAuthToken} = useAuth();

  // Check authentication
  const checkAuth = useCallback(() => {
    const token = getAuthToken();
    if (!token) {
      toast({
        title: "Lỗi xác thực",
        description: "Vui lòng đăng nhập để tiếp tục",
        variant: "destructive",
      });
      router.push("/login");
      return false;
    }
    return true;
  }, [getAuthToken, router]);

  // Fetch dữ liệu từ API khi component mount
  const fetchArticleDetails = useCallback(async () => {
    if (!articleId || !checkAuth()) return;

    setIsFetching(true);
    setError(null);

    try {
      const token = getAuthToken();
      const response = await fetchApi<Article>(`/api/articles/${articleId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response?.data) {
        setFormData(response.data);
      } else {
        throw new Error("Không tìm thấy thông tin bài viết");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Có lỗi xảy ra khi tải bài viết";
      setError(errorMessage);
      toast({
        title: "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  }, [articleId, checkAuth, getAuthToken]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchArticleDetails();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [fetchArticleDetails]);

  // useEffect(() => {
  //   const fetchArticleDetails = async () => {
  //     setIsFetching(true);
  //     try {
  //       const token = getAuthToken();

  //       const response = await fetchApi<Article>(`/api/articles/${articleId}`, {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       });

  //       if (response && response.data) {
  //         setFormData(response.data);
  //       }
  //     } catch (err: any) {
  //       setError(err.message);
  //       toast({
  //         title: "Lỗi",
  //         description: err.message,
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setIsFetching(false);
  //     }
  //   };

  //   if (articleId) {
  //     fetchArticleDetails();
  //   }
  // }, [articleId]);

  // Handler lưu thay đổi
  const handleSubmit = async (article: Article) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetchApi(`/api/admin/articles/edit/${articleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(article),
      });

      if (response?.success) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật thông tin bài viết",
          variant: "success",
        });
        router.push(`/admin/articles/${articleId}`); 
      }
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
