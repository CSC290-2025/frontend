import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteWasteLog } from '@/features/waste-management/api';

export function useDeleteWasteLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWasteLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['daily-logs'] });
    },
  });
}
