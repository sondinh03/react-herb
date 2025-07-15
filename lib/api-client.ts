import { HerbResponse } from "@/types/api";

export async function fetchApi<T>(
  url: string,
  options?: RequestInit
): Promise<HerbResponse<T>> {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH;
  const fullUrl = url.startsWith("/") ? `${basePath}${url}` : url;

  const response = await fetch(fullUrl, options);

  let result: HerbResponse<T>;
  
  try {
    result = await response.json();
  } catch (jsonError) {
    throw {
      code: response.status,
      message: `Invalid JSON response: ${response.status} - ${response.statusText}`,
      success: false,
    } as HerbResponse<T>;
  }

  // Kiểm tra HTTP status
  if (!response.ok || result.success === false) {
    throw {
      code: result.code || response.status,
      message: result.message || `HTTP Error: ${response.status}`,
      success: false,
    } as HerbResponse<T>;
  }

  return result;
}
