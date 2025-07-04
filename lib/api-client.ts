import { HerbResponse } from "@/types/api";

export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<HerbResponse<T>> {
  try {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
    const fullUrl = url.startsWith("/") ? `${basePath}${url}` : url;

    const response = await fetch(fullUrl, options);

    let result: HerbResponse<T>;
    try {
      result = await response.json();
    } catch (jsonError) {
      // Nếu không parse được JSON
      throw new Error(
        `Invalid JSON response: ${response.status} - ${response.statusText}`
      );
    }

    // Kiểm tra HTTP status
    if (!response.ok) {
      throw new Error(result.message || `HTTP Error: ${response.status}`);
    }

    // Kiểm tra API success flag
    if (result.success === false) {
      throw new Error(result.message || "API trả về lỗi");
    }

    return result;
  } catch (error: any) {
    throw error;
  }
}
