import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/features/auth';

export const useAuthenticated = () => {
  const { setUser, setError } = useAuth();

  const { data, isSuccess, isError, error, isLoading, isFetching } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.get('/user/me').then((res) => res.data.data),
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data.user);
      setError(null);
    }
  }, [isSuccess, data, setUser, setError]);

  useEffect(() => {
    if (isLoading) {
      setError(null);
    }
  }, [isLoading, setError]);

  return { data, isLoading, isSuccess, isError, error, isFetching };
};
