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
import { PLANT_STATUS_OPTIONS } from "@/constant/plant";
import { handleWait } from "@/components/header";

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
        <div className="flex items-center justify-end space-x-2">
          {/* Show common actions directly */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => handleViewPlant(plant.id)}
            title="Xem chi tiết"
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Xem</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
            onClick={() => handleEditPlant(plant.id)}
            title="Chỉnh sửa"
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Sửa</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${
              plant.status === 2
                ? "text-green-600 hover:text-green-800 hover:bg-green-50 cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
            onClick={
              plant.status === 2
                ? () => handleApprovePlant(plant.id)
                : undefined
            }
            disabled={plant.status !== 2}
            title={
              plant.status === 2
                ? "Duyệt bài viết"
                : "Chỉ có thể duyệt bài viết đang chờ duyệt"
            }
          >
            <Check className="h-4 w-4" />
            <span className="sr-only">Duyệt</span>
          </Button>

          {/* Reject Action - Always show, disable when not pending */}
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 w-8 p-0 ${
              plant.status === 2
                ? "text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer"
                : "text-gray-300 cursor-not-allowed"
            }`}
            onClick={
              // plant.status === 2 ? () => handleRejectPlant(plant.id) : undefined
              () => handleWait()
            }
            disabled={plant.status !== 2}
            title={
              plant.status === 2
                ? "Từ chối bài viết"
                : "Chỉ có thể từ chối bài viết đang chờ duyệt"
            }
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Từ chối</span>
          </Button>

          {/* Archive Action - Show only for published status */}
          {plant.status === 3 && ( // Đã xuất bản
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-50"
              // onClick={() => handleArchivePlant(plant.id)}
              onClick={() => handleWait()}
              title="Lưu trữ"
            >
              <Archive className="h-4 w-4" />
              <span className="sr-only">Lưu trữ</span>
            </Button>
          )}

          {/* Dropdown for additional actions */}
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
              {plant.status !== 1 && (
                <DropdownMenuItem onClick={() => handleApprovePlant(plant.id)}>
                  <Eye className="mr-2 h-4 w-4" />
                  <span>Duyệt</span>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                onClick={() => handleDeletePlant(plant.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Xóa</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
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
        <div className="mt-4 sm:mt-0">
          <Button className="flex items-center gap-1" onClick={handleAddPlant}>
            <Plus className="h-4 w-4" />
            Thêm cây dược liệu
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
        placeholder="Tìm kiếm cây dược liệu..."
      />

      <DataTable
        selectable={true}
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
