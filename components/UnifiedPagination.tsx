import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface UnifiedPaginationProps {
  currentPage: number; // 0-based page index
  totalPages: number; // Total number of pages
  totalItems: number; // Total number of items
  pageSize: number; // Items per page
  pageSizeOptions?: number[]; // Available page size options
  onPageChange: (page: number) => void; // Handler for page change (0-based)
  onPageSizeChange?: (size: number) => void; // Handler for page size change
  className?: string; // Optional CSS class
  showSummary?: boolean; // Whether to show summary text
}

export function UnifiedPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  className = "",
  showSummary = true,
}: UnifiedPaginationProps) {
  // Generate page links with adaptive logic
  const generatePageLinks = () => {
    const pages = [];
    const maxVisiblePages = 5; // Show up to 5 page numbers
    const displayPage = currentPage + 1; // Convert to 1-based for display

    let startPage = Math.max(1, displayPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Add first page with ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push("ellipsis-start");
      }
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add last page with ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  // Calculate displayed items range
  const firstItem = totalItems === 0 ? 0 : currentPage * pageSize + 1;
  const lastItem = Math.min((currentPage + 1) * pageSize, totalItems);

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4 ${className}`}
    >
      {showSummary && (
        <div className="text-sm text-gray-500 order-2 sm:order-1">
          Hiển thị <span className="font-medium">{firstItem}</span> đến{" "}
          <span className="font-medium">{lastItem}</span> của{" "}
          <span className="font-medium">{totalItems}</span> kết quả
        </div>
      )}

      <div className="flex items-center gap-4 order-1 sm:order-2">
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Hiển thị</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => onPageSizeChange(parseInt(value, 10))}
            >
              <SelectTrigger className="h-8 w-[70px]">
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

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage > 0) {
                    onPageChange(currentPage - 1);
                  }
                }}
                className={
                  currentPage === 0 ? "pointer-events-none opacity-50" : ""
                }
              />
            </PaginationItem>

            {generatePageLinks().map((page, index) => {
              if (page === "ellipsis-start" || page === "ellipsis-end") {
                return (
                  <PaginationItem key={`ellipsis-${index}`}>
                    <span className="flex h-9 w-9 items-center justify-center">
                      ...
                    </span>
                  </PaginationItem>
                );
              }

              return (
                <PaginationItem key={`page-${page}`}>
                  <PaginationLink
                    href="#"
                    isActive={page === currentPage + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange(Number(page) - 1); // Convert back to 0-based for API
                    }}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              );
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (currentPage < totalPages - 1) {
                    onPageChange(currentPage + 1);
                  }
                }}
                className={
                  currentPage >= totalPages - 1
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
