import { useQuery } from '@tanstack/react-query';
import { fetchUserProfile, fetchUserProfileDetails } from '../api/ProfileUser';

export function useUserProfile(userId: number) {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: () => fetchUserProfile(userId),
  });
}

export function useUserProfileDetails(userId: number) {
  return useQuery({
    queryKey: ['userProfileDetails', userId],
    queryFn: () => fetchUserProfileDetails(userId),
  });
}
