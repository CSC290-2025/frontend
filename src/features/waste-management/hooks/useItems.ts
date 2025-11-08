import { useState, useEffect } from 'react';
import { api } from '../api/waste-management-api';
import type { Item } from '../types/types';

export function useItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getItems().then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, []);

  return { items, loading };
}
