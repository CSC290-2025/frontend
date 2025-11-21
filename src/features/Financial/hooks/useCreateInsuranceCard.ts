// Hook for creating insurance card
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createInsuranceCard } from '@/features/Financial/api/financial.api';

export function useCreateInsuranceCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createInsuranceCard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance-cards'] });
    },
  });
}
