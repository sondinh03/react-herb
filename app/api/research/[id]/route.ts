import { NextRequest, NextResponse } from "next/server";
import { callApiGet } from "@/lib/api-utils";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return callApiGet(
    request,
    `/api/research/${(await params).id}`,
    "Lấy thông tin cây dược liệu thành công",
    { requireAuth: false }
  );
}