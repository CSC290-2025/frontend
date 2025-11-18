import { apiClient } from '@/lib/apiClient';
import type { addressTypes } from '@/features/G9-ApartmentListing/types';

export const fetchAddressById = (id: number) => {
  return apiClient.get(`/addresses/${id}`);
};

export const createAddress = (data: addressTypes.createAddress) => {
  return apiClient.post('/addresses', data);
};

export const updateAddress = (id: number, data: addressTypes.updateAddress) => {
  return apiClient.put(`/addresses/${id}`, data);
};

export const deleteAddress = (id: number) => {
  return apiClient.delete(`/addresses/${id}`);
};
