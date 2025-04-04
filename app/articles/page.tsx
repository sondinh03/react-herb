import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Calendar, User } from "lucide-react"

export default function ArticlesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bài viết</h1>
          <p className="mt-2 text-gray-600">Các bài viết về cây dược liệu và công dụng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Lọc
          </Button>
          <Link href="/admin/articles/create">
            <Button>Thêm bài viết</Button>
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
              <Input type="text" placeholder="Tìm kiếm bài viết..." className="pl-10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="cong-dung">Công dụng</SelectItem>
                <SelectItem value="cach-dung">Cách dùng</SelectItem>
                <SelectItem value="bai-thuoc">Bài thuốc</SelectItem>
                <SelectItem value="kinh-nghiem">Kinh nghiệm</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Sắp xếp" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="oldest">Cũ nhất</SelectItem>
                <SelectItem value="popular">Phổ biến nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Featured Article */}
      <div className="mb-12">
        <Card className="overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="h-64 md:h-auto bg-green-50">
              <img
                src="/placeholder.svg?height=400&width=600&text=Bài+viết+nổi+bật"
                alt="Bài viết nổi bật"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 md:p-8">
              <div className="flex items-center gap-4 mb-4">
                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Nổi bật</span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  15/04/2023
                </div>
              </div>
              <CardTitle className="text-2xl mb-4">
                10 loại cây dược liệu quý hiếm của Việt Nam và công dụng chữa bệnh
              </CardTitle>
              <CardContent className="p-0 mb-6">
                <p className="text-gray-600">
                  Việt Nam được biết đến là quốc gia có hệ thực vật phong phú với nhiều loại cây dược liệu quý. Bài viết
                  này giới thiệu 10 loại cây dược liệu quý hiếm của Việt Nam và công dụng chữa bệnh của chúng.
                </p>
              </CardContent>
              <CardFooter className="p-0 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-gray-200 mr-2 overflow-hidden">
                    <img
                      src="/placeholder.svg?height=32&width=32"
                      alt="Tác giả"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">TS. Nguyễn Văn A</span>
                </div>
                <Link href="/articles/featured">
                  <Button>Đọc bài viết</Button>
                </Link>
              </CardFooter>
            </div>
          </div>
        </Card>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {Array.from({ length: 9 }).map((_, index) => (
          <Card key={index} className="overflow-hidden">
            <div className="h-48 bg-green-50">
              <img
                src={`/placeholder.svg?height=192&width=384&text=Bài+${index + 1}`}
                alt={`Bài viết ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between mb-2">
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">Công dụng</span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  {`0${index + 1}/05/2023`}
                </div>
              </div>
              <CardTitle className="text-lg">Công dụng chữa bệnh của cây dược liệu {index + 1}</CardTitle>
            </CardHeader>
            <CardContent className="pb-2">
              <p className="text-sm text-gray-600 line-clamp-3">
                Bài viết giới thiệu về công dụng chữa bệnh của cây dược liệu {index + 1}, cách sử dụng và các bài thuốc
                dân gian liên quan.
              </p>
            </CardContent>
            <CardFooter className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1 text-gray-500" />
                <span className="text-sm text-gray-500">TS. Nguyễn Văn {String.fromCharCode(65 + index)}</span>
              </div>
              <Link href={`/articles/${index + 1}`}>
                <Button variant="outline" size="sm">
                  Đọc tiếp
                </Button>
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
          <Button variant="outline" size="sm">
            4
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

