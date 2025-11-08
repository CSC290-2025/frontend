import { useState, useEffect } from 'react';
import { api } from '../api/waste-management-api';
import type { WasteData } from '../types/types';

export function useWasteData() {
  const [data, setData] = useState<WasteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getWasteData().then((wasteData) => {
      setData(wasteData);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
