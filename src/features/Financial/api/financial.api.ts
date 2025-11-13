import { apiClient } from '@/lib/apiClient';
import type {
  Wallet,
  CreateWalletRequest,
  UpdateWalletRequest,
  InsuranceCard,
  CreateInsuranceCardData,
  TopUpInsuranceCardData,
  InsuranceCardResponse,
  TopUpResponse,
} from '@/features/Financial/types';

// Fetch user wallet
export const fetchUserWallet = async (
  userId: number
): Promise<Wallet | null> => {
  const response = await apiClient.get(`/wallets/user/${userId}`);
  const wallets = response.data?.data?.wallets || [];
  return wallets[0] || null;
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

// Transfer funds between users
export const transferFunds = async (
  fromUserId: number,
  toUserId: number,
  amount: number
): Promise<{ status: string }> => {
  const response = await apiClient.post('/wallets/transfer', {
    from_user_id: fromUserId,
    to_user_id: toUserId,
    amount,
  });
  return response.data?.data;
};

// Insurance Card API calls

// Fetch user insurance cards
export const fetchUserInsuranceCards = async (
  userId: number
): Promise<InsuranceCard[]> => {
  const response = await apiClient.get(`/insurance-cards/user/${userId}`);
  return response.data?.data?.cards || [];
};

// Fetch single insurance card
export const fetchInsuranceCard = async (
  cardId: number
): Promise<InsuranceCard> => {
  const response = await apiClient.get(`/insurance-cards/${cardId}`);
  return response.data?.data?.card;
};

// Create insurance card
export const createInsuranceCard = async (
  data: CreateInsuranceCardData
): Promise<InsuranceCard> => {
  const response = await apiClient.post('/insurance-cards', data);
  return response.data?.data?.card;
};

// Top up insurance card from wallet
export const topUpInsuranceCard = async (
  cardId: number,
  data: TopUpInsuranceCardData
): Promise<TopUpResponse> => {
  const response = await apiClient.post(
    `/insurance-cards/${cardId}/top-up`,
    data
  );
  return response.data?.data;
};
