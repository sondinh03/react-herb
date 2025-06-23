import { Button } from "./ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { useCallback } from "react";

interface CustomActionButtonProps {
  text: string;
  icon?: React.ReactNode;
  variant?: "add" | "ghost";
  className?: string;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void; // onClick là bắt buộc
}

export function CustomActionButton({
  text,
  icon = <Plus className="h-4 w-4" />,
  variant = "add",
  className,
  onClick,
}: CustomActionButtonProps) {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault(); // Ngăn hành vi mặc định nếu có
      onClick(event); // Gọi hàm onClick được truyền vào
    },
    [onClick]
  );

  return (
    <div className={`mt-4 sm:mt-0 ${className}`}>
      <Button
        variant={variant === "ghost" ? "ghost" : "default"}
        className={`flex items-center gap-1 ${
          variant === "add"
            ? "bg-green-500 hover:bg-green-700 hover:ring-2 hover:ring-green-300 text-white transition-all duration-200 ease-in-out"
            : "pl-0 hover:pl-2 hover:bg-green-100 transition-all duration-200 ease-in-out text-black"
        } hover:scale-105 ${className}`}
        onClick={handleClick} // Gắn sự kiện onClick
      >
        {icon}
        {text}
      </Button>
    </div>
  );
}