import { apiClient } from '@/lib/apiClient';

export const createVolunteerEvent = (data: {
  title: string;
  description: string;
  start_at: string;
  end_at: string;
  total_seats: number;
  created_by_user_id: number;
  image_url?: string | null;
  department_id?: number;
  registration_deadline?: string | null;
  address_id: number;
}) => {
  return apiClient.post('/volunteer/create', data);
};
