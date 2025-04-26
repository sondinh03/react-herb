import { callApiGet } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
    return callApiGet(
        request,
        `api/diseases/get-all`,
        "Thành công",
        {requireAuth: false}
    );
}