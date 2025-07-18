"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Share2,
  Printer,
  Download,
  BookOpen,
  User,
  Calendar,
  Image as ImageIcon,
  MessageSquare,
  Clock,
  Eye,
  ArrowLeft,
  Heart,
  Bookmark,
  Tag,
} from "lucide-react";
import { use, useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { fetchApi } from "@/lib/api-client";
import { HerbResponse } from "@/types/api";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/spinner";
import { BackButton } from "@/components/BackButton";
import { handleWait } from "@/components/header";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MediaViewer from "@/components/media/media-viewer";

// Định nghĩa interface Article
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
  featuredImage: string | null;
}

// Định nghĩa interface Comment
interface Comment {
  id: number;
  content: string;
  createdBy: string;
  createdAt: string;
}

export default function ArticleDetailPage({
  params: paramsPromise,
}: {
  params: Promise<{ id: string }>;
}) {
  const params = use(paramsPromise);
  const articleId = params.id;
  const [article, setArticle] = useState<Article | null>(null);
  const [isArticleLoading, setIsArticleLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [isRelatedArticlesLoading, setIsRelatedArticlesLoading] =
    useState(true);
  const [relatedArticlesError, setRelatedArticlesError] = useState<
    string | null
  >(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch article details
  const fetchArticleDetails = async () => {
    setIsArticleLoading(true);
    setError(null);

    try {
      const result = await fetchApi<Article>(`/api/articles/${articleId}`);
      setArticle(result.data || null);
    } catch (err: any) {
      setError(err.message || "Không thể lấy thông tin bài viết");
      toast({
        title: "Lỗi",
        description: err.message || "Không thể lấy thông tin bài viết",
        variant: "destructive",
      });
    } finally {
      setIsArticleLoading(false);
    }
  };

  // Fetch related articles
  const fetchRelatedArticles = async () => {
    if (!article?.diseaseId) {
      setRelatedArticles([]);
      setIsRelatedArticlesLoading(false);
      return;
    }

    setIsRelatedArticlesLoading(true);
    setRelatedArticlesError(null);

    try {
      const queryParams = new URLSearchParams({
        pageIndex: "1",
        pageSize: "3",
        [`filters[diseaseId]`]: article.diseaseId.toString(),
        sortField: "views",
        sortDirection: "desc",
      });

      const result = await fetchApi<HerbResponse<Article[]>>(
        `/api/articles/search?${queryParams}`
      );

      if (result.code === 200 || result.success) {
        const filteredArticles = result.data.content.filter(
          (a) => a.id.toString() !== articleId
        );
        setRelatedArticles(filteredArticles);
      } else {
        throw new Error(result.message || "Không thể tải bài viết liên quan");
      }
    } catch (error: any) {
      setRelatedArticlesError(
        error.message || "Không thể tải bài viết liên quan"
      );
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải bài viết liên quan",
        variant: "destructive",
      });
    } finally {
      setIsRelatedArticlesLoading(false);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    setIsCommentsLoading(true);
    setCommentsError(null);

    try {
      const result = await fetchApi<Comment[]>(
        `/api/articles/${articleId}/comments`
      );
      setComments(result.data || []);
    } catch (error: any) {
      setCommentsError(error.message || "Không thể tải bình luận");
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tải bình luận",
        variant: "destructive",
      });
    } finally {
      setIsCommentsLoading(false);
    }
  };

  // Handle submit comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast({
        title: "Lỗi",
        description: "Nội dung bình luận không được để trống",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingComment(true);
    try {
      const result = await fetchApi(`/api/articles/${articleId}/comments`, {
        method: "POST",
        body: JSON.stringify({ content: newComment }),
      });

      if (result.code === 200) {
        toast({
          title: "Thành công",
          description: "Bình luận đã được gửi thành công!",
        });
        setNewComment("");
        fetchComments();
      } else {
        throw new Error(result.message || "Không thể gửi bình luận");
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể gửi bình luận",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  useEffect(() => {
    fetchArticleDetails();
  }, [articleId]);

  useEffect(() => {
    if (article) {
      fetchRelatedArticles();
      if (article.allowComments) {
        fetchComments();
      }
    }
  }, [article, articleId]);

  if (isArticleLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <div className="text-red-600 text-lg mb-4">
            {error || "Không thể tải thông tin bài viết"}
          </div>
          <Link href="/articles">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackButton href="/articles"></BackButton>

          {/* Article Header */}
          <div className="space-y-6">
            {/* Featured Badge */}
            {article.isFeatured && (
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Bài viết nổi bật
              </Badge>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {article.title}
            </h1>

            {/* Excerpt */}
            <p className="text-xl text-gray-600 leading-relaxed">
              {article.excerpt}
            </p>

            {/* Meta Info */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="font-medium text-gray-900">
                  {article.createdBy}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {article.publishedAt
                    ? new Date(article.publishedAt).toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "Chưa xuất bản"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{article.views.toLocaleString()} lượt xem</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>5 phút đọc</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={handleWait}>
                  <Heart className="h-4 w-4 mr-2" />
                  Yêu thích
                </Button>
                <Button variant="outline" size="sm" onClick={handleWait}>
                  <Bookmark className="h-4 w-4 mr-2" />
                  Lưu
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleWait}>
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleWait}>
                  <Printer className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={handleWait}>
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          {/* Article Content */}
          <div className="lg:col-span-3">
            {/* Article Body */}
            <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
              <div
                className="prose prose-lg prose-gray max-w-none prose-headings:text-gray-900 prose-a:text-green-600 prose-strong:text-gray-900"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </div>

            {/* Comments Section */}
            {article.allowComments && (
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <MessageSquare className="h-6 w-6 mr-3 text-green-600" />
                  Bình luận ({comments.length})
                </h2>

                {/* Comment Form */}
                <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">
                    Để lại bình luận
                  </h3>
                  <form onSubmit={handleSubmitComment} className="space-y-4">
                    <Textarea
                      placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="w-full resize-none border-gray-300 focus:border-green-500 focus:ring-green-500"
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSubmittingComment || !newComment.trim()}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {isSubmittingComment ? "Đang gửi..." : "Gửi bình luận"}
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Comments List */}
                {isCommentsLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={index}
                        className="p-4 bg-gray-50 rounded-lg animate-pulse"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-6">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-green-100 text-green-700">
                            {comment.createdBy.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">
                                {comment.createdBy}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(comment.createdAt).toLocaleDateString(
                                  "vi-VN"
                                )}
                              </span>
                            </div>
                            <p className="text-gray-700 leading-relaxed">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-8">
              {/* Author Card */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Tác giả</h3>
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-green-100 text-green-700">
                      {article.createdBy.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{article.createdBy}</p>
                    <p className="text-sm text-gray-500">Tác giả</p>
                  </div>
                </div>
              </div>

              {/* Article Stats */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Thống kê</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Lượt xem</span>
                    <span className="font-medium">
                      {article.views.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Bình luận</span>
                    <span className="font-medium">{comments.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ngày xuất bản</span>
                    <span className="font-medium text-sm">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString(
                            "vi-VN"
                          )
                        : "Chưa xuất bản"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Related Articles */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-semibold mb-4">Bài viết liên quan</h3>
                {isRelatedArticlesLoading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="animate-pulse">
                        <div className="h-20 bg-gray-200 rounded-lg mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : relatedArticles.length > 0 ? (
                  <div className="space-y-4">
                    {relatedArticles.map((relatedArticle) => (
                      <Link
                        key={relatedArticle.id}
                        href={`/articles/${relatedArticle.id}`}
                        className="block group"
                      >
                        <div className="flex gap-3">
                          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {relatedArticle.featuredImage ? (
                              <img
                                src={relatedArticle.featuredImage}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                alt={relatedArticle.title}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-green-600 transition-colors">
                              {relatedArticle.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {relatedArticle.views.toLocaleString()} lượt xem
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Không có bài viết liên quan
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
