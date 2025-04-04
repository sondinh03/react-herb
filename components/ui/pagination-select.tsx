"use client"

import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PaginationSelectProps {
  value: number
  onChange: (value: number) => void
  options?: number[]
  className?: string
  label?: string
  suffix?: string
}

export function PaginationSelect({
  value,
  onChange,
  options = [10, 20, 50, 100],
  className = "",
  label = "Hiển thị",
  suffix = "mục / trang",
}: PaginationSelectProps) {
  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <Select value={value.toString()} onValueChange={(val) => onChange(Number.parseInt(val, 10))}>
        <SelectTrigger className="h-8 w-[70px]">
          <SelectValue placeholder={value} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option.toString()}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
    </div>
  )
}

