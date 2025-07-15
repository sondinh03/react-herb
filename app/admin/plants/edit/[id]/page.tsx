"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  Home,
  RefreshCw,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import PlantForm from "@/components/plant/plant-form";
import { Plant } from "@/app/types/plant";
import { Spinner } from "@/components/spinner";
import { BackButton } from "@/components/BackButton";
import { useAuth } from "@/hooks/useAuth";
import { fetchApi } from "@/lib/api-client";
import { HerbResponse } from "@/types/api";
import { useEditPlant } from "@/hooks/plant/useEditPlant";

// export default function EditPlantPage() {
//   const router = useRouter();
//   const params = useParams();
//   const plantId = params.id;

//   const [formData, setFormData] = useState<Plant | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [isFetching, setIsFetching] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const { getAuthToken } = useAuth();

//   useEffect(() => {
//     const fetchPlantDetails = async () => {
//       setIsFetching(true);
//       try {
//         const token = getAuthToken();

//         const response = await fetchApi<Plant>(`/api/plants/${plantId}`, {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         });
//         if (response?.data) {
//           setFormData(response.data);
//         }
//       } catch (err: any) {
//         setError(err.message);
//         toast({
//           title: "Lỗi",
//           description: err.message,
//           variant: "destructive",
//         });
//       } finally {
//         setIsFetching(false);
//       }
//     };

//     if (plantId) {
//       fetchPlantDetails();
//     }
//   }, [plantId]);

//   const handleSubmit = async (
//     plant: Plant,
//     publish = false
//   ): Promise<HerbResponse> => {
//     setLoading(true);
//     try {
//       const token = getAuthToken();

//       const response = await fetchApi(`/api/admin/plants/edit/${plantId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(plant),
//       });
//       if (response.success) {
//         toast({
//           title: "Thành công",
//           description: "Đã cập nhật thông tin cây dược liệu",
//           variant: "success",
//         });
//         router.push(`/admin/plants/${plantId}`);

//         return {
//           code: 200,
//           message: "Đã cập nhật thông tin cây dược liệu",
//           data: response.data,
//           success: true,
//         };
//       } else {
//         throw new Error(response.message || "Không thể cập nhật cây dược liệu");
//       }
//     } catch (err: any) {
//       setError(err.message);
//       toast({
//         title: "Lỗi",
//         description: err.message,
//         variant: "destructive",
//       });

//       return {
//         code: 500,
//         message: err.message || "Không thể cập nhật cây dược liệu",
//         success: false,
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (isFetching) {
//     return <Spinner></Spinner>;
//   }

//   if (error || !formData) {
//     return (
//       <div className="container mx-auto py-8">
//         <Link href="/admin/plants">
//           <Button variant="outline" size="sm" className="mb-4">
//             <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
//           </Button>
//         </Link>
//         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
//           {error || "Không tìm thấy thông tin cây dược liệu"}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="py-6 px-4 sm:px-6 lg:px-8">
//       <BackButton
//         href={`/admin/plants/${plantId}`}
//         text="Quay lại chi tiết"
//       ></BackButton>

//       <PlantForm
//         plant={formData}
//         isLoading={loading}
//         onSubmit={handleSubmit}
//         mode="edit"
//       />
//     </div>
//   );
// }

const Breadcrumb: React.FC<{ plantId: string; plantName?: string }> = ({
  plantId,
  plantName,
}) => (
  <nav
    className="flex items-center space-x-2 text-sm text-gray-600 mb-6"
    aria-label="Breadcrumb"
  >
    <Link
      href="/admin"
      className="hover:text-gray-900 transition-colors flex items-center"
      aria-label="Trang chủ admin"
    >
      <Home className="h-4 w-4" />
    </Link>
    <ChevronRight className="h-4 w-4" />
    <Link
      href="/admin/plants"
      className="hover:text-gray-900 transition-colors"
    >
      Danh sách cây dược liệu
    </Link>
    <ChevronRight className="h-4 w-4" />
    <Link
      href={`/admin/plants/${plantId}`}
      className="hover:text-gray-900 transition-colors max-w-48 truncate"
      title={plantName || "Chi tiết cây dược liệu"}
    >
      {plantName || "Chi tiết"}
    </Link>
    <ChevronRight className="h-4 w-4" />
    <span className="text-gray-500">Chỉnh sửa</span>
  </nav>
);

// Loading skeleton component
const LoadingSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center space-x-2 mb-6">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-2"></div>
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-4 bg-gray-200 rounded w-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>

        {/* Back button skeleton */}
        <div className="h-10 bg-gray-200 rounded w-40 mb-6"></div>

        {/* Form skeleton */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded w-64"></div>
          <div className="space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Error state component
const ErrorState: React.FC<{
  error: string;
  onRetry: () => void;
  plantId: string;
}> = ({ error, onRetry, plantId }) => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Breadcrumb plantId={plantId} />

      <Link href="/admin/plants">
        <Button variant="outline" size="sm" className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại danh sách
        </Button>
      </Link>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không thể tải thông tin
            </h2>
            <p className="text-gray-600 mb-6 max-w-md">{error}</p>
            <div className="flex justify-center space-x-4">
              <Button onClick={onRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Thử lại
              </Button>
              <Link href={`/admin/plants/${plantId}`}>
                <Button variant="default">Xem chi tiết</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main component
export default function EditPlantPage() {
  const params = useParams();
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Validate and extract plantId
  const plantId = React.useMemo(() => {
    const id = params.id;
    if (!id) return null;
    return Array.isArray(id) ? id[0] : id;
  }, [params.id]);

  const {
    plant,
    loading,
    isFetching,
    error,
    fetchPlant,
    updatePlant,
    retryFetch,
  } = useEditPlant(plantId);

  // Fetch plant data on mount
  useEffect(() => {
    if (plantId) {
      fetchPlant();
    }
  }, [plantId, fetchPlant]);

  // Prevent data loss warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue =
          "Bạn có thay đổi chưa được lưu. Bạn có chắc muốn rời khỏi trang?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Handle form changes
  const handleFormChange = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  // Handle form submit
  const handleSubmit = useCallback(
    async (plantData: Plant): Promise<HerbResponse> => {
      const result = await updatePlant(plantData);
      if (result.success) {
        setHasUnsavedChanges(false);
      }
      return result;
    },
    [updatePlant]
  );

  // Validate plantId
  if (!plantId) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                ID không hợp lệ
              </h2>
              <p className="text-gray-600 mb-6">
                Không tìm thấy ID cây dược liệu trong URL
              </p>
              <Link href="/admin/plants">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Quay lại danh sách
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  if (isFetching) {
    // return <LoadingSkeleton />;
    return <Spinner />;
  }

  // Error state
  if (error || !plant) {
    return (
      <ErrorState
        error={error || "Không tìm thấy thông tin cây dược liệu"}
        onRetry={retryFetch}
        plantId={plantId}
      />
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50">
      <main
        role="main"
        aria-label="Chỉnh sửa cây dược liệu"
        className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8"
      >
        <h1 className="sr-only">Chỉnh sửa thông tin cây dược liệu</h1>

        <Breadcrumb plantId={plantId} plantName={plant.name} />

        <BackButton
          href={`/admin/plants/${plantId}`}
          text="Quay lại chi tiết"
          className="mb-6"
        />

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Chỉnh sửa thông tin cây dược liệu
              </h2>
              <p className="text-gray-600">
                Cập nhật thông tin chi tiết về cây dược liệu
              </p>
            </div>

            <PlantForm
              plant={plant}
              isLoading={loading}
              onSubmit={handleSubmit}
              onChange={handleFormChange}
              mode="edit"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
