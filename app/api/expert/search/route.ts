import { handleApiSearchRequest } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  return handleApiSearchRequest(request, "/api/expert/search", {
    defaultPageSize: 12,
    requireAuth: false,
  });
}
