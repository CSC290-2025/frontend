import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IMGapi } from '@/features/G9-ApartmentListing/api/index';
import type { uploadTypes } from '@/features/G9-ApartmentListing/types/index';

// Query hook to fetch a picture by ID
export function usePicture(id: number) {
  return useQuery({
    queryKey: ['picture', id],
    queryFn: () => IMGapi.getPictureById(id),
    enabled: !!id,
  });
}

// Query hook to fetch all pictures by apartment ID
export function usePicturesByApartment(apartmentId: number) {
  return useQuery({
    queryKey: ['pictures', 'apartment', apartmentId],
    queryFn: () => IMGapi.getPicturesByApartmentId(apartmentId),
    enabled: !!apartmentId,
  });
}

// Legacy hook for backward compatibility
export function useImageById(id: number) {
  return useQuery({
    queryKey: ['image', id],
    queryFn: () => IMGapi.fetchImageById(id),
    enabled: !!id,
  });
}

// Legacy hook for backward compatibility
export function useImagesByApartment(apartmentId: number) {
  return useQuery({
    queryKey: ['images', 'apartment', apartmentId],
    queryFn: () => IMGapi.fetchAllImagesByApartmentId(apartmentId),
    enabled: !!apartmentId,
  });
}

// Mutation hook to upload a file
export function useUploadFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ apartmentId, file }: { apartmentId: number; file: File }) =>
      IMGapi.uploadFile(apartmentId, file),
    onSuccess: (_, { apartmentId }) => {
      // Invalidate pictures for the apartment
      queryClient.invalidateQueries({
        queryKey: ['pictures', 'apartment', apartmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['images', 'apartment', apartmentId],
      });
      // Also invalidate apartment data as new images affect the apartment
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId] });
    },
  });
}

// Legacy mutation hook for backward compatibility
export function useUploadImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      apartmentId,
      data,
    }: {
      apartmentId: number;
      data: uploadTypes.uploadData;
    }) => IMGapi.uploadImage(apartmentId, data),
    onSuccess: (_, { apartmentId }) => {
      // Invalidate pictures for the apartment
      queryClient.invalidateQueries({
        queryKey: ['pictures', 'apartment', apartmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['images', 'apartment', apartmentId],
      });
      // Also invalidate apartment data
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId] });
    },
  });
}

// Mutation hook to delete a file
export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: IMGapi.deleteFile,
    onSuccess: () => {
      // Invalidate all picture queries since we don't know which apartment was affected
      queryClient.invalidateQueries({ queryKey: ['pictures'] });
      queryClient.invalidateQueries({ queryKey: ['images'] });
      // Also invalidate apartment queries
      queryClient.invalidateQueries({ queryKey: ['apartments'] });
    },
  });
}

// Hook to upload multiple files
export function useUploadMultipleFiles() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      apartmentId,
      files,
    }: {
      apartmentId: number;
      files: File[];
    }) => {
      const uploadPromises = files.map((file) =>
        IMGapi.uploadFile(apartmentId, file)
      );
      return Promise.all(uploadPromises);
    },
    onSuccess: (_, { apartmentId }) => {
      // Invalidate pictures for the apartment
      queryClient.invalidateQueries({
        queryKey: ['pictures', 'apartment', apartmentId],
      });
      queryClient.invalidateQueries({
        queryKey: ['images', 'apartment', apartmentId],
      });
      // Also invalidate apartment data
      queryClient.invalidateQueries({ queryKey: ['apartment', apartmentId] });
    },
  });
}
