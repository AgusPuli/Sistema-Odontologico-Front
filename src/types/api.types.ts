/**
 * Standard envelope returned by the backend for every endpoint.
 * Matches `com.bs.odontograma.shared.dto.ApiResponse<T>` on the server.
 */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errorCode?: string
  timestamp: string
}

/**
 * Spring Data Page<T> shape.
 */
export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export interface PaginationParams {
  page?: number
  size?: number
  sort?: string
}

/**
 * Backend error codes (see GlobalExceptionHandler.java).
 */
export enum ErrorCode {
  ENTITY_NOT_FOUND = 'ENTITY_NOT_FOUND',
  BUSINESS_RULE_VIOLATION = 'BUSINESS_RULE_VIOLATION',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_ARGUMENT = 'INVALID_ARGUMENT',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export interface ApiError {
  success: false
  errorCode: ErrorCode | string
  message: string
  data?: unknown
  status: number
  timestamp?: string
}

export interface ValidationErrorData {
  [field: string]: string
}
