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
  description?: string;
  total_seats?: number;
  image_url?: string;

  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;

  event_tag_name?: string;

  organization?: {
    name: string;
    email: string;
    phone_number: string;
  };

  address?: {
    address_line?: string;
    province?: string;
    district?: string;
    subdistrict?: string;
    postal_code?: string;
  };
}) => {
  return apiClient.post('/events', data);
};
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
  const formattedDate = date;

  const res = await apiClient.get('/events/by-day', {
    params: { date: formattedDate },
  });

  return Array.isArray(res.data?.data) ? res.data.data : [];
};
export const fetchPastBookmarkedEvents = (params?: {
  page?: number;
  limit?: number;
  q?: string; // Query for searching
}) => {
  return apiClient.get('/events/bookmarked-history', { params });
};
