import { MediaResponse } from "@/app/types/media";
import { HerbResponse } from "@/types/api";
import { NextResponse } from "next/server";
import { date } from "zod";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;

    const fileResponse = await fetch(`${baseUrl}/api/media/${id}/download`, {
      method: "GET",
    });

    if (!fileResponse.ok) {
      throw new Error(`Lỗi tải xuống: ${fileResponse.statusText}`);
    }

    const infoResponse = await fetch(`${baseUrl}/api/media/${id}`);

    if (!infoResponse.ok) {
      throw new Error(`Lỗi lấy thông tin file: ${infoResponse.statusText}`);
    }
    const info: HerbResponse<MediaResponse> = await infoResponse.json();
    if (info.code !== 200 || !info.data) {
      throw new Error(info.message || "Không thể lấy thông tin file");
    }

    const fileData = await fileResponse.arrayBuffer();

    return new NextResponse(fileData, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${info.data.fileName}"`,
        "Content-Type": "application/pdf",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        code: 500,
        messafe: err.message,
        data: null,
      },
      {
        status: 500,
      }
    );
  }
}
