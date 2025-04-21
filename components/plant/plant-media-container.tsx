"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "@/hooks/use-toast";
import { PlantMediaTab } from "./plant-media-tab";
import {
  getPlantMedia,
  linkMediaToPlant,
} from "@/services/plant-media-service";

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

        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("Không tìm thấy token xác thực");
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch(`/api/plants/${plantId}/media-ids`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Lỗi khi tải danh sách hình ảnh: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
          setMediaIds(result.data || []);
        } else {
          throw new Error(result.message || "Không thể tải danh sách hình ảnh");
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

      // Cập nhật thay đổi lên server nếu có plantId
      if (plantId) {
        try {
          setIsSaving(true);
          const result = await linkMediaToPlant(plantId, updatedMediaIds);

          if (!result.success) {
            toast({
              title: "Lỗi cập nhật",
              description:
                result.message || "Không thể cập nhật danh sách hình ảnh",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Thành công",
              description: "Đã cập nhật danh sách hình ảnh",
            });
          }
        } catch (error: any) {
          console.error("Lỗi khi cập nhật danh sách hình ảnh:", error);
          toast({
            title: "Lỗi cập nhật",
            description:
              error.message || "Không thể cập nhật danh sách hình ảnh",
            variant: "destructive",
          });
        } finally {
          setIsSaving(false);
        }
      }
    },
    [plantId]
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
