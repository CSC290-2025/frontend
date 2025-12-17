import { apiClient } from '@/lib/apiClient';

export const createMarker = (data: {
  marker_type_id?: number;
  description?: string;
  location?: {
    lat: number;
    lng: number;
  } | null;
}) => {
  return apiClient.post('/markers', data);
};
