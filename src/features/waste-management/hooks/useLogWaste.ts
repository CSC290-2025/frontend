import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logWaste } from '../api';
import type { WasteLogRequest } from '../types';

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
