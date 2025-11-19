import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useAuth } from '@/features/auth/context/AuthContext';
import type { RegisterFormData } from '@/features/auth/schemas';

export const useRegister = () => {
  const { setUser, setError, setLoading } = useAuth();

  return useMutation({
    mutationFn: async (data: Omit<RegisterFormData, 'confirmPassword'>) => {
      setLoading(true);
      try {
        const response = await apiClient.post('/auth/register', data);
        return response.data;
      } catch (err) {
        const error = err as { response?: { data?: { message?: string } } };
        const message = error.response?.data?.message || 'Registration failed';
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
