"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { debounce } from "lodash";

// Định nghĩa interface cho item tối thiểu
interface Item {
  id: number; // Đã thay đổi từ string sang number
  name: string;
  [key: string]: any; // Cho phép các thuộc tính tùy ý khác
}

// Định nghĩa interface cho props của GenericSelector
interface GenericSelectorProps<T extends Item> {
  value: string | number; // Hỗ trợ cả string và number
  onValueChange: (value: string | number) => void;
  items: T[];
  isLoading?: boolean;
  isSearching?: boolean;
  searchPlaceholder?: string;
  allOption?: {
    value: string | number;
    label: string;
  };
  noResultsText?: string;
  noDataText?: string;
  loadingText?: string;
  debounceTime?: number;
  maxDisplayItems?: number;
}

export function GenericSelector<T extends Item>({
  value,
  onValueChange,
  items,
  isLoading = false,
  isSearching = false,
  searchPlaceholder = "Tìm kiếm...",
  allOption = { value: "all", label: "Tất cả" },
  noResultsText = "Không tìm thấy mục",
  noDataText = "Chưa có dữ liệu",
  loadingText = "Đang tải...",
  debounceTime = 300,
  maxDisplayItems = 100,
}: GenericSelectorProps<T>) {
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Sử dụng useRef để lưu trữ hàm debounce
  const debouncedSearchRef = useRef<ReturnType<typeof debounce>>();

  // Khởi tạo hàm debounce một lần duy nhất khi component mount
  useEffect(() => {
    debouncedSearchRef.current = debounce((keyword: string, itemsToFilter: T[]) => {
      if (keyword.trim() === "") {
        setFilteredItems(itemsToFilter);
      } else {
        const normalized = keyword.toLowerCase().trim();
        const filtered = itemsToFilter
          .filter((item) => 
            item.name.toLowerCase().includes(normalized)
          )
          .slice(0, maxDisplayItems); // Giới hạn số lượng kết quả
        
        setFilteredItems(filtered);
      }
      setHasSearched(true);
    }, debounceTime);

    // Cleanup function để hủy debounce khi component unmount
    return () => {
      debouncedSearchRef.current?.cancel();
    };
  }, [debounceTime, maxDisplayItems]);

  // Cập nhật danh sách đã lọc khi items thay đổi
  useEffect(() => {
    setFilteredItems(items.slice(0, maxDisplayItems));
    
    // Áp dụng lại tìm kiếm nếu có từ khóa
    if (searchKeyword) {
      debouncedSearchRef.current?.(searchKeyword, items);
    }
  }, [items, maxDisplayItems, searchKeyword]);

  // Xử lý tìm kiếm khi người dùng nhập
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setSearchKeyword(keyword);
    setHasSearched(false);
    
    if (debouncedSearchRef.current) {
      debouncedSearchRef.current(keyword, items);
    }
  }, [items]);

  const getNoItemsMessage = () => {
    if (isLoading) return loadingText;
    if (isSearching) return loadingText;
    if (searchKeyword && hasSearched) return noResultsText;
    return noDataText;
  };

  const renderResultCount = () => {
    if (filteredItems.length === maxDisplayItems && items.length > maxDisplayItems) {
      return (
        <div className="text-center py-1 text-xs text-muted-foreground border-t">
          Hiển thị {maxDisplayItems} / {items.length} kết quả
        </div>
      );
    }
    return null;
  };

  return (
    <Select 
      value={typeof value === 'number' ? value.toString() : value.toString()} 
      onValueChange={(val) => {
        // Chuyển đổi lại thành số nếu là số hợp lệ, ngược lại giữ nguyên là string
        const numericValue = !isNaN(Number(val)) && val !== "all" ? Number(val) : val;
        onValueChange(numericValue);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Chọn mục" />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1 sticky top-0 bg-background z-10">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              {isSearching ? (
                <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
              ) : (
                <Search className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <Input
              type="text"
              placeholder={searchPlaceholder}
              className="pl-8 text-sm h-8"
              value={searchKeyword}
              onChange={handleSearchChange}
              disabled={isLoading}
            />
          </div>
        </div>

        {allOption && (
          <SelectItem value={allOption.value.toString()}>{allOption.label}</SelectItem>
        )}

        {(isLoading || isSearching || filteredItems.length === 0) ? (
          <div className="text-center py-2 text-sm text-muted-foreground">
            {getNoItemsMessage()}
          </div>
        ) : (
          <>
            {filteredItems.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name}
              </SelectItem>
            ))}
            {renderResultCount()}
          </>
        )}
      </SelectContent>
    </Select>
  );
}