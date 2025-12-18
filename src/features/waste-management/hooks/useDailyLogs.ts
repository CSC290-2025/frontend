import { useQuery } from '@tanstack/react-query';
import { fetchDailyLogs } from '@/features/waste-management/api';

export function useDailyLogs() {
  return useQuery({
    queryKey: ['daily-stats'],
    queryFn: () => fetchDailyLogs(),
  });
}
