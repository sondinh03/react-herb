import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  siblingsCount?: number;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 12,
  siblingsCount = 1,
  pageSizeOptions = [10, 20, 50, 100],
  showPageSizeSelector = false,
  onPageChange,
  onPageSizeChange,
  className = "",
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Create array of pages to display
  const paginationRange = useMemo(() => {
    const totalPageNumbers = siblingsCount * 2 + 5;

    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingsCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingsCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "dots", lastPageIndex];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingsCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, "dots", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, "dots", ...middleRange, "dots", lastPageIndex];
    }

    return [];
  }, [currentPage, totalPages, siblingsCount]);

  // Handle page change
  const handlePageChange = (page: number) => {
    if (page === currentPage) return;

    if (onPageChange) {
      onPageChange(page);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`?${params.toString()}`);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set("pageSize", newSize.toString());
      // Reset to first page when changing page size
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }
  };

  // Display information about number of items
  const itemsInfo = useMemo(() => {
    if (!totalItems) return null;

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className="text-sm text-gray-600">
        Hiển thị {start}-{end} của {totalItems} kết quả
      </div>
    );
  }, [currentPage, pageSize, totalItems]);

  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 ${className}`}
    >
      {itemsInfo}

      <div className="flex items-center gap-4">
      {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Số dòng </span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) =>
                handlePageSizeChange(parseInt(value, 10))
              }
            >
              <SelectTrigger className="h-8 w-[70px] border-gray-300 focus:ring-2 focus:ring-green-600 focus:ring-offset-2">
                <SelectValue placeholder={pageSize} />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <nav className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-10 w-10 rounded-md border-gray-300 text-gray-600 hover:bg-green-100 hover:text-green-700 hover:scale-105 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-200 focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
          >
            <span className="sr-only">Trang trước</span>
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {paginationRange.map((pageNumber, index) => {
            if (pageNumber === "dots") {
              return (
                <Button
                  key={`dots-${index}`}
                  variant="outline"
                  size="icon"
                  disabled
                  className="h-10 w-10 rounded-md border-gray-300 text-gray-600 bg-white"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              );
            }

            const page = pageNumber as number;
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className={
                  currentPage === page
                    ? "h-10 min-w-10 rounded-md bg-green-700 text-white hover:bg-green-800 hover:scale-105 focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-all duration-200"
                    : "h-10 min-w-10 rounded-md border-gray-300 text-gray-600 bg-white hover:bg-green-100 hover:text-green-700 hover:scale-105 focus:ring-2 focus:ring-green-600 focus:ring-offset-2 transition-all duration-200"
                }
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-10 w-10 rounded-md border-gray-300 text-gray-600 hover:bg-green-100 hover:text-green-700 hover:scale-105 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:scale-100 transition-all duration-200 focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
          >
            <span className="sr-only">Trang sau</span>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </nav>
      </div>
    </div>
  );
}
