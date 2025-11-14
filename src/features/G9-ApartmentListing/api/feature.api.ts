//this is just an example of how api folder should look like

import { apiClient } from '@/lib/apiClient';

export const fetchUserById = (id: number) => {
  apiClient.get(`/user/${id}`);
};
