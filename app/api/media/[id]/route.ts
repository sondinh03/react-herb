import { callApiGet } from "@/lib/api-utils";
import { HerbResponse } from "@/types/api";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  if (!id) {
    const errorResponse: HerbResponse = {
      code: 400,
      message: "ID không hợp lệ",
      success: false,
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  try {
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

    if (response.status === 200) {
      const headers = new Headers(response.headers);
      if (!headers.has("Cache-Control")) {
        headers.set("Cache-Control", "public, max-age=3600, s-maxage=3600");
      }

      const data = await response.json();
      return new NextResponse(JSON.stringify(data), {
        status: 200,
        headers,
      });
    }

    return response;
  } catch (error: any) {
    console.error("Error in media GET API route:", error);
    const errorResponse: HerbResponse = {
      success: false,
      message: error.message || "Đã xảy ra lỗi khi lấy thông tin media",
      code: 500,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
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

    if (!response) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Lỗi khi xóa media",
          code: response.code,
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
