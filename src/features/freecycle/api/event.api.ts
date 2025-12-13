import { apiClient } from '@/lib/apiClient';

export const createEvent = (data: {
  host_user_id: number;
  title: string;
  description: string;
  total_seats: number;
  start_at: string;
  end_at: string;
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
  registration_deadline: string | null;
}) => {
  return apiClient.post('/api/v1/volunteer/create', data);
};
