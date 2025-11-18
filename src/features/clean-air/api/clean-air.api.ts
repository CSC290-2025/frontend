import type { District } from '@/types/district';
import type { DistrictDetail } from '@/types/districtDetail';
import { apiClient } from '@/lib/apiClient';

const api = apiClient;

export async function getDistricts(): Promise<District[]> {
  const res = await api.get('/clean-air/districts');
  const districts = res?.data?.data?.districts;
  return districts;
}

export async function getDistrictDetail(
  district: string
): Promise<DistrictDetail> {
  if (!district) throw new Error('district parameter is required');

  const encoded = district;
  const res = await api.get(`/clean-air/districts/${encoded}`);
  const detail = res?.data?.data?.detail;

  return detail as DistrictDetail;
}
