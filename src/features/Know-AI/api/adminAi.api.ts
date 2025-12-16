import { apiClient } from '@/lib/apiClient';

export const getPending = async () => {
  try {
    const response = await apiClient.get(`/coursePending`);
    return response.data.data.courses;
  } catch (error) {
    console.error('Failed to fetch pending courses: ', error);
    throw error;
  }
};

export const getApprove = async () => {
  try {
    const response = await apiClient.get(`/getApproveCourse`);
    return response.data.data.courses;
  } catch (error) {
    console.error('Failed to fetch approve course: ', error);
    throw error;
  }
};

export const changeApprove = async (id: number) => {
  try {
    const response = await apiClient.put(`/courseApprove/${id}`);
    return response.data.data.courses;
  } catch (error) {
    console.error('Failed to approve course: ', error);
    throw error;
  }
};
