import { callApiPut } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const diseaseId = params.id;
  console.log({
      timestamp: new Date().toISOString(),
      message: "Xử lý yêu cầu PUT",
      diseaseId: params.id, 
    });
  const endpoint = `/api/diseases/${diseaseId}`;
  return callApiPut(request, endpoint, "Cập nhật công dụng thành công", {
    requireAuth: false,
  });
}
