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

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleType: number;
  status: number;
  lastLogin: string;
  createdAt: string;
}

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
    apiEndpoint: "/api/admin/users/search",
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
          case 1:
            roleName = "Quản trị hệ thống";
            badgeVariant = "destructive";
            break;
          case 2:
            roleName = "Biên tập viên";
            badgeVariant = "secondary";
            break;
          default:
            roleName = "Người dùng thường";
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
          case 1:
            statusLabel = "Hoạt động";
            statusVariant = "success";
            break;
          case 2:
            statusLabel = "Không hoạt động";
            statusVariant = "secondary";
            break;
          case 3:
            statusLabel = "Đã chặn";
            statusVariant = "destructive";
            break;
          default:
            statusLabel = "Không xác định";
            statusVariant = "secondary";
        }

        return <Badge variant={statusVariant}>{statusLabel}</Badge>;
      },
    },
    /* 
    {
      key: "actions",
      header: "Thao tác",
      cell: (user: User) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              <span>Xem chi tiết</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Edit className="mr-2 h-4 w-4" />
              <span>Chỉnh sửa</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Mail className="mr-2 h-4 w-4" />
              <span>Gửi email</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Lock className="mr-2 h-4 w-4" />
              <span>Đổi mật khẩu</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              <span>Xóa</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      className: "text-right",
    },
    */
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
      variant: "info"
    });
    // Hiển thị hộp thoại xác nhận trước khi xóa
    // Thực hiện xóa nếu người dùng xác nhận
  };

  const handleSendEmail = (userId: number) => {
    toast({
      title: "Thông báo",
      description: "Chức năng đang trong quá trình phát triển",
      variant: "info"
    });
    // Mở form gửi email
  };

  const handleChangePassword = (userId: number) => {
    toast({
      title: "Thông báo",
      description: "Chức năng đang trong quá trình phát triển",
      variant: "info"
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
