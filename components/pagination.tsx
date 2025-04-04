import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;
  siblingsCount?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 12,
  siblingsCount = 1,
  onPageChange,
  className = "",
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Create array of pages to display
  const paginationRange = useMemo(() => {
    // Minimum number of pages to display
    const totalPageNumbers = siblingsCount * 2 + 5;

    // Case: few pages, display all
    if (totalPageNumbers >= totalPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Calculate left and right sibling indexes
    const leftSiblingIndex = Math.max(currentPage - siblingsCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingsCount, totalPages);

    // Don't show dots when there's only one number between siblings and boundary
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    // First and last page are always displayed
    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    // Case: no left dots but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingsCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "dots", lastPageIndex];
    }

    // Case: no right dots but left dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingsCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, "dots", ...rightRange];
    }

    // Case: both left and right dots
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
      // If no callback, use URL params
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`?${params.toString()}`);
    }
  };

  // Display information about number of items
  const itemsInfo = useMemo(() => {
    if (!totalItems) return null;

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className="text-sm text-gray-500">
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

      <nav className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <span className="sr-only">Trang trước</span>
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {paginationRange.map((pageNumber, index) => {
          if (pageNumber === "dots") {
            return (
              <Button
                key={`dots-${index}`}
                variant="outline"
                size="icon"
                disabled
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            );
          }

          const page = pageNumber as number;
          return (
            <Button
              key={page}
              variant="outline"
              size="sm"
              className={
                currentPage === page ? "bg-primary text-primary-foreground" : ""
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
        >
          <span className="sr-only">Trang sau</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </nav>
    </div>
  );
}
