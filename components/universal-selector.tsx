// "use client";

// import { useCallback, useEffect, useState } from "react";
// import { Search } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { debounce } from "lodash";

// // Định nghĩa interface cho item tổng quát
// interface Item {
//   id: string;
//   name: string;
// }

// // Định nghĩa interface cho props của UniversalSelector
// interface UniversalSelectorProps {
//   value: string;
//   onValueChange: (value: string) => void;
//   items: Item[];
//   isLoading: boolean;
//   placeholder: string;
//   defaultOption?: {
//     value: string;
//     label: string;
//   };
//   searchPlaceholder?: string;
//   noDataMessage?: string;
//   notFoundMessage?: string;
// }

// export function UniversalSelector({
//   value,
//   onValueChange,
//   items,
//   isLoading,
//   placeholder,
//   defaultOption,
//   searchPlaceholder = "Tìm kiếm...",
//   noDataMessage = "Chưa có dữ liệu",
//   notFoundMessage = "Không tìm thấy",
// }: UniversalSelectorProps) {
//   const [filteredItems, setFilteredItems] = useState<Item[]>([]);
//   const [searchKeyword, setSearchKeyword] = useState("");

//   useEffect(() => {
//     // Kiểm tra kích thước dữ liệu để tránh lỗi bộ nhớ
//     if (items.length > 1000) {
//       console.warn("Cảnh báo: Danh sách items quá lớn, có thể gây lỗi bộ nhớ.", items.length);
//     }
//     setFilteredItems(items);
//   }, [items]);

//   const handleSearchChange = useCallback(
//     (e: React.ChangeEvent<HTMLInputElement>) => {
//       const keyword = e.target.value;
//       setSearchKeyword(keyword);

//       debouncedSearch(keyword);
//     },
//     []
//   );

//   // Tách riêng hàm debounce để tránh tạo mới mỗi khi render
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//   const debouncedSearch = useCallback(
//     debounce((keyword: string) => {
//       if (keyword.trim() === "") {
//         setFilteredItems(items);
//       } else {
//         const filtered = items.filter((item) =>
//           item.name.toLowerCase().includes(keyword.toLowerCase())
//         );
//         setFilteredItems(filtered);
//       }
//     }, 300),
//     [items]
//   );

//   return (
//     <Select value={value} onValueChange={onValueChange}>
//       <SelectTrigger>
//         <SelectValue placeholder={placeholder} />
//       </SelectTrigger>
//       <SelectContent>
//         <div className="px-2 py-1">
//           <div className="relative">
//             <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
//               <Search className="h-4 w-4 text-gray-400" />
//             </div>
//             <Input
//               type="text"
//               placeholder={searchPlaceholder}
//               className="pl-8 text-sm h-8"
//               value={searchKeyword}
//               onChange={handleSearchChange}
//             />
//           </div>
//         </div>

//         {defaultOption && (
//           <SelectItem value={defaultOption.value}>{defaultOption.label}</SelectItem>
//         )}

//         {isLoading ? (
//           <div className="text-center py-2 text-sm text-gray-500">
//             Đang tải...
//           </div>
//         ) : filteredItems.length > 0 ? (
//           filteredItems.map((item) => (
//             <SelectItem key={item.id} value={item.id}>
//               {item.name}
//             </SelectItem>
//           ))
//         ) : (
//           <div className="text-center py-2 text-sm text-gray-500">
//             {searchKeyword ? notFoundMessage : noDataMessage}
//           </div>
//         )}
//       </SelectContent>
//     </Select>
//   );
// }