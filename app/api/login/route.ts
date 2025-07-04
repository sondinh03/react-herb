import { NextRequest, NextResponse } from "next/server";
import { AUTH_ERRORS } from "./error-messages";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 1. Check environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    console.log("apiUrl", apiUrl);
    if (!apiUrl) {
      console.error("NEXT_PUBLIC_API_URL is not configured");
      return NextResponse.json(AUTH_ERRORS.SYSTEM_ERROR, {
        status: AUTH_ERRORS.SYSTEM_ERROR.code,
      });
    }

    const fullUrl = `${apiUrl}/api/auth/login`;

    // 2. Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      console.log("Response from backend:", response);

      if (!response.ok) {
        console.log("HTTP Error Status:", response.status); // Log mã lỗi

        // 3. Try to get backend error message first
        let backendError = null;
        try {
          const errorText = await response.text();
          if (errorText.trim()) {
            backendError = JSON.parse(errorText);
          }
        } catch (parseError) {
          console.log("Could not parse error response:", parseError);
        }

        // Mapping lỗi dựa PURELY trên HTTP status code
        const errorMapping = {
          400: AUTH_ERRORS.BAD_REQUEST, // Thiếu/sai tham số
          401: AUTH_ERRORS.INVALID_CREDENTIALS, // Sai thông tin đăng nhập
          403: AUTH_ERRORS.FORBIDDEN, // Tài khoản bị khóa
          404: AUTH_ERRORS.NOT_FOUND, // API không tồn tại
          500: AUTH_ERRORS.SYSTEM_ERROR, // Lỗi server
        };

        // Lấy thông báo lỗi tương ứng hoặc dùng mặc định
        const mappedError = errorMapping[response.status] || {
          ...AUTH_ERRORS.DEFAULT_ERROR,
          code: response.status,
        };

        // 4. Use backend error message if available
        if (backendError?.message) {
          mappedError.message = backendError.message;
        }

        return NextResponse.json(mappedError, { status: response.status });
      }

      // 5. Handle response parsing safely
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("Failed to parse success response:", parseError);
        return NextResponse.json(AUTH_ERRORS.SYSTEM_ERROR, {
          status: AUTH_ERRORS.SYSTEM_ERROR.code,
        });
      }

      return NextResponse.json({
        code: 200,
        success: true,
        data: data.data || data,
        message: "Đăng nhập thành công",
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId); // Ensure timeout is cleared
      console.error("Fetch error:", fetchError);

      // 6. Handle specific fetch errors
      if (fetchError.name === 'AbortError') {
        return NextResponse.json({
          ...AUTH_ERRORS.SYSTEM_ERROR,
          message: "Yêu cầu quá thời gian chờ, vui lòng thử lại",
        }, {
          status: 408, // Request Timeout
        });
      }

      // Network/Connection errors
      if (fetchError.code === 'ECONNREFUSED' || 
          fetchError.code === 'ENOTFOUND' ||
          fetchError.message.includes('fetch')) {
        return NextResponse.json({
          ...AUTH_ERRORS.SYSTEM_ERROR,
          message: "Không thể kết nối đến máy chủ, vui lòng thử lại sau",
        }, {
          status: 503, // Service Unavailable
        });
      }

      return NextResponse.json(AUTH_ERRORS.SYSTEM_ERROR, {
        status: AUTH_ERRORS.SYSTEM_ERROR.code,
      });
    }
  } catch (error: any) {
    console.error("Unexpected error in login route:", error);
    return NextResponse.json(AUTH_ERRORS.DEFAULT_ERROR, {
      status: AUTH_ERRORS.DEFAULT_ERROR.code,
    });
  }
}
