import { callApiGet } from "@/lib/api-utils";
import { type NextRequest, NextResponse } from "next/server";

/*
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ success: false, message: "ID không hợp lệ", code: 400 }, { status: 400 })
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"

    // Lấy token từ request header nếu có
    const authHeader = request.headers.get("Authorization")

    // Tạo headers cho request đến backend
    const backendHeaders: HeadersInit = {}
    if (authHeader) {
      backendHeaders["Authorization"] = authHeader
    }

    // Forward the request to the backend
    const response = await fetch(`${apiUrl}/api/media/${id}`, {
      headers: backendHeaders,
      // Thêm cache control để tối ưu hiệu suất
      cache: "force-cache",
      next: { revalidate: 3600 }, // Revalidate sau 1 giờ
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Lỗi khi lấy thông tin media",
          code: response.status,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    // Thêm cache control headers vào response
    const responseHeaders = new Headers()
    responseHeaders.set("Cache-Control", "public, max-age=3600, s-maxage=3600")

    return NextResponse.json(data, {
      headers: responseHeaders,
    })
  } catch (error: any) {
    console.error("Error in media info API route:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Đã xảy ra lỗi khi xử lý yêu cầu", code: 500 },
      { status: 500 },
    )
  }
}
  */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) {
    return NextResponse.json(
      { success: false, message: "ID không hợp lệ", code: 400 },
      { status: 400 }
    );
  }

  const response = await callApiGet(
    request,
    `/api/media/${id}`,
    "Lấy thông tin media thành công",
    {
      requireAuth: false,
      cache: "force-cache",
      revalidate: 3600,
      cacheControl: "public, max-age=3600, s-maxage=3600",
    }
  );

  // Thêm Cache-Control headers nếu chưa có
  if (response.status === 200) {
    const headers = new Headers(response.headers);
    if (!headers.has("Cache-Control")) {
      headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
    }
    return new NextResponse(JSON.stringify(await response.json()), {
      status: 200,
      headers,
    });
  }

  return response;
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID không hợp lệ", code: 400 },
        { status: 400 }
      );
    }

    // Kiểm tra xác thực
    const authHeader = request.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Không có quyền truy cập", code: 401 },
        { status: 401 }
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    // Forward the request to the backend
    const response = await fetch(`${apiUrl}/api/media/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: authHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Lỗi khi xóa media",
          code: response.status,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error in media delete API route:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Đã xảy ra lỗi khi xử lý yêu cầu",
        code: 500,
      },
      { status: 500 }
    );
  }
}
