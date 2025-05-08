"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Edit, Lock, Clock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import { Spinner } from "@/components/spinner";
import { User } from "@/app/types/user";
import {
  ROLE_TYPE_LABELS,
  ROLE_TYPES,
  STATUS_LABELS,
  STATUSES,
} from "@/constant/user";

// interface User {
//   id: number;
//   username: string;
//   email: string;
//   fullName: string;
//   roleType: number;
//   status: number;
//   lastLogin: string;
//   createdAt: string;
// }

interface LoginHistory {
  id: number;
  userId: number;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
}

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [user, setUser] = useState<User | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch(`/api/admin/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Không thể lấy thông tin người dùng");
        }

        const data = await response.json();
        setUser(data.data);
        setLoginHistory(data.loginHistory || []);
      } catch (err: any) {
        setError(err.message);
        toast({
          title: "Lỗi",
          description: err.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);

  const handleEdit = () => {
    router.push(`/admin/users/edit/${userId}`);
  };

  const handleResetPassword = async () => {
    // Implement reset password logic
    toast.info({
      title: "Chức năng chưa hoàn thiện",
      description: "Tính năng reset mật khẩu đang được phát triển",
    });
  };

  const getRoleName = (roleType: number): string => {
    switch (roleType) {
      case ROLE_TYPES.ADMIN:
        return ROLE_TYPE_LABELS[ROLE_TYPES.ADMIN];
      case ROLE_TYPES.EDITOR:
        return ROLE_TYPE_LABELS[ROLE_TYPES.EDITOR];
      case ROLE_TYPES.EXPERT:
        return ROLE_TYPE_LABELS[ROLE_TYPES.EXPERT];
      default:
        return ROLE_TYPE_LABELS[ROLE_TYPES.USER];
    }
  };

  const getStatusLabel = (
    status: number
  ): { statusLabel: string; statusVariant: string } => {
    let statusLabel: string;
    let statusVariant: string;

    switch (status) {
      case STATUSES.ACTIVE:
        statusLabel = STATUS_LABELS[STATUSES.ACTIVE];
        statusVariant = "success";
        break;
      case STATUSES.INACTIVE:
        statusLabel = STATUS_LABELS[STATUSES.INACTIVE];
        statusVariant = "secondary";
        break;
      case STATUSES.BANNED:
        statusLabel = STATUS_LABELS[STATUSES.BANNED];
        statusVariant = "destructive";
        break;
      case STATUSES.PENDING:
        statusLabel = STATUS_LABELS[STATUSES.PENDING];
        statusVariant = "destructive";
        break;
      default:
        statusLabel = STATUS_LABELS[STATUSES.DELETED];
        statusVariant = "secondary";
    }

    return { statusLabel, statusVariant };
  };

  if (isLoading) {
    return <Spinner></Spinner>;
  }

  if (error || !user) {
    return (
      <div className="container mx-auto py-8">
        <Link href="/admin/users">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-red-500">
                {error || "Không tìm thấy thông tin người dùng"}
              </p>
              <Button
                onClick={() => router.push("/admin/users")}
                className="mt-4"
              >
                Quay lại danh sách người dùng
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusInfo = getStatusLabel(user.status);

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin/users">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Chi tiết người dùng</h1>
            <p className="text-gray-500 mt-1">
              Xem thông tin chi tiết và quản lý người dùng
            </p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0">
            <Button variant="outline" onClick={handleResetPassword}>
              <Lock className="h-4 w-4 mr-2" /> Đặt lại mật khẩu
            </Button>
            <Button onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="max-w-4xl mx-auto">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="security">Bảo mật & Đăng nhập</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin người dùng</CardTitle>
              <CardDescription>
                Thông tin chi tiết về tài khoản người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">ID</h3>
                    <p className="mt-1 text-base">{user.id}</p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Tên đăng nhập
                    </h3>
                    <p className="mt-1 text-base font-medium">
                      {user.username}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Họ và tên
                    </h3>
                    <p className="mt-1 text-base">{user.fullName}</p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1 text-base">{user.email}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Vai trò
                    </h3>
                    <div className="mt-1">
                      <Badge
                        variant={
                          user.roleType === 1
                            ? "destructive"
                            : user.roleType === 2
                            ? "secondary"
                            : "default"
                        }
                      >
                        {getRoleName(user.roleType)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Trạng thái
                    </h3>
                    <div className="mt-1">
                      <Badge variant={statusInfo.statusVariant as any}>
                        {statusInfo.statusLabel}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-6">
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">
                      Ngày tạo
                    </h3>
                    <p className="mt-1 text-base">{new Date(user.createdAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                  <div className="flex-1 min-w-[250px]">
                    <h3 className="text-sm font-medium text-gray-500">Chỉnh sửa lần cuối</h3>
                    <p className="mt-1 text-base">{new Date(user.updatedAt).toLocaleDateString("vi-VN")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đăng nhập</CardTitle>
              <CardDescription>
                Các lần đăng nhập gần đây của người dùng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loginHistory.length > 0 ? (
                <div className="space-y-6">
                  {loginHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start p-3 border rounded-md"
                    >
                      <div className="mr-3 bg-gray-100 p-2 rounded-full">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Đăng nhập thành công</p>
                        <div className="text-sm text-gray-500 mt-1">
                          <p>Thời gian: {entry.loginTime}</p>
                          <p>IP: {entry.ipAddress}</p>
                          <p className="truncate max-w-xs">
                            Thiết bị: {entry.userAgent}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  Không có lịch sử đăng nhập gần đây
                </div>
              )}
            </CardContent>
            {/**
            <CardFooter className="flex justify-between border-t p-4">
              <div className="text-sm text-gray-500">
                <span className="font-medium">{user.loginCount || 0}</span> lần đăng nhập
              </div>
              <div className="text-sm text-gray-500">
                Đăng nhập cuối: {user.lastLogin || "Chưa đăng nhập"}
              </div>
            </CardFooter>
             */}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
