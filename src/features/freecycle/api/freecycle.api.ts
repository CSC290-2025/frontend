// Make for fetching Freecycle data from the Freecycle API

import { apiClient } from '@/lib/apiClient';

export const fetchItemsById = (id: number) => {
  apiClient.get(`/items/${id}`);
};
