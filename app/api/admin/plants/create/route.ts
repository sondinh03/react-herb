import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    const fullUrl = `${apiUrl}/api/plants`;

    /*
        const cookieStore = cookies();
        const tokenFromCookie = cookieStore.get("auth_token")?.value;
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ")
            ? authHeader.substring(7)
            : tokenFromCookie;
            */
    const authHeader = request.headers.get("authorization");
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : "";
    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = await response.json();

      return NextResponse.json({
        success: true,
        data: data.data,
        message: "Tạo cây dược liệu thành công",
      });
    } catch (fetchError: any) {}
  } catch (error: any) {}
}
