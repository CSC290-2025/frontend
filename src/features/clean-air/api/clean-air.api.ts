import type { District } from '@/types/district';
import type { DistrictDetail } from '@/types/districtDetail';
import type { DistrictSummary } from '@/types/districtSummary';
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

export async function getHealthTips(district: string): Promise<string[]> {
  if (!district) throw new Error('district parameter is required');
  const encoded = district;
  const res = await api.get(`/clean-air/districts/${encoded}/health-tips`);
  const tips = res?.data?.data?.tips;
  return tips;
}

export async function getDistrictSummary(
  district: string
): Promise<DistrictSummary> {
  if (!district) throw new Error('district parameter is required');
  const encoded = district;
  const res = await api.get(`/clean-air/districts/${encoded}/health-tips`);
  const summary = res?.data?.data?.summary;
  return summary as DistrictSummary;
}
