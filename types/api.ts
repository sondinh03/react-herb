export interface HerbResponse<T = any> {
  code: number;
  message?: string;
  data?: T;
  success?: boolean;
}

// Interface cho phân trang (khớp với Page<T> trong backend)
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  pageIndex: number;
  pageSize: number;
}

export interface SearchParams {
  pageIndex: number;
  pageSize: number;
  keyword: string;
  sortField: string;
  sortDirection: string;
  filters: Record<string, string | number | boolean | undefined>;
}
