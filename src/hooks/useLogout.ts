import { useMutation } from '@tanstack/react-query';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      queryClient.clear(); // Clear all cached data
      window.location.href = '/login';
    },
  });
};
