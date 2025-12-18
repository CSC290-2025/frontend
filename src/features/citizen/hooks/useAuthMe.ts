import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

type ApiSuccess<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
};

export type AuthMeApi = {
  authenticated: boolean;
  userId: number;
};

async function fetchAuthMe(): Promise<AuthMeApi> {
  const res = await apiClient.get<ApiSuccess<AuthMeApi>>('/auth/me');
  return res.data.data;
}

export function useAuthMe() {
  return useQuery({
    queryKey: ['authMe'],
    queryFn: fetchAuthMe,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
