"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { fetchApi } from "@/lib/api-client";
import { tree } from "next/dist/build/templates/app-page";
import { error } from "console";

interface LoginData {
  accessToken: string;
  tokenType: string; 
  refreshToken: string;
  user: {
    id: number;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    username: string;
    email: string;
    fullName: string;
    roleType: number;
    status: number;
  };
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) || email.length > 3;
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// Ngăn chặn XSS
const sanitizeInput = (input: string): string => {
  return input.replace(/[<>]/g, "");
};

class RateLimiter {
  private attempts: number = 0;
  private lastAttempt: number = 0;
  private readonly maxAttemptes: number = 5;
  private readonly windowMs: number = 15 * 60 * 1000; // 15 phuts

  canAttempt(): boolean {
    const now = Date.now();
    if (now - this.lastAttempt > this.windowMs) {
      this.attempts = 0;
    }
    return this.attempts < this.maxAttemptes;
  }

  recordAttempt(): void {
    this.attempts++;
    this.lastAttempt = Date.now();
  }

  getRemainingTime(): number {
    const now = Date.now();
    const remaining = this.windowMs - (now - this.lastAttempt);
    return Math.max(0, Math.ceil(remaining / 1000 / 60)); // phuts
  }
}

const rateLimiter = new RateLimiter();

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    password: "",
  });

  // Validate session dang ton tai
  const validateSession = useCallback(async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const userData = localStorage.getItem("userData");

      if (!accessToken || !userData) {
        setIsValidating(false);
        return;
      }

      // Validate token with server
      const response = await fetchApi("/api/validte-token", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.code === 200) {
        const user = JSON.parse(userData);
        // Redirect based on role
        if (user.roleType === ROLE_TYPES.ADMIN) {
          router.replace("/admin");
        } else {
          router.replace("/");
        }
      } else {
        // Clear invalid tokens
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
      }
    } catch (error) {
      console.error("Session validation error:", error);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userData");
    } finally {
      setIsValidating(false);
    }
  }, [router]);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

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
    const sanitizedValue = sanitizeInput(value);

    const fieldName = id === "email" ? "username" : id;

    setFormData((prev) => ({
      ...prev,
      [fieldName]: sanitizedValue,
    }));

    // Clear errors when user starts typing
    if (errors[fieldName as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [fieldName]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors = {
      username: "",
      password: "",
    };

    if (!formData.username.trim()) {
      newErrors.username = "Vui lòng nhập email hoặc tên đăng nhập";
    } else if (!validateEmail(formData.username)) {
      newErrors.username = "Email hoặc tên đăng nhập không hợp lệ";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (!validatePassword(formData.password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    setErrors(newErrors);
    return !newErrors.username && !newErrors.password;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    //Rate limitting check
    if (!rateLimiter.canAttempt()) {
      toast({
        title: "Đăng nhập bị tạm khóa",
        description: `Vui lòng thử lại sau ${rateLimiter.getRemainingTime()} phút`,
        variant: "destructive",
      });
      return;
    }

    if (!validateForm()) {
      if (errors.username) {
      toast({
        title: "Lỗi nhập liệu",
        description: errors.username,
        variant: "destructive",
        duration: 3000,
      });
    } else if (errors.password) {
      toast({
        title: "Lỗi nhập liệu",
        description: errors.password,
        variant: "destructive",
        duration: 3000,
      });
    }
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetchApi<LoginData>("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
      });

      if (response.code !== 200) {
        rateLimiter.recordAttempt();
        throw new Error(response.message || AUTH_ERRORS.DEFAULT_ERROR.message);
      }

      const { accessToken, refreshToken, user } = response.data || {};

      if (!accessToken || !user) {
        throw new Error("Dữ liệu đăng nhập không hợp lệ");
      }

      // Store tokens securely (consider using httpOnly cookies in production)
      localStorage.setItem("accessToken", accessToken);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      localStorage.setItem("userData", JSON.stringify(user));

      // Thông báo đăng nhập thành công
      toast({
        title: "Đăng nhập thành công",
        description: `Chào mừng ${user?.fullName || "bạn"}`,
        variant: "default",
        duration: 3000,
      });

      if (user?.roleType === ROLE_TYPES.ADMIN) {
        router.replace("/admin");
      } else {
        router.replace("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      // Differentiate between network and server errors
      const isNetworkError = !navigator.onLine || error.name === "NetworkError";
      const errorMessage = isNetworkError
        ? "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
        : error.message || "Đăng nhập thất bại";

      toast({
        title: "Đăng nhập thất bại",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });

      // Clear password on failed login
      setFormData((prev) => ({
        ...prev,
        password: "",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating session
  if (isValidating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-green-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-green-600">Đang kiểm tra phiên đăng nhập...</p>
        </div>
      </div>
    );
  }

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
