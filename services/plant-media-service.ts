/**
 * Liên kết danh sách media với plant
 * @param plantId ID của plant
 * @param mediaIds Danh sách ID của media
 * @returns Kết quả liên kết
 */
export async function linkMediaToPlant(
  plantId: number,
  mediaIds: number[],
): Promise<{ success: boolean; message?: string }> {
  try {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      throw new Error("Không tìm thấy token xác thực")
    }

    const response = await fetch("/api/plants/media/link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ plantId, mediaIds }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || "Lỗi khi liên kết media với plant")
    }

    return await response.json()
  } catch (error: any) {
    console.error("Error linking media to plant:", error)
    return {
      success: false,
      message: error.message || "Đã xảy ra lỗi khi liên kết media với plant",
    }
  }
}

/**
 * Lấy danh sách media của plant
 * @param plantId ID của plant
 * @returns Danh sách media
 */
export async function getPlantMedia(
  plantId: number
): Promise<{ success: boolean; message?: string; data?: any[] }> {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`/api/plants/${plantId}/media-ids`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Không thể lấy danh sách media của plant");
    }
    return await response.json();
  } catch (error: any) {
    console.error("Error fetching plant media:", error);
    return {
      success: false,
      message:
        error.message || "Đã xảy ra lỗi khi lấy danh sách media của plant",
    };
  }
}
