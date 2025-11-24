// Types for Insurance Card feature
export interface InsuranceCard {
  id: number;
  user_id: number;
  card_number: string;
  balance: number;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}

export interface CreateInsuranceCardData {
  user_id: number;
}

export interface TopUpInsuranceCardData {
  wallet_id: number;
  amount: number;
}

export interface InsuranceCardResponse {
  cards: InsuranceCard[];
}

export interface TopUpResponse {
  card: InsuranceCard;
  transaction_id: number;
}
