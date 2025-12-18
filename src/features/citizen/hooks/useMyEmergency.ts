import { useQuery } from '@tanstack/react-query';
import {
  fetchTrafficEmergencyStats,
  fetchTrafficEmergenciesByUser,
} from '../api/Emergency.api';

export function useEmergencyStats() {
  return useQuery({
    queryKey: ['trafficEmergencyStats'],
    queryFn: fetchTrafficEmergencyStats,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useMyEmergencies(userId?: number) {
  return useQuery({
    queryKey: ['trafficEmergenciesByUser', userId],
    enabled: typeof userId === 'number' && !Number.isNaN(userId),
    queryFn: () => fetchTrafficEmergenciesByUser(userId as number),
    staleTime: 10_000,
    refetchOnWindowFocus: true,
  });
}
