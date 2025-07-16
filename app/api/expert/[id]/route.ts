import { callApiGet } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, 
    { params }: { params: { id: string } }
) {
    return callApiGet(
        request,
        `/api/expert/${(await params).id}`,
        "Lấy thông tin bài viết thành công",
        { requireAuth: false }
    )
}