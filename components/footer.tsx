import Link from "next/link"
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center">
                <span className="text-green-800 font-bold">DL</span>
              </div>
              <span className="ml-2 text-xl font-bold">DuocLieuVN</span>
            </div>
            <p className="text-green-100">
              Hệ thống quản lý thông tin cây dược liệu Việt Nam, cung cấp thông tin đầy đủ và chính xác về các loại cây
              dược liệu.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-green-100 hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </a>
              <a href="#" className="text-green-100 hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </a>
              <a href="#" className="text-green-100 hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liên kết nhanh</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-green-100 hover:text-white">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link href="/plants" className="text-green-100 hover:text-white">
                  Cây dược liệu
                </Link>
              </li>
              <li>
                <Link href="/articles" className="text-green-100 hover:text-white">
                  Bài viết
                </Link>
              </li>
              <li>
                <Link href="/research" className="text-green-100 hover:text-white">
                  Nghiên cứu
                </Link>
              </li>
              <li>
                <Link href="/experts" className="text-green-100 hover:text-white">
                  Chuyên gia
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-green-100 hover:text-white">
                  Giới thiệu
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Danh mục</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/plants?category=thao-duoc" className="text-green-100 hover:text-white">
                  Thảo dược
                </Link>
              </li>
              <li>
                <Link href="/plants?category=cay-thuoc" className="text-green-100 hover:text-white">
                  Cây thuốc
                </Link>
              </li>
              <li>
                <Link href="/plants?category=nam" className="text-green-100 hover:text-white">
                  Nấm dược liệu
                </Link>
              </li>
              <li>
                <Link href="/plants?category=hoa" className="text-green-100 hover:text-white">
                  Hoa dược liệu
                </Link>
              </li>
              <li>
                <Link href="/plants?category=re" className="text-green-100 hover:text-white">
                  Rễ dược liệu
                </Link>
              </li>
              <li>
                <Link href="/plants?category=qua" className="text-green-100 hover:text-white">
                  Quả dược liệu
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                <span>Số 123, Đường ABC, Quận XYZ, Hà Nội, Việt Nam</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 flex-shrink-0" />
                <span>info@duoclieuvn.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-green-800">
          <p className="text-center text-green-100">
            © {new Date().getFullYear()} DuocLieuVN. Tất cả các quyền được bảo lưu.
          </p>
        </div>
      </div>
    </footer>
  )
}

