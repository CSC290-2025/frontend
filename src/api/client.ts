import { apiClient } from '@/lib/apiClient';
import type { AxiosRequestConfig } from 'axios';

export const request = async <T = unknown>(
  config: AxiosRequestConfig
): Promise<T> => {
  const response = await apiClient(config);
  return response.data;
};

export default request;
