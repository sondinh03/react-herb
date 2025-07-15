"use client";

import { useEffect, useState } from "react";
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
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Download,
  Plus,
  Archive,
  X,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDataSearch } from "@/hooks/useDataSearch";
import { SearchPanel } from "@/components/SearchPanel";
import { DataTable } from "@/components/DataTable";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { handleWait } from "@/components/header";
import { CustomActionButton } from "@/components/CustomActionButton";
import { ActionColumn } from "@/components/ActionColumn";

interface Research {
  id: number;
  title: string;
  slug: string;
  abstractText: string;
  content: string;
  authors: string;
  institution: string;
  publishedYear: number;
  journal: string;
  field: string;
  status: number;
  views: number;
  plants: Plant[];
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
}

interface Plant {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

// Giả định các trạng thái nghiên cứu
export const RESEARCH_STATUS_OPTIONS = [
  { value: 1, label: "Bản nháp", variant: "warning" },
  { value: 2, label: "Chờ duyệt", variant: "secondary" },
  { value: 3, label: "Đã xuất bản", variant: "success" },
  { value: 4, label: "Lưu trữ", variant: "secondary" },
  { value: 5, label: "Từ chối", variant: "destructive" },
];

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

export default function AdminResearchPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const {
    data: researches,
    isLoading,
    error,
    pagination,
    searchParams,
    handleSearch,
    handleKeywordChange,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
  } = useDataSearch<Research>({
    apiEndpoint: `${basePath}/api/research/search`,
    initialParams: {
      pageIndex: 1,
      pageSize: 12,
    },
    requireAuth: true,
  });

  // Status change handler
  const handleStatusChange = (value: string) => {
    setSelectedStatus(value);
    handleFilterChange("status", value !== "all" ? value : "");
  };

  const handleSelectionChange = (selected: Research[]) => {
    console.log("Selected researches:", selected);
  };

  // Define table columns
  const columns = [
    {
      key: "id",
      header: "ID",
      cell: (research: Research) => <span className="font-medium">{research.id}</span>,
      className: "w-[50px]",
    },
    {
      key: "title",
      header: "Tiêu đề",
      cell: (research: Research) => <span className="font-medium">{research.title}</span>,
    },
    {
      key: "authors",
      header: "Tác giả",
      cell: (research: Research) => research.authors || "Chưa có",
    },
    {
      key: "publishedYear",
      header: "Năm xuất bản",
      cell: (research: Research) => research.publishedYear || "Chưa có",
    },
    {
      key: "journal",
      header: "Tạp chí",
      cell: (research: Research) => research.journal || "Chưa có",
    },
    {
      key: "field",
      header: "Lĩnh vực",
      cell: (research: Research) => research.field || "Chưa có",
    },
    {
      key: "views",
      header: "Lượt xem",
      cell: (research: Research) => research.views || 0,
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (research: Research) => {
        let statusLabel = "Không xác định";
        let statusVariant: "default" | "secondary" | "success" | "destructive" | "warning" = "default";

        const statusInfo = RESEARCH_STATUS_OPTIONS.find(
          (status) => status.value === research.status
        );

        if (statusInfo) {
          statusLabel = statusInfo.label;
          statusVariant = statusInfo.variant as any;
        }

        return <Badge variant={statusVariant}>{statusLabel}</Badge>;
      },
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      cell: (research: Research) => {
        const date = new Date(research.createdAt);
        return date.toLocaleDateString("vi-VN");
      },
    },
    {
      key: "updatedAt",
      header: "Cập nhật",
      cell: (research: Research) => {
        const date = new Date(research.updatedAt);
        return date.toLocaleDateString("vi-VN");
      },
    },
    {
      key: "actions",
      header: "Thao tác",
      cell: (research: Research) => (
        <ActionColumn
          item={research}
          status={research.status}
          onView={handleViewResearch}
          onEdit={handleEditResearch}
          onApprove={handleApproveResearch}
          onReject={handleWait}
          onArchive={handleWait}
          onDelete={handleDeleteResearch}
          statusOptions={RESEARCH_STATUS_OPTIONS}
        />
      ),
      className: "w-[120px]",
    },
  ];

  const filterComponents = (
    <Select value={selectedStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Trạng thái" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả trạng thái</SelectItem>
        {RESEARCH_STATUS_OPTIONS.map((status) => (
          <SelectItem key={status.value} value={status.value.toString()}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const handleAddResearch = () => {
    router.push("/admin/research/create");
  };

  const handleViewResearch = (researchId: number) => {
    router.push(`/admin/research/${researchId}`);
  };

  const handleEditResearch = (researchId: number) => {
    router.push(`/admin/research/edit/${researchId}`);
  };

  const handleDeleteResearch = (researchId: number) => {
    handleWait();
  };

  const handleApproveResearch = (researchId: number) => {
    handleWait();
  };

  // Handle row click
  const handleRowClick = (research: Research) => {
    handleViewResearch(research.id);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý nghiên cứu khoa học
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin các nghiên cứu khoa học trong hệ thống
          </p>
        </div>
        <CustomActionButton
          onClick={handleAddResearch}
          text="Thêm nghiên cứu"
          icon={<Plus className="h-4 w-4" />}
          variant="add"
        />
      </div>

      <SearchPanel
        keyword={searchParams.keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleSearch}
        filterComponents={filterComponents}
        showExport={true}
        onExport={handleWait}
        placeholder="Tìm kiếm nghiên cứu..."
      />

      <DataTable
        selectable={false}
        onSelectionChange={handleSelectionChange}
        data={researches}
        columns={columns}
        isLoading={isLoading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="Không tìm thấy nghiên cứu nào"
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