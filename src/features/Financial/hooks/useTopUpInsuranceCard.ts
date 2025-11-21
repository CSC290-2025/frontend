// Hook for topping up insurance card
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { topUpInsuranceCard } from '@/features/Financial/api/financial.api';

export function useTopUpInsuranceCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      data,
    }: {
      cardId: number;
      data: { wallet_id: number; amount: number };
    }) => topUpInsuranceCard(cardId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-cards'] });
      queryClient.invalidateQueries({ queryKey: ['insurance-card'] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}
