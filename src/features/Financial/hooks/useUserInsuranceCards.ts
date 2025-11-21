// Hook for fetching user insurance cards
import { useQuery } from '@tanstack/react-query';
import { fetchUserInsuranceCards } from '@/features/Financial/api/financial.api';

export function useUserInsuranceCards(userId: number) {
  return useQuery({
    queryKey: ['insurance-cards', userId],
    queryFn: () => fetchUserInsuranceCards(userId),
    enabled: !!userId,
  });
}
