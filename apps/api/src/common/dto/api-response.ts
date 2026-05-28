import { ApiResponse } from '@onvest/shared';

export function ok<T>(data: T, message = 'OK'): ApiResponse<T> {
  return { data, message, success: true };
}
