import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, MapPin, GraduationCap, BookOpen, Award } from "lucide-react"

export default function ExpertsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Chuyên gia dược liệu</h1>
          <p className="mt-2 text-gray-600">Danh sách các chuyên gia trong lĩnh vực dược liệu</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Lọc
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input type="text" placeholder="Tìm kiếm chuyên gia..." className="pl-10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Chuyên ngành" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="duoc-lieu">Dược liệu học</SelectItem>
                <SelectItem value="duoc-ly">Dược lý học</SelectItem>
                <SelectItem value="hoa-duoc">Hóa dược</SelectItem>
                <SelectItem value="y-hoc-co-truyen">Y học cổ truyền</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name-asc">Tên A-Z</SelectItem>
                <SelectItem value="name-desc">Tên Z-A</SelectItem>
                <SelectItem value="newest">Mới nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Experts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {Array.from({ length: 9 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="flex justify-center pt-6">
              <div className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden">
                <img
                  src={`/placeholder.svg?height=128&width=128&text=GS.TS.${index + 1}`}
                  alt={`Chuyên gia ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-lg">GS.TS. Nguyễn Văn {String.fromCharCode(65 + index)}</CardTitle>
              <p className="text-sm text-gray-500">Chuyên gia Dược liệu học</p>
            </CardHeader>
            <CardContent className="pb-2 space-y-3">
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>Đại học Y Dược TP. Hồ Chí Minh</span>
              </div>
              <div className="flex items-center text-sm">
                <GraduationCap className="h-4 w-4 mr-2 text-gray-500" />
                <span>Tiến sĩ Dược học</span>
              </div>
              <div className="flex items-center text-sm">
                <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                <span>{10 + index} công trình nghiên cứu</span>
              </div>
              <div className="flex items-center text-sm">
                <Award className="h-4 w-4 mr-2 text-gray-500" />
                <span>Nhà nghiên cứu xuất sắc 202{index}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link href={`/experts/${index + 1}`}>
                <Button variant="outline">Xem chi tiết</Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center mt-12">
        <nav className="flex items-center space-x-2">
          <Button variant="outline" size="icon" disabled>
            <span className="sr-only">Trang trước</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </Button>
          <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">
            1
          </Button>
          <Button variant="outline" size="sm">
            2
          </Button>
          <Button variant="outline" size="sm">
            3
          </Button>
          <Button variant="outline" size="icon">
            <span className="sr-only">Trang sau</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </Button>
        </nav>
      </div>
    </div>
  )
}

