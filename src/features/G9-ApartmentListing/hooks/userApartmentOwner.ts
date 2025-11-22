import { useQuery } from '@tanstack/react-query';
import { OWN } from '@/features/G9-ApartmentListing/api/index';

// Query hook to fetch apartment owner by apartment ID
export function useApartmentOwnerByAPT(user_id: number) {
  return useQuery({
    queryKey: ['owners', 'user', user_id],
    queryFn: () => OWN.fetchApartmentOwner(user_id),
    select: (response) => {
      // Handle the API response structure:
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      // Fallback for different response structures
      if (response.data) {
        return response.data;
      }
      return response;
    },
    enabled: !!user_id,
  });
}
export function useAPTRole() {
  return useQuery({
    queryKey: ['apartment-owners', 'roles'],
    queryFn: () => OWN.fetchAPTUser(),
  });
}
