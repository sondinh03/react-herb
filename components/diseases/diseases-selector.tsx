"use client";

import { useCallback, useEffect, useState } from "react";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DiseasesResponse } from "@/app/types/diseases";
import { debounce } from "lodash";

// Định nghĩa interface cho props của DiseaseSelector
interface DiseaseSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  diseases: DiseasesResponse[];
  isLoading: boolean;
}

export function DiseaseSelector({
  value,
  onValueChange,
  diseases,
  isLoading,
}: DiseaseSelectorProps) {
  const [filteredDiseases, setFilteredDiseases] = useState<DiseasesResponse[]>(
    []
  );
  const [searchKeyword, setSearchKeyword] = useState("");

  useEffect(() => {
    setFilteredDiseases(diseases);
  }, [diseases]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const keyword = e.target.value;
      setSearchKeyword(keyword);

      debouncedSearch(keyword);
    },
    []
  );

  // Tách riêng hàm debounce để tránh tạo mới mỗi khi render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((keyword: string) => {
      if (keyword.trim() === "") {
        setFilteredDiseases(diseases);
      } else {
        const filtered = diseases.filter((disease) =>
          disease.name.toLowerCase().includes(keyword.toLowerCase())
        );
        setFilteredDiseases(filtered);
      }
    }, 300),
    [diseases]
  );

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger>
        <SelectValue placeholder="Nhóm bệnh" />
      </SelectTrigger>
      <SelectContent>
        <div className="px-2 py-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Tìm kiếm nhóm bệnh..."
              className="pl-8 text-sm h-8"
              value={searchKeyword}
              onChange={handleSearchChange}
            />
          </div>
        </div>

        <SelectItem value="all">Tất cả bệnh</SelectItem>

        {isLoading ? (
          <div className="text-center py-2 text-sm text-gray-500">
            Đang tải...
          </div>
        ) : filteredDiseases.length > 0 ? (
          filteredDiseases.map((disease) => (
            <SelectItem key={disease.id} value={disease.id}>
              {disease.name}
            </SelectItem>
          ))
        ) : (
          <div className="text-center py-2 text-sm text-gray-500">
            {searchKeyword
              ? "Không tìm thấy nhóm bệnh"
              : "Chưa có dữ liệu bệnh"}
          </div>
        )}
      </SelectContent>
    </Select>
  );
}
