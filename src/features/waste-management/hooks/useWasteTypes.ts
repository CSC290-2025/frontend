import { useQuery } from '@tanstack/react-query';
import { fetchWasteTypes } from '../api';

export function useWasteTypes() {
  return useQuery({
    queryKey: ['waste-types'],
    queryFn: fetchWasteTypes,
  });
}
