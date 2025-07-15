import { callApiPut } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
    const researchId = params.id;
    const endpoint = `/api/research/${researchId}`;
    return callApiPut(request, endpoint, "Cập nhật thành công");
}