// Hook for fetching single insurance card
import { useQuery } from '@tanstack/react-query';
import { fetchInsuranceCard } from '@/features/Financial/api/financial.api';

export function useInsuranceCard(cardId: number) {
  return useQuery({
    queryKey: ['insurance-card', cardId],
    queryFn: () => fetchInsuranceCard(cardId),
    enabled: !!cardId,
  });
}
