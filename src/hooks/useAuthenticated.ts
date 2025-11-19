import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/features/auth';

export const useAuthenticated = () => {
  const { setUser, setError } = useAuth();

  const { data, isSuccess, isError, error, isLoading } = useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => apiClient.get('/user/me').then((res) => res.data.data),
    retry: false,
    staleTime: Infinity,
    gcTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });

  useEffect(() => {
    if (isSuccess && data) {
      setUser(data);
      setError(null);
    }
  }, [isSuccess, data, setUser, setError]);

  useEffect(() => {
    if (isLoading) {
      setError(null);
    }
  }, [isLoading, setError]);

  return { data, isLoading, isSuccess, isError, error };
};
