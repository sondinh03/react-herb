"use client";

import React, { useState } from "react";
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
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { AUTH_ERRORS } from "../api/login/error-messages";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROLE_TYPE_LABELS, ROLE_TYPES, STATUSES } from "@/constant/user";
import { fetchApi } from "@/lib/api-client";
import { RegisterResponse } from "../types/user";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    fullName: "",
    roleType: String(ROLE_TYPES.USER),
  });

  const [formErrors, setFormErrors] = useState({
    username: "",
    email: "",
    password: "",
    passwordConfirm: "",
    fullName: "",
    roleType: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      [id]: "",
    }));
  };

  const handleRoleChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      roleType: value,
    }));
    setFormErrors((prev) => ({
      ...prev,
      roleType: "",
    }));
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { ...formErrors };

    // Kiểm tra email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Email không hợp lệ";
      isValid = false;
    }

    // Kiểm tra mật khẩu
    if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
      isValid = false;
    }

    // Kiểm tra xác nhận mật khẩu
    if (formData.password !== formData.passwordConfirm) {
      errors.passwordConfirm = "Mật khẩu xác nhận không khớp";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    // Ngăn form tải lại trang mặc định
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Kiểm tra lại thông tin",
        description: "Vui lòng sửa các lỗi trong biểu mẫu",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await fetchApi<RegisterResponse>("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        passwordConfirm: "",
        fullName: "",
        roleType: String(ROLE_TYPES.USER),
      });

      // Hiển thị toast và chuyển hướng
      if (result.success) {
        if (formData.roleType === String(ROLE_TYPES.USER)) {
          toast({
            title: "Đăng ký thành công",
            description: "Bạn có thể đăng nhập ngay bây giờ.",
            variant: "default",
            duration: 5000,
            className: "bg-green-100 border-green-500 text-green-800",
          });
          router.push("/login");
        } else {
          toast({
            title: "Đăng ký thành công",
            description:
              "Tài khoản của bạn đã được gửi để phê duyệt. Vui lòng liên hệ quản trị viên để xác minh thêm nếu cần.",
            variant: "default",
            duration: 5000,
            className: "bg-green-100 border-green-500 text-green-800",
          });
          // router.push("/pending-approval");
          router.push("/");
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Đăng ký thất bại",
        description: error.message || "Có lỗi xảy ra khi đăng ký",
        variant: "destructive",
        duration: 5000,
        className: "bg-red-100 border-red-500 text-red-800",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-green-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md border-green-200 shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-green-600 flex items-center justify-center">
              <span className="text-white font-bold text-xl">DL</span>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center text-green-800">
            Đăng ký tài khoản
          </CardTitle>
          <CardDescription className="text-center text-green-600">
            Nhập thông tin để tạo tài khoản mới cho hệ thống cây dược liệu
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-green-700">
                Họ và tên
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Nhập họ và tên"
                value={formData.fullName}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                className="border-green-300 focus:border-green-500 focus:ring-green-500 hover:border-green-400 text-green-800"
                style={
                  {
                    "--tw-ring-color": "rgb(34 197 94 / 0.5)",
                  } as React.CSSProperties
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-green-700">
                Tên đăng nhập
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Nhập tên đăng nhập"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                className="border-green-300 focus:border-green-500 focus:ring-green-500 hover:border-green-400 text-green-800"
                style={
                  {
                    "--tw-ring-color": "rgb(34 197 94 / 0.5)",
                  } as React.CSSProperties
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-green-700">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                required
                className="border-green-300 focus:border-green-500 focus:ring-green-500 hover:border-green-400 text-green-800"
                style={
                  {
                    "--tw-ring-color": "rgb(34 197 94 / 0.5)",
                  } as React.CSSProperties
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roleType" className="text-green-700">
                Vai trò
              </Label>
              <Select
                value={formData.roleType}
                onValueChange={handleRoleChange}
                disabled={isLoading}
              >
                <SelectTrigger
                  className="border-green-300 focus:border-green-500 focus:ring-green-500 hover:border-green-400 text-green-800"
                  style={
                    {
                      "--tw-ring-color": "rgb(34 197 94 / 0.5)",
                    } as React.CSSProperties
                  }
                >
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent className="border-green-300 bg-white text-green-800">
                  <SelectItem
                    value={String(ROLE_TYPES.USER)}
                    className="text-green-800 hover:bg-green-50 hover:text-green-900 focus:bg-green-100 focus:text-green-900 focus:outline-none"
                  >
                    {ROLE_TYPE_LABELS[ROLE_TYPES.USER]}
                  </SelectItem>
                  <SelectItem
                    value={String(ROLE_TYPES.EDITOR)}
                    className="text-green-800 hover:bg-green-50 hover:text-green-900 focus:bg-green-100 focus:text-green-900 focus:outline-none"
                  >
                    {ROLE_TYPE_LABELS[ROLE_TYPES.EDITOR]}
                  </SelectItem>
                  <SelectItem
                    value={String(ROLE_TYPES.EXPERT)}
                    className="text-green-800 hover:bg-green-50 hover:text-green-900 focus:bg-green-100 focus:text-green-900 focus:outline-none"
                  >
                    {ROLE_TYPE_LABELS[ROLE_TYPES.EXPERT]}
                  </SelectItem>
                </SelectContent>
              </Select>
              {formErrors.roleType && (
                <p className="text-sm text-red-500">{formErrors.roleType}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-green-700">
                Mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  className="border-green-300 focus:border-green-500 focus:ring-green-500 hover:border-green-400 text-green-800"
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
                  className="absolute right-0 top-0 h-full px-3 py-2 text-green-600 hover:bg-green-50"
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
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm" className="text-green-700">
                Xác nhận mật khẩu
              </Label>
              <div className="relative">
                <Input
                  id="passwordConfirm"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.passwordConfirm}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  required
                  className="border-green-300 focus:border-green-500 focus:ring-green-500 hover:border-green-400 text-green-800"
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
                  className="absolute right-0 top-0 h-full px-3 py-2 text-green-600 hover:bg-green-50"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  </span>
                </Button>
              </div>
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm mt-2 text-green-700">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-medium text-green-600 hover:underline"
            >
              Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
