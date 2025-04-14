export const AUTH_ERRORS = {
  BAD_REQUEST: {
    success: false,
    message: "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu",
    code: 400,
  },

  INVALID_CREDENTIALS: {
    success: false,
    message: "Tên đăng nhập hoặc mật khẩu không chính xác",
    code: 401,
  },

  UNAUTHORIZED: {
    success: false,
    message: "Chưa đăng nhập hoặc token không hợp lệ",
    code: 401,
  },

  FORBIDDEN: {
    success: false,
    message: "Tài khoản không có quyền truy cập",
    code: 403,
  },

  NOT_FOUND: {
    success: false,
    message: "Không tìm thấy tài nguyên yêu cầu",
    code: 404,
  },

  SYSTEM_ERROR: {
    success: false,
    message: "Lỗi hệ thống. Vui lòng thử lại sau",
    code: 500,
  },

  SERVICE_UNAVAILABLE: {
    success: false,
    message: "Hệ thống đang bảo trì hoặc quá tải. Vui lòng thử lại sau",
    code: 503,
  },

  DEFAULT_ERROR: {
    success: false,
    message: "Đã xảy ra lỗi không mong muốn",
    code: 500,
  },

  INVALID_REGISTRATION: {
    success: false,
    message: "Thông tin đăng ký không hợp lệ",
    code: 400,
  },
};
