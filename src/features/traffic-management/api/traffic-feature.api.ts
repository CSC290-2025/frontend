import { apiClient, getBaseAPIURL } from '@/lib/apiClient';
import type {
  trafficLight,
  TrafficLightsResponse,
} from '../types/traffic.types';

// Fetch all traffic lights from the API
export const getTrafficLights = async (): Promise<TrafficLightsResponse> => {
  const response = await fetch(getBaseAPIURL + '/traffic-lights');
  if (!response.ok) {
    throw new Error(`Failed to fetch traffic lights: ${response.statusText}`);
  }
  return response.json();
};

// Fetch broken traffic lights from the status endpoint
export const getTrafficLightsByStatus = async (
  status: string
): Promise<trafficLight[]> => {
  // The endpoint returns traffic lights filtered by status
  // Assuming the endpoint format is: /traffic-lights/status or /traffic-lights/status?status=broken
  const response = await fetch(getBaseAPIURL + `/traffic-lights/status`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch traffic lights by status: ${response.statusText}`
    );
  }
  const data = await response.json();

  // Filter for the requested status if the API returns all statuses
  // Assuming status field could be a string "broken" or a number where 0=broken
  let lights: trafficLight[] = [];

  if (Array.isArray(data)) {
    lights = data;
  } else if (data.data?.trafficLights) {
    lights = data.data.trafficLights;
  } else if (data.success && data.data) {
    lights = Array.isArray(data.data) ? data.data : [];
  }

  // Filter for broken lights (assuming status 0 means broken or status field equals "broken")
  return lights.filter(
    (light) =>
      light.status === 0 || light.statusLabel?.toLowerCase() === 'broken'
  );
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
