import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchUserWallets,
  createWallet,
  updateWallet,
  topUpWallet,
  generateQRCode,
} from '@/features/Financial';
import type { UpdateWalletRequest } from '@/features/Financial/types';

export function useUserWallets(userId: number) {
  return useQuery({
    queryKey: ['wallets', userId],
    queryFn: () => fetchUserWallets(userId),
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
