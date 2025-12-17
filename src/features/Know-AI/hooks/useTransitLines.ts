import { useQuery } from '@tanstack/react-query';
import {
  getAddressById,
  getTransitLines,
  formatAddressToString,
} from '../api/knowAi.api';

export function useTransitLines(
  userAddressId: number | undefined,
  courseAddressId: number | undefined | null,
  isEnabled: boolean
) {
  return useQuery({
    queryKey: ['transitLines', userAddressId, courseAddressId],
    queryFn: async () => {
      if (!userAddressId || !courseAddressId) return [];

      const [userAddr, courseAddr] = await Promise.all([
        getAddressById(userAddressId),
        getAddressById(courseAddressId),
      ]);

      if (!userAddr || !courseAddr) return [];

      const origin = formatAddressToString(userAddr);
      const destination = formatAddressToString(courseAddr);

      return await getTransitLines(origin, destination);
    },
    enabled: !!userAddressId && !!courseAddressId && isEnabled,
    staleTime: 1000 * 60 * 10,
  });
}
