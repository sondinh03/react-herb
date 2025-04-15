import { callApiPut } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const userId = params.id;
  const endpoint = `/api/users/${userId}`;
  return callApiPut(request, endpoint, "Cập nhật người dùng thành công");
}