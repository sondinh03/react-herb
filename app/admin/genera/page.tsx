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
import { GeneraForm, GeneraResponse } from "@/app/types/genera";

interface Genus {
  id: number;
  name: string;
  description: string | null;
  familyId: number;
  familyName: string;
}

export default function GeneraPage() {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false); // Điều khiển hiển thị form
  const [editingId, setEditingId] = useState<number | null>(null); // ID của chi đang sửa
  const [form, setForm] = useState<GeneraForm>({ name: "", description: "", familyId: 0 }); // Dữ liệu form
  const [isSubmitting, setIsSubmitting] = useState(false); // Trạng thái gửi API
  const nameInputRef = useRef<HTMLInputElement>(null); // Ref để focus trường name

  const {
    data: genera,
    isLoading,
    error,
    pagination,
    searchParams,
    handleSearch,
    handleKeywordChange,
    handlePageChange,
    handlePageSizeChange,
  } = useDataSearch<Genus>({
    apiEndpoint: `${process.env.NEXT_PUBLIC_BASE_PATH}/api/genera/search`,
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
      cell: (genus: Genus) => (
        <span className="font-medium">{genus.id}</span>
      ),
      className: "w-[50px]",
    },
    {
      key: "name",
      header: "Tên chi thực vật",
      cell: (genus: Genus) => (
        <span className="font-medium">{genus.name}</span>
      ),
    },
    {
      key: "familyName",
      header: "Họ thực vật",
      cell: (genus: Genus) => genus.familyName || "-",
    },
    {
      key: "description",
      header: "Mô tả",
      cell: (genus: Genus) => genus.description || "-",
    },
    {
      key: "actions",
      header: "Thao tác",
      cell: (genus: Genus) => (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => handleViewGenus(genus.id)}
            disabled={true}
          >
            <Eye className="h-4 w-4" />
            <span className="sr-only">Xem</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-amber-600 hover:text-amber-800 hover:bg-amber-50"
            onClick={() => handleEditGenus(genus.id)}
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
                onClick={() => handleDeleteGenus(genus.id)}
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
  const handleAddGenus = () => {
    setForm({ name: "", description: "", familyId: 0 }); // Reset form
    setEditingId(null); // Không phải chế độ sửa
    setIsAdding(true); // Hiện form
  };

  // Xử lý nhấn nút "Sửa" để hiện form với dữ liệu điền sẵn
  const handleEditGenus = async (id: number) => {
    const genus = await fetchApi<HerbResponse<GeneraResponse>>(`/api/genera/${id}`, {
      method: "GET",
    });

    if (genus) {
      setForm({
        name: genus.data.name,
        description: genus.data.description || "",
        familyId: genus.data.familyId,
      });
      setEditingId(id);
      setIsAdding(true); // Hiện form
    }
  };

  // Xử lý xem chi tiết
  const handleViewGenus = (genusId: number) => {
    router.push(`/admin/genera/${genusId}`);
  };

  // Xử lý xóa chi thực vật
  const handleDeleteGenus = async (id: number) => {
    try {
      await fetchApi<null>(`/api/genera/${id}`, {
        method: "DELETE",
      });
      toast({
        title: "Thành công",
        description: "Đã xóa chi thực vật",
        variant: "success",
      });
      handleSearch(); // Làm mới bảng
    } catch (error: any) {
      console.error("Error deleting genus:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa chi thực vật",
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
        // API: Cập nhật chi thực vật
        const id = editingId;
        await fetchApi<HerbResponse<Boolean>>(`/api/genera/edit/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast({
          title: "Thành công",
          description: "Đã cập nhật chi thực vật",
          variant: "success",
        });
      } else {
        // API: Thêm chi thực vật mới
        await fetchApi<HerbResponse<GeneraResponse>>(`/api/genera/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast({
          title: "Thành công",
          description: "Đã thêm chi thực vật",
          variant: "success",
        });
      }
      // Ẩn form và reset trạng thái sau khi thành công
      setIsAdding(false);
      setEditingId(null);
      setForm({ name: "", description: "", familyId: 0 });
      handleSearch(); // Làm mới bảng
    } catch (error: any) {
      console.error("Error saving genus:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Không thể lưu chi thực vật",
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
    setForm({ name: "", description: "", familyId: 0 });
  };

  // Xử lý click vào dòng để xem chi tiết
  const handleRowClick = (genus: Genus) => {
    handleViewGenus(genus.id);
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Quản lý chi thực vật
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Quản lý thông tin các chi thực vật trong hệ thống
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            className="flex items-center gap-1"
            onClick={handleAddGenus}
          >
            <Plus className="h-4 w-4" />
            Thêm chi thực vật
          </Button>
        </div>
      </div>

      {/* Form chỉ hiện khi isAdding = true */}
      {isAdding && (
        <div className="mb-6 p-6 bg-white rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? "Sửa chi thực vật" : "Thêm chi thực vật mới"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Tên chi thực vật
                </Label>
                <Input
                  id="name"
                  ref={nameInputRef}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nhập tên chi thực vật"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="familyId" className="text-sm font-medium">
                  ID Họ thực vật
                </Label>
                <Input
                  id="familyId"
                  type="number"
                  value={form.familyId}
                  onChange={(e) => setForm({ ...form, familyId: parseInt(e.target.value) || 0 })}
                  placeholder="Nhập ID họ thực vật"
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
                  placeholder="Nhập mô tả chi thực vật"
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
        placeholder="Tìm kiếm chi thực vật..."
      />

      <div className="mt-6">
        <DataTable
          data={genera}
          columns={columns}
          isLoading={isLoading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          // onRowClick={handleRowClick}
          emptyMessage="Không tìm thấy chi thực vật nào"
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