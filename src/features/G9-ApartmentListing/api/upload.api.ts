import { apiClient } from '@/lib/apiClient';
import type { uploadTypes } from '@/features/G9-ApartmentListing/types';

// Get a picture by ID
export const getPictureById = (id: number) => {
  return apiClient.get(`/upload/${id}`);
};

// Get all pictures by apartment ID
export const getPicturesByApartmentId = (apartmentId: number) => {
  return apiClient.get(`/upload/apartment/${apartmentId}`);
};

// Upload a file with multipart/form-data
export const uploadFile = (apartmentId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.post(`/upload/${apartmentId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Delete a file by ID
export const deleteFile = (fileId: string) => {
  return apiClient.delete(`/upload/delete/${fileId}`);
};

// Legacy exports for backward compatibility
export const fetchImageById = getPictureById;
export const fetchAllImagesByApartmentId = getPicturesByApartmentId;

export const uploadImage = (
  apartmentId: number,
  data: uploadTypes.uploadData
) => {
  // Convert the uploadData to File if needed for legacy support
  if (data instanceof File) {
    return uploadFile(apartmentId, data);
  }
  return apiClient.post(`/uploads/${apartmentId}`, data);
};
