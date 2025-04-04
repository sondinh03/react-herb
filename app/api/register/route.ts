import { NextRequest, NextResponse } from "next/server";
import { AUTH_ERRORS } from "../login/error-messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    const fullUrl = `${apiUrl}/api/auth/register`;

    try {
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // Mapping lỗi dựa trên HTTP status code
        const errorMapping = {
          400: AUTH_ERRORS.INVALID_REGISTRATION,
          500: AUTH_ERRORS.SYSTEM_ERROR,
        };

        let errorMessage;

        try {
          const errorBody = await response.text();
          // Kiểm tra xem body có dữ liệu không
          if (errorBody.trim()) {
            const parsedErrorBody = JSON.parse(errorBody);
            errorMessage = parsedErrorBody.message;
          }
        } catch {
          errorMessage = undefined;
        }

        // Lấy thông báo lỗi
        const mappedError = errorMapping[response.status] || {
          ...AUTH_ERRORS.DEFAULT_ERROR,
          code: response.status,
        };

        // Nếu có message từ response, ghi đè message mặc định
        if (errorMessage) {
          mappedError.message = errorMessage;
        }
        return NextResponse.json(mappedError, { status: response.status });
      }

      const data = await response.json();

      return NextResponse.json({
        success: true,
        data: data.data,
        message: "Đăng ký thành công",
      });
    } catch (fetchError: any) {
      
    }
  } catch (error: any) {
    console.error("Unexpected error in registration route:", error);
    return NextResponse.json(AUTH_ERRORS.DEFAULT_ERROR, {
      status: AUTH_ERRORS.DEFAULT_ERROR.code,
    });
  }
}
