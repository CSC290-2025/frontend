import { useMutation } from '@tanstack/react-query';
import { submitAnswer } from '../api/exercise.api';

export const useSubmitAnswer = () => {
  return useMutation({
    mutationFn: ({
      questionId,
      userId,
      answer,
    }: {
      questionId: number;
      userId: number;
      answer: string;
    }) => submitAnswer(questionId, userId, answer),
  });
};
