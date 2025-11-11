import axios from 'axios';

export type District = {
  province?: string;
  district?: string;
  aqi?: number;
  pm25?: number;
  category?: string;
  measured_at?: string;
};

const api = axios.create({ baseURL: 'http://localhost:3000' });
console.log('clean-air.api module loaded, baseURL=', api.defaults.baseURL);

export async function getDistricts(): Promise<District[]> {
  console.log('getDistricts() called — GET /clean-air/districts');
  const res = await api.get('/clean-air/districts');
  console.log('getDistricts response', res.status, res.data);

  const payload = res?.data;

  const maybe = payload?.data ?? payload;

  if (Array.isArray(maybe)) return maybe;
  if (maybe && Array.isArray(maybe.districts)) return maybe.districts;
  if (payload && Array.isArray(payload.districts)) return payload.districts;

  console.warn('getDistricts: unexpected payload shape, returning []', payload);
  return [];
}
