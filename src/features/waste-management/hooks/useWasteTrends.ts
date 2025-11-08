import { useState, useEffect } from 'react';
import { api } from '../api/waste-management-api';
import type { WasteTrend } from '../types/types';

export function useWasteTrends() {
  const [trends, setTrends] = useState<WasteTrend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWasteTrends().then((data) => {
      setTrends(data);
      setLoading(false);
    });
  }, []);

  return { trends, loading };
}
