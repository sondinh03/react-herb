import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { plantId, mediaIds } = await request.json()

    if (!plantId || !mediaIds || !Array.isArray(mediaIds)) {
      return NextResponse.json({ success: false, message: "Thiếu thông tin plantId hoặc mediaIds" }, { status: 400 })
    }

    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Không có quyền truy cập" }, { status: 401 })
    }

    const token = authHeader.split(" ")[1]
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    // Forward the request to the backend
    const response = await fetch(`${apiUrl}/api/plants/${plantId}/media/link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ mediaIds }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, message: errorData.message || "Lỗi khi liên kết media với plant" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error in link media to plant API route:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Đã xảy ra lỗi khi xử lý yêu cầu" },
      { status: 500 },
    )
  }
}
