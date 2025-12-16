// API request/response types

export interface CreateWalletRequest {
  user_id: number;
  wallet_type: 'individual' | 'organization';
  organization_type?: string;
}

export interface UpdateWalletRequest {
  wallet_type?: 'individual' | 'organization';
  organization_type?: string;
  status?: 'active' | 'suspended';
}

export interface ApiError {
  response?: {
    data?: {
      error?: {
        message: string;
      };
    };
    status?: number;
  };
  message: string;
}
