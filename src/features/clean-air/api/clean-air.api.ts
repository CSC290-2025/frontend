import axios from 'axios';
import type { District } from '@/types/district';

const api = axios.create({ baseURL: 'http://localhost:3000' });
console.log('clean-air.api module loaded, baseURL=', api.defaults.baseURL);

export async function getDistricts(): Promise<District[]> {
  const res = await api.get('/clean-air/districts');
  const districts = res?.data?.data?.districts;
  return districts;
}
