import type { MediaResponse } from "@/app/types/media";

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  code?: number;
  data?: T;
}

/**
 * Upload media file to server
 * @param file File to upload
 * @param altText Alternative text for the media
 * @param plantId ID of the plant to associate with the media
 * @returns Response with uploaded media data
 */

export async function uploadMedia(
  file: File,
  altText?: string,
  plantId?: number
): Promise<ApiResponse<MediaResponse>> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const formData = new FormData();
    formData.append("file", file);

    if (altText) {
      formData.append("altText", altText);
    }

    if (plantId) {
      formData.append("plantId", plantId.toString());
    }

    // Tạo AbortController để có thể hủy request nếu cần
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(`/api/plants/${plantId}/media/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `Lỗi khi tải lên media: ${response.status}`
      );
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error uploading media:", error);
    return {
      success: false,
      message: error.message || "Đã xảy ra lỗi khi tải lên media",
    };
  }
}

/**
 * Get media by ID
 * @param id Media ID
 * @param signal AbortController signal for cancellation
 * @returns Media information
 */
export async function getMediaById(
  id: number,
  signal?: AbortSignal
): Promise<ApiResponse<MediaResponse>> {
  try {
    // Validate input
    // if (!id || id <= 0) {
    //   return {
    //     success: false,
    //     code: 400,
    //     message: "ID media không hợp lệ",
    //   };
    // }
     

    const token = localStorage.getItem("accessToken");
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    console.log(`🚀 Fetching media ${id}...`);

    const response = await fetch(`/api/media/${id}`, {
      headers,
      signal,
    });

    // Check abort status after fetch
    // if (signal?.aborted) {
    //   console.warn(`Request for media ${id} was aborted during fetch`);
    //   return {
    //     success: false,
    //     code: 499,
    //     message: "Request đã bị hủy trong quá trình tải",
    //   };
    // }

    // console.log(`📡 Response for media ${id}:`, {
    //   status: response.status,
    //   ok: response.ok,
    //   aborted: signal?.aborted,
    // });

    if (!response.ok) {
      throw new Error(`Không thể lấy thông tin media: ${response.status}`);
    }

    return await response.json();

    // Parse JSON with abort check
    // const data = await response.json();

    // if (signal?.aborted) {
    //   console.warn(`Request for media ${id} was aborted after receiving data`);
    //   return {
    //     success: false,
    //     code: 499,
    //     message: "Request đã bị hủy sau khi nhận dữ liệu",
    //   };
    // }

    // console.log(`✅ Successfully fetched media ${id}`);

    // return {
    //   success: true,
    //   code: 200,
    //   data,
    //   message: "Thành công",
    // };
  } catch (error: any) {
    console.error(`💥 Error fetching media ${id}:`, {
      name: error.name,
      message: error.message,
      aborted: signal?.aborted,
    });

    return {
      success: false,
      code: 500,
      message: error.message || "Đã xảy ra lỗi khi lấy thông tin media",
    };
  }
}

/**
 * Get media view URL
 * @param id Media ID
 * @returns URL to view the media
 */
export async function getMediaViewUrl(id: number): Promise<string> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    return `${apiUrl}/api/media/view/${id}`;
  } catch (error) {
    console.error("Error creating media URL:", error);
    throw error;
  }
}

/**
 * Delete media
 * @param id Media ID
 * @returns Result of deletion
 */
export async function deleteMedia(id: number): Promise<ApiResponse<void>> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const response = await fetch(`/api/media/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Không thể xóa media: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error deleting media:", error);
    return {
      success: false,
      message: error.message || "Đã xảy ra lỗi khi xóa media",
    };
  }
}

/**
 * Get list of media
 * @param page Page number (1-based)
 * @param limit Items per page
 * @returns List of media
 */
export async function getMediaList(
  page = 1,
  limit = 20
): Promise<ApiResponse<MediaResponse[]>> {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      throw new Error("Không tìm thấy token xác thực");
    }

    const response = await fetch(
      `/api/media/list?page=${page}&limit=${limit}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Không thể lấy danh sách media: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Error fetching media list:", error);
    return {
      success: false,
      message: error.message || "Đã xảy ra lỗi khi lấy danh sách media",
    };
  }
}
