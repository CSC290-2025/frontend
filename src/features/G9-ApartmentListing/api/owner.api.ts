import { apiClient } from '@/lib/apiClient';

export const fetchApartmentOwner = (id: number) => {
  return apiClient.get(`/apartments/${id}/owners`);
};

export const fetchAPTUser = () => {
  return apiClient.get(`/users/roles/apartment-owners`);
};

export const getUser = () => {
  return apiClient.get(`/auth/me`);
};

export const getUserById = (id: number) => {
  return apiClient.get(`/users/${id}`);
};
