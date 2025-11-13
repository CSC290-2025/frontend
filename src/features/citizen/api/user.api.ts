import { apiClient } from '@/lib/apiClient';

export const getUserProflie = async (id: number) => {
  try {
    const response = await apiClient.get(`/user/profile/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};
