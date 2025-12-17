import { apiClient } from '@/lib/apiClient';
import type {
  WasteType,
  WasteLogRequest,
  WasteStats,
  DailyStats,
  DailyLogsResponse,
} from '@/features/waste-management/types';

export const fetchWasteTypes = async (): Promise<{
  wasteTypes: WasteType[];
}> => {
  const response = await apiClient.get('/waste-types');
  return response.data.data;
};

export const logWaste = async (data: WasteLogRequest) => {
  const response = await apiClient.post('/waste/log', data);
  return response.data.data;
};

export const fetchMonthlyStats = async (
  month?: number,
  year?: number
): Promise<{ stats: WasteStats }> => {
  const params = new URLSearchParams();
  if (month) params.append('month', month.toString());
  if (year) params.append('year', year.toString());

  const response = await apiClient.get(`/waste/stats?${params.toString()}`);
  return response.data.data;
};

export const fetchDailyStats = async (
  date?: string
): Promise<{ stats: DailyStats }> => {
  const params = date ? `?date=${date}` : '';
  const response = await apiClient.get(`/waste/stats/daily${params}`);
  return response.data.data;
};

export const fetchDailyLogs = async (): Promise<DailyLogsResponse> => {
  const response = await apiClient.get('/waste/logs/daily');
  return response.data.data;
};

export const deleteWasteLog = async (logId: number) => {
  const response = await apiClient.delete(`/waste/log/${logId}`);
  return response.data;
};

export const fetchWasteEvents = async () => {
  const res = await apiClient.get('/events/waste');
  return res.data.data.data;
};
