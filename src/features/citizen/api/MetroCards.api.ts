import { apiClient } from '@/lib/apiClient';

export type ApiSuccess<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
};

export type MetroCardApi = {
  id: number;
  user_id: number;
  balance: number;
  card_number: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type MetroCardsMeDataApi = {
  metroCards: MetroCardApi[];
};

function getToken(): string | null {
  const keys = [
    'accessToken',
    'access_token',
    'token',
    'jwt',
    'idToken',
    'firebaseIdToken',
  ];

  for (const k of keys) {
    const v = localStorage.getItem(k);
    if (v) return v;
  }
  for (const k of keys) {
    const v = sessionStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

export async function fetchMyMetroCards(): Promise<MetroCardApi[]> {
  const token = getToken();

  if (!token) return [];

  try {
    const res = await apiClient.get<ApiSuccess<MetroCardsMeDataApi>>(
      '/metro-cards/me',
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const cards = res?.data?.data?.metroCards ?? [];
    return Array.isArray(cards) ? cards : [];
  } catch (err: any) {
    const status = err?.response?.status;
    if (status === 404) return [];
    throw err;
  }
}
