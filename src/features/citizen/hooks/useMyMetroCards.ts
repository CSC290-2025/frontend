import { useQuery } from '@tanstack/react-query';
import { fetchMyMetroCards } from '../api/MetroCards.api';

export function useMyMetroCards() {
  return useQuery({
    queryKey: ['myMetroCards'],
    queryFn: fetchMyMetroCards,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
