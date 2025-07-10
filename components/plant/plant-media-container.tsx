"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { PlantMediaTab } from "./plant-media-tab";
import { linkMediaToPlant } from "@/services/plant-media-service";
import { fetchApi } from "@/lib/api-client";

interface PlantMediaContainerProps {
  plantId: number;
}

export function PlantMediaContainer({ plantId }: PlantMediaContainerProps) {
  const [mediaIds, setMediaIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Fetch media IDs khi component mount hoặc plantId thay đổi
  useEffect(() => {
    const fetchMediaIds = async () => {
      if (!plantId) {
        setMediaIds([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetchApi<number[]>(`/api/plants/${plantId}/media-ids`, {
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.success) {
          throw new Error(`Lỗi khi tải danh sách hình ảnh: ${response.code}`);
        }

        if (response?.data) {
          setMediaIds(response.data);
        } else {
          throw new Error(response.message || "Không thể tải danh sách hình ảnh");
        }
      } catch (error: any) {
        console.error("Lỗi khi tải danh sách hình ảnh:", error);

        // Không hiển thị thông báo lỗi nếu request bị hủy
        if (error.name !== "AbortError") {
          toast({
            title: "Lỗi",
            description: error.message || "Không thể tải danh sách hình ảnh",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMediaIds();
  }, [plantId]);

  // Hàm xử lý khi danh sách media thay đổi
  const handleMediaChange = useCallback(
    async (updatedMediaIds: number[]) => {
      setMediaIds(updatedMediaIds);
    }, []
  );

  return (
    <PlantMediaTab
      mediaIds={mediaIds}
      onMediaChange={handleMediaChange}
      plantId={plantId}
      isLoading={isLoading || isSaving}
    />
  );
}
