"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { User } from "@/app/types/user";
import {
  ROLE_TYPE_LABELS,
  ROLE_TYPES,
  STATUS_LABELS,
  STATUSES,
} from "@/constant/user";
import { Spinner } from "@/components/spinner";

// Định nghĩa schema validation cho form chỉnh sửa
const userEditFormSchema = z.object({
  username: z
    .string()
    .min(3, "Tên đăng nhập phải có ít nhất 3 ký tự")
    .max(50, "Tên đăng nhập không được vượt quá 50 ký tự")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"
    ),
  email: z.string().email("Email không hợp lệ"),
  fullName: z
    .string()
    .min(2, "Họ tên phải có ít nhất 2 ký tự")
    .max(100, "Họ tên không được vượt quá 100 ký tự"),
  roleType: z.string(),
  status: z.string(),
  //   phoneNumber: z.string().optional(),
  //   address: z.string().optional(),
});

type UserEditFormValues = z.infer<typeof userEditFormSchema>;

// interface User {
//   id: number;
//   username: string;
//   email: string;
//   fullName: string;
//   roleType: number;
//   status: number;
// }

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Khởi tạo form với React Hook Form và Zod
  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditFormSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      roleType: "",
      status: "",
    },
  });

  // Lấy thông tin người dùng khi component được load
  useEffect(() => {
    const fetchUserData = async () => {
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

        // Điền form với dữ liệu người dùng
        form.reset({
          username: data.data.username,
          email: data.data.email,
          fullName: data.data.fullName,
          roleType: data.data.roleType.toString(),
          status: data.data.status.toString(),
          //   phoneNumber: data.user.phoneNumber || "",
          //   address: data.user.address || "",
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

    if (userId) {
      fetchUserData();
    }
  }, [userId, form]);

  // Xử lý submit form
  const onSubmit = async (values: UserEditFormValues) => {
    setIsSubmitting(true);
    try {
      // Chuyển đổi roleType và status từ string sang number
      const userData = {
        ...values,
        roleType: Number.parseInt(values.roleType),
        status: Number.parseInt(values.status),
      };

      const token = localStorage.getItem("accessToken");

      const response = await fetch(`/api/admin/users/edit/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success({
          title: "Thành công",
          description: "Cập nhật thông tin người dùng thành công",
        });
        router.push(`/admin/users/${userId}`);
      } else {
        toast({
          title: "Lỗi",
          description:
            result.message || "Không thể cập nhật thông tin người dùng",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Lỗi",
        description:
          error.message || "Đã xảy ra lỗi khi cập nhật thông tin người dùng",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href={`/admin/users/${userId}`}>
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại chi tiết
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Chỉnh sửa người dùng</h1>
        <p className="text-gray-500 mt-1">
          Cập nhật thông tin người dùng {user.fullName}
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Thông tin người dùng</CardTitle>
          <CardDescription>
            Chỉnh sửa thông tin chi tiết của người dùng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên đăng nhập</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập tên đăng nhập"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormDescription>
                      Tên đăng nhập không thể thay đổi sau khi tạo
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="Nhập địa chỉ email"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ tên</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập họ tên đầy đủ" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/** 
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập số điện thoại" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Địa chỉ</FormLabel>
                      <FormControl>
                        <Input placeholder="Nhập địa chỉ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="roleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn vai trò" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={ROLE_TYPES.ADMIN.toString()}>
                            {ROLE_TYPE_LABELS[ROLE_TYPES.ADMIN]}
                          </SelectItem>
                          <SelectItem value={ROLE_TYPES.EDITOR.toString()}>
                            {ROLE_TYPE_LABELS[ROLE_TYPES.EDITOR]}
                          </SelectItem>
                          <SelectItem value={ROLE_TYPES.EXPERT.toString()}>
                            {ROLE_TYPE_LABELS[ROLE_TYPES.EXPERT]}
                          </SelectItem>
                          <SelectItem value={ROLE_TYPES.USER.toString()}>
                            {ROLE_TYPE_LABELS[ROLE_TYPES.USER]}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trạng thái</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={STATUSES.ACTIVE.toString()}>
                            {STATUS_LABELS[STATUSES.ACTIVE]}
                          </SelectItem>
                          <SelectItem value={STATUSES.INACTIVE.toString()}>
                            {STATUS_LABELS[STATUSES.INACTIVE]}
                          </SelectItem>
                          <SelectItem value={STATUSES.BANNED.toString()}>
                            {STATUS_LABELS[STATUSES.BANNED]}
                          </SelectItem>
                          <SelectItem value={STATUSES.PENDING.toString()}>
                            {STATUS_LABELS[STATUSES.PENDING]}
                          </SelectItem>
                          <SelectItem value={STATUSES.DELETED.toString()}>
                            {STATUS_LABELS[STATUSES.DELETED]}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <CardFooter className="flex justify-end gap-2 px-0">
                <Link href={`/admin/users/${userId}`}>
                  <Button variant="outline" type="button">
                    Hủy
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Cập nhật
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
