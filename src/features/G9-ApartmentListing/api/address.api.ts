import { apiClient } from '@/lib/apiClient';
import type { addressTypes } from '@/features/G9-ApartmentListing/types';

export const fetchAddressById = (id: number) => {
  return apiClient.get(`/address/${id}`);
};

export const createAddress = (data: addressTypes.createAddress) => {
  return apiClient.post('/address', data);
};

export const updateAddress = (id: number, data: addressTypes.updateAddress) => {
  return apiClient.put(`/address/${id}`, data);
};

export const deleteAddress = (id: number) => {
  return apiClient.delete(`/address/${id}`);
};

export const fetchAllAddresses = () => {
  return apiClient.get('/healthcare/addresses');
};
