import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "./ui/button";

interface BackButtonProps {
  href: string;
  text?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function BackButton({
  href,
  text = "Quay lại danh sách",
  icon = <ArrowLeft className="h-4 w-4" />,
  className,
}: BackButtonProps) {
  return (
    <div className="mb-6">
      <Link href={href}>
        <Button
          variant="ghost"
          className={`flex items-center gap-2 pl-0 hover:pl-2 transition-all duration-200 ease-in-out text-green-500 hover:text-green-700 ${className}`}
        >
          {icon}
          {text}
        </Button>
      </Link>
    </div>
  );
}