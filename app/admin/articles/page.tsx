"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Archive,
  X,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/DataTable";
import { SearchPanel } from "@/components/SearchPanel";
import { handleWait } from "@/components/header";
import { toast } from "@/hooks/use-toast";
import { useDataSearch } from "@/hooks/useDataSearch";
import { useRouter } from "next/navigation";
import { ActionColumn } from "@/components/ActionColumn";
import { StatusFilter } from "@/components/StatusFilter";
import { StatusBadge } from "@/components/StatusBadge";
import { ARTICLE_STATUS_OPTIONS } from "@/constant/article";

interface Article {
  id: number;
  title: string;
  excerpt: string;
  authorId: number;
  createdBy: string;
  status: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminArticlesPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedArticles, setSelectedArticles] = useState<Article[]>([]);

  const {
    data: articles,
    isLoading,
    error,
    pagination,
    searchParams,
    handleSearch,
    handleKeywordChange,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
  } = useDataSearch<Article>({
    apiEndpoint: "/api/articles/search",
    initialParams: {
      pageIndex: 1,
      pageSize: 10,
    },
    requireAuth: true,
  });

  // Status change handler
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    handleFilterChange("status", value !== "all" ? value : "");
  };

  const handleSelectionChange = (selected: Article[]) => {
    setSelectedArticles(selected);
    console.log("Selected articles:", selected);
  };

  // Define table columns
  const columns = [
    {
      key: "id",
      header: "ID",
      cell: (article: Article) => (
        <span className="font-medium">{article.id}</span>
      ),
      className: "w-[50px]",
    },
    {
      key: "title",
      header: "Tiêu đề",
      cell: (article: Article) => (
        <span className="font-medium">{article.title}</span>
      ),
      className: "w-[200px]",
    },
    {
      key: "excerpt",
      header: "Tóm tắt",
      cell: (article: Article) => (
        <span className="line-clamp-2">{article.excerpt}</span>
      ),
    },
    {
      key: "createdBy",
      header: "Tác giả",
      cell: (article: Article) => article.createdBy,
    },
    {
      key: "views",
      header: "Lượt xem",
      cell: (article: Article) => article.views,
    },
    /*
    {
      key: "status",
      header: "Trạng thái",
      cell: (article: Article) => {
        let statusLabel = "Không xác định";
        let statusVariant:
          | "default"
          | "secondary"
          | "success"
          | "destructive"
          | "warning" = "default";

        const statusInfo = ARTICLE_STATUS_OPTIONS.find(
          (status) => status.value === article.status
        );

        if (statusInfo) {
          statusLabel = statusInfo.label;
          switch (statusInfo.value) {
            case 1: // Bản nháp
              statusVariant = "warning";
              break;
            case 2: // Chờ duyệt
              statusVariant = "secondary";
              break;
            case 3: // Đã xuất bản
              statusVariant = "success";
              break;
            case 4: // Lưu trữ
              statusVariant = "secondary";
              break;
            case 5: // Từ chối
              statusVariant = "destructive";
              break;
            default:
              statusVariant = "default";
          }
        }

        return <Badge variant={statusVariant}>{statusLabel}</Badge>;
      },
    },
    */
    {
      key: "status",
      header: "Trạng thái",
      cell: (article: Article) => (
        <StatusBadge status={article.status} options={ARTICLE_STATUS_OPTIONS} />
      ),
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      cell: (article: Article) => {
        const date = new Date(article.createdAt);
        return date.toLocaleDateString("vi-VN");
      },
    },
    {
      key: "updatedAt",
      header: "Cập nhật",
      cell: (article: Article) => {
        const date = new Date(article.updatedAt);
        return date.toLocaleDateString("vi-VN");
      },
    },
    {
      key: "actions",
      header: "Thao tác",
      cell: (article: Article) => (
        /*
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => handleViewArticle(article.id)}
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Xem</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
            onClick={() => handleEditArticle(article.id)}
            title="Chỉnh sửa"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Sửa</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${
              article.status === 2
                ? "text-green-600 hover:text-green-800 hover:bg-green-50 cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
            onClick={
              article.status === 2
                ? () => handleApproveArticle(article.id)
                : undefined
            }
            disabled={article.status !== 2}
            title={
              article.status === 2
                ? "Duyệt bài viết"
                : "Chỉ có thể duyệt bài viết đang chờ duyệt"
            }
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Duyệt</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${
              article.status === 2
                ? "text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
            onClick={() => handleWait()}
            disabled={article.status !== 2}
            title={
              article.status === 2
                ? "Từ chối bài viết"
                : "Chỉ có thể từ chối bài viết đang chờ duyệt"
            }
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Từ chối</span>
          </Button>

          {article.status === 3 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              onClick={() => handleWait()}
              title="Lưu trữ"
            >
              <Archive className="h-4 w-4" />
              <span className="sr-only">Lưu trữ</span>
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
              >
                <span className="sr-only">Thao tác khác</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Thao tác khác</DropdownMenuLabel>
              {article.status !== 1 && (
                <DropdownMenuItem onClick={() => handleApproveArticle(article.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Duyệt</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                onClick={() => handleDeleteArticle(article.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Xóa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        */
        <ActionColumn
          item={article}
          status={article.status}
          onView={handleViewArticle}
          onEdit={handleEditArticle}
          onApprove={handleApproveArticle}
          onReject={handleWait}
          onArchive={handleWait}
          onDelete={handleDeleteArticle}
          statusOptions={ARTICLE_STATUS_OPTIONS}
        />
      ),
      className: "w-[120px]",
    },
  ];

  /*
  const filterComponents = (
    <Select value={selectedStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Trạng thái" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả trạng thái</SelectItem>
        {ARTICLE_STATUS_OPTIONS.map((status) => (
          <SelectItem key={status.value} value={status.value.toString()}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
  */

  const filterComponents = (
    <StatusFilter
      value={selectedStatus}
      onChange={handleStatusChange}
      options={ARTICLE_STATUS_OPTIONS}
    />
  );

  const handleAddArticle = () => {
    router.push("/admin/articles/create");
  };

  const handleViewArticle = (articleId: number) => {
    router.push(`/admin/articles/${articleId}`);
  };

  const handleEditArticle = (articleId: number) => {
    router.push(`/admin/articles/edit/${articleId}`);
  };

  const handleDeleteArticle = (articleId: number) => {
    toast({
      title: "Chức năng chưa hoàn thiện",
      description: "Chức năng xóa đang trong quá trình phát triển",
      variant: "info",
    });
  };

  const handleApproveArticle = (articleId: number) => {
    toast({
      title: "Thông báo",
      description: "Chức năng duyệt đang trong quá trình phát triển",
      variant: "info",
    });
  };

  const handleRowClick = (article: Article) => {
    handleViewArticle(article.id);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý bài viết</h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý các bài viết về cây dược liệu trong hệ thống
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            className="flex items-center gap-1"
            onClick={handleAddArticle}
          >
            <Plus className="h-4 w-4" />
            Thêm bài viết
          </Button>
        </div>
      </div>

      <SearchPanel
        keyword={searchParams.keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleSearch}
        filterComponents={filterComponents}
        showExport={true}
        onExport={handleWait}
        placeholder="Tìm kiếm bài viết..."
      />

      <DataTable
        selectable={true}
        onSelectionChange={handleSelectionChange}
        data={articles}
        columns={columns}
        isLoading={isLoading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="Không tìm thấy bài viết nào"
        labels={{
          previous: "Trước",
          next: "Sau",
          showing: "Đang hiển thị",
          of: "trong",
          results: "kết quả",
          display: "Số lượng",
        }}
      />
    </div>
  );
}
