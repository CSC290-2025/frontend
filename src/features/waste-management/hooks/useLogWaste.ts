import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logWaste } from '@/features/waste-management/api';
import type { WasteLogRequest } from '@/features/waste-management/types';

export function useLogWaste() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WasteLogRequest) => logWaste(data),
    onSuccess: () => {
      // Invalidate both daily and monthly stats
      queryClient.invalidateQueries({ queryKey: ['waste-stats'] });
      queryClient.invalidateQueries({ queryKey: ['daily-stats'] });
      queryClient.invalidateQueries({ queryKey: ['waste-types'] });
    },
  });
}
