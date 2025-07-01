// constants/plant.ts
export const PLANT_CATEGORIES = [
  { value: "thao-duoc", label: "Thảo dược" },
  { value: "cay-thuoc", label: "Cây thuốc" },
  { value: "nam", label: "Nấm dược liệu" },
  { value: "hoa", label: "Hoa dược liệu" },
  { value: "re", label: "Rễ dược liệu" },
  { value: "qua", label: "Quả dược liệu" },
];

export const PLANT_STATUS_OPTIONS = [
  { value: 1, label: "Bản nháp" },
  { value: 2, label: "Chờ duyệt" },
  { value: 3, label: "Đã xuất bản" },
  { value: 4, label: "Lưu trữ" },
  { value: 5, label: "Từ chối" },
];

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning";

// Ánh xạ trạng thái với variant, description và className
const statusConfig: Record<
  number,
  { label: string; variant: BadgeVariant; description: string; className: string }
> = {
  1: {
    label: "Bản nháp",
    variant: "warning",
    description: "Cây dược liệu đang ở trạng thái bản nháp, chưa được xuất bản.",
    className: "bg-yellow-500 text-white hover:bg-yellow-600",
  },
  2: {
    label: "Chờ duyệt",
    variant: "secondary",
    description: "Cây dược liệu đang chờ phê duyệt từ quản trị viên.",
    className: "bg-gray-500 text-white hover:bg-gray-600",
  },
  3: {
    label: "Đã xuất bản",
    variant: "success",
    description: "Cây dược liệu đã được xuất bản công khai.",
    className: "bg-green-500 text-white hover:bg-green-600", // Màu xanh cho chủ đề cây dược liệu
  },
  4: {
    label: "Lưu trữ",
    variant: "outline",
    description: "Cây dược liệu đã được lưu trữ và không hiển thị công khai.",
    className: "border-gray-500 text-gray-700 hover:bg-gray-100",
  },
  5: {
    label: "Từ chối",
    variant: "destructive",
    description: "Cây dược liệu đã bị từ chối bởi quản trị viên.",
    className: "bg-red-500 text-white hover:bg-red-600",
  },
};

// Hàm getStatusLabel
export const getStatusLabel = (
  status: number
): { label: string; variant: BadgeVariant; description: string; className: string } => {
  return (
    statusConfig[status] || {
      label: "Không xác định",
      variant: "default",
      description: "Trạng thái không được xác định.",
      className: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    }
  );
};