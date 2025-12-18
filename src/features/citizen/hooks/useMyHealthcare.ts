import { useQuery } from '@tanstack/react-query';
import { fetchMyHealthcare } from '../api/healthcare.api';

export function useMyHealthcare(userId?: number) {
  return useQuery({
    queryKey: ['myHealthcare', userId],
    enabled: typeof userId === 'number' && !Number.isNaN(userId),
    queryFn: async () => {
      if (typeof userId !== 'number' || Number.isNaN(userId)) {
        throw new Error('Missing userId');
      }
      return fetchMyHealthcare(userId);
    },
    staleTime: 60_000,
  });
}
