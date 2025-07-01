import { cn } from "@/lib/utils";
import { relative } from "path";
import { Input } from "./input";
import { Button } from "./button";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  placeholder?: string;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  onSearch,
  onClear,
  placeholder = "Tìm kiếm...",
  className,
}: SearchInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="pr-20"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-10 top-1/2 transform -translate-y-1/2"
          onClick={onClear}
          aria-label="Xóa từ khóa"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-2 top-1/2 transform -translate-y-1/2"
        onClick={onSearch}
        aria-label="Tìm kiếm"
      >
        <Search className="h-4 w-4" />
      </Button>
    </div>
  );
}
