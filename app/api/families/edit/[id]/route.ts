import { callApiPut } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return callApiPut(request, `/api/families/${params.id}`, "Thành công", {
    requireAuth: false,
  });
}
