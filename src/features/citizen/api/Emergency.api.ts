import { apiClient } from '@/lib/apiClient';

export type ApiSuccess<T> = {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
};

export type TrafficEmergencyStatus =
  | 'pending'
  | 'dispatched'
  | 'in_transit'
  | 'arrived'
  | 'completed'
  | 'cancelled'
  | string;

export type TrafficEmergency = {
  id: number;
  user_id: number;
  accident_location: string;
  destination_hospital: string;
  status: TrafficEmergencyStatus;
  ambulance_vehicle_id: number;
  created_at: string;
};

export type TrafficEmergencyStats = {
  total_emergencies: number;
  pending: number;
  dispatched: number;
  in_transit: number;
  arrived: number;
  completed: number;
  cancelled: number;
};

export async function fetchTrafficEmergencyStats() {
  const res = await apiClient.get<ApiSuccess<{ stats: TrafficEmergencyStats }>>(
    `/traffic-emergencies/stats`
  );
  return res.data;
}

export async function fetchTrafficEmergenciesByUser(userId: number) {
  const res = await apiClient.get<
    ApiSuccess<{ emergencies: TrafficEmergency[] }>
  >(`/traffic-emergencies/user/${userId}`);
  return res.data;
}

export async function fetchTrafficEmergencyById(id: number) {
  const res = await apiClient.get<ApiSuccess<TrafficEmergency>>(
    `/traffic-emergencies/${id}`
  );
  return res.data;
}

export function formatEmergencyStatus(status: string) {
  const s = (status ?? '').toLowerCase();
  if (s === 'pending') return 'Pending';
  if (s === 'dispatched') return 'Dispatched';
  if (s === 'in_transit') return 'In transit';
  if (s === 'arrived') return 'Arrived';
  if (s === 'completed') return 'Completed';
  if (s === 'cancelled') return 'Cancelled';
  return status;
}
