import { apiClient } from '@/lib/apiClient';

// Get all events
export const fetchEvents = (params?: {
  page?: number;
  limit?: number;
  q?: string;
  organization_id?: number;
  from?: string;
  to?: string;
}) => {
  return apiClient.get('/events', { params });
};

// Get single event by ID
export const fetchEventById = (id: number) => {
  return apiClient.get(`/events/${id}`);
};

// Create new event
export const createEvent = (data: {
  host_user_id: number;
  title: string;
  description: undefined;
  total_seats: number | undefined;
  start_at: string;
  end_at: string;
  organization_id: number | null;
  address_id: number | null;
  event_tag_id: number | null;
}) => {
  return apiClient.post('/events', data);
};

// Update existing event
export const updateEvent = (
  id: number,
  data: Partial<{
    host_user_id: number;
    title: string;
    description?: string;
    image_url?: string;
    total_seats?: number;
    start_at?: string;
    end_at?: string;
    address_id?: number;
    organization_id?: number;
  }>
) => {
  return apiClient.put(`/events/${id}`, data);
};

// Delete event
export const deleteEvent = (id: number) => {
  return apiClient.delete(`/events/${id}`);
};

export const fetchEventsByDay = async (date: string) => {
  // ✅ send YYYY-MM-DD ONLY
  const formattedDate = date;

  const res = await apiClient.get('/events/by-day', {
    params: { date: formattedDate },
  });

  // ✅ ALWAYS return array
  return Array.isArray(res.data?.data) ? res.data.data : [];
};
