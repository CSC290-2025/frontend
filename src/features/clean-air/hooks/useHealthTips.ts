import { useQuery } from '@tanstack/react-query';
import { getHealthTips } from '../api/clean-air.api';

export function useHealthTipsQuery(district?: string) {
  return useQuery<string[], Error>({
    queryKey: ['clean-air', 'health-tips', district],
    queryFn: () => {
      if (!district) throw new Error('district is required');
      return getHealthTips(district);
    },
    enabled: Boolean(district),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
