import { apiClient } from '@/lib/apiClient';
import type {
  trafficLight,
  TrafficLightsResponse,
} from '../types/traffic.types';

export const getTrafficLights = async (): Promise<TrafficLightsResponse> => {
  const response = await apiClient.get('/traffic-lights');
  return response.data;
};

/*export const getTrafficLightStatus = async (id: number) => {
  const response = await apiClient.get(`/traffic-light/${id}`);
  return response.data;
};*/

export const trafficLightControl = (id: number, action: string) => {
  return apiClient.post(`/traffic-light/${id}/control`, { action });
};

export const getLightrequest = async () => {
  const response = await apiClient.get(`/api/light-requests`);
  return response.data;
};
