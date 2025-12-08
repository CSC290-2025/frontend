import { useMemo } from 'react';
import type { UserRole } from '@/types/reports';
import { useAuth } from '@/features/auth';

export function useUserRole(): { role: UserRole } {
  const { user } = useAuth();
  console.log('user', user);
  const role = useMemo<UserRole>(() => {
    if (user?.roles?.role_name.toLowerCase() === 'admin') {
      return 'admin';
    } else {
      return 'citizens';
    }
  }, [user]);
  return { role };
}
