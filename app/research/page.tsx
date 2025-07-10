"use client";

import { GenericSelector } from "@/components/GenericSelector";
import { Pagination } from "@/components/pagination";
import { ResearchCard } from "@/components/research/ResearchCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchReseaches } from "@/hooks/research/useSearchReseaches";
import { Search, X } from "lucide-react";
import { useState } from "react";

export default function ResearchPage() {
  const {
    searchState,
    researches,
    isLoading,
    error,
    totalElements,
    totalPages,
    updateSearchState,
    resetSearch,
    refetch,
  } = useSearchReseaches();

  const [searchInput, setSearchInput] = useState(searchState.keyword);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchState({ keyword: searchInput, pageIndex: 1 });
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleFilterChange = (filterKey: string, value: string) => {
    updateSearchState({
      filters: {
        ...searchState.filters,
        [filterKey]: value,
      },
      pageIndex: 1,
    });
  };

  const handlePageChange = (page: number) => {
    updateSearchState({ pageIndex: page });
  };

  const handleReset = () => {
    setSearchInput("");
    resetSearch();
  };

  const handleClearKeyword = () => {
    setSearchInput("");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Nghiên cứu khoa học
          </h1>
          <p className="mt-2 text-gray-600">
            Các đề tài nghiên cứu về cây dược liệu ({totalElements} kết quả)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            Xóa bộ lọc
          </Button>
          <Button variant="outline" onClick={() => refetch()}>
            Tải lại
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <form
          onSubmit={handleSearchSubmit}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="col-span-1 md:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Tìm kiếm nghiên cứu..."
                className="pl-10 pr-16"
                value={searchInput}
                onChange={handleSearchInputChange}
              />
              {searchInput && (
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={handleClearKeyword}
                  aria-label="Xóa từ khóa"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
          {/* <div>
            {isLoadingYears ? (
              <div className="h-10 bg-gray-200 rounded animate-pulse"></div>
            ) : (
              <GenericSelector
                value={searchState.filters.publishedYear || "all"}
                onValueChange={(value) =>
                  handleFilterChange("publishedYear", value)
                }
                items={years}
                isLoading={isLoadingYears}
                isSearching={false}
                searchPlaceholder="Tìm kiếm năm..."
                allOption={{ value: "all", label: "Tất cả năm" }}
                noResultsText="Không tìm thấy năm"
                noDataText="Chưa có dữ liệu năm"
                loadingText="Đang tải danh sách năm..."
              />
            )}
          </div> */}
        </form>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {isLoading ? (
          Array.from({ length: searchState.pageSize }).map((_, index) => (
            <div
              key={index}
              className="flex justify-between px-4 py-2 border-b border-green-100"
            >
              <Skeleton className="h-6 w-full mx-2 bg-green-100" />
              <Skeleton className="h-6 w-full mx-2 bg-green-100" />
            </div>
          ))
        ) : researches.length > 0 ? (
          researches.map((research) => (
            <ResearchCard key={research.id} research={research} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500 text-lg">
              Không tìm thấy nghiên cứu nào phù hợp
            </p>
            <Button variant="outline" onClick={handleReset} className="mt-4">
              Xóa bộ lọc
            </Button>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={searchState.pageIndex}
          totalPages={totalPages}
          totalItems={totalElements}
          pageSize={searchState.pageSize}
          onPageChange={handlePageChange}
          className="mt-12"
        />
      )}
    </div>
  );
}
