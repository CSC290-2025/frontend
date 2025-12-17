import { useQuery } from '@tanstack/react-query';
import { fetchMonthlyWasteStats } from '../api/waste.api';

export function useMonthlyWasteStats() {
  return useQuery({
    queryKey: ['wasteMonthlyStats'],
    queryFn: fetchMonthlyWasteStats,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
