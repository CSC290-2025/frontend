export interface Wallet {
  id: number;
  owner_id: number;
  wallet_type: 'individual' | 'organization';
  organization_type: string | null;
  balance: number;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
}
