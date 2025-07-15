import { callApiPost } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  return callApiPost(
    request, 
    "/api/research", 
    "Tạo nghiên cứu khoa học thành công"
  );
}
