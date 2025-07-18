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
  UserPlus,
  Lock,
  Mail,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useDataSearch } from "@/hooks/useDataSearch";
import { SearchPanel } from "@/components/SearchPanel";
import { DataTable } from "@/components/DataTable";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import {
  ROLE_TYPE_LABELS,
  ROLE_TYPES,
  STATUS_LABELS,
  STATUSES,
} from "@/constants/user";
import { User } from "@/app/types/user";
import { fetchApi } from "@/lib/api-client";
import { handleWait } from "@/components/header";

export default function AdminUsersPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("all");

  const {
    data: users,
    isLoading,
    error,
    pagination,
    searchParams,
    handleSearch,
    handleKeywordChange,
    handlePageChange,
    handlePageSizeChange,
    handleFilterChange,
  } = useDataSearch<User>({
    apiEndpoint: "/duoclieu/api/admin/users/search",
    initialParams: {
      pageIndex: 1,
      pageSize: 10,
    },
    requireAuth: true,
  });

  // Role change handler
  const handleRoleChange = (value: string) => {
    setSelectedRole(value);
    handleFilterChange("role", value !== "all" ? value : "");
  };

  // Define table columns
  const columns = [
    {
      key: "id",
      header: "ID",
      cell: (user: User) => <span className="font-medium">{user.id}</span>,
      className: "w-[50px]",
    },
    {
      key: "fullname",
      header: "Họ và tên",
      cell: (user: User) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium">{user.fullName}</p>
          </div>
        </div>
      ),
    },
    {
      key: "name",
      header: "Tên đăng nhập",
      cell: (user: User) => (
        <div className="flex items-center gap-3">
          <div>
            <p className="font-medium">{user.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      cell: (user: User) => user.email,
    },
    {
      key: "role",
      header: "Vai trò",
      cell: (user: User) => {
        let roleName = "";
        let badgeVariant: "default" | "secondary" | "destructive" = "default";

        switch (user.roleType) {
          case ROLE_TYPES.ADMIN:
            roleName = ROLE_TYPE_LABELS[ROLE_TYPES.ADMIN];
            badgeVariant = "destructive";
            break;
          case ROLE_TYPES.EDITOR:
            roleName = ROLE_TYPE_LABELS[ROLE_TYPES.EDITOR];
            badgeVariant = "secondary";
            break;
          case ROLE_TYPES.EXPERT:
            roleName = ROLE_TYPE_LABELS[ROLE_TYPES.EXPERT];
            badgeVariant = "destructive";
            break;
          default:
            roleName = ROLE_TYPE_LABELS[ROLE_TYPES.USER];
            badgeVariant = "default";
        }

        return <Badge variant={badgeVariant}>{roleName}</Badge>;
      },
    },
    {
      key: "status",
      header: "Trạng thái",
      cell: (user: User) => {
        let statusLabel = "";
        let statusVariant: "default" | "secondary" | "destructive" | "success" =
          "default";

        switch (user.status) {
          case STATUSES.ACTIVE:
            statusLabel = STATUS_LABELS[STATUSES.ACTIVE];
            statusVariant = "success";
            break;
          case STATUSES.INACTIVE:
            statusLabel = STATUS_LABELS[STATUSES.INACTIVE];
            statusVariant = "secondary";
            break;
          case STATUSES.BANNED:
            statusLabel = STATUS_LABELS[STATUSES.BANNED];
            statusVariant = "destructive";
            break;
          case STATUSES.PENDING:
            statusLabel = STATUS_LABELS[STATUSES.PENDING];
            statusVariant = "destructive";
            break;
          default:
            statusLabel = STATUS_LABELS[STATUSES.DELETED];
            statusVariant = "secondary";
        }

        return <Badge variant={statusVariant}>{statusLabel}</Badge>;
      },
    },
    {
      key: "createdAt",
      header: "Ngày tạo",
      cell: (user: User) => {
        const date = new Date(user.createdAt);
        return date.toLocaleDateString("vi-VN");
      },
      className: "w-[50px]",
    },
    {
      key: "actions",
      header: "Thao tác",
      cell: (user: User) => (
        <div className="flex items-center justify-end space-x-2">
          {/* Hiển thị các nút thao tác phổ biến trực tiếp */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => handleViewUser(user.id)}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Xem</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
            onClick={() => handleEditUser(user.id)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Sửa</span>
          </Button>

          {/* Dropdown cho các thao tác phụ */}
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
              <DropdownMenuItem onClick={() => handleSendEmail(user.id)}>
                <Mail className="mr-2 h-4 w-4" />
                <span>Duyệt</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSendEmail(user.id)}>
                <Mail className="mr-2 h-4 w-4" />
                <span>Gửi email</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleChangePassword(user.id)}>
                <Lock className="mr-2 h-4 w-4" />
                <span>Đổi mật khẩu</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                onClick={() => handleDeleteUser(user.id)}
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
    <Select value={selectedRole} onValueChange={handleRoleChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Vai trò" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tất cả vai trò</SelectItem>
        <SelectItem value="Admin">Admin</SelectItem>
        <SelectItem value="Editor">Editor</SelectItem>
        <SelectItem value="User">User</SelectItem>
      </SelectContent>
    </Select>
  );

  const handleAddUser = () => {
    router.push("/admin/users/create");
  };

  const handleViewUser = (userId: number) => {
    router.push(`/admin/users/${userId}`);
  };

  const handleEditUser = (userId: number) => {
    router.push(`/admin/users/edit/${userId}`);
  };

  const handleDeleteUser = (userId: number) => {
    toast({
      title: "Chức năng chưa hoàn thiện",
      description: "Chức năng đang trong quá trình phát triển",
      variant: "info",
    });
    // Hiển thị hộp thoại xác nhận trước khi xóa
    // Thực hiện xóa nếu người dùng xác nhận
  };

  const handleSendEmail = (userId: number) => {
    handleWait();
  };

  const handleChangePassword = (userId: number) => {
    toast({
      title: "Thông báo",
      description: "Chức năng đang trong quá trình phát triển",
      variant: "info",
    });
    // Mở form đổi mật khẩu
  };

  // Thêm hàm xử lý khi click vào hàng
  const handleRowClick = (user: User) => {
    handleViewUser(user.id);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý tài khoản người dùng trong hệ thống
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button className="flex items-center gap-1" onClick={handleAddUser}>
            <UserPlus className="h-4 w-4" />
            Thêm người dùng
          </Button>
        </div>
      </div>

      <SearchPanel
        keyword={searchParams.keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleSearch}
        filterComponents={filterComponents}
        showExport={true}
        placeholder="Tìm kiếm người dùng..."
      />

      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        error={error}
        pagination={pagination}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        emptyMessage="Không tìm thấy người dùng nào"
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
