import { useQuery } from '@tanstack/react-query';
import { fetchProfileForSettingUser } from '../api/ProfileUser';

export function useMyProfile(userID: number) {
  return useQuery({
    queryKey: ['myProfile', userID],
    queryFn: () => fetchProfileForSettingUser(userID),

    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export const useUserProfileDetails = useMyProfile;
