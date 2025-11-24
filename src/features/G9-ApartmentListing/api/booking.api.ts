import { apiClient } from '@/lib/apiClient';
import type { bookingTypes } from '@/features/G9-ApartmentListing/types';

export const fetchBookingById = (id: number) => {
  return apiClient.get(`/bookings/${id}`);
};

export const createBooking = (data: bookingTypes.CreateBooking) => {
  return apiClient.post('/bookings', data);
};
export const updateBooking = (id: number, data: bookingTypes.UpdateBooking) => {
  return apiClient.put(`/bookings/${id}`, data);
};
export const updateBookingStatus = (id: number, status: string) => {
  return apiClient.put(`/bookings/${id}/status`, { booking_status: status });
};
export const deleteBooking = (id: number) => {
  return apiClient.delete(`/bookings/${id}`);
};
export const getBookingByApartment = (id: number) => {
  return apiClient.get(`/bookings/apartment/${id}`);
};
export const getAllBookingsForUser = (userId: number) => {
  return apiClient.get(`/bookings/user/${userId}`);
};
