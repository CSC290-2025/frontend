import { useQuery } from '@tanstack/react-query';
import { fetchEvents } from '../api/Event.api';

export function useEvents(params?: {
  page?: number;
  limit?: number;
  q?: string;
  organization_id?: number;
  from?: string;
  to?: string;
}) {
  return useQuery({
    queryKey: ['events', params],
    queryFn: () => fetchEvents(params),
    enabled: true,
  });
}
