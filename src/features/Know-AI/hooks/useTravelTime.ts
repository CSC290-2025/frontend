import { useQuery } from '@tanstack/react-query';
import {
  getAddressById,
  calculateDistance,
  formatAddressToString,
} from '../api/knowAi.api';

export function useTravelDuration(
  userAddressId: number | undefined,
  courseAddressId: number | undefined | null,
  isEnabled: boolean
) {
  return useQuery({
    queryKey: ['travelDuration', userAddressId, courseAddressId],

    queryFn: async () => {
      if (!userAddressId || !courseAddressId) return null;

      const [userAddr, courseAddr] = await Promise.all([
        getAddressById(userAddressId),
        getAddressById(courseAddressId),
      ]);

      if (!userAddr || !courseAddr) return null;

      const originString = formatAddressToString(userAddr);
      const destinationString = formatAddressToString(courseAddr);

      console.log(
        'Calculating distance:',
        originString,
        '->',
        destinationString
      );

      const duration = await calculateDistance(originString, destinationString);

      return duration;
    },

    enabled: !!userAddressId && !!courseAddressId && isEnabled,
    staleTime: 1000 * 60 * 10,
  });
}
