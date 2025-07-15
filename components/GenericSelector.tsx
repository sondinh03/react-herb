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
  placeholder?: string;
  disabled?: boolean;
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
  placeholder = "Chọn mục",
  disabled = false,
}: GenericSelectorProps<T>) {
  const [filteredItems, setFilteredItems] = useState<T[]>([]);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // Sử dụng useRef để lưu trữ hàm debounce
  const debouncedSearchRef = useRef<ReturnType<typeof debounce>>();

  // Khởi tạo hàm debounce một lần duy nhất khi component mount
  useEffect(() => {
    debouncedSearchRef.current = debounce(
      (keyword: string, itemsToFilter: T[]) => {
        if (keyword.trim() === "") {
          setFilteredItems(itemsToFilter.slice(0, maxDisplayItems));
        } else {
          const normalized = keyword.toLowerCase().trim();
          const filtered = itemsToFilter
            .filter((item) => {
              return (
                item &&
                typeof item === "object" &&
                "id" in item &&
                "name" in item &&
                item.id !== null &&
                item.id !== undefined &&
                item.name !== null &&
                item.name !== undefined &&
                typeof item.name === "string"
              );
            })
            .filter((item) => item.name.toLowerCase().includes(normalized))
            .slice(0, maxDisplayItems);

          setFilteredItems(filtered);
        }
        setHasSearched(true);
      },
      debounceTime
    );

    // Cleanup function để hủy debounce khi component unmount
    return () => {
      debouncedSearchRef.current?.cancel();
    };
  }, [debounceTime, maxDisplayItems]);

  // Cập nhật danh sách đã lọc khi items thay đổi
  useEffect(() => {
    const validItems = items.filter((item) => {
      return (
        item &&
        typeof item === 'object' &&
        'id' in item &&
        'name' in item &&
        item.id !== null &&
        item.id !== undefined &&
        item.name !== null &&
        item.name !== undefined &&
        typeof item.name === 'string'
      );
    });

    if (searchKeyword) {
      debouncedSearchRef.current?.(searchKeyword, validItems);
    } else {
      setFilteredItems(validItems.slice(0, maxDisplayItems));
    }
  }, [items, maxDisplayItems, searchKeyword]);

  // Xử lý tìm kiếm khi người dùng nhập
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const keyword = e.target.value;
      setSearchKeyword(keyword);
      setHasSearched(false);

      const validItems = items.filter((item) => {
        return (
          item &&
          typeof item === 'object' &&
          'id' in item &&
          'name' in item &&
          item.id !== null &&
          item.id !== undefined &&
          item.name !== null &&
          item.name !== undefined &&
          typeof item.name === 'string'
        );
      });

      if (debouncedSearchRef.current) {
        debouncedSearchRef.current(keyword, validItems);
      }
    },
    [items]
  );

  const getNoItemsMessage = () => {
    if (isLoading) return loadingText;
    if (isSearching) return loadingText;
    if (searchKeyword && hasSearched) return noResultsText;
    return noDataText;
  };

  const renderResultCount = () => {
    if (
      filteredItems.length === maxDisplayItems &&
      items.length > maxDisplayItems
    ) {
      return (
        <div className="text-center py-1 text-xs text-muted-foreground border-t">
          Hiển thị {maxDisplayItems} / {items.length} kết quả
        </div>
      );
    }
    return null;
  };

  const handleValueChange = useCallback(
    (val: string) => {
      if (val === "all" || val === "") {
        onValueChange(val);
      } else {
        const numericValue = Number(val);
        if (!isNaN(numericValue)) {
          onValueChange(numericValue);
        } else {
          onValueChange(val);
        }
      }
    },
    [onValueChange]
  );

  const getDisplayValue = () => {
    if (value === "all" || value === "") {
      return allOption?.label || placeholder;
    }

    const selectedItem = items.find(
      (item) => item && (item.id === value || item.id === Number(value))
    );

    return selectedItem?.name || placeholder;
  };

  // return (
  //   <Select
  //     value={String(value)}
  //     onValueChange={handleValueChange}
  //     disabled={disabled || isLoading}
  //   >
  //     <SelectTrigger className="w-full">
  //       <SelectValue placeholder={placeholder}>
  //         {getDisplayValue()}
  //       </SelectValue>
  //     </SelectTrigger>
  //     <SelectContent>
  //       <div className="px-2 py-1 sticky top-0 bg-background z-10">
  //         <div className="relative">
  //           <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
  //             {isSearching ? (
  //               <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
  //             ) : (
  //               <Search className="h-4 w-4 text-muted-foreground" />
  //             )}
  //           </div>
  //           <Input
  //             type="text"
  //             placeholder={searchPlaceholder}
  //             className="pl-8 text-sm h-8"
  //             value={searchKeyword}
  //             onChange={handleSearchChange}
  //             disabled={isLoading}
  //           />
  //         </div>
  //       </div>

  //       {allOption && (
  //         <SelectItem value={allOption.value.toString()}>
  //           {allOption.label}
  //         </SelectItem>
  //       )}

  //       {isLoading || isSearching || filteredItems.length === 0 ? (
  //         <div className="text-center py-2 text-sm text-muted-foreground">
  //           {getNoItemsMessage()}
  //         </div>
  //       ) : (
  //         <>
  //           {filteredItems.map((item) => (
  //             <SelectItem
  //               key={`${item.id}-${item.name}`}
  //               value={String(item.id)}
  //               disabled={!item.id}
  //             >
  //               {item.name}
  //             </SelectItem>
  //           ))}
  //           {renderResultCount()}
  //         </>
  //       )}
  //     </SelectContent>
  //   </Select>
  // );

  return (
    <Select
      value={String(value)}
      onValueChange={handleValueChange}
      disabled={disabled || isLoading}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>{getDisplayValue()}</SelectValue>
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
              disabled={isLoading || disabled}
            />
          </div>
        </div>

        {allOption && (
          <SelectItem value={allOption.value.toString()}>
            {allOption.label}
          </SelectItem>
        )}

        {isLoading || isSearching || filteredItems.length === 0 ? (
          <div className="text-center py-2 text-sm text-muted-foreground">
            {getNoItemsMessage()}
          </div>
        ) : (
          <>
            {filteredItems.map((item) => (
              <SelectItem
                key={`${item.id}-${item.name}`} // Cải thiện key
                value={String(item.id)}
                disabled={!item.id}
              >
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
