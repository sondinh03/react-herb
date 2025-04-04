import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Calendar, User, FileText, BookOpen, Tag } from "lucide-react"

export default function ResearchPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nghiên cứu khoa học</h1>
          <p className="mt-2 text-gray-600">Các đề tài nghiên cứu về cây dược liệu</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Lọc
          </Button>
          <Link href="/admin/research/create">
            <Button>Thêm nghiên cứu</Button>
          </Link>
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
              <Input type="text" placeholder="Tìm kiếm nghiên cứu..." className="pl-10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Lĩnh vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="duoc-ly">Dược lý</SelectItem>
                <SelectItem value="hoa-duoc">Hóa dược</SelectItem>
                <SelectItem value="thuc-vat">Thực vật học</SelectItem>
                <SelectItem value="y-hoc">Y học</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Năm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
                <SelectItem value="2021">2021</SelectItem>
                <SelectItem value="2020">2020</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Research List */}
      <div className="space-y-6 mb-12">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="md:w-3/4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                      {["Dược lý", "Hóa dược", "Thực vật học", "Y học"][index % 4]}
                    </span>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="h-4 w-4 mr-1" />
                      {`${2020 + (index % 4)}`}
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-3">
                    <Link href={`/research/${index + 1}`} className="hover:text-primary">
                      Nghiên cứu thành phần hóa học và tác dụng sinh học của cây dược liệu {index + 1}
                    </Link>
                  </CardTitle>
                  <CardContent className="p-0 mb-4">
                    <p className="text-gray-600">
                      Nghiên cứu này tập trung vào việc phân tích thành phần hóa học và đánh giá tác dụng sinh học của
                      cây dược liệu {index + 1}, một loài cây được sử dụng trong y học cổ truyền Việt Nam để điều trị
                      nhiều bệnh lý khác nhau.
                    </p>
                  </CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-1" />
                      <span>GS.TS. Nguyễn Văn {String.fromCharCode(65 + index)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600 ml-4">
                      <BookOpen className="h-4 w-4 mr-1" />
                      <span>Đại học Y Dược TP. Hồ Chí Minh</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">Dược liệu {index + 1}</span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">Hóa học</span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="h-4 w-4 mr-1 text-gray-500" />
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">Tác dụng sinh học</span>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/4 flex flex-col justify-between">
                  <div className="h-32 bg-purple-50 rounded-lg overflow-hidden mb-4">
                    <img
                      src={`/placeholder.svg?height=128&width=256&text=Nghiên+cứu+${index + 1}`}
                      alt={`Nghiên cứu ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Link href={`/research/${index + 1}`}>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Xem chi tiết
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4"
                      >
                        <path d="M12 2H2v10h10V2z"></path>
                        <path d="M12 12H2v10h10V12z"></path>
                        <path d="M22 2h-10v20h10V2z"></path>
                      </svg>
                      PDF
                    </Button>
                  </div>
                </div>
              </div>
            </div>
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

