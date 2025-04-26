import { NextRequest, NextResponse } from "next/server";

export const API_ERRORS = {
  BAD_REQUEST: {
    success: false,
    code: 400,
    message: "Yêu cầu không hợp lệ",
  },
  UNAUTHORIZED: {
    success: false,
    code: 401,
    message: "Chưa xác thực, vui lòng đăng nhập",
  },
  FORBIDDEN: {
    success: false,
    code: 403,
    message: "Bạn không có quyền truy cập chức năng này",
  },
  NOT_FOUND: {
    success: false,
    code: 404,
    message: "Không tìm thấy tài nguyên",
  },
  TIMEOUT_ERROR: {
    success: false,
    code: 408,
    message: "Yêu cầu quá thời gian chờ",
  },
  UNPROCESSABLE_ENTITY: {
    success: false,
    code: 422,
    message: "Dữ liệu không hợp lệ, vui lòng kiểm tra lại",
  },
  TOO_MANY_REQUESTS: {
    success: false,
    code: 429,
    message: "Bạn đã gửi quá nhiều yêu cầu, vui lòng thử lại sau",
  },
  SYSTEM_ERROR: {
    success: false,
    code: 500,
    message: "Lỗi hệ thống, vui lòng thử lại sau",
  },
  NETWORK_ERROR: {
    success: false,
    code: 503,
    message: "Không thể kết nối đến máy chủ",
  },
  DEFAULT_ERROR: {
    success: false,
    code: 500,
    message: "Đã xảy ra lỗi trong quá trình xử lý yêu cầu",
  },
};

// Generic search DTO interface
export interface SearchDto {
  pageIndex?: number;
  pageSize?: number;
  keyword?: string;
  sortField?: string;
  sortDirection?: string;
  filters?: Record<string, any>;
}

// Parse filters from URL search params
export function parseFilters(
  searchParams: URLSearchParams
): Record<string, any> {
  const filters: Record<string, any> = {};

  Array.from(searchParams.entries()).forEach(([key, value]) => {
    if (key.startsWith("filters[") && key.endsWith("]") && value !== "") {
      const filterKey = key.slice(8, -1); // Trích xuất tên bộ lọc
      filters[filterKey] = value;
    }
  });

  return filters;
}

// Build query string from search DTO
export function buildQueryString(searchDto: SearchDto): string {
  const params = new URLSearchParams();

  // Thêm các tham số cơ bản
  if (searchDto.pageIndex !== undefined) {
    params.append("pageIndex", searchDto.pageIndex.toString());
  }

  if (searchDto.pageSize !== undefined) {
    params.append("pageSize", searchDto.pageSize.toString());
  }

  if (searchDto.keyword) {
    params.append("keyword", searchDto.keyword);
  }

  if (searchDto.sortField) {
    params.append("sortField", searchDto.sortField);
  }

  if (searchDto.sortDirection) {
    params.append("sortDirection", searchDto.sortDirection);
  }

  // Thêm filters nếu có
  if (searchDto.filters && Object.keys(searchDto.filters).length > 0) {
    Object.entries(searchDto.filters).forEach(([key, value]) => {
      params.append(`filters[${key}]`, value.toString());
    });
  }

  return params.toString();
}

export function extractSearchDto(request: NextRequest): SearchDto {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const searchDto: SearchDto = {
    pageIndex: searchParams.has("pageIndex")
      ? Number.parseInt(searchParams.get("pageIndex")!, 10)
      : 1,

    pageSize: searchParams.has("pageSize")
      ? Number.parseInt(searchParams.get("pageSize")!, 10)
      : 12,
  };

  if (searchParams.has("keyword") && searchParams.get("keyword") !== "") {
    searchDto.keyword = searchParams.get("keyword")!;
  }

  if (searchParams.has("sortField") && searchParams.get("sortField") !== "") {
    searchDto.sortField = searchParams.get("sortField")!;
  }

  if (
    searchParams.has("sortDirection") &&
    searchParams.get("sortDirection") !== ""
  ) {
    searchDto.sortDirection = searchParams.get("sortDirection")!;
  }

  // Extract filters
  const filters = parseFilters(searchParams);
  if (Object.keys(filters).length > 0) {
    searchDto.filters = filters;
  }

  return searchDto;
}

