import { Plant } from "@/app/types/plant";
import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "../useAuth";
import { useRouter } from "next/navigation";
import { toast } from "../use-toast";
import { fetchApi } from "@/lib/api-client";
import { HerbResponse } from "@/types/api";

export const useEditPlant = (plantId: string | null) => {
  const [plant, setPlant] = useState<Plant | null>(null);
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getAuthToken } = useAuth();
  const router = useRouter();
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleError = useCallback((error: any, context: string) => {
    console.error(`${context}:`, error);
    const message = error?.response?.data?.message || error.message || 'Có lỗi xảy ra';
    
    setError(message);
    toast({
      title: "Lỗi",
      description: message,
      variant: "destructive",
    });
  }, []);

  const validateAuth = useCallback(() => {
    const token = getAuthToken();
    if (!token) {
      toast({
        title: "Phiên đăng nhập hết hạn",
        description: "Vui lòng đăng nhập lại",
        variant: "destructive",
      });
      router.push('/login');
      return null;
    }
    return token;
  }, [getAuthToken, router]);

  const fetchPlant = useCallback(async () => {
    if (!plantId) return;

    const token = validateAuth();
    if (!token) return;

    setIsFetching(true);
    setError(null);

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetchApi<Plant>(`/api/plants/${plantId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        signal: abortControllerRef.current.signal,
      });

      if (response?.data) {
        setPlant(response.data);
      } else {
        throw new Error('Không tìm thấy thông tin cây dược liệu');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        handleError(err, 'Fetch plant details');
      }
    } finally {
      setIsFetching(false);
    }
  }, [plantId, validateAuth, handleError]);

  const updatePlant = useCallback(async (plantData: Plant): Promise<HerbResponse> => {
    if (!plantId) {
      return {
        code: 400,
        message: "ID cây dược liệu không hợp lệ",
        success: false,
      };
    }

    const token = validateAuth();
    if (!token) {
      return {
        code: 401,
        message: "Phiên đăng nhập hết hạn",
        success: false,
      };
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetchApi(`/api/admin/plants/edit/${plantId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(plantData),
      });

      if (response.success) {
        toast({
          title: "Thành công",
          description: "Đã cập nhật thông tin cây dược liệu",
          variant: "success",
        });
        
        // Update local state
        // setPlant(response.data || null);
        
        // Navigate to detail page
        router.push(`/admin/plants/${plantId}`);

        return {
          code: 200,
          message: "Đã cập nhật thông tin cây dược liệu",
          data: response.data,
          success: true,
        };
      } else {
        throw new Error(response.message || "Không thể cập nhật cây dược liệu");
      }
    } catch (err: any) {
      handleError(err, 'Update plant');
      return {
        code: 500,
        message: err.message || "Không thể cập nhật cây dược liệu",
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, [plantId, validateAuth, handleError, router]);

  const retryFetch = useCallback(() => {
    fetchPlant();
  }, [fetchPlant]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    plant,
    loading,
    isFetching,
    error,
    fetchPlant,
    updatePlant,
    retryFetch,
  };
};