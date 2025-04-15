"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Edit,
  Save,
  Lock,
  Mail,
  User,
  Clock,
  Shield,
  CheckCircle,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface UserProfile {
  id: number;
  username: string;
  email: string;
  fullName: string;
  roleType: number;
  status: number;
  lastLogin: string;
  createdAt: string;
  phoneNumber?: string;
  address?: string;
}

interface LoginHistory {
  id: number;
  userId: number;
  loginTime: string;
  ipAddress: string;
  userAgent: string;
}

export default function UserProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    phoneNumber: "",
    address: "",
  });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePasswordError, setChangePasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const response = await fetch("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Không thể lấy thông tin tài khoản");
        }

        const data = await response.json();
        setUser(data.user);
        setLoginHistory(data.loginHistory || []);
        
        // Thiết lập form chỉnh sửa
        setEditForm({
          fullName: data.user.fullName || "",
          phoneNumber: data.user.phoneNumber || "",
          address: data.user.address || "",
        });
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

    fetchUserProfile();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form khi hủy chỉnh sửa
      setEditForm({
        fullName: user?.fullName || "",
        phoneNumber: user?.phoneNumber || "",
        address: user?.address || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm({
      ...editForm,
      [name]: value,
    });
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        throw new Error("Không thể cập nhật thông tin tài khoản");
      }

      const data = await response.json();
      setUser({
        ...user!,
        ...editForm,
      });
      
      setIsEditing(false);
      toast({
        title: "Thành công",
        description: "Thông tin tài khoản đã được cập nhật",
      });
    } catch (err: any) {
      toast({
        title: "Lỗi",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangePasswordError(null);
    
    if (newPassword !== confirmPassword) {
      setChangePasswordError("Mật khẩu mới không khớp");
      return;
    }
    
    try {
      setIsChangingPassword(true);
      const token = localStorage.getItem("accessToken");
      const response = await fetch("/api/user/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể đổi mật khẩu");
      }

      // Reset các trường
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast({
        title: "Thành công",
        description: "Mật khẩu đã được thay đổi",
      });
    } catch (err: any) {
      setChangePasswordError(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleName = (roleType: number): string => {
    switch (roleType) {
      case 1:
        return "Quản trị hệ thống";
      case 2:
        return "Biên tập viên";
      default:
        return "Người dùng thường";
    }
  };

  const getStatusLabel = (status: number): { label: string; variant: string } => {
    switch (status) {
      case 1:
        return { label: "Hoạt động", variant: "success" };
      case 2:
        return { label: "Không hoạt động", variant: "secondary" };
      case 3:
        return { label: "Đã chặn", variant: "destructive" };
      default:
        return { label: "Không xác định", variant: "secondary" };
    }
  };

  if (isLoading && !user) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-current border-r-transparent"></div>
          <p className="mt-4">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <p className="text-red-500">
                {error || "Không thể tải thông tin tài khoản"}
              </p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Thử lại
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Thông tin cá nhân</h1>
            <p className="text-gray-500 mt-1">
              Xem và cập nhật thông tin tài khoản của bạn
            </p>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Thông tin tài khoản</CardTitle>
                <CardDescription>
                  Xem và cập nhật thông tin cá nhân của bạn
                </CardDescription>
              </div>
              <Button 
                variant={isEditing ? "outline" : "default"} 
                onClick={handleEditToggle}
              >
                {isEditing ? (
                  <>
                    <X className="h-4 w-4 mr-2" /> Hủy
                  </>
                ) : (
                  <>
                    <Edit className="h-4 w-4 mr-2" /> Chỉnh sửa
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleSubmitEdit}>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="username">Tên đăng nhập</Label>
                        <Input
                          id="username"
                          value={user.username}
                          disabled
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Tên đăng nhập không thể thay đổi
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user.email}
                          disabled
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Liên hệ quản trị viên để thay đổi email
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Họ và tên</Label>
                        <Input
                          id="fullName"
                          name="fullName"
                          value={editForm.fullName}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Số điện thoại</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          value={editForm.phoneNumber}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="address">Địa chỉ</Label>
                      <Input
                        id="address"
                        name="address"
                        value={editForm.address}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                    </div>

                    <div className="pt-4">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                            Đang lưu...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" /> Lưu thay đổi
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-x-4 gap-y-6">
                    <div className="flex-1 min-w-[250px]">
                      <h3 className="text-sm font-medium text-gray-500">Tên đăng nhập</h3>
                      <p className="mt-1 text-base font-medium">{user.username}</p>
                    </div>
                    <div className="flex-1 min-w-[250px]">
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-base">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-6">
                    <div className="flex-1 min-w-[250px]">
                      <h3 className="text-sm font-medium text-gray-500">Họ và tên</h3>
                      <p className="mt-1 text-base">{user.fullName || "Chưa cung cấp"}</p>
                    </div>
                    <div className="flex-1 min-w-[250px]">
                      <h3 className="text-sm font-medium text-gray-500">Vai trò</h3>
                      <div className="mt-1">
                        <Badge variant={user.roleType === 1 ? "destructive" : user.roleType === 2 ? "secondary" : "default"}>
                          {getRoleName(user.roleType)}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-6">
                    <div className="flex-1 min-w-[250px]">
                      <h3 className="text-sm font-medium text-gray-500">Số điện thoại</h3>
                      <p className="mt-1 text-base">{user.phoneNumber || "Chưa cung cấp"}</p>
                    </div>
                    <div className="flex-1 min-w-[250px]">
                      <h3 className="text-sm font-medium text-gray-500">Trạng thái</h3>
                      <div className="mt-1">
                        <Badge variant={statusInfo.variant as any}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-x-4 gap-y-6">
                    <div className="flex-1 min-w-[250px]">
                      <h3 className="text-sm font-medium text-gray-500">Địa chỉ</h3>
                      <p className="mt-1 text-base">{user.address || "Chưa cung cấp"}</p>
                    </div>
                    <div className="flex-1 min-w-[250px]">
                      <h3 className="text-sm font-medium text-gray-500">Ngày tạo tài khoản</h3>
                      <p className="mt-1 text-base">{user.createdAt}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Đổi mật khẩu</CardTitle>
                <CardDescription>
                  Cập nhật mật khẩu đăng nhập của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword}>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="newPassword">Mật khẩu mới</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    {changePasswordError && (
                      <div className="text-red-500 text-sm">{changePasswordError}</div>
                    )}
                    
                    <Button type="submit" className="mt-2" disabled={isChangingPassword}>
                      {isChangingPassword ? (
                        <>
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></div>
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4 mr-2" /> Đổi mật khẩu
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Lịch sử đăng nhập</CardTitle>
                <CardDescription>
                  Các lần đăng nhập gần đây của bạn
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loginHistory.length > 0 ? (
                  <div className="space-y-6">
                    {loginHistory.map((entry) => (
                      <div key={entry.id} className="flex items-start p-3 border rounded-md">
                        <div className="mr-3 bg-gray-100 p-2 rounded-full">
                          <Clock className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">Đăng nhập thành công</p>
                          <div className="text-sm text-gray-500 mt-1">
                            <p>Thời gian: {entry.loginTime}</p>
                            <p>IP: {entry.ipAddress}</p>
                            <p className="truncate max-w-xs">Thiết bị: {entry.userAgent}</p>
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
              <CardFooter className="flex justify-between border-t p-4">
                <div className="text-sm text-gray-500">
                  Lần đăng nhập cuối: {user.lastLogin || "Chưa đăng nhập"}
                </div>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}