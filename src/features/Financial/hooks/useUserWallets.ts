import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUserWallet,
  createWallet,
  updateWallet,
  topUpWallet,
  generateQRCode,
  transferFunds,
} from '@/features/Financial';
import type { UpdateWalletRequest } from '@/features/Financial/types';

export function useUserWallet(userId: number) {
  return useQuery({
    queryKey: ['wallets', userId],
    queryFn: () => fetchUserWallet(userId),
    enabled: !!userId,
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWallet,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallets', data.owner_id] });
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      walletId,
      data,
    }: {
      walletId: number;
      data: UpdateWalletRequest;
    }) => updateWallet(walletId, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallets', data.owner_id] });
    },
  });
}

export function useTopUpWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ walletId, amount }: { walletId: number; amount: number }) =>
      topUpWallet(walletId, amount),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['wallets', data.owner_id] });
    },
  });
}

export function useGenerateQR() {
  return useMutation({
    mutationFn: generateQRCode,
  });
}

export function useTransferFunds() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      fromUserId,
      toUserId,
      amount,
    }: {
      fromUserId: number;
      toUserId: number;
      amount: number;
    }) => transferFunds(fromUserId, toUserId, amount),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['wallets', variables.fromUserId],
      });
      queryClient.invalidateQueries({
        queryKey: ['wallets', variables.toUserId],
      });
    },
  });
}
