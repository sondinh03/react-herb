export interface BaseSearchParams {
  pageIndex: number;
  pageSize: number;
  keyword: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

export interface BaseListItem {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export type ViewType = 'grid' | 'list';
export type LoadingState = 'idle' | 'loading' | 'error' | 'success';