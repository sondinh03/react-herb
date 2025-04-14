import { callApiPut } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    const plantId = params.id;
    const endpoint = `api/plants/${plantId}`;
    return callApiPut(request, endpoint, "Cập nhật cây dược liệu thành công");
}