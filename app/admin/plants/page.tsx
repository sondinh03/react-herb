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
import { PLANT_STATUS_OPTIONS } from "@/constants/plant";
import { handleWait } from "@/components/header";
import { CustomActionButton } from "@/components/CustomActionButton";
import { ActionColumn } from "@/components/ActionColumn";

interface Plant {
  id: number;
  name: string;
  scientificName: string;
  family: string;
  partsUsed: string;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPlantsPage() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const {
    data: plants,
    isLoading,
    error,
    pagination,
    searchParams,
    handleSearch,
    handleKeywordChange,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
  } = useDataSearch<Plant>({
    apiEndpoint: "/api/plants/search",
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

  const handleSelectionChange = (selected: Plant[]) => {
    setSelectedPlants(selected);
    console.log("Selected plants:", selected);
  };

  // Define table columns
  const columns = [
    {
      key: "id",
      header: "ID",
      cell: (plant: Plant) => <span className="font-medium">{plant.id}</span>,
      className: "w-[50px]",
    },
    {
      key: "name",
      header: "Tên cây",
      cell: (plant: Plant) => <span className="font-medium">{plant.name}</span>,
    },
    {
      key: "scientificName",
      header: "Tên khoa học",
      cell: (plant: Plant) => (
        <span className="italic">{plant.scientificName}</span>
      ),
    },
    {
      key: "family",
      header: "Họ",
      cell: (plant: Plant) => plant.family,
    },
    {
      key: "parts",
      header: "Bộ phận dùng",
      cell: (plant: Plant) => plant.partsUsed,
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (plant: Plant) => {
        let statusLabel = "Không xác định";
        let statusVariant:
          | "default"
          | "secondary"
          | "success"
          | "destructive"
          | "warning" = "default";

        // Tìm thông tin trạng thái từ PLANT_STATUS_OPTIONS
        const statusInfo = PLANT_STATUS_OPTIONS.find(
          (status) => status.value === plant.status
        );

        if (statusInfo) {
          statusLabel = statusInfo.label;

          // Xác định variant dựa trên loại trạng thái
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
    {
      key: "createdAt",
      header: "Ngày tạo",
      cell: (plant: Plant) => {
        const date = new Date(plant.createdAt);
        return date.toLocaleDateString("vi-VN");
      },
    },
    {
      key: "updatedAt",
      header: "Cập nhật",
      cell: (plant: Plant) => {
        const date = new Date(plant.updatedAt);
        return date.toLocaleDateString("vi-VN");
      },
    },
    {
      key: "actions",
      header: "Thao tác",
      cell: (plant: Plant) => (
        <ActionColumn
          item={plant}
          status={plant.status}
          onView={handleViewPlant}
          onEdit={handleEditPlant}
          onApprove={handleApprovePlant}
          onReject={handleWait}
          onArchive={handleWait}
          onDelete={handleDeletePlant}
          statusOptions={PLANT_STATUS_OPTIONS}
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
        {PLANT_STATUS_OPTIONS.map((status) => (
          <SelectItem key={status.value} value={status.value.toString()}>
            {status.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  const handleAddPlant = () => {
    router.push("/admin/plants/create");
  };

  const handleViewPlant = (plantId: number) => {
    router.push(`/admin/plants/${plantId}`);
  };

  const handleEditPlant = (plantId: number) => {
    router.push(`/admin/plants/edit/${plantId}`);
  };

  const handleDeletePlant = (plantId: number) => {
    handleWait();
  };

  const handleApprovePlant = (plantId: number) => {
    handleWait();
  };

  // Handle row click
  const handleRowClick = (plant: Plant) => {
    handleViewPlant(plant.id);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý cây dược liệu
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin các loại cây dược liệu trong hệ thống
          </p>
        </div>
        <CustomActionButton
          onClick={handleAddPlant}
          text="Thêm cây dược liệu"
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
        placeholder="Tìm kiếm cây dược liệu..."
      />

      <DataTable
        selectable={false}
        onSelectionChange={handleSelectionChange}
        data={plants}
        columns={columns}
        isLoading={isLoading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="Không tìm thấy cây dược liệu nào"
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
