import { callApiGet, callApiPost } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return callApiGet(
    request,
    `/api/diseases/${(await params).id}`,
    "Lấy thành công",
    {
      requireAuth: false,
    }
  );
}
