import { ApiResponse } from '../types/global-api-response.Type';

export class ApiResponseHelper {
  static success<T>(data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
    return {
      statusCode,
      success: true,
      message,
      data,
    };
  }

  static error<T>(message = 'Error', statusCode = 400, data: T | null = null): ApiResponse<T> {
    return {
      statusCode,
      success: false,
      message,
      data,
    };
  }
}
