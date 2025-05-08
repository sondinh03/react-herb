import { DivideCircle } from "lucide-react";
import { OptimizedPagination } from "./optimized-pagination";
import { Pagination } from "./pagination";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

interface Column<T> {
  key: string;
  header: React.ReactNode;
  cell: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalElements: number;
    pageSize: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  emptyMessage?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  showPagination?: boolean;
  labels?: {
    previous?: string;
    next?: string;
    showing?: string;
    of?: string;
    results?: string;
    display?: string;
  };
}

// const customLoadingComponent = (
//   <div className="py-10">
//     {Array.from({ length: 3 }).map((_, index) => (
//       <div key={index} className="flex justify-between px-4 py-2 border-b border-green-100">
//         <Skeleton className="h-6 w-full mx-2 bg-green-100" />
//         <Skeleton className="h-6 w-full mx-2 bg-green-100" />
//       </div>
//     ))}
//   </div>
// );

export function DataTable<T>({
  data,
  columns,
  isLoading,
  error,
  pagination,
  onPageChange,
  onPageSizeChange,
  emptyMessage = "No data found",
  loadingComponent,
  errorComponent,
  showPagination = true,
  labels = {
    previous: "Previous",
    next: "Next",
    showing: "Showing",
    of: "of",
    results: "results",
    display: "Display",
  },
}: DataTableProps<T>) {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-green-100">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-green-50">
            <TableRow>
              {columns.map((column, index) => (
                <TableHead
                  key={index}
                  className={`text-green-800 font-medium ${
                    column.className || ""
                  }`}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10"
                >
                  {loadingComponent || (
                    <>
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                      </div>
                      <div className="mt-2 text-gray-600">
                        Đang tải dữ liệu...
                      </div>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10 text-red-500"
                >
                  {errorComponent || (
                    <>
                      <div className="mb-2">An error occurred</div>
                      <div className="text-sm">{error}</div>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-10 text-gray-600"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className="hover:bg-green-50 transition-colors"
                >
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {column.cell(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && !isLoading && !error && data.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-green-100 bg-green-50/30 mt-8">
          <Pagination
            currentPage={pagination.currentPage + 1}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalElements}
            pageSize={pagination.pageSize}
            showPageSizeSelector={!!onPageSizeChange}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            className="mt-12"
          />
        </div>
      )}
    </div>
  );
}
