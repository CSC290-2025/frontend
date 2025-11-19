import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { LoginFormData } from '@/features/auth/schemas';

export const useLogin = () => {
  const { setUser, setError, setLoading } = useAuth();

  return useMutation({
    mutationFn: async (data: LoginFormData) => {
      setLoading(true);
      try {
        const response = await apiClient.post('/auth/login', data);
        return response.data;
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        const message = error.response?.data?.message || 'Login failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    onSuccess: (response) => {
      setUser(response.data.user);
      window.location.href = '/';
    },
  });
};
