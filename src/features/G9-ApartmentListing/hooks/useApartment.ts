import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { APTapi } from '@/features/G9-ApartmentListing/api/index';
import type { apartmentTypes } from '@/features/G9-ApartmentListing/types/index';

// Query hook to fetch a single apartment by ID
export function useApartment(id: number) {
  return useQuery({
    queryKey: ['apartment', id],
    queryFn: () => APTapi.fetchApartmentById(id),
    enabled: !!id,
  });
}

// Query hook to fetch all apartments
export function useApartments() {
  return useQuery({
    queryKey: ['apartments'],
    queryFn: APTapi.fetchAllApartments,
  });
}

// Query hook to fetch apartments by user ID
export function useApartmentsByUser(userId: number) {
  return useQuery({
    queryKey: ['apartments', 'user', userId],
    queryFn: () => APTapi.fetchApartmentsByUser(userId),
    enabled: !!userId,
  });
}

// Query hook to count available rooms
export function useAvailableRoomsCount(id: number) {
  return useQuery({
    queryKey: ['apartment', 'available-rooms', id],
    queryFn: () => APTapi.countAvailableRooms(id),
    enabled: !!id,
  });
}

// Query hook to filter apartments
export function useFilteredApartments(
  filters: Record<string, unknown>,
  enabled = true
) {
  return useQuery({
    queryKey: ['apartments', 'filter', filters],
    queryFn: () => APTapi.filterApartments(filters),
    enabled: enabled && Object.keys(filters).length > 0,
  });
}

// Mutation hook to create a new apartment
export function useCreateApartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: APTapi.createApartment,
    onSuccess: () => {
      // Invalidate and refetch apartments list
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
    },
  });
}

// Mutation hook to update an apartment
export function useUpdateApartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: apartmentTypes.UpdateApartmentPayload;
    }) => APTapi.updateApartment(id, data),
    onSuccess: (_, { id }) => {
      // Invalidate specific apartment and apartments list
      queryClient.invalidateQueries({ queryKey: ['apartment', id] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
    },
  });
}

// Mutation hook to delete an apartment
export function useDeleteApartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: APTapi.deleteApartment,
    onSuccess: (_, id) => {
      // Remove the apartment from cache and invalidate apartments list
      queryClient.removeQueries({ queryKey: ['apartment', id] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
    },
  });
}

export function useRoomPriceRange(apartmentId: number) {
  return useQuery({
    queryKey: ['apartment', apartmentId, 'room-price-range'],
    queryFn: () => APTapi.getRoomPriceRange(apartmentId),
    enabled: !!apartmentId,
  });
}
