import { useQuery } from '@tanstack/react-query';
import { fetchVolunteerList } from '../api/volunteer.api';
import type { VolunteerListData } from '../api/volunteer.api';

export function useVolunteer() {
  return useQuery<VolunteerListData>({
    queryKey: ['volunteer-list'],
    queryFn: () => fetchVolunteerList({ page: 1, limit: 10 }),
    staleTime: 60_000,
  });
}
