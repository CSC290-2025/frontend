import { apiClient } from '@/lib/apiClient';

export const createEvent = (data: {
  host_user_id: number;
  title: string;
  description: string;
  total_seats: number;
  start_at: string;
  end_at: string;
  organization_id: number | null;
  address_id: number | null;
  event_tag_id: number | null;
}) => {
  return apiClient.post('/events', data);
};
