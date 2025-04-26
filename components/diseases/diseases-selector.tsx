"use client";

import { useEffect, useState } from "react";
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

// Định nghĩa interface cho props của DiseaseSelector
interface DiseaseSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function DiseaseSelector({ value, onValueChange }: DiseaseSelectorProps) {
  const [diseases, setDiseases] = useState<DiseasesResponse[]>([]);
  const [filteredDiseases, setFilteredDiseases] = useState<DiseasesResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Fetch dữ liệu diseases
  const fetchDiseases = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Xây dựng query string
      const queryParams = new URLSearchParams({
        pageIndex: "1",
        pageSize: "1000", // Lấy toàn bộ diseases
      });

      // Gọi API
      const response = await fetch(
        `/api/diseases/search?${queryParams.toString()}`
      );
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Không thể tải dữ liệu");
      }

      if (result.success) {
        const diseasesData = result.data.content;
        setDiseases(diseasesData);
        setFilteredDiseases(diseasesData);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error("Error fetching diseases:", error);
      setError(error.message || "Đã xảy ra lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  // Xử lý tìm kiếm
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value.toLowerCase();
    setSearchKeyword(keyword);

    if (keyword.trim() === "") {
      setFilteredDiseases(diseases);
    } else {
      const filtered = diseases.filter((disease) =>
        disease.name.toLowerCase().includes(keyword)
      );
      setFilteredDiseases(filtered);
    }
  };

  // Fetch dữ liệu khi component mount
  useEffect(() => {
    fetchDiseases();
  }, []);

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
              onChange={handleSearch}
            />
          </div>
        </div>

        <SelectItem value="all">Tất cả bệnh</SelectItem>

        {isLoading ? (
          <div className="text-center py-2 text-sm text-gray-500">Đang tải...</div>
        ) : filteredDiseases.length > 0 ? (
          filteredDiseases.map((disease) => (
            <SelectItem key={disease.id} value={disease.slug}>
              {disease.name}
            </SelectItem>
          ))
        ) : (
          <div className="text-center py-2 text-sm text-gray-500">
            {searchKeyword ? "Không tìm thấy nhóm bệnh" : "Chưa có dữ liệu bệnh"}
          </div>
        )}
      </SelectContent>
    </Select>
  );
}