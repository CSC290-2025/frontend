import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient.ts';
import { useAuth } from '@/features/auth/context/AuthContext.tsx';
import type { LoginFormData } from '@/features/auth/schemas';
import { useNavigate } from '@/router';

export const useLogin = () => {
  const { setUser, setError, setLoading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
      queryClient.setQueryData(['user', 'me'], { user: response.data.user });
      navigate('/');
    },
  });
};
