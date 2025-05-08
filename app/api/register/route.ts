import { NextRequest, NextResponse } from "next/server";
import { API_ERRORS, callApiPost, extractToken } from "@/lib/api-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    const isAdminCreation = body.isAdminCreation === true;
    const endpoint = isAdminCreation
      ? "/api/users/create"
      : "/api/auth/register";
    const fullUrl = `${apiUrl}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (isAdminCreation) {
      const token = extractToken(request);
      console.log("token: " + token)
      if (!token) {
        return NextResponse.json(API_ERRORS.UNAUTHORIZED, { status: 401 });
      }
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        // Mapping errors based on HTTP status code
        const errorMapping = {
          400: API_ERRORS.BAD_REQUEST,
          401: API_ERRORS.UNAUTHORIZED,
          403: API_ERRORS.FORBIDDEN,
          404: API_ERRORS.NOT_FOUND,
          500: API_ERRORS.SYSTEM_ERROR,
        };

        let errorMessage;

        try {
          const errorBody = await response.text();
          // Check if the body has data
          if (errorBody.trim()) {
            const parsedErrorBody = JSON.parse(errorBody);
            errorMessage = parsedErrorBody.message;
          }
        } catch {
          errorMessage = undefined;
        }

        // Get the error message
        const mappedError = errorMapping[response.status] || {
          ...API_ERRORS.DEFAULT_ERROR,
          code: response.status,
        };

        // If there's a message from the response, override the default message
        if (errorMessage) {
          mappedError.message = errorMessage;
        }
        return NextResponse.json(mappedError, { status: response.status });
      }

      const data = await response.json();

      const successMessage = isAdminCreation
        ? "Tạo người dùng thành công"
        : "Đăng ký thành công";

      return NextResponse.json({
        code: 200,
        success: true,
        data: data.data || data,
        message: successMessage,
      });
    } catch (fetchError: any) {
      if (fetchError.name === "AbortError") {
        return NextResponse.json(API_ERRORS.TIMEOUT_ERROR, {
          status: API_ERRORS.TIMEOUT_ERROR.code,
        });
      }

      return NextResponse.json(API_ERRORS.NETWORK_ERROR, {
        status: API_ERRORS.NETWORK_ERROR.code,
      });
    }
  } catch (error: any) {
    return NextResponse.json(API_ERRORS.DEFAULT_ERROR, {
      status: API_ERRORS.DEFAULT_ERROR.code,
    });
  }
}
/*
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const isAdminCreation = body.isAdminCreation === true;
    const endpoint = isAdminCreation ? "/api/users/create" : "/api/auth/register";
    const successMessage = isAdminCreation ? "Tạo người dùng thành công" : "Đăng ký thành công";

    return await callApiPost(request, endpoint, successMessage, {
      requireAuth: isAdminCreation,
    });
  } catch (error: any) {
    console.error("Error in /api/register:", error);
    return NextResponse.json(API_ERRORS.DEFAULT_ERROR, {
      status: API_ERRORS.DEFAULT_ERROR.code,
    });
  }
}
  */
