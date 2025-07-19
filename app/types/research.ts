// Interface cho Research
export interface Research {
  id: number; 
  title: string; // Tiêu đề, bắt buộc
  slug?: string; // Slug, bắt buộc và duy nhất
  abstract?: string; 
  content: string; // Nội dung chi tiết, bắt buộc
  authors?: string; 
  institution?: string; 
  publishedYear?: number; // Năm xuất bản, tùy chọn
  journal?: string; // Tạp chí, tùy chọn
  field?: string; // Lĩnh vực, tùy chọn
  status: number; // Trạng thái, bắt buộc, sử dụng ResearchStatus enum
  views?: number; // Lượt xem, tùy chọn, mặc định 0
  mediaId?: number; // ID của tệp media, tùy chọn
  downloadPrice?: number; // Phí tải xuống, tùy chọn (BigDecimal ánh xạ thành number)
  previewPages: number;
  mediaUrl?: string; // URL của tệp media (PDF), tùy chọn, lấy từ mediaId hoặc dịch vụ lưu trữ
  isPurchased: boolean;
  createdBy?: string; // Người tạo, kế thừa từ BaseEntity
  createdAt?: string; // Thời gian tạo, kế thừa từ BaseEntity
  updatedBy?: string; // Người cập nhật, kế thừa từ BaseEntity
  updatedAt?: string; // Thời gian cập nhật, kế thừa từ BaseEntity
}

// Enum cho trạng thái của Research
export enum ResearchStatus {
  DRAFT = 1, // Bản nháp (mặc định trong entity)
  PENDING = 2, // Chờ duyệt
  PUBLISHED = 3, // Đã xuất bản
  ARCHIVED = 4, // Lưu trữ
  REJECTED = 5, // Từ chối
}