import { useQuery } from '@tanstack/react-query';
import {
  getAddressById,
  calculateDistance,
  formatAddressToString,
} from '../api/knowAi.api';

export function useTravelDuration(
  userAddress: string | undefined,
  courseAddressId: number | undefined | null,
  isEnabled: boolean
) {
  return useQuery({
    queryKey: ['travelDuration', userAddress, courseAddressId],
    queryFn: async () => {
      if (!userAddress || !courseAddressId) return null;

      const courseAddr = await getAddressById(courseAddressId);
      if (!courseAddr) return null;

      const destinationString = formatAddressToString(courseAddr);

      const duration = await calculateDistance(userAddress, destinationString);
      return duration;
    },
    enabled: !!userAddress && !!courseAddressId && isEnabled,
  });
}
