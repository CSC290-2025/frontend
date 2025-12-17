import { useMutation, useQueryClient } from '@tanstack/react-query';
import { postWasteLog, type LogWasteBody } from '../api/waste.api';

export function useLogWaste() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (body: LogWasteBody) => postWasteLog(body),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: ['waste', 'stats', 'daily'] }),
        qc.invalidateQueries({ queryKey: ['waste', 'stats', 'monthly'] }),
      ]);
    },
  });
}
