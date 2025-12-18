import { useQuery } from '@tanstack/react-query';
import { fetchWasteEvents } from '../api';

export const useWasteEvents = () => {
  return useQuery({
    queryKey: ['events', 'waste'],
    queryFn: fetchWasteEvents,
  });
};
