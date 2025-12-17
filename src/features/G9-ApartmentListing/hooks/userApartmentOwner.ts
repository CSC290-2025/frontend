import { useQuery } from '@tanstack/react-query';
import { OWN } from '@/features/G9-ApartmentListing/api/index';

// Query hook to fetch apartment owner by apartment ID
export function useApartmentOwnerByAPT(user_id: number) {
  return useQuery({
    queryKey: ['owners', 'user', user_id],
    queryFn: () => OWN.fetchApartmentOwner(user_id),
    select: (response) => {
      return response.data.data;
    },
    enabled: !!user_id,
  });
}
export function useUser() {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => OWN.getUser(),
    select: (response) => {
      return response.data.data;
    },
  });
}

export function useUserById(id: number) {
  return useQuery({
    queryKey: ['users', 'user', id],
    queryFn: () => OWN.getUserById(id),
    select: (response) => {
      return response.data.data;
    },
    enabled: !!id,
  });
}
