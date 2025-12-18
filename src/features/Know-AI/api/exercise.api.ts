import { apiClient } from '@/lib/apiClient';

export const fetchProgressByLevel = async (level: number, userId: number) => {
  try {
    const response = await apiClient.get(`/exercise/${level}/progress`, {
      params: {
        user_id: userId,
      },
    });
    //console.log('API Response:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error(`Failed to fetch Progress by level ${level}:`, error);
    throw error;
  }
};

export const fetchLevel = async (userId: number) => {
  try {
    const response = await apiClient.get(`/level/${userId}`);
    return response.data.data.level;
  } catch (error) {
    console.error(`Failed to fetch Level by userId ${userId}: `, error);
    throw error;
  }
};

export const fetchQuestion = async (questionId: number) => {
  try {
    const response = await apiClient.get(`/question/${questionId}`);
    console.log('Question Response:', response.data);

    return response.data.data.question;
  } catch (error) {
    console.error(
      `Failed to fetch Question by questionId ${questionId}: `,
      error
    );
    throw error;
  }
};

export const submitAnswer = async (
  questionId: number,
  userId: number,
  answer: string
) => {
  try {
    const response = await apiClient.post(`/exercise/${questionId}/submit`, {
      user_id: userId,
      user_answer: answer,
    });
    console.log('Submit Answer Response:', response.data);
    return response.data.data;
  } catch (error) {
    console.error(
      `Failed to submit answer for questionId ${questionId}: `,
      error
    );
    throw error;
  }
};
