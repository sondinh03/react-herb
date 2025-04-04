"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Save, Upload, Bold, Italic, LinkIcon, List, ListOrdered, Image, Code } from "lucide-react"

export default function CreateArticlePage() {
  const [featuredImage, setFeaturedImage] = useState<string>("/placeholder.svg?height=400&width=800&text=Ảnh+bìa")

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/admin/articles">
          <Button variant="ghost" className="flex items-center gap-2 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thêm bài viết mới</h1>
          <p className="mt-1 text-sm text-gray-500">Tạo bài viết mới về cây dược liệu</p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-2">
          <Button variant="outline">Lưu nháp</Button>
          <Button className="flex items-center gap-1">
            <Save className="h-4 w-4" />
            Xuất bản
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="content">Nội dung</TabsTrigger>
          <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          <TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Nội dung bài viết</CardTitle>
                  <CardDescription>Nhập tiêu đề và nội dung chi tiết của bài viết</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Tiêu đề bài viết</Label>
                    <Input id="title" placeholder="Nhập tiêu đề bài viết" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Tóm tắt</Label>
                    <Textarea id="excerpt" placeholder="Nhập tóm tắt ngắn gọn về bài viết" rows={3} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Nội dung</Label>
                    <div className="border rounded-md">
                      <div className="flex items-center gap-1 p-2 border-b">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Bold className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Italic className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <LinkIcon className="h-4 w-4" />
                        </Button>
                        <div className="h-6 w-px bg-gray-200 mx-1"></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <List className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ListOrdered className="h-4 w-4" />
                        </Button>
                        <div className="h-6 w-px bg-gray-200 mx-1"></div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Image className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Code className="h-4 w-4" />
                        </Button>
                      </div>
                      <Textarea
                        id="content"
                        placeholder="Nhập nội dung chi tiết của bài viết..."
                        rows={15}
                        className="border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Ảnh bìa</CardTitle>
                    <CardDescription>Thêm ảnh bìa cho bài viết</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="aspect-video bg-gray-100 rounded-md overflow-hidden">
                        <img
                          src={featuredImage || "/placeholder.svg"}
                          alt="Ảnh bìa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button variant="outline" className="w-full flex items-center gap-1">
                        <Upload className="h-4 w-4" />
                        Tải lên ảnh bìa
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Phân loại</CardTitle>
                    <CardDescription>Thiết lập danh mục và thẻ cho bài viết</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Danh mục</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cong-dung">Công dụng</SelectItem>
                          <SelectItem value="cach-dung">Cách dùng</SelectItem>
                          <SelectItem value="bai-thuoc">Bài thuốc</SelectItem>
                          <SelectItem value="kinh-nghiem">Kinh nghiệm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Thẻ</Label>
                      <Input id="tags" placeholder="Nhập thẻ (cách nhau bởi dấu phẩy)" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="related-plants">Cây dược liệu liên quan</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn cây dược liệu" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="atiso">Atiso</SelectItem>
                          <SelectItem value="dinh-lang">Đinh lăng</SelectItem>
                          <SelectItem value="nghe">Nghệ</SelectItem>
                          <SelectItem value="sa-sam">Sâm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Xuất bản</CardTitle>
                    <CardDescription>Thiết lập trạng thái và thời gian xuất bản</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Trạng thái</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Xuất bản</SelectItem>
                          <SelectItem value="draft">Bản nháp</SelectItem>
                          <SelectItem value="pending">Chờ duyệt</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="publish-date">Ngày xuất bản</Label>
                      <Input id="publish-date" type="date" />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="author">Tác giả</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tác giả" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="nguyen-van-a">Nguyễn Văn A</SelectItem>
                          <SelectItem value="tran-thi-b">Trần Thị B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt bài viết</CardTitle>
              <CardDescription>Cấu hình các tùy chọn hiển thị và tương tác</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="allow-comments">Cho phép bình luận</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tùy chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Có</SelectItem>
                      <SelectItem value="no">Không</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featured">Bài viết nổi bật</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tùy chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Có</SelectItem>
                      <SelectItem value="no">Không</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="display-author">Hiển thị tác giả</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tùy chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Có</SelectItem>
                      <SelectItem value="no">Không</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display-date">Hiển thị ngày xuất bản</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tùy chọn" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Có</SelectItem>
                      <SelectItem value="no">Không</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="related-articles">Bài viết liên quan</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn bài viết liên quan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article-1">Bài viết 1</SelectItem>
                    <SelectItem value="article-2">Bài viết 2</SelectItem>
                    <SelectItem value="article-3">Bài viết 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SEO Tab */}
        <TabsContent value="seo">
          <Card>
            <CardHeader>
              <CardTitle>Tối ưu hóa SEO</CardTitle>
              <CardDescription>Cấu hình thông tin SEO để tối ưu hiển thị trên công cụ tìm kiếm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seo-title">Tiêu đề SEO</Label>
                <Input id="seo-title" placeholder="Nhập tiêu đề SEO" />
                <p className="text-xs text-gray-500">Tiêu đề hiển thị trên kết quả tìm kiếm (tối đa 60 ký tự)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-description">Mô tả SEO</Label>
                <Textarea id="seo-description" placeholder="Nhập mô tả SEO" rows={3} />
                <p className="text-xs text-gray-500">Mô tả hiển thị trên kết quả tìm kiếm (tối đa 160 ký tự)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seo-keywords">Từ khóa SEO</Label>
                <Input id="seo-keywords" placeholder="Nhập từ khóa SEO (cách nhau bởi dấu phẩy)" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonical-url">URL chuẩn (Canonical URL)</Label>
                <Input id="canonical-url" placeholder="Nhập URL chuẩn" />
              </div>

              <div className="p-4 border rounded-md bg-gray-50">
                <h3 className="text-sm font-medium mb-2">Xem trước kết quả tìm kiếm</h3>
                <div className="space-y-1">
                  <p className="text-blue-600 text-base font-medium">Công dụng của cây Atiso trong điều trị bệnh gan</p>
                  <p className="text-green-700 text-sm">https://duoclieuvn.com/bai-viet/cong-dung-cay-atiso</p>
                  <p className="text-gray-600 text-sm">
                    Tìm hiểu về công dụng của cây Atiso trong điều trị các bệnh về gan, cách sử dụng và các bài thuốc
                    dân gian từ cây Atiso.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Hủy</Button>
              <Button>Lưu thay đổi</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

