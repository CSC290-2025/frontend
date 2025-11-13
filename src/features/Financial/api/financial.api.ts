import { apiClient } from '@/lib/apiClient';
import type {
  Wallet,
  CreateWalletRequest,
  UpdateWalletRequest,
} from '@/features/Financial/types';

// Fetch user wallets
export const fetchUserWallets = async (userId: number): Promise<Wallet[]> => {
  const response = await apiClient.get(`/wallets/user/${userId}`);
  return response.data?.data?.wallets || [];
};

// Create wallet
export const createWallet = async (
  data: CreateWalletRequest
): Promise<Wallet> => {
  const response = await apiClient.post('/wallets', data);
  return response.data?.data?.wallet;
};

// Update wallet
export const updateWallet = async (
  walletId: number,
  data: UpdateWalletRequest
): Promise<Wallet> => {
  const response = await apiClient.put(`/wallets/${walletId}`, data);
  return response.data?.data?.wallet;
};

// Top up wallet balance
export const topUpWallet = async (
  walletId: number,
  amount: number
): Promise<Wallet> => {
  const response = await apiClient.post(`/wallets/${walletId}/top-up`, {
    amount,
  });
  return response.data?.data?.wallet;
};

// Generate QR code
export const generateQRCode = async (amount: string): Promise<string> => {
  const response = await apiClient.post('/scb/qr/create', { amount });
  return response.data?.data?.qrResponse?.data?.qrRawData || '';
};
