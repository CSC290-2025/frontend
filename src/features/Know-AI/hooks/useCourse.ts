import { useQuery } from '@tanstack/react-query';
import { getAllCourses, getCoursesByType } from '../api/knowAi.api';

export function useCourses(type?: 'onsite' | 'online') {
  return useQuery({
    queryKey: ['courses', type],
    queryFn: () => (type ? getCoursesByType(type) : getAllCourses()),
    staleTime: 1000 * 60,
  });
}
