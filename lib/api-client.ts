import { HerbResponse } from "@/types/api";

export async function fetchApi<T>(url: string, options?: RequestInit): Promise<HerbResponse<T>> {
  try {
    const response = await fetch(url, options);
    const result: HerbResponse<T> = await response.json();

    if (!response.ok || result.code !== 200) {
      throw new Error(result.message || "Không thể tải dữ liệu");
    }

    return result;
  } catch (error: any) {
    throw error;
  }
}