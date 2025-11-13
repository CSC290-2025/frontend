import { apiClient } from '@/lib/apiClient';
import type {
  TrafficLight,
  TrafficLightsResponse,
} from '../types/traffic.types';

export const getTrafficLights = async (): Promise<TrafficLightsResponse> => {
  const response = await apiClient.get('/traffic-lights');
  return response.data;
};

export const getTrafficLightStatus = (id: number) => {
  return apiClient.get(`/traffic-light/${id}`);
};

export const trafficLightControl = (id: number, action: string) => {
  return apiClient.post(`/traffic-light/${id}/control`, { action });
};

export const getLightrequest = async () => {
  const response = await apiClient.get(`/api/light-requests`);
  return response.data;
};
