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
    },
    onError: (error) => {
      console.error('Error sending email:', error);
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
      window.location.href = '/login';
    },
  });
};
