import { callApiPut } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    const id = params.id;
    const endpoint = `/api/expert/${id}`;
    return callApiPut(request, endpoint, "Cập nhật bài viết thành công");
}