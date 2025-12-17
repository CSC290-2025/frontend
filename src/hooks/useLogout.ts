import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useNavigate } from '@/router';
import { useAuth } from '@/features/auth';

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout } = useAuth();

  return useMutation({
    mutationFn: () => apiClient.post('/auth/logout'),
    onSuccess: () => {
      logout(); // Clear user from auth context
      queryClient.clear(); // Clear all cached data
      navigate('/login');
    },
  });
};
