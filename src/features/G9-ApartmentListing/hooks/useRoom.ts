import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ROOMapi } from '@/features/G9-ApartmentListing/api/index';
import type { roomTypes } from '@/features/G9-ApartmentListing/types/index';

// Query hook to fetch a single room by apartment ID and room ID
export function useRoom(apartmentId: number, roomId: number) {
  return useQuery({
    queryKey: ['room', apartmentId, roomId],
    queryFn: () => ROOMapi.fetchRoomById(apartmentId, roomId),
    select: (response) => {
      return response.data.data;
    },
    enabled: !!apartmentId && !!roomId,
  });
}

// Query hook to fetch all rooms for an apartment
export function useRooms(apartmentId: number) {
  return useQuery({
    queryKey: ['rooms', apartmentId],
    queryFn: () => ROOMapi.fetchAllRooms(apartmentId),
    select: (response) => {
      return response.data.data;
    },
    enabled: !!apartmentId,
  });
}

// Query hook to fetch rooms by status
export function useRoomsByStatus(apartmentId: number, status: string) {
  return useQuery({
    queryKey: ['rooms', apartmentId, 'status', status],
    queryFn: () => ROOMapi.getRoomByStatus(apartmentId, status),
    select: (response) => {
      return response.data.data;
    },
  });
}

// Mutation hook to create a new room
export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      apartmentId,
      data,
    }: {
      apartmentId: number;
      data: roomTypes.CreateRoom;
    }) => ROOMapi.createRoom(apartmentId, data),
    onSuccess: (_, { apartmentId }) => {
      // Invalidate rooms list for the apartment
      queryClient.invalidateQueries({ queryKey: ['rooms', apartmentId] });
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId] });
    },
  });
}

// Mutation hook to update a room
export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      apartmentId,
      roomId,
      data,
    }: {
      apartmentId: number;
      roomId: number;
      data: roomTypes.UpdateRoom;
    }) => ROOMapi.updateRoom(apartmentId, roomId, data),
    onSuccess: (_, { apartmentId, roomId }) => {
      // Invalidate specific room and rooms list
      queryClient.invalidateQueries({
        queryKey: ['room', apartmentId, roomId],
      });
      queryClient.invalidateQueries({ queryKey: ['rooms', apartmentId] });
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId] });
    },
  });
}

// Mutation hook to delete a room
export function useDeleteRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      apartmentId,
      roomId,
    }: {
      apartmentId: number;
      roomId: number;
    }) => ROOMapi.deleteRoom(apartmentId, roomId),
    onSuccess: (_, { apartmentId, roomId }) => {
      // Remove the room from cache and invalidate rooms list
      queryClient.removeQueries({ queryKey: ['room', apartmentId, roomId] });
      queryClient.invalidateQueries({ queryKey: ['rooms', apartmentId] });
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId] });
    },
  });
}
