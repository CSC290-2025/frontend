import { useQuery } from '@tanstack/react-query';
import { fetchQuestion } from '../api/exercise.api';

export const useQuestion = (questionId: number) => {
  return useQuery({
    queryKey: ['question', questionId],
    queryFn: () => fetchQuestion(questionId),
    enabled: !!questionId,
    staleTime: Infinity,
  });
};
