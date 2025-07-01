export const ROLE_TYPES = {
    ADMIN: 1,
    EDITOR: 2,
    EXPERT: 3,
    USER: 4,
  } as const;
  
  export const ROLE_TYPE_LABELS = {
    [ROLE_TYPES.ADMIN]: "Quản trị viên",
    [ROLE_TYPES.EDITOR]: "Biên tập viên",
    [ROLE_TYPES.EXPERT]: "Chuyên gia",
    [ROLE_TYPES.USER]: "Người dùng thường",
  } as const;
  
  export const STATUSES = {
    ACTIVE: 1,
    INACTIVE: 2,
    BANNED: 3,
    PENDING: 4,
    DELETED: 5,
  } as const;
  
  export const STATUS_LABELS = {
    [STATUSES.ACTIVE]: "Hoạt động",
    [STATUSES.INACTIVE]: "Không hoạt động",
    [STATUSES.BANNED]: "Bị cấm",
    [STATUSES.PENDING]: "Chờ duyệt",
    [STATUSES.DELETED]: "Đã xóa",
  } as const;