import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  Share2,
  Printer,
  BookOpen,
  Leaf,
  FlaskRoundIcon as Flask,
  Map,
} from "lucide-react"

export default function PlantDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-6">
        <Link href="/plants">
          <Button variant="ghost" className="flex items-center gap-2 pl-0 hover:pl-2 transition-all">
            <ArrowLeft className="h-4 w-4" />
            Quay lại danh sách
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Cây Atiso (Cynara scolymus)</h1>
              <p className="mt-2 text-gray-600">Họ Cúc (Asteraceae)</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Chia sẻ</span>
              </Button>
              <Button variant="outline" size="icon">
                <Printer className="h-4 w-4" />
                <span className="sr-only">In</span>
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Tải xuống</span>
              </Button>
              <Button variant="outline" className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Sửa
              </Button>
              <Button variant="destructive" className="flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Xóa
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div className="md:col-span-1">
              <div className="bg-green-50 rounded-lg overflow-hidden">
                <img src="/placeholder.svg?height=400&width=400&text=Atiso" alt="Cây Atiso" className="w-full h-auto" />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-green-50 rounded-lg overflow-hidden">
                    <img
                      src={`/placeholder.svg?height=100&width=100&text=Ảnh+${i}`}
                      alt={`Ảnh Atiso ${i}`}
                      className="w-full h-auto"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <BookOpen className="h-5 w-5 mr-2 text-green-600" />
                    Thông tin chung
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Tên khoa học:</span> Cynara scolymus
                      </p>
                      <p>
                        <span className="font-medium">Họ:</span> Cúc (Asteraceae)
                      </p>
                      <p>
                        <span className="font-medium">Chi:</span> Cynara
                      </p>
                      <p>
                        <span className="font-medium">Tên khác:</span> Atisô, Actiso
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p>
                        <span className="font-medium">Bộ phận dùng:</span> Lá, hoa
                      </p>
                      <p>
                        <span className="font-medium">Vùng phân bố:</span> Đà Lạt, Lâm Đồng
                      </p>
                      <p>
                        <span className="font-medium">Độ cao:</span> 1000-1500m
                      </p>
                      <p>
                        <span className="font-medium">Mùa thu hoạch:</span> Quanh năm
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Leaf className="h-5 w-5 mr-2 text-green-600" />
                    Đặc điểm thực vật
                  </h2>
                  <p className="text-gray-700">
                    Atiso là cây thảo, sống nhiều năm, cao 1-1,5m. Thân cây thẳng, có rãnh dọc, phân nhánh ở phần ngọn.
                    Lá mọc so le, lá ở gốc có cuống dài, phiến lá xẻ lông chim sâu, mép có răng cưa, mặt trên màu xanh
                    lục, mặt dưới có lông trắng. Hoa hình đầu, to, màu tím, mọc ở đầu cành. Quả bế, có lông mào.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Flask className="h-5 w-5 mr-2 text-green-600" />
                    Thành phần hóa học
                  </h2>
                  <p className="text-gray-700">
                    Lá và hoa Atiso chứa các acid phenolic (acid chlorogenic, acid caffeic), flavonoid (luteolin,
                    apigenin), sesquiterpene lactone (cynaropicrin), inulin, enzyme, vitamin và khoáng chất.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-2 flex items-center">
                    <Map className="h-5 w-5 mr-2 text-green-600" />
                    Phân bố và sinh thái
                  </h2>
                  <p className="text-gray-700">
                    Atiso có nguồn gốc từ vùng Địa Trung Hải, được du nhập vào Việt Nam và trồng chủ yếu ở vùng Đà Lạt,
                    Lâm Đồng. Cây ưa khí hậu mát mẻ, nhiệt độ thích hợp từ 15-20°C, đất tơi xốp, giàu mùn, thoát nước
                    tốt.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Tabs defaultValue="cong-dung" className="mt-8">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
              <TabsTrigger value="cong-dung">Công dụng</TabsTrigger>
              <TabsTrigger value="cach-dung">Cách dùng</TabsTrigger>
              <TabsTrigger value="nghien-cuu">Nghiên cứu</TabsTrigger>
              <TabsTrigger value="bai-viet">Bài viết liên quan</TabsTrigger>
            </TabsList>

            <TabsContent value="cong-dung" className="space-y-4">
              <h3 className="text-lg font-semibold">Công dụng y học</h3>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Hỗ trợ chức năng gan, lợi mật</li>
                <li>Hạ cholesterol máu</li>
                <li>Lợi tiểu, giúp thải độc cơ thể</li>
                <li>Hỗ trợ tiêu hóa, giảm đầy hơi, khó tiêu</li>
                <li>Chống oxy hóa, bảo vệ tế bào</li>
                <li>Hỗ trợ điều trị các bệnh về gan mật</li>
              </ul>

              <h3 className="text-lg font-semibold mt-6">Chỉ định</h3>
              <p className="text-gray-700">
                Atiso được chỉ định trong các trường hợp: rối loạn chức năng gan, viêm gan, xơ gan, sỏi mật, tăng
                cholesterol máu, rối loạn tiêu hóa, táo bón.
              </p>

              <h3 className="text-lg font-semibold mt-6">Chống chỉ định</h3>
              <p className="text-gray-700">
                Không dùng cho người mẫn cảm với các thành phần của cây Atiso. Thận trọng khi dùng cho phụ nữ có thai và
                cho con bú. Không dùng cho người bị tắc đường mật.
              </p>
            </TabsContent>

            <TabsContent value="cach-dung" className="space-y-4">
              <h3 className="text-lg font-semibold">Liều dùng và cách dùng</h3>
              <div className="space-y-4 text-gray-700">
                <p>
                  <strong>Dạng trà:</strong> 2-3g lá Atiso khô hãm với 200ml nước sôi trong 10-15 phút, uống 2-3
                  lần/ngày.
                </p>
                <p>
                  <strong>Dạng cao lỏng:</strong> 2-4ml, ngày uống 3 lần.
                </p>
                <p>
                  <strong>Dạng viên nang:</strong> 300-600mg, ngày uống 3 lần.
                </p>
                <p>
                  <strong>Dạng cồn thuốc:</strong> 2-4ml, ngày uống 3 lần.
                </p>
              </div>

              <h3 className="text-lg font-semibold mt-6">Bài thuốc dân gian</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Bài 1:</strong> Lá Atiso 10g, Diệp hạ châu 10g, Nhân trần 10g. Sắc với 500ml nước còn 200ml,
                  chia 2 lần uống trong ngày. Công dụng: Hỗ trợ điều trị viêm gan, vàng da.
                </p>
                <p>
                  <strong>Bài 2:</strong> Lá Atiso 15g, Actisô hoa 5g, Chè xanh 5g. Hãm với nước sôi, uống thay trà hàng
                  ngày. Công dụng: Lợi tiểu, giải độc, hỗ trợ chức năng gan.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="nghien-cuu" className="space-y-4">
              <h3 className="text-lg font-semibold">Các nghiên cứu khoa học</h3>
              <div className="space-y-6">
                <div className="border-l-4 border-green-600 pl-4 py-2">
                  <h4 className="font-medium">Nghiên cứu tác dụng bảo vệ gan của chiết xuất Atiso</h4>
                  <p className="text-gray-600 text-sm">Tác giả: Nguyễn Văn A, Trần Thị B (2018)</p>
                  <p className="text-gray-700 mt-2">
                    Nghiên cứu trên mô hình chuột bị gây độc gan bằng CCl4 cho thấy chiết xuất Atiso có tác dụng bảo vệ
                    tế bào gan, giảm men gan ALT, AST.
                  </p>
                  <Link href="/research/1">
                    <Button variant="link" className="p-0 h-auto mt-1">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>

                <div className="border-l-4 border-green-600 pl-4 py-2">
                  <h4 className="font-medium">Đánh giá tác dụng hạ lipid máu của cao chiết Atiso</h4>
                  <p className="text-gray-600 text-sm">Tác giả: Lê Văn C, Phạm Thị D (2020)</p>
                  <p className="text-gray-700 mt-2">
                    Nghiên cứu lâm sàng trên 60 bệnh nhân tăng cholesterol máu cho thấy cao chiết Atiso làm giảm đáng kể
                    nồng độ cholesterol toàn phần và LDL-cholesterol sau 8 tuần sử dụng.
                  </p>
                  <Link href="/research/2">
                    <Button variant="link" className="p-0 h-auto mt-1">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>

                <div className="border-l-4 border-green-600 pl-4 py-2">
                  <h4 className="font-medium">
                    Phân tích thành phần hóa học và hoạt tính chống oxy hóa của Atiso trồng tại Đà Lạt
                  </h4>
                  <p className="text-gray-600 text-sm">Tác giả: Hoàng Văn E, Ngô Thị F (2021)</p>
                  <p className="text-gray-700 mt-2">
                    Nghiên cứu đã xác định được 15 hợp chất phenolic trong lá Atiso và đánh giá hoạt tính chống oxy hóa
                    thông qua các phương pháp DPPH, ABTS và FRAP.
                  </p>
                  <Link href="/research/3">
                    <Button variant="link" className="p-0 h-auto mt-1">
                      Xem chi tiết
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link href="/research?plant=atiso">
                  <Button variant="outline">Xem tất cả nghiên cứu về Atiso</Button>
                </Link>
              </div>
            </TabsContent>

            <TabsContent value="bai-viet" className="space-y-4">
              <h3 className="text-lg font-semibold">Bài viết liên quan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex gap-4 border rounded-lg p-4">
                    <div className="w-24 h-24 bg-green-50 flex-shrink-0 rounded-md overflow-hidden">
                      <img
                        src={`/placeholder.svg?height=96&width=96&text=Bài+${i}`}
                        alt={`Bài viết ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-medium">Bài viết về công dụng của Atiso trong điều trị bệnh gan {i}</h4>
                      <p className="text-gray-600 text-sm mt-1">Tác giả: Nguyễn Văn X</p>
                      <p className="text-gray-600 text-sm">Ngày đăng: 10/0{i}/2023</p>
                      <Link href={`/articles/${i}`}>
                        <Button variant="link" className="p-0 h-auto mt-1">
                          Đọc bài viết
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <Link href="/articles?plant=atiso">
                  <Button variant="outline">Xem tất cả bài viết về Atiso</Button>
                </Link>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

