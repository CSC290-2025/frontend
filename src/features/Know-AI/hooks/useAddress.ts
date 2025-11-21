import { useQuery } from '@tanstack/react-query';
import { getAddressById } from '../api/knowAi.api';

export function useAddress(id: number | undefined | null) {
  return useQuery({
    queryKey: ['address', id],
    queryFn: () => getAddressById(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 60,
  });
}
