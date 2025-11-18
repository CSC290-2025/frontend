import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';

export const useLogin = () => {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      apiClient.post('/auth/login', data),
    onSuccess: (response) => {
      // Cookies set automatically
      // Redirect or update app state
      console.log(response);
    },
  });
};
