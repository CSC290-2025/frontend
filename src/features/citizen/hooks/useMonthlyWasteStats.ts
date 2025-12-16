import { useQuery } from '@tanstack/react-query';
import { fetchMonthlyWasteStats } from '../api/waste.api';

export function useMonthlyWasteStats() {
  return useQuery({
    queryKey: ['waste', 'stats', 'monthly'],
    queryFn: fetchMonthlyWasteStats,
    staleTime: 60_000,
  });
}
