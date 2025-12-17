import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/apiClient';
import { useGetAuthMe } from '@/api/generated/authentication';

type ApiSuccess<T> = { success: boolean; data: T; message?: string };

export type MetroCardApi = {
  card_number?: string | null;
  balance?: string | number | null;
  status?: string | null;
};

async function fetchMyMetroCards(): Promise<MetroCardApi[]> {
  const res =
    await apiClient.get<ApiSuccess<{ cards?: MetroCardApi[] }>>(
      '/metro-cards/me'
    );
  return res.data.data.cards ?? [];
}

export function useMyMetroCards() {
  const authMeQ = useGetAuthMe();
  const userId = authMeQ.data?.data?.userId;

  return useQuery({
    queryKey: ['myMetroCards', userId],
    enabled: !!userId,
    queryFn: fetchMyMetroCards,
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}
