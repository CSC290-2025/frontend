// --- src/hooks/useWasteTrends.ts ---
import { useState, useEffect } from 'react';
import type { WasteTrend } from '../types/types';
import { getWasteTrends } from '../api/waste-management-api';

/**
 * Custom hook to fetch and manage waste trend data.
 */
export function useWasteTrends() {
  const [trends, setTrends] = useState<WasteTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWasteTrends().then((data) => {
      setTrends(data);
      setLoading(false);
    });
  }, []);

  return { trends, loading };
}
