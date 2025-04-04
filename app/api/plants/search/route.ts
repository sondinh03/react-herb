import { NextRequest, NextResponse } from "next/server";


// Định nghĩa kiểu dữ liệu cho SearchDto để tăng tính an toàn về kiểu
interface SearchDto {
  pageIndex?: number
  pageSize?: number
  keyword?: string
  sortField?: string
  sortDirection?: string
  filters?: Record<string, any>
}

// Constants cho lỗi API
export const API_ERRORS = {
  BAD_REQUEST: {
    success: false,
    message: "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông số tìm kiếm",
    code: 400,
  },
  NOT_FOUND: {
    success: false,
    message: "Không tìm thấy dữ liệu",
    code: 404,
  },
  SYSTEM_ERROR: {
    success: false,
    message: "Lỗi hệ thống. Vui lòng thử lại sau",
    code: 500,
  },
  NETWORK_ERROR: {
    success: false,
    message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng",
    code: 503,
  },
  TIMEOUT_ERROR: {
    success: false,
    message: "Kết nối hết thời gian. Vui lòng thử lại",
    code: 408,
  },
  DEFAULT_ERROR: {
    success: false,
    message: "Đã xảy ra lỗi không mong muốn",
    code: 500,
  },
}

export async function GET(request: NextRequest) {
  try {
    // Trích xuất các tham số tìm kiếm
    const url = new URL(request.url)
    const searchParams = url.searchParams

    // Tạo SearchDto chỉ với các params có giá trị
    const searchDto: SearchDto = {}

    // Xử lý từng param một
    if (searchParams.has("pageIndex")) {
      searchDto.pageIndex = Number.parseInt(searchParams.get("pageIndex")!, 10)
    } else {
      searchDto.pageIndex = 1 // Giá trị mặc định
    }

    if (searchParams.has("pageSize")) {
      searchDto.pageSize = Number.parseInt(searchParams.get("pageSize")!, 10)
    } else {
      searchDto.pageSize = 12 // Giá trị mặc định
    }

    if (searchParams.has("keyword") && searchParams.get("keyword") !== "") {
      searchDto.keyword = searchParams.get("keyword")!
    }

    if (searchParams.has("sortField") && searchParams.get("sortField") !== "") {
      searchDto.sortField = searchParams.get("sortField")!
    }

    if (searchParams.has("sortDirection") && searchParams.get("sortDirection") !== "") {
      searchDto.sortDirection = searchParams.get("sortDirection")!
    }

    // Xử lý filters
    const filters = parseFilters(searchParams)
    if (Object.keys(filters).length > 0) {
      searchDto.filters = filters
    }

    // Trích xuất URL API từ biến môi trường với giá trị mặc định
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"
    const fullUrl = `${apiUrl}/api/plants/search`

    try {
      // Tạo query string từ searchDto
      const queryString = buildQueryString(searchDto)

      // Gọi API với fetch thay vì axios để giữ nhất quán với API login
      const response = await fetch(`${fullUrl}?${queryString}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Thêm timeout để tránh request treo quá lâu
        signal: AbortSignal.timeout(10000), // 10 giây timeout
      })

      if (!response.ok) {
        // Mapping lỗi dựa trên HTTP status code, tương tự như login API
        const errorMapping = {
          400: API_ERRORS.BAD_REQUEST,
          404: API_ERRORS.NOT_FOUND,
          500: API_ERRORS.SYSTEM_ERROR,
        }

        // Lấy thông báo lỗi tương ứng hoặc dùng mặc định
        const mappedError = errorMapping[response.status as keyof typeof errorMapping] || {
          ...API_ERRORS.DEFAULT_ERROR,
          code: response.status, // Giữ nguyên status code gốc
        }

        return NextResponse.json(mappedError, { status: response.status })
      }

      const data = await response.json()

      return NextResponse.json({
        success: true,
        data: data.data,
        message: "Lấy dữ liệu thành công",
      })
    } catch (fetchError: any) {
      console.error("Fetch error:", fetchError)

      // Xử lý lỗi fetch
      if (fetchError.name === "AbortError") {
        return NextResponse.json(API_ERRORS.TIMEOUT_ERROR, {
          status: API_ERRORS.TIMEOUT_ERROR.code,
        })
      }

      return NextResponse.json(API_ERRORS.NETWORK_ERROR, {
        status: API_ERRORS.NETWORK_ERROR.code,
      })
    }
  } catch (error: any) {
    // Xử lý lỗi chung
    console.error("Unexpected error in search route:", error)
    return NextResponse.json(API_ERRORS.DEFAULT_ERROR, {
      status: API_ERRORS.DEFAULT_ERROR.code,
    })
  }
}

// Hàm phụ trợ để phân tích bộ lọc từ các tham số URL
function parseFilters(searchParams: URLSearchParams): Record<string, any> {
  const filters: Record<string, any> = {}

  Array.from(searchParams.entries()).forEach(([key, value]) => {
    if (key.startsWith("filters[") && key.endsWith("]") && value !== "") {
      const filterKey = key.slice(8, -1) // Trích xuất tên bộ lọc
      filters[filterKey] = value
    }
  })

  return filters
}


// Hàm trợ giúp để biến đổi SearchDto thành query string
function buildQueryString(searchDto: SearchDto): string {
  const params = new URLSearchParams()

  // Thêm các tham số cơ bản
  if (searchDto.pageIndex !== undefined) {
    params.append("pageIndex", searchDto.pageIndex.toString())
  }

  if (searchDto.pageSize !== undefined) {
    params.append("pageSize", searchDto.pageSize.toString())
  }

  if (searchDto.keyword) {
    params.append("keyword", searchDto.keyword)
  }

  if (searchDto.sortField) {
    params.append("sortField", searchDto.sortField)
  }

  if (searchDto.sortDirection) {
    params.append("sortDirection", searchDto.sortDirection)
  }

  // Thêm filters nếu có
  if (searchDto.filters && Object.keys(searchDto.filters).length > 0) {
    Object.entries(searchDto.filters).forEach(([key, value]) => {
      params.append(`filters[${key}]`, value.toString())
    })
  }

  return params.toString()
}

// Hỗ trợ POST request nếu cần
export async function POST(request: NextRequest) {
  try {
    const searchDto = await request.json()

    // Trích xuất URL API từ biến môi trường với giá trị mặc định
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081"
    const fullUrl = `${apiUrl}/api/plants/search`

    try {
      // Gọi API với fetch thay vì axios
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchDto),
        signal: AbortSignal.timeout(10000), // 10 giây timeout
      })

      if (!response.ok) {
        console.log("HTTP Error Status:", response.status)

        // Mapping lỗi dựa trên HTTP status code
        const errorMapping = {
          400: API_ERRORS.BAD_REQUEST,
          404: API_ERRORS.NOT_FOUND,
          500: API_ERRORS.SYSTEM_ERROR,
        }

        // Lấy thông báo lỗi tương ứng hoặc dùng mặc định
        const mappedError = errorMapping[response.status as keyof typeof errorMapping] || {
          ...API_ERRORS.DEFAULT_ERROR,
          code: response.status,
        }

        return NextResponse.json(mappedError, { status: response.status })
      }

      const data = await response.json()

      return NextResponse.json({
        success: true,
        data: data.data,
        message: "Lấy dữ liệu thành công",
      })
    } catch (fetchError: any) {
      console.error("Fetch error:", fetchError)

      // Xử lý lỗi fetch
      if (fetchError.name === "AbortError") {
        return NextResponse.json(API_ERRORS.TIMEOUT_ERROR, {
          status: API_ERRORS.TIMEOUT_ERROR.code,
        })
      }

      return NextResponse.json(API_ERRORS.NETWORK_ERROR, {
        status: API_ERRORS.NETWORK_ERROR.code,
      })
    }
  } catch (error: any) {
    console.error("Unexpected error in search route:", error)
    return NextResponse.json(API_ERRORS.DEFAULT_ERROR, {
      status: API_ERRORS.DEFAULT_ERROR.code,
    })
  }
}