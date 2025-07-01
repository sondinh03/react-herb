"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  User,
  LogIn,
  Bell,
  UserCircle,
  Settings,
  LogOut,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { toast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const navigation = [
  { name: "Trang chủ", href: "/" },
  { name: "Cây dược liệu", href: "/plants" },
  { name: "Bài viết", href: "/articles" },
  { name: "Nghiên cứu", href: "/research" },
  { name: "Chuyên gia", href: "/experts" },
  { name: "Giới thiệu", href: "/about" },
];

export const handleWait = () => {
  toast({
    title: "Chức năng chưa hoàn thiện",
    description: "Chức năng đang trong quá trình phát triển",
    variant: "info",
  });
  // Hiển thị hộp thoại xác nhận trước khi xóa
  // Thực hiện xóa nếu người dùng xác nhận
};

function AuthButtons({
  mobile = false,
  onClick,
}: {
  mobile?: boolean;
  onClick?: () => void;
}) {
  return (
    <>
      <Link
        href="/login"
        className={
          mobile
            ? "-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
            : ""
        }
        onClick={onClick}
      >
        {mobile ? (
          "Đăng nhập"
        ) : (
          <Button variant="outline" className="flex items-center gap-2">
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </Button>
        )}
      </Link>
      <Link
        href="/register"
        className={
          mobile
            ? "-mx-3 block rounded-lg bg-green-600 px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-green-700"
            : ""
        }
        onClick={onClick}
      >
        {mobile ? (
          "Đăng ký"
        ) : (
          <Button className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Đăng ký
          </Button>
        )}
      </Link>
    </>
  );
}

function Notifications({
  mobile = false,
  onClick,
}: {
  mobile?: boolean;
  onClick?: () => void;
}) {
  return (
    <Link
      href="/notifications"
      className={
        mobile
          ? "-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
          : ""
      }
      onClick={onClick}
    >
      {mobile ? (
        "Thông báo"
      ) : (
        <Button
          variant="ghost"
          className="rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          <span className="sr-only">Xem thông báo</span>
          <Bell className="h-6 w-6" />
        </Button>
      )}
    </Link>
  );
}

function Profile({
  mobile = false,
  onClick,
}: {
  mobile?: boolean;
  onClick?: () => void;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");

    router.push("/login");
    if (onClick) onClick();
  };

  return (
    <div
      className={
        mobile
          ? "-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
          : "relative"
      }
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {mobile ? (
            <span onClick={onClick}>Hồ sơ</span>
          ) : (
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar>
                <AvatarImage
                  src="/placeholder.svg?height=32&width=32"
                  alt="User"
                />
                <AvatarFallback>US</AvatarFallback>
              </Avatar>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
          <Link href="/profile">
            <DropdownMenuItem onClick={handleWait}>
              <UserCircle className="mr-2 h-4 w-4" />
              <span>Hồ sơ</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={handleWait}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Cài đặt</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Đăng xuất</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function LogoutButton({
  mobile = false,
  onClick,
}: {
  mobile?: boolean;
  onClick?: () => void;
}) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    router.push("/login");
    if (onClick) onClick();
  };

  return (
    <button
      onClick={handleLogout}
      className={
        mobile
          ? "-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
          : ""
      }
    >
      {mobile ? (
        "Đăng xuất"
      ) : (
        <Button variant="outline" className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      )}
    </button>
  );
}

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("userData");
    setIsLoggedIn(!!token);

    // Nếu là admin, chuyển hướng đến /admin
    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        if (user.roleType === 1) {
          // Admin
          if (pathname !== "/admin") {
            router.push("/admin");
          }
        } else {
          // Người dùng thường
          if (pathname === "/admin") {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Error parsing userData:", error);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        setIsLoggedIn(false);
        router.push("/login");
      }
    }
  }, [router, pathname]);

  return (
    <header className="bg-white shadow-sm">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
        aria-label="Global"
      >
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Cây Dược Liệu Việt Nam</span>
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                <span className="text-white font-bold">DL</span>
              </div>
              <span className="ml-2 text-xl font-bold text-green-800">
                DuocLieuVN
              </span>
            </div>
          </Link>
        </div>

        <div className="flex lg:hidden">
          <button
            type="button"
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-900"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Mở menu</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        <div className="hidden lg:flex lg:gap-x-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`text-sm font-semibold leading-6 ${
                pathname === item.href
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-gray-900 hover:text-green-600"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4">
          {isLoggedIn ? (
            <>
              <Notifications onClick={handleWait} />
              <Profile onClick={handleWait} />
              <LogoutButton />
            </>
          ) : (
            <AuthButtons />
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-50" />
          <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Cây Dược Liệu Việt Nam</span>
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                    <span className="text-white font-bold">DL</span>
                  </div>
                  <span className="ml-2 text-xl font-bold text-green-800">
                    DuocLieuVN
                  </span>
                </div>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5 text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Đóng menu</span>
                <X className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 ${
                        pathname === item.href
                          ? "text-green-600 bg-green-50"
                          : "text-gray-900 hover:bg-gray-50"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="py-6 space-y-3">
                  {isLoggedIn ? (
                    <>
                      <Notifications
                        mobile
                        onClick={() => setMobileMenuOpen(false)}
                      />
                      <Profile
                        mobile
                        onClick={() => setMobileMenuOpen(false)}
                      />
                      <LogoutButton
                        mobile
                        onClick={() => setMobileMenuOpen(false)}
                      />
                    </>
                  ) : (
                    <AuthButtons
                      mobile
                      onClick={() => setMobileMenuOpen(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
