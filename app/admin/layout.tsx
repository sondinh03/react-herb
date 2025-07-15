"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Leaf,
  FileText,
  BookOpen,
  Users,
  UserCircle,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  List,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeProvider } from "@/components/theme-provider";
import { fetchApi } from "@/lib/api-client";
import { headers } from "next/headers";
import { HerbResponse } from "@/types/api";
import { useLogout } from "@/hooks/use-logout";
import { handleWait } from "@/components/header";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  subItems?: { title: string; href: string }[];
}

const navItems: NavItem[] = [
  {
    title: "Trang chủ",
    href: "/admin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    title: "Cây dược liệu",
    href: "/admin/plants",
    icon: <Leaf className="h-5 w-5" />,
  },
  {
    title: "Bài viết",
    href: "/admin/articles",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Nghiên cứu",
    href: "/admin/research",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    title: "Chuyên gia",
    href: "/admin/experts",
    icon: <UserCircle className="h-5 w-5" />,
  },
  {
    title: "Người dùng",
    href: "/admin/users",
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: "Danh mục",
    icon: <List className="h-5 w-5" />,
    subItems: [
      { title: "Công dụng chữa bệnh", href: "/admin/diseases" },
      { title: "Họ thực vật", href: "/admin/families" },
      { title: "Chi thực vật", href: "/admin/genera" },
      { title: "Hoạt chất khoa học", href: "/admin/active-compound" },
    ],
  },
  {
    title: "Cài đặt",
    href: "/admin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const pathname = usePathname();
  const router = useRouter();

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title);
  };

  const handleLogout = async () => {
    const token = localStorage.getItem("accessToken");

    const result = await fetchApi<HerbResponse<Boolean>>("/auth/logout", {
      headers: { Authorization: `Bearer ${token}` },
    });

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userData");
    router.push("/");
  };

  const logout = useLogout();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar for mobile */}
        <div
          className={`fixed inset-0 z-40 lg:hidden ${
            sidebarOpen ? "block" : "hidden"
          }`}
        >
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-white">
            <div className="flex items-center justify-between h-16 px-6 border-b">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                  <span className="text-white font-bold">DL</span>
                </div>
                <span className="ml-2 text-xl font-bold text-green-800">
                  DuocLieuVN
                </span>
              </div>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4 px-4">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <div key={item.title}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className={`flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                          pathname === item.href
                            ? "bg-green-50 text-green-700"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="mr-3">{item.icon}</span>
                        {item.title}
                      </Link>
                    ) : (
                      <>
                        <button
                          className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50`}
                          onClick={() => toggleSubmenu(item.title)}
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.title}
                        </button>
                        {openSubmenu === item.title && item.subItems && (
                          <div className="ml-6 space-y-1">
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.href}
                                href={subItem.href}
                                className={`flex items-center px-4 py-2 text-sm rounded-md ${
                                  pathname === subItem.href
                                    ? "bg-green-50 text-green-700"
                                    : "text-gray-600 hover:bg-gray-50"
                                }`}
                                onClick={() => setSidebarOpen(false)}
                              >
                                {subItem.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex w-64 flex-col">
            <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
              <div className="flex flex-1 flex-col overflow-y-auto">
                <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                      <span className="text-white font-bold">DL</span>
                    </div>
                    <span className="ml-2 text-xl font-bold text-green-800">
                      DuocLieuVN
                    </span>
                  </div>
                </div>
                <nav className="flex-1 space-y-1 py-4 px-2">
                  {navItems.map((item) => (
                    <div key={item.title}>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className={`group flex items-center px-3 py-3 text-sm font-medium rounded-md ${
                            pathname === item.href
                              ? "bg-green-50 text-green-700"
                              : "text-gray-700 hover:bg-gray-50"
                          }`}
                        >
                          <span className="mr-3">{item.icon}</span>
                          {item.title}
                        </Link>
                      ) : (
                        <>
                          <button
                            className={`flex items-center w-full px-3 py-3 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50`}
                            onClick={() => toggleSubmenu(item.title)}
                          >
                            <span className="mr-3">{item.icon}</span>
                            {item.title}
                          </button>
                          {openSubmenu === item.title && item.subItems && (
                            <div className="ml-6 space-y-1">
                              {item.subItems.map((subItem) => (
                                <Link
                                  key={subItem.href}
                                  href={subItem.href}
                                  className={`flex items-center px-3 py-2 text-sm rounded-md ${
                                    pathname === subItem.href
                                      ? "bg-green-50 text-green-700"
                                      : "text-gray-600 hover:bg-gray-50"
                                  }`}
                                >
                                  {subItem.title}
                                </Link>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top navigation */}
          <header className="bg-white shadow-sm">
            <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
              <div className="flex items-center">
                <button
                  type="button"
                  className="text-gray-500 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-6 w-6" />
                </button>
                <div className="ml-4 lg:ml-0 relative w-64 lg:max-w-xs">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-green-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <button
                  type="button"
                  className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Xem thông báo</span>
                  <Bell className="h-6 w-6" />
                </button>
                <div className="ml-4 relative">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-8 w-8 rounded-full"
                      >
                        <Avatar>
                          <AvatarImage
                            src="/placeholder.svg?height=32&width=32"
                            alt="Admin"
                          />
                          <AvatarFallback>AD</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                      {/* <Link href="/admin/profile"> */}
                        <DropdownMenuItem onClick={handleWait}>
                          <UserCircle className="mr-2 h-4 w-4" />
                          <span>Hồ sơ</span>
                        </DropdownMenuItem>
                      {/* </Link> */}
                      <DropdownMenuItem onClick={handleWait}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Cài đặt</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Đăng xuất</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto bg-gray-100">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
