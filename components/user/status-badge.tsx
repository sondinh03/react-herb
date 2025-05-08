import { STATUS_LABELS, STATUSES } from "@/constant/user";
import { Badge } from "../ui/badge";

interface StatusBadgeProps {
  status: number;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  let variant:
    | "default"
    | "secondary"
    | "destructive"
    | "success"
    | "warning"
    | "outline" = "default";
  const statusLabel =
    status in STATUS_LABELS
      ? STATUS_LABELS[status as keyof typeof STATUS_LABELS]
      : "Không xác định";

  switch (status) {
    case STATUSES.ACTIVE:
      variant = "success";
      break;
    case STATUSES.INACTIVE:
    case STATUSES.DELETED:
      variant = "secondary";
      break;
    case STATUSES.BANNED:
    case STATUSES.PENDING:
      variant = "destructive";
      break;
    default:
      variant = "outline";
  }

  return (
    <Badge variant={variant} className={className}>
      {statusLabel}
    </Badge>
  );
}
