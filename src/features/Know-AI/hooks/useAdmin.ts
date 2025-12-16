import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPending, getApprove, changeApprove } from '../api/adminAi.api';

export function usePendingCourses() {
  return useQuery({
    queryKey: ['courses', 'pending'],
    queryFn: getPending,
    staleTime: 1000 * 60,
  });
}

export function useFetchApproveCourses() {
  return useQuery({
    queryKey: ['courses', 'approve'],
    queryFn: getApprove,
    staleTime: 1000 * 60,
  });
}

export function useApproveCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => changeApprove(id),
    onSuccess: () => {
      // Invalidate and refetch pending courses
      queryClient.invalidateQueries({ queryKey: ['courses', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['courses'] });
    },
    onError: (error) => {
      console.error('Failed to approve course:', error);
    },
  });
}
