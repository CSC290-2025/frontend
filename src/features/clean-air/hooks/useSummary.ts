import { useQuery } from '@tanstack/react-query';
import { getDistrictSummary } from '../api/clean-air.api';
import type { DistrictSummary } from '@/types/districtSummary';

export default function useSummaryQuery(district: string | undefined) {
  return useQuery<DistrictSummary, Error>(
    ['districts', district, 'summary'],
    async () => {
      if (!district) {
        throw new Error('District parameter is required');
      }
      const data = await getDistrictSummary(district);
      return data;
    },
    {
      enabled: !!district,
      staleTime: 60_000,
      retry: 1,
      refetchOnMount: 'always',
      onSuccess(data) {
        console.debug('useSummaryQuery onSuccess:', data);
      },
      onError(err) {
        console.error('useSummaryQuery onError:', err);
      },
    }
  );
}
