import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Leaf,
  FileText,
  BookOpen,
  Users,
  TrendingUp,
  Eye,
  UserPlus,
  FileUp,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Trang chủ</h1>
        <p className="mt-1 text-sm text-gray-500">Tổng quan về hệ thống quản lý cây dược liệu</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số cây dược liệu</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">248</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+12%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số bài viết</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+8%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số nghiên cứu</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+5%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng số người dùng</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">+18%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity and Recent Items */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Hoạt động gần đây</CardTitle>
            <CardDescription>Các hoạt động mới nhất trong hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="mr-4 mt-0.5">
                  <FileUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Thêm cây dược liệu mới</p>
                  <p className="text-xs text-gray-500">Admin đã thêm "Cây Atiso" vào hệ thống</p>
                  <p className="text-xs text-gray-400 mt-1">2 giờ trước</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-0.5">
                  <UserPlus className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Người dùng mới đăng ký</p>
                  <p className="text-xs text-gray-500">Nguyễn Văn A đã đăng ký tài khoản</p>
                  <p className="text-xs text-gray-400 mt-1">4 giờ trước</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-0.5">
                  <FileUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Thêm bài viết mới</p>
                  <p className="text-xs text-gray-500">Admin đã thêm bài viết "Công dụng của cây Atiso"</p>
                  <p className="text-xs text-gray-400 mt-1">6 giờ trước</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-0.5">
                  <FileUp className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Cập nhật thông tin cây dược liệu</p>
                  <p className="text-xs text-gray-500">Admin đã cập nhật thông tin "Cây Đinh Lăng"</p>
                  <p className="text-xs text-gray-400 mt-1">8 giờ trước</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="mr-4 mt-0.5">
                  <UserPlus className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Người dùng mới đăng ký</p>
                  <p className="text-xs text-gray-500">Trần Thị B đã đăng ký tài khoản</p>
                  <p className="text-xs text-gray-400 mt-1">10 giờ trước</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Plants */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Cây dược liệu mới thêm</CardTitle>
            <CardDescription>Các cây dược liệu mới được thêm vào hệ thống</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-10 h-10 rounded-md bg-green-50 mr-3 flex-shrink-0 overflow-hidden">
                    <img
                      src={`/placeholder.svg?height=40&width=40&text=Cây+${i}`}
                      alt={`Cây ${i}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Cây dược liệu {i}</p>
                    <p className="text-xs text-gray-500">Thêm {i} ngày trước</p>
                  </div>
                  <div className="ml-2">
                    <Link href={`/admin/plants/${i}`}>
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stats Overview */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Thống kê truy cập</CardTitle>
            <CardDescription>Số liệu truy cập trong 7 ngày qua</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tổng lượt truy cập</p>
                  <p className="text-2xl font-bold">8,642</p>
                </div>
                <div className="flex items-center text-green-500">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  <span className="text-sm font-medium">12%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Người dùng mới</p>
                  <p className="text-2xl font-bold">1,254</p>
                </div>
                <div className="flex items-center text-green-500">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  <span className="text-sm font-medium">18%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Tỷ lệ thoát</p>
                  <p className="text-2xl font-bold">42%</p>
                </div>
                <div className="flex items-center text-red-500">
                  <ArrowDownRight className="mr-1 h-4 w-4" />
                  <span className="text-sm font-medium">3%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Thời gian trung bình</p>
                  <p className="text-2xl font-bold">3:24</p>
                </div>
                <div className="flex items-center text-green-500">
                  <ArrowUpRight className="mr-1 h-4 w-4" />
                  <span className="text-sm font-medium">8%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

