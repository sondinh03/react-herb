import { type NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const altText = formData.get("altText") as string | null;
    const plantId = formData.get("plantId") as string | null;
    const articleId = formData.get("articleId") as string | null;
    const isFeatured = formData.get("isFeatured") === "true";

    if (!file) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy file" },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, message: "Chỉ hỗ trợ định dạng JPG, PNG, WEBP, PDF" },
        { status: 400 }
      );
    }

    // Get the authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Không có quyền truy cập" },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    if (!apiUrl) {
      return NextResponse.json(
        { success: false, message: "Cấu hình API URL không hợp lệ" },
        { status: 500 }
      );
    }

    // Create a new FormData to forward to the backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    if (altText) {
      backendFormData.append("altText", altText);
    }

    // Thêm plantId vào request nếu có
    if (plantId) {
      backendFormData.append("plantId", plantId);
    }

    if (articleId) {
      backendFormData.append("articleId", articleId);
    }

    if (isFeatured !== null) {
      backendFormData.append("isFeatured", isFeatured.toString());
    }

    // Forward the request to the backend
    const response = await fetch(`${apiUrl}/api/media/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: backendFormData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          success: false,
          message: errorData.message || "Lỗi khi tải lên file",
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error in media upload API route:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Đã xảy ra lỗi khi xử lý yêu cầu",
      },
      { status: 500 }
    );
  }
}
