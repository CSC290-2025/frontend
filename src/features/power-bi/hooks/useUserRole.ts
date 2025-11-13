import { useMemo } from 'react';

/**
 * Temporary role resolver. Replace with real auth/user context when available.
 */
export function useUserRole(): { role: string } {
  // TODO: integrate with authentication/user context
  const role = useMemo(() => 'admin', []);
  return { role };
}
