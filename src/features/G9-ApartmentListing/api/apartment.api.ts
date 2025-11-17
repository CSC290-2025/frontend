import { apiClient } from '@/lib/apiClient';
import type { apartmentTypes } from '@/features/G9-ApartmentListing/types';

export const fetchApartmentById = (id: number) => {
  return apiClient.get(`/apartment/${id}`);
};

export const createApartment = (
  data: apartmentTypes.CreateApartmentPayload
) => {
  return apiClient.post('/apartment', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const updateApartment = (
  id: number,
  data: apartmentTypes.UpdateApartmentPayload
) => {
  return apiClient.put(`/apartment/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteApartment = (id: number) => {
  return apiClient.delete(`/apartment/${id}`);
};

export const fetchAllApartments = () => {
  return apiClient.get('/apartment');
};

export const fetchApartmentsByUser = (userId: number) => {
  return apiClient.get(`/apartments/user/${userId}`);
};

export const countAvailableRooms = (_id: number) => {
  return apiClient.get('/apartment/count-available-rooms');
};

export const filterApartments = (filters: Record<string, unknown>) => {
  return apiClient.get('/apartment/filter', { params: filters });
};

export const getRoomPriceRange = (apartmentId: number) => {
  return apiClient.get(`/apartment/${apartmentId}/room-price-range`);
};
