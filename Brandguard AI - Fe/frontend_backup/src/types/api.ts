export interface HealthStatus {
  status: string;
  service?: string;
  timestamp?: string;
  uptime?: number;
  version?: string;
  database?: string;
  mode?: string;
}

export interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown[];
  };
}

export interface ApiError {
  code?: string;
  message: string;
  status?: number;
  details?: unknown[];
}
