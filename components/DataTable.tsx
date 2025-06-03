/*
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

const customLoadingComponent = (
  <div className="py-10">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="flex justify-between px-4 py-2 border-b border-green-100">
        <Skeleton className="h-6 w-full mx-2 bg-green-100" />
        <Skeleton className="h-6 w-full mx-2 bg-green-100" />
      </div>
    ))}
  </div>
);

export function DataTable<T>({
  data,
  columns,
  isLoading,
  error,
  pagination,
  onPageChange,
  onPageSizeChange,
  emptyMessage = "No data found",
  loadingComponent = customLoadingComponent,
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

*/

import { useState } from "react";
import { Checkbox } from "./ui/checkbox";
import { Skeleton } from "./ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Pagination } from "./pagination";

interface Column<T> {
  key: string;
  header: React.ReactNode | ((props: any) => React.ReactNode);
  cell: (item: T, rowIndex: number) => React.ReactNode;
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
  selectable?: boolean;
  onSelectionChange?: (selectedRows: T[]) => void;
  labels?: {
    previous?: string;
    next?: string;
    showing?: string;
    of?: string;
    results?: string;
    display?: string;
  };
}

const customLoadingComponent = (
  <div className="py-10">
    {Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="flex justify-between px-4 py-2 border-b border-green-100">
        <Skeleton className="h-6 w-full mx-2 bg-green-100" />
        <Skeleton className="h-6 w-full mx-2 bg-green-100" />
      </div>
    ))}
  </div>
);

export function DataTable<T>({
  data,
  columns,
  isLoading,
  error,
  pagination,
  onPageChange,
  onPageSizeChange,
  emptyMessage = "No data found",
  loadingComponent = customLoadingComponent,
  errorComponent,
  showPagination = true,
  selectable = false,
  onSelectionChange,
  labels = {
    previous: "Previous",
    next: "Next",
    showing: "Showing",
    of: "of",
    results: "results",
    display: "Display",
  },
}: DataTableProps<T>) {
  // State for tracking selected rows
  const [selectedRows, setSelectedRows] = useState<Record<number, boolean>>({});
  const [selectAll, setSelectAll] = useState(false);
  
  // Handle select all rows
  const handleSelectAll = (checked: boolean) => {
    const newSelectedRows: Record<number, boolean> = {};
    
    if (checked) {
      data.forEach((_, index) => {
        newSelectedRows[index] = true;
      });
    }
    
    setSelectedRows(newSelectedRows);
    setSelectAll(checked);
    
    if (onSelectionChange) {
      const selectedItems = checked ? [...data] : [];
      onSelectionChange(selectedItems);
    }
  };
  
  // Handle select single row
  const handleSelectRow = (index: number, checked: boolean) => {
    const newSelectedRows = { ...selectedRows };
    
    if (checked) {
      newSelectedRows[index] = true;
    } else {
      delete newSelectedRows[index];
    }
    
    setSelectedRows(newSelectedRows);
    
    // Check if all rows are selected
    setSelectAll(Object.keys(newSelectedRows).length === data.length);
    
    if (onSelectionChange) {
      const selectedItems = Object.keys(newSelectedRows).map(
        (idx) => data[parseInt(idx)]
      );
      onSelectionChange(selectedItems);
    }
  };
  
  // Create selection column if selectable is true
  const allColumns = selectable
    ? [
        {
          key: "select",
          header: () => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={selectAll}
                onCheckedChange={handleSelectAll}
                aria-label="Chọn tất cả"
              />
            </div>
          ),
          cell: (item: T, rowIndex: number) => (
            <div className="flex items-center justify-center">
              <Checkbox
                checked={!!selectedRows[rowIndex]}
                onCheckedChange={(checked) => handleSelectRow(rowIndex, !!checked)}
                aria-label="Chọn hàng"
              />
            </div>
          ),
          className: "w-[40px]",
        },
        ...columns,
      ]
    : columns;

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-green-100">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-green-50">
            <TableRow>
              {allColumns.map((column, index) => (
                <TableHead
                  key={index}
                  className={`text-green-800 font-medium ${
                    column.className || ""
                  }`}
                >
                  {typeof column.header === "function"
                    ? column.header({ 
                        data, 
                        selectedRows, 
                        selectAll, 
                        handleSelectAll 
                      })
                    : column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={allColumns.length}
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
                  colSpan={allColumns.length}
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
                  colSpan={allColumns.length}
                  className="text-center py-10 text-gray-600"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  className={`hover:bg-green-50 transition-colors ${
                    selectedRows[rowIndex] ? "bg-green-50" : ""
                  }`}
                >
                  {allColumns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {column.cell(item, rowIndex)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showPagination && !isLoading && !error && data.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-green-100 bg-green-50/30 mt-2">
          <Pagination
            currentPage={pagination.currentPage + 1}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalElements}
            pageSize={pagination.pageSize}
            showPageSizeSelector={!!onPageSizeChange}
            onPageChange={(page) => {
              // Reset selection when changing page
              setSelectedRows({});
              setSelectAll(false);
              onPageChange(page);
            }}
            onPageSizeChange={(size) => {
              // Reset selection when changing page size
              setSelectedRows({});
              setSelectAll(false);
              if (onPageSizeChange) onPageSizeChange(size);
            }}
          />
        </div>
      )}
    </div>
  );
}