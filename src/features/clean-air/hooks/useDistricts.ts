import { useQuery } from '@tanstack/react-query';
import { getDistricts } from '../api/clean-air.api';
import type { District } from '@/types/district';

export default function useDistrictsQuery() {
  return useQuery<District[], Error>(
    ['districts'],
    async () => {
      const data = await getDistricts();
      return data ?? [];
    },
    {
      staleTime: 60_000,
      retry: 1,
      refetchOnMount: 'always',
      onSuccess(data) {
        console.debug('useDistrictsQuery onSuccess:', data);
      },
      onError(err) {
        console.error('useDistrictsQuery onError:', err);
      },
    }
  );
}
