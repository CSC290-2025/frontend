import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import type { RegisterFormData } from '@/features/auth/schemas';
export const useRegister = () => {
  return useMutation({
    mutationFn: (data: RegisterFormData) =>
      apiClient.post('/auth/register', data),
    onSuccess: () => {
      window.location.href = '/';
    },
  });
};
