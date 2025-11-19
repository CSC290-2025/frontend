import { useQuery } from '@tanstack/react-query';
import { fetchMonthlyStats } from '@/features/waste-management/api';

export function useMonthlyStats(month?: number, year?: number) {
  return useQuery({
    queryKey: ['waste-stats', 'monthly', month, year],
    queryFn: () => fetchMonthlyStats(month, year),
  });
}
