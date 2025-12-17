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

export const deleteCourse = async (id: number) => {
  try {
    const response = await apiClient.delete(`/course/${id}`);
    return response.data.data.courses;
  } catch (error) {
    console.error('Failed to delete course: ', error);
    throw error;
  }
};

export const updateCourse = async (id: number, data: any) => {
  try {
    const response = await apiClient.put(`/course/${id}`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to update course:', error);
    throw error;
  }
};
