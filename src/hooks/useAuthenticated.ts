import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export const useAuthenticated = () => {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => apiClient.get('/auth/me').then((res) => res.data.data),
  });
};
