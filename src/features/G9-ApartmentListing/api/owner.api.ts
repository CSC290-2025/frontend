import { apiClient } from '@/lib/apiClient';

export const fetchApartmentOwner = (id: number) => {
  return apiClient.get(`/apartments/${id}/owners`);
};

export const fetchAPTUser = () => {
  return apiClient.get(`/users/roles/apartment-owners`);
};
