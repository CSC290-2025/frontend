import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BOOKapi } from '@/features/G9-ApartmentListing/api/index';
import type { bookingTypes } from '@/features/G9-ApartmentListing/types/index';

// Query hook to fetch a single booking by ID
export function useBooking(id: number) {
  return useQuery({
    queryKey: ['booking', id],
    queryFn: () => BOOKapi.fetchBookingById(id),
    select: (response) => response.data,
    enabled: !!id,
  });
}

// Query hook to fetch bookings by apartment ID
export function useBookingsByApartment(apartmentId: number) {
  return useQuery({
    queryKey: ['bookings', 'apartment', apartmentId],
    queryFn: () => BOOKapi.getBookingByApartment(apartmentId),
    enabled: !!apartmentId,
  });
}

// Query hook to fetch all bookings for a user
export function useBookingsByUser(userId: number) {
  return useQuery({
    queryKey: ['bookings', 'user', userId],
    queryFn: () => BOOKapi.getAllBookingsForUser(userId),
    enabled: !!userId,
  });
}

// Mutation hook to create a new booking
export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: BOOKapi.createBooking,
    onSuccess: (_data, variables) => {
      // Invalidate bookings lists
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      if (variables.user_id) {
        queryClient.invalidateQueries({
          queryKey: ['bookings', 'user', variables.user_id],
        });
      }
      // Also invalidate room and apartment queries as booking affects availability
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
    },
  });
}

// Mutation hook to update a booking
export function useUpdateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: bookingTypes.UpdateBooking;
    }) => BOOKapi.updateBooking(id, data),
    onSuccess: (_, { id, data }) => {
      // Invalidate specific booking and related queries
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      if (data.user_id) {
        queryClient.invalidateQueries({
          queryKey: ['bookings', 'user', data.user_id],
        });
      }
      // Invalidate room and apartment queries
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
    },
  });
}

// Mutation hook to update booking status
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      BOOKapi.updateBookingStatus(id, status),
    onSuccess: (_, { id }) => {
      // Invalidate specific booking and related queries
      queryClient.invalidateQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Invalidate room and apartment queries as status change affects availability
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
    },
  });
}

// Mutation hook to delete a booking
export function useDeleteBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: BOOKapi.deleteBooking,
    onSuccess: (_, id) => {
      // Remove the booking from cache and invalidate bookings lists
      queryClient.removeQueries({ queryKey: ['booking', id] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      // Invalidate room and apartment queries as deletion affects availability
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
    },
  });
}
