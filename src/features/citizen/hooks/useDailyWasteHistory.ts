import { useQuery } from '@tanstack/react-query';
import { fetchDailyWasteStats } from '../api/waste.api';

export function useDailyWasteHistory() {
  return useQuery({
    queryKey: ['waste', 'stats', 'daily'],
    queryFn: fetchDailyWasteStats,
    staleTime: 60_000,
  });
}
