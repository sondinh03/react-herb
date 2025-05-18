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
import { Family, FamilyForm } from "@/app/types/families";

interface FamilyResponse<T> {
  data: T;
}

export default function FamiliesPage() {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FamilyForm>({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);

  const {
    data: families,
    isLoading,
    error,
    pagination,
    searchParams,
    handleSearch,
    handleKeywordChange,
    handlePageChange,
    handlePageSizeChange,
  } = useDataSearch<Family>({
    apiEndpoint: "/api/families/search",
    initialParams: {
      pageIndex: 1,
      pageSize: 20,
    },
    requireAuth: false,
  });

  useEffect(() => {
    if (isAdding && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [isAdding]);

  const columns = [
    {
      key: "id",
      header: "ID",
      cell: (family: Family) => (
        <span className="font-medium">{family.id}</span>
      ),
      className: "w-[50px]",
    },
    {
      key: "name",
      header: "Tên họ thực vật",
      cell: (family: Family) => (
        <span className="font-medium">{family.name}</span>
      ),
    },
    {
      key: "description",
      header: "Mô tả",
      cell: (family: Family) => family.description || "-",
    },
    {
      key: "actions",
      header: "Thao tác",
      cell: (family: Family) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => handleViewFamily(family.id)}
            disabled={true}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Xem</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
            onClick={() => handleEditFamily(family.id)}
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
                onClick={() => handleDeleteFamily(family.id)}
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

  const handleAddFamily = () => {
    setForm({ name: "", description: "" });
    setEditingId(null);
    setIsAdding(true);
  };

  const handleEditFamily = async (id: number) => {
    const family = await fetchApi<FamilyResponse<Family>>(`/api/families/${id}`, {
      method: "GET",
    });

    if (family) {
      setForm({
        name: family.data.name,
        description: family.data.description || "",
      });
      setEditingId(id);
      setIsAdding(true);
    }
  };

  const handleViewFamily = (familyId: number) => {
    router.push(`/admin/families/${familyId}`);
  };

  const handleDeleteFamily = async (id: number) => {
    try {
      await fetchApi<null>(`/api/families/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Thành công",
        description: "Đã xóa họ thực vật",
        variant: "success",
      });
      handleSearch();
    } catch (error: any) {
      console.error("Error deleting family:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa họ thực vật",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        const id = editingId;
        await fetchApi<FamilyResponse<boolean>>(`/api/families/edit/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast({
          title: "Thành công",
          description: "Đã cập nhật họ thực vật",
          variant: "success",
        });
      } else {
        await fetchApi<FamilyResponse<Family>>(`/api/families/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast({
          title: "Thành công",
          description: "Đã thêm họ thực vật",
          variant: "success",
        });
      }
      setIsAdding(false);
      setEditingId(null);
      setForm({ name: "", description: "" });
      handleSearch();
    } catch (error: any) {
      console.error("Error saving family:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu họ thực vật",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setForm({ name: "", description: "" });
  };

  const handleRowClick = (family: Family) => {
    handleViewFamily(family.id);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý họ thực vật
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin các họ thực vật trong hệ thống
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            className="flex items-center gap-1"
            onClick={handleAddFamily}
          >
            <Plus className="h-4 w-4" />
            Thêm họ thực vật
          </Button>
        </div>
      </div>

      {isAdding && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Sửa họ thực vật" : "Thêm họ thực vật mới"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Tên họ thực vật
                </Label>
                <Input
                  id="name"
                  ref={nameInputRef}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nhập tên họ thực vật"
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
                  placeholder="Nhập mô tả họ thực vật"
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
        placeholder="Tìm kiếm họ thực vật..."
      />

      <div className="mt-6">
        <DataTable
          data={families}
          columns={columns}
          isLoading={isLoading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onRowClick={handleRowClick}
          emptyMessage="Không tìm thấy họ thực vật nào"
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