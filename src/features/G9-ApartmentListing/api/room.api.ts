import { apiClient } from '@/lib/apiClient';
import type { roomTypes } from '@/features/G9-ApartmentListing/types';

export const fetchRoomById = (id: number, roomId: number) => {
  return apiClient.get(`/apartments/${id}/rooms/${roomId}`);
};
export const createRoom = (id: number, data: roomTypes.CreateRoom) => {
  return apiClient.post(`/apartments/${id}/rooms`, data);
};
export const updateRoom = (
  id: number,
  roomId: number,
  data: roomTypes.UpdateRoom
) => {
  return apiClient.put(`/apartments/${id}/rooms/${roomId}`, data);
};
export const deleteRoom = (id: number, roomId: number) => {
  return apiClient.delete(`/apartments/${id}/rooms/${roomId}`);
};
export const fetchAllRooms = (id: number) => {
  return apiClient.get(`/apartments/${id}/rooms`);
};
export const getRoomByStatus = (id: number, status: string) => {
  return apiClient.get(`/apartments/${id}/rooms/${status}`);
};
