//example of how the hooks file should look like
import { useQuery } from '@tanstack/react-query';
import { fetchUserById } from '../../G9-ApartmentListing/api/feature.api';

//get user id
export function useUser(id: number) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUserById(id),
    enabled: !!id,
  });
}
