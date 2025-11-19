import { apiClient } from '@/lib/apiClient';
import type { apartmentTypes } from '@/features/G9-ApartmentListing/types';

export const fetchApartmentById = (id: number) => {
  return apiClient.get(`/apartments/${id}`);
};

export const createApartment = (
  data: apartmentTypes.CreateApartmentPayload
) => {
  return apiClient.post('/apartments', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateApartment = (
  id: number,
  data: apartmentTypes.UpdateApartmentPayload
) => {
  return apiClient.put(`/apartments/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteApartment = (id: number) => {
  return apiClient.delete(`/apartments/${id}`);
};

export const fetchAllApartments = () => {
  return apiClient.get('/apartments');
};

export const fetchApartmentsByUser = (userId: number) => {
  return apiClient.get(`/apartments/user/${userId}`);
};

export const countAvailableRooms = (id: number) => {
  return apiClient.get(`/apartments/${id}/available-rooms`);
};

export const filterApartments = (filters: Record<string, unknown>) => {
  return apiClient.get('/apartments/filter', { params: filters });
};

export const getRoomPriceRange = (apartmentId: number) => {
  return apiClient.get(`/apartments/${apartmentId}/room-price-range`);
};
