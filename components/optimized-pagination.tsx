import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface PaginationProps {
  // Core pagination props
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  pageSize?: number;

  // Customization
  siblingsCount?: number;
  pageSizeOptions?: number[];
  showSummary?: boolean;
  showPageSizeSelector?: boolean;

  // Event handlers
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;

  // Styling and localization
  className?: string;
  labels?: {
    previous?: string;
    next?: string;
    showing?: string;
    of?: string;
    results?: string;
    display?: string;
  };

  // Navigation behavior
  useUrlParams?: boolean;
}

export function OptimizedPagination({
  currentPage = 1,
  totalPages,
  totalItems,
  pageSize = 10,
  siblingsCount = 1,
  pageSizeOptions = [10, 20, 50, 100],
  showSummary = true,
  showPageSizeSelector = false,
  onPageChange,
  onPageSizeChange,
  className = "",
  labels = {
    previous: "Trang trước",
    next: "Trang sau",
    showing: "Hiển thị",
    of: "của",
    results: "kết quả",
    display: "Hiển thị",
  },
  useUrlParams = false,
}: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Create array of pages to display
  const paginationRange = useMemo(() => {
    // Minimum number of pages to display (siblings on each side + first + last + current + 2 dots)
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

  const handlePageChange = (page: number) => {
    if (page == currentPage) return;

    if (onPageChange) {
      onPageChange(page);
    } else if (useUrlParams) {
      // If no callback but useUrlParams is true, use URL params
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`?${params.toString()}`);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else if (useUrlParams) {
      // If no callback but useUrlParams is true, use URL params
      const params = new URLSearchParams(searchParams.toString());
      params.set("pageSize", newSize.toString());
      // Reset to first page when changing page size
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }
  };

  // Display information about number of items
  const itemsInfo = useMemo(() => {
    if (!totalItems || !showSummary) return null;

    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(currentPage * pageSize, totalItems);

    return (
      <div className="text-sm text-gray-600">
        {labels.showing} <span className="font-medium">{start}</span> -{" "}
        <span className="font-medium">{end}</span> {labels.of}{" "}
        <span className="font-medium">{totalItems}</span> {labels.results}
      </div>
    );
  }, [currentPage, pageSize, totalItems, showSummary, labels]);

  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}`}
    >
      {itemsInfo}

      <div className="flex items-center gap-4">
        {showPageSizeSelector && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">{labels.display}</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) =>
                handlePageSizeChange(parseInt(value, 10))
              }
            >
              <SelectTrigger className="h-8 w-[70px] border-green-600 focus:ring-green-500">
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
            aria-label={labels.previous}
            className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 focus:ring-green-500"
          >
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
                  aria-hidden="true"
                  className="border-green-600"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              );
            }

            const page = pageNumber as number;

            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                aria-current={currentPage === page ? "page" : undefined}
                aria-label={`Page ${page}`}
                className={
                  currentPage === page
                    ? "bg-green-700 hover:bg-green-800 text-white"
                    : "border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 focus:ring-green-500"
                }
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
            aria-label={labels.next}
            className="border-green-600 text-green-700 hover:bg-green-50 hover:text-green-800 focus:ring-green-500"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      </div>
    </div>
  );
}
