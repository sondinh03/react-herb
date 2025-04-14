/*
import { NextRequest, NextResponse } from "next/server";
import { API_ERRORS, extractToken } from "@/lib/api-utils";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id;
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    const endpoint = `/api/users/${userId}`;
    const fullUrl = `${apiUrl}${endpoint}`;

    const token = extractToken(request);
    console.log("token: " + token);
    if (!token) {
      return NextResponse.json(API_ERRORS.UNAUTHORIZED, { status: 401 });
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    };

    try {
      const response = await fetch(fullUrl, {
        method: "PUT",
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

      return NextResponse.json({
        success: true,
        data: data.data || data,
        message: "Cập nhật người dùng thành công",
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
  */

import { callApiPut } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  const endpoint = `/api/users/${userId}`;
  return callApiPut(request, endpoint, "Cập nhật người dùng thành công");
}