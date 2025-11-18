import { useQuery } from '@tanstack/react-query';
import { getDistrictHistory } from '../api/clean-air.api';
import type { DistrictHistory } from '@/types/districtHistory';

export function useHistoryQuery(district: string | undefined) {
  return useQuery<DistrictHistory, Error>(
    ['districts', district, 'history'],
    async () => {
      if (!district) {
        throw new Error('District parameter is required');
      }
      const data = await getDistrictHistory(district);
      return data;
    },
    {
      enabled: !!district,
      staleTime: 60_000,
      retry: 1,
      refetchOnMount: 'always',
      onSuccess(data) {
        console.debug('useHistoryQuery onSuccess:', data);
      },
      onError(err) {
        console.error('useHistoryQuery onError:', err);
      },
    }
  );
}
