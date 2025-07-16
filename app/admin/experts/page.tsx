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
import { ExpertResponseDto } from "@/app/types/expert";

export const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

const EXPERT_STATUS_OPTIONS = [
  { value: 1, label: "Hoạt động" },
  { value: 0, label: "Không hoạt động" },
];

export default function AdminExpertsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const {
    data: experts,
    isLoading,
    error,
    pagination,
    searchParams,
    handleSearch,
    handleKeywordChange,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
  } = useDataSearch<ExpertResponseDto>({
    apiEndpoint: `${basePath}/api/expert/search`,
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

  // Define table columns
  const columns = [
    {
      key: "id",
      header: "ID",
      cell: (expert: ExpertResponseDto) => (
        <span className="font-medium">{expert.id}</span>
      ),
      className: "w-[50px]",
    },
    {
      key: "name",
      header: "Họ và tên",
      cell: (expert: ExpertResponseDto) => (
        <span className="font-medium">
          {expert.title} {expert.name}
        </span>
      ),
    },
    {
      key: "specialization",
      header: "Chuyên ngành",
      cell: (expert: ExpertResponseDto) => expert.specialization,
    },
    {
      key: "institution",
      header: "Cơ quan công tác",
      cell: (expert: ExpertResponseDto) => expert.institution,
    },
    {
      key: "contactEmail",
      header: "Email",
      cell: (expert: ExpertResponseDto) => expert.contactEmail || "-",
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (expert: ExpertResponseDto) => {
        const statusInfo = EXPERT_STATUS_OPTIONS.find(
          (status) => status.value === expert.status
        );
        const statusLabel = statusInfo ? statusInfo.label : "Không xác định";
        const statusVariant = expert.status === 1 ? "success" : "secondary";

        return <Badge variant={statusVariant}>{statusLabel}</Badge>;
      },
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      cell: (expert: ExpertResponseDto) => {
        const date = new Date(expert.createdAt || "");
        return date.toLocaleDateString("vi-VN");
      },
    },
    {
      key: "updatedAt",
      header: "Cập nhật",
      cell: (expert: ExpertResponseDto) => {
        const date = new Date(expert.updatedAt || "");
        return date.toLocaleDateString("vi-VN");
      },
    },
    {
      key: "actions",
      header: "Thao tác",
      cell: (expert: ExpertResponseDto) => (
        <ActionColumn
          item={expert}
          status={expert.status}
          onView={handleViewExpert}
          onEdit={handleEditExpert}
          onArchive={handleWait}
          onDelete={handleDeleteExpert}
          statusOptions={EXPERT_STATUS_OPTIONS}
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
        {EXPERT_STATUS_OPTIONS.map((status) => (
          <SelectItem key={status.value} value={status.value.toString()}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const handleAddExpert = () => {
    router.push("/admin/experts/create");
  };

  const handleViewExpert = (expertId: number) => {
    router.push(`/admin/experts/${expertId}`);
  };

  const handleEditExpert = (expertId: number) => {
    router.push(`/admin/experts/edit/${expertId}`);
  };

  const handleDeleteExpert = (expertId: number) => {
    handleWait();
  };

  // Handle row click
  const handleRowClick = (expert: ExpertResponseDto) => {
    handleViewExpert(expert.id);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý chuyên gia
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin các chuyên gia trong hệ thống
          </p>
        </div>
        <CustomActionButton
          onClick={handleAddExpert}
          text="Thêm chuyên gia"
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
        placeholder="Tìm kiếm chuyên gia..."
      />

      <DataTable
        selectable={false}
        onSelectionChange={() => {}}
        data={experts}
        columns={columns}
        isLoading={isLoading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="Không tìm thấy chuyên gia nào"
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
