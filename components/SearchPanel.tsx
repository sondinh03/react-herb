import { Download, Filter, Search } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

interface SearchPanelProps {
  keyword: string;
  onKeywordChange: (value: string) => void;
  onSearch: () => void;
  filterComponents?: React.ReactNode;
  showExport?: boolean;
  onExport?: () => void;
  placeholder?: string;
}

export function SearchPanel({
  keyword,
  onKeywordChange,
  onSearch,
  filterComponents,
  showExport = false,
  onExport,
  placeholder = "Search...",
}: SearchPanelProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder={placeholder}
            className="pl-10"
            value={keyword}
            onChange={(e) => onKeywordChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
          />
        </div>
        <div className="flex gap-2">
          {filterComponents}
          <Button
            variant="outline"
            className="flex items-center gap-1"
            onClick={onSearch}
          >
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          {showExport && (
            <Button
              variant="outline"
              className="flex items-center gap-1"
              onClick={onExport}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
