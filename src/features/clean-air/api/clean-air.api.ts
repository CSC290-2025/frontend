import type { District } from '@/types/district';
import type { DistrictDetail } from '@/types/districtDetail';
import type { DistrictSummary } from '@/types/districtSummary';
import type { DistrictHistory } from '@/types/districtHistory';
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
  const res = await api.get(`/clean-air/districts/${encoded}/summary`);
  const summary = res?.data?.data?.summary;
  return summary as DistrictSummary;
}

export async function getDistrictHistory(
  district: string
): Promise<DistrictHistory> {
  if (!district) throw new Error('district parameter is required');
  const encoded = district;
  const res = await api.get(`/clean-air/districts/${encoded}/history`);
  const history = res?.data?.data?.history;
  return history as DistrictHistory;
}

export async function getFavoriteDistricts(): Promise<District[]> {
  console.log('Calling getFavoriteDistricts API...');
  try {
    const res = await api.get('/clean-air/favorites');
    console.log('Response:', res);
    const favorites = res?.data?.data?.favorites;
    return favorites as District[];
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function addFavoriteDistrict(district: string): Promise<District> {
  if (!district) throw new Error('district parameter is required');
  const encoded = district;

  try {
    const res = await api.post(`/clean-air/favorites/${encoded}`);
    const favorite = res?.data?.data?.favorite;
    return favorite as District;
  } catch (error: any) {
    // Handle 409 conflict specifically
    if (error?.response?.status === 409) {
      console.info(`District ${district} is already in favorites`);
      // You could either throw a custom error or fetch the current favorite
      throw new Error(`${district} is already in your favorites`);
    }
    throw error;
  }
}

export async function removeFavoriteDistrict(district: string): Promise<void> {
  if (!district) throw new Error('district parameter is required');
  const encoded = district;
  await api.delete(`/clean-air/favorites/${encoded}`);
}
