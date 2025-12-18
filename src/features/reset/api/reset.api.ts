import { apiClient } from '@/lib/apiClient';

type ForgotPasswordInput = {
  email: string;
};

export const forgotPasswordRequest = async (data: ForgotPasswordInput) => {
  const response = await apiClient.post('/auth/forget_password', data);

  if (!response) {
    throw new Error('Failed to send reset email');
  }

  return response;
};

export const verifyResetToken = async (token: string) => {
  const response = await apiClient.get(`/auth/verify-token?token=${token}`);

  return response;
};

export const resetPassword = async (data: {
  token: string;
  newPassword: string;
}) => {
  const response = await apiClient.put(`/auth/change-password`, data);

  return response;
};
