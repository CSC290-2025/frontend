import { useState, useEffect } from 'react';
import type { Item } from '../types/types';
import { getItems } from '../api/waste-management-api';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getItems().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  return { items, loading };
}
