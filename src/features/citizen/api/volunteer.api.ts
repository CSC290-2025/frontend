import { apiClient } from '@/lib/apiClient';

export type VolunteerEvent = {
  id: number;
  title: string;
  description: string;
  image_url?: string | null;
  current_participants: number;
  total_seats: number;
  start_at: string;
  end_at: string;
  registration_deadline: string;

  created_at?: string;
  updated_at?: string;
  created_by_user_id?: number;
  department_id?: number;
  address_id?: number;
};

export type VolunteerListData = {
  events: VolunteerEvent[];
  total: number;
  page: number;
  totalPages: number;
};

export type ApiEnvelope<T> = {
  data: T;
  message?: string;
  timestamp?: string;
};

export async function fetchVolunteerList(params?: {
  page?: number;
  limit?: number;
  search?: string;
  department_id?: number;
}): Promise<VolunteerListData> {
  const res = await apiClient.get<ApiEnvelope<VolunteerListData>>('/getAll', {
    params,
  });
  return res.data.data; // ✅ สำคัญ: wrapper มี data ครอบ
}

export type ApiSuccess<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
};

export async function fetchVolunteerById(id: number): Promise<VolunteerEvent> {
  const res = await apiClient.get<ApiSuccess<VolunteerEvent>>(`/${id}`);
  return res.data.data;
}

export async function createVolunteer(
  payload: Partial<VolunteerEvent>
): Promise<VolunteerEvent> {
  const res = await apiClient.post<ApiSuccess<VolunteerEvent>>(
    '/create',
    payload
  );
  return res.data.data;
}

export async function updateVolunteer(
  id: number,
  payload: Partial<VolunteerEvent>
): Promise<VolunteerEvent> {
  const res = await apiClient.put<ApiSuccess<VolunteerEvent>>(
    `/${id}/update`,
    payload
  );
  return res.data.data;
}

export async function deleteVolunteer(id: number) {
  const res = await apiClient.delete<ApiSuccess<unknown>>(`/${id}`);
  return res.data;
}
