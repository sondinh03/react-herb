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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDataSearch } from "@/hooks/useDataSearch";
import { SearchPanel } from "@/components/SearchPanel";
import { DataTable } from "@/components/DataTable";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";

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
      cell: (plant: Plant) => (
        <span className="font-medium">{plant.name}</span>
      ),
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
        let statusLabel = "";
        let statusVariant: "default" | "secondary" | "success" | "warning" = "default";

        switch (plant.status) {
          case 1:
            statusLabel = "Bản nháp";
            statusVariant = "warning";
            break;
          case 2:
            statusLabel = "Đã xuất bản";
            statusVariant = "success";
            break;
          case 3:
            statusLabel = "Bản lưu trữ";
            statusVariant = "secondary";
            break;
          default:
            statusLabel = "Không xác định";
            statusVariant = "default";
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
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Xem</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
            onClick={() => handleEditPlant(plant.id)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Sửa</span>
          </Button>

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
        <SelectItem value="1">Đã duyệt</SelectItem>
        <SelectItem value="2">Chờ duyệt</SelectItem>
        <SelectItem value="3">Bản nháp</SelectItem>
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
    toast({
      title: "Chức năng chưa hoàn thiện",
      description: "Chức năng xóa đang trong quá trình phát triển",
      variant: "info"
    });
    // Show confirmation dialog before deletion
    // Perform deletion if confirmed
  };

  const handleApprovePlant = (plantId: number) => {
    toast({
      title: "Thông báo",
      description: "Chức năng duyệt đang trong quá trình phát triển",
      variant: "info"
    });
    // Implement plant approval logic
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
        placeholder="Tìm kiếm cây dược liệu..."
      />

      <DataTable
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