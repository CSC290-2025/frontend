import { useQuery } from '@tanstack/react-query';
import { fetchDailyStats } from '@/features/waste-management/api';

export function useDailyStats(date?: string) {
  return useQuery({
    queryKey: ['daily-stats', date],
    queryFn: () => fetchDailyStats(date),
  });
}
