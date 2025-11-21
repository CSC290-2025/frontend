import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllCourses,
  getCoursesByType,
  getCourseById,
  createCourse,
  uploadFile,
} from '../api/knowAi.api';
import type { CourseType, CreateCoursePayload } from '@/types/course';

export function useCourses(type?: CourseType) {
  return useQuery({
    queryKey: ['courses', type],
    queryFn: () => (type ? getCoursesByType(type) : getAllCourses()),
    staleTime: 1000 * 60,
  });
}

export function useCourseById(id: string | undefined) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourseById(id!),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCoursePayload) => createCourse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      alert('Course created successfully!');
    },
    onError: (error: any) => {
      console.error('Create Error:', error);
      alert(
        `Error creating course: ${error.response?.data?.message || error.message}`
      );
    },
  });
}

export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => uploadFile(file),
    onError: (error) => {
      console.error('Upload error:', error);
      alert('File upload failed');
    },
  });
}
