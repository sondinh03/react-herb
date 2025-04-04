import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select"

interface PaginationSelectProps {
  value: number;
  onChange: (value: number) => void;
  options?: number[];
  className?: string;
}

export function PaginationSelect({
  value,
  onChange,
  options = [10, 20, 50, 100],
  className = "",
}: PaginationSelectProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-500">Hiển thị</span>
      <Select
        value={value.toString()}
        onValueChange={(val) => onChange(Number.parseInt(val, 10))}
      >
        <SelectTrigger className="h-8 w-[70px]">
          <SelectValue placeholder={value.toString()} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-sm text-gray-500">mục / trang</span>
    </div>
  );
}