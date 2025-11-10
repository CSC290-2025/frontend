import { useState, useEffect } from 'react';
import type { WasteData } from '../types/types';
import { getWasteData } from '../api/waste-management-api';

export function useWasteData() {
  const [data, setData] = useState<WasteData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWasteData().then((wasteData) => {
      setData(wasteData);
      setLoading(false);
    });
  }, []);

  return { data, loading };
}
