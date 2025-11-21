import { apiClient } from '@/lib/apiClient';
import type { SuccessMarker } from '../interfaces/api';
import type { MarkerResponseFrom } from '../interfaces/marker';
// import {get, post} from '.'

export const getAllMarkers = async (params?: {
  marker_type_id?: number;
  limit?: number;
  offset?: number;
}): Promise<MarkerResponseFrom[]> => {
  try {
    // const queryParams = new URLSearchParams();
    const { data } = await apiClient.get(`/api/markers?${params}`);
    return data.data;
  } catch (error) {
    console.error('fail to fetch all marker', error);
    throw error;
  }
};

export const getMarkerById = async (
  id: number
): Promise<MarkerResponseFrom[]> => {
  try {
    const { data } = await apiClient.get(`/api/marker/${id}`);
    return data.data;
  } catch (error) {
    console.error('fail to fetch markerbyID', error);
    throw error;
  }
};

// export const createMarker =async (id:type) => {

// }
