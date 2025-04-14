import { NextRequest, NextResponse } from "next/server";
import { AUTH_ERRORS } from "./error-messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    const fullUrl = `${apiUrl}/api/auth/login`;

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        console.log("HTTP Error Status:", response.status); // Log mã lỗi

        // Mapping lỗi dựa PURELY trên HTTP status code
        const errorMapping = {
          400: AUTH_ERRORS.BAD_REQUEST, // Thiếu/sai tham số
          401: AUTH_ERRORS.INVALID_CREDENTIALS, // Sai thông tin đăng nhập
          403: AUTH_ERRORS.ACCOUNT_LOCKED, // Tài khoản bị khóa
          404: AUTH_ERRORS.NOT_FOUND, // API không tồn tại
          500: AUTH_ERRORS.SYSTEM_ERROR, // Lỗi server
        };

        // Lấy thông báo lỗi tương ứng hoặc dùng mặc định
        const mappedError = errorMapping[response.status] || {
          ...AUTH_ERRORS.DEFAULT_ERROR,
          code: response.status, // Giữ nguyên status code gốc
        };

        return NextResponse.json(mappedError, { status: response.status });
      }

      const data = await response.json();

      return NextResponse.json({
        success: true,
        data: data.data,
        message: "Đăng nhập thành công",
      });
    } catch (fetchError: any) {
      console.error("Fetch error:", fetchError);

      return NextResponse.json(AUTH_ERRORS.NETWORK_ERROR, {
        status: AUTH_ERRORS.NETWORK_ERROR.code,
      });
    }
  } catch (error: any) {
    console.error("Unexpected error in login route:", error);
    return NextResponse.json(AUTH_ERRORS.DEFAULT_ERROR, {
      status: AUTH_ERRORS.DEFAULT_ERROR.code,
    });
  }
}
