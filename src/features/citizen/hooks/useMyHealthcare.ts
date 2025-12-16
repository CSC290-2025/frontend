import { useQuery } from '@tanstack/react-query';
import { fetchMyHealthcare } from '../api/healthcare.api';
import { useMyProfile } from './ProfileUser';

// ✅ ไม่ต้องใช้ fetchAuthMe
// ใช้ profile ที่มี userId อยู่แล้วแทน (เหมือนหน้า profile)
export function useMyHealthcare(userId?: number) {
  const profileQ = useMyProfile();
  const resolvedUserId = userId ?? profileQ.data?.userId;

  return useQuery({
    queryKey: ['myHealthcare', resolvedUserId],
    enabled: !!resolvedUserId,
    queryFn: async () => {
      if (!resolvedUserId) throw new Error('Missing userId');
      return fetchMyHealthcare(resolvedUserId);
    },
    staleTime: 60_000,
  });
}
