import { useMemo } from 'react';
import type { UserRole } from '@/types/reports';

/**
 * Temporary role resolver. Replace with real auth/user context when available.
 */
export function useUserRole(): { role: UserRole } {
  // TODO: integrate with authentication/user context
  const role = useMemo<UserRole>(() => 'admin', []);
  return { role };
}
