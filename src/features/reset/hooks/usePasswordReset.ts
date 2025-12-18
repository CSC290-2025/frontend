import { useMutation, useQuery } from '@tanstack/react-query';

import {
  forgotPasswordRequest,
  verifyResetToken,
  resetPassword,
} from '../api/reset.api';

export const useForgetPassword = () => {
  return useMutation({
    mutationFn: forgotPasswordRequest,
    onSuccess: (data) => {
      console.log('Email sent successfully!', data);
      alert('If that email exists, a reset link has been sent.');
    },
    onError: (error: any) => {
      console.error('Error sending email:', error);
      alert(
        error.response?.data?.message ||
          'An error occurred while sending the email.'
      );
    },
  });
};

export const useVerifyToken = (token: string) => {
  return useQuery({
    queryKey: ['token', token],
    queryFn: () => verifyResetToken(token),
    enabled: !!token, // Only run if a token actually exists in URL
    retry: false,
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      alert('Password reset successfully!');
      window.location.href = '/login';
    },
    onError: (error: any) => {
      console.error('Error sending email:', error);
      alert(
        error.response?.data?.message ||
          'An error occurred while resetting password LOL'
      );
    },
  });
};
