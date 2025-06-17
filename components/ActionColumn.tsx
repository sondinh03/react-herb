import { toast } from "@/hooks/use-toast";
import { ActionButton } from "./ActionButton";
import {
  Archive,
  Check,
  Edit,
  Eye,
  MoreHorizontal,
  Trash2,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";

interface ActionColumnProps<T> {
  item: T;
  status: number;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onArchive: (id: number) => void;
  onDelete: (id: number) => void;
  statusOptions: { value: number; label: string }[];
}

export function ActionColumn<T extends { id: number; status: number }>({
  item,
  status,
  onView,
  onEdit,
  onApprove,
  onReject,
  onArchive,
  onDelete,
  statusOptions,
}: ActionColumnProps<T>) {
  const handleWait = () => {
    toast({
      title: "Chức năng chưa hoàn thiện",
      description: "Chức năng đang trong quá trình phát triển",
      variant: "info",
    });
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      {/* View */}
      <ActionButton
        icon={Eye}
        onClick={() => onView(item.id)}
        title="Xem chi tiết"
        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
      />

      {/* Edit */}
      <ActionButton
        icon={Edit}
        onClick={() => onEdit(item.id)}
        title="Chỉnh sửa"
        className="text-amber-600 hover:text-amber-800 hover:bg-amber-50"
      />

      {/* Approve - Only for pending status (2) */}
      <ActionButton
        icon={Check}
        onClick={status === 2 ? () => onApprove(item.id) : undefined}
        disabled={status !== 2}
        title={
          status === 2 ? "Duyệt" : "Chỉ có thể duyệt bài viết đang chờ duyệt"
        }
        className={`${
          status === 2
            ? "text-green-600 hover:text-green-800 hover:bg-green-50 cursor-pointer"
            : "text-gray-300 cursor-not-allowed"
        }`}
      />

      {/* Reject - Only for pending status (2) */}
      <ActionButton
        icon={X}
        onClick={status === 2 ? () => onReject(item.id) : undefined}
        disabled={status !== 2}
        title={
          status === 2
            ? "Từ chối"
            : "Chỉ có thể từ chối bài viết đang chờ duyệt"
        }
        className={`${
          status === 2
            ? "text-red-600 hover:text-red-800 hover:bg-red-50 cursor-pointer"
            : "text-gray-300 cursor-not-allowed"
        }`}
      />

      {/* Dropdown for additional actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
          >
            <span className="sr-only">Thao tác khác</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Thao tác khác</DropdownMenuLabel>
          {status === 3 && (
            <DropdownMenuItem onClick={() => onArchive(item.id)}>
              <Archive className="mr-2 h-4 w-4" />
              <span>Lưu trữ</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 hover:text-red-800 hover:bg-red-50"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Xóa</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
