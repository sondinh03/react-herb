import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search } from "lucide-react"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-green-600 to-green-800 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl">Cây Dược Liệu Việt Nam</h1>
            <p className="mt-3 max-w-md mx-auto text-xl text-green-100 sm:text-2xl md:mt-5 md:max-w-3xl">
              Hệ thống quản lý thông tin cây dược liệu, bài viết nghiên cứu và chuyên gia
            </p>
            <div className="mt-10 flex justify-center">
              <div className="rounded-md shadow">
                <Link href="/plants">
                  <Button className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-white bg-green-700 hover:bg-green-800 md:py-4 md:text-lg md:px-10">
                    Khám phá cây dược liệu
                  </Button>
                </Link>
              </div>
              <div className="ml-3 rounded-md shadow">
                <Link href="/articles">
                  <Button
                    variant="outline"
                    className="w-full flex items-center justify-center px-8 py-3 text-base font-medium rounded-md text-green-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Bài viết nghiên cứu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-600 focus:border-green-600 sm:text-sm"
                placeholder="Tìm kiếm cây dược liệu..."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Danh mục chính</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Cây Dược Liệu</CardTitle>
                <CardDescription>Thông tin chi tiết về các loại cây dược liệu Việt Nam</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-green-100 rounded-md flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=160&width=320"
                    alt="Cây dược liệu"
                    className="h-32 w-32 object-contain"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/plants" className="w-full">
                  <Button className="w-full">Xem danh sách</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bài Viết</CardTitle>
                <CardDescription>Các bài viết về cây dược liệu và công dụng</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-blue-100 rounded-md flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=160&width=320"
                    alt="Bài viết"
                    className="h-32 w-32 object-contain"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/articles" className="w-full">
                  <Button className="w-full">Xem bài viết</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Nghiên Cứu</CardTitle>
                <CardDescription>Đề tài nghiên cứu khoa học về dược liệu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-purple-100 rounded-md flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=160&width=320"
                    alt="Nghiên cứu"
                    className="h-32 w-32 object-contain"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/research" className="w-full">
                  <Button className="w-full">Xem nghiên cứu</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Chuyên Gia</CardTitle>
                <CardDescription>Thông tin về các chuyên gia dược liệu</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-40 bg-yellow-100 rounded-md flex items-center justify-center">
                  <img
                    src="/placeholder.svg?height=160&width=320"
                    alt="Chuyên gia"
                    className="h-32 w-32 object-contain"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Link href="/experts" className="w-full">
                  <Button className="w-full">Xem chuyên gia</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Plants Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">Cây dược liệu nổi bật</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} className="overflow-hidden">
                <div className="h-48 bg-green-50">
                  <img
                    src={`/placeholder.svg?height=192&width=384&text=Cây+${item}`}
                    alt={`Cây dược liệu ${item}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardHeader>
                  <CardTitle>Cây dược liệu {item}</CardTitle>
                  <CardDescription>Mô tả ngắn về công dụng và đặc tính</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Thông tin chi tiết về cây dược liệu, nguồn gốc, phân bố và các đặc điểm nhận dạng.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link href={`/plants/${item}`} className="w-full">
                    <Button variant="outline" className="w-full">
                      Xem chi tiết
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/plants">
              <Button variant="outline" className="px-8">
                Xem tất cả cây dược liệu
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

