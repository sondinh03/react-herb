"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Edit, Trash2, Eye, Plus } from "lucide-react";
import { SearchPanel } from "@/components/SearchPanel";
import { DataTable } from "@/components/DataTable";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { useDataSearch } from "@/hooks/useDataSearch";
import { fetchApi } from "@/lib/api-client";
import { HerbResponse } from "@/types/api";
import { ActiveCompoundForm, ActiveCompoundResponse } from "@/app/types/activeCompound";

interface ActiveCompound {
  id: number;
  name: string;
  slug: string;
  description: string | null;
}

export default function ActiveCompoundsPage() {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false); // Điều khiển hiển thị form
  const [editingId, setEditingId] = useState<number | null>(null); // ID của hoạt chất đang sửa
  const [form, setForm] = useState<ActiveCompoundForm>({ name: "", description: "" }); // Dữ liệu form
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái gửi API
  const nameInputRef = useRef<HTMLInputElement>(null); // Ref để focus trường name

  const {
    data: activeCompounds,
    isLoading,
    error,
    pagination,
    searchParams,
    handleSearch,
    handleKeywordChange,
    handlePageChange,
    handlePageSizeChange,
  } = useDataSearch<ActiveCompound>({
    apiEndpoint: `${process.env.NEXT_PUBLIC_BASE_PATH}/api/active-compounds/search`,
    initialParams: {
      pageIndex: 1,
      pageSize: 10,
    },
    requireAuth: false,
  });

  // Focus vào trường name khi form hiện
  useEffect(() => {
    if (isAdding && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isAdding]);

  // Định nghĩa cột bảng
  const columns = [
    {
      key: "id",
      header: "ID",
      cell: (compound: ActiveCompound) => (
        <span className="font-medium">{compound.id}</span>
      ),
      className: "w-[50px]",
    },
    {
      key: "name",
      header: "Tên hoạt chất",
      cell: (compound: ActiveCompound) => (
        <span className="font-medium">{compound.name}</span>
      ),
    },
    // {
    //   key: "slug",
    //   header: "Slug",
    //   cell: (compound: ActiveCompound) => (
    //     <span className="text-gray-600 font-mono text-sm">{compound.slug}</span>
    //   ),
    // },
    {
      key: "description",
      header: "Mô tả",
      cell: (compound: ActiveCompound) => compound.description || "-",
    },
    {
      key: "actions",
      header: "Thao tác",
      cell: (compound: ActiveCompound) => (
        <div className="flex items-center justify-end space-x-2">
          {/* <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => handleViewActiveCompound(compound.id)}
            disabled={true}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Xem</span>
          </Button> */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
            onClick={() => handleEditActiveCompound(compound.id)}
          >
            <Edit className="h-4 w-4" />
            <span className="sr-only">Sửa</span>
          </Button>
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
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 hover:text-red-800 hover:bg-red-50"
                onClick={() => handleDeleteActiveCompound(compound.id)}
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

  // Xử lý nhấn nút "Thêm" để hiện form
  const handleAddActiveCompound = () => {
    setForm({ name: "", description: "" }); // Reset form
    setEditingId(null); // Không phải chế độ sửa
    setIsAdding(true); // Hiện form
  };

  // Xử lý nhấn nút "Sửa" để hiện form với dữ liệu điền sẵn
  const handleEditActiveCompound = async (id: number) => {
    const compound = await fetchApi<HerbResponse<ActiveCompoundResponse>>(`/api/active-compounds/${id}`, {
      method: "GET",
    });

    if (compound) {
      setForm({
        name: compound.data.name,
        description: compound.data.description || "",
      });
      setEditingId(id);
      setIsAdding(true); // Hiện form
    }
  };

  // Xử lý xem chi tiết
  const handleViewActiveCompound = (compoundId: number) => {
    router.push(`/admin/active-compounds/${compoundId}`);
  };

  // Xử lý xóa hoạt chất
  const handleDeleteActiveCompound = async (id: number) => {
    try {
      await fetchApi<null>(`/api/active-compounds/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Thành công",
        description: "Đã xóa hoạt chất",
        variant: "success",
      });
      handleSearch(); // Làm mới bảng
    } catch (error: any) {
      console.error("Error deleting active compound:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa hoạt chất",
        variant: "destructive",
      });
    }
  };

  // Xử lý gửi form (thêm hoặc sửa)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true); // Vô hiệu hóa nút khi gửi
    try {
      if (editingId) {
        // API: Cập nhật hoạt chất
        const id = editingId;
        await fetchApi<HerbResponse<Boolean>>(`/api/active-compounds/edit/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast({
          title: "Thành công",
          description: "Đã cập nhật hoạt chất",
          variant: "success",
        });
      } else {
        // API: Thêm hoạt chất mới
        await fetchApi<HerbResponse<ActiveCompoundResponse>>(`/api/active-compounds/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast({
          title: "Thành công",
          description: "Đã thêm hoạt chất",
          variant: "success",
        });
      }
      // Ẩn form và reset trạng thái sau khi thành công
      setIsAdding(false);
      setEditingId(null);
      setForm({ name: "", description: "" });
      handleSearch(); // Làm mới bảng
    } catch (error: any) {
      console.error("Error saving active compound:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu hoạt chất",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false); // Kích hoạt lại nút
    }
  };

  // Xử lý hủy để ẩn form
  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({ name: "", description: "" });
  };

  // Xử lý click vào dòng để xem chi tiết
  const handleRowClick = (compound: ActiveCompound) => {
    handleViewActiveCompound(compound.id);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý hoạt chất
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin các hoạt chất trong hệ thống
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            className="flex items-center gap-1"
            onClick={handleAddActiveCompound}
          >
            <Plus className="h-4 w-4" />
            Thêm hoạt chất
          </Button>
        </div>
      </div>

      {/* Form chỉ hiện khi isAdding = true */}
      {isAdding && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Sửa hoạt chất" : "Thêm hoạt chất mới"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Tên hoạt chất
                </Label>
                <Input
                  id="name"
                  ref={nameInputRef}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nhập tên hoạt chất"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description" className="text-sm font-medium">
                  Mô tả
                </Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Nhập mô tả hoạt chất"
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1"
              >
                {editingId ? "Cập nhật" : "Thêm"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
            </div>
          </form>
        </div>
      )}

      <SearchPanel
        keyword={searchParams.keyword}
        onKeywordChange={handleKeywordChange}
        onSearch={handleSearch}
        showExport={true}
        placeholder="Tìm kiếm hoạt chất..."
      />

      <div className="mt-6">
        <DataTable
          data={activeCompounds}
          columns={columns}
          isLoading={isLoading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        //   onRowClick={handleRowClick}
          emptyMessage="Không tìm thấy hoạt chất nào"
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
    </div>
  );
}