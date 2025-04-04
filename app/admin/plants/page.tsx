"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Search, Plus, Filter, MoreHorizontal, Edit, Trash2, Eye, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Dummy data for plants
const plants = Array.from({ length: 10 }).map((_, i) => ({
  id: i + 1,
  name: `Cây dược liệu ${i + 1}`,
  scientificName: `Scientificus name ${i + 1}`,
  family: `Họ ${String.fromCharCode(65 + i)}`,
  parts: ["Lá", "Rễ", "Hoa"][i % 3],
  status: ["Đã duyệt", "Chờ duyệt", "Bản nháp"][i % 3],
  createdAt: new Date(2023, i % 12, (i + 1) * 2).toLocaleDateString("vi-VN"),
  updatedAt: new Date(2023, i % 12, (i + 1) * 2 + 5).toLocaleDateString("vi-VN"),
}))

export default function AdminPlantsPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Filter plants based on search query and status
  const filteredPlants = plants.filter((plant) => {
    const matchesSearch =
      plant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plant.scientificName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === "all" || plant.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý cây dược liệu</h1>
          <p className="mt-1 text-sm text-gray-500">Quản lý thông tin các loại cây dược liệu trong hệ thống</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link href="/admin/plants/create">
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Thêm cây dược liệu
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Tìm kiếm cây dược liệu..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Đã duyệt">Đã duyệt</SelectItem>
                <SelectItem value="Chờ duyệt">Chờ duyệt</SelectItem>
                <SelectItem value="Bản nháp">Bản nháp</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="flex items-center gap-1">
              <Filter className="h-4 w-4" />
              Lọc
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              Xuất
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">ID</TableHead>
                <TableHead>Tên cây</TableHead>
                <TableHead>Tên khoa học</TableHead>
                <TableHead>Họ</TableHead>
                <TableHead>Bộ phận dùng</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
                <TableHead>Ngày cập nhật</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-10 text-gray-500">
                    Không tìm thấy cây dược liệu nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredPlants.map((plant) => (
                  <TableRow key={plant.id}>
                    <TableCell className="font-medium">{plant.id}</TableCell>
                    <TableCell>{plant.name}</TableCell>
                    <TableCell className="italic">{plant.scientificName}</TableCell>
                    <TableCell>{plant.family}</TableCell>
                    <TableCell>{plant.parts}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          plant.status === "Đã duyệt"
                            ? "success"
                            : plant.status === "Chờ duyệt"
                              ? "warning"
                              : "secondary"
                        }
                      >
                        {plant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{plant.createdAt}</TableCell>
                    <TableCell>{plant.updatedAt}</TableCell>
                    <TableCell className="text-right">
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Xóa</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-gray-500">
            Hiển thị <span className="font-medium">1</span> đến <span className="font-medium">10</span> của{" "}
            <span className="font-medium">50</span> kết quả
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>
                  1
                </PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">4</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">5</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  )
}

