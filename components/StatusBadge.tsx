import { Badge } from "./ui/badge";

interface StatusOption {
  value: number;
  label: string;
}

interface StatusBadgeProps {
  status: number;
  options: StatusOption[];
}

export function StatusBadge({ status, options }: StatusBadgeProps) {
  let statusLabel = "Không xác định";
  let statusVariant: "default" | "secondary" | "success" | "destructive" | "warning" = "default";

  const statusInfo = options.find((opt) => opt.value === status);
  if (statusInfo) {
    statusLabel = statusInfo.label;
    switch (statusInfo.value) {
      case 1: // Bản nháp
        statusVariant = "warning";
        break;
      case 2: // Chờ duyệt
        statusVariant = "secondary";
        break;
      case 3: // Đã xuất bản
        statusVariant = "success";
        break;
      case 4: // Lưu trữ
        statusVariant = "secondary";
        break;
      case 5: // Từ chối
        statusVariant = "destructive";
        break;
      default:
        statusVariant = "default";
    }
  }

  return <Badge variant={statusVariant}>{statusLabel}</Badge>;
}