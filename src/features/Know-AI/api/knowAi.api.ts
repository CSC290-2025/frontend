import { apiClient } from '@/lib/apiClient';
import type {
  CourseType,
  CreateCoursePayload,
  AddressData,
  EnrollCourse,
} from '@/types/course';

export const formatAddressToString = (addr: any) => {
  if (!addr) return '';
  return [
    addr.address_line,
    addr.subdistrict,
    addr.district,
    addr.province,
    addr.postal_code,
  ]
    .filter(Boolean)
    .join(', ');
};

export const getAddressById = async (id: number) => {
  try {
    const response = await apiClient.get(`/address/${id}`);
    return response.data.data as AddressData;
  } catch (error) {
    console.error(`Failed to get address ${id}`, error);
    throw error;
  }
};

export const calculateDistance = async (
  origin: string,
  destination: string
) => {
  try {
    const response = await apiClient.post(`/api/distance`, {
      origin,
      destination,
    });

    return (
      response.data.duration ||
      response.data.rows?.[0]?.elements?.[0]?.duration?.text
    );
  } catch (error) {
    console.error('Failed to calculate distance', error);
    throw error;
  }
};

export const getAllCourses = async () => {
  try {
    const response = await apiClient.get(`/courses`);
    return response.data.data.courses;
  } catch (error) {
    console.error('Failed to fetch all courses: ', error);
    throw error;
  }
};

export const getCoursesByType = async (type: CourseType) => {
  try {
    const response = await apiClient.get(`/course/type/${type}`);
    return response.data.data.courses;
  } catch (error) {
    console.error(`Failed to fetch courses by type ${type}: `, error);
    throw error;
  }
};

export const getCourseById = async (id: string | number) => {
  try {
    const response = await apiClient.get(`/course/${id}`);
    console.log(response.data.data);
    console.log(response.data);

    return response.data.data.course;
  } catch (error) {
    console.error(`Failed to fetch course id ${id}: `, error);
    throw error;
  }
};

export const createCourse = async (data: CreateCoursePayload) => {
  try {
    const response = await apiClient.post(`/createCourse`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to create course: ', error);
    throw error;
  }
};

export const uploadFile = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/upload/data/file', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.data.url;
  } catch (error) {
    console.error('Failed to upload file: ', error);
    throw error;
  }
};

export const enrollCourse = async (data: EnrollCourse) => {
  try {
    const response = await apiClient.post(`/createEnrollment`, data);
    return response.data;
  } catch (error) {
    console.error('Failed to enroll course: ', error);
    throw error;
  }
};
