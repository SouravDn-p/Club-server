export interface ApiResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T | null;
  meta?: Record<string, any>;
}
