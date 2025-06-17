import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

interface ActionButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  disabled?: boolean;
  title: string;
  variant?: "ghost" | "outline" | "default";
  className?: string;
}

export function ActionButton({
  icon: Icon,
  onClick,
  disabled,
  title,
  variant = "ghost",
  className,
}: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      className={`h-8 w-8 p-0 ${className}`}
      onClick={onClick}
      disabled={disabled}
      title={title}
    >
      <Icon className="h-4 w-4" />
      <span className="sr-only">{title}</span>
    </Button>
  );
}
