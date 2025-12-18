import { useAuthenticated } from '@/hooks/useAuthenticated';
import { useQuery } from '@tanstack/react-query';
import { fetchProfileForSettingUser } from '../api/userApi.api';

export function useMyProfile(userID: number) {
  return useQuery({
    queryKey: ['myProfile', userID],
    queryFn: () => fetchProfileForSettingUser(userID),

    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export function useCurrentUser() {
  const { data, isLoading, isSuccess, isFetching } = useAuthenticated();
  const user = data?.userId
    ? {
        id: data.userId,
        username: data.username,
        email: data.email,
      }
    : data?.user || null;

  return {
    data: user,
    isLoading: isLoading || isFetching,
    isAuthenticated: isSuccess && !!user,
  };
}
