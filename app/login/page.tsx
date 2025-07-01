"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Leaf } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { AUTH_ERRORS } from "../api/login/error-messages";
import { ROLE_TYPES } from "@/constants/user";
import { handleWait } from "@/components/header";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  // Kiểm tra xem người dùng đã đăng nhập chưa khi trang được tải
  useEffect(() => {
    // Kiểm tra nếu đã có accessToken trong localStorage
    const accessToken = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("userData");

    if (accessToken && userData) {
      try {
        const user = JSON.parse(userData);
        // Đã đăng nhập, chuyển hướng người dùng tới trang thích hợp
        if (user.roleType === ROLE_TYPES.ADMIN) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      } catch (error) {
        // Xử lý lỗi khi parse userData
        console.error("Error parsing user data:", error);
        // Xóa dữ liệu không hợp lệ
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userData");
      }
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setFormData({
      ...formData,
      [id === "email" ? "username" : id]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || AUTH_ERRORS.DEFAULT_ERROR.message);
      }

      const { accessToken, refreshToken, user } = result.data || {};

      if (accessToken) {
        // Lưu accessToken và userData vào localStorage để sử dụng xác thực
        localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        if (user) localStorage.setItem("userData", JSON.stringify(user));

        // Thông báo đăng nhập thành công
        toast({
          title: "Đăng nhập thành công",
          description: `Chào mừng ${user?.fullName || "bạn"}`,
          variant: "default",
          duration: 3000,
        });

        // Chuyển hướng người dùng
        if (user?.roleType === 1) {
          router.push("/admin");
        } else {
          router.push("/");
        }
      }

      // Reset password field
      setFormData((prevState) => ({
        ...prevState,
        password: "",
      }));
    } catch (error: any) {
      console.error("Login error:", error);

      toast({
        title: "Đăng nhập thất bại",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });

      // Reset password field khi đăng nhập thất bại
      setFormData((prevState) => ({
        ...prevState,
        password: "",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-green-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-green-200 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center shadow-md">
              <Leaf className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-green-800">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-center text-green-600">
            Nhập thông tin đăng nhập của bạn để truy cập hệ thống dược liệu
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-700">
                Email hoặc Tên đăng nhập
              </Label>
              <Input
                id="email"
                type="text"
                placeholder="name@example.com"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                autoComplete="username"
                className="border-green-300 focus:border-green-500 focus:ring-green-500 hover:border-green-400 text-green-800"
                style={
                  {
                    "--tw-ring-color": "rgb(34 197 94 / 0.5)",
                  } as React.CSSProperties
                }
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-green-700">
                  Mật khẩu
                </Label>
                <Link
                  // href="/forgot-password"
                  href={"/login"}
                  className="text-sm font-medium text-green-600 hover:text-green-800 hover:underline"
                  onClick={handleWait}
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  autoComplete="current-password"
                  className="border-green-300 focus:border-green-500 focus:ring-green-500 hover:border-green-400 text-green-800 placeholder:text-green-800"
                  style={
                    {
                      "--tw-ring-color": "rgb(34 197 94 / 0.5)",
                    } as React.CSSProperties
                  }
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 text-green-600 hover:text-green-800"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  </span>
                </Button>
              </div>
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col border-t border-green-100 pt-4">
          <div className="text-center text-sm mt-2 text-green-700">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-medium text-green-600 hover:text-green-800 hover:underline"
            >
              Đăng ký
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
