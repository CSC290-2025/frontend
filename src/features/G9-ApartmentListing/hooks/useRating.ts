import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import {
  fetchRatingsByApartmentId,
  fetchAverageRatingByApartmentId,
  createRating,
  updateRating,
  deleteRating,
  fetchCommentsByApartmentId,
  fetchAllRatings,
} from '@/features/G9-ApartmentListing/api/rating.api';
import type { ratingTypes } from '@/features/G9-ApartmentListing/types';

// Query hook to fetch ratings for a specific apartment
export function useRatingsByApartment(apartmentId: number) {
  return useQuery({
    queryKey: ['ratings', 'apartment', apartmentId],
    queryFn: () => fetchRatingsByApartmentId(apartmentId),
    enabled: !!apartmentId,
  });
}

// Query hook to fetch average rating for a specific apartment
export function useAverageRating(apartmentId: number) {
  return useQuery({
    queryKey: ['ratings', 'apartment', apartmentId, 'average'],
    queryFn: async () => {
      try {
        const response = await fetchAverageRatingByApartmentId(apartmentId);
        return response;
      } catch (error) {
        // If the endpoint returns 404 (not found), return default rating of 0
        if (error instanceof AxiosError && error.response?.status === 404) {
          return { data: { average: 0 } };
        }
        throw error; // Re-throw other errors
      }
    },
    select: (data) => {
      // Handle the actual backend response structure
      // If data.data is a number (like 0), convert it to the expected format
      if (typeof data.data === 'number') {
        return { average: data.data };
      }
      // If data.data is already an object with average property, return it as is
      if (
        data.data &&
        typeof data.data === 'object' &&
        'average' in data.data
      ) {
        return data.data;
      }
      // Fallback
      return { average: 0 };
    },
    enabled: !!apartmentId,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors since we handle them gracefully
      if (error instanceof AxiosError && error.response?.status === 404) {
        return false;
      }
      // Default retry behavior for other errors
      return failureCount < 3;
    },
  });
}

// Query hook to fetch comments for a specific apartment
export function useCommentsByApartment(apartmentId: number) {
  return useQuery({
    queryKey: ['ratings', 'apartment', apartmentId, 'comments'],
    queryFn: () => fetchCommentsByApartmentId(apartmentId),
    enabled: !!apartmentId,
  });
}

// Query hook to fetch all ratings with comments for a specific apartment
export function useAllRatings(apartmentId: number) {
  return useQuery({
    queryKey: ['apartments', apartmentId, 'ratings', 'comments'],
    queryFn: () => fetchAllRatings(apartmentId),
    enabled: !!apartmentId,
  });
}

// Mutation hook to create a new rating
export function useCreateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ratingTypes.createRating) => createRating(data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch ratings for the apartment
      queryClient.invalidateQueries({
        queryKey: ['ratings', 'apartment', variables.apartmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['apartments', variables.apartmentId, 'ratings', 'comments'],
      });
    },
  });
}

// Mutation hook to update an existing rating
export function useUpdateRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: ratingTypes.updateRating;
    }) => updateRating(id, data),
    onSuccess: (response) => {
      // Invalidate queries related to the rating
      queryClient.invalidateQueries({
        queryKey: ['ratings'],
      });

      // If we have the apartment ID from the response, invalidate specific apartment ratings
      if (response?.data?.apartmentId) {
        queryClient.invalidateQueries({
          queryKey: ['ratings', 'apartment', response.data.apartmentId],
        });
        queryClient.invalidateQueries({
          queryKey: [
            'apartments',
            response.data.apartmentId,
            'ratings',
            'comments',
          ],
        });
      }
    },
  });
}

// Mutation hook to delete a rating
export function useDeleteRating() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRating(id),
    onSuccess: () => {
      // Invalidate all rating queries since we don't know which apartment this was for
      queryClient.invalidateQueries({
        queryKey: ['ratings'],
      });
      queryClient.invalidateQueries({
        queryKey: ['apartments'],
      });
    },
  });
}

// Enhanced mutation hook for updating rating with apartment context
export function useUpdateRatingWithContext(apartmentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: ratingTypes.updateRating;
    }) => updateRating(id, data),
    onSuccess: () => {
      // More specific invalidation when we know the apartment ID
      queryClient.invalidateQueries({
        queryKey: ['ratings', 'apartment', apartmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['apartments', apartmentId, 'ratings', 'comments'],
      });
    },
  });
}

// Enhanced mutation hook for deleting rating with apartment context
export function useDeleteRatingWithContext(apartmentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteRating(id),
    onSuccess: () => {
      // More specific invalidation when we know the apartment ID
      queryClient.invalidateQueries({
        queryKey: ['ratings', 'apartment', apartmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['apartments', apartmentId, 'ratings', 'comments'],
      });
    },
  });
}
