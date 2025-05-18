import { callApiGet } from "@/lib/api-utils";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, {params} : {params: {id: string}}) {
    return callApiGet(
        request,
        `/api/families/${params.id}`,
        "Thanhf công",
        {requireAuth: false},
    )
}