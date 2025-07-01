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
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  ROLE_TYPE_LABELS,
  ROLE_TYPES,
  STATUS_LABELS,
  STATUSES,
} from "@/constants/user";

// Định nghĩa schema validation
const userFormSchema = z
  .object({
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
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    passwordConfirm: z
      .string()
      .min(6, "Xác nhận mật khẩu phải có ít nhất 6 ký tự"),
    roleType: z.string(),
    status: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["passwordConfirm"],
  });

type UserFormValues = z.infer<typeof userFormSchema>;

export default function CreateUserPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(true);
  const [showConfirmPassword, setShowConfirmPassword] = useState(true);

  // Khởi tạo form với React Hook Form và Zod
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      username: "",
      email: "",
      fullName: "",
      password: "",
      passwordConfirm: "",
      roleType: ROLE_TYPES.USER.toString(),
      status: STATUSES.ACTIVE.toString(),
    },
  });

  // Xử lý submit form
  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);
    try {
      // Chuyển đổi roleType và status từ string sang number
      const userData = {
        ...values,
        roleType: Number.parseInt(values.roleType),
        status: Number.parseInt(values.status),
        isAdminCreation: true, // Flag to indicate this is an admin creating a user
      };

      const token = localStorage.getItem("accessToken");

      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (result.success) {
        form.reset({
          username: "",
          email: "",
          fullName: "",
          password: "",
          passwordConfirm: "",
          roleType: "1", // Default: User
          status: "1", // Default: Active
        });
        toast({
          title: "Thành công",
          description: "Tạo người dùng mới thành công",
        });
        // router.push("/admin/users");
      } else {
        toast({
          title: "Lỗi",
          description: result.message || "Không thể tạo người dùng mới",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Lỗi",
        description: error.message || "Đã xảy ra lỗi khi tạo người dùng mới",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle hiển thị xác nhận mật khẩu
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <Link href="/admin/users">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Thêm người dùng mới</h1>
        <p className="text-gray-500 mt-1">
          Tạo tài khoản người dùng mới trong hệ thống
        </p>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Thông tin người dùng</CardTitle>
          <CardDescription>
            Nhập thông tin chi tiết để tạo tài khoản mới
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
                      <Input placeholder="Nhập tên đăng nhập" {...field} />
                    </FormControl>
                    <FormDescription>
                      Tên đăng nhập dùng để đăng nhập vào hệ thống
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Nhập mật khẩu"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="passwordConfirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Xác nhận mật khẩu</FormLabel>
                      <FormControl>
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Nhập lại mật khẩu"
                          {...field}
                        />
                      </FormControl>
                      {/* <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={toggleConfirmPasswordVisibility}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="roleType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
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
                        value={field.value}
                        disabled={true}
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
                <Link href="/admin/users">
                  <Button variant="outline" type="button">
                    Hủy
                  </Button>
                </Link>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Tạo người dùng
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
