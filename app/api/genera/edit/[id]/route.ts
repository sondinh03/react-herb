import { callApiPut } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const diseaseId = params.id;
  const endpoint = `/api/genera/${diseaseId}`;
  return callApiPut(request, endpoint, "Cập nhật công dụng thành công", {
    requireAuth: false,
  });
}