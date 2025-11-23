import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export const useRegister = () => {
  return useMutation({
    mutationFn: (data: { email: string; username: string; password: string }) =>
      apiClient.post('/auth/register', data),
    onSuccess: () => {
      window.location.href = '/';
    },
  });
};
