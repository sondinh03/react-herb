import { ROLE_TYPE_LABELS, ROLE_TYPES } from "@/constants/user";
import { Badge } from "../ui/badge";

interface RoleBadgeProps {
  roleType: number;
  className?: string;
}

export function RoleBadge({ roleType, className }: RoleBadgeProps) {
  let variant:
    | "default"
    | "secondary"
    | "destructive"
    | "success"
    | "warning"
    | "outline" = "default";
  const roleName =
    roleType in ROLE_TYPE_LABELS
      ? ROLE_TYPE_LABELS[roleType as keyof typeof ROLE_TYPE_LABELS]
      : "Không xác định";

  switch (roleType) {
    case ROLE_TYPES.ADMIN:
    case ROLE_TYPES.EXPERT:
      variant = "destructive";
      break;
    case ROLE_TYPES.EDITOR:
      variant = "secondary";
      break;
    case ROLE_TYPES.USER:
      variant = "default";
      break;
    default:
      variant = "outline";
  }

  return (
    <Badge variant={variant} className={className}>
      {roleName}
    </Badge>
  );
}
