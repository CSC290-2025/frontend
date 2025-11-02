import { useQuery } from '@tanstack/react-query';
import { fetchItemsById } from '../api/freecycle.api';

//get item id
export function useItems(id: number) {
  return useQuery({
    queryKey: ['items', id],
    queryFn: () => fetchItemsById(id),
    enabled: !!id,
  });
}
