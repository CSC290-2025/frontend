import { useQuery } from '@tanstack/react-query';
import { fetchDailyWasteStats } from '../api/waste.api';

export function useDailyWasteHistory() {
  return useQuery({
    queryKey: ['wasteDailyStats'],
    queryFn: fetchDailyWasteStats,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
