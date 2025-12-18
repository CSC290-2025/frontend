import { useQuery } from '@tanstack/react-query';
import { fetchWasteTypes } from '../api/waste.api';

export function useWasteTypes() {
  return useQuery({
    queryKey: ['wasteTypes'],
    queryFn: fetchWasteTypes,
    staleTime: 5 * 60_000,
  });
}
