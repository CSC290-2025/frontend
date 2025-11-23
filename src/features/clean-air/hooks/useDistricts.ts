import { useQuery } from '@tanstack/react-query';
import { getDistricts } from '../api/clean-air.api';
import type { District } from '@/types/district';

interface UseDistrictsQueryOptions {
  enabled?: boolean;
}

export default function useDistrictsQuery(
  options: UseDistrictsQueryOptions = {}
) {
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
      enabled: options.enabled,
      onSuccess(data) {
        console.debug('useDistrictsQuery onSuccess:', data);
      },
      onError(err) {
        console.error('useDistrictsQuery onError:', err);
      },
    }
  );
}
