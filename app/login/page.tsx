"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { AUTH_ERRORS } from "../api/login/error-messages";

export default function LoginPage() {
  //useRouter dùng để chuyển trang
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    rememberMe: false,
  });
  const [userRole, setUserRole] = useState(3);

  /* 
    e: React.ChangeEvent<HTMLInputElement>: đây là kiểu dữ liệu cho sự kiện thay đổi của một <input>
    e.target chính là input mà người dùng đang nhập dữ liệu vào
    const {id, value} = e.target: lấy id và value từ phần tử input mà người dùng nhập vào
    ...formData: giữ nguyên các dữ liệu cũ trong formData
    
  */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    setFormData({
      ...formData,
      [id === "email" ? "username" : id]: value,
    });
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData({
      ...formData,
      rememberMe: checked,
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

      const { accessToken, user } = result.data || {};

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);

        if (user) {
          localStorage.setItem("userData", JSON.stringify(user));
          if (user.roleType === 1) {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }
      }

      // Reset form
      setFormData({ username: "", password: "", rememberMe: false });

      // Thông báo đăng nhập thành công
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${user?.fullName || "bạn"}`,
        variant: "default",
        duration: 3000,
      });
    } catch (error: any) {
      console.error("Login error:", error);

      toast({
        title: "Đăng nhập thất bại",
        description: error.message,
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">DL</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Đăng nhập
          </CardTitle>
          <CardDescription className="text-center">
            Nhập thông tin đăng nhập của bạn để truy cập hệ thống
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email hoặc Tên đăng nhập</Label>
              <Input
                id="email"
                type="text"
                placeholder="name@example.com"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                required
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  </span>
                </Button>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={formData.rememberMe}
                onCheckedChange={handleCheckboxChange}
                disabled={isLoading}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Ghi nhớ đăng nhập
              </Label>
            </div>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm mt-2">
            Chưa có tài khoản?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Đăng ký
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
