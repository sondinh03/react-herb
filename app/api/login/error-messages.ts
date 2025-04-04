export const AUTH_ERRORS = {
  // 400 - Lỗi do client gửi request không hợp lệ
  BAD_REQUEST: {
    success: false,
    message: "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại dữ liệu",
    code: 400,
  },
  
  // 401 - Lỗi xác thực
  INVALID_CREDENTIALS: {
    success: false,
    message: "Tên đăng nhập hoặc mật khẩu không chính xác",
    code: 401,
  },
  
  // 403 - Lỗi truy cập bị từ chối
  ACCOUNT_LOCKED: {
    success: false,
    message: "Tài khoản của bạn đã bị khóa",
    code: 403,
  },
  
  // 404 - Không tìm thấy tài nguyên
  NOT_FOUND: {
    success: false,
    message: "Không tìm thấy tài nguyên yêu cầu",
    code: 404,
  },
  
  // 500 - Lỗi server
  SYSTEM_ERROR: {
    success: false,
    message: "Lỗi hệ thống. Vui lòng thử lại sau",
    code: 500,
  },
  
  // 503 - Lỗi kết nối
  NETWORK_ERROR: {
    success: false,
    message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng",
    code: 503,
  },
  
  // Lỗi mặc định
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
