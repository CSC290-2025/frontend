import { useQuery } from '@tanstack/react-query';
import {
  getAddressById,
  getTransitLines,
  formatAddressToString,
} from '../api/knowAi.api';

export function useTransitLines(
  userAddress: string | undefined,
  courseAddressId: number | undefined | null,
  isEnabled: boolean
) {
  return useQuery({
    queryKey: ['transitLines', userAddress, courseAddressId],
    queryFn: async () => {
      if (!userAddress || !courseAddressId) return [];

      const courseAddr = await getAddressById(courseAddressId);
      if (!courseAddr) return [];

      const destination = formatAddressToString(courseAddr);

      return await getTransitLines(userAddress, destination);
    },
    enabled: !!userAddress && !!courseAddressId && isEnabled,
  });
}
