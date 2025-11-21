import { useQuery } from '@tanstack/react-query';
import { fetchProgressByLevel, fetchLevel } from '../api/exercise.api';

export const useExerciseProgress = (level: number, userId: number) => {
  return useQuery({
    queryKey: ['exerciseProgress', level, userId],
    queryFn: () => fetchProgressByLevel(level, userId),
    staleTime: 0,
  });
};

export const useUserLevel = (userId: number) => {
  return useQuery({
    queryKey: ['userLevel', userId],
    queryFn: () => fetchLevel(userId),
    staleTime: 5 * 60 * 1000,
  });
};
