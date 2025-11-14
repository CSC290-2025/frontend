import { apiClient } from '@/lib/apiClient';
import * as UserType from '../types/citizenSetting.type';

export const getUserProflie = async (id: number) => {
  try {
    const response = await apiClient.get(`/user/profile/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw error;
  }
};

export const updateUserPersonal = async (
  id: number,
  data: UserType.PersonalProps
) => {
  try {
    const response = await apiClient.put(`/user/profile/personal/${id}`, data);
    return response;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
};

export const updateUserHealth = async (
  id: number,
  data: UserType.HeathProps
) => {
  try {
    const response = await apiClient.put(`/user/profile/health/${id}`, data);
    return response;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
};

export const updateUserAccount = async (
  id: number,
  data: UserType.AccountProps
) => {
  try {
    const response = await apiClient.put(`/user/profile/account/${id}`, data);
    return response;
  } catch (error) {
    console.error('Failed to update user:', error);
    throw error;
  }
};
