/*
import { API_ERRORS, extractToken } from "@/lib/api-utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Extract token from the request
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json(API_ERRORS.UNAUTHORIZED, { status: 401 });
    }

    // Build API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    const fullUrl = `${apiUrl}/api/users/${params.id}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Call the API
    const response = await fetch(fullUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      // Map error based on HTTP status code
      const errorMapping: Record<number, any> = {
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

      const mappedError = errorMapping[response.status] || {
        ...API_ERRORS.DEFAULT_ERROR,
        code: response.status,
      };

      if (errorMessage) {
        mappedError.message = errorMessage;
      }

      return NextResponse.json(mappedError, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: data.data || data,
      message: "Lấy thông tin người dùng thành công",
    });
  } catch (error: any) {
    console.error("Unexpected error in getById route:", error);

    if (error.name === "AbortError") {
      return NextResponse.json(API_ERRORS.TIMEOUT_ERROR, {
        status: API_ERRORS.TIMEOUT_ERROR.code,
      });
    }

    return NextResponse.json(API_ERRORS.DEFAULT_ERROR, {
      status: API_ERRORS.DEFAULT_ERROR.code,
    });
  }
}
  */

import { NextRequest, NextResponse } from "next/server";
import { callApiGet } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return callApiGet(
    request,
    `/api/users/${params.id}`,
    "Lấy thông tin người dùng thành công"
  );
}
