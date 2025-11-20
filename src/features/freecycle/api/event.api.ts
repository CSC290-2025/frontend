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

export const createVolunteerEvent = (data: {
  title: string;
  description: string;
  image_url: string;
  total_seats: number;
  start_at: string;
  end_at: string;
  created_by_user_id: number;
  address_id: number | null;
  registration_deadline: string | null;
}) => {
  return apiClient.post('/api/v1/volunteer/create', data);
};
