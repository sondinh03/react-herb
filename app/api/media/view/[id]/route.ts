import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ success: false, message: "ID không hợp lệ" }, { status: 400 })
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"

    // Forward the request to the backend
    const response = await fetch(`${apiUrl}/api/media/view/${id}`)

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { success: false, message: errorData.message || "Lỗi khi lấy media" },
        { status: response.status },
      )
    }

    // Get the content type from the response
    const contentType = response.headers.get("content-type") || "application/octet-stream"

    // Get the binary data
    const data = await response.arrayBuffer()

    // Return the binary data with the correct content type
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
      },
    })
  } catch (error: any) {
    console.error("Error in media view API route:", error)
    return NextResponse.json(
      { success: false, message: error.message || "Đã xảy ra lỗi khi xử lý yêu cầu" },
      { status: 500 },
    )
  }
}
