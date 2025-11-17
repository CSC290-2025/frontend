import { apiClient } from '@/lib/apiClient';
import type { ratingTypes } from '@/features/G9-ApartmentListing/types';

export const fetchRatingsByApartmentId = (id: number) => {
  return apiClient.get(`/ratings/apartment/${id}`);
};

export const fetchAverageRatingByApartmentId = (id: number) => {
  return apiClient.get(`/ratings/apartment/${id}/average`);
};

export const createRating = (data: ratingTypes.createRating) => {
  return apiClient.post('/ratings', data);
};

export const updateRating = (id: number, data: ratingTypes.updateRating) => {
  return apiClient.put(`/ratings/${id}`, data);
};

export const deleteRating = (id: number) => {
  return apiClient.delete(`/ratings/${id}`);
};

export const fetchCommentsByApartmentId = (id: number) => {
  return apiClient.get(`/ratings/apartment/${id}/comments`);
};

export const fetchAllRatings = (id: number) => {
  return apiClient.get(`/apartments/${id}/ratings/comments`);
};
