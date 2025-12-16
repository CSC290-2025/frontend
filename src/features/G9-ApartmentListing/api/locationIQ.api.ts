import { apiClient } from '@/lib/apiClient';

export const getDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) => {
  return apiClient.get(`/LocationIQ/distance`, {
    params: { lat1, lon1, lat2, lon2 },
  });
};

export const getNearbyAmenities = (
  lat: number,
  lon: number,
  radius: number,
  limit: number,
  tag?: string
) => {
  return apiClient.get(`/LocationIQ/nearby`, {
    params: { lat, lon, radius, limit, tag },
  });
};

//G11
export const getNearbyAllAmenities = (
  lat: number,
  lon: number,
  radius: number,
  limit: number,
  tag?: string
) => {
  return apiClient.get(`/nearby`, {
    params: { lat, lon, radius, limit, tag },
  });
};
