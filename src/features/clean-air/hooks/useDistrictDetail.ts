import { useQuery } from '@tanstack/react-query';
import type { DistrictDetail } from '@/types/districtDetail';
import { useDistrictsQuery } from './useDistricts';
import { getDistrictDetail } from '../api/clean-air.api';

export function useDistrictDetailQuery(district?: string) {
  return useQuery<DistrictDetail, Error>({
    queryKey: ['clean-air', 'district', district],
    queryFn: () => {
      if (!district) throw new Error('district is required');
      return getDistrictDetail(district);
    },
    enabled: Boolean(district),
    staleTime: 1000 * 60 * 2,
  });
}
