import { useQuery } from '@tanstack/react-query';
import { fetchProfileForSettingUser } from '../api/ProfileUser';

const SETTING_USER_ID = 7;

export function useMyProfile() {
  return useQuery({
    queryKey: ['myProfile', SETTING_USER_ID],
    queryFn: () => fetchProfileForSettingUser(SETTING_USER_ID),

    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });
}

export const useUserProfileDetails = useMyProfile;
