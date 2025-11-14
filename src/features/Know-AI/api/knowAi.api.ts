import { apiClient } from '@/lib/apiClient';

export const getAllCourses = async () => {
  try {
    const response = await apiClient.get(`/courses`);
    console.log('response: ', response);
    console.log('response.data: ', response);
    console.log('response.data.data: ', response);
    console.log('courses array: ', response.data.data.courses);
    return response.data.data.courses;
  } catch (error) {
    console.error('Failed to fetch all courses: ', error);
    throw error;
  }
};

export const getCoursesByType = async (type: 'onsite' | 'online') => {
  try {
    const response = await apiClient.get(`/course/type/${type}`);
    return response.data.data.courses;
  } catch (error) {
    console.error(`Failed to fetch courses by type ${type}: `, error);
    throw error;
  }
};