// Extract token from Authorization header
export function extractToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  return authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : "";
}

export async function callApi(
  request: NextRequest,
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  successMessage: string,
  options: { requireAuth?: boolean } = { requireAuth: true }
): Promise<NextResponse> {
  try {
    // Build API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    const fullUrl = `${apiUrl}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add authorization header if required
    if (options.requireAuth !== false) {
      const token = extractToken(request);
      if (!token) {
        return NextResponse.json(API_ERRORS.UNAUTHORIZED, { status: 401 });
      }
      headers["Authorization"] = `Bearer ${token}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers,
    };

    // Extract request body for methods that need it
    if (method !== "GET" && method !== "HEAD") {
      const body = await request.json();
      requestOptions.body = JSON.stringify(body);
    }

    // Call the API
    const response = await fetch(fullUrl, requestOptions);

    if (!response.ok) {
      const errorMapping: Record<number, any> = {
        400: API_ERRORS.BAD_REQUEST,
        401: API_ERRORS.UNAUTHORIZED,
        403: API_ERRORS.FORBIDDEN,
        404: API_ERRORS.NOT_FOUND,
        500: API_ERRORS.SYSTEM_ERROR,
      };

      let errorMessage;

      try {
        const errorBody = await response.text();
        if (errorBody.trim()) {
          const parsedErrorBody = JSON.parse(errorBody);
          errorMessage = parsedErrorBody.message;
        }
      } catch {
        errorMessage = undefined;
      }

      const mappedError = errorMapping[response.status] || {
        ...API_ERRORS.DEFAULT_ERROR,
        code: response.status,
      };

      if (errorMessage) {
        mappedError.message = errorMessage;
      }

      return NextResponse.json(mappedError, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: data.data || data,
      message: successMessage,
    });
  } catch (error: any) {
    console.error(
      `Unexpected error in callApi ${method} (${endpoint}):`,
      error
    );

    if (error.name === "AbortError") {
      return NextResponse.json(API_ERRORS.TIMEOUT_ERROR, {
        status: API_ERRORS.TIMEOUT_ERROR.code,
      });
    }

    return NextResponse.json(API_ERRORS.DEFAULT_ERROR, {
      status: API_ERRORS.DEFAULT_ERROR.code,
    });
  }
}

export async function handleApiSearchRequest(
  request: NextRequest,
  endpoint: string,
  options: {
    defaultPageSize?: number;
    requireAuth?: boolean;
  } = {}
) {
  try {
    // Extract search parameters
    const searchDto = extractSearchDto(request);

    // Override default pageSize if provided
    if (options.defaultPageSize && !searchDto.pageSize) {
      searchDto.pageSize = options.defaultPageSize;
    }

    // Build API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    const queryString = buildQueryString(searchDto);
    const fullUrl = `${apiUrl}${endpoint}?${queryString}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Thêm authorization header nếu cần
    if (options.requireAuth !== false) {
      const token = extractToken(request);
      if (!token) {
        return NextResponse.json(API_ERRORS.UNAUTHORIZED, { status: 401 });
      }
      headers["Authorization"] = `Bearer ${token}`;
    }

    try {
      // Gọi API
      const response = await fetch(fullUrl, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        // Map error based on HTTP status code
        const errorMapping: Record<number, any> = {
          400: API_ERRORS.BAD_REQUEST,
          401: API_ERRORS.UNAUTHORIZED,
          403: API_ERRORS.FORBIDDEN,
          404: API_ERRORS.NOT_FOUND,
          500: API_ERRORS.SYSTEM_ERROR,
        };

        let errorMessage;

        try {
          const errorBody = await response.text();
          // Check if the body has data
          if (errorBody.trim()) {
            const parsedErrorBody = JSON.parse(errorBody);
            errorMessage = parsedErrorBody.message;
          }
        } catch {
          errorMessage = undefined;
        }

        const mappedError = errorMapping[response.status] || {
          ...API_ERRORS.DEFAULT_ERROR,
          code: response.status,
        };

        if (errorMessage) {
          mappedError.message = errorMessage;
        }

        return NextResponse.json(mappedError, { status: response.status });
      }

      const data = await response.json();
      return NextResponse.json({
        success: true,
        data: data.data || data, // Trường hợp API trả về trực tiếp data hoặc nested trong data
        message: "Lấy dữ liệu thành công",
      });
    } catch (fetchError: any) {
      // Handle fetch errors
      console.error("Fetch error:", fetchError);

      if (fetchError.name === "AbortError") {
        return NextResponse.json(API_ERRORS.TIMEOUT_ERROR, {
          status: API_ERRORS.TIMEOUT_ERROR.code,
        });
      }

      return NextResponse.json(API_ERRORS.NETWORK_ERROR, {
        status: API_ERRORS.NETWORK_ERROR.code,
      });
    }
  } catch (error: any) {
    console.error("Unexpected error in search route:", error);
    return NextResponse.json(API_ERRORS.DEFAULT_ERROR, {
      status: API_ERRORS.DEFAULT_ERROR.code,
    });
  }
}

export const callApiGet = (
  req: NextRequest,
  endpoint: string,
  successMessage: string,
  options?: { requireAuth?: boolean }
) => callApi(req, endpoint, "GET", successMessage, options);

/*
export async function callApiPost(
  request: NextRequest,
  endpoint: string,
  successMessage: string
): Promise<NextResponse> {
  try {
    // Extract token from the request
    const token = extractToken(request);
    if (!token) {
      return NextResponse.json(API_ERRORS.UNAUTHORIZED, { status: 401 });
    }

    // Extract request body
    const body = await request.json();

    // Build API URL
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8081";
    const fullUrl = `${apiUrl}${endpoint}`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // Call the API
    const response = await fetch(fullUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorMapping: Record<number, any> = {
        400: API_ERRORS.BAD_REQUEST,
        401: API_ERRORS.UNAUTHORIZED,
        403: API_ERRORS.FORBIDDEN,
        404: API_ERRORS.NOT_FOUND,
        500: API_ERRORS.SYSTEM_ERROR,
      };

      let errorMessage;

      try {
        const errorBody = await response.text();
        if (errorBody.trim()) {
          const parsedErrorBody = JSON.parse(errorBody);
          errorMessage = parsedErrorBody.message;
        }
      } catch {
        errorMessage = undefined;
      }

      const mappedError = errorMapping[response.status] || {
        ...API_ERRORS.DEFAULT_ERROR,
        code: response.status,
      };

      if (errorMessage) {
        mappedError.message = errorMessage;
      }

      return NextResponse.json(mappedError, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      data: data.data || data,
      message: successMessage,
    });
  } catch (error: any) {
    console.error(`Unexpected error in callApiPost (${endpoint}):`, error);

    if (error.name === "AbortError") {
      return NextResponse.json(API_ERRORS.TIMEOUT_ERROR, {
        status: API_ERRORS.TIMEOUT_ERROR.code,
      });
    }

    return NextResponse.json(API_ERRORS.DEFAULT_ERROR, {
      status: API_ERRORS.DEFAULT_ERROR.code,
    });
  }
}
  */

export const callApiPost = (
  req: NextRequest,
  endpoint: string,
  successMessage: string,
  options?: { requireAuth?: boolean }
) => callApi(req, endpoint, "POST", successMessage, options);

export const callApiPut = (
  req: NextRequest,
  endpoint: string,
  successMessage: string,
  options?: { requireAuth?: boolean }
) => callApi(req, endpoint, "PUT", successMessage, options);
